import test from 'node:test';
import assert from 'node:assert/strict';
import {filterPullbackStreams42,relativeVolumeUnits42} from '../trading/lab/jeu42-pullback-volume.mjs';
import {JEU42_POLICY} from '../trading/lab/jeu42-policy.mjs';
const variant='mes-pullback-volume';
function fixture({side='Long',pullbacks=[1],breakout=2,confirmation=10,symbol='MES'}={}){
 const start=Date.parse('2026-06-02T14:00:00Z')/1000,sign=side==='Long'?1:-1;
 const candles=Array.from({length:pullbacks.length+3},(_,i)=>({time:start+i*300,day:'2026-06-02',minute:600+i*5,closeMinute:960,ticker:symbol+'M6',open:100,high:102,low:98,close:100+(i>0&&i<=pullbacks.length?-sign:sign),volume:100}));
 const last=candles.at(-1);last.open=side==='Long'?101:99;
 const time=last.time,signal={side,day:last.day,signalOpen:time-300,signalClose:time,rangeClosedAt:start,trendClosedAt:start,breakoutAt:start+300,rangeHigh:100,rangeLow:99.5,stopPrice:side==='Long'?97.75:102.25,pattern:'orb-retest'};
 const values=[breakout,...pullbacks,confirmation],ctx=new Map(candles.slice(0,-1).map((b,i)=>[b.time+300,{closedAt:b.time+300,sourceTime:b.time,day:b.day,ticker:b.ticker,volumeRatio:values[i],referenceSessions:5}]));
 return {streams:[{symbol,candles,signals:new Map([[time,signal]])}],contexts:new Map([[symbol,ctx]]),time};
}
const run=(f,id=variant,factor=1)=>filterPullbackStreams42(f.streams,f.contexts,factor,id);
test('Game42 accepts a contracted return and rejects equality or expansion, long and short',()=>{
 for(const side of ['Long','Short'])for(const [p,allowed]of [[1,true],[2,false],[3,false]]){
  const f=fixture({side,pullbacks:[p]});assert.equal(run(f).decisions[0].allowed,allowed);assert.equal(run(f).streams[0].signals.size,Number(allowed));
 }
});
test('Game42 compares the mean of opposite bars, excluding dojis and confirmation',()=>{
 assert.equal(run(fixture({pullbacks:[0,3],breakout:2})).decisions[0].allowed,true);
 assert.equal(run(fixture({pullbacks:[0,4],breakout:2})).decisions[0].allowed,false);
 for(const v of [0,1,1000,null])assert.equal(run(fixture({confirmation:v})).decisions[0].allowed,true);
 const f=fixture({pullbacks:[1,100]});f.streams[0].candles[2].close=100;
 assert.equal(run(f).decisions[0].detail.pullbackBars,1);assert.equal(run(f).decisions[0].allowed,true);
});
test('Game42 rounds each relative volume to one millionth before its integer comparison',()=>{
 assert.equal(run(fixture({pullbacks:[1.9999996]})).decisions[0].allowed,false);
 assert.equal(run(fixture({pullbacks:[1.9999994]})).decisions[0].allowed,true);
 assert.equal(JEU42_POLICY.relativeVolumeScale,1000000);
});
test('Game42 explicitly abstains when the phase or historical volume is unavailable',()=>{
 for(const options of [{pullbacks:[]},{breakout:null},{breakout:0},{pullbacks:[null]}]){
  const d=run(fixture(options)).decisions[0];assert.equal(d.allowed,true);assert.ok(['no-separate-counterdirectional-bar','relative-volume-unavailable'].includes(d.reason));
 }
});
test('Game42 baseline and other markets preserve stream identity; costs do not alter this veto',()=>{
 const f=fixture({pullbacks:[3]});assert.strictEqual(run(f,'baseline').streams[0],f.streams[0]);
 const n=fixture({symbol:'MNQ',pullbacks:[3]});assert.strictEqual(run(n).streams[0],n.streams[0]);assert.equal(run(n).decisions[0].allowed,true);
 assert.deepEqual(run(f,variant,1).decisions,run(f,variant,2).decisions);
});
test('Game42 never reads the entry bar high/low/close/volume or a later bar price',()=>{
 const f=fixture();for(const k of ['high','low','close','volume'])Object.defineProperty(f.streams[0].candles.at(-1),k,{get(){throw Error('Future field '+k);}});
 assert.equal(run(f).decisions[0].allowed,true);
 const old=run(f).decisions;f.streams[0].candles.push({time:f.time+300,get open(){throw Error('Future');}});
 assert.deepEqual(run(f).decisions,old);
});
test('Game42 checks chronology, source identity and causality instead of treating corrupt data as missing',()=>{
 for(const mutate of [f=>f.contexts.get('MES').values().next().value.closedAt+=300,f=>f.streams[0].candles[1].ticker='MESU6',f=>f.streams[0].candles[1].volume=-1,f=>f.streams[0].candles.splice(1,1),f=>f.contexts.get('MES').values().next().value.volumeRatio=NaN]){
  const f=fixture();mutate(f);assert.throws(()=>run(f));
 }
 assert.throws(()=>run(fixture(),'unknown'));assert.throws(()=>run(fixture(),variant,3));
});
test('Game42 the veto preserves every allowed original signal without consuming any account slot',()=>{
 const f=fixture();const result=run(f);assert.strictEqual(result.streams[0].signals.get(f.time),f.streams[0].signals.get(f.time));
 assert.equal(result.streams[0].candles,f.streams[0].candles);
 const b=f.streams[0].candles[0];assert.equal(relativeVolumeUnits42(undefined,b),null);
});
