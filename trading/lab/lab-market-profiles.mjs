import { STRATEGY_OPTIONS, MARKET_FOCUSES, createMarketProfileRegistry, selectResearchProfile, inspectProfileIntent } from './market-profile-registry.mjs';
import { reserveResearchRisk, assessAccountRisk } from './account-risk-supervisor.mjs';

const $ = id => document.getElementById('profiles' + id);
const number = n => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const dollars = n => `${n > 0 ? '+' : ''}${number(n)} $`;
const node = (tag, text) => { const n = document.createElement(tag); n.textContent = text; return n; };
let registry;

function showSummary() {
  const unavailable = registry.markets.filter(m => !selectResearchProfile(registry, m.symbol, $('Choice' + m.symbol).value).available).length;
  $('Status').textContent = unavailable ? `${unavailable} profil(s) consulté(s) indisponible(s) · exécution désactivée` : '4 profils distincts · aucune stratégie qualifiée';
}

function showMarket(symbol) {
  const profile = selectResearchProfile(registry, symbol, $('Choice' + symbol).value);
  $('Data' + symbol).hidden = !profile.available;
  $('Status' + symbol).textContent = profile.available ? 'Non qualifiée · exécution désactivée' : 'Bilan invérifiable · profil indisponible';
  $('Rows' + symbol).replaceChildren();
  $('Checks' + symbol).textContent = '';
  $('Windows' + symbol).textContent = '';
  if (!profile.available) return;
  for (const [label, d] of [['Coûts initiaux', profile.normal], ['Coûts doublés', profile.stress]]) {
    const row = node('tr', '');
    for (const text of [label, d.trades, dollars(d.netUSD), dollars(d.drawdownUSD)]) row.append(node('td', String(text)));
    $('Rows' + symbol).append(row);
  }
  $('Checks' + symbol).textContent = `${profile.passedChecks}/8 critères. Échecs : ${profile.failedChecks.join(' ; ').toLowerCase()}.`;
  $('Windows' + symbol).textContent = profile.windows.map(w => `${w.start} → ${w.end} exclu : ${dollars(w.normalNetUSD)}, ${w.observed}/${w.expected} séances`).join(' · ');
  $('Link' + symbol).href = `./JEU${profile.game}_RESULTS.md`;
  $('Link' + symbol).textContent = `Consulter le Jeu ${profile.game}`;
}

async function load() {
  $('Retry').disabled = true;
  $('Status').textContent = 'Vérification des bilans…';
  for (const m of MARKET_FOCUSES) { $('Data' + m.symbol).hidden = true; $('Choice' + m.symbol).disabled = true; }
  try {
    const responses = await Promise.allSettled(STRATEGY_OPTIONS.map(async option => {
      const response = await fetch(`./jeu${option.game}-report.json`, { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) throw new Error('Unavailable report');
      return [option.game, await response.arrayBuffer()];
    }));
    registry = await createMarketProfileRegistry(Object.fromEntries(responses.filter(r => r.status === 'fulfilled').map(r => r.value)));
    for (const m of MARKET_FOCUSES) {
      const select = $('Choice' + m.symbol), previous = select.value;
      select.replaceChildren();
      for (const option of STRATEGY_OPTIONS) {
        const element = node('option', `Jeu ${option.game} · ${option.label}`); element.value = option.key; select.append(element);
      }
      select.value = STRATEGY_OPTIONS.some(o => o.key === previous) ? previous : m.focus;
      select.disabled = false;
      $('Focus' + m.symbol).textContent = `Piste initiale : Jeu ${STRATEGY_OPTIONS.find(o => o.key === m.focus).game}. ${m.rationale}`;
      showMarket(m.symbol);
    }
    showSummary();
    showRiskExample();
  } catch {
    registry = null;
    $('Status').textContent = 'Profils indisponibles · réessayer';
    $('RiskResult').textContent = '';
    for (const m of MARKET_FOCUSES) { $('Data' + m.symbol).hidden = true; $('Status' + m.symbol).textContent = 'Bilan indisponible'; }
  } finally { $('Retry').disabled = false; }
}

function showRiskExample() {
  if (!registry) return;
  const state = { accountId: 'illustration', session: '2026-01-02', revision: 0, balanceUSD: 25000,
    dayStartUSD: 25000, floorUSD: 24000, entriesToday: 0, lossStreak: 0, realizedR: 0, commitments: [] };
  const intent = { accountId: state.accountId, session: state.session, expectedRevision: 0, id: 'mnq-example',
    symbol: 'MNQ', side: 'Long', quantity: 1, costFactor: 1, entry: 20000, stop: 19960 };
  let text;
  if ($('RiskScenario').value === 'simultaneous') {
    const first = reserveResearchRisk(state, intent);
    const next = assessAccountRisk(first.state, { ...intent, id: 'mes-example', symbol: 'MES', entry: 5000, stop: 4980, expectedRevision: first.state.revision });
    text = `Le premier projet MNQ réserve ${number(first.riskUSD)} $. Le projet MES suivant (${number(next.riskUSD)} $) est refusé : un projet est déjà réservé et la limite commune est une position ou entrée en attente.`;
  } else if ($('RiskScenario').value === 'daily') {
    const check = assessAccountRisk({ ...state, balanceUSD: 24750, entriesToday: 1, lossStreak: 1, realizedR: -1.75 }, intent);
    text = `Après 250 $ de pertes réalisées, il reste ${number(check.dailyRemainingUSD)} $ de budget quotidien. Le projet à ${number(check.riskUSD)} $ est refusé pour tous les profils.`;
  } else if ($('RiskScenario').value === 'floor') {
    const check = assessAccountRisk({ ...state, balanceUSD: 24150, dayStartUSD: 24150 }, intent);
    text = `Avec un solde fictif de 24 150 $, un seuil à 24 000 $ et 100 $ de réserve, la marge utilisable est ${number(check.floorRemainingUSD)} $. Le projet à ${number(check.riskUSD)} $ est refusé.`;
  } else return;
  const decision = inspectProfileIntent(registry, 'MNQ', 'protect', state, intent);
  $('RiskResult').textContent = text + (decision.executionAllowed === false ? ' Aucun ordre ne peut partir : ces profils de recherche ne sont pas qualifiés.' : '');
}

for (const m of MARKET_FOCUSES) $('Choice' + m.symbol).addEventListener('change', () => { if (registry) { showMarket(m.symbol); showSummary(); } });
$('Retry').addEventListener('click', load);
$('RiskScenario').addEventListener('change', showRiskExample);
load();
