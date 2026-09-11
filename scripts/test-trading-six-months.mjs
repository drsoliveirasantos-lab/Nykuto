import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { inspectSixMonths, runSixMonths } from '../trading/lab/mnq-six-months.mjs';
import { SIX_MONTHS_DAYS as days, SIX_MONTHS_SEGMENTS as segments, SIX_MONTHS_WINDOWS as windows } from '../trading/lab/mnq-six-months-policy.mjs';
import { readSixMonths, loadSixMonths } from '../trading/lab/six-months-source.mjs';
function fixture() {
  const calendar = days.map(date => ({ date, open:`${date}T09:30:00`, close:`${date}T${date==='2025-12-24'?'13':'16'}:00:00` }));
  const utc = date => Date.parse(`${date}T09:30:00${date<'2026-03-08'?'-05:00':'-04:00'}`)/1000;
  const sources = segments.map(s => ({ ticker:s.ticker,expiry:s.expiry,paginationComplete:true,bars:days.filter(d=>d>=s.prep&&d<s.end).flatMap(d=>Array.from({length:d==='2025-12-24'?14:26},(_,i)=>[utc(d)+900*i,100,101,99,100,10])) }));
  const scheduleEvents=calendar.flatMap(s=>[{event:'open',timestamp:new Date((utc(s.date)-15*3600)*1000).toISOString()},{event:'close',timestamp:new Date((utc(s.date)+(s.date==='2025-12-24'?4.5:7.5)*3600)*1000).toISOString()}].map(e=>({...e,product_code:'MNQ',trading_venue:'XCME',session_end_date:s.date})));
  return {schema:'jeu09-data-v1',protocol:'jeu09-v2',calendar,segments:sources,scheduleEvents};
}
test('six nonconsecutive months preserve separate preparation, Christmas close and declared calendar',()=>{
  const b=fixture(),q=inspectSixMonths(b);assert.equal(q.ready,true);assert.equal(q.sessions,123);assert.equal(q.bars,4746);assert.deepEqual(q.groups.map(g=>g.quality.warmup),[560,442,546]);
  assert.deepEqual(q.groups.map(g=>g.quality.scoredSessions),[39,41,43]);
  assert.equal(days.includes('2026-03-06'),false);assert.equal(days.includes('2026-07-03'),false);
  assert.equal(windows.length,3);const r=runSixMonths(b);assert.equal(r.calculated,true);assert.equal(r.policy.independent,false);assert.equal(r.paperEnabled,false);assert.equal(r.normal.count,0);assert.equal(r.status,'Non confirmé');
});
test('missing bars, schedule breaks, incomplete pagination or altered contracts cannot produce a score',()=>{
  let b=fixture();b.segments[1].bars.splice(470,1);let r=runSixMonths(b);assert.equal(r.calculated,false);assert.equal(r.normal,null);
  b=fixture();b.scheduleEvents.push({product_code:'MNQ',trading_venue:'XCME',session_end_date:'2026-04-01',event:'halt',timestamp:'2026-04-01T15:00:00Z'});assert.equal(runSixMonths(b).calculated,false);
  b=fixture();b.segments[2].paginationComplete=false;assert.throws(()=>runSixMonths(b),/pagination/);
  b=fixture();b.segments[0].ticker='NQH6';assert.throws(()=>runSixMonths(b),/Contrat/);
  b=fixture();b.calendar[0].close='2025-12-01T15:00:00';assert.throws(()=>runSixMonths(b),/invalide/);
  b=fixture();b.segments[0].bars.push(b.segments[0].bars[0]);assert.throws(()=>runSixMonths(b),/horodatage/);
});
test('verified snapshot reader rejects changed bytes, login HTML, errors and incorrect bar counts',async()=>{
  const b=fixture(),text=JSON.stringify(b),expected={sha256:createHash('sha256').update(text).digest('hex'),bytes:Buffer.byteLength(text),bars:4746,calendar:183};
  assert.equal((await readSixMonths(text,expected)).protocol,'jeu09-v2');
  await assert.rejects(readSixMonths(text+' ',expected),/Taille/);
  await assert.rejects(readSixMonths(text.replace('MNQH6','NQHH6'),expected),/ne correspond/);
  await assert.rejects(readSixMonths(text,{...expected,bars:4745}),/incomplet/);
  await assert.rejects(loadSixMonths(async()=>new Response('<html>Login</html>',{headers:{'Content-Type':'text/html'}})),/indisponibles/);
  await assert.rejects(loadSixMonths(async()=>new Response('',{status:403})),/indisponibles/);
});
