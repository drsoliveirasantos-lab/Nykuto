import test from 'node:test';
import assert from 'node:assert/strict';
import {alignmentContexts,alignmentDecision} from '../trading/lab/jeu32-alignment.mjs';
import {sizedTerms,sizedRiskGate} from '../trading/lab/jeu32-risk.mjs';
import {simulateSummerPortfolio} from '../trading/lab/jeu32-engine.mjs';
import {sessionMeasures,weeklyObjective} from '../trading/lab/jeu32-study.mjs';
import {JEU29_PRODUCTS} from '../trading/lab/jeu32-policy.mjs';
const product=JEU29_PRODUCTS.find(p=>p.symbol==='MNQ');
function bars(day='2026-06-01',symbol='MNQ',closeMinute=960){const t=Date.parse(day+'T13:30Z')/1000;return Array.from({length:(closeMinute-570)/5},(_,i)=>({time:t+i*300,day,minute:570+i*5,closeMinute,ticker:symbol+'M6',open:1000,high:1001,low:999,close:1000,volume:100}));}
function signal(b,stop=980){return {side:'Long',day:b.day,signalOpen:b.time-300,signalClose:b.time,rangeClosedAt:b.time-(b.minute-600)*60,trendClosedAt:b.time-(b.minute-600)*60,breakoutAt:b.time-300,rangeHigh:999,rangeLow:950,stopPrice:stop,pattern:'orb-retest'};}
test('H1 uses only complete cash hours and retains the previous closed hour until the next closes',()=>{
 const days=['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'];let index=0;
 const tape=days.flatMap(d=>bars(d).map(b=>{const v=1000+index++*.25;return {...b,open:v,high:v+.5,low:v-.25,close:v+.25};}));
 const ctx=alignmentContexts(tape,product),start=tape.find(b=>b.day==='2026-05-08').time;
 const before=ctx.get(start+55*60),after=ctx.get(start+60*60);
 assert(before.h1.closedAt<start);assert.equal(after.h1.closedAt,start+3600);assert.equal(after.h1.count,before.h1.count+1);
 assert.equal(ctx.get(tape.at(-1).time+300).h1.count,30);
 assert.equal(alignmentDecision(signal(tape.find(b=>b.time===start+3600)),ctx.get(start+3600)).allowed,true);
 const cut=start+55*60,prefix=alignmentContexts(tape.filter(b=>b.time+300<=cut),product);assert.deepEqual(prefix.get(cut),ctx.get(cut));
 const changed=tape.map(b=>b.time+300<=cut?b:{...b,open:2000,high:2001,low:1999,close:2000});assert.deepEqual(alignmentContexts(changed,product).get(cut),ctx.get(cut));
});
test('short sessions never become fractional H1 and a contract or missing-session boundary resets warmup',()=>{
 const first=bars('2026-05-04','MNQ',780);assert.equal(alignmentContexts(first,product).get(first.at(-1).time+300).h1.count,3);
 const roll=[...bars('2026-05-04'),...bars('2026-05-05').map(b=>({...b,ticker:'MNQU6'}))],r=alignmentContexts(roll,product);
 assert.equal(r.get(roll[78].time+300).h1,null);
 const gap=[...bars('2026-05-04'),...bars('2026-05-06')];assert.equal(alignmentContexts(gap,product).get(gap[78].time+300).h1,null);
 assert.equal(alignmentDecision(signal(first[8]),null).reason,'alignment-unknown');
 const bad={day:first[8].day,closedAt:first[8].time,sourceTime:first[8].time-300,m5:{ready:true,direction:'Long'},h1:{ready:true,direction:'Long',closedAt:first[8].time+300,sourceTime:first[8].time-3300}};
 assert.throws(()=>alignmentDecision(signal(first[8]),bad),/Noncausal/);
});
test('cash H1 boundary remains 10:30 New York on both sides of the daylight-saving change',()=>{
 for(const [day,open]of [['2026-03-06','14:30'],['2026-03-09','13:30']]){
  const tape=bars(day).map((b,i)=>({...b,time:Date.parse(day+'T'+open+'Z')/1000+i*300}));
  const x=alignmentContexts(tape,product).get(tape[11].time+300);assert.equal(x.h1.closedAt,tape[0].time+3600);assert.equal(tape[11].minute+5,630);
 }
});
test('integer contract sizing respects 150/500 all-in caps, 20 micros, doubled per-contract costs and a fixed 2R target',()=>{
 const b=bars()[8],s=signal(b);
 for(const id of ['rr2-150','aligned-150','rr2-500','aligned-500'])for(const factor of [1,2]){
  const x=sizedTerms(s,b.open,b.time,product,factor,id).terms,cap=id.endsWith('500')?500:150;
  assert(Number.isInteger(x.quantity)&&x.quantity>=1&&x.quantity<=20);assert(x.riskDollars+x.costDollars<=cap);
  assert.equal(x.targetDistance,2*x.risk);assert.equal(x.costDollars,3.5*factor*x.quantity);
 }
 const mes=JEU29_PRODUCTS.find(p=>p.symbol==='MES');assert.equal(sizedTerms(signal(b,995),1000,b.time,mes,1,'rr2-500').terms.quantity,16);
 assert.equal(sizedTerms(signal(b,500),1000,b.time,product,1,'rr2-500').blocked,'tradeRisk');
 assert.equal(sizedTerms(signal(b,996),1000,b.time,product,1,'rr2-500').terms.quantity,20);
});
test('500 USD admission refuses a second full-risk loss when only 500 remains above the floor',()=>{
 const x={balance:24500,floor:24000,dayStart:25000,riskDollars:480,costDollars:20,account:true};
 assert.equal(sizedRiskGate(x,'aligned-500'),'floorReserve');assert.equal(sizedRiskGate({...x,account:false},'aligned-500'),null);
 assert.equal(sizedRiskGate({...x,balance:24499,account:false},'aligned-500'),'dailyBudget');
});
test('actual replay scales fills and fees, reserves the full occupied bar and preserves original inputs',()=>{
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,candles:bars('2026-06-01',symbol),signals:new Map()}));
 const m=streams[2];m.signals.set(m.candles[8].time,signal(m.candles[8]));m.candles[8].low=980;
 const before=structuredClone(streams),run=simulateSummerPortfolio(streams,{start:'2026-06-01',end:'2026-06-02'},1,false,'rr2-500');
 assert.deepEqual(streams,before);assert.equal(run.trades.length,1);assert.equal(run.trades[0].quantity,11);assert.equal(run.net,-478.5);assert.equal(run.trades[0].costDollars,38.5);
 m.candles[8].low=999;m.candles[9].open=970;m.candles[9].low=969;m.candles[9].close=970;m.candles[9].high=971;
 const gap=simulateSummerPortfolio(streams,{start:'2026-06-01',end:'2026-06-02'},1,false,'rr2-500');assert.equal(gap.trades[0].reason,'Stop gap');assert.equal(gap.net,-698.5);
});
test('same-bar stop and target choose the stop; profitable gaps fill only the target and unknown periods reject',()=>{
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,candles:bars('2026-06-01',symbol),signals:new Map()})),m=streams[2];
 m.signals.set(m.candles[8].time,signal(m.candles[8]));m.candles[8].low=980;m.candles[8].high=1040;
 const period={start:'2026-06-01',end:'2026-06-02'},r=simulateSummerPortfolio(streams,period,1,false,'rr2-500');assert.equal(r.trades[0].ambiguous,true);assert.equal(r.net,-478.5);
 m.candles[8].low=999;m.candles[8].high=1001;m.candles[9]={...m.candles[9],open:1050,high:1051,low:1049,close:1050};
 assert.equal(simulateSummerPortfolio(streams,period,1,false,'rr2-500').trades[0].exit,1040);
 assert.throws(()=>simulateSummerPortfolio(streams,{start:'2026-05-01',end:'2026-06-02'}),/Authorized/);
});
test('weekly targets separate a month boundary, a holiday week and incomplete stopped observations',()=>{
 const base={week:'2026-06-15',first:'2026-06-15',last:'2026-06-18',expectedSessions:4,simulatedSessions:4,missingSessions:0,stoppedSessions:0,net:1000};
 const c={weeks:[base,{...base,week:'2026-06-29',first:'2026-06-29',last:'2026-06-30',expectedSessions:2,simulatedSessions:2,net:1500}]};
 const x=weeklyObjective(c,{start:'2026-06-01',end:'2026-07-01'});assert.equal(x.evaluableFullWeeks,1);assert.equal(x.targetWeeks,1);assert.equal(x.weeks[1].partialBoundary,true);
 const stopped=weeklyObjective({weeks:[{...base,simulatedSessions:1,stoppedSessions:3,net:1100}]},{start:'2026-06-01',end:'2026-07-01'});assert.equal(stopped.targetRate,null);assert.equal(stopped.weeks[0].targetMet,null);
});
test('descriptive efficiency distinguishes a monotonic path from a round trip without treating volume as liquidity',()=>{
 const x=bars().map((b,i)=>({...b,open:1000+i,close:1001+i,high:1002+i,low:999+i}));assert.equal(sessionMeasures(x).efficiency,1);
 const y=bars();y[20]={...y[20],close:1050,high:1050};assert.equal(sessionMeasures(y).efficiency,0);assert.equal(sessionMeasures(y).volumePerMinute,20);
});
test('the aligned simulator refuses an unverified signal even if a caller skips upstream filtering',()=>{
 const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,candles:bars('2026-06-01',symbol),signals:new Map()})),m=streams[2];m.signals.set(m.candles[8].time,signal(m.candles[8]));
 const r=simulateSummerPortfolio(streams,{start:'2026-06-01',end:'2026-06-02'},1,false,'aligned-500');assert.equal(r.trades.length,0);assert.equal(r.denied['alignment-unknown'],1);
});
