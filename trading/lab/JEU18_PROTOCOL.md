# Jeu 18 — filtrer les entrées par le VWAP de séance

Défini le 9 septembre 2026 avant le premier calcul. Une seule nouvelle
hypothèse après le Jeu 17 : ajouter une condition de prix relatif au VWAP de
séance. Développement adaptatif sur historique déjà examiné, sans confirmation
indépendante ni sélection automatique d’un modèle.

## Comparaison fixée

- Référence : `atrNet5` du Jeu 17, Pullback 5 min dans une tendance 30 min
  clôturée, stop ATR et filtre de marge nette ≥1.
- Variante : exactement la même politique, mais Long seulement si la clôture
  du signal est strictement au-dessus du VWAP de séance ; Short seulement si
  elle est strictement en dessous. Égalité ou VWAP indisponible : refus.
- Calcul depuis l’ouverture cash à 09:30 New York jusqu’à la clôture du signal,
  en incluant cette bougie entièrement terminée : somme(HLC3 × volume) /
  somme(volume), où HLC3=(high+low+close)/3 sur les vraies bougies MNQ 5 min.
  C’est une approximation par bougies, pas un VWAP calculé transaction par
  transaction, ni le VWAP de toute la séance futures Globex.
- Remise à zéro chaque séance et contrat. Si la première bougie de séance
  manque, ou s’il y a un trou intraday, ne pas reconstituer le VWAP : il reste
  indisponible pour le reste de la séance. Une nouvelle séance complète peut
  repartir normalement. Volume cumulé nul : indisponible ; volume négatif,
  fractionnaire ou non fini, OHLC/tick invalides, doublon : erreur.
- Le calcul emploie des sommes entières de ticks × volumes pour distinguer
  une égalité exacte sans seuil arbitraire. Toute perte de précision entière
  sûre provoque un arrêt du calcul. Aucun prix/volume de la bougie d’entrée
  ni VWAP final de la journée n’intervient dans la décision.

Les signaux admis sont entièrement rejoués par le moteur inchangé du Jeu 17.
Refuser un signal peut permettre une autre entrée plus tard ; ne pas supprimer
des trades d’une liste déjà calculée. Le compteur de signaux VWAP est calculé
sur tous les signaux de base des séances évaluables, même pendant une position :
il est distinct des refus de risque examinés à plat et du nombre de trades.

## Ce qui reste identique

Un MNQ, risque prévu stop + coûts ≤50 $, budget de perte 100 $/séance,
réserve MLL 100 $, une position, trois entrées maximum, pause après deux pertes
consécutives ou −2R réalisés. Target 1,5R arrondie au tick, entrée à l’open
suivant, sortie 15 minutes avant clôture cash, budgets et mécanique de compte
LucidFlex 25K gelés au Jeu 15. Aucun changement de quantité, de stop, d’heure,
de sens, d’ADX, d’EMA ou de target.

Coûts hypothétiques 3,50 $ puis 7 $ par aller-retour, entièrement rejoués.
La firme, les frais réels et le flux live ne sont pas actualisés par ce jeu.
Les coûts supposés n’incluent pas achat/reset, plateforme, payout ou fiscalité.

Source Jeu 14 exacte, SHA256
`028e914bb10ea38b73b6fcbc867c5d81937b967701448913fc88ca85746557cf`.
Même préparation et mêmes interruptions : 330 séances évaluables, cinq fenêtres
complètes, trois incomplètes conservées sans performance. Aucun nouveau découpage
pour rendre le résultat favorable. Diagnostics et évaluations réutilisent les
mêmes observations et ne sont pas des expériences indépendantes.

Critères inchangés : ≥40 trades, ≥12 par fenêtre complète, chaque fenêtre
positive en R, PF en R ≥1,10 sans arrondi, drawdown réalisé ≤8R, net R positif
aux coûts doublés, aucun breach aux deux coûts. Comparer aussi brut/coûts/net
en dollars, journées, refus, nombre de trades et résultats des comptes. Une
amélioration relative avec critères échoués n’est pas une confirmation.

## Contrôles et arrêt

Tester la formule pondérée, égalités, Long/Short, volumes, séance/DST/contrat,
trous, absence de fuite future et replay des admissions. Épingler les modules
et le protocole dans un commit local avant le premier calcul historique.
Reproduire exactement les trades, jours et statuts de la référence Jeu 17.
Comparer les préfixes de signaux/VWAP et de comptes ; recalculer séparément le
VWAP de chaque trade admis depuis ses bougies déjà clôturées.

Archiver le bilan et les détails sous `jeu18/vwap-v1/` dans TRADING_DATASETS,
avec empreintes et relecture exacte. Préparer localement le rapport et le Lab,
sans publication au dépôt GitHub public tant que l’accord explicite demandé
après le refus automatique n’a pas été donné. Les Jeux 17 et 18 restent privés.
Préserver anciennes archives, comptes, main, autres sites et tâches MNQ.
Aucun achat, flux live, Paper Bot, Shadow, broker ou ordre activé.
Arrêter après cette comparaison ; ne pas tester d’autre ancrage, pente, bande
ou seuil après résultat pour obtenir un gain.

## Source de la notion, pas preuve de rentabilité

[TradingView — définition et calcul du VWAP](https://www.tradingview.com/support/solutions/43000502018-volume-weighted-average-price-vwap/)
décrit la pondération par volume, HLC3 et les ancrages. Notre choix d’ancrage
cash 09:30 et notre filtre sont des hypothèses de recherche, pas une stratégie
validée par TradingView. La page a été consultée le 9 septembre 2026.
