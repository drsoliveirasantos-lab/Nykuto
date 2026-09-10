# Jeu45 — Horaires et sortie des positions stagnantes

Préparation du 10 septembre 2026, avant toute nouvelle performance. Diego demande de tester les horaires et une amélioration du bénéfice par trade. Une campagne bornée est autorisée ; aucun réglage après résultat.

## Paramètres exécutables

<!-- POLICY45:START -->
```json
{
  "policy": {
    "version": "jeu45-sessions-time-exit-v1",
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
    "executionCount": 112,
    "missingSessionPolicy": "exclude-entire-common-session-carry-account-no-assumed-pnl",
    "winterPreparation": "available-complete-sessions-from-2026-01-01-no-december",
    "summerPreparation": "exact-game37-may-warmup-june-july-historical-august",
    "independent": false,
    "confirmed": false,
    "selection": null,
    "executionAllowed": false,
    "reference": "jeu40-fixed100",
    "londonTimeZone": "Europe/London",
    "newYorkTimeZone": "America/New_York",
    "londonOpenMinute": 480,
    "londonCloseMinuteExclusive": 990,
    "londonCalendar": "conventional-cash-session-with-england-wales-bank-holidays",
    "londonClosedDates": [
      "2026-01-01",
      "2026-04-03",
      "2026-04-06",
      "2026-05-04",
      "2026-05-25",
      "2026-08-31"
    ],
    "entryWindow": "unchanged-10:10-to-12:00-New-York-MGC-before-11:00",
    "sessionScope": "existing-US-morning-signals-only-no-Asian-or-European-opening-prices",
    "outsideLondonIncludes": "post-16:30-London-and-London-bank-holidays-labelled-separately",
    "timeExitMinutes": 30,
    "timeExitCheck": "exactly-six-closed-M5-bars-after-entry-once",
    "timeExitCondition": "estimated-net-at-closed-price-less-than-or-equal-to-zero",
    "timeExitFill": "next-open-after-decision-existing-gap-risk-and-target-priority",
    "timeExitCosts": "same-round-trip-costs-including-existing-slippage-factor",
    "intrabarPolicy": "existing-stop-first-no-same-slot-readmission",
    "newConfigurations": 6,
    "exactControls": 16,
    "accountPrefixes": 2296,
    "filterPrefixes": 2296,
    "contextPrefixes": 2296,
    "parameterSearch": false,
    "combinedVariants": false,
    "modelInferences": 0,
    "criterion": "all-16-cells-net-and-realized-drawdown-nondegradation-plus-strict-net-improvement-and-higher-aggregate-mean-trade-at-both-costs"
  },
  "variants": [
    {
      "id": "baseline",
      "targetSymbol": null,
      "mechanism": null,
      "label": "Référence Jeu40"
    },
    {
      "id": "mnq-london-overlap",
      "targetSymbol": "MNQ",
      "mechanism": "london-overlap",
      "label": "MNQ · london-overlap"
    },
    {
      "id": "mes-london-overlap",
      "targetSymbol": "MES",
      "mechanism": "london-overlap",
      "label": "MES · london-overlap"
    },
    {
      "id": "mnq-outside-london",
      "targetSymbol": "MNQ",
      "mechanism": "outside-london",
      "label": "MNQ · outside-london"
    },
    {
      "id": "mes-outside-london",
      "targetSymbol": "MES",
      "mechanism": "outside-london",
      "label": "MES · outside-london"
    },
    {
      "id": "mnq-time-exit30",
      "targetSymbol": "MNQ",
      "mechanism": "time-exit30",
      "label": "MNQ · time-exit30"
    },
    {
      "id": "mes-time-exit30",
      "targetSymbol": "MES",
      "mechanism": "time-exit30",
      "label": "MES · time-exit30"
    }
  ]
}
```
<!-- POLICY45:END -->

## Six adaptations isolées

La référence reste le portefeuille complet Jeu40 fixed100, MNQ/MES/MGC et MYM exclu. Pour chacun des deux indices MNQ puis MES, tester séparément : entrées pendant le chevauchement cash conventionnel avec Londres ; entrées hors de ce chevauchement ; sortie temporelle à 30 minutes si le net latent estimé est non positif. Aucun cumul des règles, aucune hausse de risque, aucune cible 3R et aucun nouveau modèle. MGC conserve ses règles et son arrêt d'admission avant 11h.

Le chevauchement est un **repère horaire conventionnel**, pas une mesure du volume londonien ni du marché Forex. Il utilise 08:00 inclus–16:30 exclu Europe/London, avec weekends et jours fériés anglais/gallois exclus. Les dates officielles des jours fériés sont figées dans la politique. Le calendrier boursier LSE complet n'a pas été extrait ; fermetures exceptionnelles et prolongations d'enchères restent non observées. Les jours fériés sont comptés séparément dans les résultats hors Londres. New York et Londres changent d'heure à des dates différentes : le code utilise leurs deux fuseaux, jamais un décalage fixe. À 16:30 Londres, le signal appartient déjà à hors-Londres.

Aucun signal n'est créé hors de la fenêtre originale : premières entrées possibles 10:10, dernières 12:00 New York sur indices. Le découpage compare donc uniquement les occasions matinales déjà produites. Le créneau après Londres peut être court et, pendant le décalage des changements d'heure de mars, absent avant midi. Ce test ne compare pas l'ouverture asiatique, l'ouverture européenne, ni de nouvelles entrées de l'après-midi américain. L'archive ne contient que les séances cash américaines complètes. Les tableaux horaires sont descriptifs, sans choisir le meilleur créneau après lecture.

## Sortie temporelle et espérance par trade

Objectif de recherche : augmenter la moyenne des gains et pertes nets de **tous** les trades, sans augmenter la taille. Le bénéfice moyen des seuls gagnants, le taux de réussite et le total mensuel sont publiés séparément.

Une seule décision, exactement après six bougies M5 complètes depuis l'ouverture d'entrée (30 minutes). La bougie doit d'abord avoir survécu aux stops, limites de risque et cible historiques. Calculer au prix de clôture : signe × (clôture − entrée) × multiplicateur × quantité − coûts aller-retour du scénario. Si ce net estimé est inférieur ou égal à zéro, demander une sortie à l'ouverture suivante. S'il est positif, conserver la stratégie originale ; ne pas recommencer cette vérification toutes les cinq minutes.

Aucune sortie fictive à la clôture ayant fourni la décision. À l'ouverture suivante, les gaps de limite de compte/journalière, stop et cible gardent leur priorité historique ; sinon sortir à cette ouverture avec les coûts existants. Ne pas lire les extrêmes futurs de cette bougie pour améliorer le remplissage. Le créneau M5 complet reste occupé, même en cas de sortie à son ouverture. Les sorties libèrent éventuellement des occasions ultérieures, qui doivent être rejouées avec les quotas et limites du compte entier. La sortie de fin de séance et tous les stops initiaux restent inchangés ; aucune réentrée forcée ni stop déplacé.

Une position stagnante peut devenir gagnante plus tard : le test doit compter ces gagnants sacrifiés ainsi que les pertes réduites et les nouvelles admissions. Le seuil de 30 minutes correspond à six M5, fixé avant la performance ; aucun balayage de durées. Cette hypothèse diffère des cibles 3R rejetées au Jeu35, du break-even à 1R et du veto MNQ avant11h rejeté au Jeu39. Ces variantes rejetées ne sont pas reprises.

## Données, comparaisons et critères

Janvier–août 2026, huit comptes funded hypothétiques de 50 000 USD réinitialisés, coûts normaux puis doublés : 112 relectures, dont 16 témoins entiers exactement identiques aux archives Jeu40. Même préparation historique, risque prévu maximal100 USD coûts compris, limite quotidienne200 USD, cible2R, une position, deux entrées par jour, mêmes quantités entières et freins. Les gaps peuvent dépasser le budget nominal. Ne pas agréger ces comptes mensuels comme un compte continu.

164/166 séances communes disponibles. Les25février et6mars sont absents et non chiffrés ; février/mars restent partiels. Les états de compte sont portés sans gain/perte supposé pendant les exclusions. Prix natifs et comptes témoins vérifiés par tailles et SHA256. Toutes ces observations sont déjà vues et ne constituent pas une confirmation indépendante.

Pour chaque variante : les16 cellules mois/coût doivent avoir un net non inférieur, un drawdown réalisé non supérieur, aucun dépassement de compte, et au moins une amélioration stricte du net. De plus, la moyenne nette de tous les trades agrégés doit dépasser celle de référence aux deux niveaux de coûts. Une meilleure moyenne obtenue au prix d'un mauvais total mensuel ne suffit pas. Échantillon vide ou moyenne indéfinie échoue au critère. Même si ce filtre descriptif passe : pas de sélection ni d'activation automatique.

Publier total et moyenne nette, gains moyens des gagnants et pertes moyennes, taux de réussite, profit factor net, coûts, nombre de trades, durées (borne basse M5), drawdowns mensuels, objectifs/retraits, heures et catégories de séance par instrument. Rapprocher exactement l'écart : trades communs modifiés, gagnants/perdants retirés et nouvelles admissions. Les conséquences sur les autres marchés sont incluses. Les catégories de séance sont définies par l'heure d'entrée ; leur résultat n'est pas un effet causal du seul horaire.

Contrôles de chaque préfixe quotidien : reconstruction des contextes, filtres et comptes, 2296 par couche. Tests synthétiques : long/short, six M5, seuil net zéro avec frais, coût doublé, décision unique, priorité stop/cible et gaps, absence d'utilisation des extrêmes futurs à une sortie d'ouverture, quota/occupation et calendrier été/hiver. Le moteur dérivé sans sortie temporelle doit reproduire les16 comptes complets de référence. Les tests logiciels ne sont pas des résultats financiers.

## Publication et lancement unique

Gel et dépendances publiés dans une branche dédiée avant tout calcul de performance. Le runner exige ce commit, refuse un dossier de sortie existant et écrit progression, état final et empreintes. En cas d'échec, conserver les sorties et diagnostiquer ; aucun redémarrage implicite. Les registres103/catalogue120 restent l'historique achevé jusqu'à vérification des résultats.

Rapport détaillé et trades restent privés ; code, hypothèses et agrégats vérifiés peuvent être publiés. Aucune modification d'un gel historique, de main, de la collecteJeu08, de l'audit du3décembre, des poids Kronos, ni activation Paper/Shadow/broker.

Après lancement confirmé, annoncer une durée estimée et arrêter. Attendre le prochain « Vérifie » de Diego pour une seule lecture, sans surveillance GitHub ni autre campagne.
