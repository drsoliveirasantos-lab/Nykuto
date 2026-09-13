import test from 'node:test';
import assert from 'node:assert/strict';
import {accountProfile,accountFloor,riskCap,consistencyStatus} from '../trading/lab/jeu33-policy.mjs';
import {accountRiskGate} from '../trading/lab/jeu33-risk.mjs';
import {accountCalendar} from '../trading/lab/jeu33-diagnostic.mjs';
const p=accountProfile('50k-reduced100');
test('50k floor only rises at close, locks at 50100 and never loosens after loss',()=>{
 assert.equal(accountFloor(48000,50700,p),48700);
 assert.equal(accountFloor(48700,50200,p),48700);
 assert.equal(accountFloor(48700,52300,p),50100);
 assert.equal(accountFloor(50100,50500,p),50100);
});
test('risk reduction and recovery use headroom and recovered principal',()=>{
 assert.equal(riskCap(50000,48000,100,p),100);
 assert.equal(riskCap(48999,48000,100,p),50);
 assert.equal(riskCap(48499,48000,50,p),25);
 assert.equal(riskCap(49500,48000,25,p),25);
 assert.equal(riskCap(50000,49000,25,p),100);
 assert.equal(riskCap(50150,50100,100,p),25);
 assert.equal(riskCap(49000,48000,100,p),100);
 assert.equal(riskCap(48500,48000,100,p),50);
});
test('consistency counts losses in total, has no pass below target, and requires twice best day',()=>{
 assert.deepEqual(consistencyStatus(1800,3000,p),{ratio:.6,requiredProfit:3600,remaining:600,passed:false,model:'strict-50-conservative',cushionModeled:false});
 assert.equal(consistencyStatus(1800,3600,p).passed,true);
 assert.equal(consistencyStatus(1200,3000,p).ratio,.4);
 assert.equal(consistencyStatus(500,2000,p).passed,false);
 assert.equal(consistencyStatus(500,-100,p).ratio,null);
 assert.equal(consistencyStatus(1560,3000,p).passed,false);
});
test('risk includes costs, rejects exhausted margin, shares daily loss across all markets',()=>{
 const state={balance:50000,floor:48000,dayStart:50000,riskDollars:96.5,costDollars:3.5};
 assert.equal(accountRiskGate(state,p,100),null);
 assert.equal(accountRiskGate({...state,costDollars:7},p,100),'tradeRisk');
 assert.equal(accountRiskGate({...state,balance:48200},p,100),'dailyBudget');
 assert.equal(accountRiskGate({...state,balance:48200,dayStart:48200},p,100),null);
 assert.equal(accountRiskGate({...state,balance:48199,dayStart:48199},p,100),'floorReserve');
 assert.equal(accountRiskGate({...state,balance:48000,dayStart:48000},p,100),'accountFloor');
});
test('50k calendar reconciles its own principal and per-market contributions',()=>{
 const run={initial:50000,status:'incomplete',net:100,days:[{day:'2026-06-01',net:100,trades:1,balance:50100,floor:48100}],trades:[{day:'2026-06-01',symbol:'MGC',netDollars:100}]};
 const c=accountCalendar(run,['2026-06-01']);assert.equal(c.daily[0].balance,50100);assert.equal(c.daily[0].floor,48100);assert.equal(c.weeks[0].net,100);assert.equal(c.daily[0].contributions.find(t=>t.symbol==='MGC').net,100);
});
