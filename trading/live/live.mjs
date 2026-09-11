const $ = id => document.getElementById(id);
let userId = null, busy = false;
async function request(options = {}) {
  const response = await fetch('/api/market', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000), ...options });
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Reconnecte-toi au site pour lire le statut.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Réception indisponible.');
  return data;
}
const date = ms => ms === null ? '—' : new Date(ms).toLocaleString('fr-FR');
function cell(text) { const td = document.createElement('td'); td.textContent = String(text); return td; }
function render(data) {
  if (userId && userId !== data.userId) throw new Error('Le compte connecté a changé. Recharge la page.');
  userId = data.userId;
  $('streamRows').replaceChildren(...data.streams.map(s => {
    const tr = document.createElement('tr');
    const state = { waiting: 'En attente', stale: 'Données anciennes / pause de séance', recent: 'Bougie récente reçue' }[s.state] || 'Inconnu';
    tr.append(...[s.root, state, s.last?.providerSymbol || '—', s.last?.contract || '—', s.last?.close ?? '—',
      date(s.last?.endMs ?? null), s.retained, [1,5,15,60].map(m => `${m}m : ${s.timeframes[m]}`).join(' · '), s.gaps].map(cell));
    return tr;
  }));
  $('apiState').textContent = 'Récepteur disponible · aucune liaison Lucid vérifiée';
  $('updatedAt').textContent = `Lecture du serveur : ${date(data.serverTime)}`;
  $('bridgeUser').textContent = userId;
  $('probe').disabled = false;
}
async function refresh() {
  if (busy) return;
  busy = true; $('refresh').disabled = true;
  try { render(await request()); $('pageStatus').textContent = ''; }
  catch (error) {
    $('apiState').textContent = 'Statut indisponible'; $('streamRows').replaceChildren();
    $('pageStatus').textContent = error.message; $('probe').disabled = true;
  } finally { busy = false; $('refresh').disabled = false; }
}
$('refresh').addEventListener('click',refresh);
$('probe').addEventListener('click',async () => {
  $('probe').disabled = true;
  try {
    const result = await request({ method: 'POST', headers: { 'Content-Type':'application/json', 'X-Nykuto-Action':'account-write', 'X-Nykuto-User':userId }, body: JSON.stringify({action:'probe'}) });
    if (result.transportReady !== true || result.providerConnected !== false || result.wroteMarketData !== false) throw new Error('Réponse de test invalide.');
    $('probeStatus').textContent = 'Test API réussi. Aucune donnée de marché créée, aucun broker contacté et aucun ordre envoyé.';
  } catch (error) { $('probeStatus').textContent = `Test non confirmé : ${error.message}`; }
  finally { $('probe').disabled = !userId; }
});
setInterval(() => { if ($('autoRefresh').checked && !document.hidden) refresh(); },15000);
refresh();
