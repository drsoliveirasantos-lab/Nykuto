import {inspectOpeningHistory} from './jeu22-history.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateMonthlyPortfolio} from './jeu34-engine.mjs';
import {JEU34_POLICY as P,JEU34_VARIANTS,JEU34_MONTHS} from './jeu34-policy.mjs';
import {monthlyCalendar} from './jeu34-calendar.mjs';
import {personalTarget} from './jeu34-payout.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
const cents=n=>Math.round(n*100)/100,ensure=(v,m)=>{if(!v)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
export function tradeStatistics(trades){
 const vals=trades.map(t=>t.netDollars),wins=vals.filter(n=>n>0),losses=vals.filter(n=>n<0),sum=xs=>cents(xs.reduce((a,b)=>a+b,0)),avg=xs=>xs.length?cents(sum(xs)/xs.length):null;
 return {trades:trades.length,net:sum(vals),wins:wins.length,losses:losses.length,mean:avg(vals),averageWin:avg(wins),averageLoss:avg(losses),best:vals.length?Math.max(...vals):null,worst:vals.length?Math.min(...vals):null,winRate:vals.length?wins.length/vals.length:null};
}
export function runMonthlyDiagnostic(bundle,mnq,prior){
 const markets=JEU29_PROFILES.map(profile=>{const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
 const contexts=new Map();
 for(const m of markets){
  const bars=m.data.groups.filter(g=>g.start>=P.warmupFrom).flatMap(g=>g.candles),old=m.data.groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles),current=combinedContexts(bars,m.product);
  for(const [t,c]of combinedContexts(old,m.product))if(c.day>='2026-08-01')current.set(t,c);contexts.set(m.symbol,current);
 }
 const views=[],runs=[],audit={controlReplays:0,accountPrefixes:0,checkedTrades:0,passed:false};
 for(const month of JEU34_MONTHS){
  const period={start:month.start,end:month.end},expected=historyCalendar(period.start,period.end);
  ensure(expected.every(d=>markets.every(m=>m.data.eligible.some(x=>x.date===d.date))),'Incomplete data');
  const raw=markets.map(m=>{const groups=m.data.groups.filter(g=>g.start>=period.start&&g.start<period.end),signals=new Map();for(const g of groups)for(const [t,s]of (m.strategy==='failure'?failedBreakoutSignals:admissionSignals)(g.candles,m.product))signals.set(t,s);return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};});
  const base=filterMarketStreams(raw,contexts,'combined').streams;
  for(const variant of JEU34_VARIANTS){
   const streams=base.map(s=>variant.excluded===s.symbol?{...s,signals:new Map()}:s);
   for(const mode of ['evaluation','funded']){
    const costs={};
    for(const [cost,factor]of [['normal',1],['stress',2]]){
     const run=simulateMonthlyPortfolio(streams,period,factor,mode);
     if(variant.id==='four-markets'&&mode==='evaluation'){
      const old=prior.runs.filter(r=>r.viewId===month.id&&r.profileId==='50k-reduced100'&&r.factor===factor);ensure(old.length===1,'Missing control');
      same(run.trades,old[0].run.trades,'Control trades changed');same(run.days.map(({day,net,trades,balance,floor})=>({day,net,trades,balance,floor})),old[0].run.days,'Control days changed');
      for(const key of ['net','balance','floor','status','terminalDay','drawdown'])same(run[key],old[0].run[key],'Control '+key);audit.controlReplays++;
     }
     for(const d of run.days){
      const end=new Date(Date.parse(d.day+'T00:00Z')+86400000).toISOString().slice(0,10);
      const prefix=simulateMonthlyPortfolio(streams.map(s=>({...s,candles:s.candles.filter(b=>b.day<=d.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=d.day))})),{start:period.start,end},factor,mode);
      same(prefix.trades,run.trades.filter(t=>t.day<=d.day),'Future trade leak');same(prefix.days,run.days.filter(t=>t.day<=d.day),'Future cashflow leak');audit.accountPrefixes++;
     }
     for(const t of run.trades){
      const product=JEU29_PRODUCTS.find(p=>p.symbol===t.symbol);ensure(t.quantity>=1&&t.quantity<=20&&Number.isInteger(t.quantity),'Invalid quantity');
      ensure(t.riskDollars+t.costDollars<=t.riskCapUSD+1e-8&&t.riskCapUSD<=100,'Risk exceeded');ensure(t.balanceBefore-t.riskDollars-t.costDollars>=t.floorBefore+100-1e-8,'Floor reserve exceeded');
      ensure(cents((t.side==='Long'?1:-1)*(t.exit-t.entry)*product.multiplier*t.quantity-t.costDollars)===t.netDollars,'Trade cashflow mismatch');
      ensure(variant.excluded!==t.symbol,'Excluded market traded');audit.checkedTrades++;
     }
     const calendar=monthlyCalendar(run,expected),last=run.days.at(-1);
     costs[cost]={...tradeStatistics(run.trades),status:run.status,terminalDay:run.terminalDay,personalGoalAchieved:run.personalGoalAchieved,goalDay:run.goalDay,receiptEUR:run.receiptEUR,withdrawnUSD:run.withdrawnUSD,balance:run.balance,floor:run.floor,headroom:cents(run.balance-run.floor),drawdown:run.drawdown,calendar,payout:last?.payout??null,daily:run.daily,denied:run.denied,
      contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.symbol===p.symbol))})),executionAllowed:false};
     runs.push({month:month.id,variant:variant.id,mode,factor,period,run});
    }
    views.push({month:month.id,label:month.label,period,variant:variant.id,mode,resetAtStart:true,coverage:{expected:expected.length,scored:expected.length},costs});
   }
  }
 }
 audit.passed=true;
 return {report:{schema:'jeu34-monthly-report-v1',policy:P,target:personalTarget(),variants:JEU34_VARIANTS,newConfigurations:3,newStrategyVariants:1,executionCount:24,independent:false,confirmed:false,selection:null,executionAllowed:false,views,audit},privateRuns:{schema:'jeu34-private-v1',runs}};
}
