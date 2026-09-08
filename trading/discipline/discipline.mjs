import { PREPARATIONS_KEY, TRADES_KEY, EMOTIONS, drawdownScenario, preparationReasons, validatePreparation, mergeJournal } from './discipline-core.mjs';
const el = id => document.getElementById(id);
const node = (tag, text, className) => { const n = document.createElement(tag); n.textContent = text; if (className) n.className = className; return n; };
const read = (key, fallback) => { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const preparations = () => { const list = read(PREPARATIONS_KEY, []); if (!Array.isArray(list)) throw new Error('Préparations illisibles : aucune donnée remplacée.'); list.forEach(validatePreparation); return list; };
const number = value => value.trim() === '' ? NaN : Number(value);
const fmt = value => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
let calculator = null, showAll = false;

function renderDrawdown() {
  const input = { peak: number(el('ddPeak').value), current: number(el('ddCurrent').value), riskPct: number(el('ddRisk').value), losses: number(el('ddLosses').value), currency: el('ddCurrency').value };
  el('ddError').hidden = true;
  try {
    const r = drawdownScenario(input), money = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: input.currency }).format(n);
    calculator = { ...input, ...r };
    el('ddLoss').textContent = money(r.loss);
    el('ddPct').textContent = `${fmt(r.drawdownPct)} % de baisse`;
    el('ddRecovery').textContent = r.recoveryPct === null ? 'Capital épuisé' : `+${fmt(r.recoveryPct)} %`;
    el('ddAfter').textContent = money(r.after);
    el('ddAfterDetail').textContent = `${fmt(r.afterDrawdownPct)} % sous le sommet · ${r.afterRecoveryPct === null ? 'capital épuisé' : `+${fmt(r.afterRecoveryPct)} % nécessaires pour revenir`}`;
    el('ddResults').hidden = false;
  } catch (error) { calculator = null; el('ddResults').hidden = true; el('ddError').hidden = false; el('ddError').textContent = error.message; }
}
el('drawdownForm').addEventListener('input', renderDrawdown);
el('drawdownForm').addEventListener('submit', event => event.preventDefault());
renderDrawdown();

function formValue() {
  return { asset: el('prepAsset').value.trim().toUpperCase(), mode: el('prepMode').value, side: el('prepSide').value, emotion: el('prepEmotion').value, stress: Number(el('prepStress').value), fatigue: Number(el('prepFatigue').value), fomo: Number(el('prepFomo').value), revenge: el('prepRevenge').checked, plan: el('prepPlan').value.trim(), decision: el('prepDecision').value, checks: { signal: el('checkSignal').checked, stop: el('checkStop').checked, size: el('checkSize').checked, acceptLoss: el('checkAccept').checked } };
}
function feedback() {
  const p = formValue(), reasons = preparationReasons(p);
  el('stressValue').textContent = `${p.stress} / 5`; el('fatigueValue').textContent = `${p.fatigue} / 5`; el('fomoValue').textContent = `${p.fomo} / 5`;
  const emotional = p.fomo >= 4 || p.stress >= 4 || p.fatigue >= 4 || p.revenge;
  el('prepFeedbackTitle').textContent = emotional ? 'Une pause mérite d’être envisagée' : reasons.length || !p.plan || !p.emotion ? 'Points à compléter' : 'Préparation renseignée';
  el('prepFeedback').textContent = reasons.length ? reasons.join(' · ') : !p.plan || !p.emotion ? 'Choisis ton émotion et écris ton scénario.' : 'Tes règles sont renseignées. Cela ne donne pas une probabilité de gain ni un signal d’achat.';
}
el('preparationForm').addEventListener('input', feedback);
feedback();

const PAUSE_KEY = 'nykuto-trading-pause-until-v1';
function showPause() {
  try {
    const until = Number(read(PAUSE_KEY, 0)), left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    el('pauseStatus').textContent = left ? `Pause personnelle : ${Math.floor(left / 60)} min ${String(left % 60).padStart(2, '0')} s restantes. Reviens ensuite à ton scénario.` : until ? 'Pause terminée. Réévalue ton état avant de décider.' : '';
    el('startPause').disabled = left > 0;
  } catch { el('pauseStatus').textContent = 'La pause ne peut pas être enregistrée sur ce navigateur.'; }
}
el('startPause').addEventListener('click', () => { try { write(PAUSE_KEY, Date.now() + 300000); showPause(); } catch { el('pauseStatus').textContent = 'Pause non enregistrée : stockage du navigateur indisponible.'; } });
showPause(); setInterval(() => { if (!document.hidden) showPause(); }, 1000);
document.addEventListener('visibilitychange', showPause);

el('preparationForm').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const list = preparations();
    if (list.length >= 1000) throw new Error('Limite de 1 000 préparations atteinte. Exporte ton historique avant de poursuivre.');
    const p = validatePreparation({ ...formValue(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), drawdown: calculator ? { ...calculator } : null, result: null });
    write(PREPARATIONS_KEY, [...list, p]);
    el('preparationForm').reset(); feedback();
    el('prepSaveStatus').textContent = 'Préparation enregistrée. Après la clôture, ajoute le bilan ci-dessous si tu as pris ce trade.';
    renderHistory();
  } catch (error) { el('prepSaveStatus').textContent = `Non enregistré : ${error.message}`; }
});

function syncResult(p) {
  const journal = read(TRADES_KEY, []), merged = mergeJournal(journal, p);
  if (merged !== journal) write(TRADES_KEY, merged);
}
function field(label, input) { const wrapper = node('label', label); wrapper.append(input); return wrapper; }
function select(options, required = false) {
  const input = document.createElement('select'); input.required = required;
  for (const [value, label] of options) { const option = node('option', label); option.value = value; input.append(option); }
  return input;
}
function resultForm(p) {
  const form = document.createElement('form'), grid = node('div', '', 'discipline-fields');
  const r = document.createElement('input'); r.type = 'number'; r.step = 'any'; r.required = true; r.placeholder = 'Ex. −1 ou +1,5';
  const emotion = select([['', 'Choisir'], ...Object.entries(EMOTIONS)], true);
  const plan = select([['', 'Choisir'], ['yes', 'Oui'], ['partly', 'En partie'], ['no', 'Non']], true);
  const note = document.createElement('textarea'); note.maxLength = 300; note.rows = 2;
  grid.append(field('Résultat net en R', r), field('Émotion après le trade', emotion), field('Plan respecté ?', plan), field('Ce que je retiens', note));
  const save = node('button', 'Enregistrer le bilan', 'primary-button'); save.type = 'submit';
  const message = node('p', '', 'discipline-message'); message.setAttribute('role', 'status');
  form.append(node('p', 'R = risque initial prévu au stop. Inscris le résultat après les frais ; un stop peut perdre plus de 1 R.'), grid, save, message);
  form.addEventListener('submit', event => {
    event.preventDefault();
    let saved = false;
    try {
      const list = preparations(), current = list.find(item => item.id === p.id);
      if (!current || current.result) throw new Error('Préparation déjà complétée ou introuvable.');
      const value = number(r.value); if (!Number.isFinite(value)) throw new Error('Renseigne un résultat en R.');
      const complete = { ...current, result: { r: value, emotion: emotion.value, followedPlan: plan.value, note: note.value.trim(), closedAt: new Date().toISOString() } };
      // Validate before either write. Preserve the preparation if the journal write fails.
      mergeJournal(read(TRADES_KEY, []), complete);
      write(PREPARATIONS_KEY, list.map(item => item.id === p.id ? complete : item)); saved = true;
      syncResult(complete);
      renderHistory(); el('historyStatus').textContent = 'Bilan enregistré et ajouté au journal, avec l’état avant et après le trade.';
    } catch (error) {
      if (saved) { renderHistory(); el('historyStatus').textContent = 'Bilan conservé ici. L’ajout au journal a échoué : utilise « Relier au journal » pour réessayer.'; }
      else message.textContent = `Non enregistré : ${error.message}`;
    }
  });
  return form;
}
function renderHistory() {
  const root = el('prepHistory'); root.replaceChildren();
  try {
    const list = preparations(), visible = list.slice().reverse().slice(0, showAll ? list.length : 10);
    el('prepHistoryEmpty').hidden = list.length > 0; el('showAllPreparations').hidden = showAll || list.length <= 10;
    for (const p of visible) {
      const details = node('details', '', 'prep-record'), summary = node('summary', `${p.asset} · ${p.side} · ${EMOTIONS[p.emotion]}`);
      summary.append(node('span', `${new Date(p.createdAt).toLocaleString('fr-FR')} · ${p.result ? `${fmt(p.result.r)} R` : 'Bilan à renseigner'}`));
      details.append(summary, node('p', `${p.mode === 'paper' ? 'Simulation' : 'Manuel'} · stress ${p.stress}/5 · fatigue ${p.fatigue}/5 · FOMO ${p.fomo}/5${p.revenge ? ' · envie de récupérer une perte' : ''}`, 'prep-metadata'), node('p', p.plan), node('p', `Décision préparée : ${p.decision === 'observe' ? 'observer / passer' : 'envisager une entrée selon le plan'}.`));
      if (p.drawdown) details.append(node('p', `Scénario enregistré : capital ${fmt(p.drawdown.current)} ${p.drawdown.currency}, baisse ${fmt(p.drawdown.drawdownPct)} %, risque prévu ${fmt(p.drawdown.riskPct)} % par trade.`, 'prep-metadata'));
      if (p.result) {
        details.append(node('p', `Après : ${EMOTIONS[p.result.emotion]} · plan respecté : ${{ yes: 'oui', partly: 'en partie', no: 'non' }[p.result.followedPlan]}. ${p.result.note || ''}`));
        const button = node('button', 'Relier au journal', 'ghost-button'); button.type = 'button';
        button.addEventListener('click', () => { try { syncResult(p); el('historyStatus').textContent = 'Bilan présent dans le journal, sans doublon.'; } catch (e) { el('historyStatus').textContent = e.message; } });
        details.append(button);
      } else details.append(resultForm(p));
      root.append(details);
    }
  } catch (error) { el('historyStatus').textContent = `Historique indisponible : ${error.message}`; }
}
el('showAllPreparations').addEventListener('click', () => { showAll = true; renderHistory(); });
el('exportPreparations').addEventListener('click', () => {
  try {
    const data = preparations(), url = URL.createObjectURL(new Blob([JSON.stringify({ schema: 'nykuto-preparations-v1', exportedAt: new Date().toISOString(), preparations: data }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'nykuto-preparations.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) { el('historyStatus').textContent = `Export impossible : ${error.message}`; }
});
window.addEventListener('storage', event => { if (event.key === PREPARATIONS_KEY || event.key === TRADES_KEY) renderHistory(); if (event.key === PAUSE_KEY) showPause(); });
renderHistory();
