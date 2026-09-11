import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pastWindowFeatures,normalizedEntryDistance} from '../trading/models/past-window-features.mjs';
import {normalizedContexts43} from '../trading/lab/jeu43-context.mjs';
import {filterNormalizedStreams43} from '../trading/lab/jeu43-filter.mjs';
import {review43} from '../trading/lab/jeu43-diagnostic.mjs';
import {JEU40_MONTHS} from '../trading/lab/jeu40-policy.mjs';
import {verifyPolicy43Protocol} from '../trading/lab/jeu43-protocol-table.mjs';
const asOf=Date.parse('2026-06-04T14:10:00Z')/1000;
const sample=()=>Array.from({length:64},(_,i)=>({time:asOf-(64-i)*900,closedAt:asOf-(63-i)*900,ticker:'MNQM6',open:100+2*(i%2),high:103,low:99,close:100+2*(i%2),volume:100+i}));
const feature=()=>pastWindowFeatures(sample(),{asOf,contract:'MNQM6'});
function fixture(side='Long',symbol='MNQ'){
 const time=asOf,day='2026-06-04',entry={time,day,minute:610,ticker:symbol+'M6',open:side==='Long'?104:98};
 const signal={side,day,signalClose:time,signalOpen:time-300,rangeClosedAt:time-600,breakoutAt:time-300,trendClosedAt:time-900,rangeHigh:102,rangeLow:100,stopPrice:side==='Long'?99:103,pattern:'orb-retest'};
 const features=feature();features.contract=entry.ticker;
 return {streams:[{symbol,candles:[entry],signals:new Map([[time,signal]])}],contexts:new Map([[symbol,new Map([[time,{status:'ready',time,day,symbol,features,availableBars:64,clock:{}}]])]])};
}
test('Game43 population normalization matches hand-calculated moments and is affine invariant',()=>{
 const f=feature();assert.equal(f.columns.close.mean,101);assert.equal(f.columns.close.standardDeviation,1);
 const shifted=sample().map(b=>({...b,open:b.open+1000,high:b.high+1000,low:b.low+1000,close:b.close+1000}));
 const g=pastWindowFeatures(shifted,{asOf,contract:'MNQM6'});
 assert.equal(g.columns.close.lastZ,f.columns.close.lastZ);
 assert.deepEqual(normalizedEntryDistance(f,{entryOpen:104,level:102,side:'Long'}),normalizedEntryDistance(g,{entryOpen:1104,level:1102,side:'Long'}));
 const scaled=sample().map(b=>({...b,open:b.open*2,high:b.high*2,low:b.low*2,close:b.close*2}));
 const h=pastWindowFeatures(scaled,{asOf,contract:'MNQM6',epsilon:2e-5});assert.equal(h.columns.close.lastZ,f.columns.close.lastZ);
});
test('Game43 refuses future or cross-contract windows and explicitly marks flat prices',()=>{
 for(const change of [a=>a[63].closedAt+=900,a=>a[0].ticker='MNQU6',a=>a[2].time=a[1].time,a=>a[0].close=NaN,a=>a[0].high=90]){const a=sample();change(a);assert.throws(()=>pastWindowFeatures(a,{asOf,contract:'MNQM6'}));}
 const flat=sample().map(b=>({...b,close:101}));assert.equal(normalizedEntryDistance(pastWindowFeatures(flat,{asOf,contract:'MNQM6'}),{entryOpen:104,level:102,side:'Long'}).status,'flat-price-window');
});
test('Game43 symmetric isolated veto, unchanged other market and no effect from costs',()=>{
 for(const side of ['Long','Short']){
  const f=fixture(side),run=(id,factor=1)=>filterNormalizedStreams43(f.streams,f.contexts,factor,id);
  assert.equal(run('mnq-normalized-entry').decisions[0].allowed,false);
  assert.equal(run('mes-normalized-entry').streams[0],f.streams[0]);assert.equal(run('baseline').streams[0],f.streams[0]);
  assert.deepEqual(run('mnq-normalized-entry').decisions,run('mnq-normalized-entry',2).decisions);
  for(const k of ['high','low','close','volume'])Object.defineProperty(f.streams[0].candles[0],k,{get(){throw Error('Future entry field');}});
  assert.equal(run('mnq-normalized-entry').decisions[0].allowed,false);
 }
 const f=fixture('Long','MES');assert.equal(filterNormalizedStreams43(f.streams,f.contexts,1,'mes-normalized-entry').decisions[0].allowed,false);
 const c=f.contexts.get('MES').get(asOf);c.status='insufficient-context';c.features=null;
 assert.equal(filterNormalizedStreams43(f.streams,f.contexts,1,'mes-normalized-entry').decisions[0].allowed,true);
});
function groups(){return [1,2,3,4].map(n=>{const day=`2026-06-0${n}`,start=Date.parse(day+'T13:30:00Z')/1000;return {start:day,ticker:'MNQM6',candles:Array.from({length:78},(_,i)=>({time:start+i*300,day,minute:570+i*5,closeMinute:960,ticker:'MNQM6',open:100,high:102,low:99,close:100+(i%2),volume:100}))};});}
test('Game43 preparation sees only completed M15 and is invariant to the future',()=>{
 const gs=groups(),signal={signalClose:asOf,signalOpen:asOf-300,day:'2026-06-04'},signals=new Map([[asOf,signal]]);
 const a=normalizedContexts43(gs,signals,'MNQ');assert.equal(a.get(asOf).status,'ready');assert.equal(a.get(asOf).features.bars,64);assert.equal(a.get(asOf).features.lastClose,asOf-600);
 for(const b of gs[3].candles.filter(b=>b.time>=asOf))for(const k of ['open','high','low','close','volume'])Object.defineProperty(b,k,{get(){throw Error('Future source field');}});
 assert.deepEqual(normalizedContexts43(gs,signals,'MNQ'),a);
 const truncated=gs.map(g=>({...g,candles:g.candles.filter(b=>b.time+300<=asOf)}));assert.deepEqual(normalizedContexts43(truncated,signals,'MNQ'),a);
});
test('Game43 restarts after a native roll or missing session instead of mixing regimes',()=>{
 const signals=new Map([[asOf,{signalClose:asOf,signalOpen:asOf-300,day:'2026-06-04'}]]);
 const rolled=groups();rolled[3].ticker='MNQU6';for(const b of rolled[3].candles)b.ticker='MNQU6';
 assert.equal(normalizedContexts43(rolled,signals,'MNQ').get(asOf).status,'contract-roll-warmup');
 assert.equal(normalizedContexts43(groups().filter(g=>g.start!=='2026-06-03'),signals,'MNQ').get(asOf).status,'missing-session-warmup');
});
test('Game43 exact threshold allows equality, never rounds an excessive distance down',()=>{
 const f=fixture(),sigma=f.contexts.get('MNQ').get(asOf).features.columns.close;
 sigma.standardDeviation=2-1e-5;assert.equal(filterNormalizedStreams43(f.streams,f.contexts,1,'mnq-normalized-entry').decisions[0].allowed,true);
 sigma.standardDeviation=2-2e-5;assert.equal(filterNormalizedStreams43(f.streams,f.contexts,1,'mnq-normalized-entry').decisions[0].allowed,false);
});
test('Game43 frozen policy matches protocol; review requires every month and both cost paths',()=>{
 const text=readFileSync('trading/lab/JEU43_PROTOCOL.md','utf8');verifyPolicy43Protocol(text);assert.throws(()=>verifyPolicy43Protocol(text.replace('"maximumExtensionZ": 1','"maximumExtensionZ": 2')));
 const cells=JEU40_MONTHS.flatMap(m=>['normal','stress'].map(cost=>({month:m.id,cost,delta:0,net:1,drawdown:10,referenceDrawdown:10,status:'incomplete'})));
 assert.equal(review43(cells).descriptiveGatePassed,false);cells[0].delta=1;assert.equal(review43(cells).descriptiveGatePassed,true);cells[1].drawdown=11;assert.equal(review43(cells).descriptiveGatePassed,false);assert.throws(()=>review43(cells.slice(1)));
});
