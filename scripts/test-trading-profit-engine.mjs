import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateConfidencePortfolio as native} from '../trading/lab/jeu45-engine.mjs';
import {loadProfitStudyEngine, profitStudyTerms} from '../trading/lab/profit-study-engine.mjs';
import {JEU29_PRODUCTS} from '../trading/lab/jeu29-policy.mjs';
import {prepareMnqProfitStudy} from '../trading/lab/profit-study-preparation.mjs';
import {loadMnqResearchStream} from '../trading/lab/mnq-data.mjs';
import {quoteMnqTrade} from '../trading/lab/profit-study-policy.mjs';
function fixture(side='Long') {
  const day='2026-06-01', start=Date.parse(day+'T13:30:00Z')/1000, time=start+2700;
  const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,signals:new Map(),candles:Array.from({length:78},(_,i)=>({
    time:start+i*300,day,minute:570+i*5,closeMinute:960,ticker:symbol+'M6',open:100,high:101,low:99,close:100}))}));
  const sign=side==='Long'?1:-1, mnq=streams.find(s=>s.symbol==='MNQ');
  mnq.signals.set(time,{day,side,signalOpen:time-300,signalClose:time,rangeClosedAt:start+1800,
    breakoutAt:start+2100,trendClosedAt:start+1800,rangeHigh:sign===1?99:111,rangeLow:sign===1?89:101,
    stopPrice:100-sign*10,pattern:'orb-retest'});
  Object.assign(mnq.candles.find(b=>b.time===time+600),sign===1?{high:121,close:120}:{low:79,close:80});
  return {streams,mnq,time,contexts:new Map(),period:{start:day,end:'2026-06-02'}};
}
test('guarded derivative preserves full native accounts with reference100', async()=>{
  const {simulateConfidencePortfolio: current}=await loadProfitStudyEngine();
  for(const side of ['Long','Short'])for(const factor of [1,2])for(const exit of [null,'MNQ']) {
    const f=fixture(side);
    assert.deepEqual(current(f.streams,f.contexts,f.period,factor,'fixed100',exit,'reference100'),native(f.streams,f.contexts,f.period,factor,'fixed100',exit));
  }
});
test('single-market mode does not fabricate other market candles', async()=>{
  const {simulateConfidencePortfolio: current}=await loadProfitStudyEngine(),f=fixture();
  const a=current([f.mnq],f.contexts,f.period,1,'fixed100','MNQ','reference100');
  const b=native(f.streams,f.contexts,f.period,1,'fixed100','MNQ');
  for(const key of ['trades','days','decisions','net','drawdown'])assert.deepEqual(a[key],b[key]);
});
test('200-risk and net100-only changes are actually consumed by the account engine', async()=>{
  const {simulateConfidencePortfolio: current}=await loadProfitStudyEngine(),f=fixture();
  const high=current([f.mnq],f.contexts,f.period,1,'fixed100','MNQ','risk200');
  assert.equal(high.trades[0].quantity,8); assert.equal(high.trades[0].plannedRiskUSD,188);
  const filtered=current([f.mnq],f.contexts,f.period,2,'fixed100','MNQ','net100-risk100');
  assert.equal(filtered.trades.length,0); assert.equal(filtered.denied.netTargetBelow100,1);
});
test('quote agrees with native sizing for both sides, all caps and costs',()=>{
  for(const side of ['Long','Short'])for(const [variant,riskCapUSD]of [['reference100',100],['risk150',150],['risk200',200]])for(const factor of [1,2]) {
    const f=fixture(side),signal=f.mnq.signals.get(f.time),p=JEU29_PRODUCTS.find(p=>p.symbol==='MNQ');
    const q=quoteMnqTrade({side,entry:100,stop:signal.stopPrice,riskCapUSD,costFactor:factor});
    const r=profitStudyTerms(signal,100,f.time,p,factor,riskCapUSD,variant).terms;
    assert.equal(q.quantity,r.quantity);assert.equal(q.plannedRiskUSD,r.plannedRiskUSD);
  }
});
test('research corpus has no September performance inputs and only complete sessions',()=>{
  const {stream,eligibleDays}=prepareMnqProfitStudy(loadMnqResearchStream());
  assert.ok(eligibleDays.length>40);assert.ok(stream.candles.every(b=>b.day<'2026-09-01'));
  assert.ok(!eligibleDays.includes('2026-06-19'));assert.ok(!eligibleDays.includes('2026-07-03'));
  for(const day of eligibleDays)assert.equal(stream.candles.filter(b=>b.day===day).length,78);
});
