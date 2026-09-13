# Prochain contrôle Pullback — règle fixée avant les séances

**Statut du 9 septembre 2026 : suivi désactivé à la demande de Diego.**
Le Jeu 14 exploite immédiatement l'historique disponible. Ce document conserve
le protocole proposé ; il ne représente plus une tâche programmée.

Candidate du Jeu13 : `30-full-both`, signaux `pullback` dans
`jeu12-engine.mjs`. La sélection reste fixée ; ne pas passer au Short5min
ou à une autre variante si cette candidate échoue.

Le contrôle de juin2025 est positif mais insuffisant :8trades,12requis.
Les 54configurations historiques et tous leurs résultats restent archivés.

## Calendrier distinct des deux tâches existantes

- Contrat MNQZ6, expiration18décembre2026.
- Préparation9septembre–1eroctobre2026 inclus :17séances,221bougies30min
  attendues. Les16séances de septembre seules ne donnent que208bougies,
  moins que les220requises ; le1eroctobre est préparation pour ce contrôle.
- Évaluation2octobre–30novembre2026 inclus :41séances. Thanksgiving26novembre
  fermé ;27novembre clôture13:00 New York. Même calendrier que le Jeu08,
  sans modification de son découpage ou de ses résultats.
- Vérification après collecte, le3décembre2026. Cette nouvelle tâche reste
  distincte de la collecte MNQ et du test des huit variantes existants.

## Données et vérification

Auditer d'abord `jeu08/collection-v1.json` et ses captures/révisions : toutes
les séances prévues, prix et horaires complets, empreintes et délais48h.
Ne pas réécrire cet historique pour rendre un audit vert.

L'exécution utilise5min : récupérer les vrais prix5min MNQZ6 de cette période
après clôture, avec pagination complète, puis comparer chaque regroupement15min
aux captures prospectives vérifiées du Jeu08. Si divergence/trou, arrêter
le calcul et expliquer. Les données5min sont récupérées après la période,
pas archivées en direct par cette tâche : signaler cette limite même si les
agrégats15min correspondent. Aucun flux live ou Paper Trading connecté.

Conserver le snapshot5min et sa référence15min en stockage privé avec SHA256.
Préparer le groupe avec `inspectFiveGroup` et une définition/calendrier propres
à ce protocole ; ne pas utiliser `inspectJeu12` ou `inspectSixMonths`, qui
imposent d'autres dates. `signalsFor(candles,30,'pullback')` puis `simulateFive`
avec la configuration fixée et les coûts1/2. Même ATR, stop, target, pauses,
horaires, clôture et unités ; aucune optimisation.

## Verdict

Un seul contrôle : >=12trades, net/stress positifs, PF>=1,10 sans arrondi,
drawdown réalisé<=8R. Afficher tous les critères et les échecs. Une fenêtre
seule, légèrement inférieure à deux mois, ne remplace pas trois fenêtres
indépendantes ni une validation d'exécution Paper Trading.

Archiver un rapport privé et publier son résumé au Lab après validation
technique. Ne pas changer les comptes, historiques de membres, deux tâches
MNQ existantes, règles CI ni autres sites. Aucun ordre, abonnement ou bot activé.
Terminer la tâche après son bilan. En cas de problème transitoire d'accès,
au plus deux reprises espacées d'une heure sur la même tâche ; sinon arrêter
avec la cause exacte. Aucun essai adaptatif jusqu'à obtenir du vert.
