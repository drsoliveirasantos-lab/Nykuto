(async () => {
  'use strict';
  await window.Nykuto.ready;

  const KEYS = {
    settings: 'nykuto-trading-settings-v1',
    trades: 'nykuto-trading-trades-v1',
    checklist: 'nykuto-trading-checklist-v1'
  };

  const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
  const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 });
  const percent = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

  const byId = id => document.getElementById(id);
  const safeParse = (value, fallback) => {
    try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
  };
  const readLocal = (key, fallback) => window.Nykuto.read(key, fallback);
  const writeLocal = (key, value) => window.Nykuto.set(key, value);
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : null;

  const sectionNav = document.querySelector('.section-nav');
  if (sectionNav && !sectionNav.querySelector('[data-replay-link]')) {
    const replayLink = document.createElement('a');
    replayLink.href = './replay/';
    replayLink.textContent = 'Replay';
    replayLink.dataset.replayLink = 'true';
    sectionNav.appendChild(replayLink);
  }

  const riskForm = byId('riskForm');
  const capitalInput = byId('capitalInput');
  const riskInput = byId('riskInput');
  const entryInput = byId('entryInput');
  const stopInput = byId('stopInput');
  const targetInput = byId('targetInput');

  const savedSettings = readLocal(KEYS.settings, {});
  if (finite(savedSettings.capital) !== null && savedSettings.capital > 0) capitalInput.value = savedSettings.capital;
  if (finite(savedSettings.risk) !== null && savedSettings.risk > 0) riskInput.value = savedSettings.risk;

  function persistRiskSettings() {
    return writeLocal(KEYS.settings, { capital: finite(capitalInput.value), risk: finite(riskInput.value) });
  }

  function calculateRisk() {
    const capital = finite(capitalInput.value);
    const riskPct = finite(riskInput.value);
    const entry = finite(entryInput.value);
    const stop = finite(stopInput.value);
    const target = finite(targetInput.value);

    if (capital !== null && capital >= 0) byId('capitalKpi').textContent = euro.format(capital);
    if (riskPct !== null && riskPct >= 0) byId('riskKpi').textContent = `${percent.format(riskPct)} %`;

    const riskAmount = capital !== null && riskPct !== null && capital >= 0 && riskPct >= 0
      ? capital * (riskPct / 100)
      : null;
    byId('riskAmountResult').textContent = riskAmount === null ? '—' : euro.format(riskAmount);

    const stopDistance = entry !== null && stop !== null && entry > 0 ? Math.abs(entry - stop) : null;
    const stopDistancePct = stopDistance !== null && entry > 0 ? (stopDistance / entry) * 100 : null;
    byId('stopDistanceResult').textContent = stopDistancePct === null || stopDistancePct === 0 ? '—' : `${percent.format(stopDistancePct)} %`;

    if (riskAmount !== null && stopDistance !== null && stopDistance > 0) {
      const units = riskAmount / stopDistance;
      const notional = units * entry;
      byId('positionSizeResult').textContent = `${number.format(units)} unités`;
      byId('positionMeta').textContent = `Notionnel ≈ ${euro.format(notional)}`;
    } else {
      byId('positionSizeResult').textContent = '—';
      byId('positionMeta').textContent = 'Renseigne entrée et stop';
    }

    if (entry !== null && stop !== null && target !== null) {
      const riskDistance = Math.abs(entry - stop);
      const rewardDistance = Math.abs(target - entry);
      if (riskDistance > 0) {
        const rr = rewardDistance / riskDistance;
        byId('rrResult').textContent = `1 : ${number.format(rr)}`;
        byId('rrMeta').textContent = rr >= 2 ? 'Potentiel ≥ 2R' : 'Potentiel < 2R';
      } else {
        byId('rrResult').textContent = '—';
        byId('rrMeta').textContent = 'Stop identique à l’entrée';
      }
    } else {
      byId('rrResult').textContent = '—';
      byId('rrMeta').textContent = 'Renseigne stop et objectif';
    }


  }

  riskForm.addEventListener('input', calculateRisk);
  riskForm.addEventListener('change', () => { persistRiskSettings().catch(() => {}); });
  calculateRisk();

  const toggleTradeForm = byId('toggleTradeForm');
  const tradeForm = byId('tradeForm');
  const cancelTrade = byId('cancelTrade');
  const journalBody = byId('journalBody');
  let trades = readLocal(KEYS.trades, []);
  if (!Array.isArray(trades)) trades = [];

  function setTradeForm(open) {
    tradeForm.classList.toggle('is-hidden', !open);
    toggleTradeForm.setAttribute('aria-expanded', String(open));
    if (open) byId('tradeAsset').focus();
  }

  toggleTradeForm.setAttribute('aria-expanded', 'false');
  toggleTradeForm.addEventListener('click', () => setTradeForm(tradeForm.classList.contains('is-hidden')));
  cancelTrade.addEventListener('click', () => {
    tradeForm.reset();
    setTradeForm(false);
  });

  function tradeStats() {
    const validR = trades.map(t => Number(t.r)).filter(Number.isFinite);
    const count = trades.length;
    const winners = validR.filter(r => r > 0).length;
    const total = validR.reduce((sum, r) => sum + r, 0);
    const average = validR.length ? total / validR.length : null;
    return { count, winners, total, average };
  }

  function renderJournal() {
    const { count, winners, total, average } = tradeStats();
    byId('journalCount').textContent = String(count);
    byId('tradeCountKpi').textContent = String(count);
    byId('winRate').textContent = count ? `${percent.format((winners / count) * 100)} %` : '—';
    byId('totalR').textContent = count ? `${total >= 0 ? '+' : ''}${number.format(total)} R` : '—';
    byId('averageR').textContent = average === null ? '—' : `${average >= 0 ? '+' : ''}${number.format(average)} R`;
    byId('avgRKpi').textContent = average === null ? '—' : `${average >= 0 ? '+' : ''}${number.format(average)} R`;

    const hasTrades = count > 0;
    byId('emptyJournal').classList.toggle('is-hidden', hasTrades);
    byId('journalTableWrap').classList.toggle('is-hidden', !hasTrades);
    journalBody.replaceChildren();

    trades.slice().reverse().forEach(trade => {
      const tr = document.createElement('tr');
      const r = Number(trade.r);
      const rClass = r > 0 ? 'r-positive' : r < 0 ? 'r-negative' : '';
      const cells = [
        dateFmt.format(new Date(trade.createdAt)),
        trade.asset,
        trade.side,
        `${r > 0 ? '+' : ''}${number.format(r)} R`,
        trade.setup || '—',
        trade.discipline ? `${({ calm: 'Calme', excited: 'Excité', anxious: 'Inquiet', frustrated: 'Frustré', tired: 'Fatigué', unsure: 'Indécis' })[trade.discipline.before] || '—'} → ${({ calm: 'Calme', excited: 'Excité', anxious: 'Inquiet', frustrated: 'Frustré', tired: 'Fatigué', unsure: 'Indécis' })[trade.discipline.after] || '—'}` : 'Non renseigné',
        trade.discipline?.mode === 'manual' ? 'Manuel' : trade.discipline?.mode === 'paper' ? 'Simulation' : 'Non renseigné'
      ];
      cells.forEach((value, index) => {
        const td = document.createElement('td');
        td.textContent = value;
        if (index === 3) td.className = rClass;
        if (index === 5 && trade.discipline) td.title = `FOMO ${trade.discipline.fomo}/5 · stress ${trade.discipline.stress}/5 · fatigue ${trade.discipline.fatigue}/5 · ${trade.discipline.mode === 'manual' ? 'Manuel' : 'Simulation'}`;
        tr.appendChild(td);
      });
      const action = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'delete-trade';
      button.textContent = '×';
      button.setAttribute('aria-label', `Supprimer le trade ${trade.asset}`);
      button.addEventListener('click', async () => {
        button.disabled = true;
        try { await window.Nykuto.update(KEYS.trades, current => (current || []).filter(item => item.id !== trade.id)); trades = readLocal(KEYS.trades, []); } catch { button.disabled = false; return; }
        renderJournal();
      });
      action.appendChild(button);
      tr.appendChild(action);
      journalBody.appendChild(tr);
    });
  }

  tradeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const asset = byId('tradeAsset').value.trim();
    const r = finite(byId('tradeR').value);
    if (!asset || r === null) return;

    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      asset: asset.slice(0, 24),
      side: byId('tradeSide').value === 'Short' ? 'Short' : 'Long',
      r,
      setup: byId('tradeSetup').value.trim().slice(0, 50),
      note: byId('tradeNote').value.trim().slice(0, 300)
    };
    const button = tradeForm.querySelector('[type="submit"]'); button.disabled = true;
    try { await window.Nykuto.update(KEYS.trades, current => [...(current || []), entry]); trades = readLocal(KEYS.trades, []); } catch { return; } finally { button.disabled = false; }
    tradeForm.reset();
    setTradeForm(false);
    renderJournal();
  });

  renderJournal();

  const savedChecklist = readLocal(KEYS.checklist, {});
  const checklistInputs = [...document.querySelectorAll('[data-check]')];
  checklistInputs.forEach(input => {
    input.checked = Boolean(savedChecklist[input.dataset.check]);
  });

  function renderChecklist(save = false) {
    const state = {};
    let completed = 0;
    checklistInputs.forEach(input => {
      state[input.dataset.check] = input.checked;
      if (input.checked) completed += 1;
    });
    if (save) writeLocal(KEYS.checklist, state).catch(() => {});
    byId('checklistLabel').textContent = `${completed} / ${checklistInputs.length} validés`;
    byId('checklistProgress').style.width = `${(completed / checklistInputs.length) * 100}%`;
  }

  checklistInputs.forEach(input => input.addEventListener('change', renderChecklist));
  byId('resetChecklist').addEventListener('click', () => {
    checklistInputs.forEach(input => { input.checked = false; });
    renderChecklist(true);
  });
  renderChecklist();
})().catch(error => window.Nykuto.status(error.message));
