import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = new Map();
async function visit(path) {
  const absolute = resolve(root, path), name = relative(root, absolute);
  if (name.startsWith('../') || files.has(name)) return;
  const raw = await readFile(absolute);
  files.set(name, createHash('sha256').update(raw).digest('hex'));
  if (!name.endsWith('.mjs')) return;
  for (const match of raw.toString().matchAll(/(?:from\s*|import\s*\()\s*['"](\.[^'"]+)['"]/g)) {
    await visit(relative(root, resolve(dirname(absolute), match[1].split(/[?#]/)[0])));
  }
}
for (const path of ['scripts/freeze-trading-jeu28.mjs', 'scripts/run-trading-jeu28.mjs',
  'scripts/test-trading-breakeven.mjs', 'trading/lab/JEU28_PROTOCOL.md', 'trading/lab/jeu28-source.json']) await visit(path);
const freeze = { schema: 'jeu28-freeze-v1', createdAt: new Date().toISOString(),
  beforePerformance: true, files: Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b))) };
const raw = JSON.stringify(freeze, null, 2) + '\n';
await writeFile(resolve(root, 'trading/lab/jeu28-freeze.json'), raw, { flag: 'wx' });
console.log(JSON.stringify({ files: files.size, sha256: createHash('sha256').update(raw).digest('hex') }));
