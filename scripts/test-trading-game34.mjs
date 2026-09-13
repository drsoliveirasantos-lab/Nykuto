import test from 'node:test';
import assert from 'node:assert/strict';
import {personalTarget,payoutEligibility} from '../trading/lab/jeu34-payout.mjs';
import {monthlyCalendar} from '../trading/lab/jeu34-calendar.mjs';
test('1000 EUR goal includes 90/10 split, currency conversion and 50% profit limit',()=>{
 const t=personalTarget();assert.equal(t.requestUSD,1294.67);assert.equal(t.requiredProfitUSD,2589.34);
 assert.equal(personalTarget(1.2,10).requestUSD,1346.67);
 assert.throws(()=>personalTarget(0));
});
test('weekly ledger separates profit, withdrawn principal and weeks stopped after goal',()=>{
 const payout=payoutEligibility({balance:52589.34,qualifyingDays:5});
 const run={initial:50000,terminalDay:'2026-06-01',status:'personalGoalMet',net:2589.34,receiptEUR:1000,
  trades:[{day:'2026-06-01',netDollars:2589.34}],days:[{day:'2026-06-01',net:2589.34,trades:1,balance:51294.67,floor:50100,payoutGrossUSD:1294.67,payoutReceiptEUR:1000,qualifyingDays:5,payout}]};
 const c=monthlyCalendar(run,['2026-06-01','2026-06-02','2026-06-08']);
 assert.equal(c.weeks[0].net,2589.34);assert.equal(c.weeks[0].receiptEUR,1000);assert.equal(c.daily[0].balance,51294.67);
 assert.equal(c.weeks[1].net,null);assert.equal(c.weeks[1].receiptEUR,0);
 assert.throws(()=>monthlyCalendar({...run,days:[{...run.days[0],balance:52589.34}]},['2026-06-01']),/cashflow/);
});
test('five qualifying days and enough profits are both required, evaluation is not withdrawable',()=>{
 assert.equal(payoutEligibility({balance:53000,qualifyingDays:4}).goalEligible,false);
 assert.equal(payoutEligibility({balance:52000,qualifyingDays:5}).maxReceiptEUR,772.39);
 assert.equal(payoutEligibility({balance:53000,qualifyingDays:5,mode:'evaluation'}).maxRequestUSD,0);
 assert.equal(payoutEligibility({balance:49900,qualifyingDays:5}).maxRequestUSD,0);
 assert.equal(payoutEligibility({balance:53000,qualifyingDays:5,breached:true}).maxRequestUSD,0);
});
test('goal withdrawal locks floor and leaves reconciled capital and reserve',()=>{
 const a=payoutEligibility({balance:52589.33,qualifyingDays:5});assert.equal(a.goalEligible,false);
 const b=payoutEligibility({balance:52589.34,qualifyingDays:5});assert.equal(b.goalEligible,true);assert.equal(b.goalReceiptEUR,1000);assert.equal(b.goalBalanceAfter,51294.67);assert.equal(b.goalHeadroomAfter,1194.67);
 assert.equal(payoutEligibility({balance:56000,qualifyingDays:5}).maxRequestUSD,2000);
});
