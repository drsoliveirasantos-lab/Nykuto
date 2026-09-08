import { loadSixMonths } from '../lab/six-months-source.mjs';
import { inspectSixMonths } from '../lab/mnq-six-months.mjs';
export async function loadAnalysisHistory() {
  const bundle = await loadSixMonths(), inspected = inspectSixMonths(bundle);
  if (!inspected.ready) throw new Error('L’historique MNQ est incomplet. Analyse indisponible.');
  return inspected.groups.map(g => ({ ticker:g.ticker, candles:g.candles.map(c=>({...c,closedAt:c.time+900})) }));
}
