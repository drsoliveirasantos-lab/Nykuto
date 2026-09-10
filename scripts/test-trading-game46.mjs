import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {simulateConfidencePortfolio as current} from '../trading/lab/jeu46-engine.mjs';
import {simulateConfidencePortfolio as old} from '../trading/lab/jeu45-engine.mjs';
import {invalidationDecision46} from '../trading/lab/jeu46-exit.mjs';
import {JEU46_POLICY,JEU46_VARIANTS} from '../trading/lab/jeu46-policy.mjs';
import {progressionReview46} from '../trading/lab/jeu46-diagnostic.mjs';
import {verifyPolicy46Protocol} from '../trading/lab/jeu46-protocol-table.mjs';
const stamp=s=>Date.parse(s)/1000;
function fixture(side='Long',symbol='MNQ'){
 const day='2026-06-01',start=stamp(day+'T13:30Z'),time=start+2400,sign=side==='Long'?1:-1;
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,signals:new Map(),candles:Array.from({length:78},(_,i)=>({time:start+i*300,day,minute:570+i*5,closeMinute:960,ticker:symbol+'M6',open:100,high:101,low:99,close:100}))}));
 const s=streams.find(s=>s.symbol===symbol),signal={day,side,signalOpen:time-300,signalClose:time,rangeClosedAt:start+1800,breakoutAt:start+2100,trendClosedAt:start+1800,rangeHigh:sign===1?99:111,rangeLow:sign===1?89:101,stopPrice:100-sign*10,pattern:'orb-retest'};
 s.signals.set(time,signal);
 const bar=t=>s.candles.find(b=>b.time===t),change=(t,values)=>Object.assign(bar(t),sign===1?values:Object.fromEntries(Object.entries(values).map(([k,v])=>[k==='high'?'low':k==='low'?'high':k,200-v])));
 change(time+2100,{high:121,close:120});
 return {streams,s,signal,time,sign,bar,change,contexts:new Map(),period:{start:day,end:'2026-06-02'}};
}
const run=(f,symbol='MNQ',factor=1)=>current(f.streams,f.contexts,f.period,factor,'fixed100',null,symbol);
test('both disabled and MNQ30 control modes reproduce complete frozen accounts',()=>{
 for(const side of ['Long','Short'])for(const symbol of ['MNQ','MES'])for(const factor of [1,2])for(const timed of [null,'MNQ']){
  const f=fixture(side,symbol),before=structuredClone({streams:f.streams,contexts:f.contexts});
  assert.deepEqual(current(f.streams,f.contexts,f.period,factor,'fixed100',timed,null),old(f.streams,f.contexts,f.period,factor,'fixed100',timed));
  assert.deepEqual({streams:f.streams,contexts:f.contexts},before);
 }
});
test('closed strict reentry schedules next-open exit from the entry M5 for both sides, indices and costs',()=>{
 for(const side of ['Long','Short'])for(const symbol of ['MNQ','MES'])for(const factor of [1,2]){
  const f=fixture(side,symbol);f.change(f.time,{low:97,close:98});f.change(f.time+300,{open:97.5,low:97,high:101,close:100});
  const t=run(f,symbol,factor).trades[0];
  assert.equal(t.reason,'Closed range invalidation');assert.equal(t.exitTime,f.time+300);assert.equal(t.exit,side==='Long'?97.5:102.5);
  assert.equal(t.invalidationDecisionAt,t.exitTime);assert.equal(t.invalidationClose,side==='Long'?98:102);
  assert.equal(t.stop,t.initialStop);assert.equal(t.targetDistance,2*t.risk);assert.ok(t.plannedRiskUSD<=100);
 }
});
test('a wick through the range or a close exactly on its boundary does not invalidate',()=>{
 for(const side of ['Long','Short'])for(const close of [99,100]){
  const f=fixture(side);f.change(f.time,{low:97,close});
  assert.deepEqual(run(f),run(f,null));
 }
});
test('a later losing-looking reentry can cut a winner; tests must retain this failure case',()=>{
 const f=fixture();f.change(f.time+600,{low:97,close:98});
 assert.equal(run(f).trades[0].exitTime,f.time+900);
 assert.ok(run(f).trades[0].netDollars<0);assert.ok(run(f,null).trades[0].netDollars>0);
});
test('original stop and target on the decision M5 take priority over structural exit',()=>{
 for(const[values,reason,ambiguous]of [[{high:121,low:89,close:98},'Stop',true],[{high:121,low:97,close:98},'Target',false]]){
  const f=fixture();f.change(f.time,values);const t=run(f).trades[0];
  assert.equal(t.reason,reason);assert.equal(t.ambiguous,ambiguous);assert.equal(t.invalidationAt,undefined);
 }
});
test('next-open stop and target gaps retain priority, and future extremes cannot improve a fill',()=>{
 for(const side of ['Long','Short'])for(const[open,reason]of [[89,'Stop gap'],[121,'Target open'],[98,'Closed range invalidation']]){
  const f=fixture(side);f.change(f.time,{low:97,close:98});f.change(f.time+300,{open,high:130,low:80,close:100});
  const t=run(f).trades[0];assert.equal(t.reason,reason);assert.equal(t.exit,reason==='Target open'?100+f.sign*20:100+f.sign*(open-100));
 }
 const f=fixture();f.change(f.time,{low:97,close:98});f.change(f.time+300,{open:1,high:101,low:1,close:100});
 assert.equal(run(f).trades[0].reason,'Daily gap');
});
test('whole exit slot stays occupied but a following M5 can admit another market',()=>{
 const f=fixture(),mes=f.streams.find(s=>s.symbol==='MES');f.change(f.time,{low:97,close:98});
 for(const delta of [300,600]){const time=f.time+delta;mes.signals.set(time,{...f.signal,signalOpen:time-300,signalClose:time});}
 const r=run(f);assert.ok(r.decisions.some(d=>d.symbol==='MES'&&d.time===f.time+300&&d.reason==='occupied'));
 assert.ok(r.decisions.some(d=>d.symbol==='MES'&&d.time===f.time+600&&d.accepted));
});
test('the other market stays on its original exit, and combinations or increased risk are refused',()=>{
 const f=fixture();f.change(f.time,{low:97,close:98});assert.deepEqual(run(f,'MES'),run(f,null));
 assert.throws(()=>current(f.streams,f.contexts,f.period,1,'fixed500'));
 assert.throws(()=>current(f.streams,f.contexts,f.period,1,'fixed100','MNQ','MES'));
 assert.throws(()=>current(f.streams,f.contexts,f.period,1,'fixed100',null,'MGC'));
});
test('future candles and unused fields cannot change an already decided opening fill',()=>{
 const f=fixture();f.change(f.time,{low:97,close:98});const t=run(f).trades[0];
 for(const b of f.s.candles.filter(b=>b.time>=f.time+300)){b.high=150;b.low=50;b.close=140;}
 assert.deepEqual(run(f).trades[0],t);
 const bar={time:f.time,day:f.signal.day,close:98};for(const field of ['high','low','open','volume'])Object.defineProperty(bar,field,{get(){throw Error('Unused field read');}});
 assert.equal(invalidationDecision46({...t,pattern:'orb-retest'},bar,'MNQ').invalidationAt,f.time+300);
});
test('invalid clocks, side, price and day fail closed; equality remains defined',()=>{
 const f=fixture(),p={...f.signal,symbol:'MNQ',entryTime:f.time},b={time:f.time,day:f.signal.day,close:98};
 for(const bar of [{...b,time:b.time-300},{...b,close:NaN},{...b,day:'2026-06-02'}])assert.throws(()=>invalidationDecision46(p,bar,'MNQ'));
 assert.throws(()=>invalidationDecision46({...p,side:'Unknown'},b,'MNQ'));
 assert.equal(invalidationDecision46(p,{...b,close:99},'MNQ'),null);
});
test('forced cash-close exit keeps precedence when it coincides with a scheduled invalidation',()=>{
 const f=fixture();f.change(f.time+2100,{high:101,low:99,close:100});
 const decision=f.s.candles.find(b=>b.minute===940);f.change(decision.time,{low:97,close:98});
 const t=run(f).trades[0];assert.equal(t.reason,'Session close');assert.equal(t.exitTime,decision.time+300);assert.equal(t.invalidationAt,t.exitTime);
});
test('progress requires both predeclared comparisons without ever promoting the candidate',()=>{
 const passed={descriptiveGatePassed:true},failed={descriptiveGatePassed:false};
 assert.equal(progressionReview46(passed,failed).progressionGatePassed,false);
 assert.equal(progressionReview46(failed,passed).progressionGatePassed,false);
 const r=progressionReview46(passed,passed);assert.equal(r.progressionGatePassed,true);assert.equal(r.selection,null);assert.equal(r.confirmed,false);
});
test('policy matches the protocol and preserves exactly two isolated new configurations',()=>{
 const text=readFileSync('trading/lab/JEU46_PROTOCOL.md','utf8');verifyPolicy46Protocol(text);
 assert.throws(()=>verifyPolicy46Protocol(text.replace('"equalityInvalidates": false','"equalityInvalidates": true')));
 assert.equal(JEU46_VARIANTS.length,4);assert.equal(JEU46_POLICY.newConfigurations,2);assert.equal(JEU46_POLICY.executionCount,64);
 assert.equal(JEU46_POLICY.riskMaximumUSD,100);assert.equal(JEU46_POLICY.targetR,2);
});
test('doubled costs retain the100USD cap and can reduce quantity instead of doubling risk',()=>{
 const f=fixture(),normal=run(f,null,1).trades[0],stress=run(f,null,2).trades[0];
 assert.equal(normal.costDollars/normal.quantity,3.5);assert.equal(stress.costDollars/stress.quantity,7);
 assert.equal(normal.riskCapUSD,100);assert.equal(stress.riskCapUSD,100);
 assert.equal(normal.quantity,4);assert.equal(stress.quantity,3);
 assert.equal(normal.plannedRiskUSD,94);assert.equal(stress.plannedRiskUSD,81);
});
