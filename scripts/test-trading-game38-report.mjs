import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyObstacleReport,REPORT38_SHA256} from '../trading/lab/jeu38-report-validation.mjs';

const read=path=>readFile(new URL('../'+path,import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const cents=value=>Math.round(value*100)/100;
const sum=(rows,key)=>cents(rows.reduce((total,row)=>total+(row[key]??0),0));
const months=['june','july','august'];
const costs=['normal','stress'];

test('obstacle report preserves all 49 pre-performance dependencies and its durable archive fingerprint',async()=>{
 const raw=await read('trading/lab/jeu38-report.json');
 const report=await verifyObstacleReport(raw);
 const frozen=await read('trading/lab/jeu38-freeze.json');
 const archive=JSON.parse(await read('trading/lab/jeu38-archive.json'));
 const pins=JSON.parse(frozen).files;
 assert.equal(Object.keys(pins).length,49);
 for(const [path,sha]of Object.entries(pins))assert.equal(hash(await read(path)),sha,path);
 assert.equal(hash(raw),REPORT38_SHA256);
 assert.equal(hash(frozen),report.freezeSha256);
 assert.equal(report.prePerformanceCommit,'563ab6eff9e475ddcc40058b9fb9b2342ef4618a');
 assert.equal(archive.prePerformanceCommit,report.prePerformanceCommit);
 assert.equal(archive.freezeSha256,report.freezeSha256);
 assert.equal(archive.prefix,'jeu38/structure-obstacle-v1/');
 assert.equal(archive.namespace,'TRADING_DATASETS');
 assert.deepEqual(archive.files.map(file=>file.name),['report.json','runs-private.json']);
 const publicFile=archive.files.find(file=>file.name==='report.json');
 assert.equal(publicFile.bytes,raw.length);
 assert.equal(publicFile.sha256,hash(raw));
 const partKeys=[];
 for(const file of archive.files){
  assert.ok(Number.isSafeInteger(file.bytes)&&file.bytes>0);
  assert.match(file.sha256,/^[a-f0-9]{64}$/);
  assert.equal(file.encoding,'gzip+base64');
  assert.ok(file.parts.length>0);
  for(const part of file.parts){
   assert.ok(part.key.startsWith(archive.prefix+file.name+'.gz.b64.'));
   assert.ok(Number.isSafeInteger(part.bytes)&&part.bytes>0);
   assert.match(part.sha256,/^[a-f0-9]{64}$/);
   partKeys.push(part.key);
  }
 }
 assert.equal(new Set(partKeys).size,partKeys.length);
 assert.equal(archive.confirmed,false);
 assert.equal(archive.executionAllowed,false);
 // Public aggregates must never acquire individual execution or price fields.
 assert.equal(/"(?:entryTime|exitTime|signalClose|signalOpen|stopPrice|candles|entry|exit|ticker)"\s*:/.test(raw.toString()),false);
});

test('all 12 obstacle cells reconcile archived controls, monthly resets, daily and weekly cashflows, markets and the failed descriptive gate',async()=>{
 const report=await verifyObstacleReport(await read('trading/lab/jeu38-report.json'));
 const reference=JSON.parse(await read('trading/lab/jeu37-report.json'));
 assert.equal(report.newConfigurations,1);
 assert.equal(report.executionCount,12);
 assert.deepEqual(report.audit,{controls:6,prefixes:256,filterPrefixes:256,passed:true});
 assert.equal(report.views.length,6);
 assert.equal(new Set(report.views.map(view=>view.month+'/'+view.variant)).size,6);
 const stats=['trades','net','wins','losses','mean','averageWin','averageLoss','best','worst','winRate','drawdown','status','balance','withdrawnUSD','receiptEUR','profitGoalAchieved','personalGoalAchieved','contributions'];
 let cells=0,days=0,weeks=0;
 for(const month of months)for(const variant of ['baseline','mnq-obstacle']){
  const view=report.views.find(item=>item.month===month&&item.variant===variant);
  const old=reference.views.find(item=>item.month===month&&item.variant==='fixed100');
  assert.ok(view&&old);
  assert.deepEqual(view.period,old.period);
  assert.deepEqual(Object.keys(view.costs),costs);
  for(const cost of costs){
   const cell=view.costs[cost],control=old.costs[cost];cells++;
   for(const key of stats)assert.deepEqual(cell[key],control[key],`${month}/${variant}/${cost}/${key}`);
   assert.equal(cents(cell.balance+cell.withdrawnUSD-50000),cell.net);
   assert.equal(sum(cell.calendar.daily,'net'),cell.net);
   assert.equal(sum(cell.calendar.weeks,'net'),cell.net);
   assert.equal(sum(cell.contributions,'net'),cell.net);
   assert.equal(sum(cell.contributions,'trades'),cell.trades);
   assert.equal(sum(cell.contributions,'wins'),cell.wins);
   assert.equal(sum(cell.contributions,'losses'),cell.losses);
   assert.equal(cell.wins+cell.losses,cell.trades);
   assert.equal(cell.mean,cents(cell.net/cell.trades));
   assert.equal(cell.winRate,cell.wins/cell.trades);
   assert.equal(sum(cell.calendar.daily,'receiptEUR'),cell.receiptEUR);
   assert.equal(sum(cell.calendar.daily,'payoutGrossUSD'),cell.withdrawnUSD);
   assert.equal(cell.profitGoalAchieved,false);
   assert.equal(cell.personalGoalAchieved,false);
   assert.equal(cell.receiptEUR,0);
   assert.equal(cell.withdrawnUSD,0);
   assert.equal(cell.executionAllowed,false);
   assert.equal(cell.calendar.daily.length,control.calendar.daily.length);
   let previousBalance=50000,cumulative=0;
   for(const day of cell.calendar.daily){
    days++;
    assert.ok(day.day>=view.period.start&&day.day<view.period.end);
    const oldDay=control.calendar.daily.find(item=>item.day===day.day);
    assert.ok(oldDay);
    for(const [key,value]of Object.entries(day))assert.deepEqual(value,oldDay[key],`${month}/${cost}/${day.day}/${key}`);
    assert.equal(typeof day.net,'number');
    cumulative=cents(cumulative+day.net);
    assert.equal(day.cumulative,cumulative);
    assert.equal(day.balance,cents(previousBalance+day.net-day.payoutGrossUSD));
    assert.equal(day.state,day.trades?'traded':'no-trade');
    if(day.trades===0)assert.equal(day.net,0);
    previousBalance=day.balance;
   }
   assert.equal(cell.calendar.weeks.length,control.calendar.weeks.length);
   for(const week of cell.calendar.weeks){
    weeks++;
    const rows=cell.calendar.daily.filter(day=>day.week===week.week);
    assert.equal(week.net,sum(rows,'net'));
    assert.equal(week.trades,sum(rows,'trades'));
    assert.equal(week.receiptEUR,sum(rows,'receiptEUR'));
    assert.equal(week.cumulative,rows.at(-1).cumulative);
    assert.equal(week.observed,rows.length);
    assert.equal(week.expected,rows.length);
    assert.equal(week.start,rows[0].day);
    assert.equal(week.end,rows.at(-1).day);
   }
   assert.deepEqual(cell.comparison,{common:cell.trades,delayedCommon:0,commonDelta:0,removed:{count:0,wins:0,losses:0,net:0},added:{count:0,wins:0,losses:0,net:0},delta:0,winnersToLosers:0,losersToWinners:0});
   if(variant==='baseline')assert.equal(cell.filter,null);
   else{
    const expected=month==='june'?{candidates:16,rejected:0,reasons:{'no-joint-conflict':16}}:month==='july'?{candidates:20,rejected:0,reasons:{'no-joint-conflict':20}}:{candidates:13,rejected:2,reasons:{'no-joint-conflict':11,'opposed-structure-and-obstacle':2}};
    assert.deepEqual(cell.filter,expected);
    const baseline=report.views.find(item=>item.month===month&&item.variant==='baseline').costs[cost];
    assert.deepEqual(cell.denied,{...baseline.denied,tradeRisk:baseline.denied.tradeRisk-expected.rejected});
   }
  }
 }
 assert.deepEqual({cells,days,weeks},{cells:12,days:256,weeks:60});
 const comparisons=report.views.filter(view=>view.variant==='mnq-obstacle').flatMap(view=>costs.map(cost=>{
  const cell=view.costs[cost],baseline=report.views.find(item=>item.month===view.month&&item.variant==='baseline').costs[cost];
  return {month:view.month,cost,net:cell.net,delta:cents(cell.net-baseline.net),drawdown:cell.drawdown,referenceDrawdown:baseline.drawdown,status:cell.status,trades:cell.trades};
 }));
 assert.deepEqual(report.comparisons,comparisons);
 const gate=comparisons.every(cell=>cell.delta>=0&&cell.drawdown<=cell.referenceDrawdown&&cell.status!=='breached')&&comparisons.some(cell=>cell.delta>0);
 assert.equal(gate,false);
 assert.equal(report.descriptiveGatePassed,gate);
 assert.equal(report.selection,null);
 assert.equal(report.confirmed,false);
 assert.equal(report.independent,false);
 assert.equal(report.executionAllowed,false);
});

test('obstacle report rejects corrupted, truncated and replacement data',async()=>{
 const original=await read('trading/lab/jeu38-report.json');
 const changed=JSON.parse(original);changed.descriptiveGatePassed=true;
 for(const bytes of [Buffer.from(JSON.stringify(changed)),original.subarray(0,original.length-1),Buffer.from('<html>Login</html>')]){
  await assert.rejects(()=>verifyObstacleReport(bytes),/Rapport du filtre non vérifié/);
 }
});
