import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readSixMonths, SIX_MONTHS_SOURCE } from '../trading/lab/six-months-source.mjs';
import { SIX_MONTHS_SEGMENTS } from '../trading/lab/mnq-six-months-policy.mjs';
import { sessionFor } from '../trading/lab/session-comparison.mjs';
import { inspectJeu12 } from '../trading/lab/jeu12-engine.mjs';
const [dir, referencePath] = process.argv.slice(2), root = fileURLToPath(new URL('../', import.meta.url));
if (!dir || !referencePath || !relative(root, resolve(dir)).startsWith('../')) throw new Error('Private output directory and pinned reference required.');
const hash = text => createHash('sha256').update(text).digest('hex');
const reference = await readSixMonths(await readFile(referencePath, 'utf8'));
const segments = [];
for (const def of SIX_MONTHS_SEGMENTS) {
  const text = await readFile(resolve(dir, def.ticker + '.csv'), 'utf8');
  if (/truncated|Next page|Preview|Stored /.test(text)) throw new Error('Incomplete CSV capture.');
  const lines = text.trim().split(/\r?\n/); if (lines.shift() !== 'ticker,time,open,high,low,close,volume') throw new Error('Unexpected CSV schema.');
  const calendar = new Map(reference.calendar.map(c => [c.date, c]));
  const bars = lines.flatMap(line => {
    const row = line.split(','); if (row.length !== 7 || row[0] !== def.ticker || row.slice(1).some(v => v === '' || !Number.isFinite(Number(v)))) throw new Error('Invalid CSV row.');
    const values = row.slice(1).map(Number), local = sessionFor(values[0]), session = calendar.get(local.day);
    const close = session ? Number(session.close.slice(11, 13)) * 60 + Number(session.close.slice(14, 16)) : null;
    return local.day >= def.prep && local.day < def.end && session && local.minute >= 570 && local.minute < close ? [values] : [];
  });
  segments.push({ ticker: def.ticker, expiry: def.expiry, paginationComplete: true, csvSha256: hash(text), bars });
}
const bundle = { schema: 'jeu12-data-v1', protocol: 'jeu12-v1', capturedAt: new Date().toISOString(), referenceSha256: SIX_MONTHS_SOURCE.sha256, segments };
const groups = inspectJeu12(bundle, reference), text = JSON.stringify(bundle);
const metadata = { sha256: hash(text), bytes: Buffer.byteLength(text), groups: groups.map(g => ({ ticker: g.ticker, ...g.quality })) };
await writeFile(resolve(dir, 'dataset.json'), text); await writeFile(resolve(dir, 'metadata.json'), JSON.stringify(metadata, null, 2));
console.log(JSON.stringify(metadata));
