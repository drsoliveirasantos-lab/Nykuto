# Audit des quatre marchés — Nykuto, 9 septembre 2026

L’audit relie maintenant les résultats aux conditions présentes avant chaque
entrée et au parcours du prix. **Aucun des quatre profils n’est qualifié.**
Les contrôles précédents couvraient déjà la causalité, le risque et les résultats ;
la comparaison systématique gagnants/perdants par contexte était absente.

Portée : version de recherche après le Jeu 30, commit
`ede9cdf10f6dca4f8be94b1df7300c989f77f144`. Audit du bot de recherche et de ses
historiques, pas une certification de la production, du courtier ou de la sécurité
complète du site. Les travaux d’autres branches ne sont pas fusionnés ici.

## Résultats par marché et stabilité

126 trades distincts aux coûts initiaux : 100 dans janvier–avril, 26 en août.
52 gagnants, 71 perdants et 3 à zéro. Les scénarios doublés et le compte d’août
ne sont pas ajoutés à cet échantillon. Les 264 vérifications d’exécution incluent
ces replays recoupés ; elles ne représentent pas 264 trades indépendants.

Les montants suivants sont des contributions du portefeuille commun, avec une
position et deux entrées quotidiennes au total. Le diagnostic ignore l’objectif
et le seuil du compte mais conserve les budgets quotidiens. Les périodes
disjointes ne constituent pas une simulation continue de compte sur cinq mois.

| Marché | Jan.–fév. : n / net USD | Mars–avr. : n / net USD | Août : n / net USD | Total descriptif USD |
| --- | --- | --- | --- | --- |
| MES | 11 / +18,75 | 11 / -322,50 | 1 / -25,00 | -328,75 |
| MGC | 9 / +158,50 | 11 / +49,50 | 9 / -194,50 | +13,50 |
| MNQ | 13 / +598,00 | 13 / +126,50 | 8 / -289,00 | +435,50 |
| MYM | 16 / -92,50 | 16 / -43,50 | 8 / -53,00 | -189,00 |

| Marché | Gagnants / perdants / zéro | Gain moyen USD | Perte moyenne USD | Espérance R/trade | PF USD / R | Net sans meilleur trade USD |
| --- | --- | --- | --- | --- | --- | --- |
| MES | 8 / 15 / 0 | 67,03 | 57,67 | -0,252 | 0,62 / 0,65 | -448,75 |
| MGC | 12 / 17 / 0 | 134,50 | 94,15 | -0,027 | 1,01 / 0,96 | -196,00 |
| MNQ | 17 / 16 / 1 | 105,97 | 85,38 | 0,222 | 1,32 / 1,45 | +219,50 |
| MYM | 15 / 23 / 2 | 36,63 | 32,11 | -0,154 | 0,74 / 0,77 | -260,50 |

Le +13,50 USD de MGC s’accompagne d’une espérance de −0,027 R/trade : les risques
initiaux varient. Le signe du total en dollars ne suffit pas à établir un avantage
par unité de risque. Sans son meilleur trade, MGC perd 196 USD. Les contributions
MES et MYM sont négatives même avant coûts : respectivement −213,75 et −49 USD.
Les frais aggravent les résultats mais ne sont pas leur seule cause.

Le taux d’équilibre du JSON utilise les gains/pertes moyens **hors trades à zéro**.
Il s’agit d’une décomposition descriptive, pas d’une probabilité future. Le taux
de réussite publié, lui, compte tous les trades et conserve les zéros au dénominateur.

## Ce qui était présent chez les gagnants et les perdants

Les confirmations ci-dessous sont calculées sur les bougies déjà closes. Le
contexte de chaque entrée a été recalculé après suppression des bougies futures.
Les indicateurs insuffisamment préparés restent inconnus, et ne sont pas classés
« absents ». Dans chaque case : présents / connus, puis nombre inconnu.

| Marché | Confirmation | Gagnants | Perdants |
| --- | --- | --- | --- |
| MES | EMA + VWAP alignés | 5/7 ; ?=1 | 12/15 ; ?=0 |
| MES | Structure alignée | 2/7 ; ?=1 | 8/15 ; ?=0 |
| MES | RSI du côté du trade | 8/8 ; ?=0 | 13/15 ; ?=0 |
| MES | Volume relatif ≥ 1 | 4/6 ; ?=2 | 6/9 ; ?=6 |
| MES | Forme directionnelle | 4/8 ; ?=0 | 3/15 ; ?=0 |
| MGC | EMA + VWAP alignés | 0/12 ; ?=0 | 0/16 ; ?=1 |
| MGC | Structure alignée | 3/12 ; ?=0 | 0/16 ; ?=1 |
| MGC | RSI du côté du trade | 7/12 ; ?=0 | 3/17 ; ?=0 |
| MGC | Volume relatif ≥ 1 | 3/8 ; ?=4 | 6/13 ; ?=4 |
| MGC | Forme directionnelle | 6/12 ; ?=0 | 7/17 ; ?=0 |
| MNQ | EMA + VWAP alignés | 16/17 ; ?=0 | 12/16 ; ?=0 |
| MNQ | Structure alignée | 10/17 ; ?=0 | 8/16 ; ?=0 |
| MNQ | RSI du côté du trade | 16/17 ; ?=0 | 15/16 ; ?=0 |
| MNQ | Volume relatif ≥ 1 | 10/16 ; ?=1 | 6/14 ; ?=2 |
| MNQ | Forme directionnelle | 2/17 ; ?=0 | 3/16 ; ?=0 |
| MYM | EMA + VWAP alignés | 9/15 ; ?=0 | 21/22 ; ?=1 |
| MYM | Structure alignée | 7/15 ; ?=0 | 13/22 ; ?=1 |
| MYM | RSI du côté du trade | 12/15 ; ?=0 | 22/22 ; ?=1 |
| MYM | Volume relatif ≥ 1 | 9/12 ; ?=3 | 10/20 ; ?=3 |
| MYM | Forme directionnelle | 4/15 ; ?=0 | 5/23 ; ?=0 |

### MNQ — dégradation des entrées, protection inactive en août

- +598 USD, puis +126,50, puis −289 : la stabilité se dégrade.
- EMA/VWAP sont alignés dans 16 des 17 gains, mais aussi dans 12 des 16 pertes.
  Le RSI directionnel est présent dans 16 gains sur 17 et 15 pertes sur 16 : il
  discrimine peu dans ces observations. Ajouter « RSI du bon côté » ne suffit pas.
- En août, 2 gains moyens de 122,25 USD contre 6 pertes moyennes de 88,92 USD.
  Le taux de réussite de 25 % est trop faible pour ces montants observés.
- Les six pertes d’août n’atteignent pas +1R, même avec la borne supérieure de
  l’excursion. Aucune protection +1R ne s’active dans ce mois. Il faut donc
  travailler les entrées, pas attribuer ces six pertes à une protection oubliée.
- La forme directionnelle retenue au Jeu 24 n’est présente que dans 2 gains sur
  17. Exiger ce filtre supprimerait beaucoup de gagnants observés ; son effet
  réel nécessiterait toutefois un nouveau replay avec admissions recalculées.

### MGC — hypothèse horaire, logique de retour différente

Le profil exploite une cassure échouée. Aucun des 28 trades au contexte EMA/VWAP
connu n’est aligné à ce test de poursuite de tendance, parmi eux les 12 gains.
Ce désaccord n’est donc pas une erreur mécanique ni un motif universel de refus.
La même grille de confirmations doit être interprétée selon la famille de stratégie.

| Période | 10:00–10:59 NY : n / net USD | 11:00–12:00 NY : n / net USD |
| --- | --- | --- |
| Janvier–février | 8 / +308,00 | 1 / -149,50 |
| Mars–avril | 7 / +163,50 | 4 / -114,00 |
| Août | 3 / +131,50 | 6 / -326,00 |

Les 18 trades avant 11 h totalisent +603 USD ; les 11 plus tardifs −589,50 USD.
Ces sous-groupes ne sont **pas** le résultat d’une nouvelle stratégie horaire :
retirer les trades tardifs changerait les places disponibles et les autres
admissions. L’hypothèse prioritaire est un nouveau replay commun avec une fenêtre
MGC 10:00–10:59 fixée avant calcul, puis une période encore non utilisée. Aucun
filtre horaire n’est activé dans cette mise à jour.

Les moyennes de délai depuis la cassure sont plus courtes chez les gagnants MGC
que chez les perdants en mars–avril (6 contre 10 minutes) et août (6,67 contre
13,33), mais l’inverse existe en janvier–février (11,25 contre 8). Ne pas inventer
un seuil de délai « optimal » sur cette seule lecture.

### MES — base perdante, août insuffisant

Le total est −328,75 USD sur 23 trades. Janvier–février est légèrement positif,
puis mars–avril perd 322,50 USD. Août ne comporte qu’un trade, perdu : aucun
comparatif gagnants/perdants propre à août n’est possible pour MES.

La forme directionnelle est présente dans 4 gains sur 8 contre 3 pertes sur 15 ;
c’est une association à explorer. En revanche le RSI directionnel est présent
dans 13 pertes sur 15. Les ventes passent de +190 USD en janvier–février à
−377,50 en mars–avril : garder seulement les ventes sur le premier bilan aurait
été trompeur. Priorité : qualité du retour, contexte et stabilité entre périodes.

### MYM — faiblesse persistante de la famille d’entrées

Les trois périodes sont négatives. Le profil a 15 gains, 23 pertes et deux
sorties à zéro. Gain moyen 36,63 USD, perte moyenne 32,11 USD : le ratio observé
ne compense pas la fréquence des pertes. EMA/VWAP sont alignés dans 21 des
22 pertes au contexte connu, contre 9 gains sur 15 ; ce filtre n’est pas une
solution démontrée. Comparer une famille différente ou sa contribution au
portefeuille demande un nouvel essai, pas une suppression rétrospective des pertes.

## Parcours des trades : ce que les sorties peuvent expliquer

Sur août, les 18 perdants (MES 1, MGC 6, MNQ 6, MYM 5) n’atteignent pas +1R. Aucun
n’a donc connu un gain d’au moins son risque initial avant de perdre. Aucun stop
+1R des profils MNQ/MYM ne s’active en août, y compris dans leurs trades gagnants :
les cibles peuvent être touchées dans une bougie avant qu’une clôture à +1R survive.

Sur l’ensemble principal, sept perdants ont touché +1R avant leur sortie, mais
aucun n’a une clôture survivante à +1R avant la sortie. Passer d’un déclenchement
sur clôture à un toucher intrabougie serait une nouvelle règle avec des effets
sur les gagnants aussi ; les sept cas ne constituent pas un gain récupérable garanti.

Le maximum/minimum de la bougie de sortie peut arriver après l’exécution. Le
rapport donne des bornes MFE/MAE et distingue toucher confirmé, impossible et
indéterminé, ainsi que durée minimale/maximale. Il ne prétend pas connaître
l’ordre exact des prix intrabougie. Voir la [documentation TradingView sur les
simulations et données intrabougie](https://www.tradingview.com/pine-script-docs/concepts/strategies/).

## Refus, priorités simultanées et coûts

Les motifs sont les premiers refus rencontrés dans le moteur, pas tous les
motifs possibles ni des explications économiques du futur résultat.

| Marché | Signaux | Admis | Refusés | Premier motif et nombre |
| --- | --- | --- | --- | --- |
| MES | 49 | 23 | 26 | occupied: 14; netReward: 6; sideLimit: 3; dailyEntries: 3 |
| MGC | 92 | 29 | 63 | occupied: 13; dailyEntries: 12; netReward: 14; tradeRisk: 19; sideLimit: 4; simultaneous: 1 |
| MNQ | 67 | 34 | 33 | occupied: 12; simultaneous: 6; sideLimit: 5; tradeRisk: 2; dailyEntries: 8 |
| MYM | 74 | 40 | 34 | dailyEntries: 8; occupied: 11; netReward: 4; sideLimit: 10; simultaneous: 1 |

Les refus pour compte occupé ou signal simultané montrent l’effet du portefeuille.
La priorité MES/MGC/MNQ/MYM était alphabétique et fixée avant résultat ; elle n’est
pas optimisée ni reconnue optimale. Un signal refusé n’a pas de résultat réalisé.
Rejouer ces opportunités isolément ou changer la priorité constituerait un nouvel
essai. Les additionner aux trades admis ignorerait les limites du compte.

Les coûts doublés modifient les admissions. Pour août dans le modèle de compte :

| Effet doublés − initiaux | USD |
| --- | --- |
| Frais supplémentaires sur les entrées communes | -57,00 |
| Sorties brutes différentes sur les entrées communes | 0,00 |
| Retrait des trades présents seulement aux coûts initiaux | -83,00 |
| Ajout des trades présents seulement aux coûts doublés | -185,50 |
| Écart total | -325,50 |

Cela explique l’écart −325,50 USD entre −561,50 et −887. Il ne correspond pas
simplement à doubler 101,50 USD de frais. Le diagnostic stress sans seuil perd
975 USD sur 18 trades ; le modèle de compte refuse une proposition MGC le
27 août et perd 887 USD sur 17 trades. Cet exemple ne prouve pas qu’un refus
protège systématiquement d’une perte.

## Revue des essais antérieurs

Les 67 entrées ont été rapprochées de leurs rapports et empreintes. Aucun échec
n’est retiré du registre ; aucun nouvel essai de stratégie n’est ajouté par l’audit.

| Jeu | Essais | Développement réussi | Confirmés | Réserve |
| --- | --- | --- | --- | --- |
| 19 | 8 | 0 | 0 | not-opened |
| 20 | 1 | 1 | 0 | evaluated-once |
| 21 | 4 | 0 | 0 | not-opened |
| 22 | 4 | 0 | 0 | not-opened |
| 23 | 16 | 0 | 0 | not-opened |
| 24 | 16 | 0 | 0 | not-opened |
| 25 | 4 | 0 | 0 | not-opened |
| 26 | 4 | 0 | 0 | not-opened |
| 27 | 4 | 0 | 0 | not-opened |
| 28 | 4 | 0 | 0 | not-opened |
| 29 | 1 | 0 | 0 | not-opened |
| 30 | 1 | 0 | 0 | evaluated-by-request |

- Le Jeu 20 avait réussi le développement, puis échoué dans sa réserve. Une
  sélection de développement n’est pas une confirmation.
- Le Jeu 24 impose simultanément tendance, structure, momentum, volume et forme :
  seulement 6 des 209 signaux candidats survivent, au plus deux trades par profil.
  « Ajouter toutes les analyses » n’a donc pas produit une stratégie exploitable.
- Le risque gradué du Jeu 25 améliore certains totaux et en détériore d’autres ;
  les quatre secondes fenêtres restent négatives. Aucune confiance calibrée.
- La réentrée du Jeu 27 ajoute des trades MNQ mais diminue le net de +887,50 à
  +456,50 USD dans la comparaison isolée au témoin. Plus d’activité n’a pas aidé.
- La protection du Jeu 28 évite une perte MNQ de 44 USD et deux pertes MYM totalisant
  75,50 USD, mais réduit les gains MES/MGC. Ces comparaisons isolées sont différentes
  des contributions du portefeuille actuel et ne doivent pas être additionnées.

La multiplication des essais sur des données vues expose à la sélection d’un
résultat fortuit. Cet audit est une découverte descriptive, pas un test statistique
indépendant. [Bailey et López de Prado, Deflated Sharpe Ratio](https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf).

## Audit technique et limites établies

| Domaine | Résultat de l’audit | Limite ou action |
| --- | --- | --- |
| Archives et provenance | Empreintes des quatre sources privées et treize fichiers publics vérifiées | Pas de seconde acquisition indépendante des cotations |
| Couverture | 101 séances communes sur 103 dans les périodes choisies | 25 février MGC et 6 mars MES/MGC/MNQ absents ; aucune bougie fabriquée |
| Contextes d’entrée | 138 préfixes sans futur identiques au contexte calculé sur l’historique | Les indicateurs peuvent rester inconnus après coupure ou changement de contrat |
| Exécutions | 264 premières sorties, prix, raisons, protections et nets reproduits | Même modèle OHLC gelé, pas un contrôle de fills réels |
| Risque | Plafonds, freins, position commune et réserve couverts par les tests existants | Le superviseur en mémoire ne coordonne pas plusieurs processus ; état réel frais et réservation atomique nécessaires avant exécution |
| Profitabilité | Profils non qualifiés, stabilité insuffisante | Aucune activation réelle, Paper ou Shadow |
| Données intrabougie | Bornes MFE/MAE et durées explicites | Tick par tick, spread, carnet, files d’attente et latence indisponibles |
| Événements et régimes | Contexte de prix/volume descriptif seulement | Pas de calendrier d’annonces horodaté joint aux trades ; pas de classification validée des régimes |
| Compte 25K | Modèle historique du Jeu 15 conservé | Pas une certification des règles Lucid actuelles ni un compte relié |
| Interface | 32 combinaisons marché/période/coûts, états d’erreur et récupération vérifiés par DOM simulé | Pas de validation visuelle navigateur |
| Refus dans août | Trois libellés techniques jusque-là non traduits sont complétés | Aucun effet sur les chiffres ou admissions |

La page Connexions de cette version mémorise un choix de plateforme ; ce n’est
pas une API de compte reliée. Le module d’analyse visuelle du graphique est
également distinct du moteur des stratégies : afficher un indicateur ne l’ajoute
pas automatiquement aux décisions du bot.

## Actualisation apportée et suite justifiée

Le Lab propose désormais un audit par marché, période et coût : comparaison des
classes de résultat, confirmations connues/inconnues, mesures avant entrée,
excursions bornées, horaires/sens/jours/sorties, refus et attribution de l’effet
des coûts. Le rapport est vérifié avant affichage ; un échec efface aussi les
conclusions et conserve les menus pour une nouvelle vérification.

Priorités : MGC tester l’horaire avant 11 h ; MNQ examiner la dégradation des
entrées malgré tendance/RSI présents ; MES améliorer la qualité du retour avec
un échantillon plus large ; MYM comparer une autre famille d’entrées. Chaque
changement économique devra être isolé et rejoué dans le compte commun. Aucun
nouveau seuil ou profil n’est silencieusement activé à partir de cet audit.

## Reproduction et fichiers

- [Méthode](MARKET_AUDIT_PROTOCOL.md), [rapport complet agrégé](market-audit-report.json).
- Définition locale avant le calcul détaillé : `9e2ba12166eb3a3115fcccf8b948ccdba614fd65`.
- 29 dépendances de diagnostic gelées ; sources, rapports et registre épinglés.
- Les prix et trades individuels restent dans les archives privées Jeux 29/30.
  Aucun nouveau fichier d’exécutions n’est publié ou nécessaire à la reproduction.


Validation locale finale : **267 tests trading réussis**, zéro échec ; hygiène
sans erreur ni avertissement ; 25 modules Functions vérifiés ; build réussi.
Les 120 chemins de dépendances gelées précédentes sont inchangés et le registre
est identique octet par octet. Les 506 anciens IDs HTML sont conservés parmi
524 IDs uniques ; structure et 104 liens locaux vérifiés. Les 32 combinaisons
d’interface sont couvertes par DOM simulé ; aucune revue visuelle navigateur.

## Annexe — toutes les évaluations conservées

Les totaux des lignes ne s’additionnent pas : les configurations réutilisent
largement les mêmes dates et trades. Le Jeu 30 ci-dessous utilise le diagnostic
(coût stress −975), le compte stress −887 restant une lecture distincte.

| Jeu | Configuration | Trades initiaux | Net initial USD | Net doublé USD | Confirmé |
| --- | --- | --- | --- | --- | --- |
| 19 | MNQ/pullback | 5 | +171,50 | +154,00 | Non |
| 19 | MNQ/cross | 0 | 0,00 | 0,00 | Non |
| 19 | MES/pullback | 51 | -408,75 | -50,00 | Non |
| 19 | MES/cross | 11 | -10,00 | +7,50 | Non |
| 19 | MYM/pullback | 69 | +251,00 | +145,50 | Non |
| 19 | MYM/cross | 14 | +49,50 | +169,00 | Non |
| 19 | MGC/pullback | 0 | 0,00 | 0,00 | Non |
| 19 | MGC/cross | 0 | 0,00 | 0,00 | Non |
| 20 | MYM/pullback | 75 | +364,50 | +238,00 | Non |
| 21 | MES/pullback | 55 | -385,00 | -50,00 | Non |
| 21 | MES/cross | 11 | -10,00 | +7,50 | Non |
| 21 | MGC/pullback | 0 | 0,00 | 0,00 | Non |
| 21 | MGC/cross | 0 | 0,00 | 0,00 | Non |
| 22 | MNQ/orb-retest | 9 | +145,50 | +29,00 | Non |
| 22 | MES/orb-retest | 14 | +138,75 | 0,00 | Non |
| 22 | MYM/orb-retest | 30 | -173,00 | -117,00 | Non |
| 22 | MGC/orb-retest | 2 | -51,00 | 0,00 | Non |
| 23 | MNQ/admission-risk50 | 10 | +180,00 | -19,00 | Non |
| 23 | MNQ/admission-risk75 | 19 | +193,50 | +156,00 | Non |
| 23 | MNQ/admission-risk100 | 29 | +672,00 | +423,50 | Non |
| 23 | MNQ/admission-risk150 | 36 | +887,50 | +714,00 | Non |
| 23 | MES/admission-risk50 | 15 | +92,50 | 0,00 | Non |
| 23 | MES/admission-risk75 | 25 | -86,25 | -207,50 | Non |
| 23 | MES/admission-risk100 | 27 | -68,75 | -276,25 | Non |
| 23 | MES/admission-risk150 | 28 | -206,25 | -277,50 | Non |
| 23 | MYM/admission-risk50 | 33 | -288,00 | -293,00 | Non |
| 23 | MYM/admission-risk75 | 37 | -234,00 | -304,00 | Non |
| 23 | MYM/admission-risk100 | 37 | -288,50 | -304,00 | Non |
| 23 | MYM/admission-risk150 | 37 | -288,50 | -358,50 | Non |
| 23 | MGC/admission-risk50 | 5 | +32,50 | 0,00 | Non |
| 23 | MGC/admission-risk75 | 17 | -304,50 | -278,00 | Non |
| 23 | MGC/admission-risk100 | 27 | -171,50 | -364,00 | Non |
| 23 | MGC/admission-risk150 | 32 | -370,00 | -354,00 | Non |
| 24 | MNQ/confluence-risk50 | 0 | 0,00 | 0,00 | Non |
| 24 | MNQ/confluence-risk75 | 0 | 0,00 | 0,00 | Non |
| 24 | MNQ/confluence-risk100 | 0 | 0,00 | 0,00 | Non |
| 24 | MNQ/confluence-risk150 | 0 | 0,00 | 0,00 | Non |
| 24 | MES/confluence-risk50 | 1 | +41,25 | 0,00 | Non |
| 24 | MES/confluence-risk75 | 2 | -22,50 | -68,75 | Non |
| 24 | MES/confluence-risk100 | 2 | -22,50 | -68,75 | Non |
| 24 | MES/confluence-risk150 | 2 | -22,50 | -68,75 | Non |
| 24 | MYM/confluence-risk50 | 1 | +44,50 | +41,00 | Non |
| 24 | MYM/confluence-risk75 | 1 | +44,50 | +41,00 | Non |
| 24 | MYM/confluence-risk100 | 1 | +44,50 | +41,00 | Non |
| 24 | MYM/confluence-risk150 | 1 | +44,50 | +41,00 | Non |
| 24 | MGC/confluence-risk50 | 0 | 0,00 | 0,00 | Non |
| 24 | MGC/confluence-risk75 | 0 | 0,00 | 0,00 | Non |
| 24 | MGC/confluence-risk100 | 1 | +118,50 | +114,00 | Non |
| 24 | MGC/confluence-risk150 | 2 | +10,00 | +1,00 | Non |
| 25 | MNQ/graded-50-75-150 | 16 | +98,50 | +71,50 | Non |
| 25 | MES/graded-50-75-150 | 20 | -70,00 | -8,75 | Non |
| 25 | MYM/graded-50-75-150 | 36 | -303,00 | -369,50 | Non |
| 25 | MGC/graded-50-75-150 | 10 | +137,00 | +131,00 | Non |
| 26 | MNQ/failed-breakout150 | 36 | -52,00 | +125,50 | Non |
| 26 | MES/failed-breakout150 | 41 | -1 043,75 | -1 103,75 | Non |
| 26 | MYM/failed-breakout150 | 36 | -356,50 | -471,50 | Non |
| 26 | MGC/failed-breakout150 | 27 | +636,50 | +767,00 | Non |
| 27 | MNQ/fresh-reentry150 | 42 | +456,50 | +365,50 | Non |
| 27 | MES/fresh-reentry150 | 29 | -247,50 | -277,50 | Non |
| 27 | MYM/fresh-reentry150 | 42 | -307,00 | -358,50 | Non |
| 27 | MGC/fresh-reentry150 | 36 | -320,00 | -270,00 | Non |
| 28 | MNQ/closed-breakeven150 | 36 | +931,50 | +761,50 | Non |
| 28 | MES/closed-breakeven150 | 28 | -247,50 | -277,50 | Non |
| 28 | MYM/closed-breakeven150 | 37 | -213,00 | -276,00 | Non |
| 28 | MGC/closed-breakeven150 | 32 | -700,00 | -672,00 | Non |
| 29 | PORTFOLIO/shared150 | 100 | +492,75 | +591,75 | Non |
| 30 | PORTFOLIO/august-shared150 | 26 | -561,50 | -975,00 | Non |
