import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calendar40,coverage40,summarize40} from '../trading/lab/jeu40-diagnostic.mjs';
import {JEU40_POLICY,JEU40_MONTHS,JEU40_MISSING} from '../trading/lab/jeu40-policy.mjs';
import {historyCalendar} from '../trading/lab/jeu14-policy.mjs';
test('Game40 changes only the authorized start date and error wording of the frozen Game37 engine',()=>{
 const original=readFileSync(new URL('../trading/lab/jeu37-engine.mjs',import.meta.url),'utf8'),derived=readFileSync(new URL('../trading/lab/jeu40-engine.mjs',import.meta.url),'utf8');
 assert.equal(original.split('period.start < P.from').length,2);
 assert.equal(derived,original.replace('period.start < P.from',"period.start < '2026-01-01'").replace('Authorized June–August period required','Authorized January–August period required'));
 assert.equal(JEU40_POLICY.executionAllowed,false);assert.equal(JEU40_POLICY.riskMaximumUSD,100);assert.equal(JEU40_POLICY.executionCount,16);
});
test('eight-month coverage preserves both missing sessions and all unaffected days',()=>{
 const expected=historyCalendar('2026-01-01','2026-09-01');assert.equal(expected.length,166);
 const markets=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,data:{eligible:expected.filter(d=>!JEU40_MISSING.some(m=>m.day===d.date&&m.symbols.includes(symbol)))}}));
 const c=JEU40_MONTHS.map(month=>coverage40(markets,month));assert.deepEqual(c.flatMap(x=>x.missing),JEU40_MISSING);
 assert.equal(c.reduce((n,x)=>n+x.available,0),164);assert.equal(c.filter(x=>!x.complete).length,2);
 assert.deepEqual(c.map(x=>x.expected),[20,19,22,21,20,21,22,21]);
 markets[0].data.eligible=markets[0].data.eligible.filter(d=>d.date!=='2026-04-01');assert.equal(coverage40(markets,JEU40_MONTHS[3]).available,20);
});
test('missing calendar data stays null while account cashflows carry between observed dates',()=>{
 const expected=['2026-02-24','2026-02-25','2026-02-26'].map(date=>({date}));
 const payout={maxReceiptEUR:0,remainingProfitUSD:1000},days=[{day:'2026-02-24',net:10,trades:1,balance:50010,floor:48010,payoutGrossUSD:0,payoutReceiptEUR:0,qualifyingDays:0,payout},{day:'2026-02-26',net:-5,trades:1,balance:50005,floor:48010,payoutGrossUSD:0,payoutReceiptEUR:0,qualifyingDays:0,payout}],trades=[{day:'2026-02-24',symbol:'MNQ',netDollars:10,plannedRiskUSD:50},{day:'2026-02-26',symbol:'MES',netDollars:-5,plannedRiskUSD:25}];
 const c=calendar40({initial:50000,net:5,receiptEUR:0,terminalDay:null,days,trades},expected,[{day:'2026-02-25',symbols:['MGC']}]);
 assert.equal(c.daily[1].state,'missing-data');for(const k of['net','trades','balance','cumulative','receiptEUR'])assert.equal(c.daily[1][k],null);
 assert.equal(c.daily[2].balance,50005);assert.equal(c.daily[2].cumulative,5);assert.equal(c.daily[0].averageRiskUSD,50);
 assert.equal(c.weeks[0].net,5);assert.equal(c.weeks[0].observed,2);assert.equal(c.weeks[0].expected,3);assert.equal(c.weeks[0].missing,1);assert.equal(c.weeks[0].complete,false);
 const stopped=calendar40({initial:50000,net:10,receiptEUR:0,status:'profitTargetMet',terminalDay:'2026-02-24',days:days.slice(0,1),trades:trades.slice(0,1)},expected,[{day:'2026-02-25',symbols:['MGC']}]);
 assert.equal(stopped.daily[1].state,'missing-data');assert.equal(stopped.daily[2].state,'stopped-profitTargetMet');assert.equal(stopped.daily[2].net,null);
});
test('summary weights trades, divides observed reset-month total by eight and never claims a complete missing-data result',()=>{
 const nets=[100,-40,0,20,30,40,50,60],counts=[1,9,0,2,3,4,5,6];
 const views=JEU40_MONTHS.map((m,i)=>{const row={net:nets[i],trades:counts[i],wins:i===1?1:counts[i],losses:i===1?8:0,drawdown:i*10,calendar:{daily:[{net:nets[i]}]},withdrawnUSD:0,receiptEUR:0,personalGoalAchieved:false,profitGoalAchieved:false};return {month:m.id,coverage:{expected:m.expected,available:m.available,complete:m.expected===m.available},costs:{normal:row,stress:{...row}}};});
 const s=summarize40(views,'normal');assert.equal(s.totalObserved,260);assert.equal(s.meanObservedMonthly,32.5);assert.equal(s.trades,30);assert.equal(s.weightedMeanTrade,8.67);assert.equal(s.weightedWinRate,22/30);assert.equal(s.negativeMonths,1);assert.equal(s.medianObservedMonthly,35);assert.equal(s.maxMonthlyDrawdown,70);
 assert.equal(s.completeMonths,6);assert.equal(s.incompleteMonths,2);assert.equal(s.fullEightMonthMean,null);assert.equal(s.fullEightMonthNet,null);assert.equal(s.continuousDrawdown,null);
 assert.throws(()=>summarize40(views.slice(1),'normal'),/Eight/);assert.throws(()=>summarize40(views,'unknown'),/Eight/);
});
