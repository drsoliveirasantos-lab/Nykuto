# Jeu42 — Le volume du retour ne suffit pas à améliorer le portefeuille

Campagne exécutée une seule fois après le gel publié `39904d4a5f16d2ce71880c6d127766bca649a9aa`. **Variante non retenue ; référence conservée.** Cinq des seize comparaisons mois/coût échouent. Aucun nouveau seuil, deuxième campagne ou activation.

## Modification réellement testée

MES uniquement : veto lorsque l'activité relative moyenne des bougies strictement opposées entre cassure et confirmation est au moins celle de la cassure. Volume normalisé à la même heure sur cinq séances passées ; comparaison des ratios arrondis au millionième. Dojis et confirmation exclus du retour. Sans phase distincte ou historique suffisant, maintien de la référence avec motif explicite. La bougie de confirmation et les distances d'entrée sont seulement diagnostiques.

Même risque maximal100USD coûts inclus, budget200USD/jour, stop et cible2R, ordre de priorité, quotas et autres profils. Compte50K funded supposé déjà qualifié, neuf chaque mois. Aucun modèle entraîné ou interrogé. Cette formalisation inspirée des transcriptions SMB est une hypothèse Nykuto ; les vidéos ne prouvent pas son efficacité sur MES.

## Résultats mensuels

Montants nets en USD, pas des euros retirés. Janvier–août2026 sont déjà vus. Couverture164/166 ;25février et6mars exclus conjointement, nulls et barrés dans le calendrier. Février/mars restent partiels ; leur résultat complet est inconnu.

| Mois | Coûts | Référence | Variante | Trades | G/P | Moyenne/trade | Drawdown référence → variante |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Janvier | Normaux | 511,00 $ | 330,75 $ | 16 | 7/9 | 20,67 $ | 227,00 $ → 227,00 $ |
| Janvier | Doublés | 48,00 $ | −136,00 $ | 15 | 5/10 | −9,07 $ | 336,00 $ → 336,00 $ |
| Février · partiel | Normaux | 663,25 $ | 663,25 $ | 10 | 7/3 | 66,33 $ | 88,50 $ → 88,50 $ |
| Février · partiel | Doublés | 616,75 $ | 616,75 $ | 10 | 7/3 | 61,68 $ | 93,00 $ → 93,00 $ |
| Mars · partiel | Normaux | −297,50 $ | −297,50 $ | 11 | 3/8 | −27,05 $ | 330,00 $ → 330,00 $ |
| Mars · partiel | Doublés | −250,50 $ | −250,50 $ | 10 | 3/7 | −25,05 $ | 356,00 $ → 356,00 $ |
| Avril | Normaux | 323,75 $ | 477,50 $ | 14 | 7/7 | 34,11 $ | 263,00 $ → 263,00 $ |
| Avril | Doublés | 216,25 $ | 280,00 $ | 13 | 6/7 | 21,54 $ | 234,50 $ → 234,50 $ |
| Mai | Normaux | −256,50 $ | −174,00 $ | 19 | 6/13 | −9,16 $ | 730,25 $ → 730,25 $ |
| Mai | Doublés | −197,50 $ | −105,00 $ | 17 | 6/11 | −6,18 $ | 689,50 $ → 689,50 $ |
| Juin | Normaux | 1 048,75 $ | 918,75 $ | 15 | 10/5 | 61,25 $ | 172,50 $ → 172,50 $ |
| Juin | Doublés | 785,50 $ | 785,50 $ | 13 | 9/4 | 60,42 $ | 145,00 $ → 145,00 $ |
| Juillet | Normaux | 176,00 $ | 41,00 $ | 19 | 7/12 | 2,16 $ | 312,50 $ → 422,50 $ |
| Juillet | Doublés | 164,00 $ | 169,00 $ | 19 | 8/11 | 8,89 $ | 330,50 $ → 261,50 $ |
| Août | Normaux | −245,50 $ | −370,50 $ | 10 | 2/8 | −37,05 $ | 442,00 $ → 442,00 $ |
| Août | Doublés | −228,50 $ | −228,50 $ | 8 | 2/6 | −28,56 $ | 359,50 $ → 359,50 $ |

Total normal1923,25→1589,25USD ; moyenne observée240,41→198,66USD/mois. Total doublé1154→1131,25USD ; moyenne144,25→141,41USD. Normal122→114trades,53/69→49/65gagnants/perdants. Doublé110→105trades,48/62→46/59. Le pire drawdown mensuel reste730,25normal/689,50doublé, mais juillet normal se dégrade312,50→422,50USD. Ce sont des baisses réalisées mensuelles, pas le flottant intratrade ou huit mois continus.

Aucun mois à4000USD et aucun retrait personnel1000EUR simulé. Tous les montants retirés et reçus sont nuls. La moyenne divise la somme observée par huit ; aucune extrapolation des journées manquantes.

## Ce que le filtre voit et ne voit pas

Sur68signaux MES distincts,30ont une phase exploitable :15retours contractés et15non contractés, donc15veto.33n'ont pas de bougie opposée distincte entre cassure et confirmation ;5manquent de volume relatif utilisable. Ces38cas gardent la référence, sans devenir des confirmations favorables. Les272enregistrements répétés dans les32relectures ont été rapprochés des bougies clôturées et des contextes historiques ; le veto est identique aux deux coûts.

## Gagnants supprimés, pertes évitées, nouvelles admissions

Normal :10trades retirés,4gagnants/6perdants, net retiré+150USD ;2ajouts, tous perdants,−184USD. Écart−334USD. Doublé :8trades retirés,2gagnants/6perdants, net retiré−191,75USD ;3ajouts tous perdants,−214,50USD. Écart−22,75USD. Aucun trade commun ne change d'entrée, taille, stop, sortie ou résultat.

Les retraits directs MES sont9trades en normal, dont3gagnants/6perdants, et7en doublé, dont1gagnant/6perdants. Un gagnant MNQ disparaît en plus par effet du portefeuille. Les autres signaux veto n'auraient pas tous été exécutés :15signaux bloqués ne signifient pas15pertes évitées.

Le30janvier normal, le refus d'une perte MES de51,25USD libère un MNQ perdant de89USD ; celui-ci consomme le quota qui aurait permis un MNQ gagnant de142,50USD. L'écart de la journée est donc−180,25USD. Même mécanisme en doublé, avec une perte MNQ supplémentaire le20janvier. Les règles MNQ sont inchangées ; leurs admissions changent indirectement.

| Mois | Coûts | Gagnants retirés | Perdants retirés | Ajouts G/P | Écart net |
| --- | --- | ---: | ---: | ---: | ---: |
| Janvier | Normaux | 1 | 1 | 0/1 | −180,25 $ |
| Janvier | Doublés | 1 | 2 | 0/2 | −184,00 $ |
| Février · partiel | Normaux | 0 | 0 | 0/0 | 0,00 $ |
| Février · partiel | Doublés | 0 | 0 | 0/0 | 0,00 $ |
| Mars · partiel | Normaux | 0 | 0 | 0/0 | 0,00 $ |
| Mars · partiel | Doublés | 0 | 0 | 0/0 | 0,00 $ |
| Avril | Normaux | 0 | 2 | 0/0 | 153,75 $ |
| Avril | Doublés | 0 | 1 | 0/0 | 63,75 $ |
| Mai | Normaux | 0 | 1 | 0/0 | 82,50 $ |
| Mai | Doublés | 0 | 1 | 0/0 | 92,50 $ |
| Juin | Normaux | 1 | 0 | 0/0 | −130,00 $ |
| Juin | Doublés | 0 | 0 | 0/0 | 0,00 $ |
| Juillet | Normaux | 1 | 2 | 0/1 | −135,00 $ |
| Juillet | Doublés | 1 | 2 | 0/1 | 5,00 $ |
| Août | Normaux | 1 | 0 | 0/0 | −125,00 $ |
| Août | Doublés | 0 | 0 | 0/0 | 0,00 $ |

## Contributions par marché dans le portefeuille

Normal : MNQ1464→1232,50USD, MES41,25→−61,25USD, MGC418→418USD. Doublé : MNQ897→603USD, MES35→306,25USD, MGC222→222USD. MYM reste exclu. La meilleure contribution MES doublée ne compense pas la dégradation indirecte MNQ ; ces chiffres ne sont pas des backtests autonomes par marché.

| Mois | Coûts | Marché | Référence | Variante | Trades | G/P | Moyenne/trade |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Janvier | Normaux | MNQ | 435,00 $ | 203,50 $ | 7 | 3/4 | 29,07 $ |
| Janvier | Normaux | MES | 122,50 $ | 173,75 $ | 5 | 3/2 | 34,75 $ |
| Janvier | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Janvier | Normaux | MGC | −46,50 $ | −46,50 $ | 4 | 1/3 | −11,62 $ |
| Janvier | Doublés | MNQ | 344,50 $ | 50,50 $ | 8 | 3/5 | 6,31 $ |
| Janvier | Doublés | MES | −52,50 $ | 57,50 $ | 4 | 2/2 | 14,38 $ |
| Janvier | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Janvier | Doublés | MGC | −244,00 $ | −244,00 $ | 3 | 0/3 | −81,33 $ |
| Février · partiel | Normaux | MNQ | 488,50 $ | 488,50 $ | 5 | 4/1 | 97,70 $ |
| Février · partiel | Normaux | MES | 163,75 $ | 163,75 $ | 3 | 2/1 | 54,58 $ |
| Février · partiel | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Février · partiel | Normaux | MGC | 11,00 $ | 11,00 $ | 2 | 1/1 | 5,50 $ |
| Février · partiel | Doublés | MNQ | 471,00 $ | 471,00 $ | 5 | 4/1 | 94,20 $ |
| Février · partiel | Doublés | MES | 143,75 $ | 143,75 $ | 3 | 2/1 | 47,92 $ |
| Février · partiel | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Février · partiel | Doublés | MGC | 2,00 $ | 2,00 $ | 2 | 1/1 | 1,00 $ |
| Mars · partiel | Normaux | MNQ | −128,50 $ | −128,50 $ | 6 | 2/4 | −21,42 $ |
| Mars · partiel | Normaux | MES | −72,50 $ | −72,50 $ | 4 | 1/3 | −18,12 $ |
| Mars · partiel | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Mars · partiel | Normaux | MGC | −96,50 $ | −96,50 $ | 1 | 0/1 | −96,50 $ |
| Mars · partiel | Doublés | MNQ | −158,00 $ | −158,00 $ | 6 | 2/4 | −26,33 $ |
| Mars · partiel | Doublés | MES | −92,50 $ | −92,50 $ | 4 | 1/3 | −23,12 $ |
| Mars · partiel | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Mars · partiel | Doublés | MGC | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Avril | Normaux | MNQ | 421,50 $ | 421,50 $ | 7 | 4/3 | 60,21 $ |
| Avril | Normaux | MES | −68,75 $ | 85,00 $ | 4 | 2/2 | 21,25 $ |
| Avril | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Avril | Normaux | MGC | −29,00 $ | −29,00 $ | 3 | 1/2 | −9,67 $ |
| Avril | Doublés | MNQ | 205,00 $ | 205,00 $ | 6 | 3/3 | 34,17 $ |
| Avril | Doublés | MES | 6,25 $ | 70,00 $ | 4 | 2/2 | 17,50 $ |
| Avril | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Avril | Doublés | MGC | 5,00 $ | 5,00 $ | 3 | 1/2 | 1,67 $ |
| Mai | Normaux | MNQ | −75,00 $ | −75,00 $ | 7 | 2/5 | −10,71 $ |
| Mai | Normaux | MES | −245,00 $ | −162,50 $ | 7 | 2/5 | −23,21 $ |
| Mai | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Mai | Normaux | MGC | 63,50 $ | 63,50 $ | 5 | 2/3 | 12,70 $ |
| Mai | Doublés | MNQ | −44,50 $ | −44,50 $ | 6 | 2/4 | −7,42 $ |
| Mai | Doublés | MES | −185,00 $ | −92,50 $ | 6 | 2/4 | −15,42 $ |
| Mai | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Mai | Doublés | MGC | 32,00 $ | 32,00 $ | 5 | 2/3 | 6,40 $ |
| Juin | Normaux | MNQ | 700,00 $ | 700,00 $ | 7 | 6/1 | 100,00 $ |
| Juin | Normaux | MES | 83,75 $ | −46,25 $ | 6 | 2/4 | −7,71 $ |
| Juin | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Juin | Normaux | MGC | 265,00 $ | 265,00 $ | 2 | 2/0 | 132,50 $ |
| Juin | Doublés | MNQ | 559,00 $ | 559,00 $ | 6 | 5/1 | 93,17 $ |
| Juin | Doublés | MES | 47,50 $ | 47,50 $ | 4 | 2/2 | 11,88 $ |
| Juin | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Juin | Doublés | MGC | 179,00 $ | 179,00 $ | 3 | 2/1 | 59,67 $ |
| Juillet | Normaux | MNQ | −228,00 $ | −228,00 $ | 8 | 2/6 | −28,50 $ |
| Juillet | Normaux | MES | 315,00 $ | 180,00 $ | 3 | 2/1 | 60,00 $ |
| Juillet | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Juillet | Normaux | MGC | 89,00 $ | 89,00 $ | 8 | 3/5 | 11,13 $ |
| Juillet | Doublés | MNQ | −259,50 $ | −259,50 $ | 8 | 2/6 | −32,44 $ |
| Juillet | Doublés | MES | 332,50 $ | 337,50 $ | 4 | 3/1 | 84,38 $ |
| Juillet | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Juillet | Doublés | MGC | 91,00 $ | 91,00 $ | 7 | 3/4 | 13,00 $ |
| Août | Normaux | MNQ | −149,50 $ | −149,50 $ | 5 | 1/4 | −29,90 $ |
| Août | Normaux | MES | −257,50 $ | −382,50 $ | 4 | 0/4 | −95,62 $ |
| Août | Normaux | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Août | Normaux | MGC | 161,50 $ | 161,50 $ | 1 | 1/0 | 161,50 $ |
| Août | Doublés | MNQ | −220,50 $ | −220,50 $ | 5 | 1/4 | −44,10 $ |
| Août | Doublés | MES | −165,00 $ | −165,00 $ | 2 | 0/2 | −82,50 $ |
| Août | Doublés | MYM | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| Août | Doublés | MGC | 157,00 $ | 157,00 $ | 1 | 1/0 | 157,00 $ |

## Semaines observées

Les journées individuelles restent consultables dans le calendrier du Jeu42, avec détail par marché, cumul et risque. Une semaine partielle n'est pas extrapolée.

| Mois | Coûts | Dates | Trades | Net | Cumul mensuel |
| --- | --- | --- | ---: | ---: | ---: |
| Janvier | Normaux | 2026-01-02–2026-01-02 | 1 | 110,00 $ | 110,00 $ |
| Janvier | Normaux | 2026-01-05–2026-01-09 | 5 | −227,00 $ | −117,00 $ |
| Janvier | Normaux | 2026-01-12–2026-01-16 | 4 | 204,25 $ | 87,25 $ |
| Janvier | Normaux | 2026-01-20–2026-01-23 | 2 | 344,00 $ | 431,25 $ |
| Janvier | Normaux | 2026-01-26–2026-01-30 | 4 | −100,50 $ | 330,75 $ |
| Janvier | Doublés | 2026-01-02–2026-01-02 | 1 | 105,00 $ | 105,00 $ |
| Janvier | Doublés | 2026-01-05–2026-01-09 | 4 | −336,00 $ | −231,00 $ |
| Janvier | Doublés | 2026-01-12–2026-01-16 | 4 | 129,00 $ | −102,00 $ |
| Janvier | Doublés | 2026-01-20–2026-01-23 | 2 | 91,50 $ | −10,50 $ |
| Janvier | Doublés | 2026-01-26–2026-01-30 | 4 | −125,50 $ | −136,00 $ |
| Février · partiel | Normaux | 2026-02-02–2026-02-06 | 3 | 407,00 $ | 407,00 $ |
| Février · partiel | Normaux | 2026-02-09–2026-02-13 | 4 | 300,00 $ | 707,00 $ |
| Février · partiel | Normaux | 2026-02-17–2026-02-20 | 1 | −63,75 $ | 643,25 $ |
| Février · partiel | Normaux | 2026-02-23–2026-02-27 · partielle | 2 | 20,00 $ | 663,25 $ |
| Février · partiel | Doublés | 2026-02-02–2026-02-06 | 3 | 390,00 $ | 390,00 $ |
| Février · partiel | Doublés | 2026-02-09–2026-02-13 | 4 | 283,50 $ | 673,50 $ |
| Février · partiel | Doublés | 2026-02-17–2026-02-20 | 1 | −68,75 $ | 604,75 $ |
| Février · partiel | Doublés | 2026-02-23–2026-02-27 · partielle | 2 | 12,00 $ | 616,75 $ |
| Mars · partiel | Normaux | 2026-03-02–2026-03-06 · partielle | 1 | −98,00 $ | −98,00 $ |
| Mars · partiel | Normaux | 2026-03-09–2026-03-13 | 4 | 46,50 $ | −51,50 $ |
| Mars · partiel | Normaux | 2026-03-16–2026-03-20 | 5 | −151,00 $ | −202,50 $ |
| Mars · partiel | Normaux | 2026-03-23–2026-03-27 | 1 | −95,00 $ | −297,50 $ |
| Mars · partiel | Normaux | 2026-03-30–2026-03-31 | 0 | 0,00 $ | −297,50 $ |
| Mars · partiel | Doublés | 2026-03-02–2026-03-06 · partielle | 1 | −96,00 $ | −96,00 $ |
| Mars · partiel | Doublés | 2026-03-09–2026-03-13 | 3 | 129,50 $ | 33,50 $ |
| Mars · partiel | Doublés | 2026-03-16–2026-03-20 | 5 | −185,50 $ | −152,00 $ |
| Mars · partiel | Doublés | 2026-03-23–2026-03-27 | 1 | −98,50 $ | −250,50 $ |
| Mars · partiel | Doublés | 2026-03-30–2026-03-31 | 0 | 0,00 $ | −250,50 $ |
| Avril | Normaux | 2026-04-01–2026-04-02 | 1 | 105,00 $ | 105,00 $ |
| Avril | Normaux | 2026-04-06–2026-04-10 | 4 | 160,00 $ | 265,00 $ |
| Avril | Normaux | 2026-04-13–2026-04-17 | 3 | 2,50 $ | 267,50 $ |
| Avril | Normaux | 2026-04-20–2026-04-24 | 3 | 473,00 $ | 740,50 $ |
| Avril | Normaux | 2026-04-27–2026-04-30 | 3 | −263,00 $ | 477,50 $ |
| Avril | Doublés | 2026-04-01–2026-04-02 | 1 | 95,00 $ | 95,00 $ |
| Avril | Doublés | 2026-04-06–2026-04-10 | 4 | 154,50 $ | 249,50 $ |
| Avril | Doublés | 2026-04-13–2026-04-17 | 3 | −8,00 $ | 241,50 $ |
| Avril | Doublés | 2026-04-20–2026-04-24 | 2 | 273,00 $ | 514,50 $ |
| Avril | Doublés | 2026-04-27–2026-04-30 | 3 | −234,50 $ | 280,00 $ |
| Mai | Normaux | 2026-05-01–2026-05-01 | 0 | 0,00 $ | 0,00 $ |
| Mai | Normaux | 2026-05-04–2026-05-08 | 5 | 248,25 $ | 248,25 $ |
| Mai | Normaux | 2026-05-11–2026-05-15 | 5 | 256,50 $ | 504,75 $ |
| Mai | Normaux | 2026-05-18–2026-05-22 | 5 | −354,25 $ | 150,50 $ |
| Mai | Normaux | 2026-05-26–2026-05-29 | 4 | −324,50 $ | −174,00 $ |
| Mai | Doublés | 2026-05-01–2026-05-01 | 0 | 0,00 $ | 0,00 $ |
| Mai | Doublés | 2026-05-04–2026-05-08 | 4 | 326,00 $ | 326,00 $ |
| Mai | Doublés | 2026-05-11–2026-05-15 | 4 | 258,50 $ | 584,50 $ |
| Mai | Doublés | 2026-05-18–2026-05-22 | 5 | −387,25 $ | 197,25 $ |
| Mai | Doublés | 2026-05-26–2026-05-29 | 4 | −302,25 $ | −105,00 $ |
| Juin | Normaux | 2026-06-01–2026-06-05 | 5 | 217,00 $ | 217,00 $ |
| Juin | Normaux | 2026-06-08–2026-06-12 | 3 | −15,25 $ | 201,75 $ |
| Juin | Normaux | 2026-06-15–2026-06-18 | 2 | 13,50 $ | 215,25 $ |
| Juin | Normaux | 2026-06-22–2026-06-26 | 4 | 573,50 $ | 788,75 $ |
| Juin | Normaux | 2026-06-29–2026-06-30 | 1 | 130,00 $ | 918,75 $ |
| Juin | Doublés | 2026-06-01–2026-06-05 | 3 | 189,00 $ | 189,00 $ |
| Juin | Doublés | 2026-06-08–2026-06-12 | 3 | −5,00 $ | 184,00 $ |
| Juin | Doublés | 2026-06-15–2026-06-18 | 2 | 3,00 $ | 187,00 $ |
| Juin | Doublés | 2026-06-22–2026-06-26 | 4 | 478,50 $ | 665,50 $ |
| Juin | Doublés | 2026-06-29–2026-06-30 | 1 | 120,00 $ | 785,50 $ |
| Juillet | Normaux | 2026-07-01–2026-07-02 | 1 | 150,00 $ | 150,00 $ |
| Juillet | Normaux | 2026-07-06–2026-07-10 | 6 | −406,00 $ | −256,00 $ |
| Juillet | Normaux | 2026-07-13–2026-07-17 | 3 | 171,00 $ | −85,00 $ |
| Juillet | Normaux | 2026-07-20–2026-07-24 | 3 | −27,00 $ | −112,00 $ |
| Juillet | Normaux | 2026-07-27–2026-07-31 | 6 | 153,00 $ | 41,00 $ |
| Juillet | Doublés | 2026-07-01–2026-07-02 | 1 | 140,00 $ | 140,00 $ |
| Juillet | Doublés | 2026-07-06–2026-07-10 | 6 | −261,50 $ | −121,50 $ |
| Juillet | Doublés | 2026-07-13–2026-07-17 | 3 | 205,50 $ | 84,00 $ |
| Juillet | Doublés | 2026-07-20–2026-07-24 | 3 | −38,50 $ | 45,50 $ |
| Juillet | Doublés | 2026-07-27–2026-07-31 | 6 | 123,50 $ | 169,00 $ |
| Août | Normaux | 2026-08-03–2026-08-07 | 2 | −150,50 $ | −150,50 $ |
| Août | Normaux | 2026-08-10–2026-08-14 | 3 | 222,00 $ | 71,50 $ |
| Août | Normaux | 2026-08-17–2026-08-21 | 2 | −167,00 $ | −95,50 $ |
| Août | Normaux | 2026-08-24–2026-08-28 | 3 | −275,00 $ | −370,50 $ |
| Août | Normaux | 2026-08-31–2026-08-31 | 0 | 0,00 $ | −370,50 $ |
| Août | Doublés | 2026-08-03–2026-08-07 | 1 | −59,00 $ | −59,00 $ |
| Août | Doublés | 2026-08-10–2026-08-14 | 3 | 190,00 $ | 131,00 $ |
| Août | Doublés | 2026-08-17–2026-08-21 | 1 | −80,50 $ | 50,50 $ |
| Août | Doublés | 2026-08-24–2026-08-28 | 3 | −279,00 $ | −228,50 $ |
| Août | Doublés | 2026-08-31–2026-08-31 | 0 | 0,00 $ | −228,50 $ |

## Décision et conservation

Échec en janvier aux deux coûts, juin normal, juillet normal et août normal. Avril et mai progressent ; cela ne satisfait pas le critère fixé de non-dégradation de chaque cellule et amélioration stricte d'au moins une. Sélection nulle, zéro confirmation indépendante, risque et référence conservés. Aucune recherche de seuil pour sauver cette règle. Cette expérience ne démontre ni l'inutilité générale du volume, ni une saisonnalité défavorable d'août.

32relectures,16témoins40 JSON entiers identiques,656préfixes compte/filtre/contexte chacun. Audit arithmétique451trades,656journées de compte,156semaines.79dépendances du gel intactes. Aucune nouvelle performance calculée pendant les audits.

Rapport703710octets SHA `efc3a4338458ccac4d7a1a32e3b317fa8646bea1b6e4b49515eb581599344bdc` ; runs privés1118242octets SHA `dd197ce7c07b73a154b98c403ead94979af281e54a0fb01acb873ea4596d5476`.

Quatre fichiers archivés sans écrasement sous `jeu42/mes-pullback-volume-v1/`, six parties relues en33morceaux et recomposées exactement. Manifeste SHA `6715268e5d2817526ddc71b800c3291a687e8a71e1f2997bff3a156fd3fc0903`.

Une configuration exécutée ajoutée : registre95/catalogue112 ; toutes les94/111anciennes entrées conservées. Calendrier Jeux33–42 :72sélections et266vues mois/coût. Modèles/RSI/news, collecteJeu08/3décembre, sources et anciens protocoles/gels/résultats intacts. Aucun achat, ordre, broker, Paper/Shadow, merge main ou surveillance permanente.

[Calendrier](./#historyCalendarGame) · [Agrégats](./jeu42-report.json) · [Audit](./jeu42-execution-audit.json) · [Protocole figé](./JEU42_PROTOCOL.md) · [Recherche et vidéos](./JEU42_RESEARCH.md) · [Leçons](./RESEARCH_LESSONS.md).
