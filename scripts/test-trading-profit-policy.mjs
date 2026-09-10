import test from 'node:test';
import assert from 'node:assert/strict';
import {PROFIT_STUDY, PROFIT_VARIANTS, PROFIT_MONTHS, quoteMnqTrade, plannedNetTarget, summarizeProfitRun, judgeProfitStudy, profitStudyProfile} from '../trading/lab/profit-study-policy.mjs';
test('100 USD risk can already target 146 USD NET without moving the stop', () => {
  const q = quoteMnqTrade({side: 'Long', entry: 100, stop: 90});
  assert.equal(q.quantity, 4); assert.equal(q.plannedRiskUSD, 94); assert.equal(q.targetNetUSD, 146);
  assert.equal(q.stop, 90); assert.equal(q.target, 120); assert.equal(q.executionAllowed, false);
});
test('larger caps increase losses as well as potential gains', () => {
  for (const [riskCapUSD, quantity, loss, gain] of [[150,6,141,219],[200,8,188,292]]) {
    const q = quoteMnqTrade({side: 'Long', entry: 100, stop: 90, riskCapUSD});
    assert.equal(q.quantity, quantity); assert.equal(q.plannedRiskUSD, loss); assert.equal(q.targetNetUSD, gain);
  }
});
test('long and short quotes are symmetric', () => {
  const a = quoteMnqTrade({side: 'Long', entry: 100, stop: 90});
  const b = quoteMnqTrade({side: 'Short', entry: 100, stop: 110});
  assert.equal(a.targetNetUSD,b.targetNetUSD); assert.equal(a.plannedRiskUSD,b.plannedRiskUSD); assert.equal(b.target,80);
});
test('doubled costs never double risk and may lower quantity', () => {
  const q = quoteMnqTrade({side: 'Long', entry: 100, stop: 90, costFactor: 2});
  assert.equal(q.quantity,3); assert.equal(q.plannedRiskUSD,81); assert.equal(q.targetNetUSD,99);
});
test('invalid stops, non-tick prices and unauthorized risk fail closed', () => {
  for (const x of [{stop:110},{entry:100.1},{riskCapUSD:500},{costFactor:0},{side:'Buy'},{entry:NaN}])
    assert.throws(() => quoteMnqTrade({side:'Long',entry:100,stop:90,...x}));
  assert.throws(() => profitStudyProfile('auto-max'));
  assert.equal(quoteMnqTrade({side:'Long',entry:100,stop:50}).blocked,'tradeRisk');
});
test('thin targets do not bypass the native net reward/risk guard', () => {
  assert.equal(quoteMnqTrade({side:'Long',entry:100,stop:99.75}).blocked,'netReward');
});
test('net target includes quantity AND all simulated round-trip costs', () => {
  assert.equal(plannedNetTarget({quantity:4,targetDistance:20,costDollars:14}),146);
  assert.throws(() => plannedNetTarget({quantity:0,targetDistance:20,costDollars:14}));
});
test('profit summary separates winners from expectancy including losers', () => {
  const run = {net:52,drawdown:94,status:'incomplete',ambiguous:0,denied:{},trades:[
    {netDollars:146,costDollars:14,plannedRiskUSD:94,quantity:4},
    {netDollars:-94,costDollars:14,plannedRiskUSD:94,quantity:4}]};
  const s = summarizeProfitRun(run);
  assert.equal(s.meanWinnerUSD,146); assert.equal(s.meanAllUSD,26); assert.equal(s.meanLoserUSD,-94);
  assert.equal(s.winnersAtLeast100,1); assert.equal(s.winnersAtLeast200,0);
});
function verdictFixture() {
  return PROFIT_VARIANTS.flatMap(v => PROFIT_MONTHS.flatMap(m => [1,2].map(factor => ({variant:v.id,month:m.id,factor,
    summary:{netUSD:v.id==='reference100'?100:120,trades:10,maxRealizedDrawdownUSD:90,status:'incomplete'}}))));
}
test('higher total alone cannot pass a worse-month or drawdown gate', () => {
  const rows=verdictFixture(); rows.find(r=>r.variant==='risk150').summary.maxRealizedDrawdownUSD=91;
  const verdict=judgeProfitStudy(rows).find(v=>v.variant==='risk150');
  assert.equal(verdict.descriptiveGatePassed,false); assert.ok(verdict.reasons.some(r=>r.includes('drawdown')));
});
test('even a passing descriptive gate cannot select or activate anything', () => {
  const v=judgeProfitStudy(verdictFixture())[0]; assert.equal(v.descriptiveGatePassed,true);
  assert.equal(v.selection,null); assert.equal(v.confirmed,false); assert.equal(v.executionAllowed,false);
  assert.equal(PROFIT_STUDY.dailyLossUSD,200); assert.equal(PROFIT_STUDY.executionAllowed,false);
});
test('incomplete coverage or absent cells block a positive verdict', () => {
  assert.ok(judgeProfitStudy(verdictFixture(),[{day:'2026-06-01'}]).every(v=>!v.descriptiveGatePassed));
  assert.ok(judgeProfitStudy([]).every(v=>!v.descriptiveGatePassed));
});
