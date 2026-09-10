const VALID_SYMBOLS = new Set(['MNQ', 'MES', 'MYM', 'MGC']);

export function validateKronosForecastPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new TypeError('Kronos payload must be an object.');
  if (!VALID_SYMBOLS.has(payload.symbol)) throw new RangeError(`Unsupported symbol: ${payload.symbol}`);
  if (!Number.isFinite(payload.lastClose) || payload.lastClose <= 0) throw new RangeError('lastClose must be a positive number.');
  if (!Array.isArray(payload.forecast) || payload.forecast.length === 0) throw new RangeError('forecast must contain at least one row.');

  let previousTimestamp = null;
  for (const [index, row] of payload.forecast.entries()) {
    if (!row || typeof row !== 'object') throw new TypeError(`forecast[${index}] must be an object.`);
    for (const key of ['open', 'high', 'low', 'close']) {
      if (!Number.isFinite(row[key]) || row[key] <= 0) throw new RangeError(`forecast[${index}].${key} must be positive.`);
    }
    if (row.high < Math.max(row.open, row.close) || row.low > Math.min(row.open, row.close) || row.high < row.low) {
      throw new RangeError(`forecast[${index}] has invalid OHLC ordering.`);
    }
    const timestamp = Date.parse(row.timestamp);
    if (!Number.isFinite(timestamp)) throw new RangeError(`forecast[${index}].timestamp is invalid.`);
    if (previousTimestamp !== null && timestamp <= previousTimestamp) throw new RangeError('Forecast timestamps must be strictly increasing.');
    previousTimestamp = timestamp;
  }
  return payload;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function summarizeKronosForecast(payload) {
  validateKronosForecastPayload(payload);

  const closes = payload.forecast.map((row) => row.close);
  const terminalClose = closes.at(-1);
  const medianClose = median(closes);
  const terminalReturnBps = ((terminalClose / payload.lastClose) - 1) * 10_000;
  const medianReturnBps = ((medianClose / payload.lastClose) - 1) * 10_000;
  const above = closes.filter((value) => value > payload.lastClose).length;
  const below = closes.filter((value) => value < payload.lastClose).length;
  const directionalPersistence = (above - below) / closes.length;
  const pathHigh = Math.max(...payload.forecast.map((row) => row.high));
  const pathLow = Math.min(...payload.forecast.map((row) => row.low));
  const predictedRangeBps = ((pathHigh - pathLow) / payload.lastClose) * 10_000;

  let direction = 'neutral';
  if (terminalReturnBps > 0 && medianReturnBps > 0 && directionalPersistence > 0) direction = 'bullish';
  if (terminalReturnBps < 0 && medianReturnBps < 0 && directionalPersistence < 0) direction = 'bearish';

  return Object.freeze({
    provider: 'kronos-mini',
    role: 'observer-only',
    symbol: payload.symbol,
    horizonBars: closes.length,
    direction,
    terminalReturnBps,
    medianReturnBps,
    directionalPersistence,
    predictedRangeBps,
    executable: false,
    riskMultiplier: 1,
    note: 'Research feature only. It must be evaluated by ablation and cannot place orders or increase risk.'
  });
}

export function kronosAgreesWithCandidate(summary, candidateDirection) {
  if (!summary || summary.role !== 'observer-only') throw new TypeError('A Kronos observer summary is required.');
  if (!['long', 'short'].includes(candidateDirection)) throw new RangeError('candidateDirection must be long or short.');
  if (summary.direction === 'neutral') return false;
  return (candidateDirection === 'long' && summary.direction === 'bullish') ||
    (candidateDirection === 'short' && summary.direction === 'bearish');
}
