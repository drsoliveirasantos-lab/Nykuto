# Jeu 12 — unités de temps et horaires

Fixé le 9 septembre 2026 UTC avant récupération des prix 5 min et calcul.
Demande : essayer d'autres minutes et moments, poursuivre la recherche sans
intervention. Une réussite ne sera pas obtenue en supprimant les essais perdants.

## Grille unique, 27 configurations

- Timeframes des signaux : 5, 15, 30 minutes. EMA 9/21, ADX14 >= 20,
  stop ATR14 × 1,25, target 1,5 R, arrondis MNQ inchangés.
- Entrées, heure America/New_York : Full session 09:30–15:45,
  Morning 09:30–12:00, Afternoon 13:00–15:45. Fin exclue.
  La restriction concerne l'entrée ; une position peut rester après la plage
  d'entrée, jusqu'à sa sortie. Toujours flat 15 minutes avant la clôture NYSE.
- Direction : Both, Long only, Short only. Aucun autre filtre ajouté à cette grille.
- Chaque combinaison est simulée avec 3,50 $ puis 7 $ par aller-retour/contrat.
  Les coûts doublés recalculent les freins, jamais une simple soustraction finale.
- Même limite : une position, trois entrées/jour, arrêt après deux pertes
  consécutives ou −2 R réalisés. Le risque de gap peut dépasser la limite prévue.

## Exécution comparable

Prix natifs 5 min de Massive. Construire les signaux 15/30 min avec des groupes
entiers, dans la même séance, ancrés à 09:30. Aucune bougie synthétique comblant
un trou. Au moins 220 bougies de préparation dans chaque timeframe.

Toutes les configurations exécutent sur les mêmes bougies 5 min : signal à
clôture complète, entrée au prochain open 5 min, stop prioritaire lorsque
stop/target sont touchés dans la même bougie 5 min. Gap défavorable à l'open,
gain plafonné au target. Sortie à l'open de la bougie 5 min située 15 minutes
avant la clôture (15:45 normalement, 12:45 le 24 décembre). Pas d'overnight,
pas de signal porté de la préparation ou de la veille.

La version 15 min n'est donc pas un duplicata du moteur historique : l'ordre
des extrêmes est précisé à 5 min. Les anciens résultats restent conservés.
Comparer les OHLCV agrégés 15 min avec le snapshot du Jeu 09 ; documenter toute
divergence et arrêter le calcul avant de conclure si la source est incohérente.

## Périodes et sélection

Exploration : les trois fenêtres 2026 du Jeu 09, avec leurs contrats,
préparations, jours et clôtures déjà fixés : janvier–février MNQH6,
avril–mai MNQM6, juillet–août MNQU6. Il s'agit de dates déjà connues :
changer le timeframe ne les rend pas indépendantes.

Les 27 configurations sont toutes publiées. Critères inchangés : >=40 trades
au total, >=12 dans chacune des trois fenêtres, chaque fenêtre positive,
profit factor >=1,10 avant arrondi, drawdown réalisé <=8 R, stress total >0.
Soit 162 simulations de fenêtres (27 × 3 × 2), sans balayage adaptatif.

Parmi celles passant tous ces critères, retenir UNE candidate : maximum de
la plus mauvaise expectancy des trois fenêtres ; départage par drawdown
croissant puis ordre de la grille (timeframe 5/15/30, Full/Morning/Afternoon,
Both/Long/Short). Ne pas choisir une autre candidate si celle-ci échoue ensuite.

Contrôle séparé : juin 2025, MNQU5, préparation 1er–31 mai, évaluation du
1er juin au 1er juillet exclu, jours NYSE hors 26 mai et 19 juin. Ce mois avait
servi à préparer le Jeu 06, pas à évaluer la nouvelle grille ; ce n'est pas
une preuve prospective vierge de tout usage. Ne calculer sa performance
qu'après sélection de la candidate. Exiger >=12 trades, net et stress positifs,
PF>=1,10, drawdown<=8 R. Si aucune candidate, ne pas examiner ce résultat
pour en sélectionner une nouvelle. Si la couverture manque, publier le blocage.

Une grille puis un seul contrôle : pas de nouvelle grille choisie en regardant
les résultats. Le résultat satisfaisant recherché est une piste passant ces
contrôles historiques, qui resterait à tester prospectivement et en Paper Trading.
Il ne signifie jamais 100 % de trades gagnants ou autorisation d'argent réel.

## Qualité et limites

Vérifier contrats/expirations, pagination, calendrier, tous les OHLCV/ticks,
horodatages, couvertures 5 min et préparations par timeframe. Archiver les
captures et snapshots privés avec SHA-256 ; aucun cours brut dans Git.
Tester les frontières de bougies, causalité des signaux, horaires d'entrée,
clôture, pauses et recalcul des coûts. Comparer des préfixes par séance sur
le véritable historique pour les 27 configurations.

Pas de flux temps réel, carnet d'ordres, liquidité/fills garantis, financement,
spread mesuré ni news exhaustives. Aucun achat, compte, ordre, bot activé ou
changement des deux automations prospectives MNQ existantes.
