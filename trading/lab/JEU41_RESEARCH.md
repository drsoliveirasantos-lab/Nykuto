# Audit des entrées et justification du Jeu41

Le précédent résultat n’est pas500euros de retrait : les comptes du Lab sont exprimés en dollars et n’ont obtenu aucun versement personnel. Le diagnostic normal janvier–août donne240,41USD de moyenne mensuelle observée, avec deux mois partiels.

## Ce qui a été vérifié

L’audit des sorties existantes n’a pas trouvé de nouvelle erreur arithmétique sur232trades. Il vérifie le prochain prix d’ouverture, le multiplicateur, la taille, les coûts, le net, la perte prévue, le stop structurel, la cible2R et la trésorerie. Cela ne certifie pas toute hypothèse de marché ou l’absence de tout bug possible.

| Marché · coûts normaux | Trades | Gagnants / perdants | Brut USD | Coûts USD | Net USD | Moyenne nette USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 52 | 25 / 27 | 1716 | 252 | 1464 | 28,15 |
| MES | 44 | 17 / 27 | 576,25 | 535 | 41,25 | 0,94 |
| MGC | 26 | 11 / 15 | 553 | 135 | 418 | 16,08 |

MES est prioritaire pour ce test. Ses coûts/risque de prix pondérés atteignent18,21%, contre6,46% surMNQ et6,97% surMGC. Il utilise2,43micros en moyenne, contre1,38/1,15. Le nombre de contrats découle des stops et du budget : davantage de contrats n’ajoute pas un avantage de trading.

Sur69pertes normales,27 sortent au stop dans la M5 d’entrée (MNQ14, MES9, MGC4). La donnée M5 ne donne pas une durée intrabougie exacte. MES après11h montre−437,50USD sur24trades, contre+478,75USD sur20trades avant11h ; les ventes montrent−338,75USD sur23trades. Ces sous-groupes sont descriptifs, déjà vus, non indépendants. Aucun filtre d’heure ou de sens n’est ajouté ici.

La référence fixed100 n’exige pas tous les feux de tendance : cassure/retest et filtres MESRSI/MGChoraires constituent les admissions ; le score de confiance est descriptif. `trendClosedAt` du signal désigne la clôture du range, pas une tendance H1 calculée. Un score élevé n’est pas une probabilité calibrée. Ce n’est pas la méthode H120/50 des associés reproduite à l’identique.

## Pourquoi cette seule correction

La garde actuelle autorise un rapport net gain/perte aussi bas que1 alors que la cible de prix est2R. Tester une marge nette minimale1,5 surMES vise les entrées dont les frais occupent trop de place. Ce seuil est fixé avant performance et n’est pas choisi dans une grille. On conserve le stop et le risque ; aucune compensation en augmentant les sommes.

L’historique a déjà testé la garde nette≥1 aux Jeux16/17, puis l’a conservée. Les anciennes cibles1,5R sont des cibles brutes, pas cette garde netteMES. Attendre une M5 MES (36), alignement M5/H1 (32), filtre M5EMA/VWAP (F1), cinq confluences (24) et risque gradué (25/37) n’ont pas établi une solution à conserver. Le veto41 est distinct, mais sa formulation après diagnostic reste du développement sur données déjà consultées.

Le [CME explique que le dimensionnement dépend du stop et du budget de risque](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size). Nous conservons le budget historique, sans appliquer ses exemples génériques de pourcentage au nominal du compte prop. La [NFA rappelle les limites des performances hypothétiques](https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9), notamment l’effet du recul et du glissement. Ces sources ne prouvent pas que notre nouvelle marge nette améliore une stratégie.

Les conséquences seront testées sur le portefeuille entier. Retirer un trade MES peut libérer une entrée ailleurs ; soustraire simplement les anciens perdants produirait une estimation incorrecte. Aucun résultat41 n’a été calculé à la rédaction de ce document.
