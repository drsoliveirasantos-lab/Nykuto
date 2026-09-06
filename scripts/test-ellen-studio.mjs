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
const shareImageUrl = 'https://nykuto.com/ellen-studio/og.png';
const whatsappBase = 'https://wa.me/595973877606';
const whatsappMessage = 'Olá, Ellen! Vim pelo site Ellen Studio e gostaria de saber mais sobre os serviços e horários.';
const whatsappUrl = `${whatsappBase}?text=${encodeURIComponent(whatsappMessage)}`;

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
  assert.doesNotMatch(html, /<(?:form|iframe)\b/i);
  const body = html.split('<body')[1];
  const contactBody = route.file === 'agenda/index.html' ? body.replace(whatsappUrl, '') : body;
  assert.doesNotMatch(contactBody, /https?:\/\//i, 'Only the supplied WhatsApp contact is allowed in preview content');
  for (const [url] of html.matchAll(/https?:\/\/[^"\s<>]+/g)) {
    const isContact = route.file === 'agenda/index.html' && url === whatsappUrl;
    assert.ok(url.startsWith('https://nykuto.com/ellen-studio/') || isContact, `Unexpected absolute URL in ${route.file}: ${url}`);
  }

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && !titles.has(title), `Title must be unique in ${route.file}`);
  assert.ok(description && !descriptions.has(description), `Description must be unique in ${route.file}`);
  titles.add(title);
  descriptions.add(description);

  const socialEntries = [...html.matchAll(/<meta (?:property|name)="((?:og|twitter):[^"]+)" content="([^"]*)">/g)];
  const social = Object.fromEntries(socialEntries.map(([, key, value]) => [key, value]));
  assert.equal(Object.keys(social).length, socialEntries.length, `Duplicate social metadata in ${route.file}`);
  assert.equal(social['og:title'], title);
  assert.equal(social['twitter:title'], title);
  assert.equal(social['og:description'], description);
  assert.equal(social['twitter:description'], description);
  assert.equal(social['og:url'], `https://nykuto.com${route.url}`);
  assert.ok(html.includes(`<link rel="canonical" href="https://nykuto.com${route.url}">`));
  assert.equal(social['og:type'], 'website');
  assert.equal(social['og:locale'], 'pt_BR');
  assert.equal(social['og:site_name'], 'Ellen Studio');
  assert.equal(social['og:image'], shareImageUrl);
  assert.equal(social['og:image:secure_url'], shareImageUrl);
  assert.equal(social['twitter:image'], shareImageUrl);
  assert.equal(social['og:image:type'], 'image/png');
  assert.equal(social['og:image:width'], '1200');
  assert.equal(social['og:image:height'], '630');
  assert.ok(social['og:image:alt']?.includes('Ellen'));
  assert.equal(social['twitter:image:alt'], social['og:image:alt']);
  assert.equal(social['twitter:card'], 'summary_large_image');
}

const shareImage = readFileSync(resolve(pageDir, 'og.png'));
assert.deepEqual(shareImage.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), 'The social card must be an actual PNG');
assert.equal(shareImage.readUInt32BE(16), 1200, 'Declared share width must match PNG IHDR');
assert.equal(shareImage.readUInt32BE(20), 630, 'Declared share height must match PNG IHDR');
assert.ok(shareImage.length < 500 * 1024, 'Keep the social card lightweight');

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
  const heroAsset = { nails: '../nails-editorial.webp', cilios: '../catalogue/cilios-volume-russo-macro.webp', sobrancelhas: '../catalogue/sobrancelhas-design-macro.webp' }[service];
  assert.ok(html.includes(heroAsset));
  assert.match(html, /REFERÊNCIA VISUAL · IMAGEM ILUSTRATIVA/);
  assert.match(html, /não representa um trabalho realizado por Ellen/i);
  assert.match(html, service === 'nails' ? /MODELOS EM DESTAQUE/ : /TÉCNICAS EM DESTAQUE/);
  assert.match(html, /IMAGENS EDITORIAIS ILUSTRATIVAS/);
  assert.ok(html.indexOf('class="technique-gallery') < html.indexOf('class="service-detail'), 'Technique browsing comes before provisional service details');
}
const catalogues = {
  nails: ['unhas-manicure-classica', 'unhas-esmaltacao-gel', 'unhas-nail-art', 'unhas-francesinha-colorida', 'unhas-glitter-detalhe', 'unhas-poas'],
  cilios: ['cilios-lash-lift-macro', 'cilios-classica-macro', 'cilios-hibrida-macro', 'cilios-volume-russo-macro', 'cilios-cat-eye-macro'],
  sobrancelhas: ['sobrancelhas-design-macro', 'sobrancelhas-coloracao-macro', 'sobrancelhas-henna-macro', 'sobrancelhas-laminacao-macro']
};
for (const [service, images] of Object.entries(catalogues)) {
  const html = readFileSync(resolve(pageDir, service, 'index.html'), 'utf8');
  for (const image of images) {
    assert.ok(html.includes(`../catalogue/${image}.webp`), `Missing catalogue image reference ${image}`);
    assert.ok(existsSync(resolve(pageDir, 'catalogue', `${image}.webp`)), `Missing catalogue image ${image}`);
    assert.ok(html.includes(`class="technique-preview" href="../catalogue/${image}.webp" aria-label="Ampliar imagem:`), `Missing accessible full-image link for ${image}`);
  }
}
const nails = readFileSync(resolve(pageDir, 'nails/index.html'), 'utf8');
assert.equal([...nails.matchAll(/class="technique-card"/g)].length, 6);
assert.doesNotMatch(nails, /fibra|acr[ií]lico|polygel|tips|banho de gel|alongamento/i, 'The nail catalogue focuses on simple finishes for natural nails');
assert.match(nails, /Francesinha clássica/);
assert.match(nails, /Francesinha colorida/);
const brows = readFileSync(resolve(pageDir, 'sobrancelhas/index.html'), 'utf8');
assert.equal([...brows.matchAll(/class="technique-card"/g)].length, 4);
assert.equal([...brows.matchAll(/<img[^>]*width="960" height="640"/g)].length, 5, 'All eyebrow images retain the full macro frame');
assert.doesNotMatch(brows + home, /sobrancelhas-editorial\.webp|sobrancelhas-(?:design|coloracao|henna|laminacao)\.webp/);
const lashes = readFileSync(resolve(pageDir, 'cilios/index.html'), 'utf8');
assert.equal([...lashes.matchAll(/class="technique-card"/g)].length, 5);
assert.equal([...lashes.matchAll(/<img[^>]*width="960" height="640"/g)].length, 6, 'Hero and all five eye references use a landscape frame');
assert.match(lashes, /sem adicionar extensões/);
assert.match(lashes, /Uma extensão por cílio natural/);
assert.match(lashes, /fios individuais e pequenos leques/);
assert.match(lashes, /Leques de fios ultrafinos/);
assert.match(lashes, /É um efeito de extensão, não um lash lift/);
assert.match(lashes, /GERADAS POR IA/);
assert.doesNotMatch(lashes + home, /cilios-editorial\.webp|cilios-(?:lash-lift|classica|hibrida|volume-russo)\.webp/);
for (const image of ['nails-editorial.webp', 'catalogue/cilios-volume-russo-macro.webp', 'catalogue/sobrancelhas-design-macro.webp']) {
  assert.ok(home.includes(`./${image}`));
  assert.ok(existsSync(resolve(pageDir, image)), `Missing prototype image: ${image}`);
}
const agenda = readFileSync(resolve(pageDir, 'agenda/index.html'), 'utf8');
assert.match(agenda, /Nenhuma reserva é confirmada automaticamente pelo site/);
assert.match(agenda, /\+595 973 877606/);
const whatsappLinks = [...agenda.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)];
assert.equal(whatsappLinks.length, 1, 'Expose one clear WhatsApp contact action');
const contactUrl = new URL(whatsappLinks[0][1]);
assert.equal(contactUrl.origin + contactUrl.pathname, whatsappBase);
assert.equal(contactUrl.searchParams.get('text'), whatsappMessage);

const css = readFileSync(resolve(pageDir, 'ellen-studio.css'), 'utf8');
const js = readFileSync(resolve(pageDir, 'ellen-studio.js'), 'utf8');
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /focus-visible/);
assert.match(css, /\.service-links/);
assert.match(css, /\.page-hero/);
assert.match(css, /\.technique-grid/);
assert.match(css, /\.page-lashes \.technique-card img\{[^}]*aspect-ratio:3\/2;object-fit:contain/, 'Eye framing must not crop the outer corner or lash tips');
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
