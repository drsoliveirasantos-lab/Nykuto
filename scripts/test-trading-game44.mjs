import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {allVideoContexts44} from '../trading/lab/jeu44-context.mjs';
import {filterVideoStreams44} from '../trading/lab/jeu44-filter.mjs';
import {JEU44_VARIANTS} from '../trading/lab/jeu44-policy.mjs';
import {JEU40_MONTHS} from '../trading/lab/jeu40-policy.mjs';
import {review44} from '../trading/lab/jeu44-diagnostic.mjs';
import {verifyPolicy44Protocol} from '../trading/lab/jeu44-protocol-table.mjs';
const day='2026-06-04',start=Date.parse(day+'T13:30:00Z')/1000,time=start+2400;
function fixture(side='Long',symbol='MNQ'){
 const sign=side==='Long'?1:-1,peer=symbol==='MNQ'?'MES':'MNQ';
 const make=s=>({symbol:s,signals:new Map(),candles:Array.from({length:10},(_,i)=>({time:start+i*300,day,minute:570+i*5,closeMinute:960,ticker:s+'M6',open:100,high:102,low:98,close:100,volume:100}))});
 const own=make(symbol),other=make(peer);
 const b6={open:103,high:110,low:102,close:106,volume:100},b7={open:106,high:107,low:101,close:103,volume:300};
 const reflect=b=>sign===1?b:{open:200-b.open,high:200-b.low,low:200-b.high,close:200-b.close,volume:b.volume};
 Object.assign(own.candles[6],reflect(b6));Object.assign(own.candles[7],reflect(b7));own.candles[8].open=100+sign*4;
 other.candles[7].close=100-sign;
 own.signals.set(time,{side,day,signalClose:time,signalOpen:time-300,rangeClosedAt:start+1800,breakoutAt:start+2100,trendClosedAt:start+1800,rangeHigh:sign===1?102:100,rangeLow:sign===1?100:98,stopPrice:100-sign,pattern:'orb-retest'});
 return [own,other];
}
const decision=(streams,variant,factor=1)=>filterVideoStreams44(streams,allVideoContexts44(streams),factor,variant);
test('Game44 peer direction and relative leadership are symmetric, separate rules',()=>{
 for(const side of ['Long','Short'])for(const symbol of ['MNQ','MES']){
  const streams=fixture(side,symbol),sign=side==='Long'?1:-1,id=symbol.toLowerCase();
  assert.equal(decision(streams,id+'-peer-direction').decisions[0].allowed,false);
  assert.equal(decision(streams,id+'-relative-strength').decisions[0].allowed,true);
  Object.assign(streams[1].candles[7],{close:100+sign*7,high:108,low:92});
  assert.equal(decision(streams,id+'-peer-direction').decisions[0].allowed,true);
  assert.equal(decision(streams,id+'-relative-strength').decisions[0].allowed,false);
 }
});
test('Game44 breakout AVWAP is hand-calculated from the original breakout, with volume weights',()=>{
 for(const side of ['Long','Short']){
  const streams=fixture(side),f=allVideoContexts44(streams).get('MNQ').get(time);
  assert.equal(f.anchorOpen,time-600);assert.equal(f.anchorBars,2);assert.equal(f.anchorVolume,400);
  assert.equal(f.avwap,side==='Long'?104.25:95.75);
  assert.equal(decision(streams,'mnq-breakout-avwap').decisions[0].allowed,false);
  streams[0].candles[0].volume=1e12;
  assert.equal(allVideoContexts44(streams).get('MNQ').get(time).avwap,f.avwap);
 }
});
test('Game44 comparisons allow exact equality and do not round an opposition to zero',()=>{
 const streams=fixture();streams[1].candles[7].close=100;
 assert.equal(decision(streams,'mnq-peer-direction').decisions[0].allowed,true);
 streams[1].candles[7].close=100-1e-9;
 assert.equal(decision(streams,'mnq-peer-direction').decisions[0].allowed,false);
 const f=allVideoContexts44(streams),c=f.get('MNQ').get(time);c.relativeReturn=0;c.avwap=c.signalClose;
 for(const id of ['mnq-relative-strength','mnq-breakout-avwap'])assert.equal(filterVideoStreams44(streams,f,1,id).decisions[0].allowed,true);
 c.avwap+=1e-9;assert.equal(filterVideoStreams44(streams,f,1,'mnq-breakout-avwap').decisions[0].allowed,false);
});
test('Game44 index returns use each native opening price, never absolute cross-index points',()=>{
 const streams=fixture(),a=allVideoContexts44(streams).get('MNQ').get(time);
 for(const b of streams[1].candles)for(const k of ['open','high','low','close'])b[k]*=50;
 const b=allVideoContexts44(streams).get('MNQ').get(time);assert.equal(a.peerReturn,b.peerReturn);assert.equal(a.relativeReturn,b.relativeReturn);
});
test('Game44 ignores future OHLCV, peer entry open and later sessions; prefix is identical',()=>{
 const streams=fixture(),a=allVideoContexts44(streams),expected=filterVideoStreams44(streams,a,1,'mnq-peer-direction');
 for(const [i,s]of streams.entries())for(const b of s.candles.filter(b=>b.time>=time))for(const k of ['open','high','low','close','volume']){
  if(i===0&&b.time===time&&k==='open')continue;
  Object.defineProperty(b,k,{get(){throw Error('Future field read');}});
 }
 assert.deepEqual(allVideoContexts44(streams),a);assert.deepEqual(filterVideoStreams44(streams,a,1,'mnq-peer-direction'),expected);
 const prefix=streams.map(s=>({...s,candles:s.candles.filter(b=>b.time<time)}));assert.deepEqual(allVideoContexts44(prefix),a);
});
test('Game44 missing or stale peer is explicitly unobservable, without affecting AVWAP',()=>{
 for(const missing of ['absent','gap','late']){
  const streams=fixture();
  if(missing==='absent')streams.pop();
  if(missing==='gap')streams[1].candles.splice(2,1);
  if(missing==='late')streams[1].candles=streams[1].candles.filter(b=>b.time!==time-300);
  for(const id of ['mnq-peer-direction','mnq-relative-strength']){const d=decision(streams,id).decisions[0];assert.equal(d.allowed,true);assert.equal(d.observable,false);assert.match(d.reason,/peer-/);}
  assert.equal(decision(streams,'mnq-breakout-avwap').decisions[0].allowed,false);
 }
});
test('Game44 unknown or zero anchor volume is explicit, without affecting peer direction',()=>{
 for(const volume of [undefined,0,-1,NaN]){
  const streams=fixture();streams[0].candles[6].volume=volume;streams[0].candles[7].volume=volume;
  const d=decision(streams,'mnq-breakout-avwap').decisions[0];assert.equal(d.allowed,true);assert.equal(d.observable,false);assert.match(d.reason,/anchor-volume/);
  assert.equal(decision(streams,'mnq-peer-direction').decisions[0].allowed,false);
 }
});
test('Game44 sessions reset at cash open; prior native contracts never enter features',()=>{
 const streams=fixture(),a=allVideoContexts44(streams);
 for(const s of streams)s.candles.unshift(...s.candles.slice(0,8).map(b=>({...b,time:b.time-86400,day:'2026-06-03',ticker:s.symbol+'H6',open:500,close:501,high:502,low:499})));
 assert.deepEqual(allVideoContexts44(streams),a);
 const bad=fixture();bad[0].candles[6].ticker='MNQU6';assert.throws(()=>allVideoContexts44(bad),/Mixed cash contracts/);
});
test('Game44 keeps reference and other market objects unchanged; costs do not change veto rules',()=>{
 const streams=fixture();
 for(const profile of JEU44_VARIANTS){const result=decision(streams,profile.id);assert.deepEqual(result.decisions,decision(streams,profile.id,2).decisions);if(profile.targetSymbol!=='MNQ')assert.equal(result.streams[0],streams[0]);if(profile.targetSymbol!=='MES')assert.equal(result.streams[1],streams[1]);}
 assert.throws(()=>decision(streams,'unknown'));
});
test('Game44 rejects malformed clocks, anchors, duplicates and forged future context',()=>{
 for(const mutate of [s=>s[0].signals.get(time).signalClose++,s=>s[0].signals.get(time).breakoutAt=time+300,s=>s[0].candles[2].time+=300,s=>s[0].candles[2].close=NaN]){
  const streams=fixture();mutate(streams);assert.throws(()=>allVideoContexts44(streams));
 }
 const streams=fixture();assert.throws(()=>allVideoContexts44([...streams,streams[0]]));
 const features=allVideoContexts44(streams);features.get('MNQ').get(time).peerClosedAt=time+300;
 assert.throws(()=>filterVideoStreams44(streams,features,1,'mnq-peer-direction'),/Stale peer/);
});
test('Game44 gate requires every month and both costs, plus a strict improvement',()=>{
 const cells=JEU40_MONTHS.flatMap(m=>['normal','stress'].map(cost=>({month:m.id,cost,delta:0,net:1,drawdown:10,referenceDrawdown:10,status:'incomplete'})));
 assert.equal(review44(cells).descriptiveGatePassed,false);cells[0].delta=1;assert.equal(review44(cells).descriptiveGatePassed,true);cells[1].drawdown=11;assert.equal(review44(cells).descriptiveGatePassed,false);assert.throws(()=>review44(cells.slice(1)));
});
test('Game44 protocol matches executable parameters and source evidence remains explicit',()=>{
 const text=readFileSync('trading/lab/JEU44_PROTOCOL.md','utf8');verifyPolicy44Protocol(text);assert.throws(()=>verifyPolicy44Protocol(text.replace('"minimumAnchorBars": 2','"minimumAnchorBars": 3')));
 const sources=JSON.parse(readFileSync('trading/lab/jeu44-video-sources.json'));
 assert.equal(sources.videos.length,20);assert.equal(new Set(sources.videos.map(v=>v.youtube)).size,20);
 assert.ok(sources.videos.every(v=>v.evidence&&v.strength&&v.weakness&&v.disposition&&v.fullVideoWatched===false));
 assert.equal(sources.profitabilityVerified,false);assert.equal(JEU44_VARIANTS.length,7);
});
