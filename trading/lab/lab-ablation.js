(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const fmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

  const TEST = {
    asset: 'SPY', interval: '15m', startDate: '2026-07-25',
    fast: 9, slow: 21, emaTrend: 200,
    adxPeriod: 14, noRangeMin: 20, fullAdxMin: 22,
    volumeLookback: 20, volumeFactor: 1.0,
    atrPeriod: 14, atrMultiple: 1.25, rr: 1.5, costR: 0.05,
    maxTrades: 3, maxDailyLoss: 2, lossStreak: 2,
    htfFactor: 4, htfFast: 20, htfSlow: 50
  };

  const VARIANTS = [
    { id: 'baseline', name: 'A · Baseline', short: 'EMA seule', filters: [] },
    { id: 'noRange', name: 'B · No-range', short: 'ADX ≥ 20', filters: ['noRange'] },
    { id: 'ema200', name: 'C · EMA200', short: 'Tendance seule', filters: ['ema200'] },
    { id: 'volume', name: 'D · Volume', short: 'Volume seul', filters: ['volume'] },
    { id: 'htf', name: 'E · HTF', short: 'HTF seul', filters: ['htf'] },
    { id: 'noRangeEma', name: 'F · No-range + EMA200', short: 'Léger tendance', filters: ['noRange', 'ema200'] },
    { id: 'noRangeVol', name: 'G · No-range + Volume', short: 'Léger participation', filters: ['noRange', 'volume'] },
    { id: 'full', name: 'H · Full Filtered', short: 'Jeu 02', filters: ['ema200', 'fullAdx', 'volume', 'htf'] }
  ];

  function addStyles() {
    if (document.querySelector('link[href="./lab-ablation.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './lab-ablation.css?v=1';
    document.head.appendChild(link);
  }

  function mount() {
    const anchor = byId('legacyGame03') || byId('filteredGame') || document.querySelector('.future-grid');
    if (!anchor || byId('ablationGame')) return;
    const section = document.createElement('section');
    section.className = 'panel ablation-game';
    section.id = 'ablationGame';
    section.innerHTML = `
      <div class="panel-heading ablation-head">
        <div><p class="panel-kicker">JEU 03 · FILTER DIAGNOSIS</p><h3>Ablation + régime sélectif</h3></div>
        <span class="lab-status active" id="ablationStatus">PRÊT</span>
      </div>
      <div class="ablation-intro">
        <p>On garde exactement le même signal EMA 9/21, le même stop 1,25 ATR et le même objectif 1,5R. Seuls les filtres changent. Le test sert à identifier ce qui aide vraiment au lieu d'empiler les filtres.</p>
        <button class="primary-button" id="runAblation" type="button">Lancer le Jeu 03</button>
      </div>
      <div class="ablation-meta">
        <span>SPY · 15m</span><span>Fenêtre figée : 25/07 → 08/09/2026</span><span>70 % dev / 30 % validation</span><span>Coût 0,05R/trade</span>
      </div>
      <div class="ablation-results is-collapsed" id="ablationResults">
        <div class="ablation-summary">
          <article><span>Meilleur diagnostic</span><strong id="ablationBest">—</strong><small id="ablationBestNote">—</small></article>
          <article><span>Baseline</span><strong id="ablationBaseline">—</strong><small>référence</small></article>
          <article><span>Validation meilleure</span><strong id="ablationValidation">—</strong><small>hors échantillon</small></article>
          <article><span>Verdict</span><strong id="ablationVerdict">—</strong><small id="ablationVerdictNote">—</small></article>
        </div>
        <div class="ablation-table-wrap">
          <table class="ablation-table">
            <thead><tr><th>Variante</th><th>Trades</th><th>Win</th><th>Exp.</th><th>PF</th><th>DD</th><th>Val. trades</th><th>Val. exp.</th><th>Lecture</th></tr></thead>
            <tbody id="ablationBody"></tbody>
          </table>
        </div>
        <div class="ablation-lower">
          <div class="ablation-diagnosis">
            <strong>Diagnostic automatique</strong>
            <div id="ablationDiagnosis"></div>
          </div>
          <div class="ablation-next">
            <div class="paper-gate-head"><strong>Candidat Jeu 04</strong><span class="lab-status off" id="ablationCandidateBadge">AUCUN</span></div>
            <p id="ablationCandidateText">Le Lab ne choisira un candidat que s'il conserve assez de trades et ne se dégrade pas sur la validation.</p>
          </div>
        </div>
      </div>`;
    if (anchor.id === 'legacyGame03') anchor.appendChild(section);
    else anchor.insertAdjacentElement('afterend', section);
    byId('runAblation')?.addEventListener('click', run);
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

  function htfMap(candles) {
    const baseSeconds = 900;
    const bucketSeconds = baseSeconds * TEST.htfFactor;
    const bars = [];
    let current = null;
    for (const candle of candles) {
      const bucket = Math.floor(candle.time / bucketSeconds) * bucketSeconds;
      if (!current || current.time !== bucket) {
        current = { time: bucket, close: candle.close };
        bars.push(current);
      } else current.close = candle.close;
    }
    const fast = ema(bars.map(b => b.close), TEST.htfFast);
    const slow = ema(bars.map(b => b.close), TEST.htfSlow);
    const out = new Array(candles.length).fill(null);
    let h = 0;
    for (let i = 0; i < candles.length; i += 1) {
      while (h + 1 < bars.length && bars[h + 1].time + bucketSeconds <= candles[i].time) h += 1;
      const completed = bars[h] && bars[h].time + bucketSeconds <= candles[i].time ? h : h - 1;
      if (completed >= 0 && Number.isFinite(fast[completed]) && Number.isFinite(slow[completed])) out[i] = fast[completed] > slow[completed] ? 'Long' : fast[completed] < slow[completed] ? 'Short' : null;
    }
    return out;
  }

  function buildContext(candles) {
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume || 0);
    return {
      fast: ema(closes, TEST.fast), slow: ema(closes, TEST.slow), trend: ema(closes, TEST.emaTrend),
      adx: adx(candles, TEST.adxPeriod), avgVolume: sma(volumes, TEST.volumeLookback),
      atr: atr(candles, TEST.atrPeriod), htf: htfMap(candles)
    };
  }

  function rawSignal(i, ctx) {
    if (i < 2 || ![ctx.fast[i - 1], ctx.slow[i - 1], ctx.fast[i], ctx.slow[i]].every(Number.isFinite)) return null;
    if (ctx.fast[i - 1] <= ctx.slow[i - 1] && ctx.fast[i] > ctx.slow[i]) return 'Long';
    if (ctx.fast[i - 1] >= ctx.slow[i - 1] && ctx.fast[i] < ctx.slow[i]) return 'Short';
    return null;
  }

  function filterPass(variant, side, i, candles, ctx) {
    for (const filter of variant.filters) {
      if (filter === 'noRange' && (!Number.isFinite(ctx.adx[i]) || ctx.adx[i] < TEST.noRangeMin)) return false;
      if (filter === 'fullAdx' && (!Number.isFinite(ctx.adx[i]) || ctx.adx[i] < TEST.fullAdxMin)) return false;
      if (filter === 'ema200') {
        const t = ctx.trend[i];
        const old = ctx.trend[Math.max(0, i - 10)];
        const slope = Number.isFinite(t) && Number.isFinite(old) ? t - old : 0;
        if (!Number.isFinite(t) || (side === 'Long' ? !(candles[i].close > t && slope > 0) : !(candles[i].close < t && slope < 0))) return false;
      }
      if (filter === 'volume') {
        const avg = ctx.avgVolume[i];
        if (Number.isFinite(avg) && avg > 0 && candles[i].volume < avg * TEST.volumeFactor) return false;
      }
      if (filter === 'htf' && ctx.htf[i] !== side) return false;
    }
    return true;
  }

  const utcDay = t => new Date(t * 1000).toISOString().slice(0, 10);

  function simulate(candles, ctx, variant) {
    const trades = [];
    const split = Math.floor(candles.length * 0.70);
    const daily = new Map();
    let pending = null, position = null, losses = 0, blockedDay = null;
    const dayState = day => { if (!daily.has(day)) daily.set(day, { trades: 0, r: 0 }); return daily.get(day); };

    const close = (price, candle, index, reason) => {
      const rawR = position.side === 'Long' ? (price - position.entry) / position.risk : (position.entry - price) / position.risk;
      const resultR = rawR - TEST.costR;
      trades.push({ side: position.side, resultR, validation: position.entryIndex >= split, reason });
      const state = dayState(utcDay(candle.time));
      state.r += resultR;
      losses = resultR < 0 ? losses + 1 : 0;
      if (losses >= TEST.lossStreak) blockedDay = utcDay(candle.time);
      position = null;
    };

    for (let i = 220; i < candles.length; i += 1) {
      const candle = candles[i];
      const day = utcDay(candle.time);
      const state = dayState(day);
      if (blockedDay && blockedDay !== day) { blockedDay = null; losses = 0; }

      if (!position && pending) {
        const risk = ctx.atr[pending.i] * TEST.atrMultiple;
        if (Number.isFinite(risk) && risk > 0 && state.trades < TEST.maxTrades && state.r > -TEST.maxDailyLoss && blockedDay !== day) {
          const entry = candle.open;
          position = {
            side: pending.side, entry, risk, entryIndex: i,
            stop: pending.side === 'Long' ? entry - risk : entry + risk,
            target: pending.side === 'Long' ? entry + risk * TEST.rr : entry - risk * TEST.rr
          };
          state.trades += 1;
        }
        pending = null;
      }

      if (position) {
        const stopHit = position.side === 'Long' ? candle.low <= position.stop : candle.high >= position.stop;
        const targetHit = position.side === 'Long' ? candle.high >= position.target : candle.low <= position.target;
        if (stopHit) close(position.stop, candle, i, targetHit ? 'Stop prioritaire' : 'Stop');
        else if (targetHit) close(position.target, candle, i, 'Target');
      }

      if (!position && !pending && i < candles.length - 1 && state.trades < TEST.maxTrades && state.r > -TEST.maxDailyLoss && blockedDay !== day) {
        const side = rawSignal(i, ctx);
        if (side && filterPass(variant, side, i, candles, ctx)) pending = { side, i };
      }
    }

    if (position) {
      const last = candles[candles.length - 1];
      close(last.close, last, candles.length - 1, 'Fin données');
    }
    return trades;
  }

  function metrics(trades) {
    const values = trades.map(t => t.resultR).filter(Number.isFinite);
    if (!values.length) return { count: 0, win: null, exp: null, pf: null, dd: 0, total: 0 };
    const wins = values.filter(v => v > 0);
    const losses = values.filter(v => v < 0);
    const total = values.reduce((a, b) => a + b, 0);
    const grossWin = wins.reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
    let equity = 0, peak = 0, dd = 0;
    for (const v of values) { equity += v; peak = Math.max(peak, equity); dd = Math.max(dd, peak - equity); }
    return { count: values.length, win: wins.length / values.length, exp: total / values.length, pf: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : null, dd, total };
  }

  function resultFor(candles, ctx, variant) {
    const trades = simulate(candles, ctx, variant);
    const all = metrics(trades);
    const validation = metrics(trades.filter(t => t.validation));
    return { variant, trades, all, validation };
  }

  const formatR = v => Number.isFinite(v) ? `${v > 0 ? '+' : ''}${fmt.format(v)} R` : '—';
  const formatPF = v => v === Infinity ? '∞' : Number.isFinite(v) ? fmt.format(v) : '—';

  function reading(result, baseline) {
    if (result.variant.id === 'baseline') return 'Référence';
    if (result.all.count < Math.max(5, baseline.all.count * 0.25)) return 'Trop sélectif';
    if (result.validation.count < 3) return 'Validation faible';
    if (result.all.exp > baseline.all.exp && result.validation.exp > 0) return 'Améliore';
    if (result.all.exp > 0 && result.validation.exp > 0) return 'Prometteur';
    if (result.all.exp <= 0) return 'Rejeter';
    return 'Neutre';
  }

  function score(result) {
    if (result.all.count < 8 || result.validation.count < 3 || !Number.isFinite(result.validation.exp)) return -Infinity;
    const pf = Number.isFinite(result.all.pf) ? Math.min(result.all.pf, 3) : 3;
    return result.validation.exp * 3 + result.all.exp * 2 + (pf - 1) - result.all.dd * 0.03 + Math.min(result.all.count, 50) * 0.005;
  }

  function render(results, candleCount) {
    const baseline = results[0];
    const body = byId('ablationBody');
    body.replaceChildren();
    for (const result of results) {
      const row = document.createElement('tr');
      const r = reading(result, baseline);
      const cells = [
        `${result.variant.name} · ${result.variant.short}`,
        String(result.all.count),
        result.all.win === null ? '—' : `${pct.format(result.all.win * 100)} %`,
        formatR(result.all.exp), formatPF(result.all.pf), `-${fmt.format(result.all.dd)} R`,
        String(result.validation.count), formatR(result.validation.exp), r
      ];
      cells.forEach((value, idx) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (idx === 3 || idx === 7) {
          const metric = idx === 3 ? result.all.exp : result.validation.exp;
          if (Number.isFinite(metric)) cell.className = metric > 0 ? 'metric-positive' : metric < 0 ? 'metric-negative' : '';
        }
        if (idx === 8) cell.className = `ablation-reading ${r === 'Améliore' || r === 'Prometteur' ? 'good' : r === 'Rejeter' ? 'bad' : ''}`;
        row.appendChild(cell);
      });
      body.appendChild(row);
    }

    const ranked = results.filter(r => r.variant.id !== 'baseline').map(r => ({ r, score: score(r) })).sort((a, b) => b.score - a.score);
    const best = ranked[0]?.score > -Infinity ? ranked[0].r : null;
    byId('ablationBaseline').textContent = `${pct.format((baseline.all.win || 0) * 100)} % · ${formatR(baseline.all.exp)}`;
    byId('ablationBest').textContent = best ? best.variant.name : 'Aucun';
    byId('ablationBestNote').textContent = best ? `${best.all.count} trades · val ${formatR(best.validation.exp)}` : 'échantillon insuffisant';

    const bestVal = results.filter(r => r.validation.count >= 3 && Number.isFinite(r.validation.exp)).sort((a, b) => b.validation.exp - a.validation.exp)[0];
    byId('ablationValidation').textContent = bestVal ? `${bestVal.variant.name} · ${formatR(bestVal.validation.exp)}` : 'Insuffisante';

    const diagnosis = [];
    const noRange = results.find(r => r.variant.id === 'noRange');
    const ema200 = results.find(r => r.variant.id === 'ema200');
    const volume = results.find(r => r.variant.id === 'volume');
    const htf = results.find(r => r.variant.id === 'htf');
    const full = results.find(r => r.variant.id === 'full');
    if (noRange && noRange.all.exp > baseline.all.exp) diagnosis.push('Le retrait des vrais ranges améliore l’expectancy : le bruit latéral est probablement une source de pertes.');
    else diagnosis.push('Le filtre no-range n’améliore pas clairement l’expectancy sur cette fenêtre.');
    if (ema200 && ema200.all.exp < baseline.all.exp) diagnosis.push('EMA200 seule dégrade le système : elle peut arriver trop tard ou supprimer des transitions utiles.');
    if (volume && volume.all.exp > baseline.all.exp) diagnosis.push('Le volume apporte une amélioration isolée sur cet échantillon.');
    if (htf && htf.all.exp < baseline.all.exp) diagnosis.push('La confirmation HTF semble trop restrictive ou trop retardée ici.');
    if (full && full.all.count < baseline.all.count * 0.35) diagnosis.push('Le stack complet reste trop sélectif : il supprime la majorité des occurrences.');
    byId('ablationDiagnosis').replaceChildren(...diagnosis.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));

    const candidate = best && best.all.count >= 15 && best.validation.count >= 5 && best.all.exp > 0 && best.validation.exp > 0 && (best.all.pf === Infinity || best.all.pf >= 1.05) && best.all.dd <= 8;
    const badge = byId('ablationCandidateBadge');
    badge.className = `lab-status ${candidate ? 'active' : 'off'}`;
    badge.textContent = candidate ? 'CANDIDAT' : 'AUCUN';
    byId('ablationCandidateText').textContent = candidate
      ? `${best.variant.name} est le candidat le plus robuste de ce diagnostic. On le retestera sur une nouvelle fenêtre avant tout Paper Bot.`
      : 'Aucune variante ne passe encore un filtre minimal de robustesse. On garde le Paper Bot désactivé et on élargit/retente sur une nouvelle fenêtre.';

    const verdict = candidate ? 'Candidat trouvé' : 'Encore diagnostic';
    byId('ablationVerdict').textContent = verdict;
    byId('ablationVerdictNote').textContent = `${candleCount} bougies · mêmes règles d’exécution pour toutes les lignes`;
  }

  async function run() {
    const button = byId('runAblation');
    const status = byId('ablationStatus');
    if (!button || button.disabled) return;
    button.disabled = true; button.textContent = 'Calcul…'; status.textContent = 'CALCUL';
    try {
      const response = await fetch(`/api/replay?asset=${TEST.asset}&interval=${TEST.interval}&date=${TEST.startDate}`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Historique indisponible.');
      const candles = (payload.candles || []).map(c => ({ time: Number(c.time), open: Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close), volume: Number(c.volume || 0) })).filter(c => [c.time, c.open, c.high, c.low, c.close].every(Number.isFinite)).sort((a, b) => a.time - b.time);
      if (candles.length < 500) throw new Error(`Seulement ${candles.length} bougies disponibles : historique insuffisant pour ce diagnostic.`);
      const ctx = buildContext(candles);
      const results = VARIANTS.map(v => resultFor(candles, ctx, v));
      render(results, candles.length);
      byId('ablationResults').classList.remove('is-collapsed');
      status.textContent = 'TERMINÉ';
      status.className = 'lab-status active';
      button.textContent = 'Relancer le Jeu 03';
    } catch (error) {
      status.textContent = 'ERREUR';
      status.className = 'lab-status warning';
      byId('ablationVerdict').textContent = 'Erreur';
      byId('ablationVerdictNote').textContent = error instanceof Error ? error.message : 'Impossible de lancer le diagnostic.';
      byId('ablationResults').classList.remove('is-collapsed');
      button.textContent = 'Réessayer';
    } finally {
      button.disabled = false;
    }
  }

  addStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
