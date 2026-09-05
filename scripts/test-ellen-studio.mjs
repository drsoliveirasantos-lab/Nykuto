import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pageDir = resolve(root, 'ellen-studio');
const routes = [
  { file: 'index.html', url: '/ellen-studio/' },
  { file: 'nails/index.html', url: '/ellen-studio/nails/' },
  { file: 'cilios/index.html', url: '/ellen-studio/cilios/' },
  { file: 'sobrancelhas/index.html', url: '/ellen-studio/sobrancelhas/' },
  { file: 'sobre/index.html', url: '/ellen-studio/sobre/' },
  { file: 'agenda/index.html', url: '/ellen-studio/agenda/' }
];
const navigationUrls = routes.map(({ url }) => url);
const titles = new Set();
const descriptions = new Set();

for (const route of routes) {
  const file = resolve(pageDir, route.file);
  const html = readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `IDs must be unique in ${route.file}`);

  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Missing anchor target ${target} in ${route.file}`);
  }
  for (const [, asset] of html.matchAll(/(?:href|src)="((?:\.\.\/|\.\/)[^"]+)"/g)) {
    const assetPath = asset.split(/[?#]/)[0];
    assert.ok(existsSync(resolve(dirname(file), assetPath)), `Missing asset ${asset} in ${route.file}`);
  }
  for (const [, target] of html.matchAll(/href="(\/ellen-studio\/[^"]*)"/g)) {
    const routePath = target.slice('/ellen-studio/'.length).replace(/\/$/, '');
    const targetFile = routePath ? resolve(pageDir, routePath, 'index.html') : resolve(pageDir, 'index.html');
    assert.ok(existsSync(targetFile), `Missing internal page ${target} linked from ${route.file}`);
  }
  for (const [, target] of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
    for (const id of target.split(/\s+/)) assert.ok(ids.includes(id), `Missing ARIA target ${id} in ${route.file}`);
  }

  assert.match(html, /lang="pt-BR"/);
  assert.match(html, /name="robots" content="noindex, nofollow, noarchive"/);
  assert.match(html, /PRÉVIA DE DESIGN/);
  assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1, `Exactly one current page is required in ${route.file}`);
  for (const url of navigationUrls) assert.match(html, new RegExp(`href="${url}"`), `Navigation is incomplete in ${route.file}`);
  assert.doesNotMatch(html, /<(?:form|iframe)\b|https?:\/\/|wa\.me\//i);

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && !titles.has(title), `Title must be unique in ${route.file}`);
  assert.ok(description && !descriptions.has(description), `Description must be unique in ${route.file}`);
  titles.add(title);
  descriptions.add(description);
}

const home = readFileSync(resolve(pageDir, 'index.html'), 'utf8');
assert.match(home, /IMAGEM EDITORIAL ILUSTRATIVA/);
assert.match(home, /editorial-beauty\.webp/);
for (const service of ['nails', 'cilios', 'sobrancelhas']) {
  const html = readFileSync(resolve(pageDir, service, 'index.html'), 'utf8');
  assert.match(html, /Valor a definir/);
  assert.match(html, /sujeitos à confirmação/i);
}
const agenda = readFileSync(resolve(pageDir, 'agenda/index.html'), 'utf8');
assert.match(agenda, /Nenhuma reserva é realizada nesta prévia/);

const css = readFileSync(resolve(pageDir, 'ellen-studio.css'), 'utf8');
const js = readFileSync(resolve(pageDir, 'ellen-studio.js'), 'utf8');
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /focus-visible/);
assert.match(css, /\.service-links/);
assert.match(css, /\.page-hero/);
assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
new Script(js, { filename: 'ellen-studio.js' });

function listFiles(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = resolve(directory, entry);
      return statSync(path).isDirectory() ? listFiles(path) : [path];
    });
}

if (process.argv.includes('--built')) {
  const sourceFiles = listFiles(pageDir);
  for (const output of ['out', 'dist', '.vercel/output/static']) {
    for (const source of sourceFiles) {
      const relativePath = relative(pageDir, source);
      const built = resolve(root, output, 'ellen-studio', relativePath);
      assert.ok(existsSync(built), `Missing built file: ${built}`);
      assert.deepEqual(readFileSync(built), readFileSync(source));
    }
  }
}

console.log('Ellen Studio: six routes, shared navigation, unique metadata, assets, ARIA, preview boundaries and build outputs PASS');
