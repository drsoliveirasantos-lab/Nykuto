# Jeu 37 — Risque selon les confirmations, objectif mensuel de 4 000 $

**Décision : référence à 100 $ conservée.** Le moteur accepte maintenant des montants variables selon le score du signal et le marché, avec réduction liée à la marge restante. Les deux barèmes gradués et les deux hausses fixes restent des expériences non retenues. Aucun ne satisfait l’objectif mensuel et la limite de baisse fixés avant calcul.

Le fixe 500 $ atteint 4 365,75 $ en juin aux coûts normaux, mais 3 823,50 $ avec les coûts doublés. Juillet et août normaux restent perdants. Augmenter les montants amplifie les variations et change les admissions ; cela ne crée pas une stratégie régulièrement rentable.

## Périmètre

- Funded LucidFlex 50K supposé déjà obtenu, neuf en juin, juillet et août **2026**. Les mois sont trois expériences réinitialisées, pas un compte continu.
- Les 4 000 sont interprétés comme **4 000 USD de bénéfice de trading après coûts**, avant partage et fiscalité, pas comme 4 000 EUR personnels.
- Objectif personnel conservé : premier versement simulé de 1 000 EUR. Les nouveaux scénarios continuent ensuite jusqu’à 4 000 USD de bénéfice ou la fin du mois. Une seule demande personnelle est modélisée.
- Ancien témoin : arrêt au premier objectif personnel, exactement reproduit. Nouvelle référence 100 : cycle ci-dessus ; mêmes résultats ici, car aucun retrait n’y est atteint.
- MNQ et MES gardent leurs signaux et stops ; MGC garde sa cassure échouée avant 11 h New York, plafond nominal 100 USD et cible 2R ; MYM exclu. Une place partagée peut modifier les trades MGC.
- Aucune collecte nouvelle ; données déjà consultées. Ni validation indépendante, ni déploiement de trading réel, ni Paper/Shadow.

## Barèmes fixés avant lecture des résultats

Les montants suivants sont des **plafonds de perte planifiée, frais compris**, pas la valeur nominale de la position. Un gap peut dépasser cette perte prévue. Quantités entières, maximum 20 microcontrats, réduction selon marge du compte, puis refus si aucune quantité ne respecte les règles. Aucun rattrapage des pertes.

| Barème | 0–2 confirmations / contexte incomplet | 3–4 | 5 | Limite quotidienne interne |
|---|---:|---:|---:|---:|
| Référence 100 $ | 100 $ | 100 $ | 100 $ | 200 $ |
| Indices : fixe 250 $ | 250 $ | 250 $ | 250 $ | 500 $ |
| Indices : 50 / 150 / 250 $ | 50 $ | 150 $ | 250 $ | 500 $ |
| Indices : fixe 500 $ | 500 $ | 500 $ | 500 $ | 1000 $ |
| Indices : 100 / 250 / 500 $ | 100 $ | 250 $ | 500 $ | 1000 $ |

MGC : plafond nominal 100 USD quel que soit le score. Les paliers de compte s’appliquent aussi à lui : moitié sous 1 000 USD de marge, quart sous 500 USD. Remontée de palier conditionnée aussi au retour du solde à 50 000 USD. Réserve de 100 USD au-dessus du seuil de perte. Une hausse du plafond quotidien accompagne la hausse de risque : son effet n’est pas isolé dans les résultats.

Le score réutilise cinq familles historiques disponibles avant entrée : tendance EMA 9/21 avec VWAP, structure confirmée, RSI directionnel, volume comparé aux cinq mêmes créneaux de session et forme de bougie. Il ne s’agit pas de cinq probabilités indépendantes. La méthode H1 20/50 de la transcription demeure distincte : voir [audit de l’appel](./ASSOCIATE_METHOD_2026-09-10.md).

## Résultats mensuels après coûts

Baisse maximale : pire recul réalisé entre trades dans un mois, sans soustraire les retraits du bénéfice. Elle ne capture pas toute la baisse latente intrabougie.

| Barème | Coûts | Juin | Juillet | Août | Pire baisse | Mois à4K | Mois avec retrait1 000 EUR |
|---|---|---:|---:|---:|---:|---:|---:|
| Référence 100 $ | Normaux | +1 048,75 | +176,00 | -245,50 | +442,00 | 0/3 | 0/3 |
| Référence 100 $ | Doublés | +785,50 | +164,00 | -228,50 | +359,50 | 0/3 | 0/3 |
| Indices : fixe 250 $ | Normaux | +2 809,75 | -17,25 | -678,00 | +1 297,50 | 0/3 | 1/3 |
| Indices : fixe 250 $ | Doublés | +2 347,75 | +83,00 | -977,00 | +1 232,00 | 0/3 | 0/3 |
| Indices : 50 / 150 / 250 $ | Normaux | +324,75 | -96,00 | -206,00 | +574,50 | 0/3 | 0/3 |
| Indices : 50 / 150 / 250 $ | Doublés | +211,00 | +59,50 | -126,00 | +442,50 | 0/3 | 0/3 |
| Indices : fixe 500 $ | Normaux | +4 365,75 | -200,75 | -909,00 | +1 844,50 | 1/3 | 1/3 |
| Indices : fixe 500 $ | Doublés | +3 823,50 | +61,50 | -1 070,50 | +1 846,00 | 0/3 | 1/3 |
| Indices : 100 / 250 / 500 $ | Normaux | +1 154,00 | +159,00 | -604,50 | +1 038,00 | 0/3 | 0/3 |
| Indices : 100 / 250 / 500 $ | Doublés | +741,75 | +314,50 | -474,50 | +928,75 | 0/3 | 0/3 |

Le fixe 500 termine juillet stress avec 154 USD de marge au seuil, août avec155,50 USD normaux/164,50 USD stress. Au-delà de la réserve interne100 USD, il reste donc seulement54 / 55,50 / 64,50 USD. Aucun compte formellement invalidé dans ces relectures, mais cette proximité ne permet pas de qualifier ce barème de robuste.

## Ce que les confirmations montrent

Référence 100 uniquement, pour observer le score sans y attacher un plafond supérieur. Les effectifs portent sur les trades exécutés, pas tous les signaux. R=résultat net/perte prévue frais compris. Les moyennes ci-dessous agrègent les moyennes mensuelles arrondies : approximation à0,001 R.

| Marché | Grade | Coûts | Trades | Gagnants | Net | R moyen |
|---|---|---|---:|---:|---:|---:|
| MNQ | 0–2 / incomplet | normal | 11 | 5 | +135,00 | +0.215 |
| MNQ | 0–2 / incomplet | stress | 10 | 4 | -27,00 | +0.056 |
| MNQ | 3–4 | normal | 9 | 4 | +187,50 | +0.243 |
| MNQ | 3–4 | stress | 9 | 4 | +106,00 | +0.167 |
| MNQ | 5 | normal | 0 | 0 | +0,00 | — |
| MNQ | 5 | stress | 0 | 0 | +0,00 | — |
| MES | 0–2 / incomplet | normal | 12 | 5 | +95,00 | +0.048 |
| MES | 0–2 / incomplet | stress | 7 | 3 | +27,50 | +0.019 |
| MES | 3–4 | normal | 5 | 2 | +46,25 | +0.063 |
| MES | 3–4 | stress | 5 | 3 | +187,50 | +0.432 |
| MES | 5 | normal | 0 | 0 | +0,00 | — |
| MES | 5 | stress | 0 | 0 | +0,00 | — |

Aucun trade 5/5 exécuté sous 100 USD. Sous gradué 500, un seul MES 5/5 est exécuté ; il perd440 USD aux coûts normaux et460 USD avec les coûts doublés. Ce cas ne prouve pas que5/5 est mauvais ; il exclut une lecture « tous les feux verts garantissent le gain ». Les petites différences entre grades faibles et intermédiaires ne calibrent pas une probabilité future. Les confirmations restent corrélées et le même marché est réutilisé.

## Résultat par marché et montant par trade

| Barème | Coûts | Mois | MNQ | MES | MGC | Trades | Gain moyen | Perte moyenne | Tous trades, moyenne | Meilleur trade | Risque moyen prévu |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| fixed100 | normal | Juin | +700,00 | +83,75 | +265,00 | 16 | +133,64 | -84,25 | +65,55 | +155,50 | +81,52 |
| fixed100 | stress | Juin | +559,00 | +47,50 | +179,00 | 13 | +122,72 | -79,75 | +60,42 | +151,00 | +77,40 |
| fixed250 | normal | Juin | +2 588,50 | -43,75 | +265,00 | 18 | +348,42 | -228,54 | +156,10 | +460,50 | +212,72 |
| fixed250 | stress | Juin | +2 277,50 | -108,75 | +179,00 | 16 | +306,00 | -203,65 | +146,73 | +446,00 | +197,45 |
| graded250 | normal | Juin | +308,50 | -248,75 | +265,00 | 14 | +119,50 | -105,21 | +23,20 | +195,00 | +84,54 |
| graded250 | stress | Juin | +294,50 | -262,50 | +179,00 | 11 | +129,83 | -113,60 | +19,18 | +180,00 | +96,45 |
| fixed500 | normal | Juin | +4 814,50 | -713,75 | +265,00 | 17 | +636,32 | -438,96 | +256,81 | +921,00 | +399,51 |
| fixed500 | stress | Juin | +4 348,00 | -447,50 | -77,00 | 14 | +642,56 | -391,90 | +273,11 | +892,00 | +404,11 |
| graded500 | normal | Juin | +1 274,00 | -385,00 | +265,00 | 17 | +209,45 | -191,67 | +67,88 | +430,50 | +147,12 |
| graded500 | stress | Juin | +1 119,00 | -556,25 | +179,00 | 14 | +204,94 | -220,55 | +52,98 | +420,00 | +160,50 |
| fixed100 | normal | Juillet | -228,00 | +315,00 | +89,00 | 21 | +141,44 | -73,50 | +8,38 | +165,00 | +79,14 |
| fixed100 | stress | Juillet | -259,50 | +332,50 | +91,00 | 21 | +126,50 | -81,21 | +7,81 | +157,00 | +81,44 |
| fixed250 | normal | Juillet | -689,50 | +728,75 | -56,50 | 24 | +310,88 | -156,52 | -0,72 | +418,00 | +165,96 |
| fixed250 | stress | Juillet | -747,00 | +880,00 | -50,00 | 24 | +286,22 | -166,20 | +3,46 | +404,00 | +173,60 |
| graded250 | normal | Juillet | -332,50 | +147,50 | +89,00 | 19 | +138,86 | -89,00 | -5,05 | +247,50 | +88,53 |
| graded250 | stress | Juillet | -306,50 | +275,00 | +91,00 | 18 | +131,88 | -99,55 | +3,31 | +202,50 | +93,28 |
| fixed500 | normal | Juillet | -917,00 | +798,75 | -82,50 | 20 | +499,25 | -228,30 | -10,04 | +836,00 | +249,65 |
| fixed500 | stress | Juillet | -999,00 | +1 127,50 | -67,00 | 20 | +472,79 | -249,85 | +3,08 | +808,00 | +273,79 |
| graded500 | normal | Juillet | -347,00 | +562,50 | -56,50 | 23 | +212,31 | -102,63 | +6,91 | +412,50 | +111,12 |
| graded500 | stress | Juillet | -403,00 | +767,50 | -50,00 | 23 | +210,06 | -112,57 | +13,67 | +337,50 | +121,10 |
| fixed100 | normal | Août | -149,50 | -257,50 | +161,50 | 11 | +148,17 | -86,25 | -22,32 | +161,50 | +88,86 |
| fixed100 | stress | Août | -220,50 | -165,00 | +157,00 | 8 | +132,50 | -82,25 | -28,56 | +157,00 | +83,88 |
| fixed250 | normal | Août | -547,00 | -292,50 | +161,50 | 14 | +278,75 | -179,30 | -48,43 | +395,00 | +180,04 |
| fixed250 | stress | Août | -669,00 | -465,00 | +157,00 | 12 | +233,33 | -186,33 | -81,42 | +288,00 | +179,21 |
| graded250 | normal | Août | -137,50 | -230,00 | +161,50 | 11 | +149,50 | -81,81 | -18,73 | +237,00 | +84,73 |
| graded250 | stress | Août | -215,50 | -67,50 | +157,00 | 8 | +168,50 | -77,17 | -15,75 | +180,00 | +87,19 |
| fixed500 | normal | Août | -658,00 | -412,50 | +161,50 | 14 | +556,75 | -313,60 | -64,93 | +790,00 | +326,68 |
| fixed500 | stress | Août | -620,00 | -607,50 | +157,00 | 11 | +403,33 | -285,06 | -97,32 | +765,00 | +278,27 |
| graded500 | normal | Août | -358,50 | -407,50 | +161,50 | 12 | +227,17 | -142,89 | -50,37 | +395,00 | +143,63 |
| graded500 | stress | Août | -466,50 | -165,00 | +157,00 | 9 | +222,50 | -131,36 | -52,72 | +288,00 | +137,72 |

## Retraits et règles du compte

Versement personnel simulé : fixe 500 le16 juin aux deux coûts ; fixe 250 le30 juin normal. Aucun retrait sous les deux barèmes gradués ou la référence 100. Fixe500 normal atteint le bénéfice 4K le26 juin puis arrête ; les29 et30 juin restent non simulés, pas à zéro.

Conversion commune :1,1652 USD/EUR, référence BCE du 9 septembre 2026 héritée du Jeu34 ; partage 90/10, aucun frais de transfert/change ni impôt. Demande brute 1 294,67 USD, soit environ1 000 EUR ; bénéfice minimal lié au plafond 50 %=2 589,34 USD, en plus de cinq journées distinctes à 150 USD minimum. Taux de comparaison fixe, pas une conversion de juin/juillet/août.

Les pages officielles consultées le 10 septembre 2026 indiquent : funded Flex sans consistency, seuil de perte glissant en fin de journée et verrouillage à50 100 USD dès un retrait 50K. Une option de perte quotidienne peut avoir été choisie à l’achat ; sa configuration ici est inconnue et n’est pas modélisée. Les limites 200 / 500 / 1 000 USD sont des règles internes de recherche. Le champ de consistency hérité dans les métadonnées ne s’applique pas à ce scénario funded. Sources : [compte funded](https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account), [retraits](https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts), [drawdown](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown), [options du compte](https://support.lucidtrading.com/en/articles/16226050-lucidflex-customization), [limites de contrats](https://support.lucidtrading.com/en/articles/12945808-lucidflex-scaling-plan).

## Résultats journaliers

Calendriers interactifs : [ouvrir les trois mois](./#risk37Game). Les cinq nouveaux barèmes, les deux niveaux de coûts, les contributions et les semaines y sont disponibles. Tableau ci-dessous : référence 100, gradué 500 et fixe 500. « Arrêt » signifie que le test a déjà terminé. Les week-ends et les19 juin / 3 juillet non étudiés ne reçoivent aucun résultat inventé.

| Date | Réf100 normal | Réf100 stress | Gradué500 normal | Gradué500 stress | Fixe500 normal | Fixe500 stress |
|---|---:|---:|---:|---:|---:|---:|
| 2026-06-01 | +45,50 | +126,00 | +45,50 | +126,00 | +448,00 | +693,00 |
| 2026-06-02 | +28,00 | -77,00 | +28,00 | -77,00 | +140,00 | +361,00 |
| 2026-06-03 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-06-04 | +273,50 | +140,00 | +560,50 | +420,00 | +1 511,00 | +840,00 |
| 2026-06-05 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-06-08 | -86,25 | -67,50 | -230,00 | -236,25 | -488,75 | -472,50 |
| 2026-06-09 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-06-10 | -72,50 | -77,50 | -657,50 | -692,50 | -875,00 | -925,00 |
| 2026-06-11 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-06-12 | +143,50 | +140,00 | +430,50 | +420,00 | +430,50 | +420,00 |
| 2026-06-15 | +103,50 | +100,00 | +103,50 | +100,00 | +828,00 | +800,00 |
| 2026-06-16 | +0,00 | +0,00 | +0,00 | +0,00 | +906,00 | +892,00 |
| 2026-06-17 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-06-18 | -90,00 | -97,00 | -90,00 | -97,00 | -495,00 | -485,00 |
| 2026-06-22 | +109,50 | +105,00 | +109,50 | +105,00 | +109,50 | +0,00 |
| 2026-06-23 | +155,50 | +151,00 | +155,50 | +151,00 | +155,50 | +0,00 |
| 2026-06-24 | +155,00 | +72,50 | +155,00 | +72,50 | +775,00 | +290,00 |
| 2026-06-25 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-06-26 | +153,50 | +150,00 | +153,50 | +150,00 | +921,00 | +750,00 |
| 2026-06-29 | +0,00 | +0,00 | +0,00 | +0,00 | Arrêt | +0,00 |
| 2026-06-30 | +130,00 | +120,00 | +390,00 | +300,00 | Arrêt | +660,00 |
| 2026-07-01 | +150,00 | +140,00 | +150,00 | +140,00 | +825,00 | +700,00 |
| 2026-07-02 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-07-06 | -136,50 | -144,50 | -259,50 | -271,00 | -463,50 | -482,00 |
| 2026-07-07 | -82,50 | -87,00 | -82,50 | -87,00 | -82,50 | -87,00 |
| 2026-07-08 | +165,00 | +77,50 | +412,50 | +310,00 | +825,00 | +697,50 |
| 2026-07-09 | -33,50 | +135,00 | -33,50 | +337,50 | -33,50 | +675,00 |
| 2026-07-10 | -153,50 | -165,00 | -153,50 | -165,00 | -558,50 | -561,00 |
| 2026-07-13 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-07-14 | +266,00 | +258,00 | +266,00 | +258,00 | +997,50 | +965,00 |
| 2026-07-15 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-07-16 | -58,75 | -63,75 | -58,75 | -63,75 | -470,00 | -446,25 |
| 2026-07-17 | -66,25 | -71,25 | -66,25 | -71,25 | -909,75 | -958,75 |
| 2026-07-20 | -187,50 | -195,50 | -187,50 | -195,50 | -293,00 | -310,00 |
| 2026-07-21 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-07-22 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-07-23 | +160,50 | +157,00 | +321,00 | +314,00 | +160,50 | +157,00 |
| 2026-07-24 | +0,00 | +0,00 | -125,50 | -129,00 | +0,00 | +0,00 |
| 2026-07-27 | +244,50 | +230,00 | +244,50 | +230,00 | +187,50 | +115,00 |
| 2026-07-28 | -178,00 | -185,00 | -356,00 | -370,00 | -267,50 | -278,00 |
| 2026-07-29 | +145,50 | +141,00 | +304,50 | +301,00 | +0,00 | +0,00 |
| 2026-07-30 | +0,00 | +0,00 | -157,50 | -161,00 | +0,00 | +0,00 |
| 2026-07-31 | -59,00 | -62,50 | -59,00 | -62,50 | -118,00 | -125,00 |
| 2026-08-03 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-04 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-05 | +0,00 | +0,00 | +0,00 | +0,00 | +775,50 | +765,00 |
| 2026-08-06 | -150,50 | -59,00 | -150,50 | -59,00 | -408,00 | -418,50 |
| 2026-08-07 | +0,00 | +0,00 | +0,00 | +0,00 | -396,00 | -406,50 |
| 2026-08-10 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-11 | +125,00 | +0,00 | +125,00 | +0,00 | +500,00 | +0,00 |
| 2026-08-12 | +64,00 | +82,00 | +64,00 | +82,00 | -326,00 | -330,50 |
| 2026-08-13 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-14 | +158,00 | +108,00 | +395,00 | +288,00 | +790,00 | +288,00 |
| 2026-08-17 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-18 | +0,00 | +0,00 | -128,00 | -131,50 | -384,00 | -131,50 |
| 2026-08-19 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-20 | -167,00 | -80,50 | -471,00 | -241,50 | -762,00 | -241,50 |
| 2026-08-21 | +0,00 | +0,00 | +0,00 | +0,00 | -218,00 | -225,00 |
| 2026-08-24 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-25 | -193,00 | -190,00 | -193,00 | -190,00 | -357,50 | -370,00 |
| 2026-08-26 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-27 | -82,00 | -89,00 | -246,00 | -222,50 | -123,00 | +0,00 |
| 2026-08-28 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |
| 2026-08-31 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 | +0,00 |

## Traçabilité et décision

Protocole et47 dépendances figés avant performance dans le commit `ff0948823ee670385aaf34b6865bf9cb49317c82`. Empreinte du gel `ac87880b0dda78276f0efb7d7c85a874384c7e7747756ed67de0bb0e874dcdd7`. Voir [protocole](./JEU37_PROTOCOL.md), [rapport agrégé](./jeu37-report.json) et [manifeste privé sans transactions](./jeu37-archive.json).

36 relectures =3 mois × 6 configurations × 2 coûts. Six témoins reproduits exactement ; six contrôles de parité du nouveau moteur 100 ;766 préfixes quotidiens et563 exécutions contrôlés. Une revue séparée retrouve les sommes journalières, les soldes après retrait et les drawdowns des36 scénarios. 226 tests logiciels réussis ; build, hygiène et 25 modules Functions validés. Les tests de calendrier distinguent dates absentes, jours sans trade et périodes après arrêt. Les 476 identifiants HTML précédents sont préservés parmi 493 uniques. Trois parties privées et le manifeste ont été écrits puis intégralement relus.

Cinq configurations nouvelles, dont quatre nouvelles politiques de risque. Registre89 entrées, catalogue croisé106 clés ; zéro confirmation indépendante. Critère fixé : 4 000 USD chacun des trois mois, aux coûts normaux et doublés, sans rupture du compte et avec une baisse réalisée maximale ≤ 1 000 USD. Aucun barème ne passe. Aucun réglage changé après lecture des résultats.

Prochaine hypothèse à examiner : améliorer et valider la capacité du score à distinguer les signaux, sur un échantillon nouveau, avant de lui associer de fortes tailles. La référence reste 100 USD ; le calcul du risque variable et les résultats négatifs sont conservés pour la recherche.
