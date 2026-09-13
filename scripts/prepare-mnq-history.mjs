#!/usr/bin/env node
// Reproducible private packaging; no OHLCV is written into the Git repository.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';
const [inputDir, outputDir] = process.argv.slice(2);
if (!inputDir || !outputDir) throw new Error('Usage: prepare-mnq-history.mjs <audited-input-directory> <private-output-directory>');
const output = path.resolve(outputDir);
const repo = path.resolve(new URL('..', import.meta.url).pathname);
if (output === repo || output.startsWith(repo + '/')) throw new Error('Private output must remain outside the repository');
fs.mkdirSync(output, { recursive: true });
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const date = t => new Date(t * 1000).toISOString().slice(0, 10);
const prefix = 'mnq-history/2026-09-13-v1';
const preparation = JSON.parse(fs.readFileSync(path.join(inputDir, 'preparation_report_intermediate.json')));
const specs = [
  ['m1', 1, '1m.json', 'Export M1'],
  ['m5', 5, '5m_corrected_intermediate.json', 'Export M5 ; trois bougies reconstituées depuis M1'],
  ['m15', 15, '15m_extended_intermediate.json', '20 300 M15 natifs + 27 137 agrégés depuis M5'],
  ['h1', 60, '60m.json', 'Export H1'],
];
const manifest = { schema: 'nykuto-mnq-history-v1', id: '2026-09-13-v1', createdAt: '2026-09-13', symbol: 'CME_MINI_MNQ1!', timestamp: 'UTC candle open, Unix seconds', columns: ['time','open','high','low','close','volume'], calendarMeaning: 'Observed data coverage, not an independently certified exchange schedule. Absence is not zero PnL.', limits: ['Continuous-contract rollover/back-adjustment settings not verified.', 'M1 volume unavailable before 2026-05-24.', 'M1 missing 2026-06-18 04:00–21:00 UTC: exclude dependent features and outcome paths.', 'Historical Pine performance not recalculated; past 2026 research is not an untouched holdout.'], repairs: preparation.corrections.map(c => ({ time: c.time, action: c.original ? 'reconstructed' : 'added', basis: c.basis })), reference: preparation.m5, checks: preparation.checks, datasets: [] };
const privateManifest = { prefix, restoration: preparation, datasets: [] };
for (const [id, minutes, file, origin] of specs) {
  const source = JSON.parse(fs.readFileSync(path.join(inputDir, file)));
  const rows = source.rows;
  const monthly = {}, daily = {};
  let previous = -Infinity, missingVolume = 0;
  for (const row of rows) {
    if (row.length !== 6 || !Number.isInteger(row[0]) || row[0] <= previous || row[0] % (minutes * 60)) throw new Error(`Invalid chronology: ${id}`);
    if (!row.slice(1,5).every(Number.isFinite) || row[2] < Math.max(row[1],row[4]) || row[3] > Math.min(row[1],row[4]) || row[2] < row[3]) throw new Error(`Invalid OHLC: ${id}`);
    if (row[5] !== null && (!Number.isFinite(row[5]) || row[5] < 0)) throw new Error(`Invalid volume: ${id}`);
    previous = row[0];
    const d = date(row[0]), m = d.slice(0,7);
    daily[d] ??= { count: 0, volumeCount: 0 };
    monthly[m] ??= { count: 0, volumeCount: 0 };
    daily[d].count++; monthly[m].count++;
    if (row[5] !== null) { daily[d].volumeCount++; monthly[m].volumeCount++; } else missingVolume++;
  }
  const parts = [];
  for (let start = 0; start < rows.length; start += 5000) {
    const subset = rows.slice(start, start + 5000);
    const json = JSON.stringify(subset);
    const value = gzipSync(json).toString('base64');
    const part = { index: parts.length, count: subset.length, from: subset[0][0], to: subset.at(-1)[0], sha256: sha(json), bytes: Buffer.byteLength(json), encodedSha256: sha(value) };
    const key = `${prefix}/${id}/part-${String(part.index).padStart(3,'0')}`;
    fs.writeFileSync(path.join(output, `${id}-${part.index}.json`), JSON.stringify({ key, value, metadata: { sha256: part.sha256, count: part.count, encoding: 'gzip-base64' } }));
    parts.push(part);
  }
  const dataset = { id, minutes, origin, count: rows.length, volumeCount: rows.length - missingVolume, from: rows[0][0], to: rows.at(-1)[0], rowsSha256: sha(JSON.stringify(rows)), parts, monthly, daily };
  manifest.datasets.push(dataset);
  privateManifest.datasets.push({ id, provenance: source.provenance, inputFile: file, parts });
}
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest));
fs.writeFileSync(path.join(output, 'private-manifest.json'), JSON.stringify(privateManifest));
fs.writeFileSync(path.join(output, 'manifest-upload.json'), JSON.stringify({ key: `${prefix}/manifest`, value: JSON.stringify(manifest) }));
fs.writeFileSync(path.join(output, 'private-manifest-upload.json'), JSON.stringify({ key: `${prefix}/restoration`, value: JSON.stringify(privateManifest) }));
console.log(JSON.stringify({ id: manifest.id, parts: manifest.datasets.map(d => [d.id,d.count,d.parts.length]), bytes: manifest.datasets.reduce((s,d)=>s+d.parts.reduce((n,p)=>n+p.bytes,0),0), manifestSha256: sha(JSON.stringify(manifest)) }));
