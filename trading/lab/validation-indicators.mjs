// Causal indicator formulas retained from Jeu 03 for the independent comparison.
export { ema, atr, adx };

function ema(values, period) {
  const out = new Array(values.length).fill(null);
  const alpha = 2 / (period + 1);
  let current = null;
  for (let i = 0; i < values.length; i += 1) {
    const value = Number(values[i]);
    if (!Number.isFinite(value)) continue;
    current = current === null ? value : value * alpha + current * (1 - alpha);
    out[i] = current;
  }
  return out;
}


function atr(candles, period) {
  const out = new Array(candles.length).fill(null);
  let current = null;
  for (let i = 0; i < candles.length; i += 1) {
    const candle = candles[i];
    const previousClose = i ? candles[i - 1].close : candle.close;
    const tr = Math.max(candle.high - candle.low, Math.abs(candle.high - previousClose), Math.abs(candle.low - previousClose));
    current = current === null ? tr : ((current * (period - 1)) + tr) / period;
    out[i] = current;
  }
  return out;
}


function adx(candles, period) {
  const tr = new Array(candles.length).fill(0);
  const plusDm = new Array(candles.length).fill(0);
  const minusDm = new Array(candles.length).fill(0);
  for (let i = 1; i < candles.length; i += 1) {
    const up = candles[i].high - candles[i - 1].high;
    const down = candles[i - 1].low - candles[i].low;
    plusDm[i] = up > down && up > 0 ? up : 0;
    minusDm[i] = down > up && down > 0 ? down : 0;
    tr[i] = Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - candles[i - 1].close), Math.abs(candles[i].low - candles[i - 1].close));
  }
  const out = new Array(candles.length).fill(null);
  const dx = new Array(candles.length).fill(null);
  let smTr = 0, smPlus = 0, smMinus = 0, current = null;
  for (let i = 1; i < candles.length; i += 1) {
    if (i <= period) {
      smTr += tr[i]; smPlus += plusDm[i]; smMinus += minusDm[i];
      if (i < period) continue;
    } else {
      smTr = smTr - smTr / period + tr[i];
      smPlus = smPlus - smPlus / period + plusDm[i];
      smMinus = smMinus - smMinus / period + minusDm[i];
    }
    const plusDi = smTr > 0 ? 100 * smPlus / smTr : 0;
    const minusDi = smTr > 0 ? 100 * smMinus / smTr : 0;
    const denom = plusDi + minusDi;
    dx[i] = denom > 0 ? 100 * Math.abs(plusDi - minusDi) / denom : 0;
    if (current === null) {
      if (i < period * 2 - 1) continue;
      let sum = 0, count = 0;
      for (let j = period; j <= i; j += 1) if (Number.isFinite(dx[j])) { sum += dx[j]; count += 1; }
      current = count ? sum / count : null;
    } else {
      current = ((current * (period - 1)) + dx[i]) / period;
    }
    out[i] = current;
  }
  return out;
}

