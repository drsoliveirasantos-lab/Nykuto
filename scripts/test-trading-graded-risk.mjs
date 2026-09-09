import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeContext,gradeSignals,gradedRiskGate} from '../trading/lab/jeu25-risk.mjs';
import {simulateGraded} from '../trading/lab/jeu25-engine.mjs';
import {admissionSignals} from '../trading/lab/jeu23-signals.mjs';
import {simulateAdmission} from '../trading/lab/jeu23-engine.mjs';
import {simulateConfluence} from '../trading/lab/jeu24-engine.mjs';
import {JEU25_PRODUCTS,JEU25_SCENARIOS} from '../trading/lab/jeu25-policy.mjs';
import {JEU23_SCENARIOS} from '../trading/lab/jeu23-policy.mjs';
import {JEU24_SCENARIOS} from '../trading/lab/jeu24-policy.mjs';
const product=JEU25_PRODUCTS[0],scenario=JEU25_SCENARIOS[0],dates=['2026-01-02','2026-01-05','2026-01-06','2026-01-07','2026-01-08','2026-01-09'];
const bounds={start:dates[0],end:'2026-01-10'};
const strip=r=>({...r,trades:r.trades.map(({approvedRiskCap,contextScore,contextMissing,...t})=>t)});
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
test('every complete five-family combination follows the frozen risk tiers; missing context always stays low',()=>{
  const signal={side:'Long',day:dates[5],signalOpen:1000,signalClose:1300};
  const full={day:signal.day,closedAt:1300,sourceTime:1000,emaReady:true,fast:120,slow:110,vwapSide:1,rsi:60,structure:'Long',volumeRatio:1.5,patterns:['Forme de marteau']};
  const fail=[{fast:100},{structure:'Mixed'},{rsi:49},{volumeRatio:.9},{patterns:['Aucun motif retenu']}];
  for(let mask=0;mask<32;mask++){
    const c={...full};let score=5;
    for(let bit=0;bit<5;bit++)if(mask&(1<<bit)){Object.assign(c,fail[bit]);score--;}
    const g=gradeContext(signal,c);assert.equal(g.score,score);assert.equal(g.cap,score===5?150:score>=3?75:50);assert.equal(g.missingContext,false);
  }
  assert.equal(gradeContext(signal,{...full,volumeRatio:null}).cap,50);
  assert.equal(gradeContext(signal,undefined).cap,50);
  assert.throws(()=>gradeContext(signal,{...full,closedAt:1600}),/Noncausal/);
});
test('partial confirmations admit a low-risk retest rejected by the strict gate, without changing its fill',()=>{
  const bars=fixture();bars[bars.length-71].volume=50;const signals=admissionSignals(bars,product);
  for(const factor of [1,2]){
    const run=simulateGraded(bars,signals,scenario,product,bounds,factor,false);
    assert.equal(run.trades.length,1);assert.equal(run.trades[0].approvedRiskCap,75);assert.equal(run.trades[0].contextScore,4);
    assert.equal(simulateConfluence(bars,signals,JEU24_SCENARIOS[3],product,bounds,factor,false).trades.length,0);
    assert.deepEqual(strip(run),simulateAdmission(bars,signals,JEU23_SCENARIOS[3],product,bounds,factor,false));
  }
});
test('a wider structural stop requires the full tier; it is never enlarged to spend the assigned budget',()=>{
  const bars=fixture();bars[bars.length-71].low=90;bars[bars.length-71].open=127;bars[bars.length-69].high=210;
  const signals=admissionSignals(bars,product),run=simulateGraded(bars,signals,scenario,product,bounds,1,false);
  assert.equal(run.trades.length,1);assert.equal(run.trades[0].approvedRiskCap,150);assert.equal(run.trades[0].riskDollars+run.trades[0].costDollars,90);
  assert.equal(run.trades[0].stop,signals.get(run.trades[0].entryTime).stopPrice);
  assert.deepEqual(strip(run),simulateAdmission(bars,signals,JEU23_SCENARIOS[3],product,bounds,1,false));
  bars[bars.length-71].volume=50;const weak=simulateGraded(bars,admissionSignals(bars,product),scenario,product,bounds,1,false);
  assert.equal(weak.trades.length,0);assert.ok(weak.denied.tradeRisk>0);
});
test('risk grades and account executions reproduce every signal and daily prefix without future inputs',()=>{
  const bars=fixture(),signals=admissionSignals(bars,product),all=gradeSignals(bars,signals,product);
  for(const time of signals.keys())assert.deepEqual(gradeSignals(bars.filter(b=>b.time+300<=time),signals,product).grades.get(time),all.grades.get(time));
  const whole=simulateGraded(bars,signals,scenario,product,bounds,1,true);
  for(const day of dates){const end=new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString().slice(0,10),prefix=simulateGraded(bars.filter(b=>b.day<=day),signals,scenario,product,{...bounds,end},1,true);assert.deepEqual(prefix.trades,whole.trades.filter(t=>t.day<=day));assert.deepEqual(prefix.days,whole.days.filter(d=>d.day<=day));}
  const last=bars.slice(-78),g=gradeSignals(last,admissionSignals(last,product),product);assert.ok([...g.grades.values()].every(x=>x.cap===50&&x.missingContext));
});
test('trade fees, a fixed daily envelope and account reserve are enforced independently of the score',()=>{
  const base={balance:25000,floor:24000,dayStart:25000,riskDollars:46.5,costDollars:3.5,account:true};
  assert.equal(gradedRiskGate(base,50,scenario),null);assert.equal(gradedRiskGate({...base,costDollars:7},50,scenario),'tradeRisk');
  assert.equal(gradedRiskGate({...base,balance:24720},50,scenario),'dailyBudget');
  assert.equal(gradedRiskGate({...base,balance:24140,dayStart:24140},50,scenario),'floorReserve');
  assert.equal(gradedRiskGate({...base,balance:24140,dayStart:24140,account:false},50,scenario),null);
  for(const bad of [{...scenario,dailyLoss:1000},{...scenario,riskPerTrade:1000},{...scenario,guarded:false}])assert.throws(()=>simulateGraded(fixture(),new Map(),bad,product,bounds),/Invalid/);
  assert.throws(()=>gradedRiskGate(base,1000,scenario),/Invalid/);
});
