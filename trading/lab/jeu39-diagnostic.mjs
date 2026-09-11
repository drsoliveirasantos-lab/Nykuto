import {prepareInputs39} from './jeu39-inputs.mjs';
import {prepareForecastRequests39} from './jeu39-forecast.mjs';
import {filterStudyStreams39} from './jeu39-filters.mjs';
import {modelOpinions39} from './jeu39-model-opinions.mjs';
import {reviewResearchCandidate} from './research-self-review.mjs';
import {JEU39_POLICY,JEU39_VARIANTS} from './jeu39-policy.mjs';
import {simulateConfidencePortfolio} from './jeu37-engine.mjs';
import {tradeStatistics} from './jeu34-diagnostic.mjs';
import {compareEntryRuns} from './jeu36-comparison.mjs';
import {monthlyCalendar} from './jeu34-calendar.mjs';
import {JEU29_PRODUCTS} from './jeu29-policy.mjs';
import {sessionFor} from './session-comparison.mjs';
const ensure=(x,m)=>{if(!x)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
const round=n=>Math.round(n*100)/100;
function enrichedCalendar(run,expected){
 const c=monthlyCalendar(run,expected);
 c.daily=c.daily.map(d=>d.net===null?d:{...d,markets:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.day===d.day&&t.symbol===p.symbol))})),averageRiskUSD:d.trades?round(run.trades.filter(t=>t.day===d.day).reduce((n,t)=>n+t.plannedRiskUSD,0)/d.trades):null});return c;
}
function hourStats(run){return ['MNQ','MES','MGC','MYM'].flatMap(symbol=>['before-11','11-and-later'].map(hour=>({symbol,hour,...tradeStatistics(run.trades.filter(t=>t.symbol===symbol&&(sessionFor(t.entryTime).minute<660?'before-11':'11-and-later')===hour))})));}
export async function runStudy39(bundle,mnq,prior,pack,predictions){
 const input=prepareInputs39(bundle,mnq),{opinions,summary:model}=modelOpinions39(pack,predictions),mnqGroups=input.markets.find(m=>m.symbol==='MNQ').data.groups;
 const allSignals=new Map(input.months.flatMap(m=>[...m.baseline.find(s=>s.symbol==='MNQ').signals]));
 const regenerated=await prepareForecastRequests39(mnqGroups,allSignals);
 same(regenerated.requests,pack.requests,'Model requests differ from frozen data');same(regenerated.links,pack.links,'Model links differ');
 const views=[],runs=[],audit={controls:0,prefixes:0,filterPrefixes:0,modelInputPrefixes:0,passed:false};
 for(const {month,period,expected,baseline}of input.months){
  // Independently reconstruct all model inputs through each daily cutoff.
  for(const day of expected){const prefixSignals=new Map([...allSignals].filter(([,s])=>s.day<=day.date));
   const rebuilt=await prepareForecastRequests39(mnqGroups.filter(g=>g.start<=day.date),prefixSignals),links=pack.links.filter(l=>l.day<=day.date),ids=new Set(links.map(l=>l.requestId));
   same(rebuilt.links,links,'Future model link leak');same(rebuilt.requests,pack.requests.filter(r=>ids.has(r.id)),'Future model input leak');audit.modelInputPrefixes++;
  }
  for(const variant of JEU39_VARIANTS){
   const filtered=filterStudyStreams39(baseline,variant.id,opinions),costs={};
   for(const [cost,factor]of [['normal',1],['stress',2]]){
    const refs=prior.runs.filter(r=>r.month===month.id&&r.variant==='fixed100'&&r.factor===factor);ensure(refs.length===1,'Missing reference');const control=refs[0].run;
    const run=simulateConfidencePortfolio(filtered.streams,input.contexts,period,factor,'fixed100');
    if(variant.id==='baseline'){same(run,control,'Archived control differs');audit.controls++;}
    for(const day of run.days){
     const end=new Date(Date.parse(day.day+'T00:00Z')+86400000).toISOString().slice(0,10),prefixBase=baseline.map(s=>({...s,candles:s.candles.filter(b=>b.day<=day.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=day.day))})),prefixOpinions=new Map([...opinions].filter(([t])=>sessionFor(t).day<=day.day)),prefixContexts=new Map([...input.contexts].map(([symbol,c])=>[symbol,new Map([...c].filter(([,v])=>v.day<=day.day))]));
     const prefix=filterStudyStreams39(prefixBase,variant.id,prefixOpinions);
     same(prefix.decisions,filtered.decisions.filter(d=>d.day<=day.day),'Future filter decision leak');audit.filterPrefixes++;
     const replay=simulateConfidencePortfolio(prefix.streams,prefixContexts,{start:period.start,end},factor,'fixed100');
     same(replay.trades,run.trades.filter(t=>t.day<=day.day),'Future trade leak');same(replay.days,run.days.filter(d=>d.day<=day.day),'Future account leak');audit.prefixes++;
    }
    const reasons={};for(const d of filtered.decisions)reasons[d.reason]=(reasons[d.reason]??0)+1;
    costs[cost]={...tradeStatistics(run.trades),drawdown:run.drawdown,status:run.status,balance:run.balance,withdrawnUSD:run.withdrawnUSD,receiptEUR:run.receiptEUR,profitGoalAchieved:run.profitGoalAchieved,personalGoalAchieved:run.personalGoalAchieved,calendar:enrichedCalendar(run,expected),denied:run.denied,contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.symbol===p.symbol))})),comparison:compareEntryRuns(control,run),marketComparisons:JEU29_PRODUCTS.map(p=>{const trades=run.trades.filter(t=>t.symbol===p.symbol),old=control.trades.filter(t=>t.symbol===p.symbol);return {symbol:p.symbol,...compareEntryRuns({trades:old,net:round(old.reduce((n,t)=>n+t.netDollars,0))},{trades,net:round(trades.reduce((n,t)=>n+t.netDollars,0))})};}),hours:hourStats(run),filter:{candidates:filtered.decisions.length,rejected:filtered.decisions.filter(d=>!d.accepted).length,reasons},executionAllowed:false};
    runs.push({month:month.id,variant:variant.id,factor,period,run,decisions:filtered.decisions});
   }
   views.push({month:month.id,label:month.label,variant:variant.id,mode:'funded',resetAtStart:true,period,costs});
  }
 }
 const reviews=JEU39_VARIANTS.filter(v=>v.id!=='baseline').map(v=>{
  const cells=views.filter(x=>x.variant===v.id).flatMap(x=>Object.entries(x.costs).map(([cost,c])=>({month:x.month,cost,net:c.net,delta:c.comparison.delta,drawdown:c.drawdown,referenceDrawdown:views.find(y=>y.month===x.month&&y.variant==='baseline').costs[cost].drawdown,status:c.status,trades:c.trades})));
  return {variant:v.id,cells,...reviewResearchCandidate(cells,{qualityIssues:v.id==='mnq-kronos'?model.invalidForecasts+model.inferenceErrors:0})};
 });
 audit.passed=true;
 return {report:{schema:'jeu39-study-report-v1',policy:JEU39_POLICY,variants:JEU39_VARIANTS,newConfigurations:2,executionCount:18,views,reviews,model,audit,selection:null,independent:false,confirmed:false,executionAllowed:false},privateRuns:{schema:'jeu39-private-v1',runs}};
}
