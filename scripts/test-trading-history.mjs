import test from 'node:test';
import assert from 'node:assert/strict';
import { JEU14_SEGMENTS,historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { inspectHistory } from '../trading/lab/jeu14-history.mjs';
function fixture(){
 const schedules=historyCalendar().flatMap(s=>[{product_code:'MNQ',trading_venue:'XCME',session_end_date:s.date,event:'open',timestamp:s.date+'T00:00:00Z'},{product_code:'MNQ',trading_venue:'XCME',session_end_date:s.date,event:'close',timestamp:s.date+'T23:00:00Z'}]);
 const segments=JEU14_SEGMENTS.map(d=>({ticker:d.ticker,expiry:d.expiry,paginationComplete:true,bars:historyCalendar(d.prep,d.end).flatMap(s=>{
  const summer=s.date<'2025-11-02'||s.date>='2026-03-08',start=Date.parse(s.date+(summer?'T13:30:00Z':'T14:30:00Z'))/1000,count=s.close.includes('13:00')?42:78;
  return Array.from({length:count},(_,i)=>[start+i*300,20000,20001,19999,20000.5,100]);
 })}));
 return {schema:'jeu14-data-v1',protocol:'jeu14-v1',scheduleEvents:schedules,segments};
}
test('complete historical coverage preserves cash holidays, early closes and disjoint contract dates',()=>{
 const r=inspectHistory(fixture());assert.equal(r.expectedSessions,372);assert.equal(r.eligible.length,355);assert.equal(r.eligible[0].date,'2025-04-09');assert.equal(r.unavailable.length,17);
 assert.ok(!historyCalendar().some(s=>['2025-07-04','2026-07-03'].includes(s.date)));assert.equal(historyCalendar().find(s=>s.date==='2025-11-28').close,'2025-11-28T13:00:00');
 assert.equal(new Set(r.eligible.map(s=>s.date)).size,r.eligible.length);assert.equal(r.groups.length,6);
});
test('a missing scored candle forces full re-preparation; a different contract warmup never removes the active contract day',()=>{
 const missing=fixture(),raw=missing.segments[1],time=Date.parse('2025-08-01T13:30:00Z')/1000;raw.bars=raw.bars.filter(b=>b[0]!==time);
 const r=inspectHistory(missing);assert.equal(r.eligible.length,355-18);assert.ok(r.unavailable.some(s=>s.date==='2025-08-01'&&s.reason==='missing-data'));assert.ok(!r.eligible.some(s=>s.date>='2025-08-01'&&s.date<'2025-08-27'));assert.ok(r.eligible.some(s=>s.date==='2025-08-27'));
 const prep=fixture();prep.segments[2].bars=prep.segments[2].bars.filter(b=>b[0]!==Date.parse('2025-08-25T13:30:00Z')/1000);
 const q=inspectHistory(prep);assert.ok(q.eligible.some(s=>s.date==='2025-08-25'&&s.ticker==='MNQU5'));assert.deepEqual(q.unavailable.filter(s=>s.ticker==='MNQZ5').map(s=>s.date),['2025-09-15','2025-09-16','2025-09-17','2025-09-18']);
 const duplicate=fixture();duplicate.segments[0].bars.push(duplicate.segments[0].bars[0]);assert.throws(()=>inspectHistory(duplicate),/Invalid history price/);
});
