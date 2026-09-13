# Jeu43 — Test terminé, aucun changement de performance

Test exécuté une seule fois après le gel publié `1c776a3073bc04423179236b1ac42591694a0cdf`, du10septembre2026 à13:11:25UTC à13:15:58UTC, soit4min33s. Les deux variantes ne sont pas retenues : aucune amélioration stricte.

## Ce qui a été mesuré

La normalisation du passé, inspirée du code Kronos inspecté, mesure la distance d'entrée au niveau de cassure avec64 M15 clôturées. Deux variantes isolées refusent une extension supérieure à un écart-type : MNQ ou MES. Aucune inférence, aucun réentraînement et aucun seuil retouché.

**Aucun signal n'est filtré.** Sur118signaux MNQ,110ont une fenêtre exploitable : extension maximale0,95496, inférieure au seuil1. Sur68signaux MES,65sont exploitables : maximum0,64259. Les8/3cas sans contexte complet conservent la référence avec motif explicite. Les effectifs de signaux sont distincts des trades exécutés.

Les48 comptes complets, y compris transactions, journées, refus, retraits simulés et soldes, sont identiques à leur témoin correspondant. Zéro gagnant retiré, zéro perte évitée et zéro nouvelle admission. Le nouveau module fonctionne comme mesure descriptive ; l'efficacité de ce filtre n'est pas démontrée. Ce résultat ne démontre pas l'inutilité générale de la normalisation ou de Kronos.

## Résultats identiques pour référence, variante MNQ et variante MES

| Mesure | Frais normaux | Frais doublés |
| --- | ---: | ---: |
| Net observé janvier–août | 1 923,25 USD | 1 154,00 USD |
| Moyenne observée par mois | 240,41 USD | 144,25 USD |
| Trades | 122 | 110 |
| Gagnants / perdants | 53 / 69 | 48 / 62 |
| Taux de réussite | 43,44 % | 43,64 % |
| Pire baisse réalisée mensuelle | 730,25 USD | 689,50 USD |
| Mois négatifs | 3 | 3 |
| Retraits simulés | 0 | 0 |

| Mois | Frais normaux | Frais doublés |
| --- | ---: | ---: |
| Janvier | 511,00 USD | 48,00 USD |
| Février, partiel | 663,25 USD | 616,75 USD |
| Mars, partiel | −297,50 USD | −250,50 USD |
| Avril | 323,75 USD | 216,25 USD |
| Mai | −256,50 USD | −197,50 USD |
| Juin | 1 048,75 USD | 785,50 USD |
| Juillet | 176,00 USD | 164,00 USD |
| Août | −245,50 USD | −228,50 USD |

Compte50K funded supposé déjà qualifié, neuf chaque mois. Risque maximal100USD et limite200USD/jour inchangés. Ce total additionne huit comptes mensuels ; ce n'est pas une courbe continue. Les25février et6mars sont exclus :164/166séances, février/mars partiels, résultats des journées absentes inconnus. Les historiques sont déjà vus ; aucune confirmation indépendante, aucun mois à4000USD.

## Vérification sans recalcul

48relectures terminées ;16témoins entiers Game40 exacts ;984préfixes compte, filtre, contexte historique et normalisation chacun.696 enregistrements de trades vérifiés dans les copies des48comptes ; ce nombre ne représente pas696trades indépendants. Les empreintes des deux sorties, leur taille, l'égalité de tous les comptes et les sommes des trades ont été revérifiées à la reprise. Les92dépendances du gel restent intactes.

Le rapport et les exécutions détaillés sont conservés dans l'archive privée `Nykuto_Jeu43_resultats_verifies_2026-09-10.zip`, avec progression et empreintes. Les calendriers quotidiens de chaque variante y sont présents et exactement identiques à la référence40. La page de calendrier existante conserve ses données ; aucun nouveau calcul d'interface.

Deux configurations exécutées ajoutées au registre :97entrées /114clés croisées ; les95/112antérieures sont conservées. Sélection nulle, zéro activation, aucun nouveau test lancé. Le seuil1 reste celui de l'hypothèse gelée.

[Résumé vérifié](./jeu43-summary.json) · [Protocole historique](./JEU43_PROTOCOL.md) · [Mécanismes inspectés](./JEU43_RESEARCH.md).
