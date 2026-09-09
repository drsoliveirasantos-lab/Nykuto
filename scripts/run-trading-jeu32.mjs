import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {JEU32_POLICY as P,JEU32_VARIANTS as VARIANTS,JEU29_PRODUCTS as PRODUCTS,JEU29_PROFILES as PROFILES} from '../trading/lab/jeu32-policy.mjs';
import {inspectOpeningHistory} from '../trading/lab/jeu22-history.mjs';
import {historyCalendar} from '../trading/lab/jeu14-policy.mjs';
import {admissionSignals} from '../trading/lab/jeu23-signals.mjs';
import {failedBreakoutSignals} from '../trading/lab/jeu26-signals.mjs';
import {combinedContexts} from '../trading/lab/jeu24-context.mjs';
import {filterMarketStreams,compareFilteredRuns} from '../trading/lab/jeu31-filters.mjs';
import {alignmentContexts,alignmentDecision} from '../trading/lab/jeu32-alignment.mjs';
import {simulateSummerPortfolio} from '../trading/lab/jeu32-engine.mjs';
import {statistics,round} from '../trading/lab/market-diagnostics.mjs';
import {calendarBreakdown} from '../trading/lab/jeu30-calendar.mjs';
import {marketStudy,weeklyObjective} from '../trading/lab/jeu32-study.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),[sourceDir,priorDir,outDir,...extra]=process.argv.slice(2);
assert.ok(!extra.length&&[sourceDir,priorDir,outDir].every(p=>p&&relative(root,resolve(p)).startsWith('../')),'Three private paths required');
const hash=b=>createHash('sha256').update(b).digest('hex'),read=p=>readFile(resolve(root,p)),json=async p=>JSON.parse(await read(p));
const freezeRaw=await read('trading/lab/jeu32-freeze.json'),freeze=JSON.parse(freezeRaw);
for(const [path,sha]of Object.entries(freeze.files))assert.equal(hash(await read(path)),sha,path);
const prePerformanceCommit=execFileSync('git',['log','-1','--format=%H','--','trading/lab/jeu32-freeze.json'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(hash(execFileSync('git',['show',`${prePerformanceCommit}:trading/lab/jeu32-freeze.json`],{cwd:root})),hash(freezeRaw));
const oldLedger=JSON.parse(execFileSync('git',['show',`${freeze.baselineCommit}:trading/lab/research-ledger.json`],{cwd:root,encoding:'utf8'})),ledger=await json('trading/lab/research-ledger.json');
assert.equal(oldLedger.entries.length,70);assert.deepEqual(ledger.entries.slice(0,70),oldLedger.entries);
for(const name of ['report.json','runs-private.json']){try{await access(resolve(outDir,name));throw Error('Existing output cannot be overwritten');}catch(e){if(e.code!=='ENOENT')throw e;}}
const source=await json('trading/lab/market-audit-source.json'),archive=await json('trading/lab/jeu31-archive.json');
async function checked(dir,name,pin){const b=await readFile(resolve(dir,name));assert.equal(b.length,pin.bytes);assert.equal(hash(b),pin.sha256);return JSON.parse(b);}
const bundle=await checked(sourceDir,'dataset.json',source.inputs.prices),mnq=await checked(sourceDir,'mnq-dataset.json',source.inputs.mnq),prior=await checked(priorDir,'runs-private.json',archive.files.find(f=>f.name==='runs-private.json'));
const markets=PROFILES.map(profile=>{const product=PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
const baseContexts=new Map(),alignedContexts=new Map(),prepBars=new Map(),oldContexts=new Map();
for(const m of markets){const bars=m.data.groups.filter(g=>g.start>=P.warmupFrom).flatMap(g=>g.candles),old=m.data.groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles);
 const current=combinedContexts(bars,m.product),historic=combinedContexts(old,m.product);for(const [t,c]of historic)if(c.day>='2026-08-01')current.set(t,c);
 baseContexts.set(m.symbol,current);oldContexts.set(m.symbol,historic);alignedContexts.set(m.symbol,alignmentContexts(bars,m.product));prepBars.set(m.symbol,bars);
}
function streamsFor(period){return markets.map(m=>{const groups=m.data.groups.filter(g=>g.start>=period.start&&g.start<period.end),signals=new Map(),generator=m.strategy==='failure'?failedBreakoutSignals:admissionSignals;
 for(const g of groups)for(const [t,s]of generator(g.candles,m.product))signals.set(t,s);return {symbol:m.symbol,candles:groups.flatMap(g=>g.candles),signals};});}
const audit={oldAugustReplays:0,alignmentPrefixes:0,rsiPrefixes:0,replayPrefixes:0,executedRecords:0,passed:false};
// Old engine extension is checked for every archived August filter/mode/cost.
const augPeriod={start:'2026-08-01',end:'2026-09-01'},augStreams=streamsFor(augPeriod);
for(const record of prior.runs.filter(r=>r.viewId==='august')){
 const streams=filterMarketStreams(augStreams,oldContexts,record.variant).streams;
 assert.deepEqual(simulateSummerPortfolio(streams,augPeriod,record.factor,record.account),record.run);audit.oldAugustReplays++;
}
assert.equal(audit.oldAugustReplays,16);
for(const s of streamsFor({start:P.from,end:P.end}))for(const [t,signal]of s.signals){
 const m=markets.find(m=>m.symbol===s.symbol),bars=prepBars.get(s.symbol).filter(b=>b.time+300<=t),prefix=alignmentContexts(bars,m.product).get(t);
 assert.deepEqual(prefix,alignedContexts.get(s.symbol).get(t));assert.deepEqual(alignmentDecision(signal,prefix),alignmentDecision(signal,alignedContexts.get(s.symbol).get(t)));audit.alignmentPrefixes++;
 if(s.symbol==='MES'){
  const sourceBars=signal.day>='2026-08-01'?m.data.groups.filter(g=>g.start<'2026-05-01'||g.start>='2026-08-01').flatMap(g=>g.candles).filter(b=>b.time+300<=t):bars;
  assert.deepEqual(combinedContexts(sourceBars,m.product).get(t),baseContexts.get(s.symbol).get(t));audit.rsiPrefixes++;
 }
}
console.log(JSON.stringify({phase:'sources-and-causality',audit}));
const events=await json('trading/lab/jeu32-events.json'),views=[],privateRuns=[],study=[];
const specs=[['june','2026-06-01','2026-07-01'],['july','2026-07-01','2026-08-01'],['august','2026-08-01','2026-09-01'],['summer','2026-06-01','2026-09-01']];
for(const [id,start,end]of specs){const period={start,end},expected=historyCalendar(start,end);
 const missing=expected.flatMap(d=>{const absent=markets.filter(m=>!m.data.eligible.some(x=>x.date===d.date)).map(m=>m.symbol);return absent.length?[{day:d.date,markets:absent}]:[];});assert.equal(missing.length,0,'Full summer coverage required');
 const initial=streamsFor(period),base=filterMarketStreams(initial,baseContexts,'combined');
 for(const account of [false,true]){
  const variants=[],runsById=new Map();
  for(const variant of VARIANTS){
   const alignmentRefusals={},streams=base.streams.map(s=>({...s,signals:new Map([...s.signals].flatMap(([t,signal])=>{
    if(!variant.aligned)return [[t,signal]];const context=alignedContexts.get(s.symbol).get(t),gate=alignmentDecision(signal,context);
    if(!gate.allowed){alignmentRefusals[gate.reason]=(alignmentRefusals[gate.reason]||0)+1;return [];}
    return [[t,{...signal,alignmentContext:context}]];
   }))})),costs={};
   for(const [cost,factor]of [['normal',1],['stress',2]]){
    const run=simulateSummerPortfolio(streams,period,factor,account,variant.id);runsById.set(variant.id+'/'+cost,run);
    for(const d of run.days){const prefixEnd=new Date(Date.parse(d.day+'T00:00Z')+86400000).toISOString().slice(0,10);
     const prefix=simulateSummerPortfolio(streams.map(s=>({...s,candles:s.candles.filter(b=>b.day<=d.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=d.day))})),{start,end:prefixEnd},factor,account,variant.id);
     assert.deepEqual(prefix.trades,run.trades.filter(t=>t.day<=d.day));assert.deepEqual(prefix.days,run.days.filter(x=>x.day<=d.day));assert.deepEqual(prefix.decisions,run.decisions.filter(x=>x.day<=d.day));audit.replayPrefixes++;
    }
    for(const t of run.trades){const p=PRODUCTS.find(p=>p.symbol===t.symbol),q=t.quantity??1,sign=t.side==='Long'?1:-1;
     assert.ok(q>=1&&q<=20&&Number.isInteger(q));assert.ok(t.riskDollars+t.costDollars<=variant.riskPerTrade+1e-8);
     assert.equal(round(sign*(t.exit-t.entry)*p.multiplier*q-t.costDollars,2),t.netDollars);
     if(variant.custom)assert.ok(Math.abs(t.targetDistance/t.risk-2)<1e-8);
     if(variant.aligned)assert.equal(alignmentDecision(t,t.alignmentContext).allowed,true);
     if(account)assert.ok(t.balanceBefore-t.riskDollars-t.costDollars>=t.floorBefore+P.floorReserve-1e-8);
    }
    assert.ok(run.days.every(d=>d.trades<=2));
    const summary=statistics(run.trades),calendar=calendarBreakdown(run,expected),baseline=runsById.get('reference31/'+cost),risk=run.trades.map(t=>t.riskDollars+t.costDollars),quantities=run.trades.map(t=>t.quantity??1);
    costs[cost]={...summary,status:run.status,terminalDay:run.terminalDay,balance:run.balance,floor:run.floor,drawdown:run.drawdown,daily:run.daily,denied:run.denied,calendar,
     weeklyObjective:weeklyObjective(calendar,period),comparison:compareFilteredRuns(baseline,run),
     alignmentComparison:variant.aligned?compareFilteredRuns(runsById.get('rr2-'+variant.riskPerTrade+'/'+cost),run):null,
     plannedRisk:{mean:risk.length?round(risk.reduce((a,b)=>a+b,0)/risk.length,2):null,min:risk.length?Math.min(...risk):null,max:risk.length?Math.max(...risk):null,
      minQuantity:quantities.length?Math.min(...quantities):null,maxQuantity:quantities.length?Math.max(...quantities):null,lossBeyondPlanned:run.trades.filter(t=>-t.netDollars>t.riskDollars+t.costDollars+1e-8).length,worstLoss:run.trades.length?Math.min(0,...run.trades.map(t=>t.netDollars)):null},
     contributions:PROFILES.map(p=>({symbol:p.symbol,...statistics(run.trades.filter(t=>t.symbol===p.symbol))})),executionAllowed:false};
    privateRuns.push({viewId:id,variant:variant.id,period,factor,account,run});audit.executedRecords+=run.trades.length;
    if(!account&&variant.id==='reference31'&&cost==='normal'&&id!=='summer')study.push({id,period,markets:marketStudy(markets,period,run,alignedContexts,events.events),eventDays:events.events.filter(e=>e.day>=start&&e.day<end).map(e=>({...e,...statistics(run.trades.filter(t=>t.day===e.day))}))});
   }
   const baseRefusals={};for(const d of base.decisions)if(!d.allowed)baseRefusals[d.reason]=(baseRefusals[d.reason]||0)+1;
   variants.push({...variant,baseRefusals,alignmentRefusals,costs});
  }
  views.push({id,period,mode:account?'account':'diagnostic',coverage:{expected:expected.length,scored:expected.length,missing},variants});
  console.log(JSON.stringify({phase:'replayed',view:id,mode:account?'account':'diagnostic',variants:variants.map(v=>({id:v.id,normal:v.costs.normal.net,stress:v.costs.stress.net,status:v.costs.normal.status}))}));
 }
}
audit.passed=true;
const report={schema:'jeu32-report-v1',generatedAt:new Date().toISOString(),prePerformanceCommit,freezeSha256:hash(freezeRaw),source:{prices:source.inputs.prices,mnq:source.inputs.mnq,game31:archive.files.find(f=>f.name==='runs-private.json')},policy:P,views,study,events,audit,
 configurationCount:74,newConfigurations:4,independent:false,confirmed:false,executionAllowed:false,selection:{id:null,reason:'Exploratory user-requested summer comparison; no independent qualification or payout simulation'}};
await mkdir(outDir,{recursive:true});await writeFile(resolve(outDir,'report.json'),JSON.stringify(report)+'\n',{flag:'wx'});
await writeFile(resolve(outDir,'runs-private.json'),JSON.stringify({schema:'jeu32-private-v1',prePerformanceCommit,freezeSha256:hash(freezeRaw),runs:privateRuns})+'\n',{flag:'wx'});
console.log(JSON.stringify({phase:'complete',audit}));
