// Licensed prices and captures must stay outside the Git repository.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { sessionFor } from '../trading/lab/session-comparison.mjs';
import { JEU11_POLICY as p, JEU11_DAYS as days } from '../trading/lab/jeu11-policy.mjs';
import { inspectJeu11 } from '../trading/lab/jeu11-engine.mjs';
const dir = process.argv[2];
const root = fileURLToPath(new URL('../', import.meta.url));
const outside = dir ? relative(root, resolve(dir)) : '';
if (!dir || !(outside === '..' || outside.startsWith('../'))) throw new Error('Provide a private capture directory outside Git.');
const hash = text => createHash('sha256').update(text).digest('hex');
function csv(text) {
  if (/Next page|Preview|Stored /.test(text)) throw new Error('Incomplete connector capture.');
  const lines = text.trim().split(/\r?\n/), headers = lines.shift().split(',');
  return lines.map(line => { const values = line.split(','); if (values.length !== headers.length) throw new Error('Invalid CSV'); return Object.fromEntries(headers.map((h, i) => [h, values[i]])); });
}
const priceText = await readFile(resolve(dir, 'prices.csv'), 'utf8'), scheduleText = await readFile(resolve(dir, 'schedules.csv'), 'utf8'), contractText = await readFile(resolve(dir, 'contract.csv'), 'utf8');
const contracts = csv(contractText);
if (contracts.length !== 1 || contracts[0].ticker !== p.ticker || contracts[0].last_trade_date !== p.expiry || contracts[0].trade_tick_size !== '0.25' || contracts[0].trading_venue !== 'XCME') throw new Error('Unexpected contract reference.');
const seen = new Set(), bars = [];
for (const row of csv(priceText)) {
  if (row.ticker !== p.ticker || !/^\d+$/.test(row.window_start)) throw new Error('Unexpected ticker or timestamp.');
  const ns = BigInt(row.window_start); if (ns % 1000000000n) throw new Error('Unaligned timestamp.');
  const time = Number(ns / 1000000000n);
  const values = [time, ...['open', 'high', 'low', 'close', 'volume'].map(k => row[k] === '' ? NaN : Number(row[k]))];
  if (!values.every(Number.isFinite) || seen.has(time)) throw new Error('Invalid or duplicated price.');
  seen.add(time);
  const local = sessionFor(time);
  if (days.includes(local.day) && local.minute >= 570 && local.minute < 960) bars.push(values);
}
const bundle = { schema: 'jeu11-data-v1', protocol: p.version, ticker: p.ticker, expiry: p.expiry, capturedAt: new Date().toISOString(), paginationComplete: true,
  rawPriceSha256: hash(priceText), scheduleSha256: hash(scheduleText), contractSha256: hash(contractText),
  calendar: days.map(date => ({ date, open: `${date}T09:30:00`, close: `${date}T16:00:00` })), bars,
  scheduleEvents: csv(scheduleText).filter(e => days.includes(e.session_end_date)) };
const { quality, ready } = inspectJeu11(bundle), text = JSON.stringify(bundle);
await writeFile(resolve(dir, 'dataset.json'), text);
await writeFile(resolve(dir, 'metadata.json'), JSON.stringify({ sha256: hash(text), bytes: Buffer.byteLength(text), ready, quality }, null, 2));
console.log(JSON.stringify({ ready, quality, sha256: hash(text), bytes: Buffer.byteLength(text) }));
if (!ready) process.exitCode = 2;
