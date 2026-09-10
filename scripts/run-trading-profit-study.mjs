import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {loadResearchBotMnqHistory, simulateResearchBotMnqProfitStudy} from '../trading/lab/research-bot.mjs';
import {prepareMnqProfitStudy} from '../trading/lab/profit-study-preparation.mjs';
import {PROFIT_STUDY, PROFIT_VARIANTS, PROFIT_MONTHS, summarizeProfitRun, judgeProfitStudy} from '../trading/lab/profit-study-policy.mjs';
const args = process.argv.slice(2);
const argument = name => {const i = args.indexOf(name); return i < 0 ? null : args[i+1];};
const expected = argument('--expected-commit'), output = argument('--out');
if (!expected || !/^[a-f0-9]{40}$/.test(expected) || !output) throw Error('Expected commit and fresh output directory are required');
const head = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
if (head !== expected || execFileSync('git', ['status', '--porcelain'], {encoding: 'utf8'}).trim()) throw Error('A clean, exact frozen checkout is required');
const out = resolve(output);
mkdirSync(out); // Never overwrite a prior experiment directory.
const write = (name, data) => writeFileSync(join(out, name), JSON.stringify(data, null, 2) + '\n');
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const startedAt = new Date().toISOString(), start = performance.now();
write('status.json', {id: PROFIT_STUDY.id, state: 'running', head, startedAt});
try {
  const corpus = loadResearchBotMnqHistory();
  if (corpus.source !== PROFIT_STUDY.datasetId) throw Error('Unexpected historical corpus identity');
  const prepared = prepareMnqProfitStudy(corpus);
  const rows = [], accountDigests = [];
  let prefixes = 0;
  const fullRuns = new Map();
  for (const month of PROFIT_MONTHS) for (const factor of [1,2]) for (const variant of PROFIT_VARIANTS) {
    const run = await simulateResearchBotMnqProfitStudy(prepared, month, variant.id, factor);
    assert.equal(run.executionAllowed, false);
    assert.equal(run.initial, 50000);
    for (const t of run.trades) {
      assert.ok(t.plannedRiskUSD <= variant.maxRiskUSD + 1e-8);
      assert.ok(t.quantity >= 1 && t.quantity <= 20);
      assert.ok(t.balanceBefore - t.plannedRiskUSD >= t.floorBefore + 100 - 1e-8);
      assert.ok(t.balanceBefore - t.plannedRiskUSD >= t.dayStart - 200 - 1e-8);
    }
    const record = {month: month.id, factor, variant: variant.id, summary: summarizeProfitRun(run)};
    rows.push(record);
    fullRuns.set(`${month.id}/${factor}/${variant.id}`, run);
    accountDigests.push({month: month.id, factor, variant: variant.id, sha256: sha(run)});
  }
  // Rebuild inputs for every prefix, not only the simulator's final account.
  for (const month of PROFIT_MONTHS) {
    const days = prepared.eligibleDays.filter(d => d >= month.start && d < month.end);
    for (const day of days) {
      const prefix = prepareMnqProfitStudy(corpus, day);
      const end = new Date(Date.parse(day + 'T00:00:00Z') + 86400000).toISOString().slice(0,10);
      for (const factor of [1,2]) for (const variant of PROFIT_VARIANTS) {
        const full = fullRuns.get(`${month.id}/${factor}/${variant.id}`);
        const partial = await simulateResearchBotMnqProfitStudy(prefix, {...month, end}, variant.id, factor);
        for (const field of ['trades', 'days', 'decisions'])
          assert.deepEqual(partial[field], full[field].filter(r => r.day <= day), `Causal prefix ${month.id}/${day}/${factor}/${variant.id}/${field}`);
        prefixes++;
      }
    }
    console.log(`Validated historical month ${month.id}; cumulative causal replays: ${prefixes}`);
  }
  const missingSessions = prepared.excluded.filter(d => d.day >= '2026-06-01');
  const report = {policy: PROFIT_STUDY, frozenCommit: head, startedAt, completedAt: new Date().toISOString(),
    durationSeconds: (performance.now() - start) / 1000, fullReplays: rows.length, causalPrefixReplays: prefixes,
    coverage: {researchSessions: prepared.eligibleDays.filter(d => d >= '2026-06-01').length, missingSessions,
      excludedWarmup: prepared.excluded.filter(d => d.day < '2026-06-01'),
      note: 'Cash research calendar, not a complete CME session calendar. May is warmup; September is not scored.'},
    rows, verdicts: judgeProfitStudy(rows, missingSessions), accountDigests,
    limitations: ['MNQ-only, not the archived multi-market portfolio', 'Already-seen data: no independent confirmation',
      'MNQ1! continuous series: roll/back-adjustment settings not verified', 'M5 execution: ambiguous bars use conservative native rules, not observed tick fills',
      'Only realized drawdown reported; live intratrade equity is not measured', 'No broker, API, live, paper or shadow activation'],
    selection: null, confirmed: false, executionAllowed: false};
  write('report.json', report);
  const lines = ['# MNQ — étude du gain par trade', '', `Commit gelé : ${head}`, '',
    'Simulation exploratoire MNQ seul, juin–août 2026. Aucun résultat ne garantit un revenu.', '',
    '| Mois | Coûts | Variante | Trades | Net USD | Moyenne tous | Moyenne gagnants | DD réalisé |',
    '|---|---|---|---:|---:|---:|---:|---:|'];
  for (const r of rows) {const s = r.summary; lines.push(`| ${r.month} | ${r.factor}x | ${r.variant} | ${s.trades} | ${s.netUSD} | ${s.meanAllUSD} | ${s.meanWinnerUSD} | ${s.maxRealizedDrawdownUSD} |`);}
  lines.push('', '## Verdicts descriptifs — aucune activation');
  for (const v of report.verdicts) lines.push('', `${v.variant}: ${v.descriptiveGatePassed ? 'critère descriptif passé, confirmation absente' : 'non retenue'}. ${v.reasons.join('; ')}`);
  lines.push('', '## Limites', ...report.limitations.map(s => '- ' + s));
  writeFileSync(join(out, 'REPORT.md'), lines.join('\n') + '\n');
  write('status.json', {id: PROFIT_STUDY.id, state: 'completed', head, completedAt: report.completedAt, reportSha256: sha(report)});
  console.log(JSON.stringify({state: 'completed', fullReplays: rows.length, prefixes, seconds: report.durationSeconds,
    verdicts: report.verdicts, selection: null, executionAllowed: false}));
} catch (error) {
  write('status.json', {id: PROFIT_STUDY.id, state: 'failed', head, error: error.message, failedAt: new Date().toISOString()});
  throw error;
}
