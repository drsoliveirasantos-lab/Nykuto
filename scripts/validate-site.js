#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const requiredPages = [
  'index.html',
  'offres.html',
  'exemples.html',
  'process.html',
  'faq.html',
  'contact.html',
  'mentions-legales.html',
  'confidentialite.html',
  'cgv.html'
];
const problems = [];
const checked = new Set();

function add(file, message) {
  problems.push(`${file}: ${message}`);
}

function normalizeLocal(value) {
  return String(value || '')
    .split('#')[0]
    .split('?')[0]
    .replace(/^\.\//, '')
    .replace(/^\//, '');
}

function isExternal(value) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(String(value || ''));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, normalizeLocal(relativePath)));
}

for (const page of requiredPages) {
  if (!exists(page)) add(page, 'required public page is missing');
}

const htmlFiles = fs.readdirSync(root)
  .filter((name) => name.endsWith('.html'))
  .sort();

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  checked.add(file);

  if (!/^<!doctype html>/i.test(html.trim())) add(file, 'missing HTML5 doctype');
  if (!/<html[^>]+lang=["']fr["']/i.test(html)) add(file, 'missing lang="fr"');
  if (!/<meta\s+name=["']viewport["']/i.test(html)) add(file, 'missing viewport meta');
  if (!/<title>[^<]*Nykuto[^<]*<\/title>/i.test(html)) add(file, 'title does not include Nykuto');
  if (!/<meta\s+name=["']description["'][^>]+content=["'][^"']{20,}["']/i.test(html)) {
    add(file, 'missing or too-short meta description');
  }

  const unsafePlaceholders = Array.from(html.matchAll(/<a\b[^>]*href=["']#["'][^>]*>/gi))
    .map((match) => match[0])
    .filter((tag) => !/aria-disabled=["']true["']|data-allow-placeholder/i.test(tag));
  if (unsafePlaceholders.length) add(file, `unsafe href="#" links: ${unsafePlaceholders.length}`);

  const references = [];
  for (const match of html.matchAll(/<(?:a|link)\b[^>]*href=["']([^"']+)["']/gi)) references.push(['href', match[1]]);
  for (const match of html.matchAll(/<(?:script|img|source)\b[^>]*src=["']([^"']+)["']/gi)) references.push(['src', match[1]]);

  for (const [kind, value] of references) {
    if (!value || isExternal(value)) continue;
    const local = normalizeLocal(value);
    if (!local) continue;
    if (!exists(local)) add(file, `missing ${kind} target: ${local}`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/alt=["'][^"']*["']/i.test(tag)) add(file, 'image missing alt attribute');
  }
}

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
const report = [
  'Nykuto site validation report',
  `HTML files checked: ${checked.size}`,
  `Required pages: ${requiredPages.length}`,
  `Problems: ${problems.length}`,
  '',
  ...(problems.length ? problems.map((problem) => ` - ${problem}`) : [' - none'])
].join('\n');
fs.writeFileSync(path.join(root, 'reports/site-validation-report.txt'), `${report}\n`);
console.log(report);

if (problems.length) process.exit(1);
