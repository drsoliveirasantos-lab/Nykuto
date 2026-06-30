#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const source = path.join(root, 'out');
const mirrors = [
  path.join(root, '.vercel', 'output', 'static'),
  path.join(root, 'dist'),
  path.join(root, '.next')
];

function copyDirectory(from, to) {
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function ensureStaticExport() {
  const indexPath = path.join(source, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('Cloudflare output preparation failed: out/index.html was not generated.');
    process.exit(1);
  }
}

ensureStaticExport();

for (const target of mirrors) {
  copyDirectory(source, target);
  console.log(`Mirrored static export to ${path.relative(root, target)}`);
}
