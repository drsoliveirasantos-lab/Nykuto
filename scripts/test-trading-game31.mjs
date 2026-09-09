import test from 'node:test';
import assert from 'node:assert/strict';
import {assessMarketFilter,filterMarketStreams,compareFilteredRuns} from '../trading/lab/jeu31-filters.mjs';
import {simulatePortfolio} from '../trading/lab/jeu29-engine.mjs';
const time=Date.parse('2026-01-02T15:10:00Z')/1000;
const signal=(t=time,side='Long')=>({day:new Date(t*1000).toISOString().slice(0,10),signalOpen:t-300,signalClose:t,side});
const context=(rsi,t=time)=>({rsi,closedAt:t,sourceTime:t-300,day:signal(t).day,ticker:'MESH6'});
test('MES RSI gate uses strict raw 30/70 boundaries and preserves the opposite side',()=>{
  for(const [side,rsi,allowed]of [['Long',70,true],['Long',70.00001,false],['Short',30,true],['Short',29.99999,false],['Long',20,true],['Short',80,true]])
    assert.equal(assessMarketFilter('MES',time,signal(time,side),context(rsi),'mes-rsi').allowed,allowed);
  assert.equal(assessMarketFilter('MES',time,signal(),null,'mes-rsi').reason,'mes-rsi-unknown');
  assert.equal(assessMarketFilter('MES',time,signal(),context(null),'mes-rsi').reason,'mes-rsi-unknown');
  for(const rsi of [NaN,Infinity,-1,101,'70'])assert.throws(()=>assessMarketFilter('MES',time,signal(),context(rsi),'mes-rsi'));
  assert.throws(()=>assessMarketFilter('MES',time,signal(),context(40,time+300),'mes-rsi'));
});
test('MGC cutoff follows New York at 10:55/11:00 across winter and summer',()=>{
  for(const [stamp,allowed]of [['2026-01-02T15:55Z',true],['2026-01-02T16:00Z',false],['2026-08-03T14:55Z',true],['2026-08-03T15:00Z',false]]){
    const t=Date.parse(stamp)/1000;assert.equal(assessMarketFilter('MGC',t,signal(t),null,'mgc-morning').allowed,allowed);
  }
  assert.equal(assessMarketFilter('MNQ',time,signal(),context(90),'combined').allowed,true);
  assert.equal(assessMarketFilter('MYM',time,signal(),null,'combined').allowed,true);
  assert.equal(assessMarketFilter('MES',time,signal(),null,'mgc-morning').allowed,true);
  assert.throws(()=>assessMarketFilter('MES',time,signal(),context(40),'missing'));
});
function fixture(){
  const open=Date.parse('2026-01-02T14:30Z')/1000;
  const streams=['MES','MGC','MNQ','MYM'].map(symbol=>({symbol,signals:new Map(),candles:Array.from({length:78},(_,i)=>({time:open+i*300,day:'2026-01-02',minute:570+i*5,closeMinute:960,ticker:symbol+'H6',open:1000,high:1001,low:999,close:1000,volume:100}))}));
  for(const s of streams.filter(s=>['MES','MNQ'].includes(s.symbol))){
    const distance=s.symbol==='MES'?20:40;
    s.signals.set(time,{...signal(),rangeClosedAt:open+1800,trendClosedAt:open+1800,breakoutAt:time-300,rangeHigh:999,rangeLow:1000-distance*3,stopPrice:1000-distance,pattern:'orb-retest'});
    s.candles[8].low=1000-distance;
  }
  return streams;
}
test('filtering frees the actual portfolio slot and does not mutate the original engine input',()=>{
  const streams=fixture(),before=structuredClone(streams),contexts=new Map([['MES',new Map([[time,context(80)]])]]);
  const filtered=filterMarketStreams(streams,contexts,'mes-rsi');assert.deepEqual(streams,before);
  const period={start:'2026-01-02',end:'2026-01-03'};
  for(const factor of [1,2])for(const account of [false,true]){
    const base=simulatePortfolio(streams,period,factor,account),candidate=simulatePortfolio(filtered.streams,period,factor,account);
    assert.equal(base.trades[0].symbol,'MES');assert.equal(candidate.trades[0].symbol,'MNQ');assert.equal(candidate.executionAllowed,false);
    assert(candidate.trades.every(t=>t.riskDollars+t.costDollars<=150));assert(candidate.days.every(d=>d.trades<=2));
    const effects=compareFilteredRuns(base,candidate);assert.equal(effects.removed.count,1);assert.equal(effects.added.count,1);
  }
  assert.deepEqual(filterMarketStreams(streams,new Map(),'baseline').streams,streams);
});
test('a rejected MES signal does not consume its side; a later non-extreme signal can enter',()=>{
  const streams=fixture();streams.find(s=>s.symbol==='MNQ').signals.clear();const mes=streams[0],later=time+600;
  const early=mes.signals.get(time);mes.signals.set(later,{...early,...signal(later)});
  const contexts=new Map([['MES',new Map([[time,context(80)],[later,context(60,later)]])]]);
  const filtered=filterMarketStreams(streams,contexts,'mes-rsi');
  const value=simulatePortfolio(filtered.streams,{start:'2026-01-02',end:'2026-01-03'});
  assert.equal(value.trades[0].entryTime,later);assert.equal(value.trades.length,1);
});
test('trade attribution includes lost winners, avoided losers, new trades and changed common exits',()=>{
  const row=(i,net)=>({symbol:'MES',side:'Long',entryTime:i,exitTime:i+300,netDollars:net});
  const before={net:70,trades:[row(1,100),row(2,-50),row(3,20)]},after={net:65,trades:[row(3,30),row(4,35)]};
  const e=compareFilteredRuns(before,after);assert.deepEqual(e.removed,{count:2,wins:1,losses:1,flat:0,net:50});
  assert.equal(e.added.net,35);assert.equal(e.commonNetChange,10);assert.equal(e.delta,-5);assert.equal(e.changedCommonExits,1);
});
