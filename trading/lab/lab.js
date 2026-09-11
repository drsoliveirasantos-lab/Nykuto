(async () => {
  'use strict';
  await window.Nykuto.ready;

  const KEY = 'nykuto-trading-strategy-lab-v1';
  const SETTINGS = 'nykuto-trading-settings-v1';
  const byId = id => document.getElementById(id);
  const safe = (value, fallback) => { try { return JSON.parse(value) ?? fallback; } catch { return fallback; } };
  const finite = value => value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const money = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
  const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const percent = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  const tradeDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const fields = [
    'strategyName', 'strategyAsset', 'strategyTimeframe', 'strategyDirection', 'signalModel',
    'signalParamA', 'signalParamB', 'atrMultiple', 'strategyRisk', 'strategyRR', 'maxTrades',
    'maxDailyLoss', 'lossStreak', 'entryRule', 'exitRule', 'costPerTradeR'
  ];

  const defaults = {
    strategyName: 'Stratégie test 01',
    strategyAsset: 'SPY',
    strategyTimeframe: '15m',
    strategyDirection: 'both',
    signalModel: 'ema',
    signalParamA: '9',
    signalParamB: '21',
    atrMultiple: '1.5',
    strategyRisk: '1',
    strategyRR: '2',
    maxTrades: '5',
    maxDailyLoss: '3',
    lossStreak: '3',
    entryRule: '',
    exitRule: '',
    costPerTradeR: '0.05'
  };

  const modelDefaults = {
    ema: { a: 9, b: 21, labelA: 'EMA rapide', labelB: 'EMA lente', explanation: 'Croisement des moyennes à la clôture ; entrée à l’ouverture de la bougie suivante.' },
    rsi: { a: 30, b: 70, labelA: 'RSI bas', labelB: 'RSI haut', explanation: 'Entrée quand le RSI réintègre sa zone normale après un excès ; entrée à la bougie suivante.' },
    breakout: { a: 20, b: 1.2, labelA: 'Lookback', labelB: 'Volume min × moy.', explanation: 'Cassure du plus haut/bas récent confirmée par le volume ; entrée à la bougie suivante.' }
  };

  function snapshot() {
    const data = {};
    fields.forEach(id => {
      const element = byId(id);
      if (element) data[id] = element.value;
    });
    return data;
  }

  function persist() {
    return window.Nykuto.set(KEY, snapshot());
  }

  function savedCapital() {
    const settings = window.Nykuto.read(SETTINGS, {});
    const capital = finite(settings.capital);
    return capital !== null && capital > 0 ? capital : 1000;
  }

  function renderRisk() {
    const capital = savedCapital();
    const risk = finite(byId('strategyRisk')?.value) ?? 1;
    const maxDaily = finite(byId('maxDailyLoss')?.value) ?? 3;
    byId('labCapital').textContent = money.format(capital);
    byId('labRiskAmount').textContent = money.format(capital * (risk / 100));
    byId('labDailyLoss').textContent = money.format(capital * (risk / 100) * maxDaily);
  }

  function syncModelUi(resetValues = false) {
    const model = byId('signalModel')?.value || 'ema';
    const meta = modelDefaults[model] || modelDefaults.ema;
    byId('paramALabel').textContent = meta.labelA;
    byId('paramBLabel').textContent = meta.labelB;
    byId('modelExplanation').textContent = meta.explanation;
    if (resetValues) {
      byId('signalParamA').value = String(meta.a);
      byId('signalParamB').value = String(meta.b);
    }
  }

  function suggestedDate() {
    const timeframe = byId('strategyTimeframe')?.value || '15m';
    const days = timeframe === '1d' ? 365 : timeframe === '1h' ? 55 : timeframe === '5m' ? 10 : 24;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  function setSuggestedDate() {
    const input = byId('backtestDate');
    if (!input) return;
    input.max = new Date().toISOString().slice(0, 10);
    input.value = suggestedDate();
  }

  function load() {
    const saved = window.Nykuto.read(KEY, {});
    fields.forEach(id => {
      const element = byId(id);
      if (element) element.value = saved[id] ?? defaults[id] ?? '';
    });
    syncModelUi(false);
    renderRisk();
    setSuggestedDate();
  }

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

  function createSignalReader(candles, config) {
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

  function backtest(candles, config) {
    const { signalAt, atrValues } = createSignalReader(candles, config);
    const trades = [];
    const daily = new Map();
    const splitIndex = Math.floor(candles.length * 0.70);
    let pending = null;
    let position = null;
    let consecutiveLosses = 0;
    let blockedDay = null;

    function dayState(day) {
      if (!daily.has(day)) daily.set(day, { trades: 0, realizedR: 0 });
      return daily.get(day);
    }

    function closePosition(exitPrice, candle, reason, index) {
      if (!position) return;
      const rawR = position.side === 'Long'
        ? (exitPrice - position.entry) / position.riskDistance
        : (position.entry - exitPrice) / position.riskDistance;
      const resultR = rawR - config.costR;
      const trade = {
        side: position.side,
        entry: position.entry,
        exit: exitPrice,
        resultR,
        reason,
        entryTime: position.entryTime,
        exitTime: candle.time,
        entryIndex: position.entryIndex,
        exitIndex: index,
        validation: position.entryIndex >= splitIndex
      };
      trades.push(trade);
      const exitDay = utcDay(candle.time);
      dayState(exitDay).realizedR += resultR;
      if (resultR < 0) consecutiveLosses += 1; else consecutiveLosses = 0;
      if (consecutiveLosses >= config.lossStreak) blockedDay = exitDay;
      position = null;
    }

    const warmup = Math.max(30, config.signalModel === 'ema' ? Math.round(Math.max(config.paramA, config.paramB)) + 5 : Math.round(config.paramA) + 5);

    for (let i = warmup; i < candles.length; i += 1) {
      const candle = candles[i];
      const day = utcDay(candle.time);
      const state = dayState(day);
      if (blockedDay && blockedDay !== day) {
        blockedDay = null;
        consecutiveLosses = 0;
      }

      if (!position && pending) {
        const atrValue = atrValues[pending.signalIndex];
        const canEnter = Number.isFinite(atrValue) && atrValue > 0 && state.trades < config.maxTrades && state.realizedR > -config.maxDailyLoss && blockedDay !== day;
        if (canEnter) {
          const entry = candle.open;
          const riskDistance = atrValue * config.atrMultiple;
          const side = pending.side;
          const stop = side === 'Long' ? entry - riskDistance : entry + riskDistance;
          const target = side === 'Long' ? entry + riskDistance * config.rr : entry - riskDistance * config.rr;
          position = { side, entry, stop, target, riskDistance, entryTime: candle.time, entryIndex: i };
          state.trades += 1;
        }
        pending = null;
      }

      if (position) {
        const stopHit = position.side === 'Long' ? candle.low <= position.stop : candle.high >= position.stop;
        const targetHit = position.side === 'Long' ? candle.high >= position.target : candle.low <= position.target;
        if (stopHit && targetHit) closePosition(position.stop, candle, 'Stop prioritaire', i);
        else if (stopHit) closePosition(position.stop, candle, 'Stop', i);
        else if (targetHit) closePosition(position.target, candle, 'Target', i);
      }

      if (!position && !pending && i < candles.length - 1) {
        const currentState = dayState(day);
        if (currentState.trades < config.maxTrades && currentState.realizedR > -config.maxDailyLoss && blockedDay !== day) {
          const signal = signalAt(i);
          if (signal) pending = { side: signal, signalIndex: i };
        }
      }
    }

    if (position) {
      const last = candles[candles.length - 1];
      closePosition(last.close, last, 'Fin des données', candles.length - 1);
    }

    return { trades, splitIndex };
  }

  function metrics(trades) {
    if (!trades.length) return { count: 0, winRate: null, totalR: 0, expectancy: null, profitFactor: null, drawdown: 0, lossStreak: 0 };
    const results = trades.map(t => t.resultR).filter(Number.isFinite);
    const winners = results.filter(r => r > 0);
    const losers = results.filter(r => r < 0);
    const totalR = results.reduce((sum, r) => sum + r, 0);
    const grossWin = winners.reduce((sum, r) => sum + r, 0);
    const grossLoss = Math.abs(losers.reduce((sum, r) => sum + r, 0));
    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let currentLossStreak = 0;
    let maxLossStreak = 0;
    for (const r of results) {
      equity += r;
      peak = Math.max(peak, equity);
      maxDrawdown = Math.max(maxDrawdown, peak - equity);
      if (r < 0) {
        currentLossStreak += 1;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      } else {
        currentLossStreak = 0;
      }
    }
    return {
      count: results.length,
      winRate: results.length ? winners.length / results.length : null,
      totalR,
      expectancy: results.length ? totalR / results.length : null,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? Infinity : null),
      drawdown: maxDrawdown,
      lossStreak: maxLossStreak
    };
  }

  function formatR(value) {
    if (!Number.isFinite(value)) return value === Infinity ? '∞' : '—';
    return `${value > 0 ? '+' : ''}${number.format(value)} R`;
  }

  function formatMetric(value) {
    return Number.isFinite(value) ? number.format(value) : value === Infinity ? '∞' : '—';
  }

  function renderTradeLog(trades) {
    const body = byId('backtestTradesBody');
    body.replaceChildren();
    if (!trades.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.textContent = 'Aucun trade généré avec ces paramètres.';
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }
    trades.slice(-8).reverse().forEach(trade => {
      const row = document.createElement('tr');
      const values = [
        tradeDate.format(new Date(trade.entryTime * 1000)),
        trade.side,
        number.format(trade.entry),
        number.format(trade.exit),
        formatR(trade.resultR),
        trade.reason
      ];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (index === 4) cell.className = trade.resultR > 0 ? 'metric-positive' : trade.resultR < 0 ? 'metric-negative' : '';
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  }

  function renderResults(payload, result) {
    const all = metrics(result.trades);
    const trainTrades = result.trades.filter(t => !t.validation);
    const validationTrades = result.trades.filter(t => t.validation);
    const train = metrics(trainTrades);
    const validation = metrics(validationTrades);

    byId('resultsTitle').textContent = `${payload.label || byId('strategyAsset').value} · ${byId('strategyTimeframe').value} · ${payload.candles.length} bougies`;
    byId('btTrades').textContent = String(all.count);
    byId('btWinRate').textContent = all.winRate === null ? '—' : `${percent.format(all.winRate * 100)} %`;
    byId('btTotalR').textContent = formatR(all.totalR);
    byId('btExpectancy').textContent = formatR(all.expectancy);
    byId('btProfitFactor').textContent = formatMetric(all.profitFactor);
    byId('btDrawdown').textContent = all.count ? `-${number.format(all.drawdown)} R` : '—';
    byId('btLossStreak').textContent = all.count ? `${all.lossStreak} perte${all.lossStreak > 1 ? 's' : ''}` : '—';
    byId('btValidationR').textContent = validation.count ? formatR(validation.totalR) : '—';
    byId('btTrainStats').textContent = train.count ? `${train.count} trades · ${formatR(train.expectancy)}/trade` : 'Pas assez de trades';
    byId('btValidationStats').textContent = validation.count ? `${validation.count} trades · ${formatR(validation.expectancy)}/trade` : 'Pas assez de trades';

    const sampleBadge = byId('sampleBadge');
    sampleBadge.className = 'lab-status';
    if (all.count >= 100) { sampleBadge.classList.add('active'); sampleBadge.textContent = `Échantillon ${all.count}`; }
    else if (all.count >= 30) { sampleBadge.classList.add('planned'); sampleBadge.textContent = `Échantillon ${all.count}`; }
    else { sampleBadge.classList.add('off'); sampleBadge.textContent = `Petit échantillon ${all.count}`; }

    const validationBadge = byId('validationBadge');
    validationBadge.className = 'lab-status';
    if (validation.count >= 10 && validation.expectancy > 0) {
      validationBadge.classList.add('active');
      validationBadge.textContent = 'Validation positive';
    } else if (validation.count >= 10) {
      validationBadge.classList.add('warning');
      validationBadge.textContent = 'Validation négative';
    } else {
      validationBadge.classList.add('off');
      validationBadge.textContent = 'Validation insuffisante';
    }

    let interpretation = 'Un backtest historique ne prouve pas qu’une stratégie gagnera en réel.';
    if (all.count < 30) interpretation = 'Échantillon trop petit pour tirer une conclusion. Élargis la période ou choisis des règles générant davantage d’occurrences.';
    else if (validation.count < 10) interpretation = 'Le segment de validation contient trop peu de trades. Le résultat hors échantillon reste fragile.';
    else if (train.expectancy > 0 && validation.expectancy <= 0) interpretation = 'La stratégie se dégrade sur les 30 % de validation : signal classique de sur-ajustement ou de manque de robustesse.';
    else if (train.expectancy > 0 && validation.expectancy > 0) interpretation = 'Expectancy positive sur développement et validation. C’est encourageant pour poursuivre les tests, mais ce n’est pas une garantie de rentabilité.';
    else interpretation = 'L’expectancy n’est pas positive de façon convaincante sur cet échantillon. Le Lab doit servir à rejeter les idées faibles, pas à les forcer à devenir rentables.';
    byId('btInterpretation').textContent = interpretation;

    renderTradeLog(result.trades);
  }

  function validateConfig() {
    const model = byId('signalModel').value;
    const paramA = finite(byId('signalParamA').value);
    const paramB = finite(byId('signalParamB').value);
    const atrMultiple = finite(byId('atrMultiple').value);
    const rr = finite(byId('strategyRR').value);
    const maxTrades = finite(byId('maxTrades').value);
    const maxDailyLoss = finite(byId('maxDailyLoss').value);
    const lossStreak = finite(byId('lossStreak').value);
    const costR = finite(byId('costPerTradeR').value);
    if ([paramA, paramB, atrMultiple, rr, maxTrades, maxDailyLoss, lossStreak, costR].some(value => value === null)) throw new Error('Complète tous les paramètres numériques du Lab.');
    if (model === 'ema' && paramA >= paramB) throw new Error('Pour le modèle EMA, la moyenne rapide doit être inférieure à la moyenne lente.');
    if (model === 'rsi' && (paramA >= paramB || paramA < 5 || paramB > 95)) throw new Error('Pour le RSI, utilise une zone basse inférieure à la zone haute.');
    return {
      signalModel: model,
      direction: byId('strategyDirection').value,
      paramA,
      paramB,
      atrMultiple: Math.max(0.25, atrMultiple),
      rr: Math.max(0.5, rr),
      maxTrades: Math.max(1, Math.round(maxTrades)),
      maxDailyLoss: Math.max(0.5, maxDailyLoss),
      lossStreak: Math.max(1, Math.round(lossStreak)),
      costR: Math.max(0, costR)
    };
  }

  async function runBacktest() {
    const button = byId('runBacktest');
    const note = byId('backtestNote');
    const asset = byId('strategyAsset').value;
    const interval = byId('strategyTimeframe').value;
    const date = byId('backtestDate').value;
    if (!date) return;

    let config;
    try {
      config = validateConfig();
    } catch (error) {
      note.textContent = error.message;
      note.className = 'backtest-note is-error';
      return;
    }

    button.disabled = true;
    button.textContent = 'Calcul…';
    note.textContent = 'Chargement de l’historique puis simulation sans regarder les bougies futures…';
    note.className = 'backtest-note';

    try {
      const response = await fetch(`/api/replay?asset=${encodeURIComponent(asset)}&interval=${encodeURIComponent(interval)}&date=${encodeURIComponent(date)}`, {
        headers: { Accept: 'application/json' }, credentials: 'same-origin'
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Historique indisponible.');
      const candles = Array.isArray(payload.candles) ? payload.candles.map(item => ({
        time: Number(item.time), open: Number(item.open), high: Number(item.high), low: Number(item.low), close: Number(item.close), volume: Number(item.volume || 0)
      })).filter(c => [c.time, c.open, c.high, c.low, c.close].every(Number.isFinite)).sort((a, b) => a.time - b.time) : [];
      if (candles.length < 60) throw new Error('Pas assez de bougies pour un backtest exploitable avec ces paramètres.');
      payload.candles = candles;
      const result = backtest(candles, config);
      renderResults(payload, result);
      note.textContent = `${candles.length} bougies · ${payload.source || 'source historique'} · ${result.trades.length} trades simulés. Les 30 % finaux sont gardés comme validation temporelle.`;
      note.className = 'backtest-note is-success';
    } catch (error) {
      note.textContent = error instanceof Error ? error.message : 'Impossible de terminer le backtest.';
      note.className = 'backtest-note is-error';
    } finally {
      button.disabled = false;
      button.textContent = 'Lancer';
    }
  }

  byId('strategyForm')?.addEventListener('input', renderRisk);
  byId('strategyForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    try { await persist(); } catch (error) { window.Nykuto.status(error.message); return; }
    const state = byId('saveState');
    state.textContent = 'Enregistré';
    setTimeout(() => { state.textContent = 'Mon compte'; }, 1400);
  });
  byId('resetStrategy')?.addEventListener('click', async () => {
    try { await window.Nykuto.set(KEY, {}); } catch (error) { window.Nykuto.status(error.message); return; }
    Object.entries(defaults).forEach(([id, value]) => {
      const element = byId(id);
      if (element) element.value = value;
    });
    syncModelUi(false);
    renderRisk();
    setSuggestedDate();
  });
  byId('signalModel')?.addEventListener('change', () => syncModelUi(true));
  byId('strategyTimeframe')?.addEventListener('change', setSuggestedDate);
  byId('runBacktest')?.addEventListener('click', runBacktest);

  load();
})().catch(error => window.Nykuto.status(error.message));
