import {inspectOpeningHistory} from './jeu22-history.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateSummerPortfolio} from './jeu32-engine.mjs';
import {simulateAccountPortfolio} from './jeu33-engine.mjs';
import {ACCOUNT_PROFILES,MARKET_PROFILES,JEU33_POLICY as P} from './jeu33-policy.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {calendarBreakdown,mondayOf} from './jeu30-calendar.mjs';
const cents=n=>Math.round(n*100)/100;
const ensure=(ok,m)=>{if(!ok)throw Error(m);};
const same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
const sum=trades=>cents(trades.reduce((v,t)=>v+t.netDollars,0));
export function accountCalendar(run,expected){
 const offset=run.initial-25000;
 const normalized={...run,days:run.days.map(d=>({...d,balance:d.balance-offset,floor:d.floor-offset}))};
 const result=calendarBreakdown(normalized,expected);
 for(const row of [...result.daily,...result.weeks]){if(row.balance!==null)row.balance=cents(row.balance+offset);if(row.floor!==null&&row.floor!==undefined)row.floor=cents(row.floor+offset);}
 return result;
}
export function runAccountDiagnostic(bundle,mnq,prior){
 const audit={archivedReplays:0,controlReplays:0,accountPrefixes:0,tradesChecked:0,passed:false};
 const markets=JEU29_PROFILES.map(profile=>{
  const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);
  return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};
 });
 const contexts=new Map();
 for(const m of markets){
  const bars=m.data.groups.filter(g=>g.start>=P.warmupFrom).flatMap(g=>g.candles);
  // Preserve Game32's August context exactly; never revise previously observed inputs.
  const old=m.data.groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles);
  const current=combinedContexts(bars,m.product);
  for(const [t,c]of combinedContexts(old,m.product))if(c.day>='2026-08-01')current.set(t,c);
  contexts.set(m.symbol,current);
 }
 const views=[],runs=[];
 for(const [id,start,end]of [['june','2026-06-01','2026-07-01'],['july','2026-07-01','2026-08-01'],['august','2026-08-01','2026-09-01'],['summer','2026-06-01','2026-09-01']]){
  const period={start,end},expected=historyCalendar(start,end);
  ensure(expected.every(d=>markets.every(m=>m.data.eligible.some(x=>x.date===d.date))),'Incomplete summer data');
  const raw=markets.map(m=>{
   const groups=m.data.groups.filter(g=>g.start>=start&&g.start<end),signals=new Map();
   for(const g of groups)for(const [t,s]of (m.strategy==='failure'?failedBreakoutSignals:admissionSignals)(g.candles,m.product))signals.set(t,s);
   return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};
  });
  const filtered=filterMarketStreams(raw,contexts,'combined'),streams=filtered.streams;
  for(const factor of [1,2]){
   const previous=prior.runs.filter(r=>r.viewId===id&&r.variant==='rr2-150'&&r.account&&r.factor===factor);
   ensure(previous.length===1,'Missing unique archived control');
   const old=simulateSummerPortfolio(streams,period,factor,true,'rr2-150');
   same(old,previous[0].run,'Archived Game32 differs');audit.archivedReplays++;
   const control=simulateAccountPortfolio(streams,period,factor,'control25-150');
   same(control.trades.map(({riskCapUSD,...t})=>t),old.trades,'New account engine changed control trades');
   same(control.days,old.days,'New account engine changed control days');
   same(control.decisions,old.decisions,'New account engine changed ordering');
   for(const key of ['net','balance','floor','status','terminalDay','drawdown','bestDay'])same(control[key],old[key],'Control '+key);
   audit.controlReplays++;
  }
  for(const profile of ACCOUNT_PROFILES.filter(p=>!p.control)){
   const costs={};
   for(const [cost,factor]of [['normal',1],['stress',2]]){
    const run=simulateAccountPortfolio(streams,period,factor,profile.id);
    for(const d of run.days){
     const prefixEnd=new Date(Date.parse(d.day+'T00:00:00Z')+86400000).toISOString().slice(0,10);
     const prefix=simulateAccountPortfolio(streams.map(s=>({...s,candles:s.candles.filter(b=>b.day<=d.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=d.day))})),{start,end:prefixEnd},factor,profile.id);
     same(prefix.trades,run.trades.filter(t=>t.day<=d.day),'Noncausal trade prefix');same(prefix.days,run.days.filter(t=>t.day<=d.day),'Noncausal account prefix');audit.accountPrefixes++;
    }
    for(const t of run.trades){
     const product=JEU29_PRODUCTS.find(p=>p.symbol===t.symbol),planned=t.riskDollars+t.costDollars;
     ensure(Number.isInteger(t.quantity)&&t.quantity>=1&&t.quantity<=20,'Invalid quantity');
     ensure(planned<=t.riskCapUSD+1e-8&&t.riskCapUSD<=100,'Invalid cap');
     ensure(t.balanceBefore-planned>=t.floorBefore+100-1e-8,'Invalid floor reserve');
     ensure(t.balanceBefore-planned>=t.dayStart-200-1e-8,'Invalid daily reserve');
     ensure(Math.abs(t.targetDistance/t.risk-2)<1e-8&&t.breakEvenAt===null,'Changed fixed 2R exit');
     ensure(cents((t.side==='Long'?1:-1)*(t.exit-t.entry)*product.multiplier*t.quantity-t.costDollars)===t.netDollars,'PnL reconciliation');audit.tradesChecked++;
    }
    ensure(run.days.every(d=>d.trades<=2),'Daily entries exceeded');
    const calendar=accountCalendar(run,expected);
    const completeWeeks=calendar.weeks.filter(w=>w.week>=start&&new Date(Date.parse(w.week+'T00:00:00Z')+4*86400000).toISOString().slice(0,10)<end&&w.simulatedSessions===w.expectedSessions);
    const capCounts={};for(const t of run.trades)capCounts[t.riskCapUSD]=(capCounts[t.riskCapUSD]||0)+1;
    costs[cost]={net:run.net,trades:run.trades.length,wins:run.trades.filter(t=>t.netDollars>0).length,status:run.status,terminalDay:run.terminalDay,balance:run.balance,floor:run.floor,headroom:cents(run.balance-run.floor),drawdown:run.drawdown,bestDay:run.bestDay,consistency:run.consistency,daily:run.daily,denied:run.denied,capCounts,calendar,
     weekly:{complete:completeWeeks.length,atLeast1000:completeWeeks.filter(w=>w.net>=1000).length,best:completeWeeks.length?Math.max(...completeWeeks.map(w=>w.net)):null},
     contributions:MARKET_PROFILES.map(p=>({symbol:p.symbol,trades:run.trades.filter(t=>t.symbol===p.symbol).length,net:sum(run.trades.filter(t=>t.symbol===p.symbol))})),
     fees:cents(run.trades.reduce((n,t)=>n+t.costDollars,0)),worstTrade:Math.min(0,...run.trades.map(t=>t.netDollars)),executionAllowed:false};
    runs.push({viewId:id,profileId:profile.id,period,factor,run});
   }
   views.push({id,period,profileId:profile.id,initial:profile.initial,resetAtStart:true,coverage:{expected:expected.length,scored:expected.length},costs});
  }
 }
 audit.passed=true;
 return {report:{schema:'jeu33-account-report-v1',policy:P,marketProfiles:MARKET_PROFILES,accountProfiles:ACCOUNT_PROFILES.filter(p=>!p.control),newConfigurations:4,executionCount:32,independent:false,confirmed:false,executionAllowed:false,selection:null,audit,views},privateRuns:{schema:'jeu33-private-v1',runs}};
}
