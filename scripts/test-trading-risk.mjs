import test from 'node:test';
import assert from 'node:assert/strict';
import { numericInput, calculateCashRisk } from '../trading/risk-core.mjs';
const base={capital:1000,risk:1,entry:100,stop:98,target:106,side:'Long'};
test('Blank or invalid prices never become a zero price or an infinite position',()=>{
  for(const v of ['', ' ', null, undefined, Infinity, 'wrong']) assert.equal(numericInput(v),null);
  for(const stop of ['',0,100,102]) assert.equal(calculateCashRisk({...base,stop}).units,null);
  for(const risk of ['',0,-1,101]) assert.equal(calculateCashRisk({...base,risk}).units,null);
});
test('Cash sizing and reward require a coherent long or short scenario',()=>{
  const long=calculateCashRisk(base);
  assert.equal(long.riskAmount,10);assert.equal(long.units,5);assert.equal(long.ratio,3);assert.equal(long.stopPct,2);
  assert.equal(calculateCashRisk({...base,target:94}).ratio,null);
  assert.equal(calculateCashRisk({...base,side:'Short'}).units,null);
  const short=calculateCashRisk({...base,side:'Short',stop:102,target:94});
  assert.equal(short.units,5);assert.equal(short.ratio,3);
  assert.equal(calculateCashRisk({...base,side:'Short',stop:102,target:106}).ratio,null);
});
