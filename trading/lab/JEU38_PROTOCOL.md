# Jeu 38 — Une correction d’entrée après audit des erreurs

Statut : préparé, performance non calculée. Une campagne ultérieure bornée est autorisée par Diego ; son rendez-vous est confirmé séparément par l’automation. Ce protocole, le code et les sources doivent être publiés et figés avant le premier résultat.

## Hypothèse unique

Sur MNQ seulement, éviter une continuation lorsque la structure M5 confirmée est explicitement opposée ET qu’un pivot confirmé opposant se trouve strictement entre le prix d’entrée et la cible 2R.

- Achat : structure `Short` et au moins un des deux derniers pivots hauts confirmés strictement au-dessus de l’entrée et strictement en dessous de la cible.
- Vente : structure `Long` et au moins un des deux derniers pivots bas confirmés strictement en dessous de l’entrée et strictement au-dessus de la cible.
- Un pivot exactement sur l’entrée ou la cible ne déclenche pas ce veto.
- `Mixed`, structure inconnue ou contexte absent ne prouvent pas une opposition. Ce nouveau filtre ne les refuse pas ; les contrôles existants continuent à s’appliquer.
- Les pivots sont les deux derniers fractals stricts à deux bougies de chaque côté conservés par `combinedContexts`, y compris un pivot provenant de la séance précédente tant que le contexte historique le conserve. Ils ne constituent pas une carte complète des niveaux.
- `confirmedAt <= signalClose`, `sourceTime < confirmedAt`, contexte aligné avec la bougie de signal clôturée. Le seul prix de la bougie d’entrée utilisé par le filtre est son ouverture. Aucun high/low/close futur.
- Le seuil de distance est la cible économique 2R déjà définie, pas une valeur recherchée sur les pertes. Deux conditions conjointes limitent l’étendue du changement ; aucun autre seuil ou poids n’est optimisé.

Il s’agit d’une traduction partielle de l’idée enregistrée dans `experiments/ema9-vwap-obstacle-filter-v1.json`. Le nouveau test ne met pas en œuvre toute cette idée, n’ajoute aucun filtre EMA/VWAP et ne prétend pas reproduire la méthode H1 20/50 des associés.

## Motivation et inconnue

La référence 100 $ passe de six gagnants sur sept MNQ en juin à deux sur huit en juillet, puis un sur cinq en août. Les gains moyens de l’ensemble du portefeuille augmentent alors que le taux de réussite baisse. La hausse des montants au Jeu 37 ne modifiait pas les règles de génération des signaux ; elle pouvait modifier leurs admissions et les quantités. Une simple attente M5 et une extension à 3R ont déjà été rejetées.

La structure et les pivots ci-dessus sont disponibles à l’entrée. On ne connaît pas encore le nombre de signaux qu’ils retireront ni leur performance. Une perte passée ne prouve pas qu’elle était identifiable à l’avance ; le filtre peut supprimer des gagnants.

## Référence et variables conservées

Référence exacte : Jeu 37 `fixed100`, compte funded 50K neuf au début de chaque mois, plafond nominal 100 $ frais compris, limite interne quotidienne 200 $, au plus deux trades par jour, une seule position, paliers de marge et réserve 100 $, sortie 2R et stops inchangés. Un premier retrait personnel simulé de 1 000 EUR peut précéder la poursuite vers 4 000 USD de PnL. Hypothèses de conversion et de retrait du Jeu 37 conservées.

MES conserve son filtre RSI, MGC sa cassure échouée avant 11 h New York et son plafond nominal 100 $. MYM reste exclu. Refuser une entrée MNQ libère éventuellement la place d’un autre marché : l’effet portefeuille sera mesuré, sans le masquer comme un gain propre au Nasdaq.

## Campagne prévue et données

- Juin, juillet, août 2026, chacun réinitialisé. Deux configurations : référence et veto MNQ ; coûts normaux et doublés, soit **12 relectures**, six témoins et une configuration nouvelle.
- Tous ces mois ont déjà été consultés. C’est un diagnostic de développement ; aucune nouvelle confirmation indépendante et aucune sélection d’un profil selon son mois gagnant.
- Préparation et ruptures de contexte strictement identiques au Jeu 37, notamment son chemin historique de préparation d’août. Toute parité échouée invalide le calcul au lieu de réécrire le témoin.
- Sources et empreintes exactes dans `jeu38-source.json` : dataset Jeu 19, MNQ Jeu 14, exécutions privées Jeu 37. Aucun téléchargement neuf, achat ou utilisation anticipée de la collecte prospective.
- Un replay isolé de journée n’est pas une preuve de 4 000 $ mensuels. La campagne conservera toutes les journées, y compris sans trade, pour éviter de choisir une belle séance comme démonstration.

## Critère fixé avant calcul

Critère descriptif : résultat net au moins égal au témoin dans les six cellules mois/coûts, baisse maximale réalisée au plus égale au témoin dans chaque cellule, aucune rupture de compte et au moins une amélioration stricte de PnL. Tout autre cas = filtre non retenu. Un critère passé ne prouve pas la rentabilité future : sélection automatique nulle et exécution désactivée, même en cas de résultat favorable.

Publier effectifs, gains/pertes, moyenne nette, baisse maximale, objectifs et retraits, raisons de refus, contributions par marché, journées et semaines. Rapprocher les entrées communes, retirées et nouvelles, en indiquant les gagnants supprimés autant que les perdants évités. Ne pas additionner les mois comme un compte continu.

## Exécution reproductible ultérieure

Depuis le dépôt, avec les trois répertoires privés situés hors Git :

```bash
node scripts/build-trading-jeu38.mjs /CHEMIN_PRIVE/jeu38-bundle.js
node scripts/run-trading-jeu38.mjs /CHEMIN_PRIVE/sources /CHEMIN_PRIVE/jeu37 /CHEMIN_PRIVE/jeu38
```

Le runner contrôle les fichiers gelés, leur commit et les trois sources. Il exige six témoins entiers identiques, reconstruit le filtre sur chaque préfixe quotidien avec les seuls contextes disponibles, compare ses décisions, puis rejoue le compte pour vérifier l’absence d’influence des journées futures. Ses sorties sont écrites sans écrasement. Les prix, décisions individuelles et trades restent privés ; seuls les agrégats sont publiés.

Les sources durables sont dans `TRADING_DATASETS` : `jeu19/multimarket-v1/manifest.json`, `jeu14/available-history-v1.json` et `jeu37/confidence-risk-v1/manifest.json`. Reconstruire gzip/base64 en suivant les manifestes et vérifier tailles et SHA avant de lancer. Aucune substitution de contrat, période ou bougies manquantes.

Après exécution seulement, ajouter une entrée au registre et au catalogue, conserver tous les résultats, archiver les fichiers privés avec relecture exacte, puis publier le bilan sur `feat/trading-hq-v1` / PR 83 avec vérification du déploiement. En cas de changement de tête concurrent, préserver les apports. Aucun merge main ni activation réelle/Paper/Shadow. La collecte MNQ existante et le rendez-vous prospectif du 3 décembre restent distincts et intacts.
