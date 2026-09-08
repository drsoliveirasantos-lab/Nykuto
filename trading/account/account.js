(async () => {
  'use strict';
  const $ = id => document.getElementById(id), app = window.Nykuto;
  const node = (tag, text, cls) => { const n = document.createElement(tag); n.textContent = text; if (cls) n.className = cls; return n; };
  await app.ready; const user = app.user; if (!user) return;
  $('identity').textContent = `${user.email} · ${user.role === 'owner' ? 'Responsable du site' : 'Compte testeur'}`;
  $('firstName').value = user.firstName; $('lastName').value = user.lastName;
  $('welcome').textContent = user.complete ? `Bonjour ${user.firstName}` : 'Crée ton profil pour commencer';
  $('personalSpace').hidden = !user.complete;
  $('profileForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.submitter; button.disabled = true;
    try { const data = await app.api('/api/account', { method: 'PUT', body: JSON.stringify({ firstName: $('firstName').value, lastName: $('lastName').value }) }); app.updateUser(data.user); location.assign('/account/'); }
    catch (error) { $('profileStatus').textContent = error.message; button.disabled = false; }
  });
  if (!user.complete) return;
  $('profileIntro').textContent = 'Ton adresse e-mail vérifiée sert d’identifiant. Tu peux mettre à jour ton prénom et ton nom.';
  $('profileForm').querySelector('button').textContent = 'Enregistrer mon profil';
  const connections = app.read('connections', { tradingViewName: '', broker: '', mode: 'paper' });
  $('tradingViewName').value = connections.tradingViewName; $('broker').value = connections.broker; $('tradingMode').value = connections.mode;
  $('connectionsForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.submitter; button.disabled = true;
    try { await app.set('connections', { tradingViewName: $('tradingViewName').value.trim(), broker: $('broker').value.trim(), mode: $('tradingMode').value }); $('connectionsStatus').textContent = 'Préférences sauvegardées. Le courtier reste non connecté.'; }
    catch (error) { $('connectionsStatus').textContent = error.message; } finally { button.disabled = false; }
  });
  const statuses = { new: 'À examiner', reviewing: 'En cours', done: 'Traité' }, categories = { bug: 'Problème', confusing: 'Clarté', idea: 'Idée', connection: 'Connexion' };
  let offset = 0, feedbackId = crypto.randomUUID();
  $('feedbackListTitle').textContent = user.role === 'owner' ? 'Tous les retours des testeurs' : 'Mes retours et les réponses';
  async function refresh(append = false) {
    $('refreshFeedback').disabled = true; $('moreFeedback').disabled = true;
    try {
      const data = await app.api(`/api/account/feedback?offset=${append ? offset : 0}`);
      if (!append) $('feedbackList').replaceChildren();
      for (const item of data.feedback) {
        const record = node('article', '', 'feedback-record');
        record.append(node('strong', `${categories[item.category]} · ${statuses[item.status]}`), node('p', `${item.first_name} ${item.last_name} · ${new Date(item.created_at).toLocaleString('fr-FR')} · ${item.page}`, 'feedback-meta'), node('p', item.message));
        if (item.response) record.append(node('p', `Réponse de Diego : ${item.response}`, 'feedback-response'));
        if (user.role === 'owner') {
          const form = document.createElement('form'), select = document.createElement('select'), input = document.createElement('textarea'); input.rows = 2; input.maxLength = 2000; input.value = item.response;
          for (const [value, label] of Object.entries(statuses)) { const option = node('option', label); option.value = value; select.append(option); } select.value = item.status;
          const label = node('label', 'Suivi'), responseLabel = node('label', 'Réponse au testeur'); label.append(select); responseLabel.append(input);
          const button = node('button', 'Enregistrer le suivi', 'ghost-button'); button.type = 'submit'; const message = node('p', ''); message.setAttribute('role', 'status'); form.append(label, responseLabel, button, message);
          form.addEventListener('submit', async event => { event.preventDefault(); button.disabled = true; try { await app.api('/api/account/feedback', { method: 'PATCH', body: JSON.stringify({ id: item.id, status: select.value, response: input.value }) }); await refresh(); } catch (error) { message.textContent = error.message; } finally { button.disabled = false; } }); record.append(form);
        }
        $('feedbackList').append(record);
      }
      offset = data.offset + data.feedback.length; $('moreFeedback').hidden = !data.hasMore;
      $('feedbackLoadStatus').textContent = offset ? 'Retours sauvegardés · actualise pour voir les dernières réponses.' : 'Aucun retour pour le moment.';
    } catch (error) { $('feedbackLoadStatus').textContent = error.message; } finally { $('refreshFeedback').disabled = false; $('moreFeedback').disabled = false; }
  }
  $('refreshFeedback').addEventListener('click', () => refresh()); $('moreFeedback').addEventListener('click', () => refresh(true));
  $('feedbackForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.submitter; button.disabled = true;
    try { await app.api('/api/account/feedback', { method: 'POST', body: JSON.stringify({ id: feedbackId, category: $('feedbackCategory').value, page: $('feedbackPage').value, message: $('feedbackMessage').value }) }); feedbackId = crypto.randomUUID(); $('feedbackForm').reset(); $('feedbackStatus').textContent = 'Retour envoyé dans le site. Tu retrouveras son suivi et la réponse ici.'; await refresh(); }
    catch (error) { $('feedbackStatus').textContent = error.message; } finally { button.disabled = false; }
  });
  if (user.role === 'owner') {
    const keys = ['nykuto-trading-settings-v1', 'nykuto-trading-trades-v1', 'nykuto-trading-checklist-v1', 'nykuto-trading-preparations-v1', 'nykuto-trading-pause-until-v1', 'nykuto-trading-strategy-lab-v1'];
    try { $('migration').hidden = !keys.some(key => localStorage.getItem(key) !== null); } catch { /* No legacy storage is required. */ }
    $('migrateData').addEventListener('click', async event => {
      event.target.disabled = true; let copied = 0, skipped = 0;
      try { for (const key of keys) { const raw = localStorage.getItem(key); if (raw === null) continue; if (app.has(key)) { skipped++; continue; } await app.set(key, JSON.parse(raw)); copied++; } $('migrationStatus').textContent = `${copied} rubrique(s) copiée(s). ${skipped} déjà présente(s) en ligne, préservée(s).`; }
      catch (error) { $('migrationStatus').textContent = `${copied} rubrique(s) copiée(s). Suite interrompue : ${error.message}`; } finally { event.target.disabled = false; }
    });
  }
  await refresh();
})().catch(error => window.Nykuto.status(error.message));
