import test from 'node:test';
import assert from 'node:assert/strict';
import {openingSignals} from '../trading/lab/jeu22-signals.mjs';
import {openingTerms,simulateOpening} from '../trading/lab/jeu22-engine.mjs';
import {JEU22_PRODUCTS,JEU22_SCENARIOS} from '../trading/lab/jeu22-policy.mjs';
const product=JEU22_PRODUCTS.find(p=>p.symbol==='MNQ'),scenario=JEU22_SCENARIOS[0];
const window={start:'2026-01-02',end:'2026-01-03'};
function fixture(){
  const time=Date.parse('2026-01-02T14:30:00Z')/1000;
  const bars=Array.from({length:78},(_,i)=>({time:time+i*300,day:'2026-01-02',minute:570+i*5,closeMinute:960,ticker:'MNQH6',open:110,high:120,low:100,close:110,volume:100}));
  Object.assign(bars[6],{open:118,high:131,low:117,close:130});
  Object.assign(bars[7],{open:130,high:132,low:115,close:131});
  Object.assign(bars[8],{open:131,high:133,low:128,close:132});
  Object.assign(bars[9],{open:132,high:156,low:131,close:150});
  return bars;
}
test('opening range, breakout and retest are three causally ordered events',()=>{
  const bars=fixture(),all=openingSignals(bars,product);assert.equal(all.size,1);
  const [time,s]=[...all][0];assert.equal(time,bars[8].time);assert.equal(s.rangeClosedAt,bars[6].time);assert.equal(s.breakoutAt,bars[7].time);assert.equal(s.signalOpen,bars[7].time);assert.equal(s.stopPrice,114.75);
  for(let cut=1;cut<=bars.length;cut++)assert.deepEqual([...openingSignals(bars.slice(0,cut),product)],[...all].filter(([t])=>t<=bars[cut-1].time+300));
  assert.throws(()=>openingSignals(bars.filter((_,i)=>i!==2),product),/Gap|Incomplete/);
});
test('structural stop uses the actual next opening price and the product tick',()=>{
  const bars=fixture(),signals=openingSignals(bars,product),s=signals.get(bars[8].time);
  const t=openingTerms(s,131,bars[8].time,product).terms;
  assert.equal(t.risk,16.25);assert.equal(t.riskDollars,32.5);assert.equal(t.costDollars,3.5);
  const normal=simulateOpening(bars,signals,scenario,product,window,1,false),stress=simulateOpening(bars,signals,scenario,product,window,2,false);
  assert.equal(normal.trades.length,1);assert.equal(normal.trades[0].stop,s.stopPrice);assert.equal(normal.trades[0].netDollars,45);assert.equal(stress.trades[0].netDollars,41.5);
  assert.equal(openingTerms(s,120,bars[8].time,product).blocked,'returnedInside');
  const tooWide=structuredClone(bars);tooWide[8]={...tooWide[8],open:145,high:146,low:128,close:132};
  const denied=simulateOpening(tooWide,signals,scenario,product,window,1,false);assert.equal(denied.trades.length,0);assert.equal(denied.denied.tradeRisk,1);
});
test('short entries mirror long entries and retain conservative ambiguous-bar fills',()=>{
  const bars=fixture().map(b=>({...b,open:220-b.open,high:220-b.low,low:220-b.high,close:220-b.close})),signals=openingSignals(bars,product);
  assert.equal([...signals.values()][0].side,'Short');
  const r=simulateOpening(bars,signals,scenario,product,window,1,false);assert.equal(r.trades.length,1);assert.equal(r.trades[0].netDollars,45);
  const ambiguous=fixture();ambiguous[8]={...ambiguous[8],high:160,low:110};
  const a=simulateOpening(ambiguous,openingSignals(ambiguous,product),scenario,product,window,1,false);assert.equal(a.trades[0].reason,'Stop');assert.equal(a.trades[0].ambiguous,true);assert.equal(a.trades[0].netDollars,-36);
});
test('no repeated same-side signal or afternoon entry; failed breakouts are discarded',()=>{
  const bars=fixture();Object.assign(bars[10],{open:130,high:132,low:115,close:131});assert.equal(openingSignals(bars,product).size,1);
  const failed=fixture();Object.assign(failed[7],{open:130,high:132,low:115,close:119});assert.equal(openingSignals(failed.slice(0,9),product).size,0);
  const late=fixture();for(let i=6;i<30;i++)Object.assign(late[i],{open:110,high:120,low:100,close:110});
  Object.assign(late[30],{open:118,high:131,low:117,close:130});Object.assign(late[31],{open:130,high:132,low:115,close:131});assert.equal(openingSignals(late,product).size,0);
});
test('daily and account prefixes reproduce all fills without future observations',()=>{
  const bars=fixture(),signals=openingSignals(bars,product),full=simulateOpening(bars,signals,scenario,product,window,1,true);
  const untilExit=bars.slice(0,10).concat(bars.filter(b=>b.minute>=945));
  const prefix=simulateOpening(untilExit,signals,scenario,product,window,1,true);assert.deepEqual(prefix.trades,full.trades);assert.deepEqual(prefix.days,full.days);
});
