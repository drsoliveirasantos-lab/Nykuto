import test from 'node:test';
import assert from 'node:assert/strict';
import {admissionSignals} from '../trading/lab/jeu23-signals.mjs';
import {simulateAdmission} from '../trading/lab/jeu23-engine.mjs';
import {openingSignals} from '../trading/lab/jeu22-signals.mjs';
import {simulateOpening} from '../trading/lab/jeu22-engine.mjs';
import {JEU23_PRODUCTS,JEU23_SCENARIOS} from '../trading/lab/jeu23-policy.mjs';
import {JEU22_SCENARIOS} from '../trading/lab/jeu22-policy.mjs';
import {riskGate,riskFill} from '../trading/lab/jeu23-risk.mjs';
import {multimarketFill} from '../trading/lab/jeu19-engine.mjs';
import {compareExecutions} from '../trading/lab/jeu23-comparison.mjs';
const product=JEU23_PRODUCTS[0],scenario=JEU23_SCENARIOS[0],period={start:'2026-01-02',end:'2026-01-04'};
function fixture(firstLow=80){
  const time=Date.parse('2026-01-02T14:30:00Z')/1000;
  const bars=Array.from({length:78},(_,i)=>({time:time+i*300,day:'2026-01-02',minute:570+i*5,closeMinute:960,ticker:'MNQH6',open:110,high:120,low:100,close:110,volume:100}));
  Object.assign(bars[6],{open:118,high:131,low:117,close:130});
  Object.assign(bars[7],{open:130,high:132,low:firstLow,close:131});
  Object.assign(bars[8],{open:131,high:134,low:119,close:133});
  Object.assign(bars[9],{open:133,high:134,low:132,close:133.5});
  Object.assign(bars[10],{open:133.5,high:160,low:133,close:155});
  Object.assign(bars[11],{open:130,high:132,low:119,close:131});
  return bars;
}
const run=(bars,factor=1,account=false)=>simulateAdmission(bars,admissionSignals(bars,product),scenario,product,period,factor,account);
test('a rejected first entry leaves a later completed retest available without moving either stop',()=>{
  const bars=fixture(),signals=admissionSignals(bars,product),r=run(bars);
  const old=simulateOpening(bars,openingSignals(bars,product),JEU22_SCENARIOS[0],product,period,1,false);
  assert.equal(old.trades.length,0);assert.equal(old.denied.tradeRisk,1);
  assert.equal(r.trades.length,1);assert.equal(r.denied.tradeRisk,1);assert.equal(r.trades[0].priorRefusals,1);
  assert.equal(r.trades[0].entryTime,bars[9].time);assert.equal(r.trades[0].stop,118.75);assert.equal(r.trades[0].netDollars,39);
  assert.equal(signals.get(bars[8].time).stopPrice,79.75);assert.equal(signals.get(bars[9].time).stopPrice,118.75);
});
test('admitted first entries retain their fills and consume that side even after a loss',()=>{
  const bars=fixture(115),old=simulateOpening(bars,openingSignals(bars,product),JEU22_SCENARIOS[0],product,period,1,false),r=run(bars);
  assert.equal(r.trades.length,1);assert.ok(r.denied.sideLimit>0);
  assert.deepEqual(r.trades.map(({priorRefusals,...t})=>t),old.trades);
  bars[8].low=110;const loss=run(bars);assert.equal(loss.trades.length,1);assert.equal(loss.trades[0].reason,'Stop');assert.ok(loss.denied.sideLimit>0);
});
test('signals are independent of costs while each simulation consumes its own admitted entry',()=>{
  const bars=fixture(108.75),normal=run(bars,1),stress=run(bars,2);
  assert.equal(normal.trades[0].entryTime,bars[8].time);
  assert.equal(stress.trades[0].entryTime,bars[9].time);assert.equal(stress.trades[0].priorRefusals,1);
  assert.ok(normal.trades[0].riskDollars+normal.trades[0].costDollars<=50);
  assert.ok(stress.trades[0].riskDollars+stress.trades[0].costDollars<=50);
  assert.equal(run(bars,1).trades[0].entryTime,bars[8].time);
});
test('all candidate prefixes are causal and retain the original first signal per day and side',()=>{
  const bars=fixture(),all=admissionSignals(bars,product),first=new Map();
  for(const [time,s] of all)if(!first.has(s.day+s.side))first.set(s.day+s.side,[time,s]);
  assert.deepEqual([...first.values()],[...openingSignals(bars,product)]);
  for(let cut=1;cut<=bars.length;cut++)assert.deepEqual([...admissionSignals(bars.slice(0,cut),product)],[...all].filter(([t])=>t<=bars[cut-1].time+300));
  assert.throws(()=>admissionSignals(bars.filter((_,i)=>i!==2),product),/Gap|Incomplete/);
});
test('consumption resets each session and account prefixes reproduce executed trades',()=>{
  const first=fixture(),next=first.map(b=>({...b,time:b.time+86400,day:'2026-01-03'})),bars=first.concat(next),full=run(bars,1,true),prefix=run(first,1,true);
  assert.equal(full.trades.length,2);assert.deepEqual(full.trades.map(t=>t.priorRefusals),[1,1]);
  assert.deepEqual(prefix.trades,full.trades.filter(t=>t.day==='2026-01-02'));assert.deepEqual(prefix.days,full.days.slice(0,1));
  assert.ok(full.days.every(d=>d.trades<=2));
});
test('short recovery is symmetric and ambiguous fills remain conservative',()=>{
  const mirrored=fixture().map(b=>({...b,open:220-b.open,high:220-b.low,low:220-b.high,close:220-b.close})),r=run(mirrored);
  assert.equal(r.trades.length,1);assert.equal(r.trades[0].side,'Short');assert.equal(r.trades[0].netDollars,39);
  const bars=fixture();Object.assign(bars[9],{high:160,low:110});const a=run(bars);
  assert.equal(a.trades.length,1);assert.equal(a.trades[0].ambiguous,true);assert.equal(a.trades[0].reason,'Stop');
});
test('risk profiles enforce distinct caps, daily budgets and an unchanged account reserve',()=>{
  for(const p of JEU23_SCENARIOS){
    const base={balance:25000,floor:24000,dayStart:25000,riskDollars:p.riskPerTrade-3.5,costDollars:3.5,account:true};
    assert.equal(riskGate(base,p),null);assert.equal(riskGate({...base,riskDollars:base.riskDollars+.5},p),'tradeRisk');
    assert.equal(riskGate({...base,balance:25000-p.riskPerTrade-.5},p),'dailyBudget');
    assert.equal(riskGate({...base,floor:25000-p.riskPerTrade-99.5},p),'floorReserve');
    assert.throws(()=>riskGate(base,{...p,riskPerTrade:1000}),/Invalid risk profile/);
    const pos={side:'Long',entry:1000,stop:500,target:1500,costDollars:3.5};
    const bar={open:1000,high:1600,low:500};
    const f=riskFill(product,pos,bar,25000,24000,25000,true,true,p);
    assert.equal(f.reason,'Daily limit');assert.equal(f.ambiguous,true);
    assert.ok(25000+(f.price-1000)*2-3.5<=25000-p.dailyLoss);
    const gap=riskFill(product,pos,{open:1000-p.dailyLoss,high:1000,low:500},25000,24000,25000,true,true,p);
    assert.equal(gap.reason,'Daily gap');assert.equal(gap.price,1000-p.dailyLoss);
  }
});
test('the 50 dollar fill engine matches the frozen baseline at stop, target, MLL and gaps',()=>{
  for(const side of ['Long','Short'])for(const open of [450,800,950,1000,1050,1200,1550])for(const account of [true,false]){
    const pos={side,entry:1000,stop:side==='Long'?900:1100,target:side==='Long'?1100:900,costDollars:3.5},bar={open,high:Math.max(1150,open),low:Math.min(850,open)};
    assert.deepEqual(riskFill(product,pos,bar,25000,24925,25000,true,account,scenario),multimarketFill(product,pos,bar,25000,24925,25000,true,account));
  }
});
test('higher risk admits the observed wider stop and never scales contract quantity',()=>{
  const bars=fixture(),signals=admissionSignals(bars,product),p=JEU23_SCENARIOS.find(s=>s.riskPerTrade===150);
  const r=simulateAdmission(bars,signals,p,product,period,1,false);
  assert.equal(r.trades[0].entryTime,bars[8].time);assert.equal(r.trades[0].stop,79.75);assert.equal(r.trades[0].riskDollars,102.5);
  assert.equal(r.trades[0].priorRefusals,0);assert.ok(r.trades.length<=2);
});
test('comparison reconciles additions and removals without exposing trade records',()=>{
  const one=run(fixture()).trades[0],two={...one,entryTime:one.entryTime+300,netDollars:-20};
  const c=compareExecutions({net:39,trades:[one]},{net:-20,trades:[two]});
  assert.deepEqual(c,{oldNet:39,newNet:-20,deltaNet:-59,unchangedCount:0,addedCount:1,removedCount:1,addedNet:-20,removedNet:39});
  assert.equal(compareExecutions({net:39,trades:[one]},{net:39,trades:[{...one,balanceAfter:30000,priorRefusals:10}]}).unchangedCount,1);
  assert.throws(()=>compareExecutions({net:40,trades:[one]},{net:0,trades:[]}),/Assertion/);
});
