import test from 'node:test';
import assert from 'node:assert/strict';
import { floorAtClose,entryGate,accountFill,simulateLucid,lucidSignals } from '../trading/lab/jeu15-engine.mjs';
import { JEU15_POLICY as P,JEU15_SCENARIOS as S } from '../trading/lab/jeu15-policy.mjs';
const position={side:'Long',entry:100,stop:90,target:115,costDollars:3.5};
test('EOD floor only rises at day close and locks at 25100',()=>{
 assert.equal(floorAtClose(24000,25500),24500);assert.equal(floorAtClose(24500,25200),24500);assert.equal(floorAtClose(24500,27000),25100);
 assert.throws(()=>floorAtClose(NaN,25000));
});
test('entry budget includes round trip costs, daily loss and reserve, even when one micro is too large',()=>{
 const b={balance:25000,floor:24000,dayStart:25000,riskDollars:46.5,costDollars:3.5,guarded:true,account:true};
 assert.equal(entryGate(b),null);assert.equal(entryGate({...b,costDollars:7}),'tradeRisk');assert.equal(entryGate({...b,riskDollars:101.5}),'tradeRisk');
 assert.equal(entryGate({...b,balance:24925}),'dailyBudget');assert.equal(entryGate({...b,floor:24900}),'floorReserve');
 assert.throws(()=>entryGate({...b,riskDollars:NaN}));
});
test('a stop nearer than the account floor fills before hypothetical later lows; ties with target are adverse first',()=>{
 const f=accountFill(position,{open:100,high:116,low:1},25000,24000,25000,false,true);
 assert.deepEqual(f,{price:90,reason:'Stop',ambiguous:true});
});
test('MLL includes open losses and is hit on executable tick; favorable close cannot repair a breach',()=>{
 const p={...position,stop:1};const f=accountFill(p,{open:100,high:130,low:40},25000,24900,25000,false,true);
 assert.equal(f.price,51.75);assert.equal(f.reason,'MLL');assert.equal(f.ambiguous,true);
 const eq=25000+(f.price-100)*2-3.5;assert.equal(eq,24900);
});
test('daily stop does not remove gap losses; short thresholds are mirrored correctly',()=>{
 assert.equal(accountFill({...position,stop:1},{open:40,low:30,high:110},25000,24000,25000,true,true).reason,'Daily gap');
 const p={side:'Short',entry:100,stop:1000,target:85,costDollars:3.5};
 assert.equal(accountFill(p,{open:100,high:200,low:80},25000,24900,25000,false,true).price,148.25);
});
function fixture(){
 const day='2026-01-02',start=Date.parse(day+'T14:30:00Z')/1000;
 const bars=Array.from({length:78},(_,i)=>({time:start+i*300,day,minute:570+i*5,closeMinute:960,ticker:'MNQH6',open:100,high:100,low:100,close:100,volume:10}));
 const s=new Map([[start+1800,{side:'Long',day,atr:8,signalOpen:start,signalClose:start+1800}]]);
 return {bars,s,bounds:{start:day,end:'2026-01-03'}};
}
test('session close and cost are booked once; no overnight position or active bot',()=>{
 const {bars,s,bounds}=fixture(),r=simulateLucid(bars,s,S[0],bounds);
 assert.equal(r.trades.length,1);assert.equal(r.trades[0].exitTime,bars[75].time);assert.equal(r.net,-3.5);assert.equal(r.days.length,1);
 assert.equal(P.paperEnabled,false);assert.equal(P.brokerEnabled,false);assert.equal(P.confirmed,false);
});
test('a breach stops all further entries permanently without resetting the account',()=>{
 const {bars,s,bounds}=fixture();s.values().next().value.atr=800;for(const b of bars)Object.assign(b,{open:10000,high:10000,low:10000,close:10000});bars[8]={...bars[8],low:9000};
 s.set(bars[12].time,{...s.values().next().value,signalOpen:bars[6].time,signalClose:bars[12].time});
 const r=simulateLucid(bars,s,S[0],bounds);assert.equal(r.status,'breached');assert.equal(r.trades.length,1);assert.ok(r.balance<=24000);
});
test('evaluation ends after consistent target and never resumes on later days',()=>{
 const {bars,s,bounds}=fixture(),first=s.values().next().value;first.atr=240;
 for(const b of bars)Object.assign(b,{open:10000,high:10000,low:10000,close:10000});bars[7].high=10450;
 const second=bars.map(b=>({...b,time:b.time+86400,day:'2026-01-03'}));
 const third=bars.map(b=>({...b,time:b.time+172800,day:'2026-01-04'}));
 for(const offset of [86400,172800])s.set(first.signalClose+offset,{...first,day:offset===86400?'2026-01-03':'2026-01-04',signalOpen:first.signalOpen+offset,signalClose:first.signalClose+offset});
 const r=simulateLucid([...bars,...second,...third],s,S[0],{...bounds,end:'2026-01-05'});
 assert.equal(r.status,'targetMet');assert.equal(r.trades.length,2);assert.equal(r.days.length,2);assert.equal(r.consistency,.5);assert.equal(r.terminalDay,'2026-01-03');
});
test('signals cannot read future bars; too-large risk yields no trades rather than fractional micros',()=>{
 const {bars,s,bounds}=fixture();s.values().next().value.atr=100;
 const r=simulateLucid(bars,s,S[1],bounds);assert.equal(r.trades.length,0);assert.equal(r.denied.tradeRisk,1);assert.equal(r.status,'incomplete');
 s.values().next().value.signalClose+=300;assert.throws(()=>simulateLucid(bars,s,S[0],bounds),/Noncausal/);
 assert.throws(()=>lucidSignals(bars,'unknown'),/Unknown/);
});
