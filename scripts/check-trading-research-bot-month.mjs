// Optional reproduction check, one existing month only. No new strategy search.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
import { compareResearchBotMonth } from '../trading/lab/research-bot.mjs';

const [sources, prior, month, ...extra] = process.argv.slice(2);
assert.ok(!extra.length && sources && prior && month, 'Usage: PRIVATE-sources-dir PRIVATE-Game45-runs.json month-id');
assert.ok([sources, prior].every(p => relative(process.cwd(), resolve(p)).startsWith('../')), 'Private paths required');
assert.equal(execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(), '', 'Commit the implementation before reproduction');
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const freeze = JSON.parse(await readFile('trading/lab/jeu45-freeze.json'));
for (const [path, pin] of Object.entries(freeze.files)) assert.equal(hash(await readFile(path)), pin, path);
const source = JSON.parse(await readFile('trading/lab/jeu45-source.json'));
const audit = JSON.parse(await readFile('trading/lab/jeu45-execution-audit.json'));
async function checked(path, pin) {
  const bytes = await readFile(path);
  assert.equal(bytes.length, pin.bytes); assert.equal(hash(bytes), pin.sha256);
  return JSON.parse(bytes);
}
const bundle = await checked(resolve(sources, 'dataset.json'), source.inputs.prices);
const mnq = await checked(resolve(sources, 'mnq-dataset.json'), source.inputs.mnq);
const archived = await checked(prior, audit.sourceOutputs['runs-private.json']);
const result = compareResearchBotMonth(bundle, mnq, month);
for (const [cost, factor] of [['normal', 1], ['stress', 2]]) {
  for (const [key, variant] of [['reference', 'baseline'], ['candidate', 'mnq-time-exit30']]) {
    const matches = archived.runs.filter(r => r.month === month && r.factor === factor && r.variant === variant);
    assert.equal(matches.length, 1);
    assert.deepEqual(result.costs[cost][key], matches[0].run, 'Whole archived account must remain exact');
  }
}
console.log(JSON.stringify({ status: 'verified', commit, month, wholeArchivedControls: 4,
  newConfigurations: 0, independentObservationsAdded: 0, executionAllowed: false }));
