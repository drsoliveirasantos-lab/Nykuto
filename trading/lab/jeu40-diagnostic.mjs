import {inspectOpeningHistory} from './jeu22-history.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateConfidencePortfolio} from './jeu40-engine.mjs';
import {tradeStatistics} from './jeu34-diagnostic.mjs';
import {monthlyCalendar} from './jeu34-calendar.mjs';
import {mondayOf} from './jeu30-calendar.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {JEU40_POLICY,JEU40_MONTHS,JEU40_VARIANTS,JEU40_MISSING} from './jeu40-policy.mjs';
const round=n=>Math.round(n*100)/100,ensure=(x,m)=>{if(!x)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
export function coverage40(markets,month){
 const expected=historyCalendar(month.start,month.end),missing=expected.flatMap(d=>{
  const symbols=JEU29_PROFILES.map(p=>p.symbol).filter(symbol=>!markets.find(m=>m.symbol===symbol)?.data.eligible.some(x=>x.date===d.date));
  return symbols.length?[{day:d.date,symbols}]:[];
 });
 return {expected:expected.length,available:expected.length-missing.length,scored:expected.length-missing.length,complete:!missing.length,missing};
}
function contexts40(markets,month,through='2026-08-31'){
 const contexts=new Map(),summer=month.start>='2026-06-01';
 for(const m of markets){
  const groups=m.data.groups.filter(g=>g.start<=through),bars=groups.filter(g=>g.start>=(summer?'2026-05-01':'2026-01-01')).flatMap(g=>g.candles),current=combinedContexts(bars,m.product);
  if(summer){const old=groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles);for(const[t,c]of combinedContexts(old,m.product))if(c.day>='2026-08-01')current.set(t,c);}
  contexts.set(m.symbol,current);
 }
 return contexts;
}
function filtered40(markets,contexts,month,available,through='2026-08-31'){
 const dates=new Set(available.filter(d=>d.date<=through).map(d=>d.date));
 const raw=markets.map(m=>{const groups=m.data.groups.filter(g=>g.start>=month.start&&g.start<month.end&&dates.has(g.start)),signals=new Map();
  for(const g of groups)for(const[t,s]of(m.strategy==='failure'?failedBreakoutSignals:admissionSignals)(g.candles,m.product))signals.set(t,s);
  return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};
 });
 const filtered=filterMarketStreams(raw,contexts,'combined');
 return {...filtered,streams:filtered.streams.map(s=>s.symbol==='MYM'?{...s,signals:new Map()}:s)};
}
export function calendar40(run,expected,missing){
 const missingByDay=new Map(missing.map(d=>[d.day,d])),available=expected.filter(d=>!missingByDay.has(d.date));
 const core=monthlyCalendar(run,available),known=new Map(core.daily.map(d=>[d.day,d]));
 const daily=expected.map(({date:day})=>{
  if(missingByDay.has(day))return {day,week:mondayOf(day),state:'missing-data',missingMarkets:missingByDay.get(day).symbols,net:null,trades:null,cumulative:null,balance:null,floor:null,receiptEUR:null,payoutGrossUSD:null,maxReceiptEUR:null,averageRiskUSD:null,markets:null};
  const d=known.get(day);ensure(d,'Unexplained calendar omission');
  if(d.net===null)return d;
  const trades=run.trades.filter(t=>t.day===day);
  return {...d,markets:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(trades.filter(t=>t.symbol===p.symbol))})),averageRiskUSD:trades.length?round(trades.reduce((n,t)=>n+t.plannedRiskUSD,0)/trades.length):null};
 });
 const weeks=[...new Set(daily.map(d=>d.week))].map((week,i)=>{
  const all=daily.filter(d=>d.week===week),rows=all.filter(d=>d.net!==null),last=rows.at(-1),friday=new Date(Date.parse(week+'T00:00Z')+4*86400000).toISOString().slice(0,10);
  return {number:i+1,week,start:all[0].day,end:all.at(-1).day,partialMonth:week<expected[0].date||friday>expected.at(-1).date,complete:all.every(d=>d.net!==null),missing:all.filter(d=>d.state==='missing-data').length,observed:rows.length,expected:all.length,trades:rows.reduce((n,d)=>n+d.trades,0),net:rows.length?round(rows.reduce((n,d)=>n+d.net,0)):null,cumulative:last?.cumulative??null,receiptEUR:rows.length?round(rows.reduce((n,d)=>n+d.receiptEUR,0)):null,maxReceiptEUR:last?.maxReceiptEUR??null,qualifyingDays:last?.qualifyingDays??null};
 });
 ensure(round(daily.filter(d=>d.net!==null).reduce((n,d)=>n+d.net,0))===run.net,'Observed daily net differs');
 return {daily,weeks,complete:missing.length===0,missingSessions:missing.length};
}
export function summarize40(views,cost){
 ensure(['normal','stress'].includes(cost)&&views.length===8&&new Set(views.map(v=>v.month)).size===8,'Eight unique monthly views required');
 const rows=views.map(v=>v.costs[cost]);ensure(rows.every(r=>r&&Number.isFinite(r.net)&&Number.isInteger(r.trades)&&r.trades>=0&&Number.isInteger(r.wins)&&r.wins>=0&&r.wins<=r.trades&&Number.isFinite(r.drawdown)),'Invalid monthly aggregate');
 const nets=rows.map(r=>r.net).sort((a,b)=>a-b),sum=key=>round(rows.reduce((n,r)=>n+r[key],0)),trades=sum('trades'),wins=sum('wins'),totalObserved=sum('net'),incompleteMonths=views.filter(v=>!v.coverage.complete).length;
 return {cost,months:8,completeMonths:8-incompleteMonths,incompleteMonths,expectedSessions:views.reduce((n,v)=>n+v.coverage.expected,0),availableSessions:views.reduce((n,v)=>n+v.coverage.available,0),observedSessions:rows.reduce((n,r)=>n+r.calendar.daily.filter(d=>d.net!==null).length,0),totalObserved,cumulativeResetSum:totalObserved,meanObservedMonthly:round(totalObserved/8),medianObservedMonthly:round((nets[3]+nets[4])/2),worstObservedMonth:Math.min(...nets),negativeMonths:nets.filter(n=>n<0).length,trades,wins,losses:sum('losses'),weightedMeanTrade:trades?round(totalObserved/trades):null,weightedWinRate:trades?wins/trades:null,maxMonthlyDrawdown:Math.max(...rows.map(r=>r.drawdown)),fullEightMonthNet:incompleteMonths?null:totalObserved,fullEightMonthMean:incompleteMonths?null:round(totalObserved/8),withdrawnUSD:sum('withdrawnUSD'),receiptEUR:sum('receiptEUR'),personalGoals:rows.filter(r=>r.personalGoalAchieved).length,profitGoals:rows.filter(r=>r.profitGoalAchieved).length,continuousAccount:false,continuousDrawdown:null,independent:false,executionAllowed:false};
}
export function runStudy40(bundle,mnq,prior){
 const markets=JEU29_PROFILES.map(profile=>{const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
 // Audit every month's availability before the first performance calculation.
 const coverage=JEU40_MONTHS.map(month=>({month:month.id,...coverage40(markets,month)}));
 for(let i=0;i<coverage.length;i++){const c=coverage[i],m=JEU40_MONTHS[i];ensure(c.expected===m.expected&&c.available===m.available,'Frozen monthly coverage differs');}
 same(coverage.flatMap(c=>c.missing),JEU40_MISSING,'Frozen missing sessions differ');
 ensure(coverage.reduce((n,c)=>n+c.expected,0)===166&&coverage.reduce((n,c)=>n+c.available,0)===164,'Unexpected total coverage');
 const views=[],runs=[],audit={controls:0,prefixes:0,filterPrefixes:0,contextPrefixes:0,checkedTrades:0,passed:false};
 for(const month of JEU40_MONTHS){
  const cov=coverage.find(c=>c.month===month.id),period={start:month.start,end:month.end},expected=historyCalendar(month.start,month.end),missingDays=new Set(cov.missing.map(d=>d.day)),available=expected.filter(d=>!missingDays.has(d.date));
  const contexts=contexts40(markets,month),filtered=filtered40(markets,contexts,month,available),costs={};
  for(const[cost,factor]of[['normal',1],['stress',2]]){
   const run=simulateConfidencePortfolio(filtered.streams,contexts,period,factor,'fixed100');
   if(month.start>='2026-06-01'){const refs=prior.runs.filter(r=>r.month===month.id&&r.variant==='fixed100'&&r.factor===factor);ensure(refs.length===1,'Missing exact reference');same(run,refs[0].run,'Archived whole reference differs');audit.controls++;}
   for(const {date:day}of available){
    const d={day};
    const prefixContexts=contexts40(markets,month,d.day),prefix=filtered40(markets,prefixContexts,month,available,d.day),end=new Date(Date.parse(d.day+'T00:00Z')+86400000).toISOString().slice(0,10);
    for(const[symbol,cs]of prefixContexts)same([...cs],[...contexts.get(symbol)].filter(([,c])=>c.day<=d.day),'Future context leak');audit.contextPrefixes++;
    same(prefix.decisions,filtered.decisions.filter(x=>x.day<=d.day),'Future filter decision leak');audit.filterPrefixes++;
    const replay=simulateConfidencePortfolio(prefix.streams,prefixContexts,{start:period.start,end},factor,'fixed100');same(replay.trades,run.trades.filter(t=>t.day<=d.day),'Future trade leak');same(replay.days,run.days.filter(x=>x.day<=d.day),'Future account leak');audit.prefixes++;
   }
   for(const t of run.trades){const p=JEU29_PRODUCTS.find(p=>p.symbol===t.symbol);ensure(!missingDays.has(t.day)&&t.symbol!=='MYM','Unavailable session or excluded market traded');ensure(Number.isInteger(t.quantity)&&t.quantity>=1&&t.quantity<=20&&t.plannedRiskUSD<=t.riskCapUSD+1e-8&&t.riskCapUSD<=100,'Risk or quantity differs');ensure(round((t.side==='Long'?1:-1)*(t.exit-t.entry)*p.multiplier*t.quantity-t.costDollars)===t.netDollars,'Trade arithmetic differs');audit.checkedTrades++;}
   const stats=tradeStatistics(run.trades);ensure(stats.net===run.net,'Net differs from trades');
   costs[cost]={...stats,status:run.status,terminalDay:run.terminalDay,balance:run.balance,floor:run.floor,drawdown:run.drawdown,withdrawnUSD:run.withdrawnUSD,receiptEUR:run.receiptEUR,profitGoalAchieved:run.profitGoalAchieved,personalGoalAchieved:run.personalGoalAchieved,profitGoalDay:run.profitGoalDay,goalDay:run.goalDay,calendar:calendar40(run,expected,cov.missing),daily:run.daily,denied:run.denied,contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.symbol===p.symbol))})),coverageComplete:cov.complete,partialResult:!cov.complete,executionAllowed:false};
   ensure(round(costs[cost].contributions.reduce((n,c)=>n+c.net,0))===run.net,'Market contributions differ');
   runs.push({month:month.id,variant:'fixed100',factor,period,coverage:cov,run,decisions:filtered.decisions});
  }
  views.push({month:month.id,label:month.label,variant:'fixed100',mode:'funded',resetAtStart:true,period,coverage:cov,costs});
 }
 ensure(runs.length===16&&audit.controls===6&&audit.prefixes===328&&audit.filterPrefixes===328&&audit.contextPrefixes===328,'Wrong replay or audit count');audit.passed=true;
 const summaries=Object.fromEntries(['normal','stress'].map(cost=>[cost,summarize40(views,cost)]));
 return {report:{schema:'jeu40-eight-month-report-v1',policy:JEU40_POLICY,variants:JEU40_VARIANTS,newConfigurations:1,newStrategyVariants:0,executionCount:16,coverage,views,summaries,audit,selection:null,independent:false,confirmed:false,executionAllowed:false},privateRuns:{schema:'jeu40-private-v1',runs}};
}
