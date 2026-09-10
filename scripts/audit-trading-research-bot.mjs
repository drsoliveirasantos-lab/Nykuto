// Re-read the existing private archive; no replay, inference or parameter search.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
import { JEU40_MONTHS } from '../trading/lab/jeu40-policy.mjs';
import { RESEARCH_BOT } from '../trading/lab/research-bot.mjs';
import { compareExecutionDiagnostics, uniqueChangedOpportunities } from '../trading/lab/research-execution-diagnostics.mjs';

const [input, mode = 'verify', ...extra] = process.argv.slice(2);
assert.ok(input && !extra.length && ['create', 'verify'].includes(mode), 'Usage: PRIVATE-runs-private.json [create|verify]');
assert.ok(relative(process.cwd(), resolve(input)).startsWith('../'), 'Private input must remain outside the repository');
const recorded = JSON.parse(await readFile('trading/lab/jeu45-execution-audit.json'));
const bytes = await readFile(input), pin = recorded.sourceOutputs['runs-private.json'];
assert.equal(bytes.length, pin.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'), pin.sha256);
const archive = JSON.parse(bytes);
assert.equal(archive.schema, 'jeu45-private-v1');
assert.equal(archive.runs.length, 112);
const pairs = [], costs = {};
for (const [cost, factor] of [['normal', 1], ['stress', 2]]) {
  const reference = [], candidate = [], months = [];
  for (const month of JEU40_MONTHS) {
    const get = variant => {
      const matches = archive.runs.filter(r => r.month === month.id && r.factor === factor && r.variant === variant);
      assert.equal(matches.length, 1);
      return matches[0].run;
    };
    const a = get('baseline'), b = get(RESEARCH_BOT.candidate);
    const diagnostic = compareExecutionDiagnostics(a.trades, b.trades);
    assert.equal(diagnostic.reference.netUSD, a.net);
    assert.equal(diagnostic.candidate.netUSD, b.net);
    months.push({ month: month.id, referenceNetUSD: a.net, candidateNetUSD: b.net,
      deltaUSD: diagnostic.deltaUSD, referenceDrawdownUSD: a.drawdown, candidateDrawdownUSD: b.drawdown,
      improvedTrades: diagnostic.attribution.improvedCommonTrades,
      worsenedTrades: diagnostic.attribution.worsenedCommonTrades });
    reference.push(...a.trades); candidate.push(...b.trades);
  }
  pairs.push({ reference, candidate });
  costs[cost] = { ...compareExecutionDiagnostics(reference, candidate), months };
}
const result = {
  schema: 'research-bot-evidence-v1', profile: RESEARCH_BOT, source: { game: 45, ...pin },
  newPerformanceRuns: 0, newConfigurations: 0,
  uniqueChangedOpportunitiesAcrossCosts: uniqueChangedOpportunities(pairs),
  independentObservationsAdded: 0, costs,
  interpretation: 'Descriptive re-accounting of already-observed trades; no new qualification criterion or selection.',
};
const output = 'trading/lab/research-bot-evidence.json';
if (mode === 'create') await writeFile(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
else assert.deepEqual(JSON.parse(await readFile(output)), result, 'Recorded diagnostics changed');
console.log(JSON.stringify({ mode, output, uniqueChangedOpportunities: result.uniqueChangedOpportunitiesAcrossCosts,
  normalDeltaUSD: costs.normal.deltaUSD, stressDeltaUSD: costs.stress.deltaUSD, newPerformanceRuns: 0 }));
