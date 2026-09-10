import {inspectOpeningHistory} from './jeu22-history.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateExitPortfolio} from './jeu35-engine.mjs';
import {tradeStatistics} from './jeu34-diagnostic.mjs';
import {compareExecutions} from './jeu35-comparison.mjs';
import {JEU35_POLICY as P,JEU35_VARIANTS} from './jeu35-policy.mjs';
import {JEU34_MONTHS} from './jeu34-policy.mjs';
import {monthlyCalendar} from './jeu34-calendar.mjs';
import {personalTarget} from './jeu34-payout.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
const cents=n=>Math.round(n*100)/100,ensure=(v,m)=>{if(!v)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
export function runExitDiagnostic(bundle,mnq,prior){
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
  for(const variant of JEU35_VARIANTS){
   const streams=base.map(s=>s.symbol===P.excluded?{...s,signals:new Map()}:s);
   for(const mode of ['evaluation','funded']){
    const costs={};
    for(const [cost,factor]of [['normal',1],['stress',2]]){
     const run=simulateExitPortfolio(streams,period,factor,mode,variant.id);
     if(variant.control){
      const old=prior.runs.filter(r=>r.month===month.id&&r.variant==='without-mym'&&r.mode===mode&&r.factor===factor);ensure(old.length===1,'Missing control');
      same(run,old[0].run,'Complete control changed');audit.controlReplays++;
     }
     for(const d of run.days){
      const end=new Date(Date.parse(d.day+'T00:00Z')+86400000).toISOString().slice(0,10);
      const prefix=simulateExitPortfolio(streams.map(s=>({...s,candles:s.candles.filter(b=>b.day<=d.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=d.day))})),{start:period.start,end},factor,mode,variant.id);
      same(prefix.trades,run.trades.filter(t=>t.day<=d.day),'Future trade leak');same(prefix.days,run.days.filter(t=>t.day<=d.day),'Future cashflow leak');audit.accountPrefixes++;
     }
     for(const t of run.trades){
      const product=JEU29_PRODUCTS.find(p=>p.symbol===t.symbol);ensure(t.quantity>=1&&t.quantity<=20&&Number.isInteger(t.quantity),'Invalid quantity');
      ensure(t.riskDollars+t.costDollars<=t.riskCapUSD+1e-8&&t.riskCapUSD<=100,'Risk exceeded');ensure(t.balanceBefore-t.riskDollars-t.costDollars>=t.floorBefore+100-1e-8,'Floor reserve exceeded');
      ensure(cents((t.side==='Long'?1:-1)*(t.exit-t.entry)*product.multiplier*t.quantity-t.costDollars)===t.netDollars,'Trade cashflow mismatch');
      ensure(P.excluded!==t.symbol,'Excluded market traded');
      const sign=t.side==='Long'?1:-1,rr=variant.symbol===t.symbol?variant.targetR:2;
      ensure(Math.abs(sign*(t.target-t.entry)-rr*t.risk)<1e-7,'Target changed');ensure(t.stop===t.initialStop&&t.breakEvenAt===null,'Stop changed');audit.checkedTrades++;
     }
     const calendar=monthlyCalendar(run,expected),last=run.days.at(-1);
     costs[cost]={...tradeStatistics(run.trades),status:run.status,terminalDay:run.terminalDay,personalGoalAchieved:run.personalGoalAchieved,goalDay:run.goalDay,receiptEUR:run.receiptEUR,withdrawnUSD:run.withdrawnUSD,balance:run.balance,floor:run.floor,headroom:cents(run.balance-run.floor),drawdown:run.drawdown,calendar,payout:last?.payout??null,daily:run.daily,denied:run.denied,
      contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.symbol===p.symbol))})),
      meanDurationLowerMinutes:run.trades.length?cents(run.trades.reduce((n,t)=>n+(t.exitTime-t.entryTime)/60,0)/run.trades.length):null,
      comparison:compareExecutions(prior.runs.find(r=>r.month===month.id&&r.variant==='without-mym'&&r.mode===mode&&r.factor===factor).run,run,variant.symbol),executionAllowed:false};
     runs.push({month:month.id,variant:variant.id,mode,factor,period,run});
    }
    views.push({month:month.id,label:month.label,period,variant:variant.id,mode,resetAtStart:true,coverage:{expected:expected.length,scored:expected.length},costs});
   }
  }
 }
 const assessments=JEU35_VARIANTS.filter(v=>!v.control).map(v=>{const cells=views.filter(x=>x.variant===v.id).flatMap(x=>Object.entries(x.costs).map(([cost,c])=>{const b=views.find(y=>y.month===x.month&&y.mode===x.mode&&y.variant==='baseline').costs[cost];return {month:x.month,mode:x.mode,cost,netDelta:cents(c.net-b.net),drawdownDelta:cents(c.drawdown-b.drawdown)};}));return {variant:v.id,favorable:cells.every(c=>c.netDelta>=0&&c.drawdownDelta<=0)&&cells.some(c=>c.netDelta>0),cells};});
 audit.passed=true;
 return {report:{schema:'jeu35-exit-report-v1',policy:P,target:personalTarget(),variants:JEU35_VARIANTS,assessments,newConfigurations:4,newStrategyVariants:2,executionCount:36,independent:false,confirmed:false,selection:null,executionAllowed:false,views,audit},privateRuns:{schema:'jeu35-private-v1',runs}};
}
