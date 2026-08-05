#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const staticFiles = [
  'index.html',
  'offres.html',
  'creation-site-internet.html',
  'international.html',
  'exemples.html',
  'process.html',
  'a-propos.html',
  'faq.html',
  'contact.html',
  'mentions-legales.html',
  'confidentialite.html',
  'cgv.html',
  'styles.css',
  'i18n.js',
  'script.js',
  'favicon.svg',
  'robots.txt',
  'sitemap.xml',
  '_headers'
];

const staticDirectories = ['assets'];

const outputDirs = [
  path.join(root, 'out'),
  path.join(root, 'dist'),
  path.join(root, '.vercel', 'output', 'static')
];

function cleanDirectory(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyStaticFiles(targetDir) {
  for (const file of staticFiles) {
    const source = path.join(root, file);
    const target = path.join(targetDir, file);

    if (!fs.existsSync(source)) {
      console.error(`Missing required static file: ${file}`);
      process.exit(1);
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }

  for (const directory of staticDirectories) {
    const source = path.join(root, directory);
    const target = path.join(targetDir, directory);

    if (!fs.existsSync(source)) {
      console.error(`Missing required static directory: ${directory}`);
      process.exit(1);
    }

    fs.cpSync(source, target, { recursive: true });
  }
}

for (const dir of outputDirs) {
  cleanDirectory(dir);
  copyStaticFiles(dir);
  console.log(`Prepared Cloudflare static output: ${path.relative(root, dir)}`);
}
