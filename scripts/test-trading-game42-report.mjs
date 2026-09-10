import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyPullbackVolumeReport,REPORT42_SHA256} from '../trading/lab/jeu42-report-validation.mjs';
const read=name=>readFile(new URL('../trading/lab/'+name,import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex'),cents=n=>Math.round(n*100)/100;
const sum=(rows,key)=>cents(rows.reduce((s,r)=>s+(r[key]??0),0));
const variants=['baseline','mes-pullback-volume'],costs=['normal','stress'];
test('Game42 published bytes, all79 frozen dependencies and verified private archive are pinned',async()=>{
 const raw=await read('jeu42-report.json'),r=await verifyPullbackVolumeReport(raw);
 assert.equal(raw.length,703710);assert.equal(hash(raw),REPORT42_SHA256);
 assert.equal(r.prePerformanceCommit,'39904d4a5f16d2ce71880c6d127766bca649a9aa');
 const frozen=await read('jeu42-freeze.json');assert.equal(hash(frozen),r.freezeSha256);
 const pins=JSON.parse(frozen).files;assert.equal(Object.keys(pins).length,79);
 for(const [path,pin]of Object.entries(pins))assert.equal(hash(await readFile(new URL('../'+path,import.meta.url))),pin,path);
 assert.equal(hash(await read('jeu40-report.json')),r.referenceReportSha256);
 assert.equal(hash(await read('jeu41-entry-audit.json')),r.entryAuditSha256);
 assert.equal(/"(?:entryTime|exitTime|signalClose|signalOpen|stopPrice|candles|entry|exit|ticker|forecast|csv)"\s*:/.test(raw.toString()),false);
 assert.deepEqual(r.audit,{controls:16,prefixes:656,filterPrefixes:656,contextPrefixes:656,checkedTrades:451,passed:true});
 const manifestRaw=await read('jeu42-archive.json'),m=JSON.parse(manifestRaw);
 assert.equal(hash(manifestRaw),'6715268e5d2817526ddc71b800c3291a687e8a71e1f2997bff3a156fd3fc0903');
 assert.equal(m.prefix,'jeu42/mes-pullback-volume-v1/');assert.equal(m.prePerformanceCommit,r.prePerformanceCommit);assert.equal(m.freezeSha256,r.freezeSha256);
 assert.deepEqual(m.files.map(f=>f.name),['report.json','runs-private.json','arithmetic-audit.json','phase-input-audit.json']);
 assert.equal(m.files[0].sha256,REPORT42_SHA256);assert.equal(m.files[0].bytes,raw.length);
 assert.equal(m.files[1].bytes,1118242);assert.equal(m.files[1].sha256,'dd197ce7c07b73a154b98c403ead94979af281e54a0fb01acb873ea4596d5476');
 const parts=m.files.flatMap(f=>f.parts);assert.equal(parts.length,6);assert.equal(new Set(parts.map(p=>p.key)).size,6);
 for(const p of parts){assert.ok(p.key.startsWith(m.prefix));assert.ok(p.bytes>0&&p.bytes<=60000);assert.match(p.sha256,/^[a-f0-9]{64}$/);}
 const audit=JSON.parse(await read('jeu42-execution-audit.json'));
 assert.equal(audit.passed,true);assert.equal(audit.newReplays,0);assert.equal(audit.checkedTrades,451);assert.equal(audit.checkedDays,656);assert.equal(audit.checkedWeeks,156);
 assert.deepEqual(audit.archiveReadback,{files:4,parts:6,chunks:33,exact:true});assert.equal(audit.phaseInputs.checkedRecords,272);assert.equal(audit.phaseInputs.uniqueMesSignals,68);
 assert.deepEqual(audit.phaseInputs.phaseReasons,{'relative-volume-unavailable':5,'no-separate-counterdirectional-bar':33,'pullback-not-contracted':15,'pullback-contracted':15});
});
test('Game42 reconciles all32 cells, old controls, daily/weekly/market amounts and every comparison',async()=>{
 const r=await verifyPullbackVolumeReport(await read('jeu42-report.json')),old=JSON.parse(await read('jeu40-report.json'));
 let cells=0,controls=0,missing=0;
 for(const v of r.views)for(const cost of costs){
  const c=v.costs[cost],reference=old.views.find(b=>b.month===v.month).costs[cost];cells++;
  assert.equal(v.mode,'funded');assert.equal(v.resetAtStart,true);assert.ok(variants.includes(v.variant));
  assert.equal(c.net,cents(c.balance+c.withdrawnUSD-50000));assert.equal(c.mean,c.trades?cents(c.net/c.trades):null);assert.equal(c.trades,c.wins+c.losses);
  for(const rows of [c.calendar.daily,c.calendar.weeks,c.contributions])for(const key of ['net','trades'])assert.equal(sum(rows,key),c[key]);
  for(const key of ['wins','losses'])assert.equal(sum(c.contributions,key),c[key]);
  for(const d of c.calendar.daily){
   if(d.state==='missing-data'){missing++;assert.ok(['2026-02-25','2026-03-06'].includes(d.day));for(const key of ['net','trades','cumulative','balance','markets'])assert.equal(d[key],null);continue;}
   if(d.net!==null){assert.equal(sum(d.markets,'net'),d.net);assert.equal(sum(d.markets,'trades'),d.trades);assert.ok(d.trades<=2);}
  }
  assert.equal(c.profitGoalAchieved,false);assert.equal(c.personalGoalAchieved,false);assert.equal(c.withdrawnUSD,0);assert.equal(c.receiptEUR,0);
  const k=c.comparison;assert.equal(k.common+k.removed.count,reference.trades);assert.equal(k.common+k.added.count,c.trades);
  assert.equal(k.delta,cents(c.net-reference.net));assert.equal(k.delta,cents(k.commonDelta-k.removed.net+k.added.net));assert.equal(k.commonDelta,0);assert.equal(k.delayedCommon,0);
  assert.equal(k.winnersToLosers,0);assert.equal(k.losersToWinners,0);
  if(v.variant==='baseline'){controls++;for(const [key,value]of Object.entries(reference))assert.deepEqual(c[key],value,`${v.month}/${cost}/${key}`);}
 }
 assert.equal(cells,32);assert.equal(controls,16);assert.equal(missing,8);
 for(const variant of variants)for(const cost of costs){
  const rows=r.views.filter(v=>v.variant===variant).map(v=>v.costs[cost]),s=r.summaries[variant][cost];
  assert.equal(s.totalObserved,sum(rows,'net'));assert.equal(s.trades,sum(rows,'trades'));assert.equal(s.meanObservedMonthly,cents(s.totalObserved/8));assert.equal(s.weightedMeanTrade,cents(s.totalObserved/s.trades));
  assert.equal(s.maxMonthlyDrawdown,Math.max(...rows.map(x=>x.drawdown)));assert.equal(s.fullEightMonthNet,null);assert.equal(s.continuousDrawdown,null);
 }
 assert.equal(r.summaries['mes-pullback-volume'].normal.totalObserved,1589.25);assert.equal(r.summaries['mes-pullback-volume'].stress.totalObserved,1131.25);
 assert.equal(r.review.decision,'not-retained');assert.equal(r.review.descriptiveGatePassed,false);
 assert.deepEqual(r.review.failedCells.map(c=>c.month+'/'+c.cost),['january/normal','january/stress','june/normal','july/normal','august/normal']);
 for(const o of [r,r.review]){assert.equal(o.selection,null);assert.equal(o.independent,false);assert.equal(o.confirmed,false);assert.equal(o.executionAllowed,false);}
});
test('Game42 appends one executed configuration and preserves every older registry object',async()=>{
 const a=JSON.parse(await read('jeu42-execution-audit.json')),p=a.preservedRegistryPrefixes,l=JSON.parse(await read('research-ledger.json')),c=JSON.parse(await read('research-catalog.json'));
 assert.equal(p.ledgerCount,94);assert.equal(p.catalogCount,111);assert.equal(p.sourcesCount,11);
 for(const [rows,count,sha]of [[l.entries,p.ledgerCount,p.ledgerSha256],[c.entries,p.catalogCount,p.catalogSha256],[c.sources,p.sourcesCount,p.sourcesSha256]])assert.equal(hash(JSON.stringify(rows.slice(0,count))),sha);
 assert.equal(l.configurationCount,l.entries.length);assert.equal(c.uniqueConfigurationKeys,c.entries.length);assert.equal(l.entries.length,95);assert.equal(c.entries.length,112);
 for(const rows of [l.entries,c.entries])assert.equal(new Set(rows.map(e=>e.executionKey)).size,rows.length);
 const added=l.entries.filter(e=>e.game===42);assert.equal(added.length,1);assert.equal(added[0].configuration,'mes-pullback-volume/eight-months/funded');assert.equal(added[0].selected,false);assert.equal(added[0].confirmed,false);
 assert.equal(l.independentConfirmations,0);assert.equal(c.independentConfirmations,0);
});
test('Game42 rejects corrupted report bytes and its visible monthly table equals the immutable report',async()=>{
 const raw=await read('jeu42-report.json');await assert.rejects(()=>verifyPullbackVolumeReport(Buffer.concat([raw,Buffer.from(' ')])));
 const r=await verifyPullbackVolumeReport(raw),html=(await read('index.html')).toString();
 assert.equal((html.match(/id="study42Game"/g)||[]).length,1);
 for(const v of r.views.filter(v=>v.variant==='mes-pullback-volume')){
  const reference=r.views.find(b=>b.variant==='baseline'&&b.month===v.month),row=html.match(new RegExp('<tr data-study42-month="'+v.month+'">([\\s\\S]*?)</tr>'))?.[1];assert.ok(row);
  const numbers=[...row.matchAll(/<td>([^<]+)<\/td>/g)].map(m=>Number(m[1].replace(/[$\s]/g,'').replace('−','-').replace(',','.')));
  assert.deepEqual(numbers,costs.flatMap(cost=>[reference.costs[cost].net,v.costs[cost].net]));
 }
});
