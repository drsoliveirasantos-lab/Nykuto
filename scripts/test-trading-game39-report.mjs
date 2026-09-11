import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyStudyReport,REPORT39_SHA256} from '../trading/lab/jeu39-report-validation.mjs';

const read=path=>readFile(new URL('../'+path,import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const cents=value=>Math.round(value*100)/100;
const sum=(rows,key)=>cents(rows.reduce((total,row)=>total+(row[key]??0),0));
const months=['june','july','august'],costs=['normal','stress'];
const variants=['baseline','mnq-before-11','mnq-kronos'];
const symbols=['MNQ','MES','MYM','MGC'];
const aggregateKeys=['trades','net','wins','losses'];
const statistics=['trades','net','wins','losses','mean','averageWin','averageLoss','best','worst','winRate'];

function checkStatistics(row){
 assert.ok(Number.isSafeInteger(row.trades)&&row.trades>=0);
 assert.equal(row.wins+row.losses,row.trades);
 assert.equal(row.mean,row.trades?cents(row.net/row.trades):null);
 assert.equal(row.winRate,row.trades?row.wins/row.trades:null);
 if(row.trades===0){assert.equal(row.net,0);for(const key of ['averageWin','averageLoss','best','worst'])assert.equal(row[key],null);}
 else{assert.ok(row.best>=row.worst);assert.equal(row.averageWin===null,row.wins===0);assert.equal(row.averageLoss===null,row.losses===0);}
}

test('Game39 report and four archive identities preserve all62 frozen dependencies without exposing private executions',async()=>{
 const raw=await read('trading/lab/jeu39-report.json'),report=await verifyStudyReport(raw);
 const frozen=await read('trading/lab/jeu39-freeze.json'),pins=JSON.parse(frozen).files;
 assert.equal(Object.keys(pins).length,62);
 for(const [path,sha]of Object.entries(pins))assert.equal(hash(await read(path)),sha,path);
 assert.equal(hash(raw),REPORT39_SHA256);assert.equal(hash(frozen),report.freezeSha256);
 assert.equal(report.prePerformanceCommit,'2fc700dfb385f92b001a63fcb642603be51f7bf8');
 const archive=JSON.parse(await read('trading/lab/jeu39-archive.json')),source=JSON.parse(await read('trading/lab/jeu39-source.json'));
 assert.equal(archive.prePerformanceCommit,report.prePerformanceCommit);assert.equal(archive.freezeSha256,report.freezeSha256);
 assert.equal(archive.namespace,'TRADING_DATASETS');assert.equal(archive.prefix,'jeu39/model-hours-v1/');
 assert.deepEqual(archive.files.map(file=>file.name),['requests.json','predictions.json','report.json','runs-private.json']);
 const publicFile=archive.files.find(file=>file.name==='report.json'),requestFile=archive.files.find(file=>file.name==='requests.json');
 assert.equal(publicFile.bytes,raw.length);assert.equal(publicFile.sha256,hash(raw));
 assert.equal(requestFile.bytes,source.inputs.requestPack.bytes);assert.equal(requestFile.sha256,source.inputs.requestPack.sha256);
 assert.equal(requestFile.sha256,report.requestPackSha256);
 assert.equal(archive.files.find(file=>file.name==='predictions.json').sha256,report.predictionsSha256);
 const partKeys=[];
 for(const file of archive.files){
  assert.ok(Number.isSafeInteger(file.bytes)&&file.bytes>0);assert.match(file.sha256,/^[a-f0-9]{64}$/);
  assert.equal(file.encoding,'gzip+base64');assert.ok(file.parts.length>0);
  for(const part of file.parts){
   assert.ok(part.key.startsWith(archive.prefix+file.name+'.gz.b64.'));
   assert.ok(Number.isSafeInteger(part.bytes)&&part.bytes>0&&part.bytes<=60000);assert.match(part.sha256,/^[a-f0-9]{64}$/);partKeys.push(part.key);
  }
 }
 assert.equal(new Set(partKeys).size,partKeys.length);assert.equal(archive.confirmed,false);assert.equal(archive.executionAllowed,false);
 assert.equal(/"(?:entryTime|exitTime|signalClose|signalOpen|stopPrice|candles|entry|exit|ticker|forecast)"\s*:/.test(raw.toString()),false);
});

test('Game39 all18 cells reconcile monthly resets, daily/weekly/market/hour totals, six archived controls and complete trade attribution',async()=>{
 const report=await verifyStudyReport(await read('trading/lab/jeu39-report.json'));
 const reference=JSON.parse(await read('trading/lab/jeu37-report.json'));
 assert.equal(report.newConfigurations,2);assert.equal(report.executionCount,18);
 assert.deepEqual(report.variants.map(variant=>variant.id),variants);
 assert.deepEqual(report.audit,{controls:6,prefixes:384,filterPrefixes:384,modelInputPrefixes:64,passed:true});
 assert.equal(new Set(report.views.map(view=>view.month+'/'+view.variant)).size,9);
 let cells=0,days=0,weeks=0,controls=0;
 for(const month of months)for(const variant of variants){
  const view=report.views.find(item=>item.month===month&&item.variant===variant);
  const old=reference.views.find(item=>item.month===month&&item.variant==='fixed100');
  const baseline=report.views.find(item=>item.month===month&&item.variant==='baseline');
  assert.ok(view&&old&&baseline);assert.deepEqual(view.period,old.period);assert.equal(view.mode,'funded');assert.equal(view.resetAtStart,true);
  assert.deepEqual(Object.keys(view.costs),costs);
  assert.deepEqual(view.costs.normal.filter,view.costs.stress.filter);
  for(const cost of costs){
   const cell=view.costs[cost],base=baseline.costs[cost];cells++;checkStatistics(cell);
   assert.equal(cents(cell.balance+cell.withdrawnUSD-50000),cell.net);
   assert.equal(sum(cell.calendar.daily,'net'),cell.net);assert.equal(sum(cell.calendar.weeks,'net'),cell.net);
   assert.equal(sum(cell.calendar.daily,'trades'),cell.trades);assert.equal(sum(cell.calendar.weeks,'trades'),cell.trades);
   assert.deepEqual(cell.contributions.map(market=>market.symbol),symbols);
   for(const key of aggregateKeys){assert.equal(sum(cell.contributions,key),cell[key]);assert.equal(sum(cell.hours,key),cell[key]);}
   assert.equal(sum(cell.calendar.daily,'receiptEUR'),cell.receiptEUR);assert.equal(sum(cell.calendar.daily,'payoutGrossUSD'),cell.withdrawnUSD);
   assert.equal(cell.profitGoalAchieved,false);assert.equal(cell.personalGoalAchieved,false);assert.equal(cell.withdrawnUSD,0);assert.equal(cell.receiptEUR,0);assert.equal(cell.executionAllowed,false);
   let cumulative=0,previousBalance=50000,peak=0,dailyDrawdown=0;
   for(const day of cell.calendar.daily){
    days++;assert.ok(day.day>=view.period.start&&day.day<view.period.end);assert.equal(typeof day.net,'number');
    assert.ok(Number.isSafeInteger(day.trades)&&day.trades>=0&&day.trades<=2);
    cumulative=cents(cumulative+day.net);assert.equal(day.cumulative,cumulative);assert.equal(day.balance,cents(previousBalance+day.net-day.payoutGrossUSD));
    peak=Math.max(peak,cumulative);dailyDrawdown=Math.max(dailyDrawdown,cents(peak-cumulative));previousBalance=day.balance;
    assert.equal(day.state,day.trades?'traded':'no-trade');assert.equal(day.averageRiskUSD===null,day.trades===0);
    if(day.trades)assert.ok(day.averageRiskUSD>0&&day.averageRiskUSD<=100);else assert.equal(day.net,0);
    assert.equal(sum(day.markets,'net'),day.net);assert.equal(sum(day.markets,'trades'),day.trades);
    for(const market of day.markets)checkStatistics(market);
   }
   assert.ok(cell.drawdown>=dailyDrawdown,'Trade-level drawdown cannot be below the observed daily drawdown');
   for(const week of cell.calendar.weeks){
    weeks++;const rows=cell.calendar.daily.filter(day=>day.week===week.week);
    for(const key of ['net','trades','receiptEUR'])assert.equal(week[key],sum(rows,key));
    assert.equal(week.cumulative,rows.at(-1).cumulative);assert.equal(week.observed,rows.length);assert.equal(week.expected,rows.length);
    assert.equal(week.start,rows[0].day);assert.equal(week.end,rows.at(-1).day);
   }
   for(const market of cell.contributions){
    checkStatistics(market);const daily=cell.calendar.daily.map(day=>day.markets.find(item=>item.symbol===market.symbol));
    const hourly=cell.hours.filter(item=>item.symbol===market.symbol);
    assert.deepEqual(hourly.map(item=>item.hour),['before-11','11-and-later']);
    for(const row of hourly)checkStatistics(row);
    for(const key of aggregateKeys){assert.equal(sum(daily,key),market[key]);assert.equal(sum(hourly,key),market[key]);}
    if(market.symbol==='MYM')assert.equal(market.trades,0);
    if(market.symbol==='MGC'||(market.symbol==='MNQ'&&variant==='mnq-before-11'))assert.equal(hourly[1].trades,0);
   }
   const comparison=cell.comparison;
   assert.equal(comparison.common+comparison.removed.count,base.trades);assert.equal(comparison.common+comparison.added.count,cell.trades);
   assert.equal(cents(comparison.added.net-comparison.removed.net+comparison.commonDelta),comparison.delta);
   assert.equal(comparison.delta,cents(cell.net-base.net));
   for(const category of ['added','removed']){
    assert.equal(comparison[category].wins+comparison[category].losses,comparison[category].count);
    for(const key of ['count','wins','losses','net'])assert.equal(sum(cell.marketComparisons.map(item=>item[category]),key),comparison[category][key]);
   }
   for(const key of ['common','delayedCommon','commonDelta','delta','winnersToLosers','losersToWinners'])assert.equal(sum(cell.marketComparisons,key),comparison[key]);
   for(const row of cell.marketComparisons){
    const before=base.contributions.find(m=>m.symbol===row.symbol),after=cell.contributions.find(m=>m.symbol===row.symbol);
    assert.equal(row.common+row.removed.count,before.trades);assert.equal(row.common+row.added.count,after.trades);
    assert.equal(row.delta,cents(after.net-before.net));assert.equal(row.delta,cents(row.added.net-row.removed.net+row.commonDelta));
   }
   assert.equal(Object.values(cell.filter.reasons).reduce((n,count)=>n+count,0),cell.filter.candidates);
   assert.equal(cell.filter.rejected,variant==='baseline'?0:cell.filter.reasons[variant==='mnq-before-11'?'at-or-after-11':'model-opposed']??0);
   if(variant==='baseline'){
    controls++;const archived=old.costs[cost];
    for(const key of [...statistics,'drawdown','status','balance','withdrawnUSD','receiptEUR','profitGoalAchieved','personalGoalAchieved','contributions','denied'])assert.deepEqual(cell[key],archived[key],`${month}/${cost}/${key}`);
    assert.equal(cell.calendar.daily.length,archived.calendar.daily.length);
    for(const day of cell.calendar.daily){
     const saved=archived.calendar.daily.find(item=>item.day===day.day);assert.ok(saved);
     for(const [key,value]of Object.entries(saved))if(key!=='markets')assert.deepEqual(day[key],value,`${month}/${cost}/${day.day}/${key}`);
     for(const market of saved.markets){const enriched=day.markets.find(item=>item.symbol===market.symbol);for(const [key,value]of Object.entries(market))assert.deepEqual(enriched[key],value);}
    }
    assert.deepEqual(cell.calendar.weeks,archived.calendar.weeks);
   }
  }
 }
 assert.deepEqual({cells,days,weeks,controls},{cells:18,days:384,weeks:90,controls:6});
 // The new gold loss is an account-slot consequence of the MNQ veto, not a
 // changed MGC strategy; the archived attribution must keep it visible.
 const august=report.views.find(view=>view.month==='august'&&view.variant==='mnq-kronos');
 assert.deepEqual(august.costs.normal.marketComparisons.find(m=>m.symbol==='MGC').added,{count:1,wins:0,losses:1,net:-81.5});
 assert.deepEqual(august.costs.stress.marketComparisons.find(m=>m.symbol==='MGC').added,{count:1,wins:0,losses:1,net:-86});
});

test('Game39 self-assessments retain all six cells and invalid model outputs in the failed gates; corrupt reports are rejected',async()=>{
 const raw=await read('trading/lab/jeu39-report.json'),report=await verifyStudyReport(raw);
 assert.deepEqual(report.model,{signals:49,uniqueRequests:43,invalidForecasts:3,inferenceErrors:0,signalStatuses:{valid:43,'insufficient-context':3,'invalid-output':3},weightsFitted:false});
 assert.equal(Object.values(report.model.signalStatuses).reduce((n,count)=>n+count,0),report.model.signals);
 const modelCells=report.views.filter(view=>view.variant==='mnq-kronos').map(view=>view.costs.normal);
 assert.equal(sum(modelCells.map(cell=>({count:cell.filter.candidates})),'count'),report.model.signals);
 for(const [status,reasons]of Object.entries({valid:['model-opposed','model-not-opposed'],'insufficient-context':['insufficient-context'],'invalid-output':['invalid-output']})){
  const count=modelCells.reduce((n,cell)=>n+reasons.reduce((total,reason)=>total+(cell.filter.reasons[reason]??0),0),0);
  assert.equal(count,report.model.signalStatuses[status]);
 }
 for(const review of report.reviews){
  const expected=report.views.filter(view=>view.variant===review.variant).flatMap(view=>costs.map(cost=>{
   const cell=view.costs[cost],baseline=report.views.find(item=>item.month===view.month&&item.variant==='baseline').costs[cost];
   return {month:view.month,cost,net:cell.net,delta:cents(cell.net-baseline.net),drawdown:cell.drawdown,referenceDrawdown:baseline.drawdown,status:cell.status,trades:cell.trades};
  }));
  assert.deepEqual(review.cells,expected);assert.equal(expected.length,6);
  const qualityIssues=review.variant==='mnq-kronos'?report.model.invalidForecasts+report.model.inferenceErrors:0;
  const checks={netNondecreasing:expected.every(cell=>cell.delta>=0),drawdownNonincreasing:expected.every(cell=>cell.drawdown<=cell.referenceDrawdown),noAccountBreach:expected.every(cell=>cell.status!=='breached'),strictNetImprovement:expected.some(cell=>cell.delta>0),modelOutputsValid:qualityIssues===0};
  assert.equal(review.qualityIssues,qualityIssues);assert.deepEqual(review.checks,checks);
  assert.deepEqual(review.failedChecks,Object.entries(checks).filter(([,passed])=>!passed).map(([name])=>name));
  assert.equal(review.descriptiveGatePassed,Object.values(checks).every(Boolean));assert.equal(review.descriptiveGatePassed,false);
  assert.equal(review.decision,'not-retained');
  for(const object of [review,report]){assert.equal(object.selection,null);assert.equal(object.independent,false);assert.equal(object.confirmed,false);assert.equal(object.executionAllowed,false);}
 }
 const changed=JSON.parse(raw);changed.model.invalidForecasts=0;changed.reviews[1].descriptiveGatePassed=true;
 for(const bytes of [Buffer.from(JSON.stringify(changed)),raw.subarray(0,raw.length-1),Buffer.from('<html>Login</html>')])await assert.rejects(()=>verifyStudyReport(bytes),/Rapport horaires\/modèle non vérifié/);
});
