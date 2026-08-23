#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();
const functionsRoot = path.join(root, 'functions');
const files = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(fullPath);
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
  }
}

visit(functionsRoot);
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const checked = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: source, encoding: 'utf8' });
  if (checked.status !== 0) {
    process.stderr.write(`${path.relative(root, file)}\n${checked.stderr}`);
    process.exit(1);
  }
  for (const match of source.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    const target = path.resolve(path.dirname(file), match[1]);
    if (!fs.existsSync(target)) {
      console.error(`Missing Pages Function import: ${path.relative(root, target)}`);
      process.exit(1);
    }
  }
}

console.log(`Validated ${files.length} Cloudflare Pages Function modules.`);
