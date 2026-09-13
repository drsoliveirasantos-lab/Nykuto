import test from 'node:test';
import assert from 'node:assert/strict';
import { JEU19_PRODUCTS as products, JEU19_SCENARIOS as scenarios } from '../trading/lab/jeu19-policy.mjs';
import { multimarketTerms, multimarketFill, simulateMultimarket, multimarketSignals } from '../trading/lab/jeu19-engine.mjs';
import { scheduleCovers, inspectMultimarket } from '../trading/lab/jeu19-history.mjs';
import { simulateAblation } from '../trading/lab/jeu17-engine.mjs';
import { JEU17_SCENARIOS } from '../trading/lab/jeu17-policy.mjs';

test('contract-specific ticks, dollar exposure and stress costs are enforced',()=>{
  const expected={MNQ:[20,3.5],MES:[50,5],MYM:[5,3.5],MGC:[100,4.5]};
  for(const p of products){
    // 1.25 × ATR 8 gives a ten-point stop; MYM needs a wider stop for net margin.
    const atr=p.symbol==='MYM'?40:8;
    for(const factor of [1,2]){
      const d=multimarketTerms({side:'Long',atr,signalClose:1000},1000,1000,p,factor);
      if(d.terms){assert.equal(d.terms.riskDollars,p.symbol==='MYM'?25:expected[p.symbol][0]);assert.equal(d.terms.costDollars,expected[p.symbol][1]*factor);}
      else assert.equal(d.blocked,'netReward');
    }
    assert.throws(()=>multimarketTerms({side:'Long',atr:8,signalClose:1000},1000,1000,{...p,multiplier:999}),/Invalid/);
    assert.throws(()=>multimarketTerms({side:'Long',atr:8,signalClose:1300},1000,1000,p),/Invalid/);
    assert.throws(()=>multimarketTerms({side:'Long',atr:8,signalClose:1000},1000+p.tick/2,1000,p),/Invalid/);
  }
});

test('gold and Dow equity stops use their own multiplier for both sides and gaps',()=>{
  for(const p of products)for(const side of ['Long','Short']){
    const sign=side==='Long'?1:-1, position={side,entry:1000,stop:1000-sign*100,target:1000+sign*100,costDollars:5};
    const threshold=1000-sign*45/p.multiplier;
    const fill=multimarketFill(p,position,{open:1000,high:Math.max(1000,threshold+2*p.tick),low:Math.min(1000,threshold-2*p.tick)},25000,24950,25000,true,true);
    assert.equal(fill.reason,'MLL');
    assert.ok(Math.abs(fill.price/p.tick-Math.round(fill.price/p.tick))<1e-7);
    const equity=25000+sign*(fill.price-1000)*p.multiplier-5;assert.ok(equity<=24950+1e-8);
    const adverseOpen=1000-sign*200;
    assert.equal(multimarketFill(p,position,{open:adverseOpen,high:adverseOpen,low:adverseOpen},25000,24950,25000,true,true).price,adverseOpen);
  }
});

test('ambiguous OHLC bars take the adverse exit; zero-activity runs never imply profit',()=>{
  const p=products[0],position={side:'Long',entry:1000,stop:990,target:1015,costDollars:3.5};
  const fill=multimarketFill(p,position,{open:1000,low:985,high:1020},25000,24000,25000,true,true);
  assert.equal(fill.price,990);assert.equal(fill.ambiguous,true);
  const run=simulateMultimarket([],new Map(),scenarios[0],p,{start:'2026-01-01',end:'2026-03-01'});
  assert.equal(run.net,0);assert.equal(run.status,'incomplete');assert.equal(run.trades.length,0);
});

test('the generic MNQ engine reproduces the frozen reference at both costs',()=>{
  const time=Date.parse('2026-01-05T14:30:00Z')/1000,day='2026-01-05';
  const candles=Array.from({length:78},(_,i)=>({time:time+i*300,day,minute:570+i*5,closeMinute:960,ticker:'MNQH6',open:1000,high:i===2?1015:1000.25,low:999.75,close:1000,volume:10}));
  const signals=new Map([[time+300,{day,side:'Long',atr:8,signalOpen:time,signalClose:time+300,trendClosedAt:time}]]);
  for(const cost of [1,2])for(const account of [true,false])assert.deepEqual(simulateMultimarket(candles,signals,scenarios[0],products[0],{start:day,end:'2026-01-06'},cost,account),simulateAblation(candles,signals,JEU17_SCENARIOS.find(s=>s.id==='atrNet5'),{start:day,end:'2026-01-06'},cost,account));
  const future=new Map([[time+300,{...signals.get(time+300),trendClosedAt:time+600}]]);
  assert.throws(()=>simulateMultimarket(candles,future,scenarios[0],products[0],{start:day,end:'2026-01-06'}),/Noncausal/);
  assert.throws(()=>multimarketSignals(candles,'unregistered'),/Unknown/);
});

test('market schedules fail closed for wrong products, venues and intraday interruptions',()=>{
  const p=products.find(p=>p.symbol==='MGC'),date='2026-01-05';
  const event=(kind,time)=>({product_code:'MGC',trading_venue:'XCEC',session_end_date:date,event:kind,timestamp:time});
  const good=[event('open','2026-01-04T23:00:00Z'),event('close','2026-01-05T22:00:00Z')];
  assert.equal(scheduleCovers(good,p,date,960),true);
  assert.equal(scheduleCovers([],p,date,960),false);
  assert.equal(scheduleCovers([...good,event('halt','2026-01-05T16:00:00Z')],p,date,960),false);
  assert.throws(()=>scheduleCovers(good.map(e=>({...e,product_code:'MNQ'})),p,date,960),/Invalid/);
  assert.throws(()=>scheduleCovers(good.map(e=>({...e,trading_venue:'XCME'})),p,date,960),/Invalid/);
  assert.throws(()=>inspectMultimarket({symbol:'MGC',segments:[],scheduleEvents:[]},p),/Invalid/);
});
