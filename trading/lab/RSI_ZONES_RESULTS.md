# RSI : survente et surachat — complément du 9 septembre 2026

**L’audit précédent utilisait surtout le niveau 50 ; la demande de Diego porte
sur les zones 30/70. Ce sont des observations distinctes.** Le constat selon
lequel le RSI directionnel accompagnait aussi les pertes ne permettait pas de
conclure sur l’utilité des zones de survente/surachat.

Ce complément utilise les mêmes trades et le même RSI 14 de Wilder sur bougies
closes de 5 minutes de séance cash. Les seuils sont fixés à <30 et >70 ; les
valeurs exactes 30 et 70 restent intermédiaires. Les zones sont classées sans
arrondir le RSI. La capture fournie montre un graphique mensuel d’Air Liquide :
ses valeurs ne sont pas celles du RSI 5 minutes des microcontrats étudiés.

## Zones à l’entrée — observations principales

126 trades distincts aux coûts initiaux, janvier–avril et août. Dans chaque
cellule : nombre de trades / gagnants / perdants / zéros, puis résultat net.
Ce sont des sous-groupes du portefeuille existant, pas un replay avec un filtre.

| Marché | Survente <30 | Intermédiaire 30–70 | Surachat >70 | Inconnu |
| --- | --- | --- | --- | --- |
| MNQ | 2 / 1 / 1 / 0 ; -32,50 $ | 28 / 13 / 14 / 1 ; +183,50 $ | 4 / 3 / 1 / 0 ; +284,50 $ | 0 / 0 / 0 / 0 ; +0,00 $ |
| MES | 5 / 2 / 3 / 0 ; -107,50 $ | 15 / 6 / 9 / 0 ; +25,00 $ | 3 / 0 / 3 / 0 ; -246,25 $ | 0 / 0 / 0 / 0 ; +0,00 $ |
| MYM | 2 / 0 / 2 / 0 ; -47,00 $ | 27 / 11 / 15 / 1 ; -106,00 $ | 10 / 4 / 5 / 1 ; -8,50 $ | 1 / 0 / 1 / 0 ; -27,50 $ |
| MGC | 1 / 1 / 0 / 0 ; +209,50 $ | 23 / 8 / 15 / 0 ; -510,50 $ | 5 / 3 / 2 / 0 ; +314,50 $ | 0 / 0 / 0 / 0 ; +0,00 $ |

Sur MNQ, quatre entrées avec RSI >70 donnent trois gains et une perte. Trois
sont des achats, totalisant +225 USD ; une est une vente, +59,50 USD. Ce petit
échantillon ne qualifie aucun filtre et contredit une règle de vente automatique
sur toute lecture supérieure à 70.

Sur MES, les trois achats avec RSI >70 perdent 246,25 USD. Sur MYM, dix achats
en surachat donnent quatre gains, cinq pertes et un zéro, total −8,50 USD.
Le même seuil ne produit donc pas le même résultat dans ces profils observés.
MGC a une seule vente en survente, gagnante : un cas ne valide pas cette entrée.

Les zéros de résultat des groupes vides signifient aucune opération ; le nombre
est toujours affiché et leur taux de réussite reste inconnu. MYM conserve un
trade au RSI insuffisamment préparé, au lieu de le classer dans la zone centrale.

## Août aux coûts initiaux

| Marché | Survente <30 | Intermédiaire 30–70 | Surachat >70 | Inconnu |
| --- | --- | --- | --- | --- |
| MNQ | 1 trades ; -128,00 $ | 7 trades ; -161,00 $ | 0 trades ; +0,00 $ | 0 trades ; +0,00 $ |
| MES | 0 trades ; +0,00 $ | 1 trades ; -25,00 $ | 0 trades ; +0,00 $ | 0 trades ; +0,00 $ |
| MYM | 0 trades ; +0,00 $ | 6 trades ; +5,50 $ | 1 trades ; -31,00 $ | 1 trades ; -27,50 $ |
| MGC | 0 trades ; +0,00 $ | 8 trades ; -314,00 $ | 1 trades ; +119,50 $ | 0 trades ; +0,00 $ |

## Sortir d’une zone est un autre événement

Le complément distingue : être déjà sous 30 ou au-dessus de 70 ; remonter depuis
<30 vers ≥30 ; repasser depuis >70 vers ≤70. Le franchissement est mesuré sur
la dernière bougie close par rapport à la précédente, dans la même séance.
Un franchissement plusieurs bougies auparavant n’est pas compté comme actuel.

Dans les 126 observations principales, aucune entrée ne coïncide avec une sortie
de survente ainsi définie. Deux entrées MGC coïncident avec une sortie de surachat,
toutes deux perdantes, total −288 USD. Il y a une observation inconnue sur MYM.
Cela ne teste pas une stratégie déclenchant de nouvelles entrées sur ces sorties
de zone : les trades actuels viennent d’autres conditions d’entrée.

## Interprétation et mise à jour

Un RSI extrême décrit le rythme relatif des hausses et baisses récentes ; il
ne garantit pas un retournement et ne mesure pas la valeur fondamentale d’un
actif. Pendant une tendance forte, il peut rester extrême longtemps.
[Guide Fidelity](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI).

La sortie d’une zone peut être étudiée séparément comme signal potentiel ; elle
n’est pas validée sur ces quelques observations.
[Présentation Schwab](https://www.schwab.com/learn/story/identifying-trend-reversals-with-rsi).

Le Lab nomme désormais explicitement le contrôle historique « RSI >50 à l’achat /
<50 à la vente » et ajoute des tableaux 30/70, franchissements et sens des trades,
pour chacun des 32 choix marché/période/coûts de l’audit. Une erreur de vérification
retire les anciens chiffres ; les choix sont conservés pour recommencer.

Les anciens moteurs, rapports et 67 entrées du registre restent inchangés.
Aucun filtre RSI de trading n’est activé et aucune amélioration de rentabilité
n’est revendiquée. La prochaine hypothèse devra préciser le marché, le sens,
l’unité de temps et le déclenchement, avant un replay distinct.

[Définitions et reproduction](RSI_ZONES_METHOD.md) · [Rapport agrégé](rsi-zone-report.json)

Validation : 271 tests trading réussis, zéro échec ; hygiène sans erreur ni
avertissement, 25 modules Functions vérifiés et build réussi. Les 126 dépendances
gelées antérieures, le rapport parent et le registre restent inchangés. Les
524 anciens IDs HTML sont conservés parmi 527 IDs uniques, avec 106 liens locaux
vérifiés. Les tableaux RSI sont couverts dans les 32 vues par DOM simulé ; aucune
vérification visuelle dans un navigateur.
