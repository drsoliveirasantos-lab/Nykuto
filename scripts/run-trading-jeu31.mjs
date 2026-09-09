import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {historyCalendar} from '../trading/lab/jeu14-policy.mjs';
import {inspectOpeningHistory} from '../trading/lab/jeu22-history.mjs';
import {admissionSignals} from '../trading/lab/jeu23-signals.mjs';
import {failedBreakoutSignals} from '../trading/lab/jeu26-signals.mjs';
import {combinedContexts} from '../trading/lab/jeu24-context.mjs';
import {simulatePortfolio} from '../trading/lab/jeu29-engine.mjs';
import {simulateAugustPortfolio} from '../trading/lab/jeu30-engine.mjs';
import {JEU29_PROFILES as PROFILES,JEU29_PRODUCTS as PRODUCTS} from '../trading/lab/jeu29-policy.mjs';
import {calendarBreakdown} from '../trading/lab/jeu30-calendar.mjs';
import {statistics} from '../trading/lab/market-diagnostics.mjs';
import {metrics} from '../trading/lab/validation-engine.mjs';
import {JEU31_POLICY as P,JEU31_VARIANTS as VARIANTS} from '../trading/lab/jeu31-policy.mjs';
import {filterMarketStreams,assessMarketFilter,compareFilteredRuns} from '../trading/lab/jeu31-filters.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),[sourceDir,outDir,...extra]=process.argv.slice(2);
assert.ok(!extra.length&&[sourceDir,outDir].every(p=>p&&relative(root,resolve(p)).startsWith('../')),'Two private paths required');
const hash=b=>createHash('sha256').update(b).digest('hex'),serialize=v=>JSON.stringify(v,(_,x)=>x===Infinity?'Infinity':x,2)+'\n';
const freezePath='trading/lab/jeu31-freeze.json',freezeRaw=await readFile(resolve(root,freezePath)),freeze=JSON.parse(freezeRaw);
for(const [path,sha]of Object.entries(freeze.files))assert.equal(hash(await readFile(resolve(root,path))),sha,path);
const prePerformanceCommit=execFileSync('git',['log','-1','--format=%H','--',freezePath],{cwd:root,encoding:'utf8'}).trim();
assert.equal(hash(execFileSync('git',['show',`${prePerformanceCommit}:${freezePath}`],{cwd:root})),hash(freezeRaw));
const baseLedger=JSON.parse(execFileSync('git',['show',`${freeze.baselineCommit}:trading/lab/research-ledger.json`],{cwd:root,encoding:'utf8'}));
const ledger=JSON.parse(await readFile(resolve(root,'trading/lab/research-ledger.json')));
assert.equal(baseLedger.configurationCount,P.priorAttempts);assert.deepEqual(ledger.entries.slice(0,P.priorAttempts),baseLedger.entries);
for(const name of ['report.json','runs-private.json']){
  try{await access(resolve(outDir,name));throw Error('Existing output cannot be overwritten');}catch(e){if(e.code!=='ENOENT')throw e;}
}
const source=JSON.parse(await readFile(resolve(root,'trading/lab/market-audit-source.json')));
async function checked(name,key){const bytes=await readFile(resolve(sourceDir,name));assert.equal(bytes.length,source.inputs[key].bytes);assert.equal(hash(bytes),source.inputs[key].sha256);return JSON.parse(bytes);}
const bundle=await checked('dataset.json','prices'),mnq=await checked('mnq-dataset.json','mnq');
const dev=await checked('train-runs-private.json','development'),aug=await checked('august-runs-private.json','august');
const archived=[...dev.runs,...aug.runs];
const markets=PROFILES.map(profile=>{const product=PRODUCTS.find(p=>p.symbol===profile.symbol);return {...profile,product,
  data:inspectOpeningHistory(profile.symbol==='MNQ'?mnq:bundle.products.find(p=>p.symbol===profile.symbol),product)};});
const observed=day=>day<'2026-05-01'||day>='2026-08-01';
const contexts=new Map(markets.map(m=>[m.symbol,combinedContexts(m.data.groups.filter(g=>observed(g.start)).flatMap(g=>g.candles),m.product)]));
const specs=[['jan-apr','2026-01-01','2026-05-01',false],['jan-feb','2026-01-01','2026-03-01',false],
  ['mar-apr','2026-03-01','2026-05-01',false],['august','2026-08-01','2026-09-01',false],['august','2026-08-01','2026-09-01',true]];
const audit={baselineRuns:0,rsiPrefixes:0,replayPrefixes:0,executedTrades:0,passed:false};
// Audit each affected MES signal once at its available close, with all future bars removed.
const mes=markets.find(m=>m.symbol==='MES'),mesBars=mes.data.groups.filter(g=>observed(g.start)).flatMap(g=>g.candles);
for(const group of mes.data.groups.filter(g=>observed(g.start)))for(const [time,signal]of admissionSignals(group.candles,mes.product)){
  const prefix=combinedContexts(mesBars.filter(b=>b.time+300<=time),mes.product).get(time);
  assert.deepEqual(prefix,contexts.get('MES').get(time));
  assert.deepEqual(assessMarketFilter('MES',time,signal,prefix,'mes-rsi'),assessMarketFilter('MES',time,signal,contexts.get('MES').get(time),'mes-rsi'));
  audit.rsiPrefixes++;
}
console.log(JSON.stringify({phase:'source-and-causality',rsiPrefixes:audit.rsiPrefixes}));
const privateRuns=[],views=[];
for(const [id,start,end,account]of specs){
  const expected=historyCalendar(start,end),period={start,end};
  const missing=expected.flatMap(d=>{const absent=markets.filter(m=>!m.data.eligible.some(x=>x.date===d.date)).map(m=>m.symbol);return absent.length?[{day:d.date,markets:absent}]:[];});
  if(account)assert.equal(missing.length,0,'Account needs full coverage');
  const common=new Set(expected.filter(d=>!missing.some(m=>m.day===d.date)).map(d=>d.date));
  const streams=markets.map(m=>{
    const candles=[],signals=new Map(),generator=m.strategy==='failure'?failedBreakoutSignals:admissionSignals;
    for(const group of m.data.groups){if(!common.has(group.start))continue;candles.push(...group.candles);for(const [t,s]of generator(group.candles,m.product))signals.set(t,s);}
    return {symbol:m.symbol,candles,signals};
  });
  const simulator=id==='august'?simulateAugustPortfolio:simulatePortfolio;
  const baselines=new Map(),variants=[];
  for(const variant of VARIANTS){
    const filtered=filterMarketStreams(streams,contexts,variant.id),costs={};
    for(const [cost,factor]of [['normal',1],['stress',2]]){
      const run=simulator(filtered.streams,period,factor,account);
      if(variant.id==='baseline'){
        const original=archived.find(r=>r.period.start===start&&r.period.end===end&&r.factor===factor&&r.account===account);
        assert.ok(original,'Archived baseline missing');assert.deepEqual(run,original.run,'Baseline changed');baselines.set(factor,run);audit.baselineRuns++;
      }
      for(const d of run.days){
        const prefixEnd=new Date(Date.parse(d.day+'T00:00Z')+86400000).toISOString().slice(0,10);
        const prefix=simulator(filtered.streams.map(s=>({...s,candles:s.candles.filter(b=>b.day<=d.day),signals:new Map([...s.signals].filter(([,v])=>v.day<=d.day))})),{start,end:prefixEnd},factor,account);
        assert.deepEqual(prefix.trades,run.trades.filter(t=>t.day<=d.day));assert.deepEqual(prefix.days,run.days.filter(x=>x.day<=d.day));assert.deepEqual(prefix.decisions,run.decisions.filter(x=>x.day<=d.day));audit.replayPrefixes++;
      }
      const summary=statistics(run.trades),rMetrics=metrics(run.trades),calendar=calendarBreakdown(run,expected,missing.map(d=>d.day));
      const contributions=PROFILES.map(p=>({symbol:p.symbol,...statistics(run.trades.filter(t=>t.symbol===p.symbol))}));
      const reasons={};for(const d of filtered.decisions)if(!d.allowed)reasons[d.reason]=(reasons[d.reason]||0)+1;
      costs[cost]={...summary,metricsR:rMetrics,status:run.status,terminalDay:run.terminalDay,balance:run.balance,floor:run.floor,
        drawdown:run.drawdown,daily:run.daily,contributions,calendar,denied:run.denied,filterRejections:reasons,
        sourceCandidates:filtered.decisions.length,filteredCandidates:filtered.decisions.filter(d=>d.allowed).length,
        comparison:compareFilteredRuns(baselines.get(factor),run),executionAllowed:false};
      audit.executedTrades+=run.trades.length;
      privateRuns.push({viewId:id,variant:variant.id,period,factor,account,run,filterDecisions:filtered.decisions});
    }
    variants.push({...variant,costs});
  }
  views.push({id,period,mode:account?'account':'diagnostic',coverage:{expected:expected.length,scored:common.size,missing},variants});
  console.log(JSON.stringify({phase:'replayed',view:id,mode:account?'account':'diagnostic',variants:variants.map(v=>({id:v.id,normal:v.costs.normal.net,stress:v.costs.stress.net}))}));
}
const pick=(view,variant,cost,mode='diagnostic')=>views.find(v=>v.id===view&&v.mode===mode).variants.find(v=>v.id===variant).costs[cost];
const evaluations=VARIANTS.filter(v=>v.id!=='baseline').map(v=>{
  const checks=[
    {id:'positive-windows',label:'Janvier–février, mars–avril et août positifs aux deux coûts',pass:['jan-feb','mar-apr','august'].every(w=>['normal','stress'].every(c=>pick(w,v.id,c).net>0))},
    {id:'count',label:'40 trades développement et 12 par fenêtre',pass:pick('jan-apr',v.id,'normal').count>=40&&['jan-feb','mar-apr'].every(w=>pick(w,v.id,'normal').count>=12)},
    {id:'august-drawdown',label:'Drawdown compte août au plus égal à la référence aux deux coûts',pass:['normal','stress'].every(c=>pick('august',v.id,c,'account').drawdown<=pick('august','baseline',c,'account').drawdown)},
    {id:'august-floor',label:'Aucun seuil compte août franchi aux deux coûts',pass:['normal','stress'].every(c=>pick('august',v.id,c,'account').status!=='breached')}
  ];return {id:v.id,checks,diagnosticImprovementPassed:checks.every(c=>c.pass),confirmed:false,executionAllowed:false};
});
audit.passed=true;
const report={schema:'jeu31-report-v1',generatedAt:new Date().toISOString(),prePerformanceCommit,freezeSha256:hash(freezeRaw),
  source:source.inputs,policy:P,views,evaluations,audit,configurationCount:70,newConfigurations:3,independent:false,confirmed:false,executionAllowed:false,
  selection:{id:null,reason:'Exploratory observed periods; incomplete development coverage; no executable qualification'}};
await mkdir(outDir,{recursive:true});await writeFile(resolve(outDir,'report.json'),serialize(report),{flag:'wx'});
await writeFile(resolve(outDir,'runs-private.json'),serialize({schema:'jeu31-private-v1',prePerformanceCommit,freezeSha256:hash(freezeRaw),runs:privateRuns}),{flag:'wx'});
console.log(JSON.stringify({phase:'complete',evaluations,audit}));
