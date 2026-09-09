// Exploratory manual Lab only. Frozen research engines are separate.
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function ema(values, period) {
  const output = new Array(values.length).fill(null);
  const alpha = 2 / (period + 1);
  let current = null;
  for (let i = 0; i < values.length; i += 1) {
    const value = Number(values[i]);
    if (!Number.isFinite(value)) continue;
    current = current === null ? value : (value * alpha) + (current * (1 - alpha));
    output[i] = current;
  }
  return output;
}

function atr(candles, period = 14) {
  const output = new Array(candles.length).fill(null);
  let current = null;
  for (let i = 0; i < candles.length; i += 1) {
    const candle = candles[i];
    const previousClose = i > 0 ? candles[i - 1].close : candle.close;
    const trueRange = Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose)
    );
    current = current === null ? trueRange : ((current * (period - 1)) + trueRange) / period;
    output[i] = current;
  }
  return output;
}

function rsi(values, period = 14) {
  const output = new Array(values.length).fill(null);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < values.length; i += 1) {
    const change = values[i] - values[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    if (i <= period) {
      avgGain += gain / period;
      avgLoss += loss / period;
      if (i < period) continue;
    } else {
      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    }
    output[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
  }
  return output;
}

function average(values, start, end) {
  let sum = 0;
  let count = 0;
  for (let i = start; i <= end; i += 1) {
    const value = Number(values[i]);
    if (!Number.isFinite(value)) continue;
    sum += value;
    count += 1;
  }
  return count ? sum / count : null;
}

function utcDay(timestamp) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

export function createSignalReader(candles, config) {
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume || 0);
  const atrValues = atr(candles, 14);
  const model = config.signalModel;
  const paramA = config.paramA;
  const paramB = config.paramB;
  const fast = model === 'ema' ? ema(closes, Math.max(2, Math.round(paramA))) : null;
  const slow = model === 'ema' ? ema(closes, Math.max(3, Math.round(paramB))) : null;
  const rsiValues = model === 'rsi' ? rsi(closes, 14) : null;

  function allowed(side) {
    return config.direction === 'both' || config.direction === side.toLowerCase();
  }

  function signalAt(i) {
    if (i < 2) return null;
    if (model === 'ema') {
      if (!Number.isFinite(fast[i - 1]) || !Number.isFinite(slow[i - 1]) || !Number.isFinite(fast[i]) || !Number.isFinite(slow[i])) return null;
      if (fast[i - 1] <= slow[i - 1] && fast[i] > slow[i] && allowed('Long')) return 'Long';
      if (fast[i - 1] >= slow[i - 1] && fast[i] < slow[i] && allowed('Short')) return 'Short';
      return null;
    }
    if (model === 'rsi') {
      const low = clamp(paramA, 5, 50);
      const high = clamp(paramB, 50, 95);
      if (!Number.isFinite(rsiValues[i - 1]) || !Number.isFinite(rsiValues[i])) return null;
      if (rsiValues[i - 1] < low && rsiValues[i] >= low && allowed('Long')) return 'Long';
      if (rsiValues[i - 1] > high && rsiValues[i] <= high && allowed('Short')) return 'Short';
      return null;
    }
    const lookback = Math.max(3, Math.round(paramA));
    if (i < lookback) return null;
    const start = i - lookback;
    let maxHigh = -Infinity;
    let minLow = Infinity;
    for (let j = start; j < i; j += 1) {
      maxHigh = Math.max(maxHigh, candles[j].high);
      minLow = Math.min(minLow, candles[j].low);
    }
    const avgVolume = average(volumes, start, i - 1);
    const volumeOk = avgVolume === null || avgVolume <= 0 || candles[i].volume >= avgVolume * Math.max(0, paramB);
    if (volumeOk && candles[i].close > maxHigh && allowed('Long')) return 'Long';
    if (volumeOk && candles[i].close < minLow && allowed('Short')) return 'Short';
    return null;
  }

  return { signalAt, atrValues };
}

// A known opening price precedes the unknown intrabar path. Favorable gaps
// receive no improvement over the target; adverse gaps use the actual open.
export function manualExitFill(position, candle) {
  const long = position.side === 'Long';
  if (long ? candle.open <= position.stop : candle.open >= position.stop) {
    return { price: candle.open, reason: candle.open === position.stop ? 'Stop à l’ouverture' : 'Gap au stop' };
  }
  if (long ? candle.open >= position.target : candle.open <= position.target) {
    return { price: position.target, reason: 'Target à l’ouverture' };
  }
  const stopHit = long ? candle.low <= position.stop : candle.high >= position.stop;
  const targetHit = long ? candle.high >= position.target : candle.low <= position.target;
  if (stopHit) return { price: position.stop, reason: targetHit ? 'Stop prioritaire' : 'Stop' };
  if (targetHit) return { price: position.target, reason: 'Target' };
  return null;
}

// Every segment starts flat with fresh daily counters. Past candles may warm
// indicators, but no pending signal or position may cross its start/end.
export function simulateManualSegment(candles, config, reader, { start, end, validation }) {
  const trades = [];
  let pending = null, position = null, day = null;
  let entries = 0, realizedR = 0, consecutiveLosses = 0, blocked = false;
  const canEnter = () => entries < config.maxTrades && realizedR > -config.maxDailyLoss && !blocked;

  function closePosition(exitPrice, candle, reason, index) {
    const sign = position.side === 'Long' ? 1 : -1;
    const resultR = sign * (exitPrice - position.entry) / position.riskDistance - config.costR;
    trades.push({ side: position.side, entry: position.entry, exit: exitPrice,
      resultR, reason, entryTime: position.entryTime, exitTime: candle.time,
      entryIndex: position.entryIndex, exitIndex: index, validation });
    realizedR += resultR;
    consecutiveLosses = resultR < 0 ? consecutiveLosses + 1 : 0;
    if (consecutiveLosses >= config.lossStreak) blocked = true;
    position = null;
  }

  for (let i = start; i < end; i += 1) {
    const candle = candles[i], currentDay = utcDay(candle.time);
    if (day !== currentDay) {
      day = currentDay;
      entries = 0; realizedR = 0; consecutiveLosses = 0; blocked = false;
    }
    if (!position && pending) {
      const atrValue = reader.atrValues[pending.signalIndex];
      if (canEnter() && Number.isFinite(atrValue) && atrValue > 0) {
        const entry = candle.open, riskDistance = atrValue * config.atrMultiple;
        const sign = pending.side === 'Long' ? 1 : -1;
        const stop = entry - sign * riskDistance, target = entry + sign * riskDistance * config.rr;
        if (![riskDistance, stop, target].every(n => Number.isFinite(n) && n > 0)) {
          throw new Error('Stop ou objectif invalide : vérifie les prix et les paramètres.');
        }
        position = { side: pending.side, entry, stop, target, riskDistance,
          entryTime: candle.time, entryIndex: i };
        entries += 1;
      }
      pending = null;
    }
    if (position) {
      const fill = manualExitFill(position, candle);
      if (fill) closePosition(fill.price, candle, fill.reason, i);
    }
    if (!position && !pending && canEnter() && i < end - 1) {
      const side = reader.signalAt(i);
      if (side) pending = { side, signalIndex: i };
    }
  }
  if (position) {
    const last = candles[end - 1];
    closePosition(last.close, last, validation ? 'Fin des données' : 'Fin du développement', end - 1);
  }
  return trades;
}

export function backtest(candles, config) {
  if (!Array.isArray(candles) || candles.length < 60) throw new Error('Pas assez de bougies pour le test manuel.');
  let previous = -Infinity;
  for (const candle of candles) {
    if (!Number.isSafeInteger(candle.time) || candle.time <= previous ||
        ![candle.open, candle.high, candle.low, candle.close].every(n => Number.isFinite(n) && n > 0) ||
        candle.low > Math.min(candle.open, candle.close) || candle.high < Math.max(candle.open, candle.close) ||
        candle.low > candle.high || !Number.isFinite(candle.volume) || candle.volume < 0) {
      throw new Error('Historique invalide : bougies incohérentes, dupliquées ou non chronologiques.');
    }
    previous = candle.time;
  }
  if (!['ema', 'rsi', 'breakout'].includes(config.signalModel) ||
      !['both', 'long', 'short'].includes(config.direction) ||
      !['paramA', 'paramB', 'atrMultiple', 'rr', 'maxTrades', 'maxDailyLoss', 'lossStreak'].every(k => Number.isFinite(config[k]) && config[k] > 0) ||
      !Number.isFinite(config.costR) || config.costR < 0 ||
      !Number.isInteger(config.maxTrades) || !Number.isInteger(config.lossStreak)) {
    throw new Error('Paramètres du test manuel invalides.');
  }
  const warmup = Math.max(30, config.signalModel === 'ema'
    ? Math.round(Math.max(config.paramA, config.paramB)) + 5 : Math.round(config.paramA) + 5);
  const splitIndex = Math.floor(candles.length * 0.70);
  if (warmup >= splitIndex - 1) throw new Error('Pas assez de bougies après la préparation des indicateurs pour séparer les deux périodes.');
  const reader = createSignalReader(candles, config);
  const train = simulateManualSegment(candles, config, reader, { start: warmup, end: splitIndex, validation: false });
  const validation = simulateManualSegment(candles, config, reader, { start: splitIndex, end: candles.length, validation: true });
  return { trades: [...train, ...validation], splitIndex };
}
