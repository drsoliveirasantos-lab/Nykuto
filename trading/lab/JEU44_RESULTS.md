# Jeu44 — Résultats vérifiés des six adaptations vidéo

Le test est terminé : **112 relectures en 4 min 39 s ; aucune des six variantes ne passe le critère gelé.** Deux variantes MES améliorent le total aux deux niveaux de coûts, mais dégradent certains mois. La référence est conservée ; aucun réglage n’est modifié après résultat.

Gel publié `aaf31a02a1c97718d06ada443a665f066144c2ba`, exécution unique le 10 septembre 2026, de 13:51:57 UTC à 13:56:36 UTC. Vérification sur les fichiers déjà produits, sans nouvelle simulation ni inférence.

## Résultats du portefeuille, janvier–août 2026

Chaque ligne est le **portefeuille complet** avec un filtre appliqué au seul marché indiqué. Les colonnes ne sont pas la contribution isolée de MNQ ou MES. Totaux observés en USD, après coûts.

| Configuration | Net normal | Net coûts doublés | Baisse mensuelle max. normale / doublée | Trades normaux / doublés | Cellules en échec |
| --- | ---: | ---: | ---: | ---: | ---: |
| Référence Jeu40 | 1 923,25 | 1 154,00 | 730,25 / 689,50 | 122 / 110 | — |
| MNQ · direction du MES | 1 780,75 | 1 029,00 | 730,25 / 689,50 | 118 / 106 | 4/16 |
| MES · direction du MNQ | 2 077,00 | 1 296,50 | 730,25 / 689,50 | 117 / 106 | 2/16 |
| MNQ · force relative | 1 445,25 | 817,00 | 751,00 / 689,50 | 114 / 103 | 8/16 |
| MES · force relative | 1 788,25 | 722,00 | 575,25 / 623,25 | 97 / 91 | 7/16 |
| MNQ · AVWAP de cassure | 1 744,25 | 996,50 | 725,25 / 691,00 | 116 / 104 | 5/16 |
| MES · AVWAP de cassure | 2 226,00 | 1 252,00 | 730,25 / 689,50 | 117 / 108 | 3/16 |

Le critère, fixé avant résultat, exigeait aucun net mensuel dégradé, aucun drawdown réalisé mensuel accru, aucune rupture du compte et au moins une amélioration stricte. Son échec signifie « non retenu selon ce protocole » ; il ne démontre pas que tout usage de ces indicateurs est inutile.

## Ce qui apporte quelque chose, et ce qui le limite

- **MES + direction du MNQ :** +153,75 USD normaux et +142,50 USD à coûts doublés. Le filtre retire un gagnant et quatre perdants en normal ; aucun nouveau trade. En juillet, le net normal tombe pourtant de 176 à 11 USD et la baisse mensuelle augmente de 312,50 à 452,50 USD. À coûts doublés, juillet passe de 164 à 86,50 USD, avec une baisse de 334 contre 330,50 USD. Le total supérieur ne suffit pas.
- **MES + AVWAP de cassure :** +302,75 USD normaux et +98 USD à coûts doublés. C’est le total normal le plus élevé de cette campagne, 2 226 USD, soit 278,25 USD par mois observé. Mais janvier se dégrade aux deux coûts, et juin normal perd 8,75 USD par rapport à la référence. Le risque maximal mensuel global n’est pas réduit. Ce n’est pas une variante validée.
- **MNQ + AVWAP :** les trades retirés auraient amélioré le net de 179 USD en normal ; les créneaux libérés admettent cinq autres perdants, coûtant 358 USD. Effet final : −179 USD. C’est pourquoi il faut rejouer le compte entier.
- **Force relative :** les deux variantes diminuent le net aux deux coûts. Sur MES, le maximum des baisses mensuelles normales est réduit de 730,25 à 575,25 USD, mais le net diminue de 135 USD, puis de 432 USD à coûts doublés. Retirer davantage de signaux ne suffit pas à améliorer l’ensemble.
- **MNQ + direction du MES :** deux gagnants et deux perdants retirés aux deux coûts ; pertes finales de 142,50 et 125 USD par rapport à la référence. Une confirmation supplémentaire peut supprimer un démarrage utile.

Ces constats portent sur les adaptations précises de Nykuto, pas sur les stratégies complètes ni la rentabilité des auteurs des vidéos. Trois mécanismes, six variantes et 112 relectures ne représentent pas 112 essais indépendants. Aucun résultat n’est combiné pour fabriquer une septième variante après coup.

## Signaux et attribution des écarts

Toutes les mesures nécessaires sont observables pour les signaux de cette archive : aucun repli pour contexte absent dans cette campagne. Cela ne garantit pas une disponibilité équivalente en temps réel. Chaque signal n’est compté qu’une fois, hors duplication par scénario de coûts.

| Variante | Signaux ciblés | Veto | Gagnants / perdants retirés, normal | Ajouts gagnants / perdants, normal | Gagnants / perdants retirés, doublé | Ajouts gagnants / perdants, doublé |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ · direction du MES | 118 | 5 | 2 / 2 | 0 / 0 | 2 / 2 | 0 / 0 |
| MES · direction du MNQ | 68 | 11 | 1 / 4 | 0 / 0 | 1 / 3 | 0 / 0 |
| MNQ · force relative | 118 | 15 | 5 / 3 | 0 / 0 | 4 / 3 | 0 / 0 |
| MES · force relative | 68 | 46 | 14 / 19 | 3 / 5 | 13 / 15 | 3 / 6 |
| MNQ · AVWAP de cassure | 118 | 17 | 3 / 8 | 0 / 5 | 3 / 8 | 0 / 5 |
| MES · AVWAP de cassure | 68 | 12 | 2 / 6 | 1 / 2 | 2 / 3 | 1 / 2 |

Les exécutions communes ne changent ni prix, ni taille, ni stop/cible, ni coûts ou net dans les contrôles effectués. Les écarts proviennent des trades retirés et des nouvelles admissions. Un veto n’est donc pas nécessairement un trade exécuté retiré, ni une perte évitée.

## Détail mensuel

Les deux tableaux donnent tous les nets mensuels du portefeuille en USD. Février et mars sont partiels.

### Coûts normaux

| Mois | Référence | MNQ direction | MES direction | MNQ relatif | MES relatif | MNQ AVWAP | MES AVWAP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Janvier | 511,00 | 511,00 | 682,25 | 335,50 | -14,25 | 563,00 | 399,75 |
| Février* | 663,25 | 663,25 | 663,25 | 663,25 | 499,50 | 534,75 | 663,25 |
| Mars* | -297,50 | -297,50 | -245,00 | -436,50 | -216,00 | -204,50 | -297,50 |
| Avril | 323,75 | 323,75 | 323,75 | 393,75 | 555,00 | 323,75 | 418,75 |
| Mai | -256,50 | -401,00 | -256,50 | -406,00 | 23,75 | -251,50 | -18,75 |
| Juin | 1 048,75 | 995,25 | 1 048,75 | 782,25 | 1 211,50 | 779,75 | 1 040,00 |
| Juillet | 176,00 | 176,00 | 11,00 | 358,50 | -32,75 | 189,00 | 176,00 |
| Août | -245,50 | -190,00 | -150,50 | -245,50 | -238,50 | -190,00 | -155,50 |

### Coûts doublés

| Mois | Référence | MNQ direction | MES direction | MNQ relatif | MES relatif | MNQ AVWAP | MES AVWAP |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Janvier | 48,00 | 48,00 | 210,50 | -124,00 | -356,00 | 103,50 | -29,50 |
| Février* | 616,75 | 616,75 | 616,75 | 616,75 | 473,00 | 491,75 | 616,75 |
| Mars* | -250,50 | -250,50 | -193,00 | -382,50 | -162,50 | -150,50 | -250,50 |
| Avril | 216,25 | 216,25 | 216,25 | 289,75 | 367,50 | 216,25 | 216,25 |
| Mai | -197,50 | -338,50 | -197,50 | -343,50 | -50,75 | -199,00 | -37,00 |
| Juin | 785,50 | 742,50 | 785,50 | 635,50 | 836,00 | 527,00 | 800,50 |
| Juillet | 164,00 | 164,00 | 86,50 | 353,50 | -154,75 | 177,00 | 164,00 |
| Août | -228,50 | -169,50 | -228,50 | -228,50 | -230,50 | -169,50 | -228,50 |

## Vérification et portée

16 comptes témoins complets identiques aux archives du Jeu40. Les 2 296 préfixes par couche (compte, filtre, contexte historique, nouvelles mesures) ont passé les contrôles lors de l’exécution. À la reprise : empreintes et tailles des sorties concordantes, 105 fichiers gelés intacts, arithmétique des 1 529 enregistrements de trades vérifiée, sommes quotidiennes et drawdowns réalisés rapprochés, attribution des écarts et critères de revue vérifiés. Ces enregistrements incluent les copies entre variantes ; ce ne sont pas 1 529 trades indépendants.

Le profit factor net, prévu par le protocole mais absent des champs du rapport d’exécution, a été calculé lors de cette vérification à partir des trades archivés : somme des gains nets des gagnants divisée par la valeur absolue des pertes nettes. Il figure dans le résumé vérifié, sans modifier le rapport gelé ni relancer le moteur.

Les deux contrôles GitHub du gel sont réussis : [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34485209884) et [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34485209859). Ils vérifient le logiciel, pas la rentabilité. L’état moteur `incomplete` signifie ici que l’objectif du compte n’est pas atteint ; la campagne, elle, est terminée.

164/166 séances : les 25 février et 6 mars restent non chiffrés. Historiques déjà vus, une seule année, préparation non uniforme, exécution à l’ouverture idéalisée. Les comptes funded 50 000 USD sont supposés déjà qualifiés et redémarrent chaque mois. Aucun objectif mensuel 4 000 USD ni retrait obtenu ; le maximum des baisses mensuelles n’est pas un drawdown continu sur huit mois. Risque maximal 100 USD et limite quotidienne 200 USD conservés.

Six configurations achevées ajoutées : registre103 / catalogue120, anciennes97 /114 conservées exactement ; zéro confirmation indépendante. Aucune activation, aucun nouveau test, aucun seuil déplacé. Les données détaillées sont archivées séparément dans `Nykuto_Jeu44_resultats_verifies_2026-09-10.zip`.

[Résumé vérifié](./jeu44-summary.json) · [Audit de reprise](./jeu44-execution-audit.json) · [Protocole historique](./JEU44_PROTOCOL.md) · [Analyse des 20 vidéos](./JEU44_RESEARCH.md).
