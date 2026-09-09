# Jeu 15 — LucidFlex 25K, 9 septembre 2026

## Verdict

**Aucune des trois configurations n'est confirmée.** Le moteur de risque et
les simulations sont ajoutés au Lab ; aucun bot ni broker n'est activé.
L'empreinte du protocole fixé avant le calcul est
`b342f8db74a9a9e6aca2d38e58073accf6ac2909970d881070bdb23f2cb86905`.
Commit local de gel : `d5de20b`. La nouvelle hypothèse n'a pas été réglée
après ses résultats ; les échecs restent visibles.

## Diagnostic stratégique sur les 330 séances évaluables

Un MNQ par position, coûts hypothétiques 3,50 $ / 7 $ par aller-retour.
Les contraintes de budget 50 $/trade et 100 $/jour s'appliquent aux lignes2–3.
Ce diagnostic ne s'arrête pas au profit target et ne représente pas un compte
continu : les périodes de données manquantes/préparation restent exclues,
selon la couverture immuable du Jeu14. Les sommes ne sont pas des revenus.

| Configuration | Trades normal/stress | Net $ normal/stress | Net R normal/stress | Jours positifs/négatifs/sans trade, normal |
| --- | ---: | ---: | ---: | ---: |
| Pullback 30 min, référence | 234 / 234 | +2 946 / +2 127 | +10,8921 / +7,2168 | 95 / 91 / 144 |
| Pullback 30 min, budget limité | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 / 330 |
| Pullback 5 min + tendance 30 min | 63 / 57 | +14 / −178 | +0,0196 / −5,6455 | 17 / 21 / 292 |

Le résultat dollar est calculé à partir de chaque variation de prix x $2,
moins les coûts, pas en multipliant la somme R par un risque actuel arbitraire.
Les coûts doublés peuvent refuser d'autres entrées et modifier les pauses.

La référence reproduit les234 trades du Jeu14 aux deux coûts. Son drawdown
réalisé est2 693,50 $ (9,7384 R), sa pire journée −1 221,50 $.
La version 30 min protégée refuse405 signaux examinés à plat, tous trop
risqués ; ces405 signaux ne sont pas des trades ni une performance validée.

La nouvelle entrée 5 min réduit la pire journée observée à −94,50 $
(stress −96 $), et le drawdown réalisé à522,50 $ (stress563,50 $).
Mais son PF est seulement1,000574619846941 (stress0,8365370362283772),
et son drawdown en unités de risque atteint13,49398 R (stress15,01263 R).
Le risque en dollars diminue, l'avantage après coûts n'est pas établi.
Les budgets sont des contrôles avant entrée et des arrêts simulés ; un gap
pourrait produire une perte supérieure sur un autre historique ou en réel.

## Évaluations distinctes, avec MLL et arrêt définitif

Chaque ligne repart de25 000 $ au début de sa fenêtre, sans reset pendant la
fenêtre. Le tableau concerne la référence30min ; les cinq comptes sont perdus
ou arrêtés dès leur objectif indicatif. Leur somme n'est pas un rendement.

| Fenêtre complète | Référence, coûts normaux | Référence, coûts doublés |
| --- | --- | --- |
| Mai–juin2025 | Breach29mai ; −1 000 $ ;14trades | Breach29mai ; −1 000 $ ;14trades |
| Juillet–août2025 | Breach21août ; −808,50 $ ;24trades | Breach21août ; −829,50 $ ;23trades |
| Novembre–décembre2025 | Breach10décembre ; −67,50 $ ;13trades | Breach10décembre ; −85 $ ;13trades |
| Janvier–février2026 | Objectif/consistency9février ; +1 626 $ ;18trades | Objectif/consistency9février ; +1 563 $ ;18trades |
| Juillet–août2026 | Objectif/consistency17juillet ; +1 251,50 $ ;6trades | Objectif/consistency27juillet ; +1 505,50 $ ;12trades |

Le MLL monte après des clôtures bénéficiaires : un compte peut être perdu
alors que sa perte depuis le départ est inférieure à1 000 $. Les timestamps
des sorties restent ceux de bougies5min et non les heures de fills réels.

La version 30min protégée ne prend aucun trade dans ces cinq comptes.
La nouvelle version5min ne perd aucun des cinq comptes, mais n'atteint le
profit target dans aucun, aux deux coûts. Son résultat normal/stress à la
fin de chaque fenêtre est respectivement : +30,50/+90,50 $, −299,50/−457 $,
−87/−15 $, +110,50/+96,50 $, 0/0 $. « Pas de breach » ne suffit pas.

Trois autres fenêtres restent bloquées : septembre–octobre2025 (40/44séances),
mars–avril2026 (25/43) et mai–juin2026 (39/41). Aucun prix n'est interpolé.
Les tests normal/stress et les diagnostics réutilisent les mêmes séances ;
ils ne constituent pas30 expériences indépendantes.

## Portée et audit

La simulation couvre l'évaluation Flex25K sans option DLL Lucid ; la limite
journalière interne est distincte. La consistency est testée à50 % stricts,
sans la tolérance commerciale. Un succès historique est indicatif : aucun
accord de la prop firm, aucun funded, payout ou flux live n'est simulé comme
effectivement obtenu. Les frais d'achat/reset/plateforme et la fiscalité ne
sont pas déduits du PnL stratégique ; les commissions/slippage sont hypothétiques.

Audit :874 préfixes de signaux,1 242 préfixes de comptes,819 trades audités en
comptant diagnostics/fenêtres/coûts et468 comparaisons d'anciens trades (234x2).
Les fenêtres complètes ont41,43,41,39 et43séances. Les snapshots et rollovers
du Jeu14 restent inchangés ; les prix avaient été récupérés après leur période,
pas archivés en live. Aucun test visuel navigateur n'a été effectué.

Reproduction : `node scripts/run-trading-jeu15.mjs DOSSIER_JEU14 DOSSIER_PRIVE`.
Le runner refuse un snapshot Jeu14 dont les octets/SHA256 diffèrent. Il produit
un rapport agrégé et les détails privés, régénérables depuis les mêmes sources.
Le rapport agrégé officiel est `jeu15-report.json` ; sa copie privée et les
détails sont conservés sous `jeu15/` dans TRADING_DATASETS avec empreintes.

Avant des trades actuels : trouver un avantage compatible après coûts, obtenir
une validation indépendante, intégrer un flux autorisé et tester l'exécution
Paper Trading (rejets, déconnexions, doublons, protection serveur et reprise).
Ces étapes restent explicitement non réalisées. Aucun ordre n'est activé,
aucun achat ou nouvelle automation créé ; les deux tâches MNQ sont conservées.

Validation logicielle :104 tests de trading réussis, build réussi, hygiène
sans anomalie et25 Functions valides. Le rapport privé relu correspond
exactement au fichier publié ; les détails privés ont aussi été relus.

- Rapport :61 606octets, SHA256
  `db24269ca5a2d461beac56e917950041bc73d86cfbc569ecdf867302d2712e40`.
- Détails privés compacts :638 616octets, SHA256
  `174c0704d2b1c1372f7cddbf3fd7bbe95f56928b96411b0b8211aa0feb041593`.
