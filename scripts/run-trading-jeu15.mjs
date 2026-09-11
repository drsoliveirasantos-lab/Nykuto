import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { inspectHistory } from '../trading/lab/jeu14-history.mjs';
import { JEU14_SOURCE as source } from '../trading/lab/jeu14-source.mjs';
import { JEU14_WINDOWS, historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { simulateFive, signalsFor } from '../trading/lab/jeu12-engine.mjs';
import { JEU12_CONFIGS } from '../trading/lab/jeu12-policy.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
import { JEU15_POLICY as policy, JEU15_SCENARIOS as scenarios } from '../trading/lab/jeu15-policy.mjs';
import { lucidSignals, simulateLucid, entryGate, floorAtClose } from '../trading/lab/jeu15-engine.mjs';
const [sourceDir, outDir] = process.argv.slice(2), root = fileURLToPath(new URL('../', import.meta.url));
if (![sourceDir,outDir].every(d => d && relative(root, resolve(d)).startsWith('../'))) throw new Error('Private paths required');
const raw = await readFile(resolve(sourceDir, 'dataset.json'), 'utf8');
assert.equal(Buffer.byteLength(raw), source.bytes);
assert.equal(createHash('sha256').update(raw).digest('hex'), source.sha256);
const protocolText = await readFile(new URL('../trading/lab/JEU15_PROTOCOL.md', import.meta.url),'utf8');
const protocolSha256 = createHash('sha256').update(protocolText).digest('hex');
const { groups, eligible, expectedSessions, unavailable } = inspectHistory(JSON.parse(raw));
const eligibleKeys = new Set(eligible.map(s => `${s.date}/${s.ticker}`));
const candles = groups.flatMap(g => g.candles.filter(b => b.day >= g.start && b.day < g.end).map(b => ({...b,ticker:g.ticker}))).sort((a,b)=>a.time-b.time);
assert.equal(new Set(candles.map(b=>b.day)).size,eligible.length);
assert.equal(new Set(candles.map(b=>b.time)).size,candles.length);
assert.ok(candles.every(b=>eligibleKeys.has(`${b.day}/${b.ticker}`)));
const sets = new Map(), audit = { signalPrefixes:0, accountPrefixes:0, trades:0, legacyTrades:0, passed:false };
for (const mode of ['pullback30','entry5trend30']) {
  const combined = new Map();
  for (const g of groups) {
    const full = lucidSignals(g.candles, mode);
    for (let cut=6;cut<=g.candles.length;cut+=6) {
      const last=g.candles[cut-1]; if(last.minute!==last.closeMinute-5)continue;
      assert.deepEqual([...lucidSignals(g.candles.slice(0,cut),mode)],[...full].filter(([t])=>t<=last.time+300)); audit.signalPrefixes++;
    }
    for(const [time,s] of full) if(s.day>=g.start&&s.day<g.end) {assert.ok(!combined.has(time));combined.set(time,s);}
  }
  sets.set(mode,combined);
}
function auditRun(run, scenario, account, factor) {
  let balance=policy.initial, floor=policy.initial-policy.maxLoss, peak=balance, previous=-Infinity;
  for(const d of run.days){
    const trades=run.trades.filter(t=>t.day===d.day); assert.equal(trades.length,d.trades); assert.ok(trades.length<=3);
    const dayStart=balance;let losses=0,r=0;
    for(const t of trades){
      assert.ok(t.entryTime>previous);previous=t.exitTime;assert.ok(losses<2&&r>-2);
      assert.equal(t.balanceBefore,balance);assert.equal(t.dayStart,dayStart);assert.equal(t.costDollars,policy.cost*factor);
      assert.ok(t.signalOpen<t.signalClose&&t.signalClose===t.entryTime&&(!t.trendClosedAt||t.trendClosedAt<=t.entryTime));
      assert.equal(t.riskDollars,t.risk*2);assert.equal(t.floorBefore,account?floor:null);
      assert.equal(entryGate({balance,floor,dayStart,...t,guarded:scenario.guarded,account}),null);
      for(const price of [t.entry,t.exit,t.stop,t.target])assert.ok(Math.abs(price*4-Math.round(price*4))<1e-8);
      const sign=t.side==='Long'?1:-1,net=sign*(t.exit-t.entry)*2-t.costDollars;
      assert.ok(Math.abs(net-t.netDollars)<1e-8);assert.ok(Math.abs(net/t.riskDollars-t.resultR)<1e-10);
      balance=Math.round((balance+net)*100)/100;assert.equal(t.balanceAfter,balance);r+=t.resultR;losses=net<0?losses+1:0;
      if(account&&balance<=floor)assert.equal(run.status,'breached');audit.trades++;
    }
    assert.equal(d.net,Math.round((balance-dayStart)*100)/100);assert.equal(d.balance,balance);
    if(account)floor=floorAtClose(floor,balance);assert.equal(d.floor,account?floor:null);peak=Math.max(peak,balance);
  }
  assert.equal(run.balance,balance);assert.equal(run.floor,account?floor:null);
  if(run.status==='targetMet'){assert.ok(run.net>=1250);assert.ok(run.consistency<=.5);assert.ok(balance>floor);}
  if(run.status==='breached'){assert.ok(balance<=floor);assert.equal(run.days.at(-1).day,run.terminalDay);}
}
const bounds={start:eligible[0].date,end:'2026-09-09'}, privateRuns=[], results=[];
const clean = r => { const {trades,days,...summary}=r;return {...summary,trades:trades.length,metrics:metrics(trades)}; };
for(const scenario of scenarios){
  const signals=sets.get(scenario.signal), diagnostic=[1,2].map(f=>simulateLucid(candles,signals,scenario,bounds,f,false));
  for(const [i,r] of diagnostic.entries())auditRun(r,scenario,false,i+1);
  if(scenario.id==='reference30')for(const factor of [1,2]){
    const original=groups.flatMap(g=>simulateFive(g.candles,signalsFor(g.candles,30,'pullback'),JEU12_CONFIGS.find(c=>c.id==='30-full-both'),g,factor)).sort((a,b)=>a.entryTime-b.entryTime);
    const actual=diagnostic[factor-1].trades;assert.equal(actual.length,original.length);assert.equal(actual.length,234);
    for(let i=0;i<actual.length;i++){for(const key of ['entryTime','exitTime','entry','exit','risk','target','stop','costDollars'])assert.equal(actual[i][key],original[i][key]);assert.ok(Math.abs(actual[i].resultR-original[i].resultR)<1e-10);audit.legacyTrades++;}
  }
  const windows=[];
  for(const w of JEU14_WINDOWS){
    const planned=historyCalendar(w.start,w.end), scored=eligible.filter(s=>s.date>=w.start&&s.date<w.end);
    if(scored.length!==planned.length){windows.push({start:w.start,end:w.end,complete:false,expected:planned.length,scored:scored.length,normal:null,stress:null});continue;}
    const bars=candles.filter(b=>b.day>=w.start&&b.day<w.end), pair=[];
    for(const factor of [1,2]){
      const run=simulateLucid(bars,signals,scenario,w,factor,true);auditRun(run,scenario,true,factor);
      for(let cut=1;cut<=bars.length;cut++){
        const last=bars[cut-1];if(last.minute!==last.closeMinute-5)continue;
        const prefix=simulateLucid(bars.slice(0,cut),signals,scenario,w,factor,true);
        assert.deepEqual(prefix.trades,run.trades.filter(t=>t.day<=last.day));assert.deepEqual(prefix.days,run.days.filter(d=>d.day<=last.day));audit.accountPrefixes++;
      }
      pair.push(run);
    }
    const windowDiagnostic = diagnostic.map(d => {const ts=d.trades.filter(t=>t.day>=w.start&&t.day<w.end);return {metrics:metrics(ts),netDollars:Math.round(ts.reduce((n,t)=>n+t.netDollars,0)*100)/100};});
    windows.push({start:w.start,end:w.end,complete:true,expected:planned.length,scored:scored.length,normal:clean(pair[0]),stress:clean(pair[1]),diagnostic:{normal:windowDiagnostic[0],stress:windowDiagnostic[1]}});
    privateRuns.push({scenario:scenario.id,window:w,normal:pair[0],stress:pair[1]});
  }
  const complete=windows.filter(w=>w.complete), periodTrades=complete.map(w=>diagnostic[0].trades.filter(t=>t.day>=w.start&&t.day<w.end));
  const normal=metrics(diagnostic[0].trades),stress=metrics(diagnostic[1].trades);
  const checks=[
    {id:'count',label:'Au moins 40 trades de diagnostic',pass:normal.count>=40},
    {id:'windowCount',label:'Au moins 12 trades dans chacune des cinq fenêtres complètes',pass:periodTrades.every(t=>t.length>=12)},
    {id:'positive',label:'Chaque fenêtre complète positive',pass:periodTrades.every(t=>metrics(t).total>0)},
    {id:'pf',label:'Profit factor au moins 1,10 avant arrondi',pass:normal.pf!==null&&normal.pf>=1.1},
    {id:'dd',label:'Drawdown réalisé au plus 8 R',pass:normal.dd<=8},
    {id:'stress',label:'Total positif avec coûts doublés',pass:stress.total>0},
    {id:'account',label:'Aucun breach dans les évaluations simulées aux deux coûts',pass:complete.every(w=>![w.normal.status,w.stress.status].includes('breached'))}
  ];
  privateRuns.push({scenario:scenario.id,diagnostic});
  results.push({...scenario,diagnostic:{normal:clean(diagnostic[0]),stress:clean(diagnostic[1])},windows,checks,researchPassed:checks.every(c=>c.pass),confirmed:false});
}
audit.passed=true;
const report={schema:'jeu15-report-v1',protocol:policy.version,generatedAt:new Date().toISOString(),protocolSha256,source,policy,
  coverage:{expectedSessions,scoredSessions:eligible.length,first:eligible[0].date,last:eligible.at(-1).date,unavailable:unavailable.length,completeWindows:5,blockedWindows:3},results,audit,
  readiness:[{id:'historical',label:'Avantage historique indépendant',ready:false},{id:'feed',label:'Flux MNQ actuel autorisé dans le site',ready:false},{id:'paper',label:'Exécution Paper Trading vérifiée',ready:false},{id:'broker',label:'Connexion broker et contrôles opérationnels',ready:false}],confirmed:false};
const serialize=v=>JSON.stringify(v,(_,x)=>x===Infinity?'Infinity':x,2)+'\n';
await mkdir(outDir,{recursive:true});await writeFile(resolve(outDir,'report.json'),serialize(report));await writeFile(resolve(outDir,'runs-private.json'),serialize({schema:'jeu15-private-v1',protocolSha256,source,runs:privateRuns}));
console.log(serialize({protocolSha256,coverage:report.coverage,results:results.map(s=>({id:s.id,diagnostic:s.diagnostic,accounts:s.windows.filter(w=>w.complete).map(w=>({start:w.start,normal:{status:w.normal.status,net:w.normal.net,day:w.normal.terminalDay,trades:w.normal.trades},stress:{status:w.stress.status,net:w.stress.net,day:w.stress.terminalDay,trades:w.stress.trades}})),checks:s.checks})),audit}));
