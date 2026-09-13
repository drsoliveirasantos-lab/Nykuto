# Jeu 33 — 50K, risque 100 dollars et profils de marché

**Le 50K termine l'été à +691,25 dollars, puis +265,50 dollars aux coûts doublés.
Août reste perdant et l'évaluation de 3 000 dollars n'est pas atteinte.**
32 simulations, quatre configurations, historique déjà observé : aucune
confirmation indépendante, aucun profil activé et aucun retrait simulé.

## Le compte 50K, sans remise à zéro

| Mesure, juin–août 2026 | Coûts normaux | Coûts doublés |
|---|---:|---:|
| Bénéfice net | +691,25 $ | +265,50 $ |
| Trades | 62 | 57 |
| Solde final | 50 691,25 $ | 50 265,50 $ |
| Baisse maximale du solde réalisé | 593,50 $ | 722 $ |
| Marge finale avant le seuil de perte | 1 406,50 $ | 1 278 $ |
| Meilleure journée | +273,50 $ | +258 $ |
| Meilleure semaine complète | +464,50 $ | +445 $ |
| Semaines complètes à au moins +1 000 $ | 0/13 | 0/13 |
| Journées positives / négatives / sans trade | 23 / 24 / 17 | 22 / 24 / 18 |

Le profil fixe et le profil à risque réduit donnent exactement les mêmes
trades sur 50K : la marge disponible n'atteint jamais le seuil de réduction
à une entrée. **Ce test ne démontre donc pas l'utilité de la réduction sur 50K.**
Elle existe et ses transitions sont testées, mais cet historique ne la sollicite
pas sur ce compte. Les frais et le slippage doublés sont une seconde simulation,
avec des entrées et quantités pouvant changer ; ce n'est pas un objectif 1:1.

## Mois observés et limites

Comptes 50K initialisés au début de chaque fenêtre :

| Mois | Net normal | Net stress | Trades normaux |
|---|---:|---:|---:|
| Juin | +733,75 $ | +473 $ | 22 |
| Juillet | +460,50 $ | +350 $ | 21 |
| Août | −503 $ | −557,50 $ | 19 |

Leur somme coïncide ici avec le compte continu 50K parce que les différences
de seuil n'affectent pas ses admissions. Ce n'est pas une propriété générale :
les comptes réinitialisés ne remplacent jamais la simulation continue.

## Un profil par marché, un risque commun

| Marché | Entrée / filtre conservé | Net été normal | Net été stress |
|---|---|---:|---:|
| MES | Retour après cassure ; pas d'achat RSI >70 ni vente RSI <30 | +171,25 $ | +217,50 $ |
| MGC | Cassure échouée ; nouvelle entrée avant 11 h New York | +463,50 $ | +384 $ |
| MNQ | Retour après cassure et contexte de tendance existant | +553 $ | +261 $ |
| MYM | Retour après cassure ; aucun nouveau filtre | −496,50 $ | −597 $ |

Les quantités dépendent du tick, de sa valeur, des frais et du stop propre
au produit. Le compte impose une position et deux entrées par jour au total.
Les quatre profils partagent la même limite quotidienne interne de 200 dollars,
la réserve de seuil de 100 dollars, et un plafond de vingt micros.

Cette comparaison conserve les stops structurels fixes et la cible 2R. Elle
ne déplace pas les stops MNQ/MYM à zéro comme certaines anciennes variantes,
et ne rajoute pas le H1/M5 déjà rejeté. Les contributions dépendent des conflits
d'entrées du portefeuille : retirer le MYM ne permet pas de simplement ajouter
496,50 dollars au résultat. Il faudrait resimuler les occasions libérées.

Le MYM est la priorité d'analyse, surtout en août (−410,50 dollars sur 10 trades
aux coûts normaux). Le MGC est positif mais n'a que neuf trades sur l'été, dont
un seul en août. Ces nombres ne justifient pas une validation par marché.
La prochaine comparaison pertinente serait une ablation MYM définie à l'avance,
puis des observations nouvelles. Cette ablation n'a pas été exécutée ici.

## Ce que change le compte et la réduction du risque

| Compte continu | Net normal | Net stress | Lecture |
|---|---:|---:|---|
| 25K, plafond fixe 100 $ | +1 258,25 $ | +265,50 $ | Arrêt normal le 27 juillet après objectif ; stress jusqu'à fin août |
| 25K, réduction 100 → 50 → 25 $ | −183,75 $ | −315,25 $ | Réduction trop précoce pour cette trajectoire ; des entrées disparaissent |
| 50K, plafond fixe 100 $ | +691,25 $ | +265,50 $ | Été complet ; objectif non atteint |
| 50K, réduction 100 → 50 → 25 $ | +691,25 $ | +265,50 $ | Aucune réduction déclenchée |

Le meilleur total du 25K fixe est tronqué par l'arrêt à l'objectif, il ne prouve
pas une meilleure rentabilité sur l'été complet. Au stress, 25K et 50K fixes
réalisent le même bénéfice mais terminent avec 278 dollars contre 1 278 dollars
de marge avant le seuil. Le 50K apporte ici de la marge ; il ne multiplie pas
les gains. Un objectif 25K inférieur reste plus facile à atteindre.

Sur 25K, le seuil de réduction de 1 000 dollars correspond à toute sa marge
initiale : dès qu'elle diminue, le plafond descend à 50 dollars. Ce seuil absolu,
choisi pour comparer la règle de l'associé, n'a donc pas la même sévérité relative
que sur 50K. Les résultats réfutent l'idée que réduire le risque améliore
automatiquement le bénéfice. Aucun seuil n'a été retouché après le calcul.

## Consistency 50 % : ce que cela veut dire

**Meilleure journée / bénéfice net total ≤ 50 % pendant l'évaluation.**
Sur 50K, avec 3 000 dollars de bénéfice total, une meilleure journée de 1 200
donne 40 % ; une de 1 800 donne 60 %. Dans le second cas, il faut atteindre
3 600 dollars de bénéfice total pour revenir à 50 %, si la meilleure journée
reste à 1 800. Une perte réduit le bénéfice total et augmente ce ratio.
Ce dépassement n'invalide pas automatiquement le compte.

Lucid prévoit une petite tolérance : son exemple donne 1 560 dollars pour
un bénéfice total de 3 000 sur 50K, sans publier une règle complète applicable
à tous les cas. Le test et le calculateur restent à 50 % stricts, explicitement.
Ils ne prétendent pas décider pour Lucid dans cette zone. Le funded LucidFlex
n'a pas de règle de consistency 50 %.

Sources officielles : [cohérence](https://support.lucidtrading.com/en/articles/12945805-lucidflex-consistency-percentage),
[évaluation](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account),
[seuil de perte](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown),
[funded](https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account).

## Preuves et reproduction

Gel publié avant calcul : `c8fa2449db65bbf988eb6d0051cec1e8b867cd68`.
Huit reproductions des résultats archivés du Jeu 32, huit comparaisons du
nouveau moteur au témoin 150 dollars, 999 contrôles sur des préfixes de journées,
841 enregistrements de trades contrôlés (avec répétitions entre scénarios).
Tous réussissent. Ce sont des contrôles logiciels et de causalité, pas de
nouvelles observations indépendantes.

Le premier essai d'exécution distante a dépassé la limite CPU, sans écrire
de résultat. Les mêmes fichiers gelés ont ensuite été exécutés localement,
après vérification intégrale des sources SHA-256. Aucun paramètre changé.
Le rapport agrégé et les trades privés ont été archivés puis relus intégralement.

- Rapport agrégé : [jeu33-report.json](jeu33-report.json).
- Protocole : [JEU33_PROTOCOL.md](JEU33_PROTOCOL.md).
- Empreintes : [jeu33-freeze.json](jeu33-freeze.json).
- Archive privée : manifeste `jeu33/account-sizing-v1/manifest.json` dans TRADING_DATASETS.
- `node scripts/run-trading-jeu33.mjs /sources-privees /archive-jeu32 /sortie-neuve`.

La stratégie reste exploratoire. Ni les coûts réels d'un broker connecté, ni les
retraits, ni le passage funded ne sont simulés. Aucun ordre n'est envoyé.
