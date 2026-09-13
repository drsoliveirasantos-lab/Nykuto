import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAnalysisWindow, aggregateCashHours, analyzeCandles, candlePatterns } from '../trading/analysis/structure-core.mjs';
import { calculateIndicators, chartMarkers, DEFAULT_LAYERS } from '../trading/analysis/chart-indicators.mjs';
import { createAnalysisChart } from '../trading/analysis/chart-view.mjs';

const start=Date.parse('2026-01-05T14:30:00Z')/1000;
const bar=(i,value=100,extra={})=>({time:start+i*900,closedAt:start+(i+1)*900,day:'2026-01-05',minute:570+i*15,open:value,high:value+0.5,low:value-0.5,close:value,volume:10,...extra});
const down=()=>[100,101,104,102,101,98,100,101,103,101,100,97,99,100,102,100,99,96,98,100].map((v,i)=>bar(i,v));

test('RSI Wilder seed, subsequent smoothing, and flat/one-way limits',()=>{
  const closes=[44.34,44.09,44.15,43.61,44.33,44.83,45.10,45.42,45.84,46.08,45.89,46.03,45.61,46.28,46.28,46.00,46.03,46.41];
  const output=calculateIndicators(closes.map((v,i)=>bar(i,v)));
  assert.ok(output.rsi.slice(0,14).every(p=>!Object.hasOwn(p,'value')));
  for(const [i,expected] of [[14,70.464135021097],[15,66.249618553555],[16,66.480941834713],[17,69.346853162909]]) assert.ok(Math.abs(output.rsi[i].value-expected)<1e-9);
  for(const [slope,expected] of [[0,50],[1,100],[-1,0]]) {
    const data=Array.from({length:30},(_,i)=>bar(i,100+slope*i));
    assert.ok(calculateIndicators(data).rsi.slice(14).every(p=>p.value===expected));
  }
});

test('Bollinger population deviation, warm-up, volume and selected-window causality',()=>{
  const data=Array.from({length:35},(_,i)=>bar(i,100+i));
  const full=calculateIndicators(data);
  assert.ok(full.middle.slice(0,19).every(p=>!Object.hasOwn(p,'value')));
  assert.equal(full.middle[19].value,109.5);
  assert.equal(full.upper[19].value,109.5+2*Math.sqrt(33.25));
  assert.equal(full.lower[19].value,109.5-2*Math.sqrt(33.25));
  assert.equal(full.volume[0].value,data[0].volume);
  for(let n=1;n<=data.length;n++) {
    const prefix=calculateIndicators(data.slice(0,n));
    for(const key of Object.keys(prefix)) assert.deepEqual(prefix[key],full[key].slice(0,n));
  }
  const chosen=data.slice(10,30), poison=new Proxy({}, {get(){throw new Error('Unselected candle read');}});
  assert.deepEqual(calculateIndicators(selectAnalysisWindow([poison,...chosen,poison],20,20)),calculateIndicators(chosen));
  const result=analyzeCandles(chosen), indicators=calculateIndicators(chosen);
  assert.equal(indicators.ema9.at(-1).value,result.fast);
  assert.equal(indicators.ema21.at(-1).value,result.slow);
});

test('marker filters preserve causal pivot confirmation and distinguish break categories',()=>{
  const data=down(), result=analyzeCandles(data), frozen=structuredClone(result);
  const all={...Object.fromEntries(Object.keys(DEFAULT_LAYERS).map(k=>[k,true]))};
  const pivots=chartMarkers(data,result,900,{pivots:true});
  assert.ok(pivots.some(p=>p.text==='LH'));assert.ok(pivots.some(p=>p.text==='LL'));
  assert.equal(pivots[0].time,result.highs[0].confirmedAt-900);
  for(let n=1;n<=data.length;n++) {
    const earlier=data.slice(0,n);
    assert.deepEqual(chartMarkers(earlier,analyzeCandles(earlier),900,all),chartMarkers(data,result,900,all).filter(p=>p.time<=earlier.at(-1).time));
  }
  const up=[...data,bar(20,100,{open:100,high:104.25,low:99.75,close:104})], mss=analyzeCandles(up);
  assert.equal(chartMarkers(up,mss,900,{mss:true}).at(-1).text,'MSS ?');
  assert.equal(chartMarkers(up,mss,900,{bos:true}).some(p=>p.text.includes('MSS')),false);
  assert.deepEqual(chartMarkers(data,result,900,{}),[]);
  assert.deepEqual(result,frozen);
  const p=(i,price)=>({time:data[i].time,confirmedAt:data[i+2].closedAt,price});
  const rising={events:[],highs:[p(2,10),p(5,11),p(8,11)],lows:[p(3,5),p(6,6),p(9,6)]};
  assert.deepEqual(chartMarkers(data,rising,900,{pivots:true}).map(m=>m.text),['H','L','HH','HL','H=','L=']);
});

test('engulfing display does not cross session gaps or turn off structure calculations',()=>{
  const data=[bar(0,100,{open:103,high:104,low:99,close:100}),bar(1,100,{open:99,high:105,low:98,close:104})];
  assert.equal(chartMarkers(data,analyzeCandles(data),900,{engulfing:true})[0].text,'Englob. ↑');
  data[1]={...data[1],day:'2026-01-06'};
  assert.deepEqual(chartMarkers(data,analyzeCandles(data),900,{engulfing:true}),[]);
});

test('chart filters preserve zoom; RSI uses a separate fixed scale and aligned warm-up',()=>{
  const charts=[];
  const library={createChart(host,options){
    const c={host,options,series:[],fits:0,range:{from:2,to:12},handler:null,removed:false};
    const ts={fitContent(){c.fits++;},getVisibleLogicalRange(){return c.range;},setVisibleLogicalRange(r){c.range=r;},subscribeVisibleLogicalRangeChange(fn){c.handler=fn;},unsubscribeVisibleLogicalRangeChange(){c.handler=null;}};
    const add=(kind,opts)=>{
      const s={kind,options:{...opts},data:[],lines:[],scale:{},markers:[],sets:0};
      Object.assign(s,{setData(d){s.data=d;s.sets++;},setMarkers(m){s.markers=m;},applyOptions(o){Object.assign(s.options,o);},priceScale(){return{applyOptions(o){Object.assign(s.scale,o);}};},createPriceLine(l){s.lines.push(l);return l;},removePriceLine(l){s.lines=s.lines.filter(p=>p!==l);}});
      c.series.push(s);return s;
    };
    Object.assign(c,{timeScale:()=>ts,addCandlestickSeries:o=>add('candles',o),addLineSeries:o=>add('line',o),addHistogramSeries:o=>add('volume',o),resize(){},remove(){c.removed=true;}});
    charts.push(c);return c;
  }};
  const hosts={price:{clientWidth:800,clientHeight:480},rsi:{clientWidth:800,clientHeight:145},rsiPanel:{hidden:true}};
  const view=createAnalysisChart(library,hosts,{}), data=down(), result=analyzeCandles(data), indicators=calculateIndicators(data);
  view.draw(data,result,indicators,900,DEFAULT_LAYERS,'selection1');
  const main=charts[0], candle=main.series[0];
  assert.equal(main.fits,1);assert.equal(charts.length,1);
  const toggles={...DEFAULT_LAYERS,rsi:true,volume:true,pivots:true,ema:false,levels:false};
  view.draw(data,result,indicators,900,toggles,'selection1');
  assert.equal(main.fits,1);assert.equal(candle.sets,1);assert.equal(candle.lines.length,0);
  assert.equal(main.series[1].options.visible,false);
  assert.equal(main.series.find(s=>s.kind==='volume').options.priceScaleId,'volume');
  const oscillator=charts[1], rsi=oscillator.series[0];
  assert.deepEqual(rsi.options.autoscaleInfoProvider(),{priceRange:{minValue:0,maxValue:100}});
  assert.equal(rsi.data.length,data.length);assert.ok(!Object.hasOwn(rsi.data[0],'value'));
  assert.deepEqual(rsi.lines.map(l=>l.price),[30,70]);assert.equal(hosts.rsiPanel.hidden,false);
  main.handler({from:5,to:15});assert.deepEqual(oscillator.range,{from:5,to:15});
  view.draw(data,result,indicators,900,{},'selection1');assert.equal(hosts.rsiPanel.hidden,true);
  assert.equal(main.fits,1);assert.deepEqual(candle.markers,[]);
  view.draw(data,result,indicators,900,DEFAULT_LAYERS,'selection2');assert.equal(main.fits,2);
  view.destroy();assert.ok(charts.every(c=>c.removed));assert.equal(main.handler,null);
});

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
