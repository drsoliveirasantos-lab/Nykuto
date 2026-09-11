# Jeu 14 — toute la couverture historique actuellement vérifiable

Fixé le 9 septembre 2026 avant récupération des nouveaux prix et calcul.
Diego demande de poursuivre maintenant sur davantage d'historique, sans nouvelle
programmation future. Le suivi Pullback ajouté au Jeu 13 est désactivé ; les
deux tâches MNQ antérieures restent distinctes. Ce protocole élargit la recherche
à sa demande ; il ne réécrit pas le verdict insuffisant de juin 2025.

## Une candidate inchangée

Réutiliser `jeu12-engine.mjs` au commit `ab904a4d884cf2b19934469425995b7847d00e85`,
configuration `30-full-both`, famille `pullback`. EMA9/21, ADX14 >=20,
stop ATR14 ×1,25, target 1,5 R, tick 0,25 et 2 $ par point. Signal fermé,
entrée à l'open 5 min suivant, une position, trois entrées par jour, freins
deux pertes consécutives ou −2 R réalisés, flat 15 min avant clôture cash.
Coûts 3,50 $ puis 7 $ par aller-retour ; resimulation complète des freins.
Aucun autre candidat, optimisation des horaires ou changement de paramètres.

## Couverture avant performance

La requête Massive des horaires MNQ/XCME du 6 mai 2019 au 1er avril 2025
retourne seulement deux `pre_open` isolés en octobre 2024 avant le 17 mars
2025. Les horaires complets commencent le 17 mars 2025. Récupérer toute la
couverture depuis cette date jusqu'au 8 septembre 2026 inclus, dernière séance
terminée. Les années sans horaires vérifiables restent signalées, sans faux test.

Contrats successifs et rollovers fixés selon le calendrier CME :

| Contrat | Début d'utilisation | Fin exclue | Récupération/préparation dès |
| --- | --- | --- | --- |
| MNQM5 | 17 mars 2025 | 16 juin 2025 | 17 mars 2025 |
| MNQU5 | 16 juin 2025 | 15 septembre 2025 | 1er mai 2025 |
| MNQZ5 | 15 septembre 2025 | 15 décembre 2025 | 1er août 2025 |
| MNQH6 | 15 décembre 2025 | 16 mars 2026 | 1er novembre 2025 |
| MNQM6 | 16 mars 2026 | 15 juin 2026 | 1er février 2026 |
| MNQU6 | 15 juin 2026 | 9 septembre 2026 | 1er mai 2026 |

Confirmer les expirations dans les références de contrats. Capturer la
pagination entière des prix 5 min et horaires. Calendrier cash NYSE exact,
fermetures et séances raccourcies comprises. Aucun prix brut dans Git.

## Trous, préparation et exhaustivité

Avant tout PnL, vérifier chaque séance : toutes les bougies 5 min, ticks,
OHLCV, intervalle futures couvrant la séance cash, contrat et pagination.
Une absence ne devient pas une bougie plate ni un trade fictif.

Former les blocs maximaux de séances consécutives entièrement vérifiées,
par contrat, sans regarder les résultats. Après un trou, les indicateurs
repartent sur le nouveau bloc avec au moins 220 bougies 30 min de préparation
(soit 17 séances normales) avant tout score. Cette réinitialisation de données
est explicite ; elle ne représente pas une exécution continue sur les trous.
Ne supprimer aucune autre séance. Un bloc court reste non calculable.

Afficher toutes les séances exclues/manquantes et la préparation non évaluée.
Les sommes sur les blocs disponibles sont des diagnostics de couverture
partielle, jamais le rendement d'un compte continu. Un mois ou une fenêtre
ne peut être déclaré complet si une seule séance de son calendrier manque.

## Comparaisons fixées

Calculer les deux scénarios de coûts sur chaque bloc admissible. Publier les
résultats chronologiques par mois, année et sens, ainsi que les plages partielles
aux extrémités. Compter chaque trade une seule fois dans les totaux : les
tableaux par mois et par période sont des regroupements, pas de nouveaux essais.

Fenêtres de deux mois non chevauchantes : mai–juin, juillet–août,
septembre–octobre et novembre–décembre 2025 ; janvier–février, mars–avril,
mai–juin et juillet–août 2026. Avril 2025 et septembre 2026 sont des compléments.

Confirmation rétrospective principale : **juillet–août, septembre–octobre et
novembre–décembre 2025**, qui n'ont pas servi à choisir le Pullback. Ces dates
avaient été utilisées avec une autre stratégie : ne pas les qualifier de
prospectives ou entièrement vierges de recherche. Exiger les trois fenêtres
complètes, >=40 trades au total, >=12 par fenêtre, chacune positive, PF>=1,10
avant arrondi, drawdown réalisé<=8 R et stress global positif. Les périodes
2026 de développement restent séparées, sans renforcer artificiellement cette
confirmation. Aucun remplacement d'une fenêtre qui perd ou manque de données.

Compléter par des contrôles de robustesse descriptifs : concentration par
mois/sens, résultat sans les cinq meilleurs trades, distribution de résultats
par jour et incertitude par rééchantillonnage de semaines (graine fixe,
10 000 tirages). Ces calculs ne créent pas de nouvelles observations et ne
servent pas à changer les seuils ou choisir une autre stratégie.

## Audit et publication

Vérifier causalité par préfixes de séances, non-chevauchement des positions,
prix/risque/coûts/horaires et daily brakes. Conserver tous les résultats même
négatifs et les captures privées hashées. Actualiser le Lab et sa documentation,
valider logiciel/CI/déploiement exact sur la branche trading seulement.
Pas de nouvelle automation, compte, achat, broker, bot ou ordre activé.
Un historique favorable ne prouve pas la rentabilité future ni les fills live.

Sources : [rollovers CME](https://www.cmegroup.com/trading/equity-index/rolldates.html),
[calendrier NYSE](https://ir.theice.com/press/news-details/2024/NYSE-Group-Announces-2025-2026-and-2027-Holiday-and-Early-Closings-Calendar/default.aspx),
Massive `/futures/v1/schedules`, `/futures/v1/contracts`, `/futures/v1/aggs/{ticker}`.
