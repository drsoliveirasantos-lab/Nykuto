# Jeu 13 — hypothèse Pullback, développement après le Jeu 12

Fixé le 9 septembre 2026 UTC avant le premier calcul de cette nouvelle
hypothèse. Ce protocole ne corrige pas rétrospectivement le Jeu 12 : ses
27 configurations n'ont produit aucune candidate qualifiée. Les résultats
positifs du matin restent limités par le nombre de trades. Ce constat sert
à formuler une nouvelle hypothèse de développement, pas une validation.

## Hypothèse et coûts de recherche

Un croisement EMA impose d'attendre un changement de tendance. Examiner une
entrée sur un retour vers l'EMA rapide dans une tendance déjà établie :

- Long : EMA9 > EMA21, low <= EMA9, close > EMA9 et close > open.
- Short : EMA9 < EMA21, high >= EMA9, close < EMA9 et close < open.
- EMA, niveaux et bougie sont ceux de la bougie signal entièrement close.
  ADX14 >=20 reste requis. Pas d'égalité de tendance ni de doji accepté.
- Tous les autres choix restent identiques au Jeu 12 : 5/15/30 min ; Full,
  Morning, Afternoon ; Both/Long/Short ; exécution 5 min ; stop ATR14 ×1,25 ;
  target1,5 R ; trois entrées/jour ; une position ; freins −2 R/deux pertes ;
  flat 15 min avant clôture ; coûts3,50/7$.

Une nouvelle grille fixe de27 configurations, soit54 au total avec le Jeu12.
Tous les essais et leurs échecs restent publiés. Le nombre d'essais augmente
le risque de trouver un bon backtest par hasard. Aucune optimisation de
périodes EMA, seuil ADX, stop, target ou horaire après ce calcul.

## Sélection et contrôle séparé

Même historique2026 déjà connu et mêmes six critères que le Jeu12 :40 trades
au total,12 dans chaque fenêtre, chacune positive, PF>=1,10 sans arrondi,
drawdown<=8R et stress total positif. Parmi les configurations qui satisfont
tous les critères, sélectionner une seule candidate par la plus mauvaise
expectancy des trois fenêtres (maximum), puis drawdown (minimum), puis ordre
de la grille. Ne pas remplacer cette candidate si le contrôle suivant échoue.

Le contrôle de juin2025 prévu pour le Jeu12 n'a pas été calculé puisqu'aucune
candidate ne passait. Ce résultat demeure non examiné. Le réserver désormais
à la seule candidate du Jeu13 : MNQU5, préparationmai2025, testjuin2025,
calendrierNYSE hors26mai/19juin. >=12 trades, net/stress positifs, PF>=1,10,
drawdown<=8R. Ce mois avait servi à préparer le Jeu06 ; il ne constitue pas
un échantillon prospectif vierge de tout usage. Prix5min complets obligatoires.

Si aucune candidate ou échec de ce contrôle, arrêter cette campagne et
publier l'échec. Ne pas inventer de réussite, ne pas essayer une troisième
famille sur les mêmes dates pour terminer sur du vert. Préserver les deux
collectes/tests prospectifs existants. Un résultat historique satisfaisant
resterait une piste à confronter prospectivement, jamais un bot garanti.
