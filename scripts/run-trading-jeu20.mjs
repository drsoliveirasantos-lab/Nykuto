import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { inspectNativePreparation, nativeSignals } from '../trading/lab/jeu20-history.mjs';
import { multimarketSignals, simulateMultimarket } from '../trading/lab/jeu19-engine.mjs';
import { JEU20_POLICY as P, JEU20_PRODUCTS as JEU19_PRODUCTS, JEU20_SCENARIOS as JEU19_SCENARIOS } from '../trading/lab/jeu20-policy.mjs';
import { JEU19_WINDOWS } from '../trading/lab/jeu19-policy.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
import { simulateAblation } from '../trading/lab/jeu17-engine.mjs';
import { JEU17_SCENARIOS } from '../trading/lab/jeu17-policy.mjs';
const [sourceDir,outDir,phase='train',selectionHash] = process.argv.slice(2);
const root=fileURLToPath(new URL('../',import.meta.url)), hash=b=>createHash('sha256').update(b).digest('hex');
if (![sourceDir,outDir].every(d=>d && relative(root,resolve(d)).startsWith('../')) || !['train','holdout'].includes(phase)) throw new Error('Private paths and valid phase required');
const freezeRaw=await readFile(resolve(root,'trading/lab/jeu20-freeze.json')), freeze=JSON.parse(freezeRaw);
for (const [path,sha] of Object.entries(freeze.files)) assert.equal(hash(await readFile(resolve(root,path))),sha,'Frozen dependency changed: '+path);
const source=JSON.parse(await readFile(resolve(root,'trading/lab/jeu20-source.json'))), raw=await readFile(resolve(sourceDir,'dataset.json'));
assert.equal(raw.length,source.bytes); assert.equal(hash(raw),source.sha256);
const bundle=JSON.parse(raw);
const markets=JEU19_PRODUCTS.map(product=>({product, data:inspectNativePreparation(bundle.products.find(p=>p.symbol===product.symbol),product)}));
const serialize=v=>JSON.stringify(v,(_,x)=>x===Infinity?'Infinity':x,2)+'\n';
const cents=n=>Math.round(n*100)/100;
const clean=r=>{
  const m=metrics(r.trades), feesDollars=cents(r.trades.reduce((n,t)=>n+t.costDollars,0)), wins=r.trades.filter(t=>t.netDollars>0).reduce((n,t)=>n+t.netDollars,0), losses=-r.trades.filter(t=>t.netDollars<0).reduce((n,t)=>n+t.netDollars,0);
  return {status:r.status,terminalDay:r.terminalDay,net:r.net,balance:r.balance,drawdown:r.drawdown,daily:r.daily,trades:r.trades.length,metrics:m,grossDollars:cents(r.net+feesDollars),feesDollars,pfDollars:losses?wins/losses:null,signalCount:r.signalCount,denied:r.denied,ambiguous:r.ambiguous};
};
const audit={signalPrefixes:0,accountPrefixes:0,trades:0,referencePairs:0,passed:false};
const cache=new Map();
function inputs(market,scenario,end){
  const key=market.product.symbol+'/'+scenario.id+'/'+end;
  if(cache.has(key))return cache.get(key);
  const candles=[],signals=new Map();
  for(const g of market.data.groups){
    if(g.start>=end||g.end<=P.from)continue;
    const bars=g.candles.filter(b=>b.day<end), set=nativeSignals(bars,g.thirty.filter(b=>b.day<end),scenario.id);
    for(let cut=6;cut<=bars.length;cut+=6){
      const last=bars[cut-1]; if(last.minute!==last.closeMinute-5||last.day<g.start)continue;
      assert.deepEqual([...nativeSignals(bars.slice(0,cut),g.thirty.filter(b=>b.closedAt<=last.time+300),scenario.id)],[...set].filter(([t])=>t<=last.time+300)); audit.signalPrefixes++;
    }
    for(const b of bars)if(b.day>=g.start&&b.day<g.end&&b.day>=P.from)candles.push({...b,ticker:g.ticker});
    for(const [t,s] of set)if(s.day>=g.start&&s.day<g.end&&s.day>=P.from){assert.ok(!signals.has(t));signals.set(t,s);}
  }
  candles.sort((a,b)=>a.time-b.time); assert.equal(new Set(candles.map(b=>b.time)).size,candles.length);
  const value={candles,signals};cache.set(key,value);return value;
}
const privateRuns=[];
function run(market,scenario,period,factor,account){
  const {candles,signals}=inputs(market,scenario,period.end), value=simulateMultimarket(candles,signals,scenario,market.product,period,factor,account);
  for(const t of value.trades){
    assert.ok(t.signalClose===t.entryTime&&t.signalOpen<t.entryTime&&t.trendClosedAt<=t.entryTime);
    assert.ok(t.riskDollars+t.costDollars<=50+1e-8);
    assert.equal(cents((t.side==='Long'?1:-1)*(t.exit-t.entry)*market.product.multiplier-t.costDollars),t.netDollars);
    audit.trades++;
  }
  if(account)for(const day of value.days){
    const end=new Date(Date.parse(day.day+'T00:00:00Z')+86400000).toISOString().slice(0,10);
    const prefix=simulateMultimarket(candles.filter(b=>b.day<=day.day),signals,scenario,market.product,{...period,end},factor,true);
    assert.deepEqual(prefix.trades,value.trades.filter(t=>t.day<=day.day));assert.deepEqual(prefix.days,value.days.filter(d=>d.day<=day.day));audit.accountPrefixes++;
  }
  if(market.product.symbol==='MNQ'&&scenario.id==='pullback'){
    const ref=simulateAblation(candles,signals,JEU17_SCENARIOS.find(s=>s.id==='atrNet5'),period,factor,account);
    assert.deepEqual(value,ref);audit.referencePairs++;
  }
  privateRuns.push({symbol:market.product.symbol,scenario:scenario.id,period,factor,account,run:value});return clean(value);
}
function evaluate(market,scenario,kind){
  const definitions=JEU19_WINDOWS.filter(w=>w.phase===kind), period={start:definitions[0].start,end:definitions.at(-1).end};
  const diagnostic={normal:run(market,scenario,period,1,false),stress:run(market,scenario,period,2,false)};
  const windows=definitions.map(w=>{
    const expected=historyCalendar(w.start,w.end).length,scored=market.data.eligible.filter(d=>d.date>=w.start&&d.date<w.end).length,complete=expected===scored;
    return {...w,expected,scored,complete,diagnostic:{normal:run(market,scenario,w,1,false),stress:run(market,scenario,w,2,false)},account:complete?{normal:run(market,scenario,w,1,true),stress:run(market,scenario,w,2,true)}:null};
  });
  const normal=diagnostic.normal,stress=diagnostic.stress;
  const checks=[
    {id:'coverage',label:'Deux fenêtres entièrement couvertes',pass:windows.every(w=>w.complete)},
    {id:'count',label:'Au moins 40 trades au total',pass:normal.trades>=40},
    {id:'windowCount',label:'Au moins 12 trades par fenêtre',pass:windows.every(w=>w.diagnostic.normal.trades>=12)},
    {id:'positive',label:'Chaque fenêtre positive en R et dollars',pass:windows.every(w=>w.diagnostic.normal.metrics.total>0&&w.diagnostic.normal.net>0)},
    {id:'pf',label:'Profit factor en R au moins 1,10',pass:normal.metrics.pf!==null&&normal.metrics.pf>=P.minimumPF},
    {id:'dd',label:'Drawdown réalisé au plus 8 R',pass:normal.metrics.dd<=P.maxDrawdownR},
    {id:'stress',label:'Total positif en R et dollars avec coûts doublés',pass:stress.metrics.total>0&&stress.net>0},
    {id:'account',label:'Aucun franchissement du seuil dans les comptes complets',pass:windows.every(w=>w.complete&&w.account.normal.status!=='breached'&&w.account.stress.status!=='breached')}
  ];
  return {id:market.product.symbol+'/'+scenario.id,symbol:market.product.symbol,label:scenario.label,product:market.product,diagnostic,windows,checks,researchPassed:checks.every(c=>c.pass),confirmed:false};
}
await mkdir(outDir,{recursive:true});
let report;
if(phase==='train'){
  const results=markets.flatMap(m=>JEU19_SCENARIOS.map(s=>evaluate(m,s,'train')));
  const candidates=results.filter(r=>r.researchPassed).sort((a,b)=>Math.min(...b.windows.map(w=>w.diagnostic.normal.metrics.exp))-Math.min(...a.windows.map(w=>w.diagnostic.normal.metrics.exp))||a.diagnostic.normal.metrics.dd-b.diagnostic.normal.metrics.dd||results.indexOf(a)-results.indexOf(b));
  const selection={schema:'jeu20-selection-v1',id:candidates[0]?.id??null,attempted:results.length,cumulativeAttempts:P.priorAttempts+results.length,freezeSha256:hash(freezeRaw),sourceSha256:source.sha256,trainEnd:P.trainEnd,createdAt:new Date().toISOString()};
  const selectionRaw=serialize(selection);await writeFile(resolve(outDir,'selection.json'),selectionRaw);
  report={schema:'jeu20-report-v1',protocol:P.version,generatedAt:new Date().toISOString(),freezeSha256:hash(freezeRaw),protocolSha256:freeze.files['trading/lab/JEU20_PROTOCOL.md'],source,policy:P,results,selection,selectionSha256:hash(selectionRaw),holdout:{status:selection.id?'pending-frozen-selection':'not-opened',reason:selection.id?'Candidate selected on development only':'No eligible development candidate'},
    coverage:markets.map(m=>({symbol:m.product.symbol,expected:historyCalendar(P.from,P.end).length,scored:m.data.eligible.filter(d=>d.date>=P.from&&d.date<P.end).length,unavailable:m.data.unavailable.filter(d=>d.date>=P.from&&d.date<P.end),quality:m.data.quality})),confirmed:false};
}else{
  const selectedRaw=await readFile(resolve(outDir,'selection.json'));assert.equal(hash(selectedRaw),selectionHash,'Selection must be pinned before holdout');
  const selected=JSON.parse(selectedRaw);assert.equal(selected.freezeSha256,hash(freezeRaw));assert.equal(selected.sourceSha256,source.sha256);
  report=JSON.parse(await readFile(resolve(outDir,'report.json')));assert.equal(report.selectionSha256,selectionHash);
  if(selected.id){
    const [symbol,mode]=selected.id.split('/'),market=markets.find(m=>m.product.symbol===symbol),scenario=JEU19_SCENARIOS.find(s=>s.id===mode);
    assert.ok(market&&scenario&&report.results.find(r=>r.id===selected.id)?.researchPassed);
    report.holdout={status:'evaluated-once',result:evaluate(market,scenario,'holdout')};
  }
}
audit.passed=true; report.audit=audit;
await writeFile(resolve(outDir,'report.json'),serialize(report));
await writeFile(resolve(outDir,phase+'-runs-private.json'),serialize({schema:'jeu20-private-v1',source,freezeSha256:hash(freezeRaw),runs:privateRuns}));
console.log(serialize({phase,selection:report.selection,selectionSha256:report.selectionSha256,holdout:report.holdout.status,results:report.results.map(r=>({id:r.id,trades:r.diagnostic.normal.trades,normal:r.diagnostic.normal.net,stress:r.diagnostic.stress.net,coverage:r.windows.map(w=>`${w.scored}/${w.expected}`),failed:r.checks.filter(c=>!c.pass).map(c=>c.id)})),audit}));
