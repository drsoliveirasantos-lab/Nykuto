#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const critical = [];
const warnings = [];
const notes = [];

const ignoredDirs = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  'playwright-report',
  'test-results'
]);

const requiredFiles = [
  'SOURCE_OF_TRUTH.md',
  'AGENTS.md',
  '.github/copilot-instructions.md',
  'docs/site-architecture.md'
];

const forbiddenExact = new Set([
  'window.txt',
  'split_migration_manifest.json',
  'README_SPLIT_MIGRATION.md'
]);

const forbiddenPatterns = [
  /original[-_]58/i,
  /split[_-]migration/i,
  /apply[-_]split[-_]migration/i,
  /rebuild[-_]split[-_]course[-_]data/i
];

const suspiciousPatterns = [
  /(^|[-_./])backup($|[-_./])/i,
  /(^|[-_./])old($|[-_./])/i,
  /(^|[-_./])obsolete($|[-_./])/i,
  /(^|[-_./])legacy($|[-_./])/i,
  /(^|[-_./])tmp($|[-_./])/i,
  /(^|[-_./])temp($|[-_./])/i,
  /(^|[-_./])copy($|[-_./])/i
];

const archivePattern = /\.(zip|rar|7z|tar|tgz|gz)$/i;

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const absolute = path.join(dir, name);
    const rel = toPosix(path.relative(root, absolute));
    const stat = fs.statSync(absolute);

    if (stat.isDirectory()) {
      if (!ignoredDirs.has(rel) && !ignoredDirs.has(name)) walk(absolute, out);
    } else {
      out.push(rel);
    }
  }

  return out;
}

function addCritical(message) {
  critical.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function checkRequiredFiles() {
  for (const rel of requiredFiles) {
    if (!exists(rel)) addCritical(`Missing repository governance file: ${rel}`);
  }
}

function checkFiles(files) {
  for (const rel of files) {
    const base = path.posix.basename(rel);

    if (forbiddenExact.has(rel) || forbiddenExact.has(base)) {
      addCritical(`Forbidden stale file present: ${rel}`);
    }

    if (forbiddenPatterns.some((pattern) => pattern.test(rel))) {
      addCritical(`Forbidden migration/original-style path present: ${rel}`);
    }

    if (archivePattern.test(base)) {
      addWarning(`Archive committed to repository: ${rel}`);
    }

    if (suspiciousPatterns.some((pattern) => pattern.test(rel))) {
      addWarning(`Review suspicious temporary/backup-style path: ${rel}`);
    }
  }
}

function writeReport(files) {
  fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
  notes.push(`Scanned files: ${files.length}`);

  const lines = [
    'Repository hygiene report',
    `Critical findings: ${critical.length}`,
    `Warnings: ${warnings.length}`,
    '',
    'Critical findings:',
    ...(critical.length ? critical.map((item) => ` - ${item}`) : [' - none']),
    '',
    'Warnings:',
    ...(warnings.length ? warnings.map((item) => ` - ${item}`) : [' - none']),
    '',
    'Notes:',
    ...notes.map((item) => ` - ${item}`)
  ];

  fs.writeFileSync(path.join(root, 'reports/repository-hygiene-report.txt'), `${lines.join('\n')}\n`);
  console.log(lines.join('\n'));
}

checkRequiredFiles();
const files = walk(root).sort();
checkFiles(files);
writeReport(files);

if (critical.length) process.exit(1);
