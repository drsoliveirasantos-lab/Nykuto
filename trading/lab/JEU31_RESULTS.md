# Jeu 31 — RSI MES et horaire MGC : résultats

Les deux filtres augmentent le net de janvier–avril et réduisent la perte d’août. Toutefois, **le diagnostic d’amélioration échoue : août reste perdant et aucune variante ne satisfait tous les critères fixés**. Ils sont ajoutés au moteur de recherche du Lab ; aucune règle d’exécution Paper, Shadow ou réelle n’est activée.

## Modifications testées

- **MES / RSI** : refuser un achat si le RSI brut est supérieur à 70, ou une vente s’il est inférieur à 30. RSI 14 de Wilder, bougies closes de 5 minutes. 30 et 70 restent intermédiaires ; RSI inconnu refusé. Aucun ordre inverse automatique.
- **MGC / horaire** : refuser toute nouvelle entrée à partir de 11 h, heure de New York, avec changement d’heure pris en compte. La gestion des positions déjà ouvertes reste identique.
- **Combinaison** : appliquer les deux filtres ensemble. Les signaux sont filtrés avant de rejouer le compte : les places libérées peuvent admettre d’autres trades. Les profils MNQ/MYM, stops, objectifs, budgets et priorité d’admission restent inchangés.

La référence et les trois variantes sont rejouées dans cinq vues et avec deux niveaux de coûts, soit **40 simulations**. Ce sont des relectures des mêmes historiques, pas 40 validations indépendantes.

## Comparaison complète

Montants nets en USD, après coûts simulés. Le diagnostic garde les budgets quotidiens mais ignore le seuil et l’objectif du compte ; le compte 25K applique le modèle historique du Lab. Chaque fenêtre redémarre à 25 000 $, sans remise à zéro à l’intérieur de la fenêtre. Les fenêtres se recoupent : ne pas additionner janvier–avril à ses sous-périodes.

| Période / mode | Variante | Trades initiaux | Net initial | Trades doublés | Net doublé |
| --- | --- | --- | --- | --- | --- |
| Janvier–avril / diagnostic | Référence actuelle | 100 | +492,75 $ | 77 | +591,75 $ |
| Janvier–avril / diagnostic | MES : éviter le RSI extrême | 97 | +812,75 $ | 75 | +838,25 $ |
| Janvier–avril / diagnostic | MGC : entrées avant 11 h | 95 | +756,25 $ | 72 | +446,75 $ |
| Janvier–avril / diagnostic | MES RSI + MGC avant 11 h | 92 | +1 076,25 $ | 70 | +693,25 $ |
| Janvier–février / diagnostic | Référence actuelle | 49 | +682,75 $ | 39 | +826,50 $ |
| Janvier–février / diagnostic | MES : éviter le RSI extrême | 47 | +826,75 $ | 38 | +865,50 $ |
| Janvier–février / diagnostic | MGC : entrées avant 11 h | 48 | +832,25 $ | 37 | +584,50 $ |
| Janvier–février / diagnostic | MES RSI + MGC avant 11 h | 46 | +976,25 $ | 36 | +623,50 $ |
| Mars–avril / diagnostic | Référence actuelle | 51 | -190,00 $ | 38 | -234,75 $ |
| Mars–avril / diagnostic | MES : éviter le RSI extrême | 50 | -14,00 $ | 37 | -27,25 $ |
| Mars–avril / diagnostic | MGC : entrées avant 11 h | 47 | -76,00 $ | 35 | -137,75 $ |
| Mars–avril / diagnostic | MES RSI + MGC avant 11 h | 46 | +100,00 $ | 34 | +69,75 $ |
| Août / diagnostic | Référence actuelle | 26 | -561,50 $ | 18 | -975,00 $ |
| Août / diagnostic | MES : éviter le RSI extrême | 26 | -561,50 $ | 18 | -975,00 $ |
| Août / diagnostic | MGC : entrées avant 11 h | 20 | -235,50 $ | 12 | -622,00 $ |
| Août / diagnostic | MES RSI + MGC avant 11 h | 20 | -235,50 $ | 12 | -622,00 $ |
| Août / account | Référence actuelle | 26 | -561,50 $ | 17 | -887,00 $ |
| Août / account | MES : éviter le RSI extrême | 26 | -561,50 $ | 17 | -887,00 $ |
| Août / account | MGC : entrées avant 11 h | 20 | -235,50 $ | 12 | -622,00 $ |
| Août / account | MES RSI + MGC avant 11 h | 20 | -235,50 $ | 12 | -622,00 $ |

Les coûts doublés changent aussi les admissions et les trades suivants, car les limites de risque incluent les coûts. Un résultat stress ponctuellement supérieur à la référence normale ne signifie donc pas que les frais créent du rendement.

## Ce qui s’améliore et ce qui échoue

- **Janvier–avril, combinaison, coûts initiaux** : +1 076,25 $ contre +492,75 $, soit +583,50 $. Drawdown 535,50 $ contre 657,75 $. Sur 92 trades : 43 gagnants, 46 perdants et 3 à zéro.
- **Mars–avril** passe de −190 $ à +100 $ aux coûts initiaux et de −234,75 $ à +69,75 $ aux coûts doublés. Les deux filtres séparés restent négatifs sur cette fenêtre.
- **Août, combinaison, coûts initiaux** : −235,50 $ contre −561,50 $, soit 326 $ de perte en moins (58,1 %). Drawdown 593 $ contre 839,50 $. Solde 24 764,50 $ sur 20 trades, dont 7 gagnants et 13 perdants.
- **Août, coûts doublés** : −622 $ avec les deux filtres, contre −975 $ en diagnostic et −887 $ en compte simulé. Drawdown combiné 769 $. L’objectif de compte n’est pas atteint.
- Le RSI MES seul améliore janvier–avril mais **ne change aucun trade d’août**. L’amélioration d’août provient du filtre MGC.
- Le filtre MGC n’aide pas partout : seul, il fait passer janvier–avril aux coûts doublés de +591,75 $ à +446,75 $. La combinaison reste à +693,25 $, en dessous du RSI seul (+838,25 $).

Aucune variante n’est automatiquement retenue. Les trois échouent au critère de rentabilité positive sur janvier–février, mars–avril et août aux deux coûts. Les critères de nombre minimal de trades, de drawdown d’août et d’absence de franchissement du seuil passent ; cela ne suffit pas.

## Gagnants retirés et pertes évitées

Les totaux ci-dessous comparent la combinaison à la référence aux coûts initiaux. Un trade retiré peut aussi résulter d’un changement d’occupation du compte. Les signaux refusés ne sont donc pas tous des trades évités.

| Période | Groupe | Trades | Gagnants | Perdants | Net du groupe |
| --- | --- | --- | --- | --- | --- |
| Janvier–avril | Trades retirés | 14 | 3 | 11 | -717,25 $ |
| Janvier–avril | Nouveaux trades | 6 | 2 | 4 | -133,75 $ |
| Août | Trades retirés | 6 | 1 | 5 | -326,00 $ |
| Août | Nouveaux trades | 0 | 0 | 0 | +0,00 $ |

Sur janvier–avril, retirer 14 trades supprime **3 gagnants et 11 perdants** (net −717,25 $). Six nouveaux trades sont admis, dont 2 gagnants et 4 perdants (net −133,75 $). L’amélioration totale est donc 717,25 − 133,75 = 583,50 $. Les 86 entrées communes gardent les mêmes sorties.

En août, **1 gagnant et 5 perdants** sont retirés, sans nouveau trade ; leur net initial était −326 $. Les 20 entrées communes gardent les mêmes sorties. Le filtre ne sait pas à l’avance lesquels gagneront : ce constat vient de la comparaison historique.

## Contributions par marché, combinaison

| Période | Marché | Trades initiaux | Gagnants | Perdants | Net initial | Trades doublés | Net doublé |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Janvier–avril | MES | 15 | 6 | 9 | -78,75 $ | 11 | -171,25 $ |
| Janvier–avril | MGC | 15 | 8 | 7 | +471,50 $ | 14 | +219,00 $ |
| Janvier–avril | MNQ | 31 | 17 | 13 | +719,50 $ | 29 | +772,50 $ |
| Janvier–avril | MYM | 31 | 12 | 17 | -36,00 $ | 16 | -127,00 $ |
| Août | MES | 1 | 0 | 1 | -25,00 $ | 0 | +0,00 $ |
| Août | MGC | 3 | 2 | 1 | +131,50 $ | 4 | +32,00 $ |
| Août | MNQ | 8 | 2 | 6 | -289,00 $ | 8 | -654,00 $ |
| Août | MYM | 8 | 3 | 5 | -53,00 $ | 0 | +0,00 $ |

MGC passe à +131,50 $ en août, mais sur seulement 3 trades aux coûts initiaux. MNQ reste le principal foyer de pertes du mois : −289 $ sur 8 trades, puis −654 $ sur 8 pertes aux coûts doublés. Le MES d’août ne compte qu’un trade aux coûts initiaux : insuffisant pour conclure sur son filtre RSI. Un marché sans admission aux coûts doublés n’est pas un marché validé.

## Août, semaine par semaine

La référence normale égale son compte simulé ; la combinaison égale aussi son compte simulé à chacun des deux coûts. La référence stress diffère entre diagnostic et compte. Le 31 août est une semaine partielle. Les soldes restent continus.

| Date NY | Réf. initial | Combiné initial | Réf. stress diag. | Réf. stress compte | Combiné stress | Cumul combiné initial |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-03 → 2026-08-07 | +191,00 $ | +205,00 $ | -70,50 $ | -70,50 $ | -47,50 $ | +205,00 $ |
| 2026-08-10 → 2026-08-14 | -126,50 $ | +102,00 $ | -167,50 $ | -167,50 $ | +74,50 $ | +307,00 $ |
| 2026-08-17 → 2026-08-21 | -477,00 $ | -477,00 $ | -468,50 $ | -468,50 $ | -468,50 $ | -170,00 $ |
| 2026-08-24 → 2026-08-28 | -149,00 $ | -65,50 $ | -268,50 $ | -180,50 $ | -180,50 $ | -235,50 $ |
| 2026-08-31 → 2026-08-31 | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | -235,50 $ |

## Août, jour par jour

Les séances sans trade sont conservées. Les montants sont les nets de la journée.

| Date NY | Réf. initial | Combiné initial | Réf. stress diag. | Réf. stress compte | Combiné stress | Cumul combiné initial |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-03 | -107,00 $ | -27,50 $ | -84,00 $ | -84,00 $ | +0,00 $ | -27,50 $ |
| 2026-08-04 | -31,00 $ | -31,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | -58,50 $ |
| 2026-08-05 | +216,00 $ | +216,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +157,50 $ |
| 2026-08-06 | +179,50 $ | +179,50 $ | +88,00 $ | +88,00 $ | +88,00 $ | +337,00 $ |
| 2026-08-07 | -66,50 $ | -132,00 $ | -74,50 $ | -74,50 $ | -135,50 $ | +205,00 $ |
| 2026-08-10 | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +205,00 $ |
| 2026-08-11 | -77,00 $ | -25,50 $ | -56,00 $ | -56,00 $ | +0,00 $ | +179,50 $ |
| 2026-08-12 | +99,00 $ | +99,00 $ | +74,50 $ | +74,50 $ | +74,50 $ | +278,50 $ |
| 2026-08-13 | -89,50 $ | +0,00 $ | -94,00 $ | -94,00 $ | +0,00 $ | +278,50 $ |
| 2026-08-14 | -59,00 $ | +28,50 $ | -92,00 $ | -92,00 $ | +0,00 $ | +307,00 $ |
| 2026-08-17 | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +307,00 $ |
| 2026-08-18 | -128,00 $ | -128,00 $ | -131,50 $ | -131,50 $ | -131,50 $ | +179,00 $ |
| 2026-08-19 | -23,50 $ | -23,50 $ | +0,00 $ | +0,00 $ | +0,00 $ | +155,50 $ |
| 2026-08-20 | -77,00 $ | -77,00 $ | -80,50 $ | -80,50 $ | -80,50 $ | +78,50 $ |
| 2026-08-21 | -248,50 $ | -248,50 $ | -256,50 $ | -256,50 $ | -256,50 $ | -170,00 $ |
| 2026-08-24 | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | -170,00 $ |
| 2026-08-25 | -71,50 $ | -71,50 $ | -136,00 $ | -136,00 $ | -136,00 $ | -241,50 $ |
| 2026-08-26 | +26,50 $ | +26,50 $ | +0,00 $ | +0,00 $ | +0,00 $ | -215,00 $ |
| 2026-08-27 | -124,50 $ | -41,00 $ | -132,50 $ | -44,50 $ | -44,50 $ | -256,00 $ |
| 2026-08-28 | +20,50 $ | +20,50 $ | +0,00 $ | +0,00 $ | +0,00 $ | -235,50 $ |
| 2026-08-31 | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | +0,00 $ | -235,50 $ |

La semaine du 17 au 21 août perd encore 477 $ avec la combinaison aux coûts initiaux. Supprimer cette semaine après l’avoir observée serait un ajustement rétrospectif, pas une preuve d’amélioration.

## Ce qu’il reste à vérifier

La prochaine hypothèse devrait viser le contexte des entrées MNQ perdantes et la sensibilité aux coûts, en gardant une définition fixée avant de nouveaux résultats. Les données actuelles ne permettent pas de dire que les annonces, divergences RSI, zones d’offre/demande ou liquidité auraient corrigé ces pertes. Les packs fournis enrichissent déjà la documentation et les références d’analyse ; ils ne constituent pas des détecteurs validés ni un historique d’annonces horodatées.

## Traçabilité et limites

- Les sources privées restaurées correspondent exactement aux empreintes de l’audit. Janvier–avril comporte 80 séances complètes communes sur 82 : le 25 février manque pour MGC ; le 6 mars manque pour MES, MGC et MNQ. Août est complet : 21/21 séances. Mai–juillet et septembre ne sont pas évalués ici.
- 10 simulations de référence sont identiques aux archives, trades, journées et décisions compris. 49 contextes RSI sont recalculés sur les seules bougies disponibles ; 1 616 préfixes de replay sont identiques après retrait des journées futures. Les 1 658 lignes de trades parcourues recoupent les mêmes observations.
- Les règles ont été enregistrées localement avant les nouveaux calculs, au commit `d4ddfff0e4b4af64c9dda7c600fc4edf5178fb17`. Le commit GitHub `a3bfc9ed7a0ad8bdc7d28a2fce875c030f5d25bb` publie ensuite le même arbre `63499e08a0e037a568385076a741a5d28c006e7e`. Ce n’est pas un préenregistrement externe : les audits et août étaient déjà observés.
- Les 44 fichiers de calcul et dépendances sont figés dans `jeu31-freeze.json`. Aucun paramètre n’a été changé après les résultats. Trois configurations sont ajoutées au registre : 67 → 70, sans modification des 67 anciennes. Le test de l’audit reconstruit son document de registre historique et vérifie encore son empreinte exacte.
- Les exécutions individuelles et décisions restent privées dans `jeu31/market-filters-v1/`. Six fragments et les deux fichiers décompressés ont été relus et vérifiés par SHA-256 ; le manifeste est `jeu31-archive.json`. Le rapport public compact contient les mêmes résultats agrégés que le rapport privé lisible.
- Aucune exécution réelle, donnée tick par tick, qualité de remplissage réelle, carnet d’ordres ou annonce historique n’est validée. Aucun déploiement, abonnement, paramètre de collecte ou connexion courtier n’est modifié.

## Vérifications effectuées

285 tests de trading réussis, dont les bornes RSI/horaires, les admissions libérées, les 40 choix du panneau et la suppression des chiffres périmés après un chargement invalide. Hygiène : 0 anomalie et 0 avertissement ; 25 fonctions validées ; build statique réussi. Les 527 identifiants HTML existants sont conservés, les 18 nouveaux sont uniques et 96 liens locaux sont valides. La présentation est contrôlée par le HTML/CSS et les tests DOM ; aucune inspection visuelle dans un navigateur n’est revendiquée.

Voir [le protocole](JEU31_PROTOCOL.md), [les résultats structurés](jeu31-report.json), [le registre](research-ledger.json), [l’audit RSI](RSI_ZONES_RESULTS.md) et [l’intégration des connaissances](../knowledge/INTEGRATION_AUDIT.md).
