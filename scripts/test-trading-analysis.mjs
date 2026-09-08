import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAnalysisWindow, aggregateCashHours, analyzeCandles, candlePatterns } from '../trading/analysis/structure-core.mjs';

const start=Date.parse('2026-01-05T14:30:00Z')/1000;
const bar=(i,value=100,extra={})=>({time:start+i*900,closedAt:start+(i+1)*900,day:'2026-01-05',minute:570+i*15,open:value,high:value+0.5,low:value-0.5,close:value,volume:10,...extra});
const down=()=>[100,101,104,102,101,98,100,101,103,101,100,97,99,100,102,100,99,96,98,100].map((v,i)=>bar(i,v));

test('selection excludes both old context and future candles before calculating anything',()=>{
  const chosen=down(),poison=new Proxy({}, {get(){throw new Error('Unselected candle read');}});
  const source=[poison,...chosen,poison];
  assert.deepEqual(analyzeCandles(selectAnalysisWindow(source,20,20)),analyzeCandles(chosen));
  assert.equal(selectAnalysisWindow(chosen,100,4).length,5);
  for(const count of [0,19,20.5,501,NaN])assert.throws(()=>selectAnalysisWindow(chosen,count,19));
  assert.throws(()=>selectAnalysisWindow(chosen,20,20));
});

test('swing highs require two subsequent closed bars and cannot repaint earlier breaks',()=>{
  const bars=down();
  assert.equal(analyzeCandles(bars.slice(0,4)).highs.length,0);
  const confirmed=analyzeCandles(bars.slice(0,5)).highs[0];
  assert.equal(confirmed.time,bars[2].time);assert.equal(confirmed.confirmedAt,bars[4].closedAt);
  const full=analyzeCandles(bars);
  assert.equal(full.structure,'Baissière');
  for(let n=1;n<=bars.length;n++){
    const earlier=analyzeCandles(bars.slice(0,n));
    assert.deepEqual(earlier.events,full.events.filter(e=>e.closedAt<=bars[n-1].closedAt));
    assert.ok([...earlier.highs,...earlier.lows].every(p=>p.confirmedAt<=bars[n-1].closedAt&&p.time<bars[Math.max(0,n-2)].time));
  }
});

test('MSS requires an opposite close and aligned impulse; a wick or bearish gap body is not enough',()=>{
  const base=down(),prior=analyzeCandles(base);
  const event=extra=>analyzeCandles([...base,bar(20,100,extra)]).events.at(-1);
  const strong=event({open:100,high:104.25,low:99.75,close:104});
  assert.equal(strong.kind,'MSS potentiel');assert.equal(strong.direction,'up');assert.equal(strong.previousBias,'down');assert.equal(strong.level,102.5);
  assert.ok(strong.pivotConfirmedAt<strong.closedAt);
  assert.deepEqual(event({open:100,high:106,low:99.75,close:102}),prior.events.at(-1));
  assert.equal(event({open:103.9,high:104.5,low:100,close:104}).kind,'Rupture opposée');
  assert.equal(event({open:108,high:108.25,low:103.75,close:104}).kind,'Rupture opposée');
  const reflected=[...base,bar(20,100,{open:100,high:104.25,low:99.75,close:104})].map(c=>({...c,open:200-c.open,high:200-c.low,low:200-c.high,close:200-c.close}));
  const inverse=analyzeCandles(reflected).events.at(-1);
  assert.equal(inverse.kind,'MSS potentiel');assert.equal(inverse.direction,'down');assert.equal(inverse.previousBias,'up');
});

test('hourly aggregation keeps complete cash blocks, exact OHLCV and holiday tails',()=>{
  const halfDay=Array.from({length:14},(_,i)=>bar(i,100+i));
  const hours=aggregateCashHours(halfDay);
  assert.equal(hours.length,3);
  assert.deepEqual([hours[0].open,hours[0].high,hours[0].low,hours[0].close,hours[0].volume,hours[0].closedAt],[100,103.5,99.5,103,40,start+3600]);
  assert.equal(hours.at(-1).time,start+8*900);
  assert.equal(aggregateCashHours(halfDay.filter((_,i)=>i!==2)).length,2);
  const mixed=[...halfDay.slice(0,2),...halfDay.slice(2,4).map(c=>({...c,day:'2026-01-06'}))];
  assert.equal(aggregateCashHours(mixed).length,0);
  assert.doesNotThrow(()=>analyzeCandles(hours,3600));
});

test('engulfing is defined on bodies only within contiguous same-session candles',()=>{
  const previous=bar(0,100,{open:103,high:104,low:99,close:100});
  const next=bar(1,100,{open:99,high:105,low:98,close:104});
  assert.ok(candlePatterns(previous,next,900).includes('Englobante haussière'));
  assert.ok(!candlePatterns(previous,{...next,day:'2026-01-06'},900).includes('Englobante haussière'));
  assert.ok(!candlePatterns(previous,{...next,time:next.time+900},900).includes('Englobante haussière'));
  assert.deepEqual(candlePatterns(null,bar(0),900),['Doji']);
  assert.deepEqual(candlePatterns(null,bar(0,100,{high:100,low:100}),900),['Sans amplitude']);
  assert.ok(candlePatterns(null,bar(0,100,{open:100,close:101,low:97,high:101.5}),900).includes('Forme de marteau'));
});

test('malformed prices, duplicate times and interval confusion fail instead of producing a confident reading',()=>{
  for(const extra of [{open:null},{volume:'10'},{close:Infinity},{low:0},{high:90},{closedAt:start+3600},{day:null}])assert.throws(()=>analyzeCandles([bar(0,100,extra)]));
  assert.throws(()=>analyzeCandles([bar(0),bar(0)]));assert.throws(()=>analyzeCandles([bar(0)],3600));
  const short=analyzeCandles([bar(0)]);assert.equal(short.insufficient,true);assert.equal(short.momentum,'Insuffisant');assert.equal(short.volumeRatio,null);assert.equal(short.ordersEnabled,false);
  assert.equal(analyzeCandles(Array.from({length:21},(_,i)=>bar(i))).volumeRatio,1);
});
