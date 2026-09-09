import test from 'node:test';
import assert from 'node:assert/strict';
import { engulfing, confluenceFeatures, signalChecks, confluenceMetrics } from '../trading/lab/confluence-engine.mjs';
import { CONFLUENCE_VARIANTS, CONFLUENCE_EVENTS } from '../trading/lab/confluence-policy.mjs';
import { simulateMarket } from '../trading/lab/market-comparison.mjs';
import { inspectJeu11, runJeu11 } from '../trading/lab/jeu11-engine.mjs';
import { JEU11_POLICY, JEU11_DAYS, JEU11_EVENTS } from '../trading/lab/jeu11-policy.mjs';

test('engulfing uses opposite nonzero bodies within one contiguous session', () => {
  const p={day:'2026-01-02',time:0,open:102,close:100},c={day:p.day,time:900,open:100,close:103};
  assert.equal(engulfing(p,c),'Long');
  assert.equal(engulfing({...p,open:100,close:102},{...c,open:102,close:99}),'Short');
  for(const bad of [{...c,close:102},{...c,day:'2026-01-03'},{...c,time:1800},{...c,open:101}])assert.equal(engulfing(p,bad),null);
  assert.equal(engulfing({...p,open:100},c),null);
});
function bars() {
  return Array.from({length:11},(_,d)=>Array.from({length:26},(_,i)=>({day:`2026-01-${String(d+5).padStart(2,'0')}`,time:d*86400+i*900,minute:570+i*15,open:100+d,high:102+d,low:99+d,close:101+d+i/100,volume:100+d*10+i}))).flat();
}
test('hourly context never sees unfinished hours, next sessions or future prices', () => {
  const input=bars(),f=confluenceFeatures(input);
  assert.equal(f[2].hourCount,0);assert.equal(f[3].hourCount,1);assert.equal(f[3].hourClosedAt,3600);
  assert.equal(f[25].hourCount,6);assert.equal(f[26].hourCount,6);assert.equal(f[7*26].trend,null);
  assert.equal(f.at(-1).hourCount,66);assert.equal(f.at(-1).trend,'Long');
  for(const cut of [3,4,25,26,27,230,269])assert.deepEqual(confluenceFeatures(input.slice(0,cut)),f.slice(0,cut));
  const changed=structuredClone(input);for(let i=240;i<changed.length;i++){changed[i].close*=20;changed[i].volume*=100;}
  assert.deepEqual(confluenceFeatures(changed).slice(0,240),f.slice(0,240));
});
test('relative volume uses five past sessions at the same slot, excluding current volume', () => {
  const input=bars(),features=confluenceFeatures(input);
  assert.equal(features[4*26].volumeRatio,null);
  assert.equal(features[5*26].volumeRatio,150/120);
  input[5*26].volume=0;const f=confluenceFeatures(input);
  assert.equal(f[5*26].volumeRatio,0);assert.equal(f[5*26+1].volumeRatio,151/121);
  assert.equal(signalChecks(f[5*26],'Long',['volume'])[0].pass,false);
});
test('event and direction gates are explicit and unknown context cannot pass confluence', () => {
  assert.equal(CONFLUENCE_VARIANTS.length,8);assert.equal(CONFLUENCE_EVENTS.length,15);
  assert.ok(CONFLUENCE_EVENTS.some(e=>e.day==='2026-02-11'&&e.type==='Emploi'));
  const f={trend:null,candle:null,volumeRatio:null,events:['FOMC']};
  assert.ok(signalChecks(f,'Long',['trend','candle','volume','events']).every(c=>!c.pass));
  assert.equal(signalChecks(f,'Short',['short'])[0].pass,true);assert.equal(signalChecks(f,'Short',['long'])[0].pass,false);
  assert.equal(confluenceFeatures(bars()).find(x=>x.day==='2026-01-13').events[0],'CPI');
});
test('signal filters resimulate positions and preserve default execution exactly', () => {
  const start=Date.parse('2026-01-02T14:30:00Z')/1000,window={start,end:start+86400,label:'Fixture'};
  const candles=Array.from({length:8},(_,i)=>({time:start+(i-1)*900,day:'2026-01-02',open:100,high:101,low:99,close:100,sessionEnd:i===7}));
  candles[2].low=97;
  const ctx={fast:[0,2,2,0,0,2,2,2],slow:Array(8).fill(1),adx:Array(8).fill(30),atr:Array(8).fill(1.6)};
  const product={symbol:'FIXTURE',tick:.25,multiplier:2,fees:1};
  const base=simulateMarket(candles,ctx,window,product);
  assert.ok(base.length>0);assert.deepEqual(simulateMarket(candles,ctx,window,product,1,'FIXTURE',{acceptSignal:()=>true}),base);
  assert.deepEqual(simulateMarket(candles,ctx,window,product,1,'FIXTURE',{acceptSignal:()=>false}),[]);
  const short=simulateMarket(candles,ctx,window,product,1,'FIXTURE',{acceptSignal:side=>side==='Short'});
  assert.ok(short.length>0);assert.ok(short.every(t=>t.side==='Short'));
  const normal=simulateMarket(candles,ctx,window,product,1,'FIXTURE',{acceptSignal:()=>true});
  const stress=simulateMarket(candles,ctx,window,product,2,'FIXTURE',{acceptSignal:()=>true});
  assert.ok(normal.length>stress.length);
});
test('direction breakdown is descriptive and duration includes losing and same-bar trades', () => {
  const m=confluenceMetrics([{side:'Long',entryTime:0,exitTime:900,resultR:1},{side:'Short',entryTime:0,exitTime:0,resultR:-1}]);
  assert.equal(m.medianMinutes,7.5);assert.equal(m.bySide[0].total,1);assert.equal(m.bySide[1].total,-1);
  assert.equal(confluenceMetrics([]).medianMinutes,null);
});

function jeu11Fixture() {
  const utc = day => Date.parse(`${day}T13:30:00Z`) / 1000;
  return { schema: 'jeu11-data-v1', protocol: JEU11_POLICY.version, ticker: 'MNQM5', expiry: '2025-06-20', paginationComplete: true,
    calendar: JEU11_DAYS.map(date => ({ date, open: `${date}T09:30:00`, close: `${date}T16:00:00` })),
    bars: JEU11_DAYS.flatMap(day => Array.from({ length: 26 }, (_, i) => [utc(day) + i * 900, 100, 101, 99, 100, 20])),
    scheduleEvents: JEU11_DAYS.flatMap(day => [
      { event: 'open', timestamp: `${day}T00:00:00Z` }, { event: 'close', timestamp: `${day}T21:00:00Z` }
    ].map(e => ({ ...e, product_code: 'MNQ', trading_venue: 'XCME', session_end_date: day }))) };
}
test('Jeu 11 preserves 42 scored sessions and 286 warmup bars without granting confirmation', () => {
  const b = jeu11Fixture(), q = inspectJeu11(b);
  assert.equal(q.ready, true); assert.equal(q.quality.scoredSessions, 42); assert.equal(q.quality.warmup, 286);
  assert.equal(q.quality.bars, 1378);
  const r = runJeu11(b);
  assert.equal(r.calculated, true); assert.equal(r.paperEnabled, false); assert.equal(r.variants.length, 8);
  assert.ok(r.variants.every(v => v.normal.count === 0 && !v.checks.find(c => c.id === 'windows').pass));
  assert.equal(JEU11_DAYS.includes('2025-04-18'), false); assert.equal(JEU11_DAYS.includes('2025-05-26'), false);
});
test('Jeu 11 refuses missing candles, interruptions, modified contracts and partial pagination', () => {
  let b = jeu11Fixture(); b.bars.splice(400, 1);
  const missing = runJeu11(b); assert.equal(missing.calculated, false); assert.deepEqual(missing.variants, []);
  b = jeu11Fixture(); b.scheduleEvents.push({ event: 'halt', timestamp: '2025-04-01T15:00:00Z', product_code: 'MNQ', trading_venue: 'XCME', session_end_date: '2025-04-01' });
  assert.equal(runJeu11(b).calculated, false);
  for (const change of [{ ticker: 'NQM5' }, { expiry: '2025-06-19' }, { paginationComplete: false }, { schema: 'jeu09-data-v1' }]) assert.throws(() => inspectJeu11({ ...jeu11Fixture(), ...change }), /invalide/);
  b = jeu11Fixture(); b.calendar[0].close = '2025-03-17T15:00:00'; assert.throws(() => inspectJeu11(b), /invalide/);
  b = jeu11Fixture(); b.bars[0][1] = 100.1; assert.throws(() => inspectJeu11(b), /Prix/);
});
test('Jeu 11 event filters use 2025 releases rather than the 2026 calendar', () => {
  const candles = inspectJeu11(jeu11Fixture()).candles;
  const features = confluenceFeatures(candles, JEU11_EVENTS);
  assert.deepEqual(features.find(f => f.day === '2025-04-04').events, ['NFP']);
  assert.deepEqual(features.find(f => f.day === '2025-04-10').events, ['CPI']);
  assert.deepEqual(features.find(f => f.day === '2025-05-07').events, ['FOMC']);
  assert.deepEqual(features.find(f => f.day === '2025-05-08').events, []);
  assert.equal(signalChecks(features.find(f => f.day === '2025-04-04'), 'Long', ['events'])[0].pass, false);
});
