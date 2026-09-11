# Jeu 17 — effet séparé du stop et du filtre de marge

9 septembre 2026. **Aucune combinaison confirmée ; aucun bot activé.**
Le stop pivot dégrade le résultat dans les deux comparaisons. Le filtre de marge
réduit certaines pertes sur le diagnostic agrégé, sans rendre la stratégie
robuste après coûts. Il n’améliore pas toutes les fenêtres.

Les quatre combinaisons ont été fixées dans le commit local `644d346` avant
le premier calcul du Jeu 17. Aucune modification des paramètres après résultat.
Le commit de gel local est distinct de la version publiée du site.

## Diagnostic sur les mêmes 330 séances

Du 9 avril 2025 au 4 septembre 2026, avec les interruptions et préparations
immuables du Jeu 14. Un MNQ, budgets internes inchangés. Les totaux ne décrivent
pas un compte continu ni un revenu attendu. Les coûts par aller-retour restent
hypothétiques : 3,50 $ puis 7 $, incluant frais/slippage supposés, hors achat,
reset, plateforme, payout et fiscalité. Ce jeu n’actualise pas les règles Lucid.

| Stop / filtre | Trades normal / stress | Avant coûts normal / stress | Coûts normal / stress | Net normal / stress |
| --- | ---: | ---: | ---: | ---: |
| ATR / sans marge | 63 / 57 | +234,50 / +221 $ | 220,50 / 399 $ | **+14 / −178 $** |
| ATR / avec marge | 63 / 52 | +234,50 / +226,50 $ | 220,50 / 364 $ | **+14 / −137,50 $** |
| Pivot / sans marge | 92 / 77 | +26 / +21,50 $ | 322 / 539 $ | **−296 / −517,50 $** |
| Pivot / avec marge | 91 / 71 | +39 / +42 $ | 318,50 / 497 $ | **−279,50 / −455 $** |

Les deux cellules déjà publiées au Jeu 16 reproduisent exactement leurs trades,
journées et statuts. Les 456 trades comparés comprennent diagnostic, fenêtres
et coûts : ce ne sont pas 456 observations indépendantes supplémentaires.

## Effets des changements

Différences entre simulations entièrement rejouées, pas retrait de trades
déjà terminés. Un refus modifie parfois les prochaines entrées et pauses.

| Changement | Écart net normal | Écart net stress |
| --- | ---: | ---: |
| Ajouter la marge au stop ATR | 0 $ | +40,50 $ |
| Ajouter la marge au stop pivot | +16,50 $ | +62,50 $ |
| Passer au pivot sans marge | −310 $ | −339,50 $ |
| Passer au pivot avec marge | −293,50 $ | −317,50 $ |

Le filtre de marge n’a aucun effet sur l’ATR aux coûts normaux. Au stress,
il refuse 9 signaux examinés à plat ; la séquence résultante compte 5 trades
de moins, 35 $ de coûts en moins et 5,50 $ de gain avant coûts en plus.
Pour le pivot, il refuse 1 signal normal et 10 au stress ; le replay compte
respectivement 1 et 6 trades de moins. Ces compteurs ne sont pas interchangeables.

Le changement de stop augmente l’activité mais diminue aussi le résultat avant
coûts (−208,50 $ sans marge, −195,50 $ avec marge, au coût normal). La perte
supplémentaire ne vient donc pas seulement des frais de trades plus nombreux.
Ces effets décrivent cet historique et ces règles ; ils ne prédisent pas leur
effet sur un marché futur.

## Risque et cinq évaluations distinctes

| Stop / filtre | Jours positifs / négatifs / sans trade, normal | Pire jour normal / stress | Drawdown réalisé $ normal / stress |
| --- | ---: | ---: | ---: |
| ATR / sans marge | 17 / 21 / 292 | −94,50 / −96 $ | 522,50 / 563,50 |
| ATR / avec marge | 17 / 21 / 292 | −94,50 / −96 $ | 522,50 / 563,50 |
| Pivot / sans marge | 28 / 37 / 265 | −88 / −92,50 $ | 593 / 630,50 |
| Pivot / avec marge | 28 / 37 / 265 | −88 / −92,50 $ | 593 / 574 |

La nouvelle cellule ATR avec marge garde un PF en R de 1,000575 au normal,
0,868105 au stress ; le pivot sans marge donne 0,831391 et 0,690605.
Les PF en dollars sont affichés séparément dans le Lab. Le drawdown en R
dépasse 8 dans les quatre cellules. Aucun objectif de journée verte n’est imposé.

| Fenêtre complète | ATR avec marge, net normal / stress | Pivot sans marge, net normal / stress |
| --- | ---: | ---: |
| Mai–juin 2025 | +30,50 / +90,50 $ | −86,50 / −79,50 $ |
| Juillet–août 2025 | −299,50 / −457 $ | −349 / −432,50 $ |
| Novembre–décembre 2025 | −87 / −34,50 $ | −19,50 / −23,50 $ |
| Janvier–février 2026 | +110,50 / +96,50 $ | +91 / +40 $ |
| Juillet–août 2026 | 0 / 0 $ | +19,50 / +5,50 $ |

Chaque compte démarre à 25 000 $, sans reset dans sa fenêtre. Les 40 replays
(4 combinaisons × 5 fenêtres × 2 coûts) ne perdent aucun compte, mais **aucun
n’atteint l’objectif**. Ils réutilisent les mêmes observations. Le filtre peut
dégrader une fenêtre : au stress, novembre–décembre ATR passe de −15 à −34,50 $.

Septembre–octobre 2025, mars–avril 2026 et mai–juin 2026 restent incomplets,
sans performance de fenêtre. Tous les critères sont conservés. Chaque cellule
échoue sur le nombre de trades par fenêtre, la positivité de chaque fenêtre,
le PF en R, le drawdown en R et le total positif avec coûts doublés. Seuls
le nombre total de trades et l’absence de breach satisfont les seuils.

## Audit et portée

20 dépendances figées ; 437 préfixes de signaux, 437 préfixes de pivots,
1 656 préfixes de comptes, 916 trades audités dont 531 pivots et 456
reproductions du Jeu 16. Les contrôles répétés ne gonflent pas l’échantillon.
Les six tests du nouveau moteur couvrent ratio net, Long/Short, coûts doublés,
référence exacte, risque, entrées après refus, futur et ambiguïtés.

L’historique était déjà examiné, récupéré après sa période. Les bougies 5 min
ne prouvent pas les fills tick par tick. Un gap peut dépasser un budget prévu.
Aucun rendu visuel navigateur, broker, compte membre ou ordre réel n’a été testé.
Le Lab garde les quatre combinaisons et les huit choix de menus, les critères
échoués et les anciens liens. L’intégrité du rapport est vérifiée avant affichage.

Reproduction :
`node scripts/run-trading-jeu17.mjs DOSSIER_JEU14 DOSSIER_JEU16 DOSSIER_PRIVE`.
Le runner vérifie les empreintes avant calcul et ne lance aucune optimisation.
La comparaison s’arrête à ce bilan. Aucun modèle n’est promu automatiquement.

Validation finale : 124 tests de trading réussis, build réussi, hygiène sans
anomalie, 25 Functions valides ; les 281 anciens identifiants de page sont
préservés parmi 305 au total. Les huit choix de menus et le rejet d’un rapport
altéré sont vérifiés avec un DOM simulé, sans rendu navigateur.

Archives privées écrites puis relues et comparées exactement :

- `jeu17/ablation-v1/report.json` : 129 812 octets, SHA256
  `5da687af11ec62e58aa70674aa24de4929dc013ff8073ff6ef29d7cc687697db`.
- `jeu17/ablation-v1/runs.json` : 850 907 octets, SHA256
  `0d8b44e9f66200195da17a9ab1062e974ccb9f71447c4288ebf91a9ceee784a1`.
- `jeu17/ablation-v1/manifest.json` : références de source et empreintes.

Les anciens jeux, prix sources, archives, main, autres sites, comptes membres
et tâches MNQ restent inchangés. Aucun feed, achat, Paper Bot, Shadow, broker
ou ordre ajouté ou activé.
