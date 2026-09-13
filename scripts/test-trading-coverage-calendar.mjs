import test from 'node:test';
import assert from 'node:assert/strict';
import { describeDay } from '../trading/historique/coverage.mjs';

test('a repaired day is no longer marked missing merely because of its date', () => {
  const dataset={id:'m1',daily:{'2026-06-18':{count:1380,volumeCount:1380}}};
  assert.equal(describeDay(dataset,'2026-06-18',{coverage:{knownGaps:[]}}).missingMinutes,0);
});
test('calendar distinguishes data gaps, scheduled closures, and missing volume', () => {
  const start=Date.parse('2026-06-18T23:50:00Z')/1000;
  const manifest={coverage:{knownGaps:[
    {dataset:'m1',from:start,to:start+1800,classification:'missing_data',reason:'Observation absente'},
    {dataset:'m1',from:start-3600,to:start-3000,classification:'scheduled_closed',reason:'Fermeture prévue'},
    {dataset:'m5',from:start,to:start+3600,classification:'missing_data'},
  ]}};
  const dataset={id:'m1',daily:{'2026-06-18':{count:1380,volumeCount:1000}}};
  const first=describeDay(dataset,'2026-06-18',manifest);
  assert.equal(first.missingMinutes,10);
  assert.equal(first.incompleteVolume,true);
  assert.equal(describeDay(dataset,'2026-06-19',manifest).missingMinutes,20);
  assert.equal(first.notes.length,2);
});
