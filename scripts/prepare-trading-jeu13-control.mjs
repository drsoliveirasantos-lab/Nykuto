import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { sessionFor } from '../trading/lab/session-comparison.mjs';
import { inspectFiveGroup } from '../trading/lab/jeu12-engine.mjs';
import { JEU13_CONTROL_DAYS as days, JEU13_CONTROL_SEGMENTS as definitions } from '../trading/lab/jeu13-control-policy.mjs';
const dir = process.argv[2], root = fileURLToPath(new URL('../', import.meta.url));
if (!dir || !relative(root, resolve(dir)).startsWith('../')) throw new Error('Private directory required.');
const hash = text => createHash('sha256').update(text).digest('hex');
function parse(text) {
  if (/truncated|Next page|Preview|Stored /.test(text)) throw new Error('Incomplete capture.');
  const lines = text.trim().split(/\r?\n/), headers = lines.shift().split(',');
  return lines.map(line => { const values = line.split(','); if (values.length !== headers.length) throw new Error('Invalid CSV'); return Object.fromEntries(headers.map((h, i) => [h, values[i]])); });
}
const scheduleText = await readFile(resolve(dir, 'schedules.csv'), 'utf8');
const scheduleEvents = parse(scheduleText).filter(e => days.includes(e.session_end_date));
const calendar = days.map(date => ({ date, open: `${date}T09:30:00`, close: `${date}T16:00:00` }));
const segments = [], quality = [];
for (const d of definitions) {
  const csv = await readFile(resolve(dir, d.ticker + '.csv'), 'utf8');
  const bars = parse(csv).flatMap(row => {
    if (row.ticker !== d.ticker) throw new Error('Wrong ticker.');
    const values = ['time', 'open', 'high', 'low', 'close', 'volume'].map(k => row[k] === '' ? NaN : Number(row[k]));
    if (!values.every(Number.isFinite)) throw new Error('Invalid prices.');
    const local = sessionFor(values[0]);
    return days.includes(local.day) && local.day >= d.prep && local.day < d.end && local.minute >= 570 && local.minute < 960 ? [values] : [];
  });
  const segment = { ticker: d.ticker, expiry: d.expiry, paginationComplete: true, csvSha256: hash(csv), bars };
  const selectedDays = days.filter(day => day >= d.prep && day < d.end);
  const g = inspectFiveGroup(segment, d, calendar.filter(c => selectedDays.includes(c.date)), scheduleEvents.filter(e => selectedDays.includes(e.session_end_date)));
  segments.push(segment); quality.push({ ticker: d.ticker, ...g.quality });
}
const bundle = { schema: 'jeu13-control-v1', capturedAt: new Date().toISOString(), amendment: 'JEU13_AVAILABILITY.md', scheduleSha256: hash(scheduleText), calendar, scheduleEvents, segments };
const text = JSON.stringify(bundle), metadata = { sha256: hash(text), bytes: Buffer.byteLength(text), quality };
await writeFile(resolve(dir, 'dataset.json'), text); await writeFile(resolve(dir, 'metadata.json'), JSON.stringify(metadata, null, 2));
console.log(JSON.stringify(metadata));
