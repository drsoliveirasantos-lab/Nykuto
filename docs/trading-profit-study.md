# Extension de recherche MNQ — objectif de gain par trade

Cette extension est rattachée au module maintenu `trading/lab/research-bot.mjs`,
pas à une route d'ordres ou une activation du site publié.

## Sources

- `trading/lab/profit-study-policy.mjs` : quatre configurations figées, devis MNQ net de coûts, métriques et verdicts.
- `trading/lab/profit-study-engine.mjs` : dérivation en mémoire du moteur45 avec contrôle de son blob Git ; l'original n'est jamais modifié.
- `trading/lab/profit-study-preparation.mjs` : séances cash complètes, préparation MNQ uniquement, aucune fabrication de flux pairs.
- `trading/lab/PROFIT_STUDY_PROTOCOL.md` : limites, paramètres, critères et historique des hypothèses antérieures.
- `scripts/run-trading-profit-study.mjs` : 24 comptes mensuels et contrôles causaux sur juin–août2026.
- `.github/workflows/trading-profit-study.yml` : tests à chaque modification pertinente ; campagne uniquement à la première ouverture de PR, tentative1.

`quoteResearchBotMnqTrade()` fournit une estimation de quantité, perte au stop
et gain net possible à2R, sans vérifier la marge personnelle d'un courtier
ni soumettre un ordre. `simulateResearchBotMnqProfitStudy()` est un point
d'entrée explicite du bot pour l'étude. Son défaut est `reference100`.

Le profil maintenu RESEARCH_BOT reste à100USD. Les variantes150/200 ne sont
appelées que par leur identifiant explicite dans la campagne historique.
Le corpus actuellement lu par le moteur est M5 RTH, dérivé des exports M1.
Ce n'est pas une simulation minute par minute ni une lecture de cours live.

Les comptes sont hypothétiques50K funded, pas un diagnostic du compte de Diego.
La limite interne quotidienne reste200USD, même dans risk150/risk200. Toutes
les protections natives et les comparaisons archivées sont conservées.

Validation locale du module pur : `node --test scripts/test-trading-profit-policy.mjs`.
Validation complète en CI : ajouter `scripts/test-trading-profit-engine.mjs`.
Le runner exige un SHA exact, un checkout propre et un dossier résultat neuf.
Les artefacts ne contiennent que des agrégats/empreintes. Un résultat descriptif
ne sélectionne pas de stratégie ; registres historiques inchangés au gel.

## Exécution terminée — 10 septembre 2026

Lire `trading/lab/PROFIT_STUDY_RESULTS.md` et
`trading/lab/profit-study-ledger.json` AVANT toute nouvelle tentative de
hausse de risque. Le registre complémentaire contient4configurations
exécutées, dont3hypothèses ; il s'ajoute au catalogue historique figé,
qu'il ne réécrit pas. Ce ne sont pas4confirmations indépendantes.

Run34521475105, gelb0bd4bcfdcad50aa85bd7e5173df0837f290e1ba :
16tests,24comptes et512préfixes réussis. Aucune hypothèse ne passe le
critère financier descriptif. Risque100 reste le défaut ; pas d'activation.
Sommes normales des trois comptes : référence92,50USD ; risque150-303,50 ;
risque200+265 ; filtre net100+92,50. En stress : -59/-273/-70/0USD.
Le dernier commit de résultats n'exécute pas une nouvelle campagne.
