// Jeu47: exploratory MNQ context features from 1-minute bars.
// Research-only: this module never sends broker orders and must not be treated as
// an execution permission. Every signal is emitted only after the source bar closes.

export const JEU47_V8_POLICY = Object.freeze({
  rsiPeriod: 14,
  oversold: 30,
  overbought: 70,
  pivotLeft: 2,
  pivotRight: 2,
  impulseBody: 0.6,
  recentContextMinutes: 30,
  orbOpeningMinutes: 30,
  orbLatestEntryMinuteNY: 720,
  rr: 2,
  researchOnly: true,
  executionAllowed: false
});

export function wilderRsi(closes, period = JEU47_V8_POLICY.rsiPeriod) {
  if (!Array.isArray(closes) || closes.length < 2 || period < 2) throw new Error('Invalid RSI input');
  const out = Array(closes.length).fill(null);
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1], gain = Math.max(d, 0), loss = Math.max(-d, 0);
    if (i <= period) {
      avgGain += gain; avgLoss += loss;
      if (i === period) { avgGain /= period; avgLoss /= period; }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    if (i >= period) out[i] = avgGain + avgLoss === 0 ? 50 : avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function rsiExitEvents(rsi, low = JEU47_V8_POLICY.oversold, high = JEU47_V8_POLICY.overbought) {
  return rsi.map((value, i) => ({
    up: i > 0 && Number.isFinite(rsi[i - 1]) && Number.isFinite(value) && rsi[i - 1] < low && value >= low,
    down: i > 0 && Number.isFinite(rsi[i - 1]) && Number.isFinite(value) && rsi[i - 1] > high && value <= high
  }));
}

export function confirmedPivotEvents(bars, rsi, left = 2, right = 2) {
  if (!Array.isArray(bars) || bars.length !== rsi.length) throw new Error('Invalid pivot input');
  const out = bars.map(() => ({ bullDiv:false, bearDiv:false, pivotLow:false, pivotHigh:false }));
  const lastLow = new Map(), lastHigh = new Map();
  for (let i = left; i < bars.length - right; i++) {
    const day = bars[i].day;
    const neighbours = bars.slice(i-left, i+right+1).filter((_,j)=>j!==left);
    const low = neighbours.every(b=>bars[i].low < b.low), high = neighbours.every(b=>bars[i].high > b.high);
    if (low) {
      const prev = lastLow.get(day); out[i+right].pivotLow = true;
      if (prev !== undefined && bars[i].low < bars[prev].low && Number.isFinite(rsi[i]) && Number.isFinite(rsi[prev]) && rsi[i] > rsi[prev]) out[i+right].bullDiv = true;
      lastLow.set(day, i);
    }
    if (high) {
      const prev = lastHigh.get(day); out[i+right].pivotHigh = true;
      if (prev !== undefined && bars[i].high > bars[prev].high && Number.isFinite(rsi[i]) && Number.isFinite(rsi[prev]) && rsi[i] < rsi[prev]) out[i+right].bearDiv = true;
      lastHigh.set(day, i);
    }
  }
  return out;
}

export function sessionTag(minuteNY) {
  // EDT clocks used by the Jun-Aug 2026 diagnostic dataset. Session tags are
  // context variables only; they never imply direction or add automatic score.
  if (minuteNY >= 19*60 && minuteNY < 20*60+30) return 'Tokyo-open-90m';
  if (minuteNY >= 3*60 && minuteNY < 4*60+30) return 'London-open-90m';
  if (minuteNY >= 9*60+30 && minuteNY < 11*60) return 'NewYork-open-90m';
  return 'Other';
}

export function allowOrbByRsi(side, value) {
  if (!['Long','Short'].includes(side)) throw new Error('Invalid ORB side');
  if (!Number.isFinite(value)) return true;
  if (side === 'Long' && value > JEU47_V8_POLICY.overbought) return false;
  if (side === 'Short' && value < JEU47_V8_POLICY.oversold) return false;
  return true;
}

export function reversalContext({side, mss, rsiExit, divergence, minutesSinceContext}) {
  if (!['Long','Short'].includes(side)) throw new Error('Invalid reversal side');
  const recent = Number.isFinite(minutesSinceContext) && minutesSinceContext >= 0 && minutesSinceContext <= JEU47_V8_POLICY.recentContextMinutes;
  const directionalContext = side === 'Long' ? (rsiExit?.up || divergence?.bullDiv) : (rsiExit?.down || divergence?.bearDiv);
  const directionalMss = side === 'Long' ? mss === 'up' : mss === 'down';
  return { accepted: !!directionalMss && !!directionalContext && recent, directionalMss:!!directionalMss, directionalContext:!!directionalContext, recent };
}

export function v8Labels({rsiExit, divergence, mss, side, strong=false}) {
  const labels=[];
  if (rsiExit?.up) labels.push('R↑'); if (rsiExit?.down) labels.push('R↓');
  if (divergence?.bullDiv) labels.push('DIV↑'); if (divergence?.bearDiv) labels.push('DIV↓');
  if (mss === 'up') labels.push('MSS↑'); if (mss === 'down') labels.push('MSS↓');
  if (side === 'Long') labels.push(strong ? 'BR+' : 'BR');
  if (side === 'Short') labels.push(strong ? 'SR+' : 'SR');
  return labels;
}
