(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const fmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  const GAME = {
    asset: 'SPY',
    interval: '15m',
    fast: 9,
    slow: 21,
    emaTrend: 200,
    adxPeriod: 14,
    adxMin: 22,
    volumeLookback: 20,
    volumeFactor: 1.0,
    atrPeriod: 14,
    atrMultiple: 1.25,
    rr: 1.5,
    costR: 0.05,
    maxTrades: 3,
    maxDailyLoss: 2,
    lossStreak: 2,
    htfFactor: 4,
    htfFast: 20,
    htfSlow: 50
  };

  const state = { running: false };

  function addStyles() {
    if (document.querySelector('link[href="./lab-filtered.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './lab-filtered.css';
    document.head.appendChild(link);
  }

  function mountUi() {
    const anchor = byId('legacyGame02') || byId('backtestResults');
    if (!anchor || byId('filteredGame')) return;
    const section = document.createElement('section');
    section.className = 'panel filtered-game';
    section.id = 'filteredGame';
    section.innerHTML = `
      <div class="panel-heading filtered-head">
        <div><p class="panel-kicker">JEU 02 · FILTERED TREND</p><h3>Comparer simple vs filtré</h3></div>
        <span class="lab-status active" id="filteredStatus">PRÊT</span>
      </div>
      <div class="filtered-preset" aria-label="Paramètres du Jeu 02">
        <div><span>Signal</span><strong>EMA 9 / 21</strong></div>
        <div><span>Tendance</span><strong>EMA 200</strong></div>
        <div><span>Force</span><strong>ADX ≥ 22</strong></div>
        <div><span>Volume</span><strong>≥ moy. 20</strong></div>
        <div><span>HTF</span><strong>Confirmation 4×</strong></div>
        <div><span>Stop</span><strong>1,25 ATR</strong></div>
        <div><span>Target</span><strong>1,5 R</strong></div>
      </div>
      <div class="filtered-actions">
        <p>Le test lance deux versions sur exactement les mêmes bougies : EMA seule puis EMA + filtres. Le but est de vérifier si on enlève surtout les faux signaux, sans choisir les paramètres après avoir vu le résultat.</p>
        <button class="primary-button" type="button" id="runFilteredGame">Lancer le Jeu 02</button>
      </div>
      <div class="filtered-results is-collapsed" id="filteredResults">
        <div class="compare-grid">
          <article class="compare-card"><span>Win rate simple</span><strong id="fgBaseWin">—</strong><small>EMA 9/21 sans filtre</small></article>
          <article class="compare-card"><span>Win rate filtré</span><strong id="fgFilteredWin">—</strong><small id="fgWinDelta">Δ —</small></article>
          <article class="compare-card"><span>Expectancy filtrée</span><strong id="fgExpectancy">—</strong><small id="fgBaseExpectancy">simple —</small></article>
          <article class="compare-card"><span>Profit factor</span><strong id="fgProfitFactor">—</strong><small>après coût 0,05 R</small></article>
          <article class="compare-card"><span>Max drawdown</span><strong id="fgDrawdown">—</strong><small>filtré</small></article>
          <article class="compare-card"><span>Validation 30 %</span><strong id="fgValidation">—</strong><small id="fgValidationTrades">—</small></article>
        </div>
        <div class="filter-summary">
          <div class="filter-chip"><span>Signaux bruts</span><strong id="fgRawSignals">—</strong></div>
          <div class="filter-chip"><span>Rejet tendance</span><strong id="fgRejectTrend">—</strong></div>
          <div class="filter-chip"><span>Rejet ADX</span><strong id="fgRejectAdx">—</strong></div>
          <div class="filter-chip"><span>Rejet volume</span><strong id="fgRejectVolume">—</strong></div>
          <div class="filter-chip"><span>Rejet HTF</span><strong id="fgRejectHtf">—</strong></div>
        </div>
        <div class="filtered-lower">
          <div class="regime-table-wrap">
            <div class="regime-title"><strong>Regime Analyzer · EMA simple</strong><span>où les pertes apparaissent</span></div>
            <table class="regime-table"><thead><tr><th>Régime</th><th>Trades</th><th>Win</th><th>Exp.</th><th>R</th></tr></thead><tbody id="fgRegimeBody"></tbody></table>
          </div>
          <div class="paper-gate">
            <div class="paper-gate-head"><strong>Gate avant Paper Bot</strong><span class="lab-status off" id="fgGateBadge">PAS ENCORE</span></div>
            <div class="gate-list" id="fgGateList"></div>
            <p class="filtered-note" id="fgNote">Lance le Jeu 02 pour obtenir une comparaison et un verdict.</p>
          </div>
        </div>
      </div>`;
    if (anchor.id === 'legacyGame02') anchor.appendChild(section);
    else anchor.insertAdjacentElement('afterend', section);
    byId('runFilteredGame')?.addEventListener('click', runGame);
  }

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

  function sma(values, period) {
    const out = new Array(values.length).fill(null);
    let sum = 0;
    for (let i = 0; i < values.length; i += 1) {
      const value = Number(values[i]);
      sum += Number.isFinite(value) ? value : 0;
      if (i >= period) {
        const old = Number(values[i - period]);
        sum -= Number.isFinite(old) ? old : 0;
      }
      if (i >= period - 1) out[i] = sum / period;
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
      const prevClose = candles[i - 1].close;
      tr[i] = Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - prevClose), Math.abs(candles[i].low - prevClose));
    }
    const dx = new Array(candles.length).fill(null);
    const out = new Array(candles.length).fill(null);
    let smTr = 0, smPlus = 0, smMinus = 0, currentAdx = null;
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
      if (currentAdx === null) {
        if (i < period * 2 - 1) continue;
        let sum = 0, count = 0;
        for (let j = period; j <= i; j += 1) if (Number.isFinite(dx[j])) { sum += dx[j]; count += 1; }
        currentAdx = count ? sum / count : null;
      } else {
        currentAdx = ((currentAdx * (period - 1)) + dx[i]) / period;
      }
      out[i] = currentAdx;
    }
    return out;
  }

  function aggregateHtf(candles, baseSeconds, factor) {
    const bucketSeconds = baseSeconds * factor;
    const bars = [];
    let current = null;
    for (const candle of candles) {
      const bucket = Math.floor(candle.time / bucketSeconds) * bucketSeconds;
      if (!current || current.time !== bucket) {
        current = { time: bucket, open: candle.open, high: candle.high, low: candle.low, close: candle.close, volume: candle.volume || 0 };
        bars.push(current);
      } else {
        current.high = Math.max(current.high, candle.high);
        current.low = Math.min(current.low, candle.low);
        current.close = candle.close;
        current.volume += candle.volume || 0;
      }
    }
    return { bars, bucketSeconds };
  }

  function htfTrendMap(candles, interval) {
    const seconds = { '5m': 300, '15m': 900, '1h': 3600, '1d': 86400 }[interval] || 900;
    const { bars, bucketSeconds } = aggregateHtf(candles, seconds, GAME.htfFactor);
    const closes = bars.map(b => b.close);
    const fast = ema(closes, GAME.htfFast);
    const slow = ema(closes, GAME.htfSlow);
    const out = new Array(candles.length).fill(null);
    let h = 0;
    for (let i = 0; i < candles.length; i += 1) {
      while (h + 1 < bars.length && bars[h + 1].time + bucketSeconds <= candles[i].time) h += 1;
      const completed = bars[h] && bars[h].time + bucketSeconds <= candles[i].time ? h : h - 1;
      if (completed >= 0 && Number.isFinite(fast[completed]) && Number.isFinite(slow[completed])) {
        out[i] = fast[completed] > slow[completed] ? 'Long' : fast[completed] < slow[completed] ? 'Short' : null;
      }
    }
    return out;
  }

  function context(candles) {
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume || 0);
    const fast = ema(closes, GAME.fast);
    const slow = ema(closes, GAME.slow);
    const trend = ema(closes, GAME.emaTrend);
    const atrValues = atr(candles, GAME.atrPeriod);
    const adxValues = adx(candles, GAME.adxPeriod);
    const avgVolume = sma(volumes, GAME.volumeLookback);
    const atrPct = atrValues.map((value, i) => Number.isFinite(value) && candles[i].close ? value / candles[i].close : null);
    const avgAtrPct = sma(atrPct.map(v => Number.isFinite(v) ? v : 0), 50);
    const htf = htfTrendMap(candles, GAME.interval);
    return { fast, slow, trend, atrValues, adxValues, avgVolume, atrPct, avgAtrPct, htf };
  }

  function regimeAt(i, ctx) {
    const a = ctx.adxValues[i];
    const adxRegime = !Number.isFinite(a) ? 'Inconnu' : a >= 25 ? 'Tendance' : a < 20 ? 'Range' : 'Transition';
    const ratio = Number.isFinite(ctx.atrPct[i]) && Number.isFinite(ctx.avgAtrPct[i]) && ctx.avgAtrPct[i] > 0 ? ctx.atrPct[i] / ctx.avgAtrPct[i] : 1;
    const volRegime = ratio >= 1.25 ? 'Vol haute' : ratio <= 0.75 ? 'Vol basse' : 'Vol normale';
    return { adxRegime, volRegime };
  }

  function rawSignal(i, ctx) {
    if (i < 2 || ![ctx.fast[i - 1], ctx.slow[i - 1], ctx.fast[i], ctx.slow[i]].every(Number.isFinite)) return null;
    if (ctx.fast[i - 1] <= ctx.slow[i - 1] && ctx.fast[i] > ctx.slow[i]) return 'Long';
    if (ctx.fast[i - 1] >= ctx.slow[i - 1] && ctx.fast[i] < ctx.slow[i]) return 'Short';
    return null;
  }

  function filterSignal(i, side, candles, ctx, counters) {
    counters.raw += 1;
    const trendValue = ctx.trend[i];
    const slopeIndex = Math.max(0, i - 10);
    const trendSlope = Number.isFinite(ctx.trend[i]) && Number.isFinite(ctx.trend[slopeIndex]) ? ctx.trend[i] - ctx.trend[slopeIndex] : 0;
    const trendOk = Number.isFinite(trendValue) && (side === 'Long' ? candles[i].close > trendValue && trendSlope > 0 : candles[i].close < trendValue && trendSlope < 0);
    if (!trendOk) { counters.trend += 1; return false; }
    if (!Number.isFinite(ctx.adxValues[i]) || ctx.adxValues[i] < GAME.adxMin) { counters.adx += 1; return false; }
    const avgVol = ctx.avgVolume[i];
    if (Number.isFinite(avgVol) && avgVol > 0 && candles[i].volume < avgVol * GAME.volumeFactor) { counters.volume += 1; return false; }
    if (ctx.htf[i] !== side) { counters.htf += 1; return false; }
    counters.accepted += 1;
    return true;
  }

  function utcDay(timestamp) { return new Date(timestamp * 1000).toISOString().slice(0, 10); }

  function simulate(candles, filtered) {
    const ctx = context(candles);
    const counters = { raw: 0, trend: 0, adx: 0, volume: 0, htf: 0, accepted: 0 };
    const trades = [];
    const daily = new Map();
    const splitIndex = Math.floor(candles.length * 0.70);
    let pending = null, position = null, consecutiveLosses = 0, blockedDay = null;

    function dayState(day) {
      if (!daily.has(day)) daily.set(day, { trades: 0, realizedR: 0 });
      return daily.get(day);
    }

    function close(exit, candle, reason, index) {
      if (!position) return;
      const rawR = position.side === 'Long' ? (exit - position.entry) / position.riskDistance : (position.entry - exit) / position.riskDistance;
      const resultR = rawR - GAME.costR;
      trades.push({ ...position, exit, resultR, reason, exitTime: candle.time, exitIndex: index, validation: position.entryIndex >= splitIndex });
      dayState(utcDay(candle.time)).realizedR += resultR;
      consecutiveLosses = resultR < 0 ? consecutiveLosses + 1 : 0;
      if (consecutiveLosses >= GAME.lossStreak) blockedDay = utcDay(candle.time);
      position = null;
    }

    const warmup = 220;
    for (let i = warmup; i < candles.length; i += 1) {
      const candle = candles[i];
      const day = utcDay(candle.time);
      const d = dayState(day);
      if (blockedDay && blockedDay !== day) { blockedDay = null; consecutiveLosses = 0; }

      if (!position && pending) {
        const a = ctx.atrValues[pending.signalIndex];
        if (Number.isFinite(a) && a > 0 && d.trades < GAME.maxTrades && d.realizedR > -GAME.maxDailyLoss && blockedDay !== day) {
          const entry = candle.open;
          const riskDistance = a * GAME.atrMultiple;
          const stop = pending.side === 'Long' ? entry - riskDistance : entry + riskDistance;
          const target = pending.side === 'Long' ? entry + riskDistance * GAME.rr : entry - riskDistance * GAME.rr;
          const reg = regimeAt(pending.signalIndex, ctx);
          position = { side: pending.side, entry, stop, target, riskDistance, entryTime: candle.time, entryIndex: i, regime: reg.adxRegime, volRegime: reg.volRegime };
          d.trades += 1;
        }
        pending = null;
      }

      if (position) {
        const stopHit = position.side === 'Long' ? candle.low <= position.stop : candle.high >= position.stop;
        const targetHit = position.side === 'Long' ? candle.high >= position.target : candle.low <= position.target;
        if (stopHit && targetHit) close(position.stop, candle, 'Stop prioritaire', i);
        else if (stopHit) close(position.stop, candle, 'Stop', i);
        else if (targetHit) close(position.target, candle, 'Target', i);
      }

      if (!position && !pending && i < candles.length - 1 && d.trades < GAME.maxTrades && d.realizedR > -GAME.maxDailyLoss && blockedDay !== day) {
        const side = rawSignal(i, ctx);
        if (side) {
          if (!filtered) {
            counters.raw += 1; counters.accepted += 1;
            pending = { side, signalIndex: i };
          } else if (filterSignal(i, side, candles, ctx, counters)) {
            pending = { side, signalIndex: i };
          }
        }
      }
    }
    if (position) close(candles[candles.length - 1].close, candles[candles.length - 1], 'Fin données', candles.length - 1);
    return { trades, counters, splitIndex };
  }

  function metrics(trades) {
    const results = trades.map(t => t.resultR).filter(Number.isFinite);
    if (!results.length) return { count: 0, winRate: null, totalR: 0, expectancy: null, profitFactor: null, drawdown: 0, lossStreak: 0 };
    const wins = results.filter(r => r > 0);
    const losses = results.filter(r => r < 0);
    const totalR = results.reduce((a, b) => a + b, 0);
    const grossWin = wins.reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
    let equity = 0, peak = 0, drawdown = 0, streak = 0, maxStreak = 0;
    for (const r of results) {
      equity += r; peak = Math.max(peak, equity); drawdown = Math.max(drawdown, peak - equity);
      if (r < 0) { streak += 1; maxStreak = Math.max(maxStreak, streak); } else streak = 0;
    }
    return { count: results.length, winRate: wins.length / results.length, totalR, expectancy: totalR / results.length, profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : null, drawdown, lossStreak: maxStreak };
  }

  function formatR(value) { return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${fmt.format(value)} R` : value === Infinity ? '∞' : '—'; }
  function formatPf(value) { return value === Infinity ? '∞' : Number.isFinite(value) ? fmt.format(value) : '—'; }

  function groupRegimes(trades) {
    const map = new Map();
    for (const trade of trades) {
      const key = `${trade.regime} · ${trade.volRegime}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(trade);
    }
    return [...map.entries()].map(([name, rows]) => ({ name, ...metrics(rows) })).sort((a, b) => b.count - a.count);
  }

  function renderRegimes(trades) {
    const body = byId('fgRegimeBody');
    body.replaceChildren();
    const groups = groupRegimes(trades);
    if (!groups.length) {
      const row = document.createElement('tr'); row.innerHTML = '<td colspan="5">Pas assez de trades.</td>'; body.appendChild(row); return;
    }
    groups.slice(0, 6).forEach(group => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${group.name}</td><td>${group.count}</td><td>${group.winRate === null ? '—' : `${pct.format(group.winRate * 100)} %`}</td><td class="${group.expectancy > 0 ? 'metric-positive' : group.expectancy < 0 ? 'metric-negative' : ''}">${formatR(group.expectancy)}</td><td>${formatR(group.totalR)}</td>`;
      body.appendChild(row);
    });
  }

  function gateRow(label, ok, detail) {
    return `<div class="gate-item ${ok ? 'gate-ok' : 'gate-no'}"><span>${label}</span><b>${ok ? 'OK' : 'À renforcer'} · ${detail}</b></div>`;
  }

  function renderGate(all, validation, filtered) {
    const checks = [
      ['Échantillon total', all.count >= 40, `${all.count} trades`],
      ['Validation hors échantillon', validation.count >= 12, `${validation.count} trades`],
      ['Expectancy globale', all.expectancy > 0, formatR(all.expectancy)],
      ['Expectancy validation', validation.expectancy > 0, formatR(validation.expectancy)],
      ['Profit factor', Number.isFinite(all.profitFactor) && all.profitFactor >= 1.1, formatPf(all.profitFactor)],
      ['Drawdown', all.drawdown <= 8, `-${fmt.format(all.drawdown)} R`]
    ];
    byId('fgGateList').innerHTML = checks.map(c => gateRow(c[0], c[1], c[2])).join('');
    const passed = checks.every(c => c[1]);
    const badge = byId('fgGateBadge');
    badge.className = `lab-status ${passed ? 'active' : 'off'}`;
    badge.textContent = passed ? 'CANDIDAT PAPER' : 'PAS ENCORE';
    byId('fgNote').textContent = passed
      ? 'Le preset franchit les critères minimums de cette V1. Étape suivante : Paper Bot en argent fictif, pas de broker réel.'
      : 'On ne passe pas encore au Paper Bot. Le résultat sert à identifier le filtre ou le régime à retravailler, sans optimiser à l’aveugle sur ce même échantillon.';
    return passed;
  }

  function render(base, filtered) {
    const b = metrics(base.trades);
    const f = metrics(filtered.trades);
    const validationTrades = filtered.trades.filter(t => t.validation);
    const v = metrics(validationTrades);
    byId('fgBaseWin').textContent = b.winRate === null ? '—' : `${pct.format(b.winRate * 100)} %`;
    byId('fgFilteredWin').textContent = f.winRate === null ? '—' : `${pct.format(f.winRate * 100)} %`;
    const delta = b.winRate !== null && f.winRate !== null ? (f.winRate - b.winRate) * 100 : null;
    const deltaEl = byId('fgWinDelta');
    deltaEl.textContent = delta === null ? 'Δ —' : `Δ ${delta >= 0 ? '+' : ''}${pct.format(delta)} pts`;
    deltaEl.className = delta > 0 ? 'comparison-positive' : delta < 0 ? 'comparison-negative' : '';
    byId('fgExpectancy').textContent = formatR(f.expectancy);
    byId('fgBaseExpectancy').textContent = `simple ${formatR(b.expectancy)}`;
    byId('fgProfitFactor').textContent = formatPf(f.profitFactor);
    byId('fgDrawdown').textContent = f.count ? `-${fmt.format(f.drawdown)} R` : '—';
    byId('fgValidation').textContent = v.count ? formatR(v.expectancy) : '—';
    byId('fgValidationTrades').textContent = `${v.count} trades · ${formatR(v.totalR)}`;
    byId('fgRawSignals').textContent = filtered.counters.raw;
    byId('fgRejectTrend').textContent = filtered.counters.trend;
    byId('fgRejectAdx').textContent = filtered.counters.adx;
    byId('fgRejectVolume').textContent = filtered.counters.volume;
    byId('fgRejectHtf').textContent = filtered.counters.htf;
    renderRegimes(base.trades);
    renderGate(f, v, filtered);
    byId('filteredResults').classList.remove('is-collapsed');
  }

  function dateDaysAgo(days) {
    const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10);
  }

  function applyPresetToForm() {
    const values = {
      strategyName: 'Jeu 02 · Trend Filtered', strategyAsset: 'SPY', strategyTimeframe: '15m', strategyDirection: 'both', signalModel: 'ema', signalParamA: '9', signalParamB: '21', atrMultiple: '1.25', strategyRisk: '1', strategyRR: '1.5', maxTrades: '3', maxDailyLoss: '2', lossStreak: '2', costPerTradeR: '0.05'
    };
    Object.entries(values).forEach(([id, value]) => { const el = byId(id); if (el) { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); } });
    const date = byId('backtestDate'); if (date) date.value = dateDaysAgo(44);
  }

  async function runGame() {
    if (state.running) return;
    state.running = true;
    const button = byId('runFilteredGame');
    const status = byId('filteredStatus');
    const note = byId('fgNote');
    applyPresetToForm();
    button.disabled = true; button.textContent = 'Calcul…';
    status.textContent = 'TEST EN COURS'; status.className = 'lab-status planned';
    byId('filteredResults').classList.remove('is-collapsed');
    note.className = 'filtered-note'; note.textContent = 'Chargement d’un historique plus large puis comparaison simple vs filtré sur les mêmes bougies…';
    try {
      const date = dateDaysAgo(44);
      const response = await fetch(`/api/replay?asset=${GAME.asset}&interval=${GAME.interval}&date=${date}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Historique indisponible.');
      const candles = Array.isArray(payload.candles) ? payload.candles.map(c => ({ time: Number(c.time), open: Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close), volume: Number(c.volume || 0) })).filter(c => [c.time, c.open, c.high, c.low, c.close].every(Number.isFinite)).sort((a, b) => a.time - b.time) : [];
      if (candles.length < 300) throw new Error(`Historique trop court (${candles.length} bougies).`);
      const baseline = simulate(candles, false);
      const filtered = simulate(candles, true);
      render(baseline, filtered);
      status.textContent = `${candles.length} BOUGIES`;
      status.className = 'lab-status active';
      note.textContent = `${candles.length} bougies · ${payload.source || 'source historique'} · comparaison faite sans changer les paramètres après lecture du résultat. Les 30 % finaux restent hors échantillon.`;
    } catch (error) {
      status.textContent = 'ERREUR'; status.className = 'lab-status off';
      note.textContent = error instanceof Error ? error.message : 'Impossible de terminer le Jeu 02.';
      note.className = 'filtered-note is-error';
    } finally {
      button.disabled = false; button.textContent = 'Relancer le Jeu 02'; state.running = false;
    }
  }

  addStyles();
  mountUi();
})();
