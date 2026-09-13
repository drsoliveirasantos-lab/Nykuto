(() => {
  'use strict';
  const states = new Map(); let user = null, pending = 0;
  const status = text => { let el = document.getElementById('accountSyncStatus'); if (!el && document.body) { el = document.createElement('p'); el.id = 'accountSyncStatus'; el.setAttribute('role', 'status'); el.style.cssText = 'padding:10px 20px;margin:0;background:#142238;color:#e9f2ff;font-size:12px;'; document.body.prepend(el); } if (el) el.textContent = text; };
  async function api(path, options = {}) {
    let response;
    try { response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000), ...options, headers: { ...(user ? { 'X-Nykuto-User': user.id } : {}), ...(options.body ? { 'Content-Type': 'application/json', 'X-Nykuto-Action': 'account-write', 'X-Nykuto-User': user?.id || '' } : {}), ...options.headers } }); } catch { throw new Error('Connexion interrompue. Recharge pour vérifier si la sauvegarde a abouti.'); }
    if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error('Recharge la page pour te reconnecter.');
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Sauvegarde indisponible.'); return data;
  }
  const ready = (async () => {
    try {
      user = (await api('/api/account')).user;
      if (!user.complete) { if (!location.pathname.startsWith('/account')) location.replace('/account/'); return; }
      const data = await api('/api/account/state');
      if (data.userId !== user.id) throw new Error('Le compte a changé. Recharge la page.');
      data.states.forEach(s => states.set(s.key, s));
    } catch (error) { await new Promise(resolve => { if (document.body) resolve(); else document.addEventListener('DOMContentLoaded', resolve, { once: true }); }); status(`Compte indisponible : ${error.message}`); throw error; }
  })();
  ready.catch(() => {});
  let queue = Promise.resolve();
  function update(key, transform) {
    pending++;
    const work = queue.then(async () => {
      await ready; if (!user?.complete) throw new Error('Complète ton profil.');
      const snapshot = structuredClone(transform(structuredClone(states.get(key)?.value)));
      status('Sauvegarde en cours…');
      const result = await api('/api/account/state', { method: 'PUT', body: JSON.stringify({ key, value: snapshot, revision: states.get(key)?.revision || 0 }) });
      states.set(key, { key, value: snapshot, revision: result.revision });
      status('Sauvegardé dans ton compte.');
    });
    queue = work.catch(error => { status(`Sauvegarde non confirmée : ${error.message}`); }).finally(() => { pending--; });
    return work;
  }
  window.Nykuto = {
    ready, api, set: (key, value) => { const copy = structuredClone(value); return update(key, () => copy); }, update, get user() { return user; },
    read: (key, fallback) => structuredClone(states.has(key) ? states.get(key).value : fallback),
    has: key => states.has(key), status,
    updateUser: value => { user = value; }
  };
  window.addEventListener('beforeunload', event => { if (pending) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  // Memory belongs to this document only: no journal, identity or emotion cache on disk.
})();
