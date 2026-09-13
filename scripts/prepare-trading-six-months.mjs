// Converts private connector CSV captures. Input/output paths must remain outside Git.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { SIX_MONTHS_DAYS as days, SIX_MONTHS_SEGMENTS as definitions, SIX_MONTHS_POLICY as policy } from '../trading/lab/mnq-six-months-policy.mjs';
import { sessionFor } from '../trading/lab/session-comparison.mjs';
import { inspectSixMonths, runSixMonths } from '../trading/lab/mnq-six-months.mjs';
const dir = process.argv[2]; if (!dir) throw new Error('Private capture directory required');
const hash = text => createHash('sha256').update(text).digest('hex');
function csv(text) {
  const lines = text.trim().split(/\r?\n/), headers = lines.shift().split(',');
  return lines.map(line => { const values = line.split(','); if (values.length !== headers.length) throw new Error('Truncated or invalid CSV'); return Object.fromEntries(headers.map((h,i) => [h,values[i]])); });
}
const calendar = days.map(date => ({ date, open: `${date}T09:30:00`, close: `${date}T${policy.earlyCloses[date] === 780 ? '13' : '16'}:00:00` }));
const scheduleText = await readFile(resolve(dir,'schedules-v2.csv'),'utf8'), events = csv(scheduleText).filter(event => days.includes(event.session_end_date));
const segments = [];
for (const definition of definitions) {
  const text = await readFile(resolve(dir, definition.ticker.toLowerCase()+(definition.ticker === 'MNQU6' ? '-v2' : '')+'.csv'),'utf8'), rows = csv(text), bars = [];
  for (const row of rows) {
    const values = ['time','open','high','low','close','volume'].map(key => row[key] === '' ? NaN : Number(row[key]));
    if (!values.every(Number.isFinite)) throw new Error('Invalid numeric CSV value');
    const local = sessionFor(values[0]);
    if (!days.includes(local.day) || local.day < definition.prep || local.day >= definition.end || local.minute < 570 || local.minute >= (policy.earlyCloses[local.day] || 960)) continue;
    bars.push(values);
  }
  segments.push({ ticker: definition.ticker, expiry: definition.expiry, paginationComplete: true, rawCsvSha256: hash(text), bars });
}
const bundle = { schema:'jeu09-data-v1', protocol:policy.version, capturedAt:new Date().toISOString(), source:'Massive futures aggregates 15min and MNQ/XCME schedules; NYSE calendar', scheduleCsvSha256:hash(scheduleText), calendar, segments, scheduleEvents:events };
const quality=inspectSixMonths(bundle); console.log(JSON.stringify({ready:quality.ready,sessions:quality.sessions,bars:quality.bars,groups:quality.groups.map(g=>({ticker:g.ticker,...g.quality}))}));
const text=JSON.stringify(bundle);await writeFile(resolve(dir,'dataset.json'),text);
await writeFile(resolve(dir,'metadata.json'),JSON.stringify({sha256:hash(text),bytes:Buffer.byteLength(text),bars:quality.bars,sessions:quality.sessions,calendar:calendar.length}));
const result=runSixMonths(bundle);await writeFile(resolve(dir,'result.json'),JSON.stringify(result));
console.log(JSON.stringify({status:result.status,normal:result.normal,stress:result.stress,windows:result.windows.map(w=>({label:w.label,normal:w.normal,stress:w.stress})),checks:result.checks}));
