import {inspectOpeningHistory} from './jeu22-history.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateConfidencePortfolio} from './jeu37-engine.mjs';
import {tradeStatistics} from './jeu34-diagnostic.mjs';
import {compareEntryRuns} from './jeu36-comparison.mjs';
import {JEU37_POLICY as BASE} from './jeu37-policy.mjs';
import {JEU34_MONTHS} from './jeu34-policy.mjs';
import {monthlyCalendar} from './jeu34-calendar.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
import {JEU38_POLICY,filterObstacleStreams38} from './jeu38-obstacles.mjs';
const ensure=(x,m)=>{if(!x)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);
export function runObstacleDiagnostic38(bundle,mnq,prior){
 const markets=JEU29_PROFILES.map(profile=>{const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
 const contexts=new Map();
 for(const m of markets){
  const bars=m.data.groups.filter(g=>g.start>=BASE.warmupFrom).flatMap(g=>g.candles),old=m.data.groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles),current=combinedContexts(bars,m.product);
  // Preserve the exact historical warmup path for all six baseline controls.
  for(const [t,c]of combinedContexts(old,m.product))if(c.day>='2026-08-01')current.set(t,c);contexts.set(m.symbol,current);
 }
 const views=[],runs=[],audit={controls:0,prefixes:0,filterPrefixes:0,passed:false};
 for(const month of JEU34_MONTHS){
  const period={start:month.start,end:month.end},expected=historyCalendar(period.start,period.end);
  ensure(expected.every(d=>markets.every(m=>m.data.eligible.some(x=>x.date===d.date))),'Incomplete data');
  const raw=markets.map(m=>{const groups=m.data.groups.filter(g=>g.start>=period.start&&g.start<period.end),signals=new Map();for(const g of groups)for(const [t,s]of(m.strategy==='failure'?failedBreakoutSignals:admissionSignals)(g.candles,m.product))signals.set(t,s);return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};});
  const baseline=filterMarketStreams(raw,contexts,'combined').streams.map(s=>s.symbol==='MYM'?{...s,signals:new Map()}:s),candidate=filterObstacleStreams38(baseline,contexts);
  for(const variant of ['baseline','mnq-obstacle']){
   const streams=variant==='baseline'?baseline:candidate.streams,costs={};
   for(const [cost,factor]of [['normal',1],['stress',2]]){
    const controls=prior.runs.filter(r=>r.month===month.id&&r.variant==='fixed100'&&r.factor===factor);ensure(controls.length===1,'Missing reference');const control=controls[0].run;
    const run=simulateConfidencePortfolio(streams,contexts,period,factor,'fixed100');
    if(variant==='baseline'){same(run,control,'Archived reference differs');audit.controls++;}
    for(const day of run.days){
     const end=new Date(Date.parse(day.day+'T00:00Z')+86400000).toISOString().slice(0,10),prefixBase=baseline.map(s=>({...s,candles:s.candles.filter(b=>b.day<=day.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=day.day))}));
     const prefixContexts=new Map([...contexts].map(([symbol,cs])=>[symbol,new Map([...cs].filter(([,c])=>c.day<=day.day))]));
     const prefixFilter=filterObstacleStreams38(prefixBase,prefixContexts);
     same(prefixFilter.decisions,candidate.decisions.filter(d=>d.day<=day.day),'Future filter leak');audit.filterPrefixes++;
     const prefix=variant==='baseline'?prefixBase:prefixFilter.streams;
     const replay=simulateConfidencePortfolio(prefix,contexts,{start:period.start,end},factor,'fixed100');same(replay.trades,run.trades.filter(t=>t.day<=day.day),'Future trade leak');same(replay.days,run.days.filter(d=>d.day<=day.day),'Future account leak');audit.prefixes++;
    }
    const checks=candidate.decisions,counts={};for(const d of checks)counts[d.reason]=(counts[d.reason]??0)+1;
    costs[cost]={...tradeStatistics(run.trades),drawdown:run.drawdown,status:run.status,balance:run.balance,withdrawnUSD:run.withdrawnUSD,receiptEUR:run.receiptEUR,profitGoalAchieved:run.profitGoalAchieved,personalGoalAchieved:run.personalGoalAchieved,
     calendar:monthlyCalendar(run,expected),denied:run.denied,contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.symbol===p.symbol))})),comparison:compareEntryRuns(control,run),
     filter:variant==='baseline'?null:{candidates:checks.length,rejected:checks.filter(d=>!d.accepted).length,reasons:counts},executionAllowed:false};
    runs.push({month:month.id,variant,factor,period,run,decisions:variant==='baseline'?[]:candidate.decisions});
   }
   views.push({month:month.id,label:month.label,variant,period,costs});
  }
 }
 const comparisons=views.filter(v=>v.variant==='mnq-obstacle').flatMap(v=>Object.entries(v.costs).map(([cost,c])=>({month:v.month,cost,net:c.net,delta:c.comparison.delta,drawdown:c.drawdown,referenceDrawdown:views.find(b=>b.month===v.month&&b.variant==='baseline').costs[cost].drawdown,status:c.status,trades:c.trades})));
 const descriptiveGatePassed=comparisons.every(c=>c.delta>=0&&c.drawdown<=c.referenceDrawdown&&c.status!=='breached')&&comparisons.some(c=>c.delta>0);
 audit.passed=true;
 return {report:{schema:'jeu38-obstacle-report-v1',policy:JEU38_POLICY,newConfigurations:1,executionCount:12,views,comparisons,descriptiveGatePassed,audit,independent:false,confirmed:false,selection:null,executionAllowed:false},privateRuns:{schema:'jeu38-private-v1',runs}};
}
