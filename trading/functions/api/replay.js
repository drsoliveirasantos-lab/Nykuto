const ASSETS = {
  SPY: { provider: 'yahoo', symbol: 'SPY', label: 'SPY · S&P 500 ETF' },
  QQQ: { provider: 'yahoo', symbol: 'QQQ', label: 'QQQ · Nasdaq 100 ETF' },
  GSPC: { provider: 'yahoo', symbol: '^GSPC', label: 'S&P 500' },
  IXIC: { provider: 'yahoo', symbol: '^IXIC', label: 'Nasdaq Composite' },
  AAPL: { provider: 'yahoo', symbol: 'AAPL', label: 'Apple' },
  NVDA: { provider: 'yahoo', symbol: 'NVDA', label: 'Nvidia' },
  TSLA: { provider: 'yahoo', symbol: 'TSLA', label: 'Tesla' },
  GOLD: { provider: 'yahoo', symbol: 'GC=F', label: 'Or · futures' },
  OIL: { provider: 'yahoo', symbol: 'CL=F', label: 'Pétrole WTI · futures' },
  BTCUSDT: { provider: 'binance', symbol: 'BTCUSDT', label: 'Bitcoin / USDT' },
  ETHUSDT: { provider: 'binance', symbol: 'ETHUSDT', label: 'Ethereum / USDT' },
  SOLUSDT: { provider: 'binance', symbol: 'SOLUSDT', label: 'Solana / USDT' }
};

const INTERVALS = {
  '1m': { yahoo: '1m', binance: '1m', lookbackDays: 2, futureDays: 7, binanceMs: 60_000 },
  '5m': { yahoo: '5m', binance: '5m', lookbackDays: 7, futureDays: 30, binanceMs: 300_000 },
  '15m': { yahoo: '15m', binance: '15m', lookbackDays: 10, futureDays: 45, binanceMs: 900_000 },
  '1h': { yahoo: '60m', binance: '1h', lookbackDays: 30, futureDays: 60, binanceMs: 3_600_000 },
  '1d': { yahoo: '1d', binance: '1d', lookbackDays: 400, futureDays: 730, binanceMs: 86_400_000 }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(`${value}T00:00:00Z`));
}

async function fetchBinance(asset, interval, replayStartMs) {
  const contextStart = Math.max(0, replayStartMs - interval.binanceMs * 200);
  const endpoint = new URL('https://api.binance.com/api/v3/klines');
  endpoint.searchParams.set('symbol', asset.symbol);
  endpoint.searchParams.set('interval', interval.binance);
  endpoint.searchParams.set('startTime', String(contextStart));
  endpoint.searchParams.set('limit', '1000');

  const response = await fetch(endpoint.toString(), { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Binance a refusé la requête historique (${response.status}).`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Réponse historique Binance invalide.');

  return rows.map(row => ({
    time: Math.floor(Number(row[0]) / 1000),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5] || 0)
  })).filter(candle => Number.isFinite(candle.time) && Number.isFinite(candle.open) && Number.isFinite(candle.high) && Number.isFinite(candle.low) && Number.isFinite(candle.close));
}

async function fetchYahooEndpoint(host, asset, interval, startSeconds, endSeconds) {
  const endpoint = new URL(`https://${host}/v8/finance/chart/${encodeURIComponent(asset.symbol)}`);
  endpoint.searchParams.set('period1', String(startSeconds));
  endpoint.searchParams.set('period2', String(endSeconds));
  endpoint.searchParams.set('interval', interval.yahoo);
  endpoint.searchParams.set('includePrePost', 'false');
  endpoint.searchParams.set('events', 'div,splits');

  return fetch(endpoint.toString(), {
    headers: {
      accept: 'application/json,text/plain,*/*',
      'user-agent': 'Mozilla/5.0 (compatible; NykutoTradingReplay/1.0)'
    }
  });
}

async function fetchYahoo(asset, interval, replayStartMs) {
  const replayStartSeconds = Math.floor(replayStartMs / 1000);
  const startSeconds = Math.max(0, replayStartSeconds - interval.lookbackDays * 86400);
  const requestedEnd = replayStartSeconds + interval.futureDays * 86400;
  const endSeconds = Math.min(requestedEnd, Math.floor(Date.now() / 1000) + 86400);
  let response = await fetchYahooEndpoint('query1.finance.yahoo.com', asset, interval, startSeconds, endSeconds);
  if (!response.ok) response = await fetchYahooEndpoint('query2.finance.yahoo.com', asset, interval, startSeconds, endSeconds);
  if (!response.ok) {
    if (response.status === 422) throw new Error('Cette période intraday n’est plus disponible gratuitement. Choisis une date plus récente ou un timeframe plus grand.');
    if (response.status === 429) throw new Error('La source gratuite US limite temporairement les requêtes. Réessaie dans quelques instants.');
    throw new Error(`Source historique US indisponible (${response.status}).`);
  }

  const payload = await response.json();
  const chart = payload?.chart;
  if (chart?.error) throw new Error(chart.error.description || 'Données historiques indisponibles.');
  const result = chart?.result?.[0];
  const timestamps = result?.timestamp;
  const quote = result?.indicators?.quote?.[0];
  if (!Array.isArray(timestamps) || !quote) throw new Error('Aucun chandelier disponible pour cette période.');

  const candles = [];
  for (let index = 0; index < timestamps.length; index += 1) {
    const candle = {
      time: Number(timestamps[index]),
      open: Number(quote.open?.[index]),
      high: Number(quote.high?.[index]),
      low: Number(quote.low?.[index]),
      close: Number(quote.close?.[index]),
      volume: Number(quote.volume?.[index] || 0)
    };
    if (Number.isFinite(candle.time) && Number.isFinite(candle.open) && Number.isFinite(candle.high) && Number.isFinite(candle.low) && Number.isFinite(candle.close)) candles.push(candle);
  }
  return candles.slice(0, 4000);
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const assetKey = (url.searchParams.get('asset') || '').toUpperCase();
  const intervalKey = url.searchParams.get('interval') || '';
  const date = url.searchParams.get('date') || '';
  const asset = ASSETS[assetKey];
  const interval = INTERVALS[intervalKey];

  if (!asset) return json({ error: 'Actif non pris en charge par le Replay.' }, 400);
  if (!interval) return json({ error: 'Timeframe non pris en charge par le Replay.' }, 400);
  if (!validDate(date)) return json({ error: 'Date invalide.' }, 400);
  const replayStartMs = Date.parse(`${date}T00:00:00Z`);
  if (replayStartMs > Date.now()) return json({ error: 'La date doit être dans le passé.' }, 400);

  try {
    const candles = asset.provider === 'binance'
      ? await fetchBinance(asset, interval, replayStartMs)
      : await fetchYahoo(asset, interval, replayStartMs);

    if (candles.length < 3) return json({ error: 'Pas assez de chandeliers pour cette période.' }, 404);
    return json({
      asset: assetKey,
      label: asset.label,
      interval: intervalKey,
      replayStartTime: Math.floor(replayStartMs / 1000),
      source: asset.provider === 'binance' ? 'Binance public market data' : 'flux public US (Yahoo Finance)',
      candles
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Impossible de charger les données historiques.' }, 502);
  }
}