# Jeu43 — Entrée normalisée par la fenêtre passée

Statut au gel : préparé, aucune performance de cette nouvelle hypothèse calculée. Une seule campagne autorisée. Ce document historique restera inchangé après le calcul.

Deux variantes indépendantes : veto d'extension sur MNQ seulement, ou sur MES seulement. Le témoin est Jeu40 / Jeu37 fixed100. Pas de combinaison des variantes ni du veto rejeté Jeu42.

Pour chaque signal, reconstruire64 M15 complètes disponibles à cet instant depuis les M5 cash du contrat natif. Commencer au1janvier2026 ; redémarrer après changement de contrat ou séance manquante. Aucun high/low/close/volume de la M5 d'entrée n'est lu. Utiliser uniquement son open, les fenêtres closes et le signal déjà connu.

Moyenne et écart-type population des64 clôtures. Distance signée = `(entryOpen - rangeHigh)` pour Long, `(rangeLow - entryOpen)` pour Short. Extension = distance / `(écart-type + 1e-5)`. Veto uniquement si extension >1. Sans fenêtre complète/courante, ou si écart-type nul : décision de référence et motif explicite non observable. Toute donnée incohérente/non causale provoque une erreur.

Les autres colonnes OHLCV et le calendrier New York sont diagnostiques. Le seuil1 est une hypothèse Nykuto fixée sans recherche de performance, pas une règle gagnante de Kronos/SMB. Aucun modèle n'est interrogé ; le risque, stops et objectif2R restent ceux du témoin.

<!-- POLICY43:START -->
```json
{
  "policy": {
    "version": "jeu43-normalized-entry-v1",
    "from": "2026-01-01",
    "end": "2026-09-01",
    "variant": null,
    "mode": "funded",
    "accountInitialUSD": 50000,
    "riskMaximumUSD": 100,
    "dailyLossUSD": 200,
    "targetR": 2,
    "reset": "new-account-each-month",
    "expectedSessions": 166,
    "availableCommonSessions": 164,
    "executionCount": 48,
    "missingSessionPolicy": "exclude-entire-common-session-carry-account-no-assumed-pnl",
    "winterPreparation": "available-complete-sessions-from-2026-01-01-no-december",
    "summerPreparation": "exact-game37-may-warmup-june-july-historical-august",
    "independent": false,
    "confirmed": false,
    "selection": null,
    "executionAllowed": false,
    "reference": "jeu40-fixed100",
    "contextBars": 64,
    "intervalSeconds": 900,
    "epsilon": 0.00001,
    "standardDeviation": "population",
    "maximumExtensionZ": 1,
    "normalization": "closed-window-column-mean-and-standard-deviation",
    "entryDistance": "side-signed-entry-open-minus-original-range-boundary",
    "equality": "allowed",
    "missingContext": "keep-reference-and-label-unobservable",
    "warmup": "cash-bars-from-january-reset-at-native-roll-or-missing-session",
    "exactControls": 16,
    "newConfigurations": 2,
    "accountPrefixes": 984,
    "filterPrefixes": 984,
    "contextPrefixes": 984,
    "normalizationPrefixes": 984,
    "criterion": "each-candidate-all-16-cells-net-and-realized-drawdown-nondegradation-plus-strict-net-improvement",
    "inferredProbabilities": false,
    "modelInferences": 0,
    "newsBacktest": false
  },
  "variants": [
    {
      "id": "baseline",
      "targetSymbol": null,
      "label": "Référence Jeu40"
    },
    {
      "id": "mnq-normalized-entry",
      "targetSymbol": "MNQ",
      "label": "MNQ · extension normalisée"
    },
    {
      "id": "mes-normalized-entry",
      "targetSymbol": "MES",
      "label": "MES · extension normalisée"
    }
  ]
}
```
<!-- POLICY43:END -->

48 relectures : huit mois × deux coûts × trois profils. 16 témoins JSON entiers identiques aux archives40. Reconstruire et comparer984 préfixes de compte, filtre, contexte historique et nouvelle normalisation chacun. Les deux nouveaux profils doivent être évalués séparément sur16 cellules mois/coût : aucun net dégradé, aucun drawdown réalisé accru, aucune rupture du compte et au moins une amélioration stricte du net. Aucune activation ou sélection automatique, même si le critère descriptif passe.

Compte50K funded supposé déjà qualifié, neuf chaque mois, risque maximal100USD coûts inclus, limite quotidienne200USD, cible2R et freins inchangés. MNQ/MES conservent leurs règles hors veto de leur propre variante, MGC inchangé, MYM exclu.

Janvier–août2026 déjà vus,164/166 séances. Les25février et6mars restent exclus, résultats inconnus/nulls, février et mars partiels. Ne pas extrapoler les deux dates ni leur attribuer zéro profit. CollecteJeu08 et rendez-vous3décembre inchangés.

Conserver net, drawdown, gains/pertes, jours/semaines, détails par marché, gagnants retirés, pertes évitées et nouvelles admissions indirectes. Les événements news ne sont pas observables dans ces sources ; aucun filtre news n'est simulé.

## Exécution et arrêt demandé

Publier le code et les empreintes avant performance. Exécuter depuis ce commit :

```bash
node scripts/build-trading-jeu43.mjs verify
node scripts/run-trading-jeu43.mjs /CHEMIN_PRIVE/sources /CHEMIN_PRIVE/jeu40 /CHEMIN_PRIVE/jeu43
```

Le runner écrit `status.json` et `progress.jsonl`, puis rapport et exécutions privés avec empreintes. Il refuse un dossier de sortie existant. Donner la durée estimée après confirmation du démarrage puis arrêter le suivi ; Diego demandera la vérification ultérieure. Les vérifications CI GitHub sont distinctes du backtest et ne doivent pas être présentées comme celui-ci.

À la prochaine demande : lire le statut, réutiliser le résultat s'il est terminé, diagnostiquer une erreur sans recalcul implicite ; après audit, archiver les sorties privées, ajouter les deux configurations réellement exécutées au registre/catalogue, puis publier le bilan et calendrier. Les anciens rapports/gels restent immuables. Aucun achat, ordre, broker, Paper/Shadow ou merge main.
