import test from 'node:test';
import assert from 'node:assert/strict';
import {obstacleDecision38,filterObstacleStreams38} from '../trading/lab/jeu38-obstacles.mjs';
const signal={day:'2026-07-01',side:'Long',signalOpen:600,signalClose:900,stopPrice:95};
const pivot=price=>({price,sourceTime:0,confirmedAt:900});
const context={day:signal.day,sourceTime:600,closedAt:900,structure:'Short',highs:[pivot(106)],lows:[pivot(94)]};
test('MNQ filter requires BOTH explicit opposed structure and confirmed obstacle strictly before 2R, symmetrically',()=>{
 assert.equal(obstacleDecision38(signal,100,context).accepted,false);
 for(const structure of ['Long','Mixed',null])assert.equal(obstacleDecision38(signal,100,{...context,structure}).accepted,true);
 for(const price of [99,100,110,111])assert.equal(obstacleDecision38(signal,100,{...context,highs:[pivot(price)]}).accepted,true);
 const short={...signal,side:'Short',stopPrice:105};assert.equal(obstacleDecision38(short,100,{...context,structure:'Long'}).accepted,false);
 assert.equal(obstacleDecision38(short,100,{...context,structure:'Long',lows:[pivot(90)]}).accepted,true);
 assert.equal(obstacleDecision38(signal,100,null).reason,'unknown-context');
});
test('unconfirmed/future pivots and misaligned context fail; entry candle extremes cannot affect admission; other profiles remain identical',()=>{
 assert.throws(()=>obstacleDecision38(signal,100,{...context,highs:[{...pivot(106),confirmedAt:1200}]}),/Unconfirmed/);
 assert.throws(()=>obstacleDecision38(signal,100,{...context,closedAt:1200}),/Noncausal/);
 const a={symbol:'MNQ',candles:[{time:900,open:100,high:101,low:99}],signals:new Map([[900,signal]])},b={...a,symbol:'MGC'},contexts=new Map([['MNQ',new Map([[900,context]])]]);
 const result=filterObstacleStreams38([a,b],contexts);assert.equal(result.streams[0].signals.size,0);assert.equal(a.signals.size,1);assert.equal(result.streams[1],b);
 const changed={...a,candles:[{time:900,open:100,high:1000,low:1},{time:1200,open:900}]};assert.deepEqual(filterObstacleStreams38([changed],contexts).decisions,result.decisions);
});
