import { JEU18_POLICY as P, JEU18_SCENARIOS } from './jeu18-policy.mjs';
import { JEU17_SCENARIOS } from './jeu17-policy.mjs';
import { simulateAblation } from './jeu17-engine.mjs';
const reference = JEU17_SCENARIOS.find(s => s.id === 'atrNet5');

// A closed-bar estimate anchored to the cash session, never to the final day.
// Integer tick sums preserve exact equality without a tunable price tolerance.
export function sessionVwapContexts(candles) {
  const result = new Map();
  let previous, volume = 0, weightedTicks = 0, complete = false;
  for (const bar of candles) {
    if (!Number.isSafeInteger(bar.time) || bar.time % P.candleSeconds || (previous && bar.time <= previous.time)
      || typeof bar.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(bar.day) || !Number.isInteger(bar.closeMinute)
      || !Number.isInteger(bar.minute) || bar.minute < P.anchorMinute || bar.minute >= bar.closeMinute || (bar.minute - P.anchorMinute) % 5
      || !Number.isSafeInteger(bar.volume) || bar.volume < 0
      || ![bar.open, bar.high, bar.low, bar.close].every(n => Number.isFinite(n) && n > 0 && Number.isSafeInteger(n / P.tick))
      || bar.low > Math.min(bar.open, bar.close) || bar.high < Math.max(bar.open, bar.close, bar.low)) throw new Error('Invalid VWAP bar');
    if (!previous || bar.day !== previous.day || bar.ticker !== previous.ticker) {
      volume = 0; weightedTicks = 0; complete = bar.minute === P.anchorMinute;
    } else if (bar.time !== previous.time + P.candleSeconds || bar.minute !== previous.minute + 5 || bar.closeMinute !== previous.closeMinute) complete = false;
    volume += bar.volume;
    weightedTicks += ((bar.high + bar.low + bar.close) / P.tick) * bar.volume;
    const closeWeightedTicks = (bar.close / P.tick) * 3 * volume;
    if (![volume, weightedTicks, closeWeightedTicks].every(Number.isSafeInteger)) throw new Error('Unsafe VWAP precision');
    const available = complete && volume > 0;
    const closedAt = bar.time + P.candleSeconds;
    result.set(closedAt, Object.freeze({ day: bar.day, ticker: bar.ticker, closedAt, sourceTime: bar.time,
      available, volume, vwap: available ? weightedTicks * P.tick / (3 * volume) : null,
      comparison: available ? Math.sign(closeWeightedTicks - weightedTicks) : null }));
    previous = bar;
  }
  return result;
}

export function filterVwapSignals(candles, signals) {
  const contexts = sessionVwapContexts(candles), accepted = new Map(), decisions = new Map();
  for (const [time, signal] of signals) {
    if (signal.signalClose !== time || signal.signalOpen !== time - P.candleSeconds || !['Long', 'Short'].includes(signal.side)) throw new Error('Invalid VWAP signal');
    const context = contexts.get(time);
    if (context && context.day !== signal.day) throw new Error('VWAP session mismatch');
    const available = context?.available === true;
    const pass = available && context.comparison === (signal.side === 'Long' ? 1 : -1);
    if (pass) accepted.set(time, signal);
    decisions.set(time, { day: signal.day, side: signal.side, accepted: pass, reason: pass ? 'accepted' : available ? 'priceSide' : 'unavailable', context: context ?? null });
  }
  return { signals: accepted, decisions, contexts };
}

// Apply the candidate gate here as well as in the diagnostic signal audit;
// passing an unfiltered signal map can never bypass it. Account fills stay frozen.
export function simulateVwap(candles, signals, scenario, bounds, costFactor = 1, account = true) {
  if (!JEU18_SCENARIOS.some(s => s.id === scenario.id && s.filter === scenario.filter)) throw new Error('Invalid VWAP scenario');
  const admitted = scenario.filter === 'vwap' ? filterVwapSignals(candles, signals).signals : signals;
  return simulateAblation(candles, admitted, reference, bounds, costFactor, account);
}
