const $ = id => document.getElementById(id);
let busy = false, hadSuccess = false, hasTradingView = false;
const date = value => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value));
const number = value => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 8 }).format(value);
async function api(path = '', options = {}) {
  let response;
  try { response = await fetch(`/api/alerts${path}`, { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000), ...options }); }
  catch { throw new Error('Connexion interrompue. Recharge la page si ta session a expiré.'); }
  if ([401, 403].includes(response.status)) throw new Error('Recharge la page pour te reconnecter au site.');
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Réponse indisponible. Recharge la page puis réessaie.');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Action momentanément indisponible.');
  return data;
}
function element(tag, text, className = '') { const el = document.createElement(tag); el.textContent = text; el.className = className; return el; }
function render(events) {
  const fragment = document.createDocumentFragment();
  for (const event of events) {
    const item = element('li', '');
    const top = element('div', '', 'alert-item-top');
    top.append(element('h4', event.name), element('span', event.source, `alert-source${event.source === 'Test du site' ? ' is-test' : ''}`));
    const bottom = element('div', '', 'alert-item-bottom');
    const details = element('span', `${event.symbol} · ${event.interval === 'test' ? 'essai interne' : `unité ${event.interval}`}`);
    if (event.price !== null) details.append(element('span', ` · ${number(event.price)}`, 'alert-price'));
    const time = element('time', date(event.triggeredAt), 'alerts-meta'); time.dateTime = event.triggeredAt; time.title = `Reçu le ${date(event.receivedAt)}`;
    bottom.append(details, time); item.append(top, bottom); fragment.append(item);
  }
  $('alertsList').replaceChildren(fragment); $('emptyInbox').hidden = events.length > 0;
  hasTradingView = events.some(event => event.source === 'TradingView');
  $('connectionStatus').textContent = hasTradingView ? 'Des alertes TradingView ont été reçues' : 'Réception disponible · en attente de TradingView';
}
async function refresh() {
  if (busy) return; busy = true; $('refreshAlerts').disabled = true;
  try {
    const data = await api();
    if (!Array.isArray(data.events)) throw new Error('Réponse de réception invalide.');
    render(data.events); hadSuccess = true;
    $('checkedAt').textContent = `Vérifié à ${new Date().toLocaleTimeString('fr-FR')}`;
    $('connectionStatus').parentElement.classList.toggle('is-ready', hasTradingView);
    $('connectionStatus').parentElement.classList.remove('is-stale'); $('feedError').hidden = true;
  } catch (error) {
    $('feedError').textContent = error.message; $('feedError').hidden = false;
    $('connectionStatus').textContent = hadSuccess ? 'Actualisation interrompue · dernières données conservées' : 'Réception non vérifiée';
    $('connectionStatus').parentElement.classList.remove('is-ready'); $('connectionStatus').parentElement.classList.add('is-stale');
  } finally { busy = false; $('refreshAlerts').disabled = false; }
}
function feedback(message, error = false) { $('setupFeedback').textContent = message; $('setupFeedback').classList.toggle('is-error', error); }
function updateMessage() {
  $('alertMessage').value = JSON.stringify({ name: $('alertName').value.trim() || 'Mon alerte', symbol: '{{exchange}}:{{ticker}}', price: '{{close}}', interval: '{{interval}}', triggeredAt: '{{timenow}}' }, null, 2);
}
async function copy(id, label) {
  const field = $(id);
  try { await navigator.clipboard.writeText(field.value); feedback(`${label} copié. Colle-le dans TradingView.`); }
  catch { if (field.type === 'password') field.type = 'text'; field.focus(); field.select(); feedback('Le texte est sélectionné. Utilise Copier, puis colle-le dans TradingView.'); }
}
$('refreshAlerts').addEventListener('click', refresh);
$('alertName').addEventListener('input', updateMessage);
$('copyMessage').addEventListener('click', () => copy('alertMessage', 'Message'));
$('copyUrl').addEventListener('click', () => copy('webhookUrl', 'Lien'));
$('showSetup').addEventListener('click', async () => {
  $('showSetup').disabled = true;
  try { const data = await api('/setup'); $('webhookUrl').value = data.webhookUrl; $('webhookFields').hidden = false; $('showSetup').hidden = true; feedback('Copie l’adresse dans le champ URL du webhook de ton alerte.'); }
  catch (error) { feedback(error.message, true); }
  finally { $('showSetup').disabled = false; }
});
$('testAlerts').addEventListener('click', async () => {
  $('testAlerts').disabled = true;
  try { await api('/test', { method: 'POST', headers: { 'X-Nykuto-Action': 'test-alert' } }); feedback('Test enregistré. Il peut mettre environ une minute à apparaître ; il ne confirme pas la connexion TradingView.'); await refresh(); }
  catch (error) { feedback(error.message, true); }
  finally { $('testAlerts').disabled = false; }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
setInterval(() => { if (!document.hidden) refresh(); }, 30000);
updateMessage(); refresh();
