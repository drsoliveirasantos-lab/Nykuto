import test from 'node:test';
import assert from 'node:assert/strict';
import { admissionSignals } from '../trading/lab/jeu23-signals.mjs';
import { simulateAdmission } from '../trading/lab/jeu23-engine.mjs';
import { simulateBreakEven } from '../trading/lab/jeu28-engine.mjs';
import { closedBreakEven } from '../trading/lab/jeu28-protection.mjs';
import { compareProtection } from '../trading/lab/jeu28-comparison.mjs';
import { JEU28_PRODUCTS, JEU28_SCENARIOS } from '../trading/lab/jeu28-policy.mjs';
import { JEU23_SCENARIOS } from '../trading/lab/jeu23-policy.mjs';
const product = JEU28_PRODUCTS[0], scenario = JEU28_SCENARIOS[0];
const period = { start: '2026-01-02', end: '2026-01-04' };
const baseline = JEU23_SCENARIOS.find(s => s.riskPerTrade === 150);
function fixture() {
  const time = Date.parse('2026-01-02T14:30:00Z') / 1000;
  const bars = Array.from({ length: 78 }, (_, i) => ({ time: time + i * 300,
    day: '2026-01-02', minute: 570 + i * 5, closeMinute: 960, ticker: 'MNQH6',
    open: 110, high: 120, low: 100, close: 110, volume: 100 }));
  Object.assign(bars[6], { open: 118, high: 131, low: 117, close: 130 });
  Object.assign(bars[7], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[8], { open: 131, high: 160, low: 130, close: 155 });
  Object.assign(bars[9], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[10], { open: 131, high: 134, low: 130, close: 133 });
  Object.assign(bars[11], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[12], { open: 131, high: 160, low: 130, close: 155 });
  Object.assign(bars[13], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[14], { open: 131, high: 134, low: 130, close: 133 });
  Object.assign(bars[15], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[16], { open: 131, high: 160, low: 130, close: 155 });
  return bars;
}

const run = (bars, signals, factor = 1, p = product, account = false) => simulateBreakEven(bars, signals, scenario, p, period, factor, account);
function prepared(p = product, factor = 1, mirror = false) {
  const scale = { MNQ: 3, MES: 1, MYM: 10, MGC: 0.5 }[p.symbol];
  const bars = fixture().map(b => ({...b, open:b.open*scale, high:b.high*scale, low:b.low*scale, close:b.close*scale})).map(b => mirror ? {...b,open:220*scale-b.open,high:220*scale-b.low,low:220*scale-b.high,close:220*scale-b.close} : b);
  const signals = new Map([[bars[8].time, admissionSignals(bars, p).get(bars[8].time)]]);
  const original = simulateAdmission(bars, signals, baseline, p, period, factor, false).trades[0];
  assert.ok(original, p.symbol);
  const sign = mirror ? -1 : 1, entry = bars[8].open;
  const favorable = entry + sign * (original.risk + p.tick);
  Object.assign(bars[8], {open:entry,high:Math.max(entry,favorable)+p.tick,low:Math.min(entry,favorable)-p.tick,close:favorable});
  const nextStop = closedBreakEven({...original,stop:original.stop,breakEvenAt:null},bars[8],p).stop;
  const nextOpen = nextStop + sign * p.tick;
  Object.assign(bars[9],{open:nextOpen,high:Math.max(nextOpen,nextStop),low:Math.min(nextOpen,nextStop),close:nextStop});
  return {bars,signals,original,nextStop};
}

test('protection starts on the next bar, never retroactively against the arming bar low', () => {
  const {bars,signals,original,nextStop}=prepared();const t=run(bars,signals).trades[0];
  assert.ok(bars[8].low<nextStop&&bars[8].low>original.stop);
  assert.equal(t.exitTime,bars[9].time);assert.equal(t.breakEvenAt,bars[9].time);
  assert.equal(t.reason,'Break-even stop');assert.equal(t.exit,nextStop);
  assert.equal(t.netDollars,0);assert.equal(t.riskDollars,original.riskDollars);assert.equal(t.initialStop,original.stop);
});

test('a wick reaching +1R cannot arm protection without the completed close', () => {
  const {bars,signals,original}=prepared();bars[8].close=original.entry;
  const t=run(bars,signals).trades[0];assert.equal(t.breakEvenAt,null);assert.equal(t.stop,original.stop);
  const a=simulateAdmission(bars,signals,baseline,product,period,1,false);assert.equal(compareProtection(a,run(bars,signals)).deltaNet,0);
});

test('the exact +1R close arms while one tick below does not; a pre-existing stop or target fills first', () => {
  const {bars,signals,original}=prepared();
  for(const [offset,armed] of [[0,true],[-product.tick,false]]) {
    const b=bars.map(x=>({...x}));b[8].close=original.entry+original.risk+offset;
    assert.equal(run(b,signals).trades[0].breakEvenAt!==null,armed);
  }
  const adverse=bars.map(x=>({...x}));adverse[8].low=original.stop;adverse[8].high=original.target;
  const t=run(adverse,signals).trades[0];assert.equal(t.reason,'Stop');assert.equal(t.ambiguous,true);assert.equal(t.breakEvenAt,null);
  const target=bars.map(x=>({...x}));target[8].high=original.target;
  const win=run(target,signals).trades[0];assert.equal(win.reason,'Target');assert.equal(win.breakEvenAt,null);
});

test('fee-covered protection respects all tick grids, both directions and both costs', () => {
  for(const p of JEU28_PRODUCTS)for(const factor of [1,2])for(const mirror of [false,true]) {
    const {bars,signals,original,nextStop}=prepared(p,factor,mirror);const t=run(bars,signals,factor,p).trades[0];
    assert.equal(t.reason,'Break-even stop',p.symbol);assert.equal(t.exit,nextStop);
    assert.ok(t.netDollars>=0&&t.netDollars<p.tick*p.multiplier+1e-8);
    assert.ok(Math.abs(t.stop/p.tick-Math.round(t.stop/p.tick))<1e-7);
    assert.equal(t.riskDollars,original.riskDollars);assert.equal(t.target,original.target);
  }
});

test('an adverse gap after arming can still lose money and never receives the unreachable stop price', () => {
  const {bars,signals,original}=prepared();Object.assign(bars[9],{open:original.entry-1,high:original.entry,low:original.entry-2,close:original.entry-1});
  const t=run(bars,signals).trades[0];assert.equal(t.reason,'Break-even gap');assert.equal(t.exit,bars[9].open);assert.ok(t.netDollars<0);
});

test('protection is one-way and never rearms, loosens, changes targets or changes risk caps', () => {
  const {bars,signals,original}=prepared();const armed=closedBreakEven({...original,breakEvenAt:null},bars[8],product);
  assert.equal(closedBreakEven({...original,...armed},bars[9],product),null);
  for(const field of ['riskPerTrade','dailyLoss'])assert.throws(()=>simulateBreakEven(bars,signals,{...scenario,[field]:1000},product,period),/Invalid risk profile/);
  assert.throws(()=>run(bars,signals,3),/Invalid simulation policy/);
});

test('future extremes cannot change prior protection exits and account prefixes reset side use every day', () => {
  const {bars,signals}=prepared();const value=run(bars,signals,1,product,true);
  const future=bars.map((b,i)=>i<=9?b:{...b,high:b.high+100,low:1});
  assert.deepEqual(run(future,signals,1,product,true).trades,value.trades);
  const second=bars.map(b=>({...b,time:b.time+86400,day:'2026-01-03'}));
  const nextSignals=new Map([...signals,...[...signals].map(([time,s])=>[time+86400,{...s,day:'2026-01-03',signalOpen:s.signalOpen+86400,signalClose:s.signalClose+86400,rangeClosedAt:s.rangeClosedAt+86400,breakoutAt:s.breakoutAt+86400}])]);
  const all=run([...bars,...second],nextSignals,1,product,true);
  assert.equal(all.trades.length,2);assert.deepEqual(all.trades.slice(0,1),value.trades);assert.deepEqual(all.days.slice(0,1),value.days);
  const many=run(bars,admissionSignals(bars,product));assert.ok(many.trades.filter(t=>t.side==='Long').length<=1);
});

test('matched-entry comparison separates avoided losses, cut gains and changed entry availability', () => {
  const common={ticker:'MNQH6',side:'Long',day:'2026-01-02',entry:100,riskDollars:10,costDollars:3.5,target:110,exitTime:1,exit:90,reason:'Stop'};
  const before={net:7,trades:[{...common,entryTime:1,netDollars:-10},{...common,entryTime:2,netDollars:20},{...common,entryTime:3,netDollars:-3}]};
  const after={net:4,trades:[{...common,entryTime:1,netDollars:0,exit:100,reason:'Break-even stop'},{...common,entryTime:2,netDollars:0,exit:100,reason:'Break-even stop'},{...common,entryTime:4,netDollars:4}]};
  const c=compareProtection(before,after);assert.equal(c.sharedEntries,2);assert.equal(c.improved,1);assert.equal(c.worsened,1);assert.equal(c.improvedDollars,10);assert.equal(c.worsenedDollars,-20);assert.equal(c.addedEntries,1);assert.equal(c.removedEntries,1);assert.equal(c.deltaNet,-3);
});
