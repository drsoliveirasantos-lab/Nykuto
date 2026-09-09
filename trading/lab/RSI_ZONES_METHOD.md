# RSI : correction de portée et méthode

Diego précise le 9 septembre 2026 qu’il entendait les zones de survente et
surachat, illustrées par les niveaux 30/70. L’audit précédent étudiait surtout
le momentum directionnel autour de 50. Son constat sur le RSI directionnel
ne constitue donc pas une conclusion sur les zones 30/70.

Ce complément descriptif reprend les mêmes trades, coûts, périodes et sources :
126 observations principales aux coûts initiaux, janvier–avril et août disjoints.
Il conserve le RSI 14 de Wilder sur bougies de 5 minutes de séance cash, avec les
réinitialisations du Jeu 24 après coupure/changement de contrat. Aucun réglage
de stratégie ni nouveau backtest. Le registre reste à 67 essais.

Avant de calculer les sous-groupes, les définitions sont fixées :

- Survente : RSI strictement inférieur à 30.
- Zone intermédiaire : 30 ≤ RSI ≤ 70 ; ce terme n’implique pas une absence de tendance.
- Surachat : RSI strictement supérieur à 70.
- RSI inconnu : préparation insuffisante, conservée distincte.
- Sortie de survente : précédent RSI < 30, actuel ≥ 30.
- Sortie de surachat : précédent RSI > 70, actuel ≤ 70.
- Les sorties de zone comparent les deux dernières bougies closes de la même
  séance/contrat ; elles sont inconnues si un des RSI est indisponible.
- La classification utilise les valeurs non arrondies, au moment du signal,
  jamais les extrêmes ou la clôture de la bougie d’entrée encore future.

Les groupes conservent sens achat/vente, gains/pertes/zéros, effectifs et nets.
Une vente en survente et un achat en survente sont deux contextes différents.
Les effectifs par zone/événement doivent se réconcilier avec les trades existants.
Ces groupes ne représentent pas des portefeuilles rejoués avec un nouveau filtre.

La capture fournie illustre Air Liquide en unité mensuelle. Elle explique les
zones ; elle ne permet pas de transposer ses valeurs au RSI 5 minutes des futures.
Un RSI peut rester longtemps extrême pendant une tendance forte : surachat ne
signifie pas « vendre immédiatement », ni survente « acheter immédiatement ».
[Guide Fidelity](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI).

Les franchissements de retour sont distingués des zones elles-mêmes, sans
prétendre qu’ils améliorent ce portefeuille.
[Présentation Schwab](https://www.schwab.com/learn/story/identifying-trend-reversals-with-rsi).

```bash
node scripts/audit-trading-rsi-zones.mjs /sources/privees /archives/privees /sortie/neuve
```

Les nouvelles définitions et les dépendances de l’audit précédent sont vérifiées
par empreintes. Les anciens moteurs/rapports restent immuables ; seul le nouveau
rapport agrégé est écrit. Aucun prix ni trade individuel n’est publié.
