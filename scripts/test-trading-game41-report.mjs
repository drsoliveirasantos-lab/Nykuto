import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyNetRewardReport,REPORT41_SHA256} from '../trading/lab/jeu41-report-validation.mjs';
import {verifyEightMonthReport,REPORT40_SHA256} from '../trading/lab/jeu40-report-validation.mjs';

const read=path=>readFile(new URL('../'+path,import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const cents=n=>Math.round(n*100)/100;
const sum=(rows,key)=>cents(rows.reduce((n,r)=>n+(r[key]??0),0));
const costs=['normal','stress'],variants=['baseline','mes-net15'],symbols=['MNQ','MES','MYM','MGC'];
const months=['january','february','march','april','may','june','july','august'];
const expectedCounts=[20,19,22,21,20,21,22,21],availableCounts=[20,18,21,21,20,21,22,21];
const missing=[{day:'2026-02-25',symbols:['MGC']},{day:'2026-03-06',symbols:['MES','MGC','MNQ']}];
const aggregateKeys=['trades','net','wins','losses'];
const freezeCommit='73aa1a6208a85f5a622e5d81f2675cd561ca0bb2';

test('Game41 archive identities and exactly one registry addition preserve every earlier experiment',async()=>{
 const raw=await read('trading/lab/jeu41-report.json'),report=await verifyNetRewardReport(raw);
 const manifestRaw=await read('trading/lab/jeu41-archive.json'),archive=JSON.parse(manifestRaw),audit=JSON.parse(await read('trading/lab/jeu41-execution-audit.json'));
 assert.equal(hash(manifestRaw),'312d0a56709698f6372507496131a32746347252c788947e0487a50dad0485f5');
 assert.equal(archive.prePerformanceCommit,freezeCommit);assert.equal(archive.freezeSha256,report.freezeSha256);assert.equal(archive.namespace,'TRADING_DATASETS');assert.equal(archive.prefix,'jeu41/mes-net-reward-v1/');
 assert.deepEqual(archive.files.map(f=>f.name),['entry-audit.json','report.json','runs-private.json']);
 const identities=[['entry-audit.json',200804,report.entryAuditSha256],['report.json',700142,REPORT41_SHA256],['runs-private.json',1073114,'06db6f39fae5c0009b5e55da69310863fe4f8eb03b2d6cd2ea530d2749e9516c']];
 const keys=[];for(const [name,bytes,sha]of identities){const file=archive.files.find(f=>f.name===name);assert.equal(file.bytes,bytes);assert.equal(file.sha256,sha);assert.equal(file.encoding,'gzip+base64');for(const part of file.parts){assert.ok(part.key.startsWith(archive.prefix+name+'.gz.b64.'));assert.ok(part.bytes>0&&part.bytes<=60000);assert.match(part.sha256,/^[a-f0-9]{64}$/);keys.push(part.key);}}
 assert.equal(keys.length,4);assert.equal(new Set(keys).size,4);assert.equal(archive.executionAllowed,false);assert.equal(archive.confirmed,false);
 assert.equal(audit.sourceReportSha256,REPORT41_SHA256);assert.equal(audit.passed,true);assert.equal(audit.checkedTrades,434);assert.equal(audit.exactWholeControls,16);assert.equal(audit.newReplays,0);assert.equal(audit.newInferences,0);assert.deepEqual(audit.archiveReadback,{files:3,parts:4,chunks:16,exact:true});
 const ledger=JSON.parse(await read('trading/lab/research-ledger.json')),catalog=JSON.parse(await read('trading/lab/research-catalog.json'));
 assert.equal(hash(JSON.stringify(ledger.entries.slice(0,93))),'3fec3cc3ac11965fa111f6f360e680aa856475d21361d7b9e1c40bc36ba2a823');
 assert.equal(hash(JSON.stringify(catalog.entries.slice(0,110))),'11f382bf779d927cb22192aee730acefab93d5261b5424ae3f4f41fa11cc4dcf');
 assert.equal(hash(JSON.stringify(catalog.sources.slice(0,10))),'7c6c3573e0b0c534af52b67d8ab35cf85944a02c2c5e9234503b7915c5739d99');
 assert.equal(ledger.configurationCount,ledger.entries.length);assert.equal(catalog.uniqueConfigurationKeys,catalog.entries.length);
 assert.equal(new Set(ledger.entries.map(e=>e.executionKey)).size,ledger.entries.length);assert.equal(new Set(catalog.entries.map(e=>e.executionKey)).size,catalog.entries.length);
 const added=ledger.entries.filter(e=>e.game===41);assert.equal(added.length,1);assert.equal(added[0].configuration,'mes-net15/eight-months/funded');assert.equal(added[0].report,'jeu41-report.json');assert.equal(added[0].selected,false);assert.equal(added[0].confirmed,false);assert.equal(added[0].freezeSha256,report.freezeSha256);
 const source=catalog.sources.find(s=>s.namespace==='game41-mes-net-reward');assert.equal(source.configurationCount,1);assert.equal(source.reportSha256,REPORT41_SHA256);assert.ok(catalog.entries.find(e=>e.executionKey===added[0].executionKey).sources.includes(source.namespace));
 assert.equal(ledger.independentConfirmations,0);assert.equal(catalog.independentConfirmations,0);
});

function checkStatistics(row){
 assert.ok(Number.isSafeInteger(row.trades)&&row.trades>=0);
 assert.ok(Number.isSafeInteger(row.wins)&&row.wins>=0&&Number.isSafeInteger(row.losses)&&row.losses>=0);
 assert.ok(row.wins+row.losses<=row.trades);assert.equal(row.mean,row.trades?cents(row.net/row.trades):null);
 assert.equal(row.winRate,row.trades?row.wins/row.trades:null);
 if(!row.trades){assert.equal(row.net,0);for(const key of ['averageWin','averageLoss','best','worst'])assert.equal(row[key],null);}
 else{assert.ok(row.best>=row.worst);assert.equal(row.averageWin===null,row.wins===0);assert.equal(row.averageLoss===null,row.losses===0);}
}
function checkComparison(c,reference,candidate){
 for(const key of ['common','delayedCommon','winnersToLosers','losersToWinners'])assert.ok(Number.isSafeInteger(c[key])&&c[key]>=0);
 for(const group of [c.removed,c.added]){
  for(const key of ['count','wins','losses'])assert.ok(Number.isSafeInteger(group[key])&&group[key]>=0);
  assert.ok(group.wins+group.losses<=group.count);if(!group.count)assert.equal(group.net,0);
 }
 assert.equal(c.common+c.removed.count,reference.trades);assert.equal(c.common+c.added.count,candidate.trades);
 assert.equal(c.delta,cents(candidate.net-reference.net));assert.equal(c.delta,cents(c.commonDelta-c.removed.net+c.added.net));
 assert.equal(c.delayedCommon,0,'The new veto must not delay common entries');
 assert.ok(c.winnersToLosers+c.losersToWinners<=c.common);
}

test('Game41 pins the completed report, all67 pre-performance dependencies and its exact Game40 source identity',async()=>{
 const raw=await read('trading/lab/jeu41-report.json'),report=await verifyNetRewardReport(raw);
 assert.equal(raw.length,700142);assert.equal(REPORT41_SHA256,'57126d9f313c03b63e73be2e531a07670e2cd62d1b04fe49467e45f297f6b559');assert.equal(hash(raw),REPORT41_SHA256);
 const frozen=await read('trading/lab/jeu41-freeze.json'),pins=JSON.parse(frozen).files;
 assert.equal(Object.keys(pins).length,67);for(const [path,sha]of Object.entries(pins))assert.equal(hash(await read(path)),sha,path);
 assert.equal(report.prePerformanceCommit,freezeCommit);assert.equal(report.freezeSha256,hash(frozen));
 const source=JSON.parse(await read('trading/lab/jeu41-source.json')),entryAudit=await read('trading/lab/jeu41-entry-audit.json'),reference=await read('trading/lab/jeu40-report.json');
 assert.equal(hash(entryAudit),report.entryAuditSha256);assert.equal(entryAudit.length,source.inputs.entryAudit.bytes);assert.equal(hash(entryAudit),source.inputs.entryAudit.sha256);
 assert.equal(hash(reference),REPORT40_SHA256);assert.equal(report.referenceReportSha256,REPORT40_SHA256);assert.equal(source.inputs.priorReport.sha256,REPORT40_SHA256);assert.equal(reference.length,source.inputs.priorReport.bytes);
 assert.equal(report.executionCount,32);assert.equal(report.newConfigurations,1);assert.equal(report.views.length,16);
 assert.deepEqual(report.variants.map(v=>v.id),variants);assert.deepEqual(report.audit,{controls:16,prefixes:656,filterPrefixes:656,contextPrefixes:656,checkedTrades:434,passed:true});
 assert.equal(/"(?:entryTime|exitTime|signalClose|signalOpen|stopPrice|candles|entry|exit|ticker|forecast|csv)"\s*:/.test(raw.toString()),false,'Publish aggregate observations only');
});

test('Game41 all32 cells reconcile monthly resets, missing days, daily/weekly/market sums and sixteen entire public Game40 controls',async()=>{
 const report=await verifyNetRewardReport(await read('trading/lab/jeu41-report.json'));
 const reference=await verifyEightMonthReport(await read('trading/lab/jeu40-report.json'));
 assert.deepEqual(report.coverage.map(c=>c.expected),expectedCounts);assert.deepEqual(report.coverage.map(c=>c.available),availableCounts);assert.deepEqual(report.coverage.flatMap(c=>c.missing),missing);
 assert.deepEqual(report.views.map(v=>v.month+'/'+v.variant),months.flatMap(m=>variants.map(v=>m+'/'+v)));
 let cells=0,dailyRows=0,excludedRows=0,controls=0,checkedTrades=0;
 for(const view of report.views){
  const i=months.indexOf(view.month);assert.ok(i>=0);assert.equal(view.mode,'funded');assert.equal(view.resetAtStart,true);
  assert.deepEqual(view.period,{start:`2026-${String(i+1).padStart(2,'0')}-01`,end:`2026-${String(i+2).padStart(2,'0')}-01`});
  assert.equal(view.coverage.expected,expectedCounts[i]);assert.equal(view.coverage.available,availableCounts[i]);assert.equal(view.coverage.complete,!['february','march'].includes(view.month));
  assert.deepEqual(Object.keys(view.costs),costs);
  for(const cost of costs){
   const cell=view.costs[cost],old=reference.views.find(v=>v.month===view.month).costs[cost];
   cells++;checkedTrades+=cell.trades;checkStatistics(cell);
   assert.equal(cell.coverageComplete,view.coverage.complete);assert.equal(cell.partialResult,!view.coverage.complete);assert.equal(cell.calendar.complete,view.coverage.complete);assert.equal(cell.calendar.missingSessions,view.coverage.missing.length);
   assert.equal(cents(cell.balance+cell.withdrawnUSD-50000),cell.net);assert.equal(cell.executionAllowed,false);
   assert.equal(cell.calendar.daily.length,view.coverage.expected);assert.equal(new Set(cell.calendar.daily.map(d=>d.day)).size,view.coverage.expected);
   for(const key of ['net','trades']){assert.equal(sum(cell.calendar.daily,key),cell[key]);assert.equal(sum(cell.calendar.weeks,key),cell[key]);}
   assert.equal(sum(cell.calendar.daily,'receiptEUR'),cell.receiptEUR);assert.equal(sum(cell.calendar.daily,'payoutGrossUSD'),cell.withdrawnUSD);
   assert.deepEqual(cell.contributions.map(m=>m.symbol),symbols);for(const key of aggregateKeys)assert.equal(sum(cell.contributions,key),cell[key]);
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
    assert.equal(w.complete,observed.length===days.length);assert.equal(w.net,observed.length?sum(observed,'net'):null);assert.equal(w.trades,sum(observed,'trades'));
    assert.equal(w.receiptEUR,observed.length?sum(observed,'receiptEUR'):null);assert.equal(w.cumulative,last?.cumulative??null);assert.equal(w.start,days[0].day);assert.equal(w.end,days.at(-1).day);
   }
   for(const market of cell.contributions){
    checkStatistics(market);const daily=cell.calendar.daily.filter(d=>d.net!==null).map(d=>d.markets.find(m=>m.symbol===market.symbol));
    for(const key of aggregateKeys)assert.equal(sum(daily,key),market[key]);if(market.symbol==='MYM')assert.equal(market.trades,0);
   }
   if(view.variant==='baseline'){
    controls++;for(const [key,value]of Object.entries(old))assert.deepEqual(cell[key],value,`${view.month}/${cost}/${key}`);
    assert.equal(cell.comparison.delta,0);assert.equal(cell.comparison.common,cell.trades);assert.equal(cell.comparison.removed.count,0);assert.equal(cell.comparison.added.count,0);
   }
  }
 }
 assert.deepEqual({cells,dailyRows,excludedRows,controls,checkedTrades},{cells:32,dailyRows:664,excludedRows:8,controls:16,checkedTrades:434});
});

test('Game41 every entry comparison reconciles removed winners, avoided losers, new admissions and market effects; only MES receives a veto',async()=>{
 const report=await verifyNetRewardReport(await read('trading/lab/jeu41-report.json'));
 for(const view of report.views)for(const cost of costs){
  const cell=view.costs[cost],base=report.views.find(v=>v.month===view.month&&v.variant==='baseline').costs[cost];
  checkComparison(cell.comparison,base,cell);assert.deepEqual(cell.marketComparisons.map(m=>m.symbol),symbols);
  for(const m of cell.marketComparisons)checkComparison(m,base.contributions.find(x=>x.symbol===m.symbol),cell.contributions.find(x=>x.symbol===m.symbol));
  for(const key of ['common','delayedCommon','commonDelta','delta','winnersToLosers','losersToWinners'])assert.equal(sum(cell.marketComparisons,key),cell.comparison[key]);
  for(const group of ['removed','added'])for(const key of ['count','wins','losses','net'])assert.equal(sum(cell.marketComparisons.map(m=>m[group]),key),cell.comparison[group][key]);
  assert.deepEqual(cell.filter.byMarket.map(m=>m.symbol),symbols);assert.equal(sum(cell.filter.byMarket,'signals'),cell.filter.signals);assert.equal(sum(cell.filter.byMarket,'blocked'),cell.filter.blocked);
  for(const m of cell.filter.byMarket){assert.ok(Number.isSafeInteger(m.signals)&&m.signals>=0);assert.ok(Number.isSafeInteger(m.blocked)&&m.blocked>=0&&m.blocked<=m.signals);if(m.symbol!=='MES'||view.variant==='baseline')assert.equal(m.blocked,0);}
 }
 const candidate=report.views.filter(v=>v.variant==='mes-net15');
 assert.deepEqual(candidate.map(v=>v.costs.normal.net),[487.25,663.25,-297.5,518.75,-53.75,1010,176,-167]);
 assert.deepEqual(candidate.map(v=>v.costs.stress.net),[-88.5,511.75,-193,303.75,44.25,763.5,-303.5,-230.5]);
});

test('Game41 weighted eight-month summaries and the sixteen-cell decision keep partial coverage and reject the globally weaker stress outcome',async()=>{
 const raw=await read('trading/lab/jeu41-report.json'),report=await verifyNetRewardReport(raw);
 for(const variant of variants)for(const cost of costs){
  const rows=report.views.filter(v=>v.variant===variant).map(v=>v.costs[cost]),s=report.summaries[variant][cost],nets=rows.map(r=>r.net).sort((a,b)=>a-b),total=sum(rows,'net'),trades=sum(rows,'trades'),wins=sum(rows,'wins');
  assert.equal(s.months,8);assert.equal(s.completeMonths,6);assert.equal(s.incompleteMonths,2);assert.equal(s.expectedSessions,166);assert.equal(s.availableSessions,164);
  assert.equal(s.observedSessions,rows.reduce((n,r)=>n+r.calendar.daily.filter(d=>d.net!==null).length,0));
  assert.equal(s.totalObserved,total);assert.equal(s.cumulativeResetSum,total);assert.equal(s.meanObservedMonthly,cents(total/8));
  assert.equal(s.medianObservedMonthly,cents((nets[3]+nets[4])/2));assert.equal(s.worstObservedMonth,nets[0]);assert.equal(s.negativeMonths,nets.filter(n=>n<0).length);
  assert.equal(s.trades,trades);assert.equal(s.wins,wins);assert.equal(s.losses,sum(rows,'losses'));assert.equal(s.weightedMeanTrade,trades?cents(total/trades):null);assert.equal(s.weightedWinRate,trades?wins/trades:null);
  assert.equal(s.maxMonthlyDrawdown,Math.max(...rows.map(r=>r.drawdown)));assert.equal(s.fullEightMonthNet,null);assert.equal(s.fullEightMonthMean,null);assert.equal(s.continuousAccount,false);assert.equal(s.continuousDrawdown,null);
  assert.equal(s.receiptEUR,sum(rows,'receiptEUR'));assert.equal(s.withdrawnUSD,sum(rows,'withdrawnUSD'));assert.equal(s.personalGoals,rows.filter(r=>r.personalGoalAchieved).length);assert.equal(s.profitGoals,rows.filter(r=>r.profitGoalAchieved).length);
  assert.equal(s.independent,false);assert.equal(s.executionAllowed,false);
 }
 const cells=report.views.filter(v=>v.variant==='mes-net15').flatMap(v=>costs.map(cost=>{
  const cell=v.costs[cost],base=report.views.find(b=>b.month===v.month&&b.variant==='baseline').costs[cost];
  return {month:v.month,cost,net:cell.net,delta:cents(cell.net-base.net),drawdown:cell.drawdown,referenceDrawdown:base.drawdown,status:cell.status};
 }));
 const checks={netNondecreasing:cells.every(c=>c.delta>=0),drawdownNonincreasing:cells.every(c=>c.drawdown<=c.referenceDrawdown),strictNetImprovement:cells.some(c=>c.delta>0),noAccountBreach:cells.every(c=>c.status!=='breached')};
 assert.deepEqual(report.review.checks,checks);assert.equal(report.review.descriptiveGatePassed,Object.values(checks).every(Boolean));
 assert.deepEqual(report.review.failedCells,cells.filter(c=>c.delta<0||c.drawdown>c.referenceDrawdown||c.status==='breached'));
 assert.equal(report.review.failedCells.length,7);assert.equal(report.review.decision,'not-retained');assert.equal(report.review.descriptiveGatePassed,false);
 for(const o of [report,report.review]){assert.equal(o.selection,null);assert.equal(o.confirmed,false);assert.equal(o.independent,false);assert.equal(o.executionAllowed,false);}
 const altered=JSON.parse(raw);altered.views.find(v=>v.month==='february').costs.normal.calendar.daily.find(d=>d.state==='missing-data').net=0;
 for(const bad of [Buffer.from(JSON.stringify(altered)),raw.subarray(0,raw.length-1),Buffer.from('<html>Login</html>')])await assert.rejects(()=>verifyNetRewardReport(bad));
});
