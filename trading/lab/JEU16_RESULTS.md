# Jeu 16 — stop structurel, 9 septembre 2026

**Variante non retenue comme amélioration. Aucun bot confirmé ou activé.**
Une comparaison a été exécutée aux coûts 3,50 $ et 7 $, avec les mêmes
signaux et budgets que la référence. Aucun paramètre n'a été modifié après
le calcul des performances.

Le protocole, le moteur et les tests ont été figés dans le commit local
`61f7314` avant l'exécution. Ce commit local n'est pas présenté comme la tête
distante publiée. SHA256 du protocole :
`67b9b05279c64120cbb68775b9d57efba68164d65962f06b57b218b530db4bb9`.
`jeu16-freeze.json` épingle 18 dépendances, y compris les moteurs antérieurs
réutilisés. Son SHA256 est
`38303369f53c2f801d353028464898506037d3c838683589d05a5e00e33a4cc2`.

## Diagnostic sur les mêmes 330 séances

Historique déjà examiné du 9 avril 2025 au 4 septembre 2026, avec les mêmes
préparations et interruptions de couverture. Un MNQ par position ; pas de
compte continu, pas de revenu prévu. Les fenêtres ci-dessous réutilisent ces
mêmes observations. Les coûts sont hypothétiques et incluent le forfait de
frais/slippage, sans frais d'achat, de reset, de plateforme ni fiscalité.

| Variante | Trades normal / stress | Avant coûts normal / stress | Coûts normal / stress | Net normal / stress |
| --- | ---: | ---: | ---: | ---: |
| Référence ATR 5 min | 63 / 57 | +234,50 / +221 $ | 220,50 / 399 $ | **+14 / −178 $** |
| Pivot confirmé + marge nette | 91 / 71 | +39 / +42 $ | 318,50 / 497 $ | **−279,50 / −455 $** |

La référence reproduit exactement les trades et jours du Jeu 15. Les coûts
doublés rejouent les admissions et les pauses : ce ne sont pas les mêmes
trades auxquels on soustrait seulement un montant supplémentaire.

| Variante | Net R normal / stress | PF en R normal / stress | PF en $ normal / stress | Drawdown réalisé $ normal / stress |
| --- | ---: | ---: | ---: | ---: |
| Référence ATR | +0,019641 / −5,645545 | 1,000575 / 0,836537 | 1,010798 / 0,858562 | 522,50 / 563,50 |
| Pivot + marge | −8,400282 / −11,901023 | 0,850207 / 0,742723 | 0,863258 / 0,729890 | 593 / 574 |

Les critères utilisent le PF et les totaux en R avant arrondi, comme au Jeu 15.
Le PF en dollars est affiché séparément : les risques initiaux variables ne
pondèrent pas les trades de la même façon. Le drawdown en R de la variante
atteint 17,255661 R, puis 16,252057 R au stress, au-dessus de la limite de 8 R.

## Journées et refus

| Variante / coûts | Jours positifs | Négatifs | Sans trade | Pire journée |
| --- | ---: | ---: | ---: | ---: |
| Référence / 3,50 $ | 17 | 21 | 292 | −94,50 $ |
| Référence / 7 $ | 17 | 18 | 295 | −96 $ |
| Pivot / 3,50 $ | 28 | 37 | 265 | −88 $ |
| Pivot / 7 $ | 21 | 30 | 279 | −92,50 $ |

La variante prend 1 trade sur 47 journées, 2 sur 10 et 3 sur 8 (normal).
Au stress : 37 journées à 1 trade, 8 à 2 et 6 à 3. Trois est un plafond,
jamais une obligation. Aucun objectif de journée verte n'est imposé.

Au coût normal, 1 337 signaux sont examinés à plat : 1 004 refus pour risque,
241 pour absence de pivot intact, 1 pour marge nette ; 91 entrées. Au stress,
1 360 signaux : 1 037 refus pour risque, 242 sans pivot, 10 pour marge,
71 entrées. Les compteurs ne décrivent pas tous les signaux pendant une position.

La variante normale compte 36 gagnants sur 91 trades (39,56 %), un gain moyen
de 49,01 $ et une perte moyenne de −37,16 $. Sorties : 33 targets, 48 stops,
10 clôtures de séance. Aucun cas ambigu détecté dans ce diagnostic, ce qui
ne prouve pas une exécution tick par tick. Le stop structurel et le filtre
de marge ont changé ensemble ; leurs effets individuels ne sont pas séparés.

## Cinq évaluations distinctes

Chaque fenêtre commence à 25 000 $, sans remise à zéro interne. Les dix
évaluations de la variante (cinq fenêtres × deux coûts) terminent sans breach,
mais **aucune n'atteint l'objectif**. La référence n'atteint pas l'objectif non
plus. L'absence de compte perdu ne valide pas la rentabilité.

| Fenêtre complète | Trades pivot normal / stress | Net pivot normal / stress |
| --- | ---: | ---: |
| Mai–juin 2025 | 14 / 11 | −86,50 / −85 $ |
| Juillet–août 2025 | 21 / 17 | −349 / −370,50 $ |
| Novembre–décembre 2025 | 8 / 4 | −19,50 / +2,50 $ |
| Janvier–février 2026 | 9 / 6 | +91 / +16,50 $ |
| Juillet–août 2026 | 4 / 4 | +19,50 / +5,50 $ |

Septembre–octobre 2025, mars–avril 2026 et mai–juin 2026 restent incomplets
et sans performance de fenêtre. Aucun changement de dates ni interpolation.

Critères identiques pour les deux variantes :

- Satisfait : au moins 40 trades au total.
- Non satisfait : au moins 12 dans chacune des cinq fenêtres complètes.
- Non satisfait : chaque fenêtre complète positive en R.
- Non satisfait : PF en R ≥1,10 avant arrondi.
- Non satisfait : drawdown réalisé ≤8 R.
- Non satisfait : total en R positif avec coûts doublés.
- Satisfait : aucun breach sur les comptes testés aux deux coûts.

## Vérification, archive et portée

Audit exécuté : 437 préfixes de signaux, 437 préfixes de pivots, 828 préfixes
de comptes, 456 trades audités dont 260 pivots structurels et 196 reproductions
de trades de référence. Les variantes, fenêtres et coûts ne forment pas des
observations indépendantes supplémentaires.

Les 10 nouveaux tests du moteur couvrent la confirmation retardée, les pivots
retouchés/égaux, les frontières de séance, les gaps, les Long/Short, le ratio
net, les budgets et les sorties. Deux tests supplémentaires vérifient le rapport
exact, son rejet en cas d'altération et les quatre choix de menus avec un DOM
simulé. Aucun rendu visuel dans un navigateur, broker, alerte TradingView réelle
ou compte membre n'a été testé.

Validation locale finale : 116 tests de trading réussis, build réussi,
hygiène sans anomalie, 25 Functions valides, syntaxe et références de page
vérifiées. Les 258 anciens identifiants HTML sont préservés, parmi 281 au total.

Archive privée relue et comparée exactement dans TRADING_DATASETS :

- `jeu16/structural-v1/report.json`, 65 220 octets, SHA256
  `b9c118918020da01641e68d7722d3f032e2450e408e85e577da26b34673bf8e9`.
- `jeu16/structural-v1/runs.json`, 423 761 octets, SHA256
  `fca25015dedc4fd8e921bee121c860b9faa2b58498a7661b5afd9f2b37e56fc3`.
- `jeu16/structural-v1/manifest.json`, références de source et d'intégrité.

Le rapport agrégé seulement est publié ; les prix et trades individuels restent
privés. Source Jeu 14 et archives précédentes inchangées. Les anciennes pages
et liens profonds restent accessibles. Aucun bot, Paper Bot, Shadow, flux
actuel, broker, achat, ordre, historique membre ou tâche MNQ modifié/activé.

Reproduction :
`node scripts/run-trading-jeu16.mjs DOSSIER_JEU14 DOSSIER_JEU15 DOSSIER_PRIVE`.
Le runner refuse toute dépendance figée ou empreinte de source différente.
Il peut reproduire ce résultat ; il ne lance aucune optimisation.
