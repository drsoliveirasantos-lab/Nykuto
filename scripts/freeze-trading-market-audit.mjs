import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url)), files = {};
async function visit(path) {
  const absolute = resolve(root, path), key = relative(root, absolute);
  if (key.startsWith('../')) throw new Error('External audit dependency');
  if (files[key]) return;
  const raw = await readFile(absolute); files[key] = createHash('sha256').update(raw).digest('hex');
  if (/\.m?js$/.test(path)) for (const m of raw.toString().matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g))
    await visit(relative(root, resolve(dirname(absolute), m[1].split(/[?#]/)[0])));
}
for (const p of ['scripts/freeze-trading-market-audit.mjs', 'scripts/audit-trading-markets.mjs',
  'scripts/test-trading-market-diagnostics.mjs', 'trading/lab/MARKET_AUDIT_PROTOCOL.md', 'trading/lab/market-audit-source.json']) await visit(p);
const result = { schema: 'market-audit-freeze-v1', createdAt: new Date().toISOString(),
  purpose: 'Define a descriptive audit of already-observed outcomes; not a new strategy trial or independent confirmation',
  files: Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) };
await writeFile(resolve(root, 'trading/lab/market-audit-freeze.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log('Audit dependencies fixed: ' + Object.keys(files).length);
