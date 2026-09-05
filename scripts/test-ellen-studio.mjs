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
  assert.match(html, /class="specialty-nav section-shell" aria-label="Especialidades"/);
  assert.doesNotMatch(html, /class="mobile-action"|↗/);
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
assert.match(home, /ellen-portrait\.webp/);
assert.ok(existsSync(resolve(pageDir, 'ellen-portrait.webp')));
assert.match(home, /<figcaption>Ellen · Ellen Studio<\/figcaption>/);
assert.match(home, /Imagens editoriais ilustrativas/);
assert.doesNotMatch(home, /editorial-beauty\.webp/);
for (const service of ['nails', 'cilios', 'sobrancelhas']) {
  const html = readFileSync(resolve(pageDir, service, 'index.html'), 'utf8');
  assert.match(html, /Valor a definir/);
  assert.match(html, /sujeitos à confirmação/i);
  assert.ok(html.includes(`../${service}-editorial.webp`));
  assert.match(html, /REFERÊNCIA VISUAL · IMAGEM ILUSTRATIVA/);
  assert.match(html, /não representa um trabalho realizado por Ellen/i);
  assert.match(html, /TÉCNICAS EM DESTAQUE/);
  assert.match(html, /IMAGENS EDITORIAIS ILUSTRATIVAS/);
  assert.ok(html.indexOf('class="technique-gallery') < html.indexOf('class="service-detail'), 'Technique browsing comes before provisional service details');
}
const catalogues = {
  nails: ['unhas-manicure-classica', 'unhas-esmaltacao-gel', 'unhas-banho-gel', 'unhas-tips-gel', 'unhas-fibra', 'unhas-acrilico-polygel', 'unhas-nail-art'],
  cilios: ['cilios-lash-lift', 'cilios-classica', 'cilios-hibrida', 'cilios-volume-russo'],
  sobrancelhas: ['sobrancelhas-design', 'sobrancelhas-coloracao', 'sobrancelhas-henna', 'sobrancelhas-laminacao']
};
for (const [service, images] of Object.entries(catalogues)) {
  const html = readFileSync(resolve(pageDir, service, 'index.html'), 'utf8');
  for (const image of images) {
    assert.ok(html.includes(`../catalogue/${image}.webp`), `Missing catalogue image reference ${image}`);
    assert.ok(existsSync(resolve(pageDir, 'catalogue', `${image}.webp`)), `Missing catalogue image ${image}`);
    assert.ok(html.includes(`class="technique-preview" href="../catalogue/${image}.webp" aria-label="Ampliar imagem:`), `Missing accessible full-image link for ${image}`);
  }
}
for (const image of ['nails-editorial.webp', 'cilios-editorial.webp', 'sobrancelhas-editorial.webp']) {
  assert.ok(home.includes(`./${image}`));
  assert.ok(existsSync(resolve(pageDir, image)), `Missing prototype image: ${image}`);
}
const agenda = readFileSync(resolve(pageDir, 'agenda/index.html'), 'utf8');
assert.match(agenda, /Nenhuma reserva é realizada nesta prévia/);

const css = readFileSync(resolve(pageDir, 'ellen-studio.css'), 'utf8');
const js = readFileSync(resolve(pageDir, 'ellen-studio.js'), 'utf8');
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /focus-visible/);
assert.match(css, /\.service-links/);
assert.match(css, /\.page-hero/);
assert.match(css, /\.technique-grid/);
for (const selector of ['page-visual', 'technique-card']) {
  assert.match(css, new RegExp(`\\.${selector} img\\{[^}]*height:auto`), 'Responsive images must not retain their HTML pixel height');
}
assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
const studioScript = new Script(js, { filename: 'ellen-studio.js' });

// Exercise the actual viewer event handlers; native focus containment and Escape
// are browser responsibilities, not simulated browser QA.
function viewerHarness(modalSupported = true) {
  const classes = new Set();
  const nodes = new Map();
  const events = new Map();
  let mounted = false;
  let focused = null;
  const viewer = {
    open: false,
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, { addEventListener(type, handler) { events.set(`${selector}:${type}`, handler); } });
      return nodes.get(selector);
    },
    addEventListener(type, handler) { events.set(type, handler); },
    getBoundingClientRect() { return { left: 20, right: 300, top: 20, bottom: 500 }; },
    close() { this.open = false; events.get('close')(); }
  };
  if (modalSupported) viewer.showModal = () => { viewer.open = true; };
  const links = ['Lash lift', 'Volume russo'].map((name, index) => ({
    href: `../catalogue/${index ? 'cilios-volume-russo' : 'cilios-lash-lift'}.webp`,
    attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    querySelector() { return { alt: `Referência ilustrativa: ${name}` }; },
    closest() { return { querySelector: (selector) => ({ textContent: selector === 'h3' ? name : `Descrição ${name}` }) }; },
    addEventListener(type, handler) { this[type] = handler; },
    focus() { focused = this; }
  }));
  studioScript.runInNewContext({ document: {
    body: { classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) }, append() { mounted = true; } },
    querySelector: () => null,
    querySelectorAll: (selector) => selector === '.technique-preview' ? links : [],
    createElement: () => viewer
  } });
  return { links, nodes, events, viewer, classes, get mounted() { return mounted; }, get focused() { return focused; } };
}
const harness = viewerHarness();
assert.ok(harness.mounted);
assert.equal(harness.viewer.attributes['aria-labelledby'], 'image-view-title');
let prevented = false;
const click = { button: 0, preventDefault() { prevented = true; } };
harness.links[0].click({ ...click, ctrlKey: true });
assert.equal(harness.viewer.open, false, 'Modified clicks retain the normal image link');
for (const [index, name] of ['Lash lift', 'Volume russo'].entries()) {
  harness.links[index].click(click);
  assert.ok(prevented && harness.viewer.open && harness.classes.has('image-view-open'));
  assert.equal(harness.nodes.get('.image-view-photo').src, harness.links[index].href);
  assert.equal(harness.nodes.get('#image-view-title').textContent, name);
  assert.equal(harness.nodes.get('#image-view-description').textContent, `Descrição ${name}`);
  assert.equal(harness.links[index].attributes['aria-haspopup'], 'dialog');
  if (index === 0) harness.events.get('.image-view-close:click')();
  else harness.events.get('click')({ target: harness.viewer, clientX: 0, clientY: 0 });
  assert.equal(harness.viewer.open, false);
  assert.equal(harness.classes.has('image-view-open'), false);
  assert.equal(harness.focused, harness.links[index]);
}
const fallback = viewerHarness(false);
assert.equal(fallback.mounted, false);
assert.equal(fallback.links[0].click, undefined, 'Unsupported browsers keep ordinary image links');

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
