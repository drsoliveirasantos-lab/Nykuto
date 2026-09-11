import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareJournal,monthlyPerformance,monthInfo,shiftMonth,journalMode,validTimestamp} from '../trading/performance/performance-core.mjs';
const entry=(id,r,extra={})=>({id,r,createdAt:`2026-01-${String(Number(id)+1).padStart(2,'0')}T12:00:00Z`,asset:'MNQ',side:'Long',...extra});
test('monthly metrics follow chronological closed results and match calendar totals',()=>{
  const rows=[2,-1,-2,3,0,-1].map((r,i)=>entry(String(i),r,{mode:i<2?'manual':'paper'}));
  const q=prepareJournal(rows.slice().reverse(),'UTC'),m=monthlyPerformance(q,'2026-01');
  assert.equal(m.count,6);assert.equal(m.total,1);assert.equal(m.wins,2);assert.equal(m.flat,1);assert.equal(m.losing,3);assert.equal(m.ratio,1.25);assert.equal(m.drawdown,3);assert.equal(m.average,1/6);assert.equal(m.maxLosingStreak,2);assert.ok(Math.abs(m.winRate-100/3)<1e-10);
  assert.equal(m.days.reduce((n,d)=>n+d.total,0),m.total);assert.equal(m.days.at(-1).cumulative,m.total);
  const manual=monthlyPerformance(q,'2026-01','manual');assert.equal(manual.count,2);assert.equal(manual.total,1);assert.equal(manual.drawdown,1);
  assert.equal(monthlyPerformance(q,'2026-02').count,0);
});
test('calendar attribution uses closing timezone, preserves legacy dates, and separates modes without guessing',()=>{
  const trades=[entry('0',2,{closedAt:'2026-09-01T01:00:00Z',mode:'replay'}),entry('1',-1,{discipline:{mode:'manual'}}),entry('2',1,{setup:'Replay'})];
  const ny=prepareJournal(trades,'America/New_York');
  assert.equal(monthlyPerformance(ny,'2026-08','replay').count,1);assert.equal(monthlyPerformance(ny,'2026-09').count,0);
  assert.equal(monthlyPerformance(prepareJournal(trades,'Europe/Paris'),'2026-09').count,1);
  assert.equal(monthlyPerformance(ny,'2026-01','manual').count,1);assert.equal(monthlyPerformance(ny,'2026-01').legacyDates,2);assert.equal(monthlyPerformance(ny,'2026-01').unknownModes,1);
  assert.equal(journalMode({mode:'paper',discipline:{mode:'manual'}}),'paper');
  assert.equal(journalMode({setup:'Replay'}),'unknown');
});
test('bad entries are disclosed and cannot become zero-result trades or silently use another date',()=>{
  const good=entry('0',0);
  const q=prepareJournal([good,{...good},entry('1',null),entry('2','1'),entry('3',Infinity),entry('4',1,{closedAt:null}),entry('5',1,{closedAt:'2026-02-30T12:00:00Z'})],'UTC');
  assert.equal(q.excluded,6);assert.equal(q.rows.length,1);
  const m=monthlyPerformance(q,'2026-01');assert.equal(m.flat,1);assert.equal(m.winRate,0);assert.equal(m.ratio,null);
  assert.equal(monthlyPerformance(prepareJournal([entry('0',2)],'UTC'),'2026-01').ratio,null);
  assert.throws(()=>prepareJournal([], 'Invalid/Timezone'));assert.throws(()=>prepareJournal(null,'UTC'));
  assert.equal(validTimestamp('2026-01-01T12:00:00'),false);
});
test('calendar handles leap years and boundaries, and prior months cannot alter this month drawdown',()=>{
  assert.equal(monthInfo('2024-02').days,29);assert.equal(monthInfo('2024-02').offset,3);assert.equal(monthInfo('2025-02').days,28);assert.equal(shiftMonth('2026-12',1),'2027-01');
  for(const bad of ['', '2026-13','2026-2','1899-12'])assert.throws(()=>monthInfo(bad));
  assert.throws(()=>shiftMonth('1900-01',-1));
  const q=prepareJournal([entry('0',100,{createdAt:'2025-12-31T12:00:00Z'}),entry('1',-1),entry('2',0),entry('3',-2)],'UTC');
  const m=monthlyPerformance(q,'2026-01');assert.equal(m.total,-3);assert.equal(m.drawdown,3);assert.equal(m.maxLosingStreak,1);
});
