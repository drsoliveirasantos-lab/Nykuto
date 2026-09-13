import test from 'node:test';
import assert from 'node:assert/strict';
import {failedBreakoutSignals} from '../trading/lab/jeu26-signals.mjs';
import {failedBreakoutTerms,failedRiskProfile} from '../trading/lab/jeu26-terms.mjs';
import {simulateFailure} from '../trading/lab/jeu26-engine.mjs';
import {JEU26_PRODUCTS,JEU26_SCENARIOS} from '../trading/lab/jeu26-policy.mjs';
const product=JEU26_PRODUCTS[0],scenario=JEU26_SCENARIOS[0],period={start:'2026-01-02',end:'2026-01-04'};
function fixture(){
  const time=Date.parse('2026-01-02T14:30:00Z')/1000;
  const bars=Array.from({length:78},(_,i)=>({time:time+i*300,day:'2026-01-02',minute:570+i*5,closeMinute:960,ticker:'MNQH6',open:138,high:139,low:137,close:138,volume:100}));
  for(let i=0;i<6;i++)Object.assign(bars[i],{open:120,high:140,low:100,close:120});
  Object.assign(bars[6],{open:139,high:145,low:137,close:144});
  Object.assign(bars[7],{open:144,high:148,low:138,close:139});
  Object.assign(bars[9],{open:138,high:139,low:110,close:120});
  return bars;
}
const run=(bars,factor=1,account=false)=>simulateFailure(bars,failedBreakoutSignals(bars,product),scenario,product,period,factor,account);
test('closed failure reverses the initial breakout with the whole excursion stop, symmetric long and short',()=>{
  const bars=fixture(),r=run(bars),t=r.trades[0];
  assert.equal(r.trades.length,1);assert.equal(t.side,'Short');assert.equal(t.entryTime,bars[8].time);
  assert.equal(t.stop,148.25);assert.equal(t.target,122.75);assert.equal(t.netDollars,27);
  const mirror=bars.map(b=>({...b,open:240-b.open,high:240-b.low,low:240-b.high,close:240-b.close}));
  const m=run(mirror);assert.equal(m.trades.length,1);assert.equal(m.trades[0].side,'Long');assert.equal(m.trades[0].netDollars,t.netDollars);
});
test('a sustained selloff and an intrabar wick are not closed failure signals',()=>{
  const bars=fixture();for(let i=6;i<bars.length;i++)Object.assign(bars[i],{open:99,high:110,low:90,close:95});
  assert.equal(failedBreakoutSignals(bars,product).size,0);assert.equal(run(bars).trades.length,0);
  const wick=fixture();Object.assign(wick[6],{open:139,high:145,low:137,close:139});
  assert.equal(failedBreakoutSignals(wick,product).size,0);
});
test('signals need completed ranges, a directional first re-entry, and expire without moving the clock',()=>{
  const flat=fixture();Object.assign(flat[7],{open:139,high:148,low:138,close:139});
  assert.equal(failedBreakoutSignals(flat,product).size,0);
  const late=fixture();for(let i=7;i<=12;i++)Object.assign(late[i],{open:144,high:145,low:143,close:144});
  Object.assign(late[13],{open:144,high:145,low:138,close:139});assert.equal(failedBreakoutSignals(late,product).size,0);
  const edge=fixture();for(let i=7;i<12;i++)Object.assign(edge[i],{open:144,high:145,low:143,close:144});
  Object.assign(edge[12],{open:144,high:145,low:138,close:139});assert.equal(failedBreakoutSignals(edge,product).size,1);
  assert.throws(()=>failedBreakoutSignals(fixture().filter((_,i)=>i!==2),product),/Gap|Incomplete/);
  const roll=fixture();roll[6].ticker='MNQM6';assert.throws(()=>failedBreakoutSignals(roll,product),/contract/);
});
test('every prefix is causal and fresh excursions can re-arm after an expired return',()=>{
  const bars=fixture();Object.assign(bars[11],bars[6],{time:bars[11].time,minute:bars[11].minute});
  Object.assign(bars[12],bars[7],{time:bars[12].time,minute:bars[12].minute});
  const all=failedBreakoutSignals(bars,product);assert.equal(all.size,2);
  for(let n=1;n<=bars.length;n++)assert.deepEqual([...failedBreakoutSignals(bars.slice(0,n),product)],[...all].filter(([t])=>t<=bars[n-1].time+300));
  assert.equal(run(bars).trades.length,1);assert.ok(run(bars).denied.sideLimit>0);
});
test('next-open gaps outside the range refuse entry and targets are bounded by the opposite edge',()=>{
  const bars=fixture(),s=[...failedBreakoutSignals(bars,product).values()][0];
  assert.equal(failedBreakoutTerms(s,141,s.signalClose,product).blocked,'outsideRange');
  assert.equal(failedBreakoutTerms(s,100,s.signalClose,product).blocked,'outsideRange');
  const terms=failedBreakoutTerms(s,128.5,s.signalClose,product).terms;assert.equal(128.5-terms.targetDistance,100);
  assert.equal(failedBreakoutTerms(s,110,s.signalClose,product).blocked,'netReward');
  Object.assign(bars[8],{open:141,high:142,low:137,close:138});assert.equal(run(bars).trades.length,0);assert.equal(run(bars).denied.outsideRange,1);
});
test('cost stress, immutable risk cap and pessimistic same-bar fills are enforced',()=>{
  const bars=fixture();assert.equal(run(bars,2).trades.length,0);assert.equal(run(bars,2).denied.netReward,1);
  const stress=fixture();stress[7].high=156;assert.equal(run(stress,2).trades[0].netDollars,47.5);
  const wide=fixture();wide[7].high=220;assert.equal(run(wide).trades.length,0);
  const a=fixture();Object.assign(a[8],{high:150,low:110});const r=run(a);assert.equal(r.trades[0].reason,'Stop');assert.equal(r.trades[0].ambiguous,true);assert.equal(r.trades[0].netDollars,-24);
  assert.throws(()=>failedRiskProfile({...scenario,riskPerTrade:500}),/Invalid risk/);
  const s=[...failedBreakoutSignals(bars,product).values()][0];assert.throws(()=>failedBreakoutTerms({...s,stopPrice:145},138,s.signalClose,product),/excursion/);
});
test('account prefixes and side consumption reset each session without using future bars',()=>{
  const one=fixture(),two=one.map(b=>({...b,time:b.time+86400,day:'2026-01-03'})),prefix=run(one,1,true),full=run([...one,...two],1,true);
  assert.equal(full.trades.length,2);assert.ok(full.days.every(d=>d.trades<=2));
  assert.deepEqual(prefix.trades,full.trades.filter(t=>t.day==='2026-01-02'));assert.deepEqual(prefix.days,full.days.slice(0,1));
});
test('entries stop at noon New York and late re-entries cannot borrow a prior session range',()=>{
  const bars=fixture();for(let i=6;i<30;i++)Object.assign(bars[i],{open:138,high:139,low:137,close:138});
  Object.assign(bars[30],{open:139,high:145,low:137,close:144});Object.assign(bars[31],{open:144,high:148,low:138,close:139});
  assert.equal(failedBreakoutSignals(bars,product).size,0);
  const next=fixture().map(b=>({...b,time:b.time+86400,day:'2026-01-03'})).slice(6);
  assert.throws(()=>failedBreakoutSignals([...bars,...next],product),/range unavailable/);
});
