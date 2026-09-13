(async () => {
  'use strict';
  await window.Nykuto.ready;
  const { journalMode, prepareJournal } = await import('./performance/performance-core.mjs');
  const { numericInput: finite, calculateCashRisk } = await import('./risk-core.mjs');

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
    const result = calculateCashRisk({capital:capitalInput.value,risk:riskInput.value,entry:entryInput.value,stop:stopInput.value,target:targetInput.value,side:byId('riskSide').value});
    const capital=finite(capitalInput.value),risk=finite(riskInput.value);
    byId('capitalKpi').textContent=capital>0?euro.format(capital):'—';
    byId('riskKpi').textContent=risk>0&&risk<=100?`${percent.format(risk)} %`:'—';
    byId('riskAmountResult').textContent=result.riskAmount===null?'—':euro.format(result.riskAmount);
    byId('positionSizeResult').textContent=result.units===null?'—':`${number.format(result.units)} unités`;
    byId('positionMeta').textContent=result.notional===null?'Renseigne une entrée et un stop cohérents':`Notionnel théorique ≈ ${euro.format(result.notional)}`;
    byId('stopDistanceResult').textContent=result.stopPct===null?'—':`${percent.format(result.stopPct)} %`;
    byId('rrResult').textContent=result.ratio===null?'—':`1 : ${number.format(result.ratio)}`;
    byId('rrMeta').textContent=result.ratio===null?'Vérifie le sens, le stop et l’objectif':`${number.format(result.ratio)} R potentiels, hors frais`;
    byId('riskStatus').textContent=result.message;
  }

  riskForm.addEventListener('submit', event => event.preventDefault());
  riskForm.addEventListener('input', calculateRisk);
  riskForm.addEventListener('change', async () => {
    calculateRisk();
    if (!capitalInput.checkValidity() || !riskInput.checkValidity()) return;
    try { await persistRiskSettings(); } catch { byId('riskStatus').textContent='Réglages non sauvegardés. Vérifie ta connexion et réessaie ; les valeurs restent affichées.'; }
  });
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
    if (open) {
      if (!byId('tradeClosedAt').value) {
        const now = new Date();
        byId('tradeClosedAt').value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,16);
      }
      byId('tradeAsset').focus();
    } else { toggleTradeForm.focus(); }
  }

  toggleTradeForm.setAttribute('aria-expanded', 'false');
  toggleTradeForm.addEventListener('click', () => setTradeForm(tradeForm.classList.contains('is-hidden')));
  cancelTrade.addEventListener('click', () => {
    tradeForm.reset();
    setTradeForm(false);
  });

  function tradeStats() {
    const valid = prepareJournal(trades, Intl.DateTimeFormat().resolvedOptions().timeZone).rows;
    const count=valid.length,winners=valid.filter(t=>t.r>0).length,total=valid.reduce((sum,t)=>sum+t.r,0);
    return {count,winners,total,average:count?total/count:null};
  }

  function renderJournal() {
    const { count, winners, total, average } = tradeStats();
    byId('journalCount').textContent = String(count);
    byId('tradeCountKpi').textContent = String(count);
    byId('winRate').textContent = count ? `${percent.format((winners / count) * 100)} %` : '—';
    byId('totalR').textContent = count ? `${total >= 0 ? '+' : ''}${number.format(total)} R` : '—';
    byId('averageR').textContent = average === null ? '—' : `${average >= 0 ? '+' : ''}${number.format(average)} R`;
    byId('avgRKpi').textContent = average === null ? '—' : `${average >= 0 ? '+' : ''}${number.format(average)} R`;

    const hasTrades = trades.length > 0;
    byId('emptyJournal').classList.toggle('is-hidden', hasTrades);
    byId('journalTableWrap').classList.toggle('is-hidden', !hasTrades);
    journalBody.replaceChildren();

    trades.slice().reverse().forEach(trade => {
      const tr = document.createElement('tr');
      const r = typeof trade.r === 'number' && Number.isFinite(trade.r) ? trade.r : null;
      const parsedDate = new Date(trade.closedAt || trade.createdAt);
      const dateLabel = Number.isFinite(parsedDate.getTime()) ? dateFmt.format(parsedDate) : 'Date invalide';
      const rClass = r > 0 ? 'r-positive' : r < 0 ? 'r-negative' : '';
      const cells = [
        dateLabel,
        trade.asset,
        trade.side,
        r === null ? 'Résultat invalide' : `${r > 0 ? '+' : ''}${number.format(r)} R`,
        trade.setup || '—',
        trade.discipline ? `${({ calm: 'Calme', excited: 'Excité', anxious: 'Inquiet', frustrated: 'Frustré', tired: 'Fatigué', unsure: 'Indécis' })[trade.discipline.before] || '—'} → ${({ calm: 'Calme', excited: 'Excité', anxious: 'Inquiet', frustrated: 'Frustré', tired: 'Fatigué', unsure: 'Indécis' })[trade.discipline.after] || '—'}` : 'Non renseigné',
        ({manual:'Manuel',paper:'Simulation',replay:'Replay',unknown:'Non renseigné'})[journalMode(trade)]
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
      button.textContent = 'Supprimer';
      button.setAttribute('aria-label', `Supprimer le trade ${trade.asset}`);
      button.addEventListener('click', async () => {
        if (!window.confirm(`Supprimer le trade ${trade.asset} du ${dateLabel} ? Cette action est définitive.`)) return;
        button.disabled = true;
        try { await window.Nykuto.update(KEYS.trades, current => (current || []).filter(item => item.id !== trade.id)); trades = readLocal(KEYS.trades, []); } catch { button.disabled = false; byId('journalStatus').textContent='Suppression non confirmée. Recharge le journal avant de réessayer.'; return; }
        byId('journalStatus').textContent='Trade supprimé du journal.';
        renderJournal();
        toggleTradeForm.focus();
      });
      action.appendChild(button);
      tr.appendChild(action);
      journalBody.appendChild(tr);
    });
    window.dispatchEvent(new CustomEvent('nykuto:journal-updated'));
  }

  tradeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const asset = byId('tradeAsset').value.trim();
    const r = finite(byId('tradeR').value);
    const closedAt = new Date(byId('tradeClosedAt').value);
    if (!asset || r === null || !Number.isFinite(closedAt.getTime())) return;

    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      closedAt: closedAt.toISOString(),
      mode: byId('tradeMode').value,
      asset: asset.slice(0, 24),
      side: byId('tradeSide').value === 'Short' ? 'Short' : 'Long',
      r,
      setup: byId('tradeSetup').value.trim().slice(0, 50),
      note: byId('tradeNote').value.trim().slice(0, 300)
    };
    const button = tradeForm.querySelector('[type="submit"]'); button.disabled = true;
    try { await window.Nykuto.update(KEYS.trades, current => [...(current || []), entry]); trades = readLocal(KEYS.trades, []); } catch { byId('journalStatus').textContent='Enregistrement non confirmé. Ta saisie reste affichée. Recharge pour vérifier la sauvegarde avant de réessayer.'; return; } finally { button.disabled = false; }
    byId('journalStatus').textContent='Trade enregistré dans ton journal.';
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
})().catch(() => {
  const message='Ton compte n’a pas pu être chargé. Recharge la page pour réessayer.';
  if (window.Nykuto?.status) window.Nykuto.status(message);
  const status=document.getElementById('journalStatus');if(status)status.textContent=message;
});
