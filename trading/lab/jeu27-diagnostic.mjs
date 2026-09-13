import { inspectOpeningHistory } from './jeu22-history.mjs';
import { admissionSignals } from './jeu23-signals.mjs';
import { combinedContexts, contextDecision } from './jeu24-context.mjs';
import { simulateAdmission } from './jeu23-engine.mjs';
import { JEU23_PRODUCTS, JEU23_SCENARIOS } from './jeu23-policy.mjs';
import { historyCalendar } from './jeu14-policy.mjs';
import { metrics } from './validation-engine.mjs';

export const VARIANTS = Object.freeze([
  { id: 'without-volume', required: ['trend','structure','momentum','pattern'] },
  { id: 'without-pattern', required: ['trend','structure','momentum','volume'] },
  { id: 'trend-only', required: ['trend'] }
].map(v => Object.freeze({...v,required:Object.freeze(v.required)})));
const periods=[{start:'2026-01-01',end:'2026-03-01'},{start:'2026-03-01',end:'2026-05-01'}];
const whole={start:periods[0].start,end:periods[1].end};
const cents=n=>Math.round(n*100)/100;
const ensure=(ok,message)=>{if(!ok)throw new Error(message);};
export function accepts(checks,variant){
  ensure(VARIANTS.some(v=>v===variant),'Unknown frozen ablation');
  return variant.required.every(k=>checks[k]===true);
}
export function summarize(run){
  const m=metrics(run.trades),wins=run.trades.filter(t=>t.netDollars>0),losses=run.trades.filter(t=>t.netDollars<0);
  return {status:run.status,trades:run.trades.length,net:run.net,drawdown:run.drawdown,
    netR:m.total,metrics:m,winRate:run.trades.length?wins.length/run.trades.length:null,
    meanWin:wins.length?cents(wins.reduce((n,t)=>n+t.netDollars,0)/wins.length):null,
    meanLoss:losses.length?cents(losses.reduce((n,t)=>n+t.netDollars,0)/losses.length):null,
    fees:cents(run.trades.reduce((n,t)=>n+t.costDollars,0)),daily:run.daily,denied:run.denied};
}
export function monthlyArchive(data){
  const runs=data.runs.filter(r=>!r.account&&r.period.start==='2026-05-01'&&r.period.end==='2026-09-01');
  ensure(runs.length===2&&new Set(runs.map(r=>r.factor)).size===2,'Two archived full-period cost paths required');
  return runs.map(({factor,run})=>({factor,months:['2026-05','2026-06','2026-07','2026-08'].map(month=>{
    const trades=run.trades.filter(t=>t.day.startsWith(month)),days=run.days.filter(d=>d.day.startsWith(month));
    ensure(days.length>0,'Missing archived month');
    const net=cents(trades.reduce((n,t)=>n+t.netDollars,0)),fees=cents(trades.reduce((n,t)=>n+t.costDollars,0));
    ensure(net===cents(days.reduce((n,d)=>n+d.net,0)),'Daily/trade mismatch');
    const reasons={};for(const t of trades)reasons[t.reason]=(reasons[t.reason]??0)+1;
    return {month,sessions:days.length,trades:trades.length,net,gross:cents(net+fees),fees,
      wins:trades.filter(t=>t.netDollars>0).length,positiveDays:days.filter(d=>d.net>0).length,
      negativeDays:days.filter(d=>d.net<0).length,noTradeDays:days.filter(d=>d.trades===0).length,
      reasons,meanWin:trades.some(t=>t.netDollars>0)?cents(trades.filter(t=>t.netDollars>0).reduce((n,t)=>n+t.netDollars,0)/trades.filter(t=>t.netDollars>0).length):null,
      meanLoss:trades.some(t=>t.netDollars<0)?cents(trades.filter(t=>t.netDollars<0).reduce((n,t)=>n+t.netDollars,0)/trades.filter(t=>t.netDollars<0).length):null};
  })}));
}
export function runDiagnostic(bundle,mnq,reference){
  ensure(reference.schema==='jeu23-private-v1','Wrong archived reference');
  const scenario=JEU23_SCENARIOS.find(s=>s.riskPerTrade===150),results=[],runs=[];
  const audit={baselineReproductions:0,contextPrefixes:0,signalPrefixes:0,accountPrefixes:0,trades:0};
  for(const product of JEU23_PRODUCTS){
    const history=inspectOpeningHistory(product.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===product.symbol),product);
    const groups=history.groups.filter(g=>g.start<whole.end),candles=groups.flatMap(g=>g.candles),signals=new Map();
    for(const group of groups){
      const s=admissionSignals(group.candles,product);for(const pair of s)signals.set(...pair);
      for(let cut=1;cut<=group.candles.length;cut++){
        const end=group.candles[cut-1].time+300;
        ensure(JSON.stringify([...admissionSignals(group.candles.slice(0,cut),product)])===JSON.stringify([...s].filter(([t])=>t<=end)),'Noncausal signal');audit.signalPrefixes++;
      }
    }
    const contexts=combinedContexts(candles,product),decisions=new Map([...signals].map(([t,s])=>[t,contextDecision(s,contexts.get(t))]));
    let cut=0;for(const group of groups){cut+=group.candles.length;const prefix=combinedContexts(candles.slice(0,cut),product);const end=group.candles.at(-1).time+300;
      ensure(JSON.stringify([...prefix])===JSON.stringify([...contexts].filter(([t])=>t<=end)),'Noncausal context');audit.contextPrefixes++;}
    const archived=factor=>{const values=reference.runs.filter(r=>r.symbol===product.symbol&&r.scenario===scenario.id&&r.factor===factor&&!r.account&&r.period.start===whole.start&&r.period.end===whole.end);ensure(values.length===1,'Ambiguous baseline');return values[0].run;};
    for(const factor of [1,2]){const baseline=simulateAdmission(candles,signals,scenario,product,whole,factor,false);
      ensure(JSON.stringify(baseline.trades)===JSON.stringify(archived(factor).trades),'Baseline trade mismatch');audit.baselineReproductions++;}
    for(const variant of VARIANTS){
      const filtered=new Map([...signals].filter(([t])=>accepts(decisions.get(t).checks,variant)));
      const run=(period,factor,account)=>{
        const value=simulateAdmission(candles,filtered,scenario,product,period,factor,account);
        for(const t of value.trades){ensure(t.signalClose===t.entryTime&&t.signalOpen<t.entryTime&&t.riskDollars+t.costDollars<=150+1e-8,'Invalid execution');audit.trades++;}
        if(account)for(const day of value.days){const end=new Date(Date.parse(day.day+'T00:00:00Z')+86400000).toISOString().slice(0,10);
          const prefix=simulateAdmission(candles.filter(b=>b.day<=day.day),filtered,scenario,product,{...period,end},factor,true);
          ensure(JSON.stringify(prefix.trades)===JSON.stringify(value.trades.filter(t=>t.day<=day.day)),'Noncausal account');audit.accountPrefixes++;}
        runs.push({symbol:product.symbol,scenario:variant.id,period,factor,account,run:value});return summarize(value);
      };
      const diagnostic={normal:run(whole,1,false),stress:run(whole,2,false)};
      const windows=periods.map(period=>{const expected=historyCalendar(period.start,period.end).length,scored=history.eligible.filter(d=>d.date>=period.start&&d.date<period.end).length,complete=expected===scored;
        return {...period,expected,scored,complete,normal:run(period,1,false),stress:run(period,2,false),account:complete?{normal:run(period,1,true),stress:run(period,2,true)}:null};});
      const m=diagnostic.normal.metrics;
      const checks={coverage:windows.every(w=>w.complete),sample:diagnostic.normal.trades>=40,
        windowSample:windows.every(w=>w.normal.trades>=12),positiveWindows:windows.every(w=>w.normal.net>0&&w.normal.metrics.total>0),
        profitFactor:m.pf!==null&&m.pf>=1.1,drawdown:m.dd<=8,
        stress:diagnostic.stress.net>0&&diagnostic.stress.metrics.total>0,
        accounts:windows.every(w=>w.account&&Object.values(w.account).every(a=>a.status!=='breached'))};
      results.push({id:product.symbol+'/'+variant.id,symbol:product.symbol,variant:variant.id,required:variant.required,
        signals:signals.size,acceptedSignals:filtered.size,diagnostic,windows,checks,researchPassed:Object.values(checks).every(Boolean),
        baseline:{normal:summarize(archived(1)),stress:summarize(archived(2))}});
    }
  }
  return {report:{schema:'jeu27-filter-diagnostic-v1',version:'2026-09-09',period:whole,configurationCount:12,
    independent:false,confirmed:false,paperEnabled:false,shadowEnabled:false,brokerEnabled:false,
    selection:null,holdout:{status:'not-opened-diagnostic-only'},results,audit},privateRuns:{schema:'jeu27-private-v1',runs}};
}
