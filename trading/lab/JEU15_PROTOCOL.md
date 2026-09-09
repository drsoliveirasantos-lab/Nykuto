# Jeu 15 — adaptation expérimentale à LucidFlex 25K

Fixé le 9 septembre 2026 avant le premier calcul de ce jeu. Recherche sur
l'historique déjà examiné au Jeu 14, jamais une confirmation indépendante.
Le Pullback 30 min des Jeux 13–14 et ses résultats restent intacts.

## Trois scénarios, sans recherche après résultat

1. `reference30` : Pullback 30 min inchangé, un MNQ, soumis à la limite Lucid.
2. `guard30` : mêmes signaux et stops, avec les protections internes ci-dessous.
3. `entry5trend30` : UNE nouvelle hypothèse de développement. Pullback fermé
   5 min et ATR14 5 min pour le stop, dans le sens EMA9/21 du dernier contexte
   30 min entièrement fermé, ADX14 >=20 sur les deux timeframes. Les deux sens
   restent autorisés ; aucune sélection Long-only après les anciens résultats.

Tous : entrée à l'open 5 min suivant, stop ATR14 x1,25 arrondi au tick 0,25,
target 1,5R arrondie, un MNQ ($2/point), une position, trois entrées/jour,
frein deux pertes consécutives ou -2R réalisés, flat 15 min avant clôture cash.
Coûts hypothétiques 3,50 puis 7 dollars par aller-retour, frais et slippage
forfaitaire compris. Ce ne sont pas les commissions certifiées d'une plateforme.

Protections internes des scénarios 2–3, distinctes des règles Lucid : risque
prévu stop + coûts <=50 dollars (5 % de la marge initiale), perte journalière
100 dollars, réserve de 100 dollars au-dessus du seuil de perte du compte.
Budget vérifié AVANT chaque entrée avec le solde alors connu ; sinon pas de
trade. Pas de fraction de MNQ, de stop artificiellement raccourci pour faire
rentrer une position, de martingale, ni d'objectif de gain quotidien forcé.
Un gap peut dépasser un stop ou une limite : il est exécuté à l'open observé.

## Compte d'évaluation simulé

Solde initial 25 000 $, plancher initial 24 000 $, profit target 1 250 $.
Le plancher suit le plus haut solde clôturé EOD moins 1 000 $, ne redescend
jamais, et est plafonné à 25 100 $. Une perte latente peut atteindre le
plancher en séance : contrôle sur chaque bougie, et arrêt définitif au breach.
Consistance : meilleur jour / profit <=50 %, sans exploiter la tolérance
commerciale publiée. Ce choix est volontairement plus strict. L'objectif est
vérifié à la clôture, à plat ; la simulation s'arrête à la première réussite
indicative. Aucun passage automatique funded, aucun retrait simulé ou réel.

La première frontière adverse (stop, perte journalière interne ou MLL) est
exécutée. Si target et frontière adverse sont touchés dans la même bougie,
la frontière adverse est prioritaire et l'ambiguïté est comptée. Les timestamps
intrabar sont des intervalles de 5 min, pas des heures exactes de fill. Le
coût complet est réservé dans l'equity ; la liquidation MLL se fait au premier
tick observablement au-delà du seuil. Cette convention est prudente, mais ne
reconstitue ni le chemin tick par tick ni les fills d'un broker.

## Dates et données

Snapshot Jeu 14 immuable (SHA256 et octets vérifiés), mêmes calendriers,
horaires Massive, rollovers et warmup 220 bougies 30 min. Les huit fenêtres
de deux mois de JEU14_WINDOWS restent listées ; seules les cinq complètes
sont simulées. Septembre–octobre 2025, mars–avril et mai–juin 2026 restent
« données incomplètes », sans interpolation ni resserrage des dates.
Chaque fenêtre commence une évaluation distincte à 25 000 $, pour les trois
scénarios et les deux coûts. Jamais de reset à l'intérieur d'une fenêtre.
Ni somme des comptes ni pourcentage de réussite présenté comme revenu ou
probabilité future. Arrêt à la fin de la fenêtre = horizon de recherche,
pas délai maximal de l'offre Lucid.

En complément, le moteur stratégique est exécuté sans arrêt au profit target
sur les 330 séances évaluables pour mesurer journées positives/négatives/sans
trade, net R et dollars à un MNQ, drawdown réalisé et coûts doublés. Les gardes
50/100 dollars s'appliquent aux scénarios 2–3 ; ce diagnostic n'est pas un
compte Lucid continu car la couverture comporte des trous. Il réutilise les
mêmes observations que les fenêtres et ne multiplie pas l'effectif.

## Verdict et prochaine étape

Afficher tous les scénarios, même zéro trade ou perte. Garde de recherche :
>=40 trades, au moins12 dans chacune des cinq fenêtres complètes, net positif
dans chacune, PF >=1,10 avant arrondi, drawdown réalisé <=8R, total stress
positif et aucun breach d'évaluation normal/stress. Les résultats ne peuvent
être que non concluants ou prometteurs en développement. L'indépendance,
le flux actuel autorisé et les tests d'exécution Paper Trading restent des
portes distinctes, fermées ; aucun score vert ne peut activer le bot.

Audits : reproduction exacte des 234 anciens trades aux deux coûts,
signaux par préfixes, rejeu des comptes sur préfixes de séances, ticks, coûts,
horaires, budgets avant entrée, EOD/MLL, ambiguïtés et état terminal.
Captures existantes sous jeu14/ conservées. Nouveau rapport privé sous jeu15/,
empreinte SHA256, résumé agrégé seulement dans Git. Aucun compte membre,
broker, ordre, achat, automation ou autre site modifié.

## Sources officielles consultées le 9 septembre 2026

- [Évaluation](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account)
- [Drawdown](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown)
- [Consistency](https://support.lucidtrading.com/en/articles/12945805-lucidflex-consistency-percentage)
- [Funded](https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account)
- [Payouts](https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts)
- [Automatisation](https://support.lucidtrading.com/en/articles/11404728-other-trading-activities)

Le funded a d'autres conditions, dont cinq jours d'au moins100 $, split90/10,
payout minimum500 $ et plafond50 % des profits jusqu'à1000 $. Elles sont
documentées, pas exécutées par ce simulateur d'évaluation.
