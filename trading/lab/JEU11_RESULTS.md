# Jeu 11 — résultats du 9 septembre 2026 UTC

Le [protocole](JEU11_PROTOCOL.md) et `jeu11-policy.mjs` ont été enregistrés
dans le commit local `4e91c94` avant la récupération des prix et le premier
calcul. Le snapshot a ensuite été figé après vérification de sa complétude,
avant l'examen des performances. Aucun paramètre de stratégie n'a été changé.

## Données et reproduction

MNQM5, du 17 mars au 30 mai 2025 : 53 séances, 1 378 bougies cash de 15 min.
Préparation : 286 bougies sur 11 séances ; évaluation avril–mai : 42 séances.
Prix et horaires couvrent toutes les séances attendues, sans interpolation.
161 événements de calendrier uniques ; les doublons strictement identiques
de la source ne gonflent pas la couverture. Contrat, expiration, ticks,
pagination et jours NYSE vérifiés.

Snapshot privé : `jeu11/mnqm5-apr-may-2025-v1.json`, 133 650 octets,
SHA-256 `5a1dff50a8dd510c8e680c0bd0b5bf95bbfc3176c8122933138a29ea8f8f7c6f`.
Les captures CSV prix/horaires/contrat sont archivées sous `jeu11/raw/`, avec
leur SHA-256 dans le nom. Les quatre écritures ont été relues et comparées
octet pour octet via la connexion Cloudflare. Aucun cours brut dans Git.

Reproduction : placer le snapshot exact dans `dataset.json` dans un dossier
privé extérieur au dépôt, puis exécuter :

```sh
node scripts/run-trading-jeu11.mjs /chemin/vers/captures-privees
```

Le script exige l'empreinte publiée ; il produit `result-private.json` avec
les trades et `report.json` sans prix individuels. Le second est la source de
`jeu11-report.json`, affiché dans le Lab. Ne pas relancer le convertisseur pour
reproduire l'empreinte : `capturedAt` décrit la capture originale.

## Huit variantes, seize simulations

| Version | Trades | Net à 3,50 $ | Net à 7 $ | Profit factor | Drawdown réalisé |
| --- | ---: | ---: | ---: | ---: | ---: |
| Référence | 13 | −4,4344 R | −4,6627 R | 0,4547 | 4,6076 R |
| Trend 1 h | 6 | −0,5325 R | −0,6374 R | 0,8062 | 1,3091 R |
| Engulfing | 0 | 0 R | 0 R | — | 0 R |
| Volume | 10 | −4,4622 R | −4,6278 R | 0,3317 | 4,4622 R |
| Events | 12 | −3,4281 R | −3,6500 R | 0,5189 | 4,0788 R |
| Quatre filtres | 0 | 0 R | 0 R | — | 0 R |
| Long only | 7 | +0,9514 R | +0,8316 R | 1,3465 | 1,3091 R |
| Short only | 6 | −5,3858 R | −5,4943 R | 0 | 5,3858 R |

Aucune variante n'est confirmée. Long only reste un petit échantillon,
inférieur aux 12 trades exigés par fenêtre. Le filtre Volume, favorable sur
les six mois 2026 du Jeu 10, ne résiste pas à cette autre période. Il n'est
pas sélectionné ni optimisé à nouveau pour masquer ce résultat. Les coûts
sont hypothétiques ; aucun résultat n'est un rendement de compte.

Cette fenêtre rétrospective est distincte des périodes MNQ évaluées dans les
jeux précédents. Elle ne remplace pas trois fenêtres indépendantes et une
validation prospective. Les calendriers BLS/Fed consultés aujourd'hui ne sont
pas un journal des informations disponibles à chaque instant en 2025.

## Contrôles effectivement exécutés

- 1 378 préfixes : EMA, ATR, ADX, contexte 1 h, Engulfing, Volume et Events
  concordent avec le calcul sans les bougies futures.
- 672 comparaisons : 42 fins de séance × 8 variantes × 2 coûts ; mêmes trades
  clôturés dans le préfixe et le calcul complet.
- 108 trades audités en additionnant variantes et coûts : horodatage après
  signal, entrée à l'open, direction, filtre, tick, stop/target, coûts, P&L,
  une position et freins quotidiens. Ces 108 trades ne sont pas indépendants.
- Jeu 10 relancé sur son snapshot vérifié : huit résultats précédents reproduits.
- 85 tests logiciels, build, hygiène sans anomalie, 25 Pages Functions,
  syntaxe, références HTML/JS et identité du rapport exporté réussis.

Aucun contrôle visuel dans un navigateur, aucun broker ni compte réel testé.
Les tests du logiciel ne prouvent pas une rentabilité.

## Suite sans intervention manuelle

Les deux tâches existantes restent actives et inchangées : collecte après
séance à partir du 10 septembre 2026 (préparation septembre, test octobre–
novembre), puis audit et campagne le 3 décembre. Une collecte manquante ou
tardive restera signalée. Cette campagne ne lance aucune optimisation infinie.
Le Paper Trading automatisé en direct, ses données et son adaptateur restent
à développer ; Paper Bot et Shadow sont OFF. Aucun achat ni ordre effectué.
