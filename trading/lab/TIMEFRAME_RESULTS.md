# Jeux 12–13 — bilan du 9 septembre 2026 UTC

Deux phases de développement historique, 54 configurations au total. La phase
Pullback a été formulée après la grille EMA Cross, pas avant toute connaissance
des résultats. Le contrôle séparé n'a été calculé qu'après la sélection fixe.
Voir `JEU12_PROTOCOL.md`, `JEU13_PROTOCOL.md`, `JEU13_AVAILABILITY.md`.

## Résultat

Aucune configuration EMA Cross ne passe tous les critères. Les variantes
Morning15min (+7,7073R,35trades) et Morning30min (+6,6900R,24trades) restent
insuffisantes en nombre d'observations. Elles ne sont pas sélectionnées comme
si l'échantillon était suffisant.

Deux Pullback passent les six critères2026 :5min Morning Short (100trades,
+9,1320R) et30min Full Both (88trades,+9,8188R). La règle maximin des
expectancies par fenêtre, fixée avant calcul, sélectionne **30min Full Both**.

| Période | Trades | Net | Coûts doublés |
| --- | ---: | ---: | ---: |
| Janvier–février 2026 | 28 | +1,0419 R | +0,6321 R |
| Avril–mai 2026 | 28 | +3,8502 R | +3,4571 R |
| Juillet–août 2026 | 32 | +4,9267 R | +4,5301 R |
| Ensemble2026 |88|+9,8188R|+8,6193R|
| Contrôle juin2025 |8|+2,6092R|+2,4522R|

2026 : PF1,391723 ; drawdown5,478730R. Les trois fenêtres sont positives,
28/28/32trades. Juin2025 : PF7,277829, drawdown0,369863R, mais **8trades
sur12requis** : contrôle non confirmé. Un profit factor élevé sur huit
observations n'est pas une preuve de rentabilité. Aucun second candidat
n'a été testé après ce résultat. Tous les54essais figurent dans les JSON
de rapport et sont consultables dans le Lab.

## Données

Grille :14 238bougies5min sur183séances avec préparation,123évaluées.
Les4746regroupements15min sont identiques (OHLCV) au snapshot épinglé duJeu09.
Préparations30min :280,221,273bougies. Chaque timeframe satisfait220bougies.

Snapshot :713569octets,
SHA256 `2848c0a5826be842d6b8372f5e8645550af682cf1f709ef3254ee949acaa18b0`,
clé privée `jeu12/mnq-five-minute-2026-v1.json`.

Contrôle :20séances évaluées,10 par contratMNQM5/MNQU5. Préparations séparées
273/221bougies30min. L'essai initial à seulMNQU5 avait dix absences en mai ;
les captures restent conservées. Rollover16juin déclaré avant performance,
dates évaluées inchangées. Aucun trou après l'amendement.
Snapshot :273053octets,
SHA256 `f0342a12c0f96e61d2092a0fcccb0a8ac7dab0f35cbfae7ef8c1b4b45421e50c`,
clé privée `jeu13/june-2025-control-v1.json`.

Les CSV d'extraction cash et leurs empreintes sont conservés en stockage privé,
ainsi que les horaires de contrôle. Les snapshots de référence15min restent
inchangés. `jeu12-report.json` et `jeu13-report.json` sont les résumés générés
officiels, sans cours ni trades individuels. Aucun prix brut dans Git.

## Reproduction et audits

Préparer les captures privées via `prepare-trading-jeu12.mjs`, puis conserver
le snapshot épinglé (ne pas refaire `capturedAt` pour vérifier son empreinte).
Exécuter `run-trading-jeu12.mjs DOSSIER_PRIVE REFERENCE_JEU09 cross` ou
`pullback`. Les fichiers des deux familles ont des noms distincts.
Le contrôle utilise `prepare-trading-jeu13-control.mjs` puis
`run-trading-jeu13-control.mjs DOSSIER_CONTROLE RAPPORT_SELECTION_PULLBACK`.
Il vérifie la candidate sélectionnée avant tout calcul.
Le rapport de sélection antérieur au contrôle est conservé sous
`jeu13/selection-before-control-v1.json`. Les CSV sont sous `jeu12/raw/`
et `jeu13/raw/` ; les dix archives ont été vérifiées par relecture exacte.

Par grille :549préfixes de signaux et6642comparaisons de simulations arrêtées
en fin de séance. Trade audits :1762pour EMA Cross et4648pour Pullback,
en comptant variantes/coûts ; pas des observations indépendantes.
Contrôle :58préfixes et40comparaisons. Le moteur15min Full Both reproduit
exactement les métriques duJeu09 malgré l'exécution plus précise5min.

Les nouveaux tests vérifient agrégation/horaires, absence de bougie partielle,
causalité, symétrie, stop prioritaire, frontières des plages, clôture normale
et anticipée, freins après pertes, coûts doublés et sélection préétablie.
Pas de contrôle visuel navigateur ni d'essai de compte/broker réel.
Validation locale finale : 93 tests de trading réussis, build réussi, hygiène
sans anomalie, 25 Functions valides, syntaxe JavaScript et références vérifiées.
Les 198 anciens identifiants HTML sont préservés parmi 216 identifiants uniques.
Les deux rapports publiés correspondent exactement aux résultats privés ;
la sélection 2026 n'a pas changé après le contrôle de juin 2025.

## Suite

Mise à jour du 9 septembre 2026 : le suivi futur ci-dessous a été désactivé
à la demande de Diego. Voir `JEU14_RESULTS.md` pour le test immédiatement
réalisé sur 234 trades et 330 séances de l'historique disponible.

La piste est positive mais le contrôle séparé manque encore de trades.
`PULLBACK_FORWARD_PROTOCOL.md` fige la prochaine confrontation sur les séances
du2octobre au30novembre2026. Elle ne modifie pas les deux tâches MNQ existantes.
La recherche s'arrête ici sur ces données : pas de troisième famille essayée
pour finir sur un résultat favorable, pas de bot activé ni de garantie.
