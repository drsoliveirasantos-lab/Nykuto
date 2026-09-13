import test from 'node:test';
import assert from 'node:assert/strict';
import {confidenceGrade,desiredRisk,accountRiskTier,confidenceSizedTerms,confidenceRiskGate} from '../trading/lab/jeu37-risk.mjs';
import {simulateConfidencePortfolio} from '../trading/lab/jeu37-engine.mjs';
import {simulateMonthlyPortfolio} from '../trading/lab/jeu34-engine.mjs';
import {historyCalendar} from '../trading/lab/jeu14-policy.mjs';
import {JEU29_PRODUCTS} from '../trading/lab/jeu29-policy.mjs';
import {monthlyCalendar} from '../trading/lab/jeu34-calendar.mjs';
function fixture(days=1,side='Long',risk=5){
 const dates=historyCalendar('2026-06-01','2026-07-01').slice(0,days),period={start:dates[0].date,end:new Date(Date.parse(dates.at(-1).date+'T00:00Z')+86400000).toISOString().slice(0,10)};
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,signals:new Map(),candles:dates.flatMap(d=>{const start=Date.parse(d.date+'T13:30Z')/1000;return Array.from({length:78},(_,i)=>({time:start+i*300,day:d.date,minute:570+i*5,closeMinute:960,ticker:symbol+'M6',open:100,high:101,low:99,close:100}));})})),s=streams.find(s=>s.symbol==='MNQ'),contexts=new Map([['MNQ',new Map()]]),sign=side==='Long'?1:-1;
 for(const d of dates){
  const start=Date.parse(d.date+'T13:30Z')/1000,time=start+2100,signal={day:d.date,side,signalOpen:time-300,signalClose:time,rangeClosedAt:start+1800,breakoutAt:start+1800,trendClosedAt:start+1800,rangeHigh:sign===1?99:111,rangeLow:sign===1?89:101,stopPrice:100-sign*risk,pattern:'orb-retest'};
  s.signals.set(time,signal);const b=s.candles.find(b=>b.time===time);Object.assign(b,sign===1?{high:100+2*risk+1,close:100+2*risk}:{low:100-2*risk-1,close:100-2*risk});
  contexts.get('MNQ').set(time,{day:d.date,ticker:'MNQM6',closedAt:time,sourceTime:time-300,emaReady:true,fast:100+sign,slow:100,vwapSide:sign,structure:side,rsi:sign===1?60:40,volumeRatio:1,patterns:[sign===1?'Corps haussier dominant':'Corps baissier dominant']});
 }
 return {streams,s,contexts,period,dates};
}
test('five closed-context families set a risk tier, not a probability; missing context stays at the small cap',()=>{
 const f=fixture(),[time,s]=[...f.s.signals][0],c=f.contexts.get('MNQ').get(time),full=confidenceGrade(s,c);
 assert.equal(full.score,5);assert.equal(full.grade,'full');assert.equal(desiredRisk('MNQ',full,'graded500'),500);assert.equal(desiredRisk('MGC',full,'graded500'),100);
 assert.equal(confidenceGrade(s,{...c,volumeRatio:null}).grade,'low');assert.equal(desiredRisk('MES',{grade:'low'},'graded250'),50);
 assert.equal(confidenceGrade(s,{...c,patterns:[]}).grade,'medium');assert.equal(desiredRisk('MES',{grade:'medium'},'graded250'),150);
 assert.throws(()=>confidenceGrade(s,{...c,closedAt:time+300}),/Noncausal/);assert.equal(accountRiskTier(50000,48000,1),1);
 assert.equal(accountRiskTier(48999,48000,1),.5);assert.equal(accountRiskTier(48499,48000,.5),.25);assert.equal(accountRiskTier(49999,48000,.25),.25);assert.equal(accountRiskTier(50000,48000,.25),1);
});
test('larger caps change integer size with fees, keep 2R and the stop, and respect the floor and daily budget',()=>{
 for(const side of ['Long','Short']){
  const f=fixture(1,side),[time,s]=[...f.s.signals][0],p=JEU29_PRODUCTS.find(p=>p.symbol==='MNQ');
  const small=confidenceSizedTerms(s,100,time,p,1,50).terms,big=confidenceSizedTerms(s,100,time,p,1,500).terms;
  assert.ok(big.quantity>small.quantity);assert.equal(big.quantity,20);assert.equal(big.risk,small.risk);assert.equal(big.targetDistance,2*big.risk);assert.ok(big.plannedRiskUSD<=500);
  const state={balance:50100,floor:49800,dayStart:50000,riskDollars:big.riskDollars,costDollars:big.costDollars};
  assert.equal(confidenceRiskGate(state,{dailyLoss:1000},500),'floorReserve');
  assert.equal(confidenceRiskGate({...state,floor:48000,balance:49600},{dailyLoss:500},500),'dailyBudget');
 }
});
test('control reproduces the archived engine and fixed100 preserves trade cashflows before any new objective event',()=>{
 const f=fixture(3),old=simulateMonthlyPortfolio(f.streams,f.period),control=simulateConfidencePortfolio(f.streams,f.contexts,f.period,1,'control'),run=simulateConfidencePortfolio(f.streams,f.contexts,f.period,1,'fixed100');
 assert.deepEqual(control,old);assert.deepEqual(run.trades.map(({confidence,requestedRiskUSD,accountTier,...t})=>t),old.trades);assert.deepEqual(run.days,old.days);assert.equal(run.net,old.net);assert.equal(run.drawdown,old.drawdown);
});
test('one personal payout reduces cash and locks the floor; trading continues toward 4K without counting withdrawal as a loss',()=>{
 const f=fixture(17),run=simulateConfidencePortfolio(f.streams,f.contexts,f.period,1,'fixed500'),paid=run.days.filter(d=>d.payoutGrossUSD>0);
 assert.equal(paid.length,1);assert.equal(paid[0].payoutGrossUSD,1294.67);assert.equal(paid[0].floor,50100);assert.equal(paid[0].qualifyingDays,0);
 assert.equal(run.receiptEUR,1000);assert.ok(run.goalDay<run.profitGoalDay);assert.equal(run.profitGoalAchieved,true);assert.equal(run.status,'profitTargetMet');
 assert.equal(run.drawdown,0);assert.equal(run.net,Math.round((run.balance-50000+run.withdrawnUSD)*100)/100);assert.ok(run.net>=4000);
 const cal=monthlyCalendar(run,f.dates);assert.ok(cal.daily.some(d=>d.state==='stopped-profitTargetMet'&&d.net===null));assert.equal(cal.daily.reduce((n,d)=>n+d.receiptEUR,0),1000);
});
test('4K and the personal payout are different goals; an adverse gap can still invalidate a larger-risk account',()=>{
 const f=fixture(10,'Long',20),run=simulateConfidencePortfolio(f.streams,f.contexts,f.period,1,'fixed500');
 assert.equal(run.profitGoalAchieved,true);assert.equal(run.personalGoalAchieved,true);
 const early=fixture(3,'Long',20),mes=early.streams.find(s=>s.symbol==='MES');
 for(const [time,signal]of early.s.signals){const next=time+600;mes.signals.set(next,{...signal,signalOpen:next-300,signalClose:next,stopPrice:96});Object.assign(mes.candles.find(b=>b.time===next),{high:109,close:108});}
 const beforeQualifying=simulateConfidencePortfolio(early.streams,early.contexts,early.period,1,'fixed500');assert.equal(beforeQualifying.profitGoalAchieved,true);assert.equal(beforeQualifying.personalGoalAchieved,false);
 const g=fixture(2),time=[...g.s.signals.keys()][0],bar=g.s.candles.find(b=>b.time===time);Object.assign(bar,{high:101,low:99,close:100});
 const next=g.s.candles.find(b=>b.time===time+300);Object.assign(next,{open:1,high:2,low:1,close:1});
 const loss=simulateConfidencePortfolio(g.streams,g.contexts,g.period,1,'fixed500');assert.equal(loss.status,'breached');assert.equal(loss.trades[0].reason,'MLL gap');assert.ok(loss.trades[0].netDollars < -500);assert.equal(loss.personalGoalAchieved,false);
});
