import {inspectOpeningHistory} from './jeu22-history.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateConfidencePortfolio} from './jeu45-engine.mjs';
import {tradeStatistics} from './jeu34-diagnostic.mjs';
import {compareEntryRuns} from './jeu36-comparison.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {coverage40,calendar40,summarize40} from './jeu40-diagnostic.mjs';
import {JEU40_MONTHS,JEU40_MISSING} from './jeu40-policy.mjs';
import {contexts40,filtered40} from './jeu41-preparation.mjs';
import {review44} from './jeu44-diagnostic.mjs';
import {filterSessions45,session45} from './jeu45-sessions.mjs';
import {JEU45_POLICY as P,JEU45_VARIANTS} from './jeu45-policy.mjs';
const cents=n=>Math.round(n*100)/100,ensure=(x,m)=>{if(!x)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
export function statistics45(trades){
 const base=tradeStatistics(trades),gains=trades.reduce((n,t)=>n+Math.max(0,t.netDollars),0),losses=-trades.reduce((n,t)=>n+Math.min(0,t.netDollars),0);
 return {...base,meanNetUnrounded:base.trades?base.net/base.trades:null,profitFactor:losses?gains/losses:null,profitFactorUndefined:!losses,
  gross:cents(trades.reduce((n,t)=>n+t.netDollars+t.costDollars,0)),costs:cents(trades.reduce((n,t)=>n+t.costDollars,0)),
  meanResultR:trades.length?trades.reduce((n,t)=>n+t.resultR,0)/trades.length:null,
  meanHoldingMinutesLowerBound:trades.length?trades.reduce((n,t)=>n+(t.exitTime-t.entryTime)/60,0)/trades.length:null,
  timedExitDecisions:trades.filter(t=>t.timeExitAt!==undefined).length,timedExitFills:trades.filter(t=>t.reason==='Time exit 30m').length};
}
function groups45(trades,key){
 const keys=[...new Set(trades.map(t=>key(t)))].sort();
 return keys.map(group=>({group,...statistics45(trades.filter(t=>key(t)===group))}));
}
export function review45(cells,means){
 const prior=review44(cells),meanImprovement=['normal','stress'].every(cost=>Number.isFinite(means[cost]?.candidate)&&Number.isFinite(means[cost]?.reference)&&means[cost].candidate>means[cost].reference);
 const checks={...prior.checks,meanTradeImprovedBothCosts:meanImprovement},descriptiveGatePassed=Object.values(checks).every(Boolean);
 return {...prior,checks,means,descriptiveGatePassed,decision:descriptiveGatePassed?'research-only-candidate':'not-retained',selection:null};
}
function counts45(decisions){return {signals:decisions.length,blocked:decisions.filter(d=>!d.allowed).length,byCategory:groupsOfDecisions(decisions,'category'),byHour:groupsOfDecisions(decisions,'nyHour')};}
function groupsOfDecisions(decisions,key){return [...new Set(decisions.map(d=>d[key]))].sort().map(group=>({group,signals:decisions.filter(d=>d[key]===group).length,blocked:decisions.filter(d=>d[key]===group&&!d.allowed).length}));}
export function runStudy45(bundle,mnq,prior,onProgress=()=>{}){
 const markets=JEU29_PROFILES.map(profile=>{const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
 const coverage=JEU40_MONTHS.map(month=>({month:month.id,...coverage40(markets,month)}));
 for(let i=0;i<coverage.length;i++)ensure(coverage[i].expected===JEU40_MONTHS[i].expected&&coverage[i].available===JEU40_MONTHS[i].available,'Source coverage changed');
 same(coverage.flatMap(c=>c.missing),JEU40_MISSING,'Missing dates changed');ensure(prior.runs.length===16,'Expected sixteen archived controls');
 const views=[],runs=[],audit={controls:0,prefixes:0,filterPrefixes:0,contextPrefixes:0,checkedTrades:0,passed:false};
 for(const month of JEU40_MONTHS){
  const period={start:month.start,end:month.end},cov=coverage.find(c=>c.month===month.id),expected=historyCalendar(month.start,month.end),missing=new Set(cov.missing.map(d=>d.day)),available=expected.filter(d=>!missing.has(d.date));
  const contexts=contexts40(markets,month),original=filtered40(markets,contexts,month,available);
  for(const variant of JEU45_VARIANTS){
   const costs={},exitSymbol=variant.mechanism==='time-exit30'?variant.targetSymbol:null;
   for(const[cost,factor]of [['normal',1],['stress',2]]){
    const filtered=filterSessions45(original.streams,variant.id),run=simulateConfidencePortfolio(filtered.streams,contexts,period,factor,'fixed100',exitSymbol);
    const refs=prior.runs.filter(r=>r.month===month.id&&r.variant==='fixed100'&&r.factor===factor);ensure(refs.length===1,'Missing archived reference');const reference=refs[0].run;
    if(variant.id==='baseline'){same(run,reference,'Archived whole Game40 differs');audit.controls++;}
    for(const {date:day}of available){
     const prefixContexts=contexts40(markets,month,day),before=filtered40(markets,prefixContexts,month,available,day),prefix=filterSessions45(before.streams,variant.id),end=new Date(Date.parse(day+'T00:00Z')+86400000).toISOString().slice(0,10);
     for(const[symbol,cs]of prefixContexts)same([...cs],[...contexts.get(symbol)].filter(([,c])=>c.day<=day),'Future context leak');audit.contextPrefixes++;
     same(before.decisions,original.decisions.filter(d=>d.day<=day),'Existing filter changed on prefix');same(prefix.decisions,filtered.decisions.filter(d=>d.day<=day),'Session filter changed on prefix');audit.filterPrefixes++;
     const replay=simulateConfidencePortfolio(prefix.streams,prefixContexts,{start:period.start,end},factor,'fixed100',exitSymbol);
     same(replay.trades,run.trades.filter(t=>t.day<=day),'Future trade leak');same(replay.days,run.days.filter(d=>d.day<=day),'Future account leak');audit.prefixes++;
    }
    for(const t of run.trades){
     const p=JEU29_PRODUCTS.find(p=>p.symbol===t.symbol),sign=t.side==='Long'?1:-1;
     ensure(!missing.has(t.day)&&t.symbol!=='MYM'&&t.stop===t.initialStop&&t.breakEvenAt===null,'Date, market or stop changed');ensure(Math.abs(sign*(t.target-t.entry)-2*t.risk)<1e-7,'Target changed');
     ensure(Number.isInteger(t.quantity)&&t.quantity>=1&&t.quantity<=20&&t.plannedRiskUSD<=t.riskCapUSD+1e-8&&t.riskCapUSD<=100,'Risk or quantity changed');
     ensure(cents(sign*(t.exit-t.entry)*p.multiplier*t.quantity-t.costDollars)===t.netDollars,'Trade cashflow differs');
     ensure(filtered.decisions.some(d=>d.symbol===t.symbol&&d.time===t.entryTime&&d.side===t.side&&d.allowed),'Executed trade violates session rule');
     if(t.timeExitAt!==undefined){
      ensure(t.symbol===exitSymbol&&t.timeExitAt===t.entryTime+P.timeExitMinutes*60&&t.timeExitDecisionAt===t.timeExitAt&&t.exitTime===t.timeExitAt&&t.timeExitEstimatedNet<=0,'Invalid time-exit clock');
      const stream=filtered.streams.find(s=>s.symbol===t.symbol),b=stream.candles.find(b=>b.time===t.timeExitAt-300),out=stream.candles.find(b=>b.time===t.exitTime);
      ensure(cents(sign*(b.close-t.entry)*p.multiplier*t.quantity-t.costDollars)===t.timeExitEstimatedNet,'Invalid closed-bar time-exit net');
      if(t.reason==='Time exit 30m')ensure(t.exit===out.open,'Time exit must use next open');
     }
     audit.checkedTrades++;
    }
    const stats=statistics45(run.trades);ensure(stats.net===run.net,'Trade net differs');
    costs[cost]={...stats,status:run.status,terminalDay:run.terminalDay,balance:run.balance,floor:run.floor,drawdown:run.drawdown,withdrawnUSD:run.withdrawnUSD,receiptEUR:run.receiptEUR,profitGoalAchieved:run.profitGoalAchieved,personalGoalAchieved:run.personalGoalAchieved,profitGoalDay:run.profitGoalDay,goalDay:run.goalDay,calendar:calendar40(run,expected,cov.missing),daily:run.daily,denied:run.denied,
     contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...statistics45(run.trades.filter(t=>t.symbol===p.symbol))})),
     byEntryHour:groups45(run.trades,t=>t.symbol+'/'+session45(t.entryTime).nyHour),byEntrySession:groups45(run.trades,t=>t.symbol+'/'+session45(t.entryTime).category),
     comparison:compareEntryRuns(reference,run),marketComparisons:JEU29_PRODUCTS.map(p=>{const a=reference.trades.filter(t=>t.symbol===p.symbol),b=run.trades.filter(t=>t.symbol===p.symbol);return {symbol:p.symbol,...compareEntryRuns({trades:a,net:tradeStatistics(a).net},{trades:b,net:tradeStatistics(b).net})};}),unchangedWholeAccount:JSON.stringify(run)===JSON.stringify(reference),filter:counts45(filtered.decisions),coverageComplete:cov.complete,partialResult:!cov.complete,executionAllowed:false};
    runs.push({month:month.id,variant:variant.id,factor,period,coverage:cov,run,decisions:filtered.decisions});
    onProgress({completed:runs.length,total:P.executionCount,month:month.id,variant:variant.id,cost,audit:{...audit}});
   }
   views.push({month:month.id,label:month.label,variant:variant.id,mode:'funded',resetAtStart:true,period,coverage:cov,costs});
  }
 }
 ensure(runs.length===P.executionCount&&audit.controls===P.exactControls&&audit.prefixes===P.accountPrefixes&&audit.filterPrefixes===P.filterPrefixes&&audit.contextPrefixes===P.contextPrefixes,'Wrong replay/audit count');audit.passed=true;
 const summaries=Object.fromEntries(JEU45_VARIANTS.map(v=>[v.id,Object.fromEntries(['normal','stress'].map((cost,i)=>{const trades=runs.filter(r=>r.variant===v.id&&r.factor===i+1).flatMap(r=>r.run.trades);return [cost,{...summarize40(views.filter(x=>x.variant===v.id),cost),tradeStatistics:statistics45(trades),byEntryHour:groups45(trades,t=>t.symbol+'/'+session45(t.entryTime).nyHour),byEntrySession:groups45(trades,t=>t.symbol+'/'+session45(t.entryTime).category)}];}))]));
 const reviews=Object.fromEntries(JEU45_VARIANTS.filter(v=>v.targetSymbol).map(v=>{
  const cells=views.filter(x=>x.variant===v.id).flatMap(x=>['normal','stress'].map(cost=>({month:x.month,cost,net:x.costs[cost].net,delta:x.costs[cost].comparison.delta,drawdown:x.costs[cost].drawdown,referenceDrawdown:views.find(b=>b.month===x.month&&b.variant==='baseline').costs[cost].drawdown,status:x.costs[cost].status})));
  const means=Object.fromEntries(['normal','stress'].map(cost=>[cost,{candidate:summaries[v.id][cost].tradeStatistics.meanNetUnrounded,reference:summaries.baseline[cost].tradeStatistics.meanNetUnrounded}]));
  return [v.id,review45(cells,means)];
 }));
 return {report:{schema:'jeu45-sessions-time-exit-report-v1',policy:P,variants:JEU45_VARIANTS,newConfigurations:P.newConfigurations,executionCount:P.executionCount,coverage,views,summaries,audit,reviews,
  scope:{sessionProxy:'London cash clock, not Forex overlap, no LSE price feed',newEntriesOutsideReference:false,asianEuropeanOpenings:'not-observable-in-current-price-archive',calendar:'frozen-conventional-hours-plus-official-England-Wales-bank-holidays',priorRejectedFilters:'not-adopted',timeExitGoal:'higher-mean-net-per-trade-not-larger-position-size'},selection:null,independent:false,confirmed:false,executionAllowed:false},privateRuns:{schema:'jeu45-private-v1',runs}};
}
