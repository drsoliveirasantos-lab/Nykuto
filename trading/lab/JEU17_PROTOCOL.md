# Jeu 17 — séparer stop et filtre de marge

Défini le 9 septembre 2026 avant le premier calcul de ce jeu. Le Jeu 16
changeait deux facteurs ensemble. Cette comparaison factorielle 2 × 2 ajoute
uniquement les deux combinaisons manquantes, sans réglage après résultat.
Historique déjà examiné : développement adaptatif, aucune confirmation indépendante.

| Identifiant | Stop | Filtre de marge nette ≥1 |
| --- | --- | --- |
| atr5 | ATR14 ×1,25 | Non (référence Jeu 16) |
| atrNet5 | ATR14 ×1,25 | Oui |
| pivotOnly5 | Pivot confirmé +1 tick | Non |
| pivot5 | Pivot confirmé +1 tick | Oui (variante Jeu 16) |

Les signaux Pullback 5 min, tendance clôturée 30 min, ADX, pivots stricts
2 gauche/2 droite, invalidation, entrée à l’open suivant, target 1,5 fois le
risque arrondie au tick et freins restent ceux des Jeux 15–16. Le filtre compare
(gain à target − coûts) / (perte au stop + coûts) à 1, avant entrée, aux coûts
hypothétiques de 3,50 $ puis 7 $ par aller-retour. Il s’applique avant le budget
pour les deux stops. Sans filtre, un risque trop élevé est toujours refusé.

Un MNQ, une position, risque prévu stop + coûts ≤50 $, budget de perte
100 $/séance, réserve MLL 100 $, trois entrées maximum, pause après deux pertes
consécutives ou −2R réalisés. Mécanique d’évaluation LucidFlex 25K gelée au
Jeu 15 : floor EOD, pertes latentes, arrêt au breach ou objectif/consistency,
aucun reset interne. Les règles de la firme et frais réels ne sont pas actualisés
par ce diagnostic. Aucun ajustement de quantité, heure, direction ou target.

Source Jeu 14 exacte : SHA256
`028e914bb10ea38b73b6fcbc867c5d81937b967701448913fc88ca85746557cf`.
330 séances évaluables, cinq fenêtres complètes, trois bloquées. Même
préparation, même calendrier, mêmes interruptions. Les diagnostics sans arrêt
à l’objectif ne sont pas un compte continu. Les évaluations et coûts réutilisent
ces observations. Aucune interpolation ni nouvelle sélection de période.

Critères conservés : ≥40 trades, ≥12 dans chaque fenêtre complète, chaque
fenêtre positive en R, PF en R ≥1,10 sans arrondi, drawdown réalisé ≤8R,
total stress positif, aucun breach aux deux coûts. Tous les échecs sont publiés.
Même une combinaison favorable reste non confirmée ; aucune sélection automatique.

Présenter les quatre résultats brut/coûts/net, activité journalière, PF en R et
dollars, drawdown, refus et comptes. Publier les quatre contrastes appariés
au niveau des simulations : marge avec ATR, marge avec pivot, stop sans marge,
stop avec marge. Différence = résultat de la seconde politique moins la première.
Les entrées, pauses et sorties sont entièrement rejouées : ce n’est pas l’effet
isolé sur un ensemble fixe de trades. Aucun effet causal généralisable aux futurs
marchés n’est revendiqué. Pas de classement d’heures ou de directions.

Vérifier avant performance les limites du ratio net, les deux directions, les
gaps et confirmations futures, le budget et les ambiguïtés. Les deux cellules
anciennes doivent reproduire exactement les trades, jours et statuts du Jeu 16.
Auditer les préfixes de signaux/pivots et de comptes, les coûts et chaque pivot.
Épingler les dépendances et conserver un commit local avant le premier calcul.

Archiver les nouveaux détails sous `jeu17/ablation-v1/` dans TRADING_DATASETS,
avec empreintes et relecture exacte. Seuls les agrégats vont dans Git et le Lab
de `feat/trading-hq-v1` / PR83. Préserver les anciennes archives et liens, main,
les autres sites, comptes membres et tâches MNQ. Aucun achat, flux live, broker,
ordre, Paper Bot ou Shadow activé. Arrêter après cette comparaison et son bilan,
sans enchaîner des variantes jusqu’à obtenir un gain.
