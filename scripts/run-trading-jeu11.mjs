// Reproducible historical research; never sends an order. All paths stay private.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { inspectJeu11, runJeu11, simulateJeu11 } from '../trading/lab/jeu11-engine.mjs';
import { JEU11_POLICY as p, JEU11_EVENTS as events } from '../trading/lab/jeu11-policy.mjs';
import { JEU11_SOURCE as source } from '../trading/lab/jeu11-source.mjs';
import { CONFLUENCE_VARIANTS as variants } from '../trading/lab/confluence-policy.mjs';
import { contextFor, RULES } from '../trading/lab/validation-engine.mjs';
import { confluenceFeatures, signalChecks } from '../trading/lab/confluence-engine.mjs';
const dir = process.argv[2], root = fileURLToPath(new URL('../', import.meta.url));
const outside = dir ? relative(root, resolve(dir)) : '';
if (!dir || !(outside === '..' || outside.startsWith('../'))) throw new Error('Provide a private directory outside Git.');
const text = await readFile(resolve(dir, 'dataset.json'), 'utf8');
assert.equal(Buffer.byteLength(text), source.bytes, 'dataset size');
assert.equal(createHash('sha256').update(text).digest('hex'), source.sha256, 'dataset fingerprint');
const bundle = JSON.parse(text), { ready, candles } = inspectJeu11(bundle);
assert.equal(ready, true, 'complete data required');
const context = contextFor(candles), features = confluenceFeatures(candles, events);
let featurePrefixes = 0, sessionComparisons = 0, auditedTrades = 0;
// Every candle prefix, including warmup and unfinished hours.
for (let cut = 1; cut <= candles.length; cut++) {
  const prefix = candles.slice(0, cut), ctx = contextFor(prefix);
  for (const key of Object.keys(context)) assert.deepEqual(ctx[key], context[key].slice(0, cut), `causality ${key}/${cut}`);
  assert.deepEqual(confluenceFeatures(prefix, events), features.slice(0, cut), `feature causality/${cut}`);
  featurePrefixes++;
}
const result = runJeu11(bundle);
const byTime = new Map(candles.map((c, i) => [c.time, i]));
for (const variant of result.variants) {
  for (const [factor, trades] of [[1, variant.trades], [2, variant.stressTrades]]) {
    let day = '', count = 0, realized = 0, losses = 0, previousExit = -Infinity;
    for (const t of trades) {
      const i = byTime.get(t.entryTime), bar = candles[i], exit = candles[byTime.get(t.exitTime)];
      assert.ok(i > 0 && exit && bar.day >= p.start && bar.day < p.end);
      assert.equal(bar.day, exit.day, 'no overnight position');
      assert.equal(candles[i - 1].time + 900, t.entryTime, 'entry follows signal close');
      assert.equal(candles[i - 1].day, bar.day, 'no preparation/overnight order');
      assert.equal(bar.sessionEnd, false, 'no last-bar entry');
      assert.ok(t.entryTime > previousExit, 'one position at a time');
      previousExit = t.exitTime;
      if (day !== bar.day) { day = bar.day; count = 0; realized = 0; losses = 0; }
      assert.ok(count < 3 && realized > -2 && losses < 2, 'daily brakes');
      assert.equal(t.entry, bar.open, 'next open execution');
      const k = i - 1;
      assert.ok(context.adx[k] >= 20, 'ADX at signal');
      const long = t.side === 'Long', sign = long ? 1 : -1;
      assert.ok(long ? context.fast[k - 1] <= context.slow[k - 1] && context.fast[k] > context.slow[k] : context.fast[k - 1] >= context.slow[k - 1] && context.fast[k] < context.slow[k], 'EMA crossover at signal');
      assert.ok(signalChecks(features[k], t.side, variant.filters).every(c => c.pass));
      const riskTicks = Math.ceil(context.atr[k] * RULES.atrMultiple / 0.25 - 1e-9);
      assert.equal(t.risk, riskTicks * 0.25);
      assert.equal(t.stop, t.entry - sign * t.risk);
      assert.equal(t.target, t.entry + sign * Math.floor(riskTicks * 1.5 + 1e-9) * 0.25);
      for (const price of [t.entry, t.exit, t.stop, t.target]) assert.ok(Math.abs(price / 0.25 - Math.round(price / 0.25)) < 1e-8);
      assert.equal(t.costDollars, 3.5 * factor);
      const recomputed = (t.exit - t.entry) * sign / t.risk - 3.5 * factor / (t.risk * 2);
      assert.ok(Math.abs(recomputed - t.resultR) < 1e-12, 'net accounting');
      count++; realized += t.resultR; losses = t.resultR < 0 ? losses + 1 : 0; auditedTrades++;
    }
    const definition = variants.find(v => v.id === variant.id);
    for (let i = 0; i < candles.length; i++) {
      if (!candles[i].sessionEnd || candles[i].day < p.start) continue;
      const prefixTrades = simulateJeu11(candles.slice(0, i + 1), definition, factor);
      assert.deepEqual(prefixTrades, trades.filter(t => t.exitTime <= candles[i].time), `${variant.id}/${factor}/${candles[i].day}`);
      sessionComparisons++;
    }
  }
}
const serialize = (value, spaces) => JSON.stringify(value, (_, v) => v === Infinity ? 'Infinity' : v, spaces);
await writeFile(resolve(dir, 'result-private.json'), serialize(result));
const publicReport = {
  schema: 'jeu11-report-v1', protocol: p.version, generatedAt: new Date().toISOString(), period: p.label, start: p.start, endExclusive: p.end,
  dataset: source, quality: result.quality, calculated: true, status: 'Confirmation incomplète', paperEnabled: false,
  audit: { featurePrefixes, sessionComparisons, auditedTrades, passed: true },
  variants: result.variants.map(({ trades, stressTrades, ...v }) => v), events
};
await writeFile(resolve(dir, 'report.json'), serialize(publicReport, 2) + '\n');
console.log(JSON.stringify({ quality: result.quality, audit: publicReport.audit, variants: result.variants.map(v => ({ id: v.id, trades: v.normal.count, normal: v.normal.total, stress: v.stress.total, pf: v.normal.pf, dd: v.normal.dd, failed: v.checks.filter(c => !c.pass).map(c => c.id) })) }));
