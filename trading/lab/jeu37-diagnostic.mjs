import {inspectOpeningHistory} from './jeu22-history.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {failedBreakoutSignals} from './jeu26-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {filterMarketStreams} from './jeu31-filters.mjs';
import {JEU29_PRODUCTS,JEU29_PROFILES} from './jeu29-policy.mjs';
import {simulateConfidencePortfolio} from './jeu37-engine.mjs';
import {confidenceGrade,desiredRisk,accountRiskTier,confidenceSizedTerms} from './jeu37-risk.mjs';
import {tradeStatistics} from './jeu34-diagnostic.mjs';
import {compareEntryRuns} from './jeu36-comparison.mjs';
import {JEU37_POLICY as P,JEU37_VARIANTS} from './jeu37-policy.mjs';
import {JEU34_MONTHS} from './jeu34-policy.mjs';
import {monthlyCalendar} from './jeu34-calendar.mjs';
import {personalTarget} from './jeu34-payout.mjs';
import {historyCalendar} from './jeu14-policy.mjs';
const cents=n=>Math.round(n*100)/100,ensure=(v,m)=>{if(!v)throw Error(m);},same=(a,b,m)=>ensure(JSON.stringify(a)===JSON.stringify(b),m);

function scoreStats(trades,contexts){
 return ['MNQ','MES'].flatMap(symbol=>['low','medium','full'].map(grade=>{
  const rows=trades.filter(t=>t.symbol===symbol&&(t.confidence??confidenceGrade(t,contexts.get(symbol)?.get(t.entryTime))).grade===grade);
  return {symbol,grade,...tradeStatistics(rows),averageRisk:rows.length?cents(rows.reduce((n,t)=>n+t.plannedRiskUSD,0)/rows.length):null,
   meanNetR:rows.length?Math.round(rows.reduce((n,t)=>n+t.netDollars/t.plannedRiskUSD,0)/rows.length*1000)/1000:null};
 }));
}
export function runConfidenceDiagnostic(bundle,mnq,prior){
 const markets=JEU29_PROFILES.map(profile=>{const product=JEU29_PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
 const contexts=new Map();
 for(const m of markets){
  const bars=m.data.groups.filter(g=>g.start>=P.warmupFrom).flatMap(g=>g.candles),old=m.data.groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles),current=combinedContexts(bars,m.product);
  for(const [t,c]of combinedContexts(old,m.product))if(c.day>='2026-08-01')current.set(t,c);contexts.set(m.symbol,current);
 }

 const views=[],runs=[],audit={controlReplays:0,newEngineParity:0,accountPrefixes:0,checkedTrades:0,passed:false};
 for(const month of JEU34_MONTHS){
  const period={start:month.start,end:month.end},expected=historyCalendar(period.start,period.end);
  ensure(expected.every(d=>markets.every(m=>m.data.eligible.some(x=>x.date===d.date))),'Incomplete data');
  const raw=markets.map(m=>{const groups=m.data.groups.filter(g=>g.start>=period.start&&g.start<period.end),signals=new Map();for(const g of groups)for(const [t,s]of (m.strategy==='failure'?failedBreakoutSignals:admissionSignals)(g.candles,m.product))signals.set(t,s);return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};});
  const streams=filterMarketStreams(raw,contexts,'combined').streams.map(s=>s.symbol===P.excluded?{...s,signals:new Map()}:s);
  for(const variant of JEU37_VARIANTS){
   const costs={};
   for(const [cost,factor]of [['normal',1],['stress',2]]){
    const run=simulateConfidencePortfolio(streams,contexts,period,factor,variant.id);
    const controls=prior.runs.filter(r=>r.month===month.id&&r.variant==='baseline'&&r.mode==='funded'&&r.factor===factor);ensure(controls.length===1,'Missing control');const old=controls[0].run;
    if(variant.control){same(run,old,'Archived control changed');audit.controlReplays++;}
    if(variant.id==='fixed100'&&!old.personalGoalAchieved){
     const originalFields=run.trades.map(({requestedRiskUSD,accountTier,confidence,...t})=>t);
     same(originalFields,old.trades,'Baseline engine trade parity failed');same(run.days,old.days,'Baseline engine cashflow parity failed');ensure(run.drawdown===old.drawdown,'Baseline drawdown changed');audit.newEngineParity++;
    }
    for(const d of run.days){
     const end=new Date(Date.parse(d.day+'T00:00Z')+86400000).toISOString().slice(0,10),prefixStreams=streams.map(s=>({...s,candles:s.candles.filter(b=>b.day<=d.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=d.day))}));
     const prefix=simulateConfidencePortfolio(prefixStreams,contexts,{start:period.start,end},factor,variant.id);
     same(prefix.trades,run.trades.filter(t=>t.day<=d.day),'Future trade leak');same(prefix.days,run.days.filter(t=>t.day<=d.day),'Future cashflow leak');audit.accountPrefixes++;
    }
    let auditTier=1;
    for(const t of run.trades){
     const product=JEU29_PRODUCTS.find(p=>p.symbol===t.symbol),sign=t.side==='Long'?1:-1;
     ensure(Number.isInteger(t.quantity)&&t.quantity>=1&&t.quantity<=20,'Invalid size');ensure(t.riskCapUSD<=variant.maxRisk&&t.plannedRiskUSD<=t.riskCapUSD+1e-8,'Risk cap exceeded');
     ensure(t.balanceBefore-t.plannedRiskUSD>=t.floorBefore+100-1e-8,'Floor reserve exceeded');ensure(t.balanceBefore-t.plannedRiskUSD>=t.dayStart-variant.dailyLoss-1e-8,'Daily budget exceeded');
     ensure(t.symbol!=='MYM'&&t.stop===t.initialStop&&t.breakEvenAt===null&&Math.abs(sign*(t.target-t.entry)-2*t.risk)<1e-7,'Signal, stop or target changed');
     if(t.symbol==='MGC')ensure(t.riskCapUSD<=100,'MGC risk changed');
     if(!variant.control){
      const grade=t.symbol==='MGC'?{grade:'preserved',score:null,checks:null,missingContext:null}:confidenceGrade(t,contexts.get(t.symbol)?.get(t.entryTime));
      same(t.confidence,grade,'Confidence differs from closed context');const requested=t.symbol==='MGC'?100:desiredRisk(t.symbol,grade,variant.id);
      auditTier=accountRiskTier(t.balanceBefore,t.floorBefore,auditTier);ensure(t.accountTier===auditTier&&t.requestedRiskUSD===requested&&t.riskCapUSD===cents(requested*auditTier),'Incorrect confidence allocation');
      const sized=confidenceSizedTerms(t,t.entry,t.entryTime,product,factor,t.riskCapUSD);ensure(!sized.blocked,'Executed inadmissible size');
      for(const [key,value]of Object.entries(sized.terms))ensure(t[key]===value,'Sizing mismatch '+key);
     }
     ensure(t.plannedRiskUSD===cents(t.riskDollars+t.costDollars),'Planned risk cashflow mismatch');
     ensure(cents(sign*(t.exit-t.entry)*product.multiplier*t.quantity-t.costDollars)===t.netDollars,'Cashflow mismatch');audit.checkedTrades++;
    }
    const calendar=monthlyCalendar(run,expected),last=run.days.at(-1);
    for(const day of calendar.daily){const ts=run.trades.filter(t=>t.day===day.day);day.averageRiskUSD=ts.length?cents(ts.reduce((n,t)=>n+t.plannedRiskUSD,0)/ts.length):null;day.markets=JEU29_PRODUCTS.map(p=>({symbol:p.symbol,trades:day.net===null?null:ts.filter(t=>t.symbol===p.symbol).length,net:day.net===null?null:cents(ts.filter(t=>t.symbol===p.symbol).reduce((n,t)=>n+t.netDollars,0))}));}
    const reference=['control','fixed100'].includes(variant.id)?old:runs.find(r=>r.month===month.id&&r.variant==='fixed100'&&r.factor===factor).run;
    const paired=variant.comparator?runs.find(r=>r.month===month.id&&r.variant===variant.comparator&&r.factor===factor).run:old;
    costs[cost]={...tradeStatistics(run.trades),status:run.status,terminalDay:run.terminalDay,personalGoalAchieved:run.personalGoalAchieved,goalDay:run.goalDay,profitGoalAchieved:run.profitGoalAchieved??false,profitGoalDay:run.profitGoalDay??null,
     receiptEUR:run.receiptEUR,withdrawnUSD:run.withdrawnUSD,balance:run.balance,floor:run.floor,headroom:cents(run.balance-run.floor),drawdown:run.drawdown,calendar,payout:last?.payout??null,daily:run.daily,denied:run.denied,
     contributions:JEU29_PRODUCTS.map(p=>({symbol:p.symbol,...tradeStatistics(run.trades.filter(t=>t.symbol===p.symbol))})),quality:scoreStats(run.trades,contexts),
     averageRiskUSD:run.trades.length?cents(run.trades.reduce((n,t)=>n+t.plannedRiskUSD,0)/run.trades.length):null,maximumRiskUSD:run.trades.length?Math.max(...run.trades.map(t=>t.plannedRiskUSD)):null,
     comparisonReference:['control','fixed100'].includes(variant.id)?'control':'fixed100',comparison:compareEntryRuns(reference,run),pairedComparison:compareEntryRuns(paired,run),executionAllowed:false};
    runs.push({month:month.id,variant:variant.id,mode:'funded',factor,period,run});
   }
   views.push({month:month.id,label:month.label,period,variant:variant.id,mode:'funded',resetAtStart:true,coverage:{expected:expected.length,scored:expected.length},costs});
  }
 }
 const assessments=JEU37_VARIANTS.filter(v=>!v.control).map(v=>{const cells=views.filter(x=>x.variant===v.id).flatMap(x=>Object.entries(x.costs).map(([cost,c])=>({month:x.month,cost,net:c.net,drawdown:c.drawdown,status:c.status,profitGoalAchieved:c.profitGoalAchieved,personalGoalAchieved:c.personalGoalAchieved})));return {variant:v.id,objectivePassed:cells.every(c=>c.profitGoalAchieved&&c.status!=='breached'&&c.drawdown<=1000),cells};});
 audit.passed=true;
 return {report:{schema:'jeu37-confidence-report-v1',policy:P,target:personalTarget(),variants:JEU37_VARIANTS,assessments,newConfigurations:5,newRiskPolicies:4,executionCount:36,independent:false,confirmed:false,selection:null,executionAllowed:false,views,audit},privateRuns:{schema:'jeu37-private-v1',runs}};
}
