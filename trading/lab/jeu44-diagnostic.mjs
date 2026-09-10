import {inspectOpeningHistory} from './jeu22-history.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateConfidencePortfolio} from './jeu40-engine.mjs';
import {tradeStatistics} from './jeu34-diagnostic.mjs';
import {compareEntryRuns} from './jeu36-comparison.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {coverage40,calendar40,summarize40} from './jeu40-diagnostic.mjs';
import {JEU40_MONTHS,JEU40_MISSING} from './jeu40-policy.mjs';
import {contexts40,filtered40} from './jeu41-preparation.mjs';
import {filterVideoStreams44} from './jeu44-filter.mjs';
import {allVideoContexts44} from './jeu44-context.mjs';
import {JEU44_POLICY,JEU44_VARIANTS} from './jeu44-policy.mjs';
const cents=n=>Math.round(n*100)/100,ensure=(x,m)=>{if(!x)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
function decisionCounts(decisions){return {signals:decisions.length,blocked:decisions.filter(d=>!d.allowed).length,reasons:Object.fromEntries([...new Set(decisions.map(d=>d.reason))].map(reason=>[reason,decisions.filter(d=>d.reason===reason).length])),contextReasons:Object.fromEntries([...new Set(decisions.filter(d=>d.detail).map(d=>d.detail.status))].map(reason=>[reason,decisions.filter(d=>d.detail?.status===reason).length])),byMarket:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,signals:decisions.filter(d=>d.symbol===p.symbol).length,blocked:decisions.filter(d=>d.symbol===p.symbol&&!d.allowed).length}))};}
export function review44(cells){
 ensure(cells.length===16&&new Set(cells.map(c=>c.month+'/'+c.cost)).size===16,'Sixteen comparison cells required');
 for(const m of JEU40_MONTHS)for(const cost of ['normal','stress'])ensure(cells.some(c=>c.month===m.id&&c.cost===cost),'Missing comparison cell');
 ensure(cells.every(c=>[c.delta,c.net,c.drawdown,c.referenceDrawdown].every(Number.isFinite)),'Invalid comparison');
 const checks={netNondecreasing:cells.every(c=>c.delta>=0),drawdownNonincreasing:cells.every(c=>c.drawdown<=c.referenceDrawdown),strictNetImprovement:cells.some(c=>c.delta>0),noAccountBreach:cells.every(c=>c.status!=='breached')},descriptiveGatePassed=Object.values(checks).every(Boolean);
 return {checks,descriptiveGatePassed,decision:descriptiveGatePassed?'research-only-candidate':'not-retained',failedCells:cells.filter(c=>c.delta<0||c.drawdown>c.referenceDrawdown||c.status==='breached'),selection:null,independent:false,confirmed:false,executionAllowed:false};
}
export function runStudy44(bundle,mnq,prior,onProgress=()=>{}){
 const markets=JEU29_PROFILES.map(profile=>{const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
 const coverage=JEU40_MONTHS.map(month=>({month:month.id,...coverage40(markets,month)}));
 for(let i=0;i<coverage.length;i++)ensure(coverage[i].expected===JEU40_MONTHS[i].expected&&coverage[i].available===JEU40_MONTHS[i].available,'Source coverage changed');
 same(coverage.flatMap(c=>c.missing),JEU40_MISSING,'Missing dates changed');
 ensure(prior.runs.length===16,'Expected sixteen archived controls');
 const views=[],runs=[],audit={controls:0,prefixes:0,filterPrefixes:0,contextPrefixes:0,videoContextPrefixes:0,checkedTrades:0,passed:false};
 for(const month of JEU40_MONTHS){
  const period={start:month.start,end:month.end},cov=coverage.find(c=>c.month===month.id),expected=historyCalendar(month.start,month.end),missing=new Set(cov.missing.map(d=>d.day)),available=expected.filter(d=>!missing.has(d.date));
  const contexts=contexts40(markets,month),original=filtered40(markets,contexts,month,available),videoContexts=allVideoContexts44(original.streams);
  for(const variant of JEU44_VARIANTS){const costs={};
   for(const[cost,factor]of [['normal',1],['stress',2]]){
    const filtered=filterVideoStreams44(original.streams,videoContexts,factor,variant.id),run=simulateConfidencePortfolio(filtered.streams,contexts,period,factor,'fixed100');
    const refs=prior.runs.filter(r=>r.month===month.id&&r.variant==='fixed100'&&r.factor===factor);ensure(refs.length===1,'Missing archived reference');const reference=refs[0].run;
    if(variant.id==='baseline'){same(run,reference,'Archived whole Game40 differs');audit.controls++;}
    for(const {date:day}of available){
     const prefixContexts=contexts40(markets,month,day),before=filtered40(markets,prefixContexts,month,available,day),prefixVideoContexts=allVideoContexts44(before.streams),prefix=filterVideoStreams44(before.streams,prefixVideoContexts,factor,variant.id),end=new Date(Date.parse(day+'T00:00Z')+86400000).toISOString().slice(0,10);
     for(const[symbol,cs]of prefixContexts)same([...cs],[...contexts.get(symbol)].filter(([,c])=>c.day<=day),'Future context leak');audit.contextPrefixes++;
     for(const[symbol,cs]of prefixVideoContexts)same([...cs],[...videoContexts.get(symbol)].filter(([,c])=>c.day<=day),'Future video context leak');audit.videoContextPrefixes++;
     same(before.decisions,original.decisions.filter(d=>d.day<=day),'Existing filter changed on prefix');same(prefix.decisions,filtered.decisions.filter(d=>d.day<=day),'New filter changed on prefix');audit.filterPrefixes++;
     const replay=simulateConfidencePortfolio(prefix.streams,prefixContexts,{start:period.start,end},factor,'fixed100');same(replay.trades,run.trades.filter(t=>t.day<=day),'Future trade leak');same(replay.days,run.days.filter(d=>d.day<=day),'Future account leak');audit.prefixes++;
    }
    for(const t of run.trades){
     const p=JEU29_PRODUCTS.find(p=>p.symbol===t.symbol),sign=t.side==='Long'?1:-1;
     ensure(!missing.has(t.day)&&t.symbol!=='MYM'&&t.stop===t.initialStop&&t.breakEvenAt===null,'Date, market or stop changed');ensure(Math.abs(sign*(t.target-t.entry)-2*t.risk)<1e-7,'Target changed');
     ensure(Number.isInteger(t.quantity)&&t.quantity>=1&&t.quantity<=20&&t.plannedRiskUSD<=t.riskCapUSD+1e-8&&t.riskCapUSD<=100,'Risk or quantity changed');
     ensure(cents(sign*(t.exit-t.entry)*p.multiplier*t.quantity-t.costDollars)===t.netDollars,'Trade cashflow differs');
     if(variant.targetSymbol===t.symbol)ensure(filtered.decisions.some(d=>d.symbol===t.symbol&&d.time===t.entryTime&&d.side===t.side&&d.allowed),'Executed trade violates video veto');audit.checkedTrades++;
    }
    const stats=tradeStatistics(run.trades);ensure(stats.net===run.net,'Trade net differs');
    costs[cost]={...stats,status:run.status,terminalDay:run.terminalDay,balance:run.balance,floor:run.floor,drawdown:run.drawdown,withdrawnUSD:run.withdrawnUSD,receiptEUR:run.receiptEUR,profitGoalAchieved:run.profitGoalAchieved,personalGoalAchieved:run.personalGoalAchieved,profitGoalDay:run.profitGoalDay,goalDay:run.goalDay,calendar:calendar40(run,expected,cov.missing),daily:run.daily,denied:run.denied,contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.symbol===p.symbol))})),comparison:compareEntryRuns(reference,run),marketComparisons:JEU29_PRODUCTS.map(p=>{const a=reference.trades.filter(t=>t.symbol===p.symbol),b=run.trades.filter(t=>t.symbol===p.symbol);return {symbol:p.symbol,...compareEntryRuns({trades:a,net:tradeStatistics(a).net},{trades:b,net:tradeStatistics(b).net})};}),unchangedWholeAccount:JSON.stringify(run)===JSON.stringify(reference),filter:decisionCounts(filtered.decisions),coverageComplete:cov.complete,partialResult:!cov.complete,executionAllowed:false};
    runs.push({month:month.id,variant:variant.id,factor,period,coverage:cov,run,decisions:filtered.decisions,videoContexts:Object.fromEntries([...videoContexts].map(([symbol,values])=>[symbol,[...values.values()]]))});
    onProgress({completed:runs.length,total:112,month:month.id,variant:variant.id,cost,audit:{...audit}});
   }
   views.push({month:month.id,label:month.label,variant:variant.id,mode:'funded',resetAtStart:true,period,coverage:cov,costs});
  }
 }
 ensure(runs.length===112&&audit.controls===16&&audit.prefixes===2296&&audit.filterPrefixes===2296&&audit.contextPrefixes===2296&&audit.videoContextPrefixes===2296,'Wrong replay/audit count');audit.passed=true;
 const cellsFor=id=>views.filter(v=>v.variant===id).flatMap(v=>['normal','stress'].map(cost=>({month:v.month,cost,net:v.costs[cost].net,delta:v.costs[cost].comparison.delta,drawdown:v.costs[cost].drawdown,referenceDrawdown:views.find(b=>b.month===v.month&&b.variant==='baseline').costs[cost].drawdown,status:v.costs[cost].status})));
 const summaries=Object.fromEntries(JEU44_VARIANTS.map(v=>[v.id,Object.fromEntries(['normal','stress'].map(cost=>[cost,summarize40(views.filter(x=>x.variant===v.id),cost)]))]));
 return {report:{schema:'jeu44-video-context-report-v1',policy:JEU44_POLICY,variants:JEU44_VARIANTS,newConfigurations:6,executionCount:112,coverage,views,summaries,audit,reviews:Object.fromEntries(JEU44_VARIANTS.filter(v=>v.targetSymbol).map(v=>[v.id,review44(cellsFor(v.id))])),sourceMethods:{videos:20,mechanisms:3,exactVideoStrategyReplications:0,adaptation:'Nykuto rules from primary-source principles',orderFlow:'unobservable-no-tick-or-book-data',news:'unobservable-no-point-in-time-archive',priorRejectedFilters:'not-adopted'},selection:null,independent:false,confirmed:false,executionAllowed:false},privateRuns:{schema:'jeu44-private-v1',runs}};
}
