import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {session45,filterSessions45} from '../trading/lab/jeu45-sessions.mjs';
import {timeExitDecision45} from '../trading/lab/jeu45-time-exit.mjs';
import {simulateConfidencePortfolio as current} from '../trading/lab/jeu45-engine.mjs';
import {simulateConfidencePortfolio as original} from '../trading/lab/jeu40-engine.mjs';
import {JEU45_POLICY,JEU45_VARIANTS} from '../trading/lab/jeu45-policy.mjs';
import {JEU40_MONTHS} from '../trading/lab/jeu40-policy.mjs';
import {statistics45,review45} from '../trading/lab/jeu45-diagnostic.mjs';
import {verifyPolicy45Protocol} from '../trading/lab/jeu45-protocol-table.mjs';
const stamp=s=>Date.parse(s)/1000;
function fixture(side='Long',symbol='MNQ'){
 const day='2026-06-01',start=stamp(day+'T13:30Z'),time=start+2400,sign=side==='Long'?1:-1;
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,signals:new Map(),candles:Array.from({length:78},(_,i)=>({time:start+i*300,day,minute:570+i*5,closeMinute:960,ticker:symbol+'M6',open:100,high:101,low:99,close:100}))}));
 const s=streams.find(s=>s.symbol===symbol),signal={day,side,signalOpen:time-300,signalClose:time,rangeClosedAt:start+1800,breakoutAt:start+2100,trendClosedAt:start+1800,rangeHigh:sign===1?99:111,rangeLow:sign===1?89:101,stopPrice:100-sign*5,pattern:'orb-retest'};
 s.signals.set(time,signal);
 const bar=t=>s.candles.find(b=>b.time===t),change=(t,values)=>Object.assign(bar(t),sign===1?values:Object.fromEntries(Object.entries(values).map(([k,v])=>[k==='high'?'low':k==='low'?'high':k,200-v])));
 change(time+2100,{high:111,close:110});
 return {streams,s,signal,time,sign,bar,change,contexts:new Map(),period:{start:day,end:'2026-06-02'}};
}
const run=(f,target='MNQ',factor=1)=>current(f.streams,f.contexts,f.period,factor,'fixed100',target);
test('London boundary uses local clocks across both DST changes and never a fixed NY offset',()=>{
 for(const[iso,nyMinute]of [['2026-01-05T16:30Z',690],['2026-03-09T16:30Z',750],['2026-03-30T15:30Z',690]]){
  const t=stamp(iso);assert.equal(session45(t-300).overlap,true);assert.equal(session45(t).overlap,false);assert.equal(session45(t).newYorkMinute,nyMinute);assert.equal(session45(t).category,'after-london-cash');
 }
 assert.equal(session45(stamp('2026-06-01T15:00Z')).londonMinute,960);
});
test('UK holidays and weekends are explicit nonoverlap categories; invalid dates fail closed',()=>{
 for(const day of JEU45_POLICY.londonClosedDates)assert.equal(session45(stamp(day+'T15:00Z')).category,'london-bank-holiday');
 assert.equal(session45(stamp('2026-06-06T15:00Z')).category,'london-weekend');
 assert.throws(()=>session45(stamp('2026-09-01T15:00Z')));assert.throws(()=>session45(1));
});
test('session candidates partition existing signals, preserve other markets and never inspect price fields',()=>{
 const f=fixture(),outside=f.time+4800;f.s.signals.set(outside,{...f.signal,signalOpen:outside-300,signalClose:outside});
 for(const s of f.streams)for(const b of s.candles)for(const k of ['open','high','low','close'])Object.defineProperty(b,k,{get(){throw Error('Price field read');}});
 const a=filterSessions45(f.streams,'mnq-london-overlap'),b=filterSessions45(f.streams,'mnq-outside-london');
 assert.deepEqual([...a.streams.find(s=>s.symbol==='MNQ').signals.keys()],[f.time]);
 assert.deepEqual([...b.streams.find(s=>s.symbol==='MNQ').signals.keys()],[outside]);
 assert.equal(a.streams[0],f.streams[0]);
 assert.equal(filterSessions45(f.streams,'mnq-time-exit30').streams.find(s=>s.symbol==='MNQ'),f.s);
 assert.throws(()=>filterSessions45(f.streams,'unknown'));
});
test('disabled time exit reproduces whole original synthetic accounts for both sides, markets and costs',()=>{
 for(const side of ['Long','Short'])for(const symbol of ['MNQ','MES'])for(const factor of [1,2]){
  const f=fixture(side,symbol);assert.deepEqual(run(f,null,factor),original(f.streams,f.contexts,f.period,factor));
 }
 assert.throws(()=>current([],new Map(),{},1,'fixed500'));assert.throws(()=>current([],new Map(),{},1,'fixed100','MGC'));
});
test('six closed M5 bars schedule next-open exit; this can sacrifice a later reference winner',()=>{
 for(const side of ['Long','Short'])for(const symbol of ['MNQ','MES']){
  const f=fixture(side,symbol);f.change(f.time+1800,{open:99,low:98,high:100,close:99});
  const t=run(f,symbol).trades[0],base=run(f,null).trades[0];
  assert.equal(t.reason,'Time exit 30m');assert.equal(t.exitTime,f.time+1800);assert.equal(t.exit,100-f.sign);assert.equal(t.timeExitDecisionAt,t.exitTime);assert.ok(t.netDollars<0);assert.ok(base.netDollars>0);
  assert.equal(t.stop,t.initialStop);assert.equal(t.targetDistance,2*t.risk);assert.equal(t.quantity,base.quantity);
 }
});
test('net-zero boundary includes fees, positive net keeps original trade, clock is checked only once',()=>{
 const p={symbol:'MNQ',side:'Long',entry:100,entryTime:stamp('2026-06-01T14:10Z'),quantity:2,costDollars:7,day:'2026-06-01'},product={multiplier:2};
 const b={time:p.entryTime+1500,close:101.75,day:p.day};
 assert.equal(timeExitDecision45(p,b,product,'MNQ').timeExitEstimatedNet,0);
 assert.equal(timeExitDecision45(p,{...b,close:102},product,'MNQ'),null);
 assert.equal(timeExitDecision45(p,{...b,time:b.time+300},product,'MNQ'),null);
 const f=fixture();f.change(f.time+1500,{high:104,close:104});assert.deepEqual(run(f),run(f,null));
});
test('stop/target on the decision bar win before a time exit can be scheduled',()=>{
 for(const side of ['Long','Short']){
  const f=fixture(side);f.change(f.time+1500,{high:111,low:94,close:100});
  const t=run(f).trades[0];assert.equal(t.reason,'Stop');assert.equal(t.ambiguous,true);assert.equal(t.timeExitAt,undefined);
 }
});
test('next-open gap priority is preserved and future exit-bar extremes do not change timed fills',()=>{
 for(const side of ['Long','Short']){
  for(const[open,reason]of [[94,'Stop gap'],[111,'Target open'],[99,'Time exit 30m']]){
   const f=fixture(side);f.change(f.time+1800,{open,high:Math.max(open,112),low:Math.min(open,93),close:100});
   const t=run(f).trades[0];assert.equal(t.reason,reason);assert.equal(t.exit,reason==='Target open'?100+f.sign*10:100+f.sign*(open-100));
  }
 }
 const f=fixture();f.change(f.time+1800,{open:1,high:101,low:1,close:100});assert.equal(run(f).trades[0].reason,'Daily gap');
});
test('time exit reserves its whole bar; a later signal may use the newly free slot',()=>{
 const f=fixture(),mes=f.streams.find(s=>s.symbol==='MES');
 for(const delta of [1800,2100]){const time=f.time+delta;mes.signals.set(time,{...f.signal,signalClose:time,signalOpen:time-300});}
 const r=run(f);assert.ok(r.decisions.some(d=>d.symbol==='MES'&&d.time===f.time+1800&&d.reason==='occupied'));
 assert.ok(r.decisions.some(d=>d.symbol==='MES'&&d.time===f.time+2100&&d.accepted));assert.equal(r.trades.length,2);
});
test('only the selected market uses time exit and costs can change the decision',()=>{
 const f=fixture();assert.deepEqual(run(f,'MES'),run(f,null));
 f.signal.stopPrice=90;f.change(f.time+1500,{high:102,close:102});assert.equal(run(f,'MNQ',1).trades[0].timeExitAt,undefined);assert.equal(run(f,'MNQ',2).trades[0].timeExitAt,f.time+1800);
});
test('future bars cannot change the time-exit decision or the resulting opening fill',()=>{
 const f=fixture(),t=run(f).trades[0];
 for(const b of f.s.candles.filter(b=>b.time>=f.time+1800)){b.high=150;b.low=50;b.close=140;}
 assert.deepEqual(run(f).trades[0],t);
 const bar={time:f.time+1500,day:'2026-06-01',close:100};Object.defineProperty(bar,'open',{get(){throw Error('Unused open');}});Object.defineProperty(bar,'high',{get(){throw Error('Future field');}});
 assert.ok(timeExitDecision45({...t,entryTime:f.time},bar,{multiplier:2},'MNQ'));
});
test('descriptive gate requires robust monthly totals plus higher mean trade at both costs',()=>{
 const cells=JEU40_MONTHS.flatMap(m=>['normal','stress'].map(cost=>({month:m.id,cost,delta:0,net:1,drawdown:10,referenceDrawdown:10,status:'incomplete'}))),means={normal:{candidate:11,reference:10},stress:{candidate:6,reference:5}};
 assert.equal(review45(cells,means).descriptiveGatePassed,false);cells[0].delta=1;assert.equal(review45(cells,means).descriptiveGatePassed,true);
 means.stress.candidate=5;assert.equal(review45(cells,means).descriptiveGatePassed,false);means.stress.candidate=6;cells[1].drawdown=11;assert.equal(review45(cells,means).descriptiveGatePassed,false);
});
test('mean/PF use net trade cashflows, costs reconcile and empty samples stay unknown',()=>{
 const ts=[{netDollars:20,costDollars:5,resultR:2,entryTime:0,exitTime:600},{netDollars:-10,costDollars:5,resultR:-1,entryTime:0,exitTime:300}],s=statistics45(ts);
 assert.equal(s.mean,5);assert.equal(s.profitFactor,2);assert.equal(s.gross,20);assert.equal(s.costs,10);assert.equal(s.meanHoldingMinutesLowerBound,7.5);assert.equal(statistics45([]).mean,null);
});
test('Game45 policy matches its protocol and retains six isolated configurations',()=>{
 const text=readFileSync('trading/lab/JEU45_PROTOCOL.md','utf8');verifyPolicy45Protocol(text);assert.throws(()=>verifyPolicy45Protocol(text.replace('"timeExitMinutes": 30','"timeExitMinutes": 20')));
 assert.equal(JEU45_VARIANTS.length,7);assert.equal(JEU45_POLICY.newConfigurations,6);assert.equal(JEU45_POLICY.riskMaximumUSD,100);assert.equal(JEU45_POLICY.targetR,2);
});
