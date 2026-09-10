import { inspectOpeningHistory } from './jeu22-history.mjs';
import { JEU29_PRODUCTS, JEU29_PROFILES } from './jeu29-policy.mjs';
import { JEU40_MONTHS, JEU40_MISSING } from './jeu40-policy.mjs';
import { historyCalendar } from './jeu14-policy.mjs';
import { coverage40, calendar40, summarize40 } from './jeu40-diagnostic.mjs';
import { contexts40, filtered40 } from './jeu41-preparation.mjs';
import { statistics45, review45 } from './jeu45-diagnostic.mjs';
import { compareEntryRuns } from './jeu36-comparison.mjs';
import { compareExecutionDiagnostics, uniqueChangedOpportunities } from './research-execution-diagnostics.mjs';
import { simulateConfidencePortfolio } from './jeu46-engine.mjs';
import { invalidationDecision46 } from './jeu46-exit.mjs';
import { JEU46_POLICY as P, JEU46_VARIANTS } from './jeu46-policy.mjs';

const cents = n => Math.round(n * 100) / 100;
const ensure = (condition, message) => { if (!condition) throw Error(message); };
const same = (a, b, message) => ensure(JSON.stringify(a) === JSON.stringify(b), message);
export function statistics46(trades) {
  return { ...statistics45(trades), invalidationDecisions: trades.filter(t => t.invalidationAt !== undefined).length,
    invalidationFills: trades.filter(t => t.reason === 'Closed range invalidation').length };
}
export function progressionReview46(referenceReview, priorCandidateReview) {
  return { referenceReview, priorCandidateReview,
    progressionGatePassed: referenceReview.descriptiveGatePassed && priorCandidateReview.descriptiveGatePassed,
    selection: null, independent: false, confirmed: false, executionAllowed: false };
}

export function runStudy46(bundle, mnq, prior, onProgress = () => {}) {
  const markets = JEU29_PROFILES.map(profile => {
    const product = JEU29_PRODUCTS.find(p => p.symbol === profile.symbol);
    return { ...profile, product, data: inspectOpeningHistory(profile.symbol === 'MNQ' ? mnq
      : bundle.products.find(p => p.symbol === profile.symbol), product) };
  });
  const coverage = JEU40_MONTHS.map(month => ({ month: month.id, ...coverage40(markets, month) }));
  coverage.forEach((cov, i) => ensure(cov.expected === JEU40_MONTHS[i].expected
    && cov.available === JEU40_MONTHS[i].available, 'Source coverage changed'));
  same(coverage.flatMap(c => c.missing), JEU40_MISSING, 'Missing dates changed');
  ensure(prior.schema === 'jeu45-private-v1' && prior.runs.length === 112, 'Archived Game45 controls required');
  const archived = (month, variant, factor) => {
    const matches = prior.runs.filter(r => r.month === month && r.variant === variant && r.factor === factor);
    ensure(matches.length === 1, 'Missing or duplicate archived control');
    return matches[0].run;
  };
  const views = [], runs = [], audit = { controls: 0, referenceControls: 0, priorCandidateControls: 0,
    prefixes: 0, filterPrefixes: 0, contextPrefixes: 0, checkedTrades: 0, invalidationPriceChecks: 0, passed: false };
  for (const month of JEU40_MONTHS) {
    const period = { start: month.start, end: month.end }, cov = coverage.find(c => c.month === month.id);
    const expected = historyCalendar(month.start, month.end), missing = new Set(cov.missing.map(d => d.day));
    const available = expected.filter(d => !missing.has(d.date)), contexts = contexts40(markets, month);
    const original = filtered40(markets, contexts, month, available);
    for (const variant of JEU46_VARIANTS) {
      const costs = {};
      for (const [cost, factor] of [['normal', 1], ['stress', 2]]) {
        const run = simulateConfidencePortfolio(original.streams, contexts, period, factor, 'fixed100',
          variant.timeExitSymbol, variant.invalidationSymbol);
        const reference = archived(month.id, 'baseline', factor), previous = archived(month.id, 'mnq-time-exit30', factor);
        if (variant.control) {
          same(run, archived(month.id, variant.id, factor), 'Whole archived account changed');
          audit.controls++;
          audit[variant.id === 'baseline' ? 'referenceControls' : 'priorCandidateControls']++;
        }
        for (const { date: day } of available) {
          const prefixContexts = contexts40(markets, month, day);
          const prefix = filtered40(markets, prefixContexts, month, available, day);
          const end = new Date(Date.parse(day + 'T00:00Z') + 86400000).toISOString().slice(0, 10);
          for (const [symbol, cs] of prefixContexts) same([...cs], [...contexts.get(symbol)].filter(([, c]) => c.day <= day), 'Future context leak');
          audit.contextPrefixes++;
          same(prefix.decisions, original.decisions.filter(d => d.day <= day), 'Future filter leak'); audit.filterPrefixes++;
          const replay = simulateConfidencePortfolio(prefix.streams, prefixContexts, { start: period.start, end }, factor,
            'fixed100', variant.timeExitSymbol, variant.invalidationSymbol);
          for (const key of ['trades', 'days', 'decisions']) same(replay[key], run[key].filter(t => t.day <= day), 'Future account leak: ' + key);
          audit.prefixes++;
        }
        for (const t of run.trades) {
          const product = JEU29_PRODUCTS.find(p => p.symbol === t.symbol), sign = t.side === 'Long' ? 1 : -1;
          ensure(!missing.has(t.day) && t.symbol !== 'MYM' && t.stop === t.initialStop && t.breakEvenAt === null, 'Date, market or stop changed');
          ensure(Math.abs(sign * (t.target - t.entry) - 2 * t.risk) < 1e-7, 'Target changed');
          ensure(Number.isInteger(t.quantity) && t.quantity >= 1 && t.quantity <= 20
            && t.plannedRiskUSD <= t.riskCapUSD + 1e-8 && t.riskCapUSD <= 100, 'Risk or quantity changed');
          ensure(cents(sign * (t.exit - t.entry) * product.multiplier * t.quantity - t.costDollars) === t.netDollars, 'Trade cashflow changed');
          if (t.invalidationAt !== undefined) {
            ensure(t.symbol === variant.invalidationSymbol && t.timeExitAt === undefined && t.exitTime === t.invalidationAt, 'Invalid scheduled exit');
            const stream = original.streams.find(s => s.symbol === t.symbol);
            const decisionBar = stream.candles.find(b => b.time === t.invalidationAt - 300);
            const decision = invalidationDecision46(t, decisionBar, variant.invalidationSymbol);
            ensure(decision && Object.entries(decision).every(([k, v]) => t[k] === v), 'Invalidation metadata differs');
            for (const b of stream.candles.filter(b => b.time >= t.entryTime && b.time < decisionBar.time))
              ensure(invalidationDecision46(t, b, variant.invalidationSymbol) === null, 'Earlier invalidation missed');
            if (t.reason === 'Closed range invalidation') ensure(t.exit === stream.candles.find(b => b.time === t.exitTime).open, 'Next-open fill differs');
            audit.invalidationPriceChecks++;
          }
          audit.checkedTrades++;
        }
        const stats = statistics46(run.trades); ensure(stats.net === run.net, 'Trade net differs');
        costs[cost] = { ...stats, status: run.status, terminalDay: run.terminalDay, balance: run.balance, floor: run.floor,
          drawdown: run.drawdown, withdrawnUSD: run.withdrawnUSD, receiptEUR: run.receiptEUR,
          profitGoalAchieved: run.profitGoalAchieved, personalGoalAchieved: run.personalGoalAchieved,
          profitGoalDay: run.profitGoalDay, goalDay: run.goalDay, calendar: calendar40(run, expected, cov.missing),
          daily: run.daily, denied: run.denied, contributions: JEU29_PRODUCTS.map(p => ({ symbol: p.symbol,
            ...statistics46(run.trades.filter(t => t.symbol === p.symbol)) })),
          comparison: compareEntryRuns(reference, run), priorCandidateComparison: compareEntryRuns(previous, run),
          diagnostics: compareExecutionDiagnostics(reference.trades, run.trades),
          priorCandidateDiagnostics: compareExecutionDiagnostics(previous.trades, run.trades),
          coverageComplete: cov.complete, partialResult: !cov.complete, executionAllowed: false };
        runs.push({ month: month.id, variant: variant.id, factor, period, coverage: cov, run });
        onProgress({ completed: runs.length, total: P.executionCount, month: month.id, variant: variant.id, cost, audit: { ...audit } });
      }
      views.push({ month: month.id, label: month.label, variant: variant.id, mode: 'funded', resetAtStart: true, period, coverage: cov, costs });
    }
  }
  ensure(runs.length === P.executionCount && audit.controls === P.exactControls && audit.referenceControls === 16
    && audit.priorCandidateControls === 16 && audit.prefixes === P.accountPrefixes && audit.filterPrefixes === P.filterPrefixes
    && audit.contextPrefixes === P.contextPrefixes, 'Wrong replay/audit count'); audit.passed = true;
  const tradesFor = (id, factor) => runs.filter(r => r.variant === id && r.factor === factor).flatMap(r => r.run.trades);
  const summaries = Object.fromEntries(JEU46_VARIANTS.map(v => [v.id, Object.fromEntries(['normal', 'stress'].map((cost, i) => [cost, {
    ...summarize40(views.filter(x => x.variant === v.id), cost), tradeStatistics: statistics46(tradesFor(v.id, i + 1)),
    diagnostics: compareExecutionDiagnostics(tradesFor('baseline', i + 1), tradesFor(v.id, i + 1)),
    priorCandidateDiagnostics: compareExecutionDiagnostics(tradesFor('mnq-time-exit30', i + 1), tradesFor(v.id, i + 1)),
  }]))]));
  const reviews = Object.fromEntries(JEU46_VARIANTS.filter(v => !v.control).map(v => {
    const reviewAgainst = reference => {
      const cells = views.filter(x => x.variant === v.id).flatMap(x => ['normal', 'stress'].map(cost => {
        const base = views.find(b => b.month === x.month && b.variant === reference).costs[cost], here = x.costs[cost];
        return { month: x.month, cost, net: here.net, delta: cents(here.net - base.net), drawdown: here.drawdown,
          referenceDrawdown: base.drawdown, status: here.status };
      }));
      const means = Object.fromEntries(['normal', 'stress'].map(cost => [cost, {
        candidate: summaries[v.id][cost].tradeStatistics.meanNetUnrounded, reference: summaries[reference][cost].tradeStatistics.meanNetUnrounded }]));
      return review45(cells, means);
    };
    return [v.id, { ...progressionReview46(reviewAgainst('baseline'), reviewAgainst('mnq-time-exit30')),
      uniqueChangedOpportunitiesAgainstBaseline: uniqueChangedOpportunities([1, 2].map(factor => ({
        reference: tradesFor('baseline', factor), candidate: tradesFor(v.id, factor) }))) }];
  }));
  return { report: { schema: 'jeu46-closed-invalidation-report-v1', policy: P, variants: JEU46_VARIANTS,
    newConfigurations: P.newConfigurations, executionCount: P.executionCount, coverage, views, summaries, audit, reviews,
    selection: null, independent: false, confirmed: false, executionAllowed: false }, privateRuns: { schema: 'jeu46-private-v1', runs } };
}
