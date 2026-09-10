import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyEightMonthReport,REPORT40_SHA256} from '../trading/lab/jeu40-report-validation.mjs';
import {verifyConfidenceReport} from '../trading/lab/jeu37-report-validation.mjs';

const read=path=>readFile(new URL('../'+path,import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const cents=value=>Math.round(value*100)/100;
const sum=(rows,key)=>cents(rows.reduce((total,row)=>total+(row[key]??0),0));
const costs=['normal','stress'],symbols=['MNQ','MES','MYM','MGC'];
const months=['january','february','march','april','may','june','july','august'];
const expectedCounts=[20,19,22,21,20,21,22,21],availableCounts=[20,18,21,21,20,21,22,21];
const missing=[{day:'2026-02-25',symbols:['MGC']},{day:'2026-03-06',symbols:['MES','MGC','MNQ']}];
const statistics=['trades','net','wins','losses','mean','averageWin','averageLoss','best','worst','winRate'];
const aggregateKeys=['trades','net','wins','losses'];
const freezeCommit='e0eb36dc7c787d9071e32882846c647f1088f04c';

function checkStatistics(row){
 assert.ok(Number.isSafeInteger(row.trades)&&row.trades>=0);
 assert.ok(Number.isSafeInteger(row.wins)&&row.wins>=0&&Number.isSafeInteger(row.losses)&&row.losses>=0);
 assert.ok(row.wins+row.losses<=row.trades,'A flat trade must not be invented as a win or loss');
 assert.equal(row.mean,row.trades?cents(row.net/row.trades):null);
 assert.equal(row.winRate,row.trades?row.wins/row.trades:null);
 if(!row.trades){assert.equal(row.net,0);for(const key of ['averageWin','averageLoss','best','worst'])assert.equal(row[key],null);}
 else{assert.ok(row.best>=row.worst);assert.equal(row.averageWin===null,row.wins===0);assert.equal(row.averageLoss===null,row.losses===0);}
}

test('Game40 public report pins all52 frozen dependencies and the three private archive identities',async()=>{
 const raw=await read('trading/lab/jeu40-report.json'),report=await verifyEightMonthReport(raw);
 assert.equal(raw.length,329827);assert.equal(REPORT40_SHA256,'fd57be160b7fd20f60449f13f379da138687acc1174f2c01d25889c7475fa6b0');
 const frozen=await read('trading/lab/jeu40-freeze.json'),pins=JSON.parse(frozen).files;
 assert.equal(Object.keys(pins).length,52);
 for(const [path,sha]of Object.entries(pins))assert.equal(hash(await read(path)),sha,path);
 assert.equal(hash(raw),REPORT40_SHA256);assert.equal(hash(frozen),report.freezeSha256);assert.equal(report.prePerformanceCommit,freezeCommit);
 const archive=JSON.parse(await read('trading/lab/jeu40-archive.json')),source=JSON.parse(await read('trading/lab/jeu40-source.json'));
 assert.equal(archive.namespace,'TRADING_DATASETS');assert.match(archive.prefix,/^jeu40\/[^/]+\/$/);
 assert.equal(archive.prePerformanceCommit,freezeCommit);assert.equal(archive.freezeSha256,report.freezeSha256);
 assert.deepEqual(archive.files.map(file=>file.name).sort(),['report.json','runs-private.json','source-probes.json']);
 const publicFile=archive.files.find(file=>file.name==='report.json'),probes=archive.files.find(file=>file.name==='source-probes.json');
 assert.equal(publicFile.bytes,raw.length);assert.equal(publicFile.sha256,hash(raw));
 assert.equal(probes.bytes,source.inputs.probes.bytes);assert.equal(probes.sha256,source.inputs.probes.sha256);assert.equal(probes.sha256,report.sourceProbesSha256);
 const keys=[];
 for(const file of archive.files){
  assert.ok(Number.isSafeInteger(file.bytes)&&file.bytes>0);assert.match(file.sha256,/^[a-f0-9]{64}$/);
  assert.equal(file.encoding,'gzip+base64');assert.ok(file.parts.length>0);
  for(const part of file.parts){assert.ok(part.key.startsWith(archive.prefix+file.name+'.gz.b64.'));assert.ok(Number.isSafeInteger(part.bytes)&&part.bytes>0&&part.bytes<=60000);assert.match(part.sha256,/^[a-f0-9]{64}$/);keys.push(part.key);}
 }
 assert.equal(keys.length,new Set(keys).size);assert.equal(archive.confirmed,false);assert.equal(archive.executionAllowed,false);
 assert.equal(/"(?:entryTime|exitTime|signalClose|signalOpen|stopPrice|candles|entry|exit|ticker|forecast|csv)"\s*:/.test(raw.toString()),false,'Public report must contain aggregates only');
});

test('Game40 all16 cells reconcile reset accounts, missing dates, observed daily/weekly/market sums and the six archived controls',async()=>{
 const report=await verifyEightMonthReport(await read('trading/lab/jeu40-report.json'));
 const reference=await verifyConfidenceReport(await read('trading/lab/jeu37-report.json'));
 assert.equal(report.executionCount,16);assert.equal(report.newConfigurations,1);assert.equal(report.newStrategyVariants,0);
 assert.deepEqual(report.variants.map(v=>v.id),['fixed100']);assert.deepEqual(report.views.map(v=>v.month),months);
 assert.deepEqual(report.coverage.map(c=>c.expected),expectedCounts);assert.deepEqual(report.coverage.map(c=>c.available),availableCounts);
 assert.deepEqual(report.coverage.flatMap(c=>c.missing),missing);
 for(const key of ['prefixes','filterPrefixes','contextPrefixes'])assert.equal(report.audit[key],328);
 assert.equal(report.audit.controls,6);assert.equal(report.audit.passed,true);
 let cells=0,dailyRows=0,excludedRows=0,controls=0,checkedTrades=0;
 for(const [i,view]of report.views.entries()){
  assert.equal(view.variant,'fixed100');assert.equal(view.mode,'funded');assert.equal(view.resetAtStart,true);
  assert.deepEqual(view.period,{start:`2026-${String(i+1).padStart(2,'0')}-01`,end:`2026-${String(i+2).padStart(2,'0')}-01`});
  assert.equal(view.coverage.expected,expectedCounts[i]);assert.equal(view.coverage.available,availableCounts[i]);
  assert.equal(view.coverage.complete,!['february','march'].includes(view.month));assert.deepEqual(Object.keys(view.costs),costs);
  for(const cost of costs){
   const cell=view.costs[cost];cells++;checkStatistics(cell);checkedTrades+=cell.trades;
   assert.equal(cell.coverageComplete,view.coverage.complete);assert.equal(cell.partialResult,!view.coverage.complete);
   assert.equal(cell.calendar.complete,view.coverage.complete);assert.equal(cell.calendar.missingSessions,view.coverage.missing.length);
   assert.equal(cents(cell.balance+cell.withdrawnUSD-50000),cell.net);assert.equal(cell.executionAllowed,false);
   assert.equal(cell.calendar.daily.length,view.coverage.expected);assert.equal(new Set(cell.calendar.daily.map(d=>d.day)).size,view.coverage.expected);
   for(const key of ['net','trades']){assert.equal(sum(cell.calendar.daily,key),cell[key]);assert.equal(sum(cell.calendar.weeks,key),cell[key]);}
   assert.equal(sum(cell.calendar.daily,'receiptEUR'),cell.receiptEUR);assert.equal(sum(cell.calendar.daily,'payoutGrossUSD'),cell.withdrawnUSD);
   assert.deepEqual(cell.contributions.map(m=>m.symbol),symbols);
   for(const key of aggregateKeys)assert.equal(sum(cell.contributions,key),cell[key]);
   assert.equal(cell.profitGoalAchieved,cell.profitGoalDay!==null);assert.equal(cell.personalGoalAchieved,cell.goalDay!==null);
   let cumulative=0,balance=50000,peak=0,dailyDrawdown=0;
   for(const d of cell.calendar.daily){
    dailyRows++;assert.ok(d.day>=view.period.start&&d.day<view.period.end);
    const gap=view.coverage.missing.find(m=>m.day===d.day);
    if(gap){
     excludedRows++;assert.equal(d.state,'missing-data');assert.deepEqual(d.missingMarkets,gap.symbols);
     for(const key of ['net','trades','cumulative','balance','floor','receiptEUR','payoutGrossUSD','averageRiskUSD','markets'])assert.equal(d[key],null,key);
     continue;
    }
    assert.notEqual(d.state,'missing-data');
    if(d.net===null){assert.ok(d.state.startsWith('stopped-'));assert.ok(cell.terminalDay&&d.day>cell.terminalDay);assert.equal(d.trades,null);assert.equal(d.balance,null);continue;}
    assert.ok(Number.isSafeInteger(d.trades)&&d.trades>=0&&d.trades<=2);
    cumulative=cents(cumulative+d.net);balance=cents(balance+d.net-d.payoutGrossUSD);
    assert.equal(d.cumulative,cumulative);assert.equal(d.balance,balance);assert.equal(d.state,d.trades?'traded':'no-trade');
    peak=Math.max(peak,cumulative);dailyDrawdown=Math.max(dailyDrawdown,cents(peak-cumulative));
    assert.equal(d.averageRiskUSD===null,d.trades===0);if(d.trades)assert.ok(d.averageRiskUSD>0&&d.averageRiskUSD<=100);else assert.equal(d.net,0);
    assert.equal(sum(d.markets,'net'),d.net);assert.equal(sum(d.markets,'trades'),d.trades);for(const market of d.markets)checkStatistics(market);
   }
   assert.equal(balance,cell.balance);assert.equal(cumulative,cell.net);assert.ok(cell.drawdown>=dailyDrawdown);
   for(const w of cell.calendar.weeks){
    const days=cell.calendar.daily.filter(d=>d.week===w.week),observed=days.filter(d=>d.net!==null),last=observed.at(-1);
    assert.equal(w.expected,days.length);assert.equal(w.observed,observed.length);assert.equal(w.missing,days.filter(d=>d.state==='missing-data').length);
    assert.equal(w.complete,observed.length===days.length);assert.equal(w.net,observed.length?sum(observed,'net'):null);
    assert.equal(w.trades,sum(observed,'trades'));assert.equal(w.receiptEUR,observed.length?sum(observed,'receiptEUR'):null);
    assert.equal(w.cumulative,last?.cumulative??null);assert.equal(w.start,days[0].day);assert.equal(w.end,days.at(-1).day);
   }
   for(const market of cell.contributions){
    checkStatistics(market);const daily=cell.calendar.daily.filter(d=>d.net!==null).map(d=>d.markets.find(m=>m.symbol===market.symbol));
    for(const key of aggregateKeys)assert.equal(sum(daily,key),market[key]);if(market.symbol==='MYM')assert.equal(market.trades,0);
   }
   if(i>=5){
    controls++;const old=reference.views.find(v=>v.month===view.month&&v.variant==='fixed100').costs[cost];
    for(const key of [...statistics,'drawdown','status','balance','floor','withdrawnUSD','receiptEUR','profitGoalAchieved','personalGoalAchieved','goalDay','profitGoalDay','contributions','denied'])assert.deepEqual(cell[key],old[key],`${view.month}/${cost}/${key}`);
    assert.equal(cell.calendar.daily.length,old.calendar.daily.length);
    for(const d of cell.calendar.daily){
     const saved=old.calendar.daily.find(x=>x.day===d.day);assert.ok(saved);
     for(const [key,value]of Object.entries(saved))if(key!=='markets')assert.deepEqual(d[key],value,`${view.month}/${cost}/${d.day}/${key}`);
     for(const market of saved.markets??[]){const enriched=d.markets.find(m=>m.symbol===market.symbol);for(const [key,value]of Object.entries(market))assert.deepEqual(enriched[key],value);}
    }
    for(const w of cell.calendar.weeks){const saved=old.calendar.weeks.find(x=>x.week===w.week);assert.ok(saved);for(const [key,value]of Object.entries(saved))assert.deepEqual(w[key],value,`${view.month}/${cost}/${w.week}/${key}`);}
   }
  }
 }
 assert.deepEqual({cells,dailyRows,excludedRows,controls},{cells:16,dailyRows:332,excludedRows:4,controls:6});assert.equal(report.audit.checkedTrades,checkedTrades);
});

test('Game40 observed eight-month summaries retain partial coverage and use weighted trade statistics; corrupt reports fail validation',async()=>{
 const raw=await read('trading/lab/jeu40-report.json'),report=await verifyEightMonthReport(raw);
 for(const cost of costs){
  const rows=report.views.map(v=>v.costs[cost]),s=report.summaries[cost],nets=rows.map(r=>r.net).sort((a,b)=>a-b),total=sum(rows,'net'),trades=sum(rows,'trades'),wins=sum(rows,'wins');
  assert.equal(s.months,8);assert.equal(s.completeMonths,6);assert.equal(s.incompleteMonths,2);assert.equal(s.expectedSessions,166);assert.equal(s.availableSessions,164);
  assert.equal(s.observedSessions,rows.reduce((n,r)=>n+r.calendar.daily.filter(d=>d.net!==null).length,0));
  assert.equal(s.totalObserved,total);assert.equal(s.cumulativeResetSum,total);assert.equal(s.meanObservedMonthly,cents(total/8));
  assert.equal(s.medianObservedMonthly,cents((nets[3]+nets[4])/2));assert.equal(s.worstObservedMonth,nets[0]);assert.equal(s.negativeMonths,nets.filter(n=>n<0).length);
  assert.equal(s.trades,trades);assert.equal(s.wins,wins);assert.equal(s.losses,sum(rows,'losses'));assert.equal(s.weightedMeanTrade,trades?cents(total/trades):null);assert.equal(s.weightedWinRate,trades?wins/trades:null);
  assert.equal(s.maxMonthlyDrawdown,Math.max(...rows.map(r=>r.drawdown)));assert.equal(s.fullEightMonthNet,null);assert.equal(s.fullEightMonthMean,null);assert.equal(s.continuousAccount,false);assert.equal(s.continuousDrawdown,null);
  assert.equal(s.receiptEUR,sum(rows,'receiptEUR'));assert.equal(s.withdrawnUSD,sum(rows,'withdrawnUSD'));assert.equal(s.personalGoals,rows.filter(r=>r.personalGoalAchieved).length);assert.equal(s.profitGoals,rows.filter(r=>r.profitGoalAchieved).length);
  assert.equal(s.independent,false);assert.equal(s.executionAllowed,false);
 }
 assert.equal(report.selection,null);assert.equal(report.confirmed,false);assert.equal(report.independent,false);assert.equal(report.executionAllowed,false);
 const altered=JSON.parse(raw);altered.views[1].costs.normal.calendar.daily.find(d=>d.state==='missing-data').net=0;altered.summaries.normal.fullEightMonthNet=altered.summaries.normal.totalObserved;
 for(const bad of [Buffer.from(JSON.stringify(altered)),raw.subarray(0,raw.length-1),Buffer.from('<html>Login</html>')])await assert.rejects(()=>verifyEightMonthReport(bad));
});

test('Game40 adds one executed configuration and preserves all earlier ledger and catalogue entries',async()=>{
 const ledger=JSON.parse(await read('trading/lab/research-ledger.json')),catalog=JSON.parse(await read('trading/lab/research-catalog.json'));
 // These prefix fingerprints were recorded before Game40 performance. New
 // concurrent entries can be appended without changing earlier experiments.
 assert.equal(hash(JSON.stringify(ledger.entries.slice(0,92))),'157c58bb936362561608596310dcd3cb9d9e749c548f26642af24b84ddd1b75e');
 assert.equal(hash(JSON.stringify(catalog.entries.slice(0,109))),'eeeb7c13bde04a9262d1af3553eafa8b1a66ff076293630590f269e6a1ebf59f');
 assert.equal(hash(JSON.stringify(catalog.sources.slice(0,9))),'7dc965062c878995bb5801020d073397c3b85bcf2bc00a25ac8abca0412dcbf0');
 assert.equal(ledger.configurationCount,ledger.entries.length);assert.equal(catalog.uniqueConfigurationKeys,catalog.entries.length);
 assert.equal(new Set(ledger.entries.map(e=>e.executionKey)).size,ledger.entries.length);assert.equal(new Set(catalog.entries.map(e=>e.executionKey)).size,catalog.entries.length);
 const added=ledger.entries.filter(e=>e.game===40);assert.equal(added.length,1);const entry=added[0];
 assert.equal(entry.report,'jeu40-report.json');assert.equal(entry.selected,false);assert.equal(entry.confirmed,false);
 assert.equal(entry.start,'2026-01-01');assert.equal(entry.end,'2026-09-01');
 const record=catalog.entries.find(e=>e.executionKey===entry.executionKey);assert.ok(record);assert.equal(record.confirmed,false);
 const sources=catalog.sources.filter(s=>s.reportSha256===REPORT40_SHA256);assert.equal(sources.length,1);assert.equal(sources[0].configurationCount,1);assert.equal(sources[0].newStrategyVariants,0);assert.ok(record.sources.includes(sources[0].namespace));
 assert.equal(ledger.independentConfirmations,0);assert.equal(catalog.independentConfirmations,0);
});
