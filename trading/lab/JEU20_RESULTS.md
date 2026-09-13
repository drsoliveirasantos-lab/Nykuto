# Jeu 20 — MYM positif en développement, rejeté sur la réserve

**La candidate est écartée.** La préparation des données est améliorée, mais
les résultats positifs de janvier–avril ne se maintiennent pas sur mai–août.
Le bot reste non confirmé et désactivé.

| Période | Séances | Trades normaux | Net normal | Trades stress | Net stress |
| --- | ---: | ---: | ---: | ---: | ---: |
| Développement janvier–avril | 82/82 | 75 | +364,50 $ | 44 | +238 $ |
| Réserve mai–août | 84/84 | 91 | −424,50 $ | 57 | −340,50 $ |

| Fenêtre | Net normal | Net stress |
| --- | ---: | ---: |
| Janvier–février | +200 $ | +203,50 $ |
| Mars–avril | +164,50 $ | +34,50 $ |
| Mai–juin | +134 $ | +139 $ |
| Juillet–août | −558,50 $ | −479,50 $ |

Développement : huit critères sur huit satisfaits, PF en R 1,294360, drawdown
5,192616 R. Réserve : quatre critères sur huit satisfaits ; échec sur positivité
de chaque fenêtre, PF, drawdown et coûts doublés. Le PF en R tombe à 0,745497,
le drawdown atteint 21,663538 R / 688 $. Sur les 84 journées réservées : 20
positives, 29 négatives, 35 sans trade ; pire journée −90 $. Le taux de réussite
des trades passe de 48 % en développement à 37,36 % sur la réserve.

Les coûts doublés changent le nombre de trades, car certaines entrées ne
respectent plus le risque ou la marge nette. Il ne s'agit donc pas de retirer
simplement des frais supplémentaires de la même liste de transactions.
Les coûts sont hypothétiques, hors achat/reset de compte, plateforme et fiscalité.

Chaque fenêtre complète fait aussi l'objet d'une évaluation simulée distincte
de 25 000 $, sans reset pendant la fenêtre. Aucun objectif atteint ni seuil de
perte du compte franchi, aux deux coûts. Cela ne suffit pas à rendre la méthode
rentable. Les quatre marchés du Jeu 19 ne forment pas un portefeuille simulé.

## Correction vérifiée

Les neuf séances manquantes de développement MYM au Jeu 19 étaient indisponibles
pour préparation, alors que leurs cours existaient. Les 220 bougies nécessaires
sont désormais vérifiées séparément sur chaque horizon. Les bougies natives
30 min concordent en OHLC et volume avec les bougies 5 min présentes sur 3 202
intervalles : 916 MYMH6, 1 195 MYMM6 et 1 091 MYMU6, aucune divergence. Une
lacune 5 min réinitialise la préparation 5 min ; une lacune ou divergence 30 min
réinitialise la préparation 30 min. Aucune bougie manquante n'est fabriquée.
Les 166 séances de janvier–août sont couvertes. Les échéances ne sont pas raccordées.

Les EMA/ADX/ATR, stop, cible, quantité, limites de risque, frais, dates et critères
restent ceux annoncés. Le contexte d'indicateurs et les trades peuvent changer
avec la préparation plus complète ; les résultats du Jeu 19 restent conservés.

## Ordre des décisions

1. Huit configurations comparées au Jeu 19 ; réserve non ouverte.
2. Une hypothèse de préparation pour MYM Pullback gelée dans le commit local
   `b74f314` avant les résultats du Jeu 20.
3. Développement positif ; sélection et rapport de développement gelés dans
   le commit local `8771b65` avant toute performance de réserve.
4. Mai–août évalué une fois ; candidate écartée, aucun second choix ni retouche
   après cet échec.

Empreinte de sélection :
`5af8cf71162a66e4cf7490de53ffbcc09056f94e71706faae88fe2c66d10c96a`.
La sélection de développement reste lisible dans `jeu20-development.json`,
même après publication du résultat négatif final. Neuf configurations ont été
évaluées dans cette reprise, pas neuf validations indépendantes.

Audit de développement : 121 préfixes de signaux, 164 préfixes de comptes et
357 trades audités. Audit de réserve : 289 préfixes de signaux, 168 préfixes de
comptes et 444 trades audités. Ces comptes incluent des replays des mêmes
observations. Les contrôles de préfixe retirent les bougies futures des deux horizons.

La réserve MYM n'a pas servi à choisir la candidate, mais provient du même
fournisseur et d'événements corrélés à des marchés déjà examinés. Ce n'est pas
une confirmation prospective. Les nouvelles recherches doivent déclarer leurs
essais et disposer de nouvelles observations avant de conclure à leur fiabilité.
Les prix bruts et trades individuels restent privés. Aucun navigateur, flux live,
broker ni compte membre testé ; aucun ordre, Paper Bot ou Shadow activé.

Archivage privé vérifié : voir [les manifestes et empreintes](JEU19_20_ARCHIVE.md).
