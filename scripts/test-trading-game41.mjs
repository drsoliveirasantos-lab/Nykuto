import test from 'node:test';
import assert from 'node:assert/strict';
import {JEU41_POLICY,JEU41_VARIANTS} from '../trading/lab/jeu41-policy.mjs';
import {assessNetReward41,filterNetRewardStreams41} from '../trading/lab/jeu41-net-reward.mjs';
import {JEU29_PRODUCTS} from '../trading/lab/jeu29-policy.mjs';
import {confidenceSizedTerms} from '../trading/lab/jeu37-risk.mjs';

const time=Date.parse('2026-07-01T14:35:00Z')/1000,day='2026-07-01';
const product=symbol=>JEU29_PRODUCTS.find(p=>p.symbol===symbol);
function signal(side='Long',distance=5){
 const sign=side==='Long'?1:-1;
 return {day,side,signalOpen:time-300,signalClose:time,rangeClosedAt:time-2100,
  breakoutAt:time-300,trendClosedAt:time-2100,rangeHigh:sign===1?99:120,
  rangeLow:sign===1?80:101,stopPrice:100-sign*distance,pattern:'orb-retest'};
}
const assess=(s,factor=1,variant='mes-net15',symbol='MES')=>assessNetReward41(symbol,time,s,100,product(symbol),factor,variant);
function stream(symbol='MES',s=signal()){
 return {symbol,candles:[{day,time,minute:635,ticker:symbol+'U6',open:100,high:101,low:99,close:100.5}],signals:new Map([[time,s]])};
}

test('one MES cost-margin variant preserves eight-month risk policy and exact inclusive integer boundaries in both directions',()=>{
 assert.deepEqual(JEU41_VARIANTS.map(v=>v.id),['baseline','mes-net15']);
 assert.equal(JEU41_POLICY.riskMaximumUSD,100);assert.equal(JEU41_POLICY.targetR,2);
 assert.equal(JEU41_POLICY.executionCount,32);assert.equal(JEU41_POLICY.exactControls,16);
 assert.equal(JEU41_POLICY.newConfigurations,1);assert.equal(JEU41_POLICY.executionAllowed,false);
 for(const side of ['Long','Short'])for(const [factor,distance,cost]of [[1,5,5],[2,10,10]]){
  const boundary=assess(signal(side,distance),factor);
  assert.equal(boundary.allowed,true);assert.equal(boundary.unitRiskUSD,5*cost);
  assert.equal(boundary.unitCostUSD,cost);assert.equal(boundary.netRewardRisk,1.5);
  assert.equal(assess(signal(side,distance-.25),factor).reason,'mes-net-reward-below-1.5');
  assert.equal(assess(signal(side,distance+.25),factor).allowed,true);
 }
});

test('net margin is independent of integer quantity and does not change stop, target or sizing',()=>{
 for(const factor of [1,2]){
  const s=signal('Long',factor===1?5:10),decision=assess(s,factor),unchanged=structuredClone(s);
  const counts=[];
  for(const cap of [100,500]){
   const {terms}=confidenceSizedTerms(s,100,time,product('MES'),factor,cap);
   counts.push(terms.quantity);
   assert.equal((2*terms.riskDollars-terms.costDollars)/(terms.riskDollars+terms.costDollars),decision.netRewardRisk);
   assert.equal(terms.risk,100-s.stopPrice);assert.equal(terms.targetDistance,2*terms.risk);
  }
  assert.notEqual(counts[0],counts[1]);assert.deepEqual(s,unchanged);
 }
});

test('baseline and other markets keep the exact streams; MES veto consumes no signal or source state',()=>{
 const mes=stream('MES',signal('Long',4.75)),other=['MNQ','MGC','MYM'].map(s=>stream(s));
 const all=[mes,...other],before=[...mes.signals];
 const baseline=filterNetRewardStreams41(all,1,'baseline');
 baseline.streams.forEach((s,i)=>assert.equal(s,all[i]));assert.ok(baseline.decisions.every(d=>d.allowed));
 const filtered=filterNetRewardStreams41(all,1,'mes-net15');
 assert.equal(filtered.streams[0].signals.size,0);assert.equal(filtered.decisions[0].reason,'mes-net-reward-below-1.5');
 other.forEach((s,i)=>assert.equal(filtered.streams[i+1],s));assert.deepEqual([...mes.signals],before);
 assert.equal(filtered.streams[0].candles,mes.candles);
});

test('entry candle future extremes and close are never read, including throwing accessors; later bars cannot change the decision',()=>{
 const original=stream(),expected=filterNetRewardStreams41([original],1,'mes-net15').decisions;
 const b={...original.candles[0]};
 for(const key of ['high','low','close'])Object.defineProperty(b,key,{get(){throw Error('Future entry data read');}});
 const modified={...original,candles:[b,{day,time:time+300,minute:640,ticker:'MESU6',open:1,high:10000,low:0,close:0}]};
 assert.deepEqual(filterNetRewardStreams41([modified],1,'mes-net15').decisions,expected);
});

test('invalid stops and returned-inside opens stay with original engine validation, not a new net-margin veto',()=>{
 for(const stopPrice of [100,101,99.9,NaN,null]){
  const d=assess({...signal(),stopPrice});assert.equal(d.allowed,true);assert.equal(d.reason,'engine-validates-stop');
 }
 const inside={...signal(),rangeHigh:101};assert.equal(assess(inside).reason,'engine-validates-entry');
 assert.equal(assess({...signal('Short'),stopPrice:99}).reason,'engine-validates-stop');
});

test('noncausal signals, source mismatches and malformed inputs fail closed before any account replay',()=>{
 assert.throws(()=>assess({...signal(),signalOpen:time}),/noncausal/);
 assert.throws(()=>assess({...signal(),breakoutAt:time}),/noncausal/);
 assert.throws(()=>assess({...signal(),trendClosedAt:time+300}),/noncausal/);
 assert.throws(()=>assess({...signal(),day:'2026-07-02'}),/session/);
 assert.throws(()=>assess(signal(),3),/policy/);
 assert.throws(()=>assess(signal(),1,'unknown'),/policy/);
 assert.throws(()=>assessNetReward41('MES',time,signal(),100.1,product('MES'),1,'mes-net15'),/entry open/);
 assert.throws(()=>assessNetReward41('MES',time,signal(),100,{...product('MES'),fees:0},1,'mes-net15'),/product/);
 const original=stream();
 for(const change of [{day:'2026-07-02'},{minute:640},{ticker:'MNQU6'}])
  assert.throws(()=>filterNetRewardStreams41([{...original,candles:[{...original.candles[0],...change}]}],1,'mes-net15'),/source/);
 assert.throws(()=>filterNetRewardStreams41([{...original,candles:[]}],1,'mes-net15'),/source/);
 assert.throws(()=>filterNetRewardStreams41([{...original,candles:[original.candles[0],original.candles[0]]}],1,'mes-net15'),/duplicate/);
});
