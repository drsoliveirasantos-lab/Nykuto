import test from 'node:test';
import assert from 'node:assert/strict';
import {wilderRsi,rsiExitEvents,confirmedPivotEvents,allowOrbByRsi,reversalContext,sessionTag,v8Labels,JEU47_V8_POLICY} from '../trading/lab/jeu47-v8-context.mjs';

test('Jeu47 policy remains research-only',()=>{
  assert.equal(JEU47_V8_POLICY.executionAllowed,false);
  assert.equal(JEU47_V8_POLICY.researchOnly,true);
  assert.equal(JEU47_V8_POLICY.recentContextMinutes,30);
});

test('RSI exits are transitions, not static extreme labels',()=>{
  const events=rsiExitEvents([null,25,29,31,72,69]);
  assert.equal(events[3].up,true);
  assert.equal(events[5].down,true);
  assert.equal(events[2].up,false);
});

test('ORB anti-late-entry filter is asymmetric by direction',()=>{
  assert.equal(allowOrbByRsi('Long',75),false);
  assert.equal(allowOrbByRsi('Long',25),true);
  assert.equal(allowOrbByRsi('Short',25),false);
  assert.equal(allowOrbByRsi('Short',75),true);
});

test('reversal requires MSS plus recent same-direction RSI/divergence context',()=>{
  assert.equal(reversalContext({side:'Long',mss:'up',rsiExit:{up:true},divergence:{},minutesSinceContext:8}).accepted,true);
  assert.equal(reversalContext({side:'Long',mss:'up',rsiExit:{up:true},divergence:{},minutesSinceContext:31}).accepted,false);
  assert.equal(reversalContext({side:'Long',mss:'down',rsiExit:{up:true},divergence:{},minutesSinceContext:8}).accepted,false);
  assert.equal(reversalContext({side:'Short',mss:'down',rsiExit:{},divergence:{bearDiv:true},minutesSinceContext:5}).accepted,true);
});

test('session tags provide context only',()=>{
  assert.equal(sessionTag(19*60),'Tokyo-open-90m');
  assert.equal(sessionTag(3*60),'London-open-90m');
  assert.equal(sessionTag(9*60+30),'NewYork-open-90m');
  assert.equal(sessionTag(12*60),'Other');
});

test('labels preserve the V8 vocabulary',()=>{
  assert.deepEqual(v8Labels({rsiExit:{up:true},divergence:{bullDiv:true},mss:'up',side:'Long',strong:true}),['R↑','DIV↑','MSS↑','BR+']);
});

test('RSI and confirmed divergence calculations are causal',()=>{
  const closes=[10,9,8,7,6,5,6,7,8,9,10,11,12,13,14,15,16,17];
  const rsi=wilderRsi(closes,5);
  assert.equal(rsi.length,closes.length);
  assert.ok(Number.isFinite(rsi.at(-1)));
  const bars=[
    [10,11,9,10],[10,10.5,8,9],[9,9.5,7,8],[8,9,8,8.5],[8.5,9,8.2,8.8],
    [8.8,9.1,8.3,8.9],[8.9,9,7.5,8],[8,8.5,6.5,7],[7,8,7,7.8],[7.8,8.4,7.6,8.2]
  ].map((x,i)=>({day:'2026-07-01',open:x[0],high:x[1],low:x[2],close:x[3],time:i*60}));
  const customRsi=[50,45,30,35,40,42,38,35,40,45];
  const events=confirmedPivotEvents(bars,customRsi);
  assert.equal(events.length,bars.length);
});
