import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateExitPortfolio} from '../trading/lab/jeu35-engine.mjs';
import {simulateMonthlyPortfolio} from '../trading/lab/jeu34-engine.mjs';
import {compareExecutions} from '../trading/lab/jeu35-comparison.mjs';
const period={start:'2026-06-01',end:'2026-06-02'},start=Date.parse('2026-06-01T13:30Z')/1000;
function fixture(symbol='MNQ',side='Long',reversal=false){
 const sign=side==='Long'?1:-1;
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,signals:new Map(),candles:Array.from({length:78},(_,i)=>({time:start+i*300,day:period.start,minute:570+i*5,closeMinute:960,ticker:symbol+'M6',open:100,high:101,low:99,close:100}))}));
 const s=streams.find(s=>s.symbol===symbol),signal=(time,side)=>({day:period.start,side,signalOpen:time-300,signalClose:time,rangeClosedAt:time-600,breakoutAt:time-300,trendClosedAt:time-600,rangeHigh:side==='Long'?99:111,rangeLow:side==='Long'?89:101,stopPrice:side==='Long'?95:105,pattern:'orb-retest'});
 s.signals.set(start+1800,signal(start+1800,side));
 Object.assign(s.candles[6],sign===1?{high:112,close:110}:{low:88,close:90});
 Object.assign(s.candles[7],reversal?(sign===1?{low:94}:{high:106}):(sign===1?{high:116,close:115}:{low:84,close:85}));
 if(symbol!=='MES')streams.find(s=>s.symbol==='MES').signals.set(start+2100,signal(start+2100,'Long'));
 return streams;
}
test('2R default reproduces the monthly engine; 3R keeps entry, stop, quantity and initial risk',()=>{
 const streams=fixture(),old=simulateMonthlyPortfolio(streams,period),base=simulateExitPortfolio(streams,period),wide=simulateExitPortfolio(streams,period,1,'funded','mnq-3r');
 assert.deepEqual(base,old);
 const a=base.trades.find(t=>t.symbol==='MNQ'),b=wide.trades.find(t=>t.symbol==='MNQ');
 for(const k of ['entry','entryTime','stop','initialStop','riskDollars','costDollars','quantity','plannedRiskUSD'])assert.equal(a[k],b[k],k);
 assert.equal(a.target,110);assert.equal(b.target,115);assert.equal(b.reason,'Target');assert.equal(b.exitTime,a.exitTime+300);
 assert.equal(wide.decisions.find(d=>d.symbol==='MES').reason,'occupied');
});
test('a farther target can turn a 2R winner into a loss; common and displaced trades reconcile',()=>{
 const streams=fixture('MNQ','Long',true),a=simulateExitPortfolio(streams,period),b=simulateExitPortfolio(streams,period,1,'funded','mnq-3r');
 assert.ok(a.trades.find(t=>t.symbol==='MNQ').netDollars>0);assert.ok(b.trades.find(t=>t.symbol==='MNQ').netDollars<0);
 const c=compareExecutions(a,b,'MNQ');assert.equal(c.winnersToLosers,1);assert.equal(c.removedTrades,1);assert.equal(c.delta,Math.round((b.net-a.net)*100)/100);
});
test('the MGC extension is symmetric for shorts and other profiles remain unchanged',()=>{
 const streams=fixture('MGC','Short'),base=simulateExitPortfolio(streams,period),wide=simulateExitPortfolio(streams,period,2,'funded','mgc-3r');
 const t=wide.trades.find(t=>t.symbol==='MGC');assert.equal(t.target,85);assert.equal(t.stop,105);assert.ok(t.plannedRiskUSD<=100);assert.equal(t.reason,'Target');
 assert.deepEqual(simulateExitPortfolio(streams,period,1,'funded','mnq-3r'),base);
 assert.throws(()=>simulateExitPortfolio(streams,period,1,'funded','unknown'),/Unknown exit/);
});
