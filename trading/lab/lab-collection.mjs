const byId = id => document.getElementById(id);
const formatDate = value => new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

export function collectionCopy(data) {
  const missing = data.rows.filter(r => r.due && !r.complete);
  if (data.archiveComplete) return { badge: 'Données réunies', headline: 'La collecte est terminée', message: 'Les séances sont archivées. Il reste à auditer les données, puis à calculer le résultat du test.', action: 'Prochaine étape : l’audit', note: 'La rentabilité et le passage à l’argent fictif ne sont pas encore validés.', tone: 'active' };
  if (data.lastAttempt?.outcome === 'error') return { badge: 'À vérifier', headline: 'La collecte a rencontré un problème', message: 'La dernière tentative a échoué. Les séances déjà reçues sont conservées dans le journal.', action: 'Consulter les séances manquantes', note: 'Ouvre le journal ci-dessous pour voir ce qui reste à recevoir.', tone: 'warning' };
  if (!data.automationScheduled) return { badge: 'Non programmée', headline: 'La collecte automatique n’est pas programmée', message: 'Le protocole est préparé, mais la programmation doit être vérifiée avant les prochaines séances.', action: 'Faire vérifier la programmation', note: 'Actualiser cette page ne lance pas la collecte des prix.', tone: 'warning' };
  if (data.asOf.slice(0, 10) > '2026-12-02') return { badge: 'Données incomplètes', headline: 'La période de collecte est terminée', message: `${missing.length} séance(s) restent incomplètes. Le résultat ne peut pas être calculé sans examen des manques.`, action: 'Examiner le journal', note: 'Les données reçues restent disponibles ; le bot reste désactivé.', tone: 'warning' };
  if (!data.due) return { badge: 'Collecte programmée', headline: 'Le Jeu 08 est préparé', message: 'La collecte démarre après les prochaines séances. Les résultats du test ne sont pas encore disponibles.', action: 'Rien à lancer aujourd’hui', note: 'Première collecte le 10 septembre. Aucun fichier à télécharger.', tone: 'planned' };
  return { badge: 'Collecte en cours', headline: 'Les séances sont recueillies automatiquement', message: missing.length ? `${missing.length} séance(s) terminée(s) restent à compléter. Le passage automatique a lieu le lendemain matin.` : 'Toutes les séances terminées ont été reçues. La collecte continue sur les dates prévues.', action: 'Laisser la collecte se poursuivre', note: 'Tu peux consulter son avancement ici. Les résultats viendront après la période de test et l’audit.', tone: 'planned' };
}

async function refresh() {
  const button = byId('collectionRefresh'), message = byId('collectionMessage');
  button.disabled = true;
  message.textContent = 'Lecture du journal de collecte…';
  byId('collectionHeadline').textContent = 'Vérification de l’état…';
  byId('collectionAction').textContent = 'Vérification en cours';
  byId('collectionActionNote').textContent = 'Lecture de la dernière mise à jour enregistrée.';
  byId('collectionResults').hidden = true;
  try {
    const response = await fetch('/api/lab/jeu08', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Reconnecte-toi au site pour lire la collecte.');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Collecte indisponible.');
    if (data.protocol !== 'jeu08-mnqz6-v1' || !Array.isArray(data.rows)) throw new Error('Journal de collecte inattendu.');
    const copy = collectionCopy(data);
    byId('collectionStatus').textContent = copy.badge;
    byId('collectionStatus').className = `lab-status ${copy.tone}`;
    byId('collectionHeadline').textContent = copy.headline;
    byId('collectionAction').textContent = copy.action;
    byId('collectionActionNote').textContent = copy.note;
    byId('collectionAutomation').textContent = data.automationScheduled ? 'Collecte quotidienne programmée' : 'Collecte automatique non programmée';
    byId('collectionPrep').textContent = `${data.prepComplete} / ${data.prepPlanned} séances`;
    byId('collectionTest').textContent = `${data.testComplete} / ${data.testPlanned} séances`;
    byId('collectionCoverage').textContent = data.due ? `${data.complete} / ${data.due} complètes` : 'Aucune séance terminée';
    byId('collectionUpdated').textContent = `Journal mis à jour le ${formatDate(data.updatedAt)} · ${data.bars} bougies archivées.`;
    message.textContent = copy.message;
    byId('collectionPrepProgress').max = data.prepPlanned;
    byId('collectionPrepProgress').value = data.prepComplete;
    byId('collectionTestProgress').max = data.testPlanned;
    byId('collectionTestProgress').value = data.testComplete;
    byId('collectionPrepStage').className = data.prepComplete === data.prepPlanned ? 'is-complete' : data.asOf.slice(0, 10) < '2026-10-01' ? 'is-current' : '';
    byId('collectionTestStage').className = data.testComplete === data.testPlanned ? 'is-complete' : data.asOf.slice(0, 10) >= '2026-10-01' ? 'is-current' : '';
    byId('collectionAuditStage').className = data.archiveComplete ? 'is-current' : '';
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
    byId('collectionStatus').textContent = 'État indisponible';
    byId('collectionStatus').className = 'lab-status warning';
    byId('collectionHeadline').textContent = 'L’état de la collecte n’a pas pu être lu';
    byId('collectionAction').textContent = 'Réessayer ou te reconnecter';
    byId('collectionActionNote').textContent = 'Cette erreur de lecture ne permet pas de savoir si la dernière collecte a réussi.';
    byId('collectionUpdated').textContent = '';
    message.textContent = error.name === 'TimeoutError' ? 'Le chargement a pris trop de temps. Réessaie dans un instant.' : error.message;
  } finally { button.disabled = false; }
}

if (typeof document !== 'undefined') {
  byId('collectionRefresh')?.addEventListener('click', refresh);
  if (byId('collectionRefresh')) refresh();
}
