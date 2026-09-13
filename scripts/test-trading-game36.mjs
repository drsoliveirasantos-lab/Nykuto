import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmMarketStreams} from '../trading/lab/jeu36-entries.mjs';
import {simulateMonthlyPortfolio} from '../trading/lab/jeu34-engine.mjs';
import {compareEntryRuns} from '../trading/lab/jeu36-comparison.mjs';
const period={start:'2026-06-01',end:'2026-06-02'},start=Date.parse('2026-06-01T13:30Z')/1000;
function fixture(symbol='MNQ',side='Long'){
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,signals:new Map(),candles:Array.from({length:78},(_,i)=>({time:start+i*300,day:period.start,minute:570+i*5,closeMinute:960,ticker:symbol+'M6',open:100,high:101,low:99,close:100}))}));
 const s=streams.find(s=>s.symbol===symbol),time=start+8*300;
 Object.assign(s.candles[7],{open:103,high:106,low:99.75,close:105});
 Object.assign(s.candles[8],{open:105,high:107,low:104,close:106});
 Object.assign(s.candles[9],{open:106,high:120,low:105,close:119});
 const signal={day:period.start,side,signalOpen:time-300,signalClose:time,rangeClosedAt:start+1800,breakoutAt:time-300,trendClosedAt:start+1800,rangeHigh:100,rangeLow:90,stopPrice:99.5,pattern:'orb-retest'};
 if(side==='Short'){
  for(const b of s.candles){const {open,high,low,close}=b;Object.assign(b,{open:200-open,high:200-low,low:200-high,close:200-close});}
  Object.assign(signal,{rangeHigh:110,rangeLow:100,stopPrice:100.5});
 }
 s.signals.set(time,signal);
 const contexts=new Map([[symbol,new Map([[time+300,{day:period.start,ticker:symbol+'M6',closedAt:time+300,sourceTime:time,rsi:50}]])]]);
 return {streams,s,time,contexts,variant:symbol==='MES'?'mes-confirm':'mnq-confirm'};
}
test('confirmation uses only closed bars, shifts the entry five minutes and retains the original stop symmetrically',()=>{
 for(const side of ['Long','Short']){
  const f=fixture('MNQ',side),base=simulateMonthlyPortfolio(f.streams,period),confirmed=confirmMarketStreams(f.streams,f.contexts,f.variant),out=simulateMonthlyPortfolio(confirmed.streams,period),t=out.trades[0];
  assert.deepEqual(confirmMarketStreams(f.streams,f.contexts,'baseline').streams,f.streams);
  assert.equal(t.entryTime,f.time+300);assert.equal(t.entry,side==='Long'?106:94);assert.equal(t.stop,side==='Long'?99.5:100.5);assert.equal(t.originalSignalClose,f.time);
  assert.ok(t.plannedRiskUSD<=100);assert.equal(Math.abs(t.target-t.entry),2*t.risk);
  const c=compareEntryRuns(base,out);assert.equal(c.delayedCommon,1);assert.equal(c.removed.count,0);assert.equal(c.added.count,0);
  const before=[...confirmed.streams.find(s=>s.symbol==='MNQ').signals];
  for(const b of f.s.candles.filter(b=>b.time>=f.time+300))Object.assign(b,{open:1000,high:1001,low:1,close:2});
  assert.deepEqual([...confirmMarketStreams(f.streams,f.contexts,f.variant).streams.find(s=>s.symbol==='MNQ').signals],before);
 }
});
test('touching the original stop or losing follow-through cancels the entry instead of using a future recovery',()=>{
 for(const side of ['Long','Short']){
  const f=fixture('MNQ',side);f.s.candles[8][side==='Long'?'low':'high']=side==='Long'?99.5:100.5;
  const c=confirmMarketStreams(f.streams,f.contexts,f.variant);assert.equal(c.decisions[0].reason,'original-stop-touched');assert.equal(c.streams.find(s=>s.symbol==='MNQ').signals.size,0);
 }
 const f=fixture();f.s.candles[8].close=105;assert.equal(confirmMarketStreams(f.streams,f.contexts,f.variant).decisions[0].reason,'no-directional-follow-through');
 f.s.candles[8].close=100;assert.equal(confirmMarketStreams(f.streams,f.contexts,f.variant).decisions[0].reason,'range-not-held');
 f.s.candles=f.s.candles.filter(b=>b.time!==f.time);assert.equal(confirmMarketStreams(f.streams,f.contexts,f.variant).decisions[0].reason,'confirmation-unavailable');
 assert.throws(()=>confirmMarketStreams(f.streams,f.contexts,'unknown'),/Unknown entry/);
});
test('MES RSI is checked at the delayed decision and confirmation never shifts entry past noon',()=>{
 for(const side of ['Long','Short']){
  const f=fixture('MES',side),context=f.contexts.get('MES').get(f.time+300);
  context.rsi=side==='Long'?71:29;assert.equal(confirmMarketStreams(f.streams,f.contexts,f.variant).decisions[0].reason,side==='Long'?'mes-overbought-long':'mes-oversold-short');
  context.rsi=side==='Long'?70:30;assert.equal(confirmMarketStreams(f.streams,f.contexts,f.variant).decisions[0].allowed,true);
  context.closedAt=f.time;assert.throws(()=>confirmMarketStreams(f.streams,f.contexts,f.variant),/Noncausal RSI/);
 }
 for(const i of [29,30]){
  const f=fixture(),s=f.s.signals.get(f.time),time=start+i*300;
  for(const [src,dst]of [[7,i-1],[8,i]]){const {open,high,low,close}=f.s.candles[src];Object.assign(f.s.candles[dst],{open,high,low,close});}
  f.s.signals=new Map([[time,{...s,signalOpen:time-300,signalClose:time}]]);
  const d=confirmMarketStreams(f.streams,f.contexts,f.variant).decisions[0];assert.equal(d.allowed,i===29);if(i===30)assert.equal(d.reason,'confirmation-too-late');
 }
});
test('an awaiting setup reserves no slot; another market may take the place before the delayed entry',()=>{
 const f=fixture(),mes=f.streams.find(s=>s.symbol==='MES'),time=f.time+300;
 mes.signals.set(time,{...f.s.signals.get(f.time),signalOpen:time-300,signalClose:time,rangeHigh:99,rangeLow:90,stopPrice:95});
 Object.assign(mes.candles[9],{high:112,close:110});
 const base=simulateMonthlyPortfolio(f.streams,period),candidate=simulateMonthlyPortfolio(confirmMarketStreams(f.streams,f.contexts,f.variant).streams,period);
 assert.equal(base.decisions.find(d=>d.symbol==='MES').reason,'occupied');assert.equal(candidate.decisions.find(d=>d.symbol==='MES').accepted,true);
 assert.equal(candidate.decisions.find(d=>d.symbol==='MNQ').reason,'simultaneous');
 const c=compareEntryRuns(base,candidate);assert.equal(c.removed.count,1);assert.equal(c.added.count,1);
});
