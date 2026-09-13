# Audit des données, du suivi Pine et du site — 13 septembre 2026

Les données M1 accessibles sont complétées avec leur volume. Les contrôles de
logiciel réussissent. La reconstruction historique reste négative après coûts
dans la convention étudiée ; aucune amélioration de rentabilité n'est annoncée.

## Données effectivement vérifiées

| Série | Bougies | Avec volume | Première ouverture UTC | Dernière ouverture UTC |
| --- | ---: | ---: | --- | --- |
| M1 | 352 800 | 352 800 | 14 septembre 2025, 22:00 | 11 septembre 2026, 20:59 |
| M5 | 354 033 | 354 033 | 14 septembre 2021, 00:00 | 11 septembre 2026, 20:55 |
| M15 | 118 011 | 118 011 | 14 septembre 2021, 00:00 | 11 septembre 2026, 20:45 |
| H1 | 29 511 | 29 511 | 14 septembre 2021, 00:00 | 11 septembre 2026, 20:00 |

1 020 minutes du 18 juin 2026 ont été retrouvées ; 154 770 volumes inconnus ont
été récupérés dans des exports natifs. Huit révisions de volumes M1 et M5 ont
été départagées par concordance avec les cinq minutes et leur export M5 natif.
Une ancienne dernière bougie partielle est remplacée par sa version clôturée.
70 560 groupes de cinq M1 concordent exactement avec les OHLCV M5 ; aucun
conflit restant ni ligne invalide n'est conservé silencieusement.

La grille régulière laisse 6 000 minutes : 5 355 concordent avec les horaires
Equities des tableaux CME reproduits par AMP et 645 correspondent à un incident
confirmé par CME, dont les heures exactes sont ici observées. La certification
indépendante de tous les horaires reste limitée. Ces intervalles sont distingués
des trous démontrés dans une M5 négociée. Le calendrier décrit la couverture observée, sans inventer une
bougie pendant une fermeture. Les M1 antérieures au 14 septembre 2025 restent
indisponibles. M15/H1 sont complétées uniquement avec des groupes M5 complets.

Archive versionnée `2026-09-13-v3`, 172 blocs privés. Manifeste SHA-256 :
`4b8e1a3fc90f8dd78e34625154c49f0715c69092eea6663a698d7580a5e8e4fc`.
Les archives précédentes restent conservées ; les prix et les sources Pine
privées ne sont pas ajoutés au dépôt Git public.

## Contrôles des mécanismes

45 tests ciblés vérifient les horaires NY et le changement d'heure, les trous
d'observation, l'ordre ouverture/TP/SL, les bougies qui chevauchent une échéance,
la liquidation de toute la quantité et les événements de l'ancien plan avant
une nouvelle admission. L'ancienne pause MNQ 16:15–16:30 est retirée pour les
périodes postérieures au 28 juin 2021 ; le flat configuré reste à 16:45.
[Avis CME](https://www.cmegroup.com/notices/electronic-trading/2021/06/20210621.html).

Le fichier `current-audit.mjs` indique séparément l'état de compilation native de
la source Pine privée. Les tests JavaScript ne constituent pas une compilation
TradingView et ne certifient pas une parité exhaustive du scanner ou du ladder.

## Reconstruction historique bornée

Le protocole et les dépendances ont été gelés avant une campagne de 34,84 secondes.
Le scanner M5 historique est conservé, sans recherche de nouveaux seuils. Le
recensement compte toutes ses opportunités distinctes ; une exécution
séquentielle avec une seule position les traite séparément, sans quota quotidien.
La valorisation analytique conserve toute la quantité jusqu'à la sortie terminale.
Elle ne reproduit pas toutes les sorties partielles du Pine.

| Mesure | Recensement | Séquentiel |
| --- | ---: | ---: |
| Opportunités / scénarios | 31 679 | 12 074 |
| Ambiguïtés M5 résolues avec M1 | 35 | 9 |
| Moyenne R après coûts normaux | −0,0572 | −0,0542 |
| Moyenne R avec coûts doublés à quantité fixe | −0,1277 | −0,1234 |

Le scénario de coûts doublés est une sensibilité après coup : 836 candidats
dépasseraient le plafond de 500 $ à quantité fixe. Il n'est donc pas présenté
comme une exécution conforme à ce budget. Les résultats inconnus restent
inconnus ; aucun ordre favorable n'est inventé dans une minute ambiguë.

Les volumes M1 ne participent pas aux admissions par défaut du scanner M5 : les
302 682 états de l'ancienne fenêtre sont identiques lorsque seules les M1 changent.
La réparation rend les diagnostics minute exploitables ; elle ne démontre pas
un nouveau pouvoir prédictif. Quatre contrôles de préfixes supplémentaires dans
la période M1 confirment que retirer les minutes futures ne change pas les
issues déjà observées. Le maximum recensé est de 45 opportunités sur une date.

## Protection et déploiement

Les routes de recherche et `/api/lab/*` exigent une identité Access valide,
une adhésion D1 active et le rôle serveur `owner` avant toute lecture KV.
Un compte associé reçoit 404 sur les pages réservées et 403 sur les données.
Les chemins encodés sont normalisés avant le contrôle de rôle. Les réponses
authentifiées ne sont pas mises en cache public.

312 tests du site et 45 modules Pages Functions ont été vérifiés. La validation
des Functions inclut désormais le répertoire `trading/functions`, qui était
auparavant omis par ce contrôle. Les contrôles de build et d'hygiène passent.
Ces contrôles ne révoquent pas une copie déjà détenue ou une ancienne publication.
Aucun broker, ordre, Paper ou Shadow n'est activé par cet audit.

## Source Pine canonique privée

La révision V15.2.8 a été compilée nativement sur TradingView (révision 70).
SHA-256 de la source complète :
`c0a6527dbe34118b47b6773905c9d0531bfebf402307d5991e26076cea536132`.
Le propriétaire peut télécharger cette même source via `/api/lab/pine`. Le
serveur recalcule son empreinte avant d’envoyer le TXT et refuse tout contenu
différent. Cette route fournit une source validée ; le site ne prétend pas
générer automatiquement un nouveau Pine depuis les résultats du backtest.
