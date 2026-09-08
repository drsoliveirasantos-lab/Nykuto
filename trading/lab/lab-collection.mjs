const byId = id => document.getElementById(id);
const formatDate = value => new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

async function refresh() {
  const button = byId('collectionRefresh'), message = byId('collectionMessage');
  button.disabled = true;
  message.textContent = 'Lecture du journal de collecte…';
  byId('collectionResults').hidden = true;
  try {
    const response = await fetch('/api/lab/jeu08', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Reconnecte-toi au site pour lire la collecte.');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Collecte indisponible.');
    if (data.protocol !== 'jeu08-mnqz6-v1' || !Array.isArray(data.rows)) throw new Error('Journal de collecte inattendu.');
    const missing = data.rows.filter(r => r.due && !r.complete);
    byId('collectionStatus').textContent = data.archiveComplete ? 'ARCHIVE À AUDITER' : missing.length ? 'COLLECTE À COMPLÉTER' : data.due ? 'COLLECTE EN COURS' : 'EN ATTENTE DES SÉANCES';
    byId('collectionAutomation').textContent = data.automationScheduled ? 'Collecte quotidienne programmée' : 'Collecte automatique non programmée';
    byId('collectionPrep').textContent = `${data.prepComplete} / ${data.prepPlanned} séances`;
    byId('collectionTest').textContent = `${data.testComplete} / ${data.testPlanned} séances`;
    byId('collectionCoverage').textContent = `${data.complete} / ${data.due} séances terminées`;
    byId('collectionUpdated').textContent = `Journal mis à jour le ${formatDate(data.updatedAt)} · ${data.bars} bougies archivées.`;
    message.textContent = data.lastAttempt?.outcome === 'error' ? 'La dernière collecte a rencontré une erreur. Les données déjà reçues sont conservées.' : missing.length ? `${missing.length} séance(s) terminée(s) restent à compléter. La collecte passe le lendemain matin.` : data.archiveComplete ? 'Les données sont réunies. L’audit et le calcul restent à effectuer.' : 'Les prochaines séances seront archivées après leur clôture. Aucun résultat de performance n’est encore calculé.';
    const body = byId('collectionRows'); body.replaceChildren();
    for (const row of data.rows.filter(r => r.due || r.collectedAt).reverse()) {
      const tr = document.createElement('tr');
      for (const value of [row.date, row.phase === 'prep' ? 'Préparation' : 'Test', `${row.bars}/${row.expectedBars}`, row.schedule ? 'Reçus' : 'Manquants', row.complete ? 'Collectée' : row.reasons.join(' · ')]) {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      }
      body.append(tr);
    }
    byId('collectionEmpty').hidden = data.due > 0;
    byId('collectionResults').hidden = false;
  } catch (error) {
    byId('collectionStatus').textContent = 'LECTURE INDISPONIBLE';
    message.textContent = error.name === 'TimeoutError' ? 'Le chargement a pris trop de temps. Réessaie dans un instant.' : error.message;
  } finally { button.disabled = false; }
}

byId('collectionRefresh')?.addEventListener('click', refresh);
if (byId('collectionRefresh')) refresh();
