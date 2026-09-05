import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pageDir = resolve(root, 'ellen-studio');
const html = readFileSync(resolve(pageDir, 'index.html'), 'utf8');
const css = readFileSync(resolve(pageDir, 'ellen-studio.css'), 'utf8');
const js = readFileSync(resolve(pageDir, 'ellen-studio.js'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.includes(target), `Missing anchor target: ${target}`);
}
for (const [, filename] of html.matchAll(/(?:href|src)="\.\/([^"]+)"/g)) {
  assert.ok(existsSync(resolve(pageDir, filename)), `Missing asset: ${filename}`);
}
for (const [, target] of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
  for (const id of target.split(/\s+/)) assert.ok(ids.includes(id), `Missing ARIA target: ${id}`);
}
assert.match(html, /lang="pt-BR"/);
assert.match(html, /name="robots" content="noindex, nofollow, noarchive"/);
assert.match(html, /PRÉVIA DE DESIGN/);
assert.match(html, /IMAGEM EDITORIAL ILUSTRATIVA/);
assert.match(html, /editorial-beauty\.webp/);
assert.match(html, /Nenhuma reserva é realizada nesta prévia/);
assert.match(html, /sujeitos à confirmação de Ellen/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /focus-visible/);
assert.doesNotMatch(html, /<(?:form|iframe)\b|https?:\/\/|wa\.me\//i);
assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
new Script(js, { filename: 'ellen-studio.js' });
for (const category of ['nails', 'lashes', 'brows']) {
  assert.ok(ids.includes(`menu-${category}`));
  assert.match(html, new RegExp(`data-filter="${category}"`));
  assert.match(html, new RegExp(`data-category-link="${category}"`));
}
// Run after npm run build to validate all three deployment outputs too.
if (process.argv.includes('--built')) {
  for (const output of ['out', 'dist', '.vercel/output/static']) {
    for (const file of ['index.html', 'ellen-studio.css', 'ellen-studio.js', 'emblem.svg', 'editorial-beauty.webp']) {
      const built = resolve(root, output, 'ellen-studio', file);
      assert.ok(existsSync(built), `Missing built file: ${built}`);
      assert.deepEqual(readFileSync(built), readFileSync(resolve(pageDir, file)));
    }
  }
}
console.log('Ellen Studio: source, anchors, ARIA, assets, preview boundaries and JavaScript syntax PASS');
