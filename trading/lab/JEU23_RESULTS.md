# Jeu 23 — admission et risque autorisé

Seize configurations nouvelles, toutes non validées. Développement : janvier–avril 2026. Aucune sélection et aucune performance de mai–août calculée. Les dates de développement étaient déjà consultées ou corrélées : aucune confirmation indépendante.

## Résultats conservés

| Contrat | Plafond / trade | Trades | Net normal | Net coûts ×2 | Drawdown $ normal | Jours + / − / sans trade |
|---|---:|---:|---:|---:|---:|---|
| MNQ | 50 $ | 10 | +180.00 $ | -19.00 $ | 73.00 $ | 6 / 4 / 71 |
| MNQ | 75 $ | 19 | +193.50 $ | +156.00 $ | 219.00 $ | 10 / 9 / 62 |
| MNQ | 100 $ | 29 | +672.00 $ | +423.50 $ | 231.50 $ | 16 / 13 / 52 |
| MNQ | 150 $ | 36 | +887.50 $ | +714.00 $ | 369.00 $ | 20 / 16 / 45 |
| MES | 50 $ | 15 | +92.50 $ | +0.00 $ | 103.75 $ | 8 / 7 / 66 |
| MES | 75 $ | 25 | -86.25 $ | -207.50 $ | 266.25 $ | 11 / 14 / 56 |
| MES | 100 $ | 27 | -68.75 $ | -276.25 $ | 333.75 $ | 12 / 14 / 55 |
| MES | 150 $ | 28 | -206.25 $ | -277.50 $ | 471.25 $ | 12 / 15 / 54 |
| MYM | 50 $ | 33 | -288.00 $ | -293.00 $ | 367.00 $ | 11 / 22 / 49 |
| MYM | 75 $ | 37 | -234.00 $ | -304.00 $ | 313.00 $ | 13 / 24 / 45 |
| MYM | 100 $ | 37 | -288.50 $ | -304.00 $ | 367.50 $ | 13 / 24 / 45 |
| MYM | 150 $ | 37 | -288.50 $ | -358.50 $ | 367.50 $ | 13 / 24 / 45 |
| MGC | 50 $ | 5 | +32.50 $ | +0.00 $ | 46.00 $ | 2 / 3 / 75 |
| MGC | 75 $ | 17 | -304.50 $ | -278.00 $ | 471.00 $ | 5 / 12 / 63 |
| MGC | 100 $ | 27 | -171.50 $ | -364.00 $ | 457.00 $ | 10 / 17 / 53 |
| MGC | 150 $ | 32 | -370.00 $ | -354.00 $ | 772.50 $ | 11 / 20 / 49 |

Les coûts doublés peuvent modifier les entrées admissibles ; ce n’est pas une simple soustraction après les mêmes trades. Les marchés et profils sont des alternatives, pas un portefeuille à additionner. Un jour sans trade n’est pas un jour de gain.

## Interprétation

Le plafond MNQ de 150 USD donne le plus grand total normal de cette grille : +887,50 USD sur 36 trades, avec +714 USD aux coûts doublés. Les deux fenêtres normales sont positives (+592 puis +295,50 USD), mais 36 trades restent inférieurs aux 40 exigés et une séance de mars manque. Le drawdown réalisé est 369 USD ; 20 jours positifs, 16 négatifs et 45 sans trade. Ce résultat ne prouve ni rentabilité future ni gains journaliers réguliers.

Relever le plafond n’améliore pas tous les marchés : à 150 USD, MES −206,25 USD, MYM −288,50 USD et MGC −370 USD. La couverture empêche également les évaluations de compte MNQ/MES/MGC sur toutes les fenêtres. MYM est entièrement couvert mais reste négatif. Aucun critère n’a été abaissé.

## Effet de l’admission seule à 50 USD

| Contrat | Témoin Jeu 22 | Jeu 23 | Trades ajoutés | Retirés | Différence nette |
|---|---:|---:|---:|---:|---:|
| MNQ | +145.50 $ | +180.00 $ | 1 | 0 | +34.50 $ |
| MES | +138.75 $ | +92.50 $ | 1 | 0 | -46.25 $ |
| MYM | -173.00 $ | -288.00 $ | 3 | 0 | -115.00 $ |
| MGC | -51.00 $ | +32.50 $ | 3 | 0 | +83.50 $ |

Chaque comparaison réconcilie les trades inchangés, ajoutés et retirés, y compris si les positions nouvelles empêchent d’anciens trades. Les témoins Jeu 22 proviennent des sorties privées archivées et vérifiées ; leurs performances ne sont pas resimulées. Les profils 75/100/150 sont aussi comparés au nouveau témoin 50 USD dans le rapport JSON.

## Vérification et reproductibilité

- Gel avant performances : `75909f9fc39b9d4b58e6628695ca0a5b2f4fa2388c78782481879cedb37b59f5` ; 59 dépendances.
- Sélection nulle gelée : `baa404fdf22b45dce510c6a2a9269c81080e609b06e91567e1900a84cbed6e58`.
- Audit réussi : 37 362 préfixes de signaux, 479 comparaisons du premier signal, 1 280 préfixes de compte, 128 rapprochements avec le témoin archivé, 96 avec le profil 50 USD. Les 1 764 trades audités incluent les répétitions de fenêtres et scénarios ; ce ne sont pas 1 764 observations indépendantes.
- Vérification logicielle : 166 tests réussis, 25 fonctions Cloudflare validées, compilation et contrôle d’hygiène réussis. Les 363 anciens identifiants HTML sont conservés ; 376 identifiants uniques au total. Aucun test dans le navigateur. Ces contrôles ne démontrent pas la rentabilité.
- Archivage privé : trois fichiers, cinq parties et manifeste vérifiés après relecture, avec tailles et SHA-256. Les sources antérieures sont référencées sans duplication.
- Sources inchangées ; aucune bougie inventée et aucune journée incomplète déclarée complète.
- Un microcontrat, plafonds frais compris 50/75/100/150 USD ; limites quotidiennes internes 100/150/200/300 USD ; réserve du seuil 100 USD. Le stop structurel est conservé. Un gap peut dépasser le risque prévu.
- Le registre conserve 33 configurations des Jeux 19–23, zéro confirmation indépendante.
- Les prix et transactions individuels sont archivés en privé. Publication limitée au code, aux protocoles et statistiques agrégées.
- Paper, Shadow, broker et flux réel restent désactivés.

## Sources de la politique de risque

Vérifiées le 9 septembre 2026 : [LucidFlex évaluation](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account), [LucidFlex drawdown](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown), [CME : stop logique et dimensionnement](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size). Les plafonds testés sont une expérience autorisée par Diego, pas des niveaux optimaux établis.
