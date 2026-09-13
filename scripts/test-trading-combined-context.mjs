import test from 'node:test';
import assert from 'node:assert/strict';
import {combinedContexts,contextDecision,filterCombinedSignals} from '../trading/lab/jeu24-context.mjs';
import {simulateConfluence} from '../trading/lab/jeu24-engine.mjs';
import {admissionSignals} from '../trading/lab/jeu23-signals.mjs';
import {simulateAdmission} from '../trading/lab/jeu23-engine.mjs';
import {JEU24_PRODUCTS,JEU24_SCENARIOS,CONFLUENCE_CHECKS} from '../trading/lab/jeu24-policy.mjs';
import {JEU23_SCENARIOS} from '../trading/lab/jeu23-policy.mjs';
const product=JEU24_PRODUCTS[0],scenario=JEU24_SCENARIOS[0],dates=['2026-01-02','2026-01-05','2026-01-06','2026-01-07','2026-01-08','2026-01-09'];
function fixture(){
  const bars=dates.flatMap((day,d)=>Array.from({length:78},(_,i)=>{
    const close=60+d*5+i*.25+[0,1,2,1,0,-1,-2,-1][i%8],open=close-.25;
    return {time:Date.parse(day+'T14:30:00Z')/1000+i*300,day,minute:570+i*5,closeMinute:960,ticker:'MNQH6',open,high:close+1,low:open-1,close,volume:100};
  }));
  const last=bars.slice(-78);for(const b of last)Object.assign(b,{open:110,high:120,low:100,close:110});
  Object.assign(last[6],{open:118,high:132,low:117,close:131});
  Object.assign(last[7],{open:130,high:134,low:118,close:133,volume:150});
  Object.assign(last[8],{open:133,high:134,low:132,close:133.5});
  Object.assign(last[9],{open:133.5,high:160,low:132,close:155});
  return bars;
}
test('the combined gate requires every family while directional candle shapes are alternatives',()=>{
  const s={side:'Long',day:'2026-01-09',signalOpen:1000,signalClose:1300};
  const context={day:s.day,closedAt:1300,sourceTime:1000,emaReady:true,fast:120,slow:110,vwapSide:1,rsi:60,structure:'Long',volumeRatio:1.5,patterns:['Forme de marteau']};
  assert.equal(contextDecision(s,context).accepted,true);
  for(const patterns of [['Englobante haussière'],['Corps haussier dominant']])assert.equal(contextDecision(s,{...context,patterns}).accepted,true);
  const failures={trend:{fast:100},structure:{structure:'Mixed'},momentum:{rsi:49},volume:{volumeRatio:.9},pattern:{patterns:['Doji']}};
  for(const key of CONFLUENCE_CHECKS){const r=contextDecision(s,{...context,...failures[key]});assert.equal(r.accepted,false);assert.equal(r.checks[key],false);}
  assert.equal(contextDecision(s,undefined).accepted,false);
  assert.throws(()=>contextDecision(s,{...context,closedAt:1600}),/Noncausal/);
});
test('volume compares the same minute in five previous complete sessions, excluding the signal candle',()=>{
  const bars=fixture(),signalBar=bars.at(-71),key=signalBar.time+300,c=combinedContexts(bars,product).get(key);
  assert.equal(c.referenceSessions,5);assert.equal(c.volumeRatio,1.5);assert.equal(c.structure,'Long');assert.ok(c.rsi>50);
  const changed=structuredClone(bars);changed[changed.length-71].volume=300;assert.equal(combinedContexts(changed,product).get(key).volumeRatio,3);
  assert.equal(combinedContexts(bars,product).get(bars[7].time+300).volumeRatio,null);
});
test('all context prefixes reproduce the past, including delayed pivot confirmations',()=>{
  const bars=fixture(),all=combinedContexts(bars,product);
  for(let cut=1;cut<=bars.length;cut++)assert.deepEqual([...combinedContexts(bars.slice(0,cut),product)],[...all].filter(([t])=>t<=bars[cut-1].time+300));
  for(const [time,c]of all)for(const pivot of [...c.highs,...c.lows])assert.ok(pivot.confirmedAt<=time&&pivot.confirmedAt===pivot.sourceTime+900);
});
test('gaps and rollovers reset preparation and incomplete sessions cannot seed volume history',()=>{
  const bars=fixture(),key=bars.at(-71).time+300;
  const missingDay=bars.filter(b=>b.day!==dates[2]);assert.equal(combinedContexts(missingDay,product).get(key).referenceSessions,2);
  const rolled=bars.map(b=>({...b,ticker:b.day===dates.at(-1)?'MNQM6':b.ticker}));const c=combinedContexts(rolled,product).get(key);assert.equal(c.referenceSessions,0);assert.equal(c.emaReady,false);
  assert.throws(()=>combinedContexts(bars.filter((_,i)=>i!==50),product),/Gap/);
  assert.throws(()=>combinedContexts(bars.filter((_,i)=>i!==77),product),/Incomplete previous/);
});
test('execution enforces confluence on unfiltered candidates and preserves admitted baseline fills',()=>{
  const bars=fixture(),signals=admissionSignals(bars,product),bounds={start:dates[0],end:'2026-01-10'},filtered=filterCombinedSignals(bars,signals,product);
  const r=simulateConfluence(bars,signals,scenario,product,bounds,1,false),reference=simulateAdmission(bars,filtered.signals,JEU23_SCENARIOS[0],product,bounds,1,false);
  assert.deepEqual(r,reference);assert.equal(r.trades.length,1);assert.equal(r.trades[0].netDollars,42);
  const weak=structuredClone(bars);weak[weak.length-71].volume=50;assert.equal(simulateConfluence(weak,admissionSignals(weak,product),scenario,product,bounds,1,false).trades.length,0);
  assert.throws(()=>simulateConfluence(bars,signals,{...scenario,riskPerTrade:1000},product,bounds),/Invalid/);
});
test('RSI has a neutral flat state and the short gate mirrors directional checks',()=>{
  const bars=fixture().slice(0,78).map(b=>({...b,open:100,high:101,low:99,close:100})),c=combinedContexts(bars,product).get(bars[30].time+300);assert.equal(c.rsi,50);
  const s={side:'Short',day:'2026-01-09',signalOpen:1000,signalClose:1300};
  assert.equal(contextDecision(s,{day:s.day,closedAt:1300,sourceTime:1000,emaReady:true,fast:100,slow:110,vwapSide:-1,rsi:40,structure:'Short',volumeRatio:1,patterns:['Longue mèche haute']}).accepted,true);
});
