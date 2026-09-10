# Jeu45 — Résultats vérifiés : horaires et sortie à 30 minutes

**112 relectures terminées en 4 min27s. Une seule variante passe le filtre descriptif fixé : MNQ sortie30min.** Elle améliore deux pertes historiques, pour +91USD aux coûts normaux comme doublés. Cinq variantes sont non retenues. Aucun changement automatique de référence ni activation ; deux trades modifiés ne constituent pas une confirmation indépendante.

Exécution unique le10septembre2026, 14:47:41.712–14:52:08.893UTC, après gel publié `aee222ff039721c7e6d50188cb6ed2c0d21ec8c0`. Vérification uniquement sur les sorties existantes, sans nouvelle simulation ni inférence.

## Portefeuille complet janvier–août

Chaque ligne représente tout le portefeuille, avec une règle modifiée sur le seul indice nommé. Les montants ne sont pas la contribution isolée de cet indice. Moyenne nette = gains et pertes, frais inclus.

| Variante | Net normal USD | Net coûts doublés USD | Moyenne/trade normale / doublée USD | Baisse mensuelle max. normale / doublée USD | Critère |
| --- | ---: | ---: | ---: | ---: | --- |
| Référence Jeu40 | 1 923,25 | 1 154,00 | 15,76 / 10,49 | 730,25 / 689,50 | Référence |
| MNQ · pendant Londres | 1 508,25 | 828,00 | 13,84 / 8,54 | 730,25 / 689,50 | Non retenue |
| MES · pendant Londres | 1 930,50 | 1 091,75 | 17,24 / 10,40 | 632,75 / 635,75 | Non retenue |
| MNQ · hors Londres | 710,00 | 385,25 | 8,07 / 4,88 | 595,75 / 609,50 | Non retenue |
| MES · hors Londres | 1 756,25 | 973,75 | 17,92 / 10,94 | 531,50 / 520,75 | Non retenue |
| MNQ · sortie30min | 2 014,25 | 1 245,00 | 16,51 / 11,32 | 730,25 / 689,50 | Candidate de recherche |
| MES · sortie30min | 1 888,25 | 966,50 | 15,48 / 8,79 | 686,50 / 645,75 | Non retenue |

Le critère exige aucun net mensuel dégradé, aucun drawdown réalisé mensuel accru et aucun dépassement du compte dans les16cellules, avec au moins un meilleur net et une meilleure moyenne nette agrégée aux deux coûts. Il n'est pas remplacé après résultat par le meilleur total ou la meilleure moyenne.

## Ce qui apporte +91USD

La sortie MNQ vérifie le net latent frais compris une seule fois, après six M5 complètes. S'il est non positif, elle sort à l'ouverture suivante, avec les priorités de risque historiques.

Les deux pertes MNQ concernées passent ensemble de−157,50 à−66,50USD aux coûts normaux, et de−164,50 à−73,50USD aux coûts doublés. L'amélioration mensuelle est de53,50USD enmai et37,50USD enjuillet. Les durées passent de45→30minutes et35→30minutes. Tous les autres trades et leurs admissions restent identiques ; aucun gagnant retiré ni nouveau trade. Il s'agit des mêmes deux occasions aux deux coûts, pas de quatre preuves indépendantes. Les transactions détaillées restent dans l'archive privée.

Total normal1923,25→2014,25USD ; moyenne nette/trade15,76→16,51USD sur122trades. Doublé1154→1245USD ; moyenne10,49→11,32USD sur110trades. La perte moyenne normale passe de78,00 à76,68USD, tandis que le gain moyen des gagnants reste137,83USD et le taux de réussite43,44%. Le progrès vient de pertes réduites, pas de gagnants plus gros ni d'un risque augmenté. Les maxima des baisses mensuelles sont inchangés730,25/689,50USD ; tous les drawdowns mensuels de cette variante sont identiques à la référence.

Mai reste négatif (−203USD normal) et juillet passe à213,50USD normal. Mars et août restent négatifs. Les six autres mois ne changent pas ; aucun4Kmensuel ni retrait simulé obtenu. La référence opérationnelle de recherche resteJeu40 ; la nouvelle variante reste codée et archivée comme candidate à confirmer sur des observations indépendantes.

## Ce qui ne fonctionne pas ici

- **Horaires MNQ :** ne garder que les entrées pendant Londres retire des gagnants utiles : −415USD normaux/−326 doublés. Hors Londres, −1213,25/−768,75USD et une forte réduction des occasions. Aucun créneau optimal n'est établi.
- **MES pendant Londres :** +7,25USD normal mais −62,25USD doublés ; plusieurs mois et certains drawdowns se dégradent. Le petit gain agrégé normal ne passe pas le critère.
- **MES hors Londres :** moyenne nette17,92/10,94USD, supérieure à la référence, mais total réduit de167/180,25USD. Juillet normal176→−257,75USD, drawdown312,50→446,25USD. Améliorer la moyenne en supprimant des occasions peut réduire le revenu total.
- **Sortie30min MES :** deux pertes réduites ne compensent pas les gagnants lents sacrifiés. Normal : en janvier un gagnant devient neutre, deux pertes s'améliorent de43,75 et46,25 ; bilan−35USD. Doublé : un second gagnant lent est sacrifié en juillet ; bilan−187,50USD. Ne pas appliquer la candidate MNQ à tous les marchés.

## Horaires réellement observés

118signaux MNQ ciblés :96 pendant le repère londonien et22 après. MES :68signaux,49 pendant,18 après et1 pendant un jour férié londonien. Un veto ne correspond pas nécessairement à un trade supprimé. Les frais et la libération d'une position peuvent changer les admissions et tailles ailleurs ; le compte entier a été rejoué.

Londres est un repère conventionnel08:00–16:30 Europe/London avec les jours fériés anglais/gallois figés, pas un flux LSE ni un chevauchement Forex mesuré. Le calendrier boursier LSE complet n'a pas été obtenu. Les entrées testées restent dans la fenêtre US d'origine10:10–12:00 New York, avec MGC avant11h. Aucun test d'ouverture asiatique/européenne ni de nouvelles entrées l'après-midi. Les fuseaux et catégories ont été rapprochés séparément avec Python zoneinfo lors de la vérification.

## Tous les mois

Les comptes redémarrent chaque mois. Février et mars sont partiels.

### Coûts normaux

| Mois | Référence | MNQ Londres | MES Londres | MNQ hors | MES hors | MNQ30min | MES30min |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Janvier | 511,00 | 253,50 | 220,75 | 333,50 | 364,75 | 511,00 | 386,00 |
| Février* | 663,25 | 490,75 | 663,25 | 347,25 | 499,50 | 663,25 | 663,25 |
| Mars* | -297,50 | -297,50 | -297,50 | -169,00 | -108,50 | -297,50 | -297,50 |
| Avril | 323,75 | 393,75 | 228,75 | -25,25 | 660,00 | 323,75 | 323,75 |
| Mai | -256,50 | -337,00 | 17,25 | -181,00 | -108,75 | -203,00 | -212,75 |
| Juin | 1 048,75 | 772,25 | 1 112,75 | 625,25 | 839,00 | 1 048,75 | 1 048,75 |
| Juillet | 176,00 | 345,50 | 242,25 | 89,25 | -257,75 | 213,50 | 222,25 |
| Août | -245,50 | -113,00 | -257,00 | -310,00 | -132,00 | -245,50 | -245,50 |

### Coûts doublés

| Mois | Référence | MNQ Londres | MES Londres | MNQ hors | MES hors | MNQ30min | MES30min |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Janvier | 48,00 | -108,50 | -120,25 | -140,00 | -117,75 | 48,00 | -77,00 |
| Février* | 616,75 | 447,75 | 616,75 | 314,75 | 473,00 | 616,75 | 616,75 |
| Mars* | -250,50 | -250,50 | -250,50 | -92,50 | -45,00 | -250,50 | -250,50 |
| Avril | 216,25 | 235,75 | 132,75 | 76,75 | 462,50 | 216,25 | 216,25 |
| Mai | -197,50 | -271,00 | -51,25 | -169,50 | -40,75 | -144,00 | -153,75 |
| Juin | 785,50 | 519,50 | 763,50 | 492,50 | 763,50 | 785,50 | 785,50 |
| Juillet | 164,00 | 344,00 | 235,25 | 136,75 | -297,25 | 201,50 | 57,75 |
| Août | -228,50 | -89,00 | -234,50 | -233,50 | -224,50 | -228,50 | -228,50 |

## Vérifications et limites

16comptes témoins entiers exactement reproduits.119dépendances gelées intactes ; empreintes/tailles des quatre entrées et deux sorties contrôlées.1473enregistrements de trades rapprochés : prix/coûts/net, soldes, sommes quotidiennes, drawdowns, attribution des écarts et critères. Ils incluent les copies entre variantes. Les11sorties temporelles enregistrées ont été rapprochées avec les clôtures et ouvertures des archives natives ; elles représentent6occasions uniques tous indices réunis.2296préfixes par couche (compte/filtre/contexte) contrôlés pendant le calcul. Aucune nouvelle performance pendant la reprise.

Les contrôles GitHub du gel sont verts : [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34491315380) et [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34491314986). Les326tests logiciels préalables ne prouvent pas la rentabilité.

164/166séances ;25février et6mars absents, non remplacés par zéro. Une année déjà observée, préparation héritée non uniforme, exécution à l'ouverture idéalisée, risque de glissement non finement mesuré. Le maximum des drawdowns mensuels n'est pas celui d'un compte continu sur8mois. Une amélioration fondée sur deux trades reste très fragile. Pas d'activation, de retrait réel, de réglage après résultat ni de nouvelle campagne.

Six configurations enregistrées :registre109/catalogue126 ; anciennes103/120 conservées exactement. Une candidate descriptive, cinq non retenues, zéro confirmation indépendante, sélection nulle. Sorties détaillées et audit de prix archivés séparément dans `Nykuto_Jeu45_resultats_verifies_2026-09-10.zip`.

[Résumé vérifié](./jeu45-summary.json) · [Audit](./jeu45-execution-audit.json) · [Protocole figé](./JEU45_PROTOCOL.md).
