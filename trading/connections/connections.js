import { PROVIDERS, matchingProviders, selectionFor, makePreference } from './catalog.mjs';

const $ = id => document.getElementById(id);
const node = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
const defaults = { tradingViewName: '', broker: '', mode: 'paper' };

async function start() {
  const app = window.Nykuto;
  if (!app) throw new Error('Session indisponible. Recharge la page pour te reconnecter.');
  await app.ready;
  if (!app.user?.complete) return;
  const initial = app.read('connections', defaults);
  let selected = selectionFor(initial), saving = false;
  $('usageMode').value = initial.mode;
  $('customName').value = selected === 'other' ? initial.broker : '';

  function showSaved() {
    const saved = app.read('connections', defaults);
    $('savedChoice').textContent = saved.broker ? `Préférence enregistrée : ${saved.broker}. Aucune connexion au broker.` : 'Aucune préférence enregistrée.';
  }
  function showSelection() {
    const provider = PROVIDERS.find(p => p.id === selected);
    $('selectionLabel').textContent = selected === 'other' ? ($('customName').value.trim() || 'Autre environnement') : (provider?.name || 'Aucun');
    $('customField').hidden = selected !== 'other';
    $('customName').required = selected === 'other';
    $('saveChoice').disabled = !selected || saving;
  }
  function render() {
    const providers = matchingProviders($('providerSearch').value, $('providerCategory').value);
    $('providerGrid').replaceChildren(...providers.map(provider => {
      const label = node('label', '', 'provider-card'), input = document.createElement('input');
      input.type = 'radio'; input.name = 'provider'; input.value = provider.id; input.checked = provider.id === selected; input.disabled = saving;
      input.setAttribute('aria-label', `${provider.name} · ${provider.status}`);
      input.addEventListener('change', () => { selected = provider.id; $('saveStatus').textContent = 'Choix modifié. Enregistre pour le retrouver dans ton compte.'; showSelection(); });
      const mark = node('span', provider.mark, 'provider-mark'); mark.setAttribute('aria-hidden', 'true');
      label.append(input, mark, node('span', provider.type, 'provider-type'), node('span', provider.name, 'provider-name'), node('span', provider.description, 'provider-description'), node('span', provider.status, 'provider-status'));
      return label;
    }));
    $('noResults').hidden = providers.length > 0;
    $('resultCount').textContent = `${providers.length} résultat${providers.length === 1 ? '' : 's'}`;
  }
  for (const id of ['providerSearch', 'providerCategory']) $(id).addEventListener('input', render);
  $('customName').addEventListener('input', showSelection);
  $('usageMode').addEventListener('change', () => { $('saveStatus').textContent = 'Utilisation modifiée. Enregistre pour la sauvegarder.'; });
  $('providerForm').addEventListener('submit', async event => {
    event.preventDefault(); if (saving) return;
    saving = true; showSelection();
    const providerId = selected, customName = $('customName').value, mode = $('usageMode').value;
    // Capture this submission; preserve other connection fields at the queued write.
    for (const el of $('providerForm').elements) el.disabled = true;
    $('saveStatus').textContent = 'Enregistrement de ton choix…';
    try {
      await app.update('connections', previous => makePreference(previous, providerId, customName, mode));
      showSaved();
      $('saveStatus').textContent = 'Choix sauvegardé dans ton compte. Aucune connexion activée, aucun ordre envoyé.';
    } catch (error) { $('saveStatus').textContent = `Sauvegarde non confirmée : ${error.message}`; }
    finally { saving = false; for (const el of $('providerForm').elements) el.disabled = false; showSelection(); }
  });
  render(); showSelection(); showSaved();
  $('loadStatus').textContent = ''; $('providerForm').hidden = false;
}
start().catch(error => { $('loadStatus').textContent = error.message; });
