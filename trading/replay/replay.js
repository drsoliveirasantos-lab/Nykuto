(() => {
  'use strict';

  const JOURNAL_KEY = 'nykuto-trading-trades-v1';
  const SETTINGS_KEY = 'nykuto-trading-settings-v1';
  const byId = id => document.getElementById(id);
  const finite = value => value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
  const safeParse = (value, fallback) => {
    try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
  };
  const readLocal = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
  const writeLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const priceFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 });
  const moneyFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
  const percentFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  let chart;
  let candleSeries;
  let volumeSeries;
  let candles = [];
  let cursor = -1;
  let startCursor = -1;
  let playbackTimer = null;
  let loadedAsset = '';
  let loadedLabel = '';
  let loadedInterval = '';
  let position = null;
  let lastClosed = null;
  let sessionTrades = [];

  function setNotice(message, type = '') {
    const note = byId('dataNote');
    note.textContent = message;
    note.classList.remove('is-error', 'is-success');
    if (type === 'error') note.classList.add('is-error');
    if (type === 'success') note.classList.add('is-success');
  }

  function formatPrice(value) {
    return Number.isFinite(Number(value)) ? priceFmt.format(Number(value)) : '—';
  }

  function currentCandle() {
    return cursor >= 0 && cursor < candles.length ? candles[cursor] : null;
  }

  function initChart() {
    if (!window.LightweightCharts) {
      setNotice('Le moteur graphique n’a pas pu être chargé. Recharge la page.', 'error');
      return;
    }
    const container = byId('replayChart');
    chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: { background: { type: 'solid', color: '#07111f' }, textColor: '#9aabc0' },
      grid: { vertLines: { color: 'rgba(255,255,255,.045)' }, horzLines: { color: 'rgba(255,255,255,.045)' } },
      rightPriceScale: { borderColor: '#1c2a3b' },
      timeScale: { borderColor: '#1c2a3b', timeVisible: true, secondsVisible: false },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      localization: { locale: 'fr-FR' }
    });

    candleSeries = chart.addCandlestickSeries({
      upColor: '#35c995', downColor: '#ff7b7b', borderUpColor: '#35c995', borderDownColor: '#ff7b7b', wickUpColor: '#35c995', wickDownColor: '#ff7b7b'
    });
    volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: { top: 0.8, bottom: 0 }
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        chart.applyOptions({ width: rect.width, height: rect.height });
      }
    });
    observer.observe(container);
  }

  function setDefaultDate() {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    byId('startDateInput').value = d.toISOString().slice(0, 10);
    byId('startDateInput').max = new Date().toISOString().slice(0, 10);
  }

  function randomRecentDate() {
    const daysAgo = Math.floor(Math.random() * 22) + 4;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    byId('startDateInput').value = d.toISOString().slice(0, 10);
  }

  function volumePoint(candle) {
    return {
      time: candle.time,
      value: candle.volume || 0,
      color: candle.close >= candle.open ? 'rgba(53,201,149,.32)' : 'rgba(255,123,123,.30)'
    };
  }

  function renderCurrentCandle() {
    const candle = currentCandle();
    if (!candle) return;
    byId('ohlcOpen').textContent = formatPrice(candle.open);
    byId('ohlcHigh').textContent = formatPrice(candle.high);
    byId('ohlcLow').textContent = formatPrice(candle.low);
    byId('ohlcClose').textContent = formatPrice(candle.close);
    byId('chartTime').textContent = dateTimeFmt.format(new Date(candle.time * 1000));
    byId('paperCurrent').textContent = formatPrice(candle.close);
  }

  function updateProgress() {
    if (!candles.length || cursor < 0) {
      byId('replayProgressLabel').textContent = '0 / 0';
      byId('replayProgress').style.width = '0%';
      return;
    }
    const revealed = cursor + 1;
    const total = candles.length;
    byId('replayProgressLabel').textContent = `${revealed} / ${total}`;
    byId('replayProgress').style.width = `${Math.min(100, (revealed / total) * 100)}%`;
  }

  function setControlsEnabled(enabled) {
    byId('playPauseButton').disabled = !enabled;
    byId('stepButton').disabled = !enabled;
    byId('resetReplayButton').disabled = !enabled;
    byId('longButton').disabled = !enabled || Boolean(position);
    byId('shortButton').disabled = !enabled || Boolean(position);
    byId('closePositionButton').disabled = !position;
  }

  function pausePlayback() {
    if (playbackTimer) clearInterval(playbackTimer);
    playbackTimer = null;
    byId('playPauseButton').textContent = '▶ Lecture';
  }

  function startPlayback() {
    if (!candles.length || cursor >= candles.length - 1) return;
    pausePlayback();
    byId('playPauseButton').textContent = '❚❚ Pause';
    playbackTimer = setInterval(() => {
      if (!advanceOne()) pausePlayback();
    }, Number(byId('speedSelect').value) || 700);
  }

  function togglePlayback() {
    if (playbackTimer) pausePlayback(); else startPlayback();
  }

  function updatePositionMetrics() {
    const candle = currentCandle();
    const status = byId('positionStatus');
    status.classList.remove('is-long', 'is-short');
    byId('paperPnl').classList.remove('metric-positive', 'metric-negative');
    byId('paperR').classList.remove('metric-positive', 'metric-negative');

    if (position && candle) {
      const move = position.side === 'Long' ? candle.close - position.entry : position.entry - candle.close;
      const pnl = move * position.units;
      const r = position.riskDistance ? move / position.riskDistance : null;
      status.classList.add(position.side === 'Long' ? 'is-long' : 'is-short');
      status.innerHTML = `<span class="status-label">Position</span><strong>${position.side} · ouverte</strong><small>${position.units.toFixed(4)} unité(s) simulée(s)</small>`;
      byId('paperEntry').textContent = formatPrice(position.entry);
      byId('paperCurrent').textContent = formatPrice(candle.close);
      byId('paperPnl').textContent = `${pnl >= 0 ? '+' : ''}${moneyFmt.format(pnl)}`;
      byId('paperR').textContent = r === null ? 'Stop requis pour R' : `${r >= 0 ? '+' : ''}${priceFmt.format(r)} R`;
      if (pnl > 0) byId('paperPnl').classList.add('metric-positive');
      if (pnl < 0) byId('paperPnl').classList.add('metric-negative');
      if (r !== null && r > 0) byId('paperR').classList.add('metric-positive');
      if (r !== null && r < 0) byId('paperR').classList.add('metric-negative');
    } else if (lastClosed) {
      status.innerHTML = `<span class="status-label">Dernier trade</span><strong>Clôturé · ${lastClosed.reason}</strong><small>${lastClosed.r === null ? 'Résultat en R indisponible sans stop valide.' : `${lastClosed.r >= 0 ? '+' : ''}${priceFmt.format(lastClosed.r)} R`}</small>`;
      byId('paperEntry').textContent = formatPrice(lastClosed.entry);
      byId('paperCurrent').textContent = formatPrice(lastClosed.exit);
      byId('paperPnl').textContent = `${lastClosed.pnl >= 0 ? '+' : ''}${moneyFmt.format(lastClosed.pnl)}`;
      byId('paperR').textContent = lastClosed.r === null ? '—' : `${lastClosed.r >= 0 ? '+' : ''}${priceFmt.format(lastClosed.r)} R`;
      if (lastClosed.pnl > 0) byId('paperPnl').classList.add('metric-positive');
      if (lastClosed.pnl < 0) byId('paperPnl').classList.add('metric-negative');
      if (lastClosed.r !== null && lastClosed.r > 0) byId('paperR').classList.add('metric-positive');
      if (lastClosed.r !== null && lastClosed.r < 0) byId('paperR').classList.add('metric-negative');
    } else {
      status.innerHTML = '<span class="status-label">Position</span><strong>Aucune</strong><small>Les ordres sont uniquement simulés dans ton navigateur.</small>';
      byId('paperEntry').textContent = '—';
      byId('paperPnl').textContent = '—';
      byId('paperR').textContent = '—';
    }
    setControlsEnabled(Boolean(candles.length));
  }

  function renderSessionStats() {
    const count = sessionTrades.length;
    const finiteR = sessionTrades.map(t => t.r).filter(Number.isFinite);
    const totalR = finiteR.reduce((sum, value) => sum + value, 0);
    const winners = sessionTrades.filter(t => t.pnl > 0).length;
    byId('sessionTradeCount').textContent = String(count);
    byId('sessionTotalR').textContent = finiteR.length ? `${totalR >= 0 ? '+' : ''}${priceFmt.format(totalR)} R` : '—';
    byId('sessionWinRate').textContent = count ? `${percentFmt.format((winners / count) * 100)} %` : '—';
  }

  function savedRiskConfig() {
    const settings = readLocal(SETTINGS_KEY, {});
    const capital = finite(settings.capital);
    const risk = finite(settings.risk);
    return { capital: capital && capital > 0 ? capital : 1000, risk: risk && risk > 0 ? risk : 1 };
  }

  function openPosition(side) {
    const candle = currentCandle();
    if (!candle || position) return;
    const entry = candle.close;
    const stop = finite(byId('paperStop').value);
    const target = finite(byId('paperTarget').value);

    if (stop !== null && ((side === 'Long' && stop >= entry) || (side === 'Short' && stop <= entry))) {
      setNotice(side === 'Long' ? 'Pour un Long, place le stop sous le prix d’entrée.' : 'Pour un Short, place le stop au-dessus du prix d’entrée.', 'error');
      return;
    }
    if (target !== null && ((side === 'Long' && target <= entry) || (side === 'Short' && target >= entry))) {
      setNotice(side === 'Long' ? 'Pour un Long, l’objectif doit être au-dessus de l’entrée.' : 'Pour un Short, l’objectif doit être sous l’entrée.', 'error');
      return;
    }

    const riskDistance = stop === null ? null : Math.abs(entry - stop);
    const config = savedRiskConfig();
    const riskAmount = config.capital * (config.risk / 100);
    const units = riskDistance && riskDistance > 0 ? riskAmount / riskDistance : 1;
    position = { side, entry, stop, target, riskDistance, units, openedAt: candle.time };
    lastClosed = null;
    setNotice(`${side} simulé ouvert à ${formatPrice(entry)}. Avance maintenant sans regarder le futur.`, 'success');
    updatePositionMetrics();
  }

  function appendToJournal(closed) {
    if (!Number.isFinite(closed.r)) return;
    let journal = readLocal(JOURNAL_KEY, []);
    if (!Array.isArray(journal)) journal = [];
    journal.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      asset: loadedAsset.slice(0, 24),
      side: closed.side,
      r: closed.r,
      setup: 'Replay',
      note: `${loadedInterval} · ${dateTimeFmt.format(new Date(closed.openedAt * 1000))} → ${dateTimeFmt.format(new Date(closed.closedAt * 1000))} · ${closed.reason}`.slice(0, 300)
    });
    writeLocal(JOURNAL_KEY, journal);
  }

  function closePosition(exitPrice, reason, candle = currentCandle()) {
    if (!position || !candle) return;
    const move = position.side === 'Long' ? exitPrice - position.entry : position.entry - exitPrice;
    const pnl = move * position.units;
    const r = position.riskDistance ? move / position.riskDistance : null;
    const closed = {
      ...position,
      exit: exitPrice,
      pnl,
      r,
      reason,
      closedAt: candle.time
    };
    sessionTrades.push(closed);
    lastClosed = closed;
    appendToJournal(closed);
    position = null;
    renderSessionStats();
    updatePositionMetrics();
    setNotice(`Trade simulé clôturé : ${r === null ? moneyFmt.format(pnl) : `${r >= 0 ? '+' : ''}${priceFmt.format(r)} R`} · ${reason}.`, r !== null && r > 0 ? 'success' : '');
  }

  function processPositionOnCandle(candle) {
    if (!position) return;
    const { side, stop, target } = position;
    const stopHit = stop !== null && (side === 'Long' ? candle.low <= stop : candle.high >= stop);
    const targetHit = target !== null && (side === 'Long' ? candle.high >= target : candle.low <= target);

    if (stopHit && targetHit) {
      closePosition(stop, 'Stop retenu (stop et objectif touchés dans la même bougie)', candle);
    } else if (stopHit) {
      closePosition(stop, 'Stop loss', candle);
    } else if (targetHit) {
      closePosition(target, 'Take profit', candle);
    }
  }

  function advanceOne() {
    if (!candles.length || cursor >= candles.length - 1) {
      setNotice('Fin des données chargées pour cette session.', '');
      return false;
    }
    cursor += 1;
    const candle = candles[cursor];
    candleSeries.update(candle);
    volumeSeries.update(volumePoint(candle));
    processPositionOnCandle(candle);
    renderCurrentCandle();
    updatePositionMetrics();
    updateProgress();
    chart.timeScale().scrollToRealTime();
    return cursor < candles.length - 1;
  }

  function resetReplay() {
    pausePlayback();
    if (!candles.length || startCursor < 0) return;
    cursor = startCursor;
    position = null;
    lastClosed = null;
    sessionTrades = [];
    candleSeries.setData(candles.slice(0, cursor + 1));
    volumeSeries.setData(candles.slice(0, cursor + 1).map(volumePoint));
    chart.timeScale().fitContent();
    renderCurrentCandle();
    updateProgress();
    renderSessionStats();
    updatePositionMetrics();
    setNotice('Replay revenu au point de départ. Les bougies futures sont de nouveau masquées.', 'success');
  }

  async function loadReplay(event) {
    event.preventDefault();
    pausePlayback();
    const asset = byId('assetSelect').value;
    const interval = byId('intervalSelect').value;
    const date = byId('startDateInput').value;
    const contextBars = Number(byId('contextBarsSelect').value) || 40;
    if (!date) return;

    byId('loadReplayButton').disabled = true;
    byId('loadReplayButton').textContent = 'Chargement…';
    setNotice('Chargement des chandeliers historiques…');

    try {
      const response = await fetch(`/api/replay?asset=${encodeURIComponent(asset)}&interval=${encodeURIComponent(interval)}&date=${encodeURIComponent(date)}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin'
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Données indisponibles pour cette période.');
      if (!Array.isArray(payload.candles) || payload.candles.length < contextBars + 2) throw new Error('Pas assez de bougies pour créer ce replay. Essaie une date plus récente ou un timeframe plus grand.');

      candles = payload.candles.map(item => ({
        time: Number(item.time),
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume || 0)
      })).filter(item => Number.isFinite(item.time) && Number.isFinite(item.open) && Number.isFinite(item.high) && Number.isFinite(item.low) && Number.isFinite(item.close));

      if (candles.length < contextBars + 2) throw new Error('Les données reçues sont insuffisantes pour cette session.');
      loadedAsset = asset;
      loadedLabel = payload.label || asset;
      loadedInterval = interval;
      startCursor = Math.min(contextBars - 1, candles.length - 2);
      cursor = startCursor;
      position = null;
      lastClosed = null;
      sessionTrades = [];

      candleSeries.setData(candles.slice(0, cursor + 1));
      volumeSeries.setData(candles.slice(0, cursor + 1).map(volumePoint));
      chart.timeScale().fitContent();
      byId('chartPlaceholder').classList.add('is-hidden');
      byId('chartSymbol').textContent = `${loadedLabel} · ${interval}`;
      renderCurrentCandle();
      updateProgress();
      renderSessionStats();
      updatePositionMetrics();
      setNotice(`${candles.length} bougies chargées via ${payload.source || 'la source de marché'}. Le futur après la bougie ${cursor + 1} est masqué.`, 'success');
    } catch (error) {
      candles = [];
      cursor = -1;
      startCursor = -1;
      position = null;
      setControlsEnabled(false);
      updateProgress();
      setNotice(error instanceof Error ? error.message : 'Impossible de charger ce replay.', 'error');
    } finally {
      byId('loadReplayButton').disabled = false;
      byId('loadReplayButton').textContent = 'Charger le replay';
    }
  }

  byId('replaySetup').addEventListener('submit', loadReplay);
  byId('randomDateButton').addEventListener('click', randomRecentDate);
  byId('playPauseButton').addEventListener('click', togglePlayback);
  byId('stepButton').addEventListener('click', () => { pausePlayback(); advanceOne(); });
  byId('resetReplayButton').addEventListener('click', resetReplay);
  byId('speedSelect').addEventListener('change', () => { if (playbackTimer) startPlayback(); });
  byId('longButton').addEventListener('click', () => openPosition('Long'));
  byId('shortButton').addEventListener('click', () => openPosition('Short'));
  byId('closePositionButton').addEventListener('click', () => {
    const candle = currentCandle();
    if (position && candle) closePosition(candle.close, 'Clôture manuelle', candle);
  });

  setDefaultDate();
  initChart();
  setControlsEnabled(false);
  renderSessionStats();
})();
