# Jeu 38 — Filtre de structure et obstacle Nasdaq

**Décision : filtre non retenu, référence à 100 $ conservée.** Les résultats des six couples mois/coûts sont inchangés. Aucun gagnant supprimé, aucun perdant évité, aucune nouvelle admission. Le critère fixé exigeait aussi une amélioration stricte du bénéfice dans au moins une cellule : cette condition échoue.

## Modification réellement testée

Une seule campagne, exécutée le 10 septembre 2026 après le gel publié au commit `563ab6eff9e475ddcc40058b9fb9b2342ef4618a`. Sur MNQ seulement, veto si la structure M5 confirmée est explicitement opposée **et** si un pivot confirmé se trouve strictement entre entrée et cible 2R. Risque nominal 100 $ frais compris, limite interne quotidienne 200 $, stops et sorties inchangés. MES conserve son filtre RSI, MGC son profil de cassure échouée avant 11 h New York ; MYM reste exclu.

Compte funded 50K supposé déjà obtenu, neuf chaque mois. Les mois de juin/juillet/août **2026** ont déjà été consultés : diagnostic de développement, aucune validation indépendante. Objectif de 4 000 **USD de PnL**, distinct du premier versement personnel simulé de 1 000 **EUR**. Aucun des deux objectifs n’est atteint, aucun retrait n’est demandé. Ce moteur ne reproduit pas entièrement la méthode H1 20/50 de l’appel.

## Résultats mensuels

Ces chiffres sont identiques pour la référence et le veto. La baisse maximale est réalisée entre trades, et ne mesure pas toute la baisse latente intrabougie. Les coûts doublés peuvent modifier les admissions, ce qui explique des effectifs différents.

| Mois | Coûts | Trades | Gagnants / perdants | Net USD | Moyenne / trade | Gain moyen | Perte moyenne | Baisse maximale |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Juin | Normaux | 16 | 11 / 5 | 1 048,75 | 65,55 | 133,64 | -84,25 | 172,50 |
| Juin | Doublés | 13 | 9 / 4 | 785,50 | 60,42 | 122,72 | -79,75 | 145,00 |
| Juillet | Normaux | 21 | 8 / 13 | 176,00 | 8,38 | 141,44 | -73,50 | 312,50 |
| Juillet | Doublés | 21 | 9 / 12 | 164,00 | 7,81 | 126,50 | -81,21 | 330,50 |
| Août | Normaux | 11 | 3 / 8 | -245,50 | -22,32 | 148,17 | -86,25 | 442,00 |
| Août | Doublés | 8 | 2 / 6 | -228,50 | -28,56 | 132,50 | -82,25 | 359,50 |

Tous les comptes terminent avec un objectif non atteint, sans rupture. Solde final = 50 000 $ + bénéfice net, retrait nul. Les semaines et journées s’additionnent exactement au résultat du mois ; les mois ne constituent pas un compte continu.

## Pourquoi le filtre ne change rien

| Mois | Signaux MNQ examinés | Veto | Trades retirés | Gagnants supprimés | Perdants évités | Nouvelles admissions |
|---|---:|---:|---:|---:|---:|---:|
| Juin | 16 | 0 | 0 | 0 | 0 | 0 |
| Juillet | 20 | 0 | 0 | 0 | 0 | 0 |
| Août | 13 | 2 | 0 | 0 | 0 | 0 |

Les signaux examinés sont les mêmes sous les deux hypothèses de coûts : **49 signaux distincts, dont deux veto**, et non 98 observations indépendantes. Les deux veto d’août étaient déjà refusés par le plafond de risque du témoin (`tradeRisk` : 9 → 7 après filtrage, aux deux coûts). Le filtre intervient avant le dimensionnement, sans enlever une position exécutée. Il ne libère aucune place pour MES ou MGC.

Les 48 trades normaux et 42 trades avec coûts doublés de la candidate sont identiques à ceux de la référence, y compris quantités, prix et sorties. Ce sont des scénarios alternatifs sur les mêmes marchés. Un compteur de signaux bloqués ne prouve pas une réduction des pertes.

## Contributions par marché

| Mois | Coûts | Marché | Trades | Gagnants / perdants | Net USD | Moyenne / trade |
|---|---|---|---:|---:|---:|---:|
| Juin | normal | MNQ | 7 | 6 / 1 | 700,00 | 100,00 |
| Juin | normal | MES | 7 | 3 / 4 | 83,75 | 11,96 |
| Juin | normal | MYM | 0 | 0 / 0 | 0,00 | — |
| Juin | normal | MGC | 2 | 2 / 0 | 265,00 | 132,50 |
| Juin | stress | MNQ | 6 | 5 / 1 | 559,00 | 93,17 |
| Juin | stress | MES | 4 | 2 / 2 | 47,50 | 11,88 |
| Juin | stress | MYM | 0 | 0 / 0 | 0,00 | — |
| Juin | stress | MGC | 3 | 2 / 1 | 179,00 | 59,67 |
| Juillet | normal | MNQ | 8 | 2 / 6 | -228,00 | -28,50 |
| Juillet | normal | MES | 5 | 3 / 2 | 315,00 | 63,00 |
| Juillet | normal | MYM | 0 | 0 / 0 | 0,00 | — |
| Juillet | normal | MGC | 8 | 3 / 5 | 89,00 | 11,13 |
| Juillet | stress | MNQ | 8 | 2 / 6 | -259,50 | -32,44 |
| Juillet | stress | MES | 6 | 4 / 2 | 332,50 | 55,42 |
| Juillet | stress | MYM | 0 | 0 / 0 | 0,00 | — |
| Juillet | stress | MGC | 7 | 3 / 4 | 91,00 | 13,00 |
| Août | normal | MNQ | 5 | 1 / 4 | -149,50 | -29,90 |
| Août | normal | MES | 5 | 1 / 4 | -257,50 | -51,50 |
| Août | normal | MYM | 0 | 0 / 0 | 0,00 | — |
| Août | normal | MGC | 1 | 1 / 0 | 161,50 | 161,50 |
| Août | stress | MNQ | 5 | 1 / 4 | -220,50 | -44,10 |
| Août | stress | MES | 2 | 0 / 2 | -165,00 | -82,50 |
| Août | stress | MYM | 0 | 0 / 0 | 0,00 | — |
| Août | stress | MGC | 1 | 1 / 0 | 157,00 | 157,00 |

MNQ reste négatif en juillet et août ; MES positif en juillet mais négatif en août. MGC contribue positivement dans les trois petits échantillons. Ces résultats ne justifient pas de choisir les marchés après avoir vu chaque mois. Les profils utiles sont conservés comme référence de recherche.

## Apport par semaine

Réinitialisation au début de chaque mois. Semaine partielle : seule sa portion dans le mois est incluse. Aucun versement personnel simulé. Même tableau pour les deux variantes.

| Mois | Période | Partielle | Net normal USD | Net doublé USD | Cumul normal USD | Cumul doublé USD |
|---|---|---|---:|---:|---:|---:|
| Juin | 2026-06-01 → 2026-06-05 | Non | 347,00 | 189,00 | 347,00 | 189,00 |
| Juin | 2026-06-08 → 2026-06-12 | Non | -15,25 | -5,00 | 331,75 | 184,00 |
| Juin | 2026-06-15 → 2026-06-18 | Non | 13,50 | 3,00 | 345,25 | 187,00 |
| Juin | 2026-06-22 → 2026-06-26 | Non | 573,50 | 478,50 | 918,75 | 665,50 |
| Juin | 2026-06-29 → 2026-06-30 | Oui | 130,00 | 120,00 | 1 048,75 | 785,50 |
| Juillet | 2026-07-01 → 2026-07-02 | Oui | 150,00 | 140,00 | 150,00 | 140,00 |
| Juillet | 2026-07-06 → 2026-07-10 | Non | -241,00 | -184,00 | -91,00 | -44,00 |
| Juillet | 2026-07-13 → 2026-07-17 | Non | 141,00 | 123,00 | 50,00 | 79,00 |
| Juillet | 2026-07-20 → 2026-07-24 | Non | -27,00 | -38,50 | 23,00 | 40,50 |
| Juillet | 2026-07-27 → 2026-07-31 | Non | 153,00 | 123,50 | 176,00 | 164,00 |
| Août | 2026-08-03 → 2026-08-07 | Non | -150,50 | -59,00 | -150,50 | -59,00 |
| Août | 2026-08-10 → 2026-08-14 | Non | 347,00 | 190,00 | 196,50 | 131,00 |
| Août | 2026-08-17 → 2026-08-21 | Non | -167,00 | -80,50 | 29,50 | 50,50 |
| Août | 2026-08-24 → 2026-08-28 | Non | -275,00 | -279,00 | -245,50 | -228,50 |
| Août | 2026-08-31 → 2026-08-31 | Oui | 0,00 | 0,00 | -245,50 | -228,50 |

Le [calendrier historique](./#historyCalendarGame) permet de sélectionner le jeu, le profil, l’étape et les coûts, puis de consulter chaque date. Le 19 juin et le 3 juillet sont « non étudiés » ; week-ends et journées après arrêt ne sont pas transformés en gains nuls. Les anciens rapports restent intacts.

## Contrôles et conservation

- 49 dépendances et les trois sources privées vérifiées par taille et SHA avant réutilisation. Protocole gelé inchangé après résultats.
- 12 relectures, six témoins Jeu 37 entièrement identiques ; 256 préfixes de compte et 256 reconstructions du filtre comparés.
- Une seule configuration nouvelle : registre 90, catalogue croisé 107 ; zéro confirmation indépendante. Sélection automatique nulle.
- [Rapport complet agrégé](./jeu38-report.json), [protocole original](./JEU38_PROTOCOL.md), [mémoire des leçons](./RESEARCH_LESSONS.md), [manifeste privé sans transactions](./jeu38-archive.json).
- Deux parties gzip/base64 et leur manifeste écrits sous un nouveau préfixe puis relus exactement. Données brutes et transactions hors Git.
- Aucun seuil retouché, nouvelle campagne, ordre, broker, Paper/Shadow ou fusion main. Intégration Kronos/RSI/news et collecte prospective conservées.

Le résultat nul est conservé. Une éventuelle nouvelle hypothèse demanderait son propre protocole fixé avant calcul ; cette campagne bornée s’arrête ici.

## Validation logicielle de la publication

243 tests passent, dont le rapport du Jeu38 et les 56 sélections / 168 vues mensuelles du calendrier historique. Build, hygiène et 25 modules Functions validés. Les 495 anciens identifiants HTML sont conservés parmi 516 identifiants uniques. Les tests d’interface utilisent un DOM simulé ; la typographie, les cibles44px et le défilement sur écran étroit sont contrôlés dans les sources CSS, sans inspection navigateur. Ces contrôles ne prouvent pas la rentabilité.
