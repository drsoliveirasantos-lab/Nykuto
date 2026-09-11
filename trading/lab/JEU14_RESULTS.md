# Jeu 14 — bilan historique élargi, 9 septembre 2026 UTC

La candidate Pullback 30 min, Full session, Long + Short est inchangée.
Les calculs portent sur **234 trades simulés sur les prix de 330 séances**,
du 9 avril 2025 au 4 septembre 2026 : +10,8921 R net, +7,2168 R avec
coûts doublés. Il ne manque plus d'effectif global pour examiner ses défauts.
Il s'agit de positions simulées sur prix historiques, sans ordre envoyé.

## Résultat et limites observées

| Ensemble évalué | Trades | Net | Coûts doublés | Drawdown normal |
| --- | ---: | ---: | ---: | ---: |
| 2025, couverture partielle | 120 | +2,8585 R | +0,6474 R | 9,7384 R |
| 2026, couverture partielle | 114 | +8,0336 R | +6,5694 R | 9,0558 R |
| Total des séances évaluées | 234 | +10,8921 R | +7,2168 R | 9,7384 R |

Win rate global : 114/234, soit 48,72 %. Profit factor : 1,136155,
ou 1,088108 avec coûts doublés. Le drawdown global dépasse la limite de 8 R.
Ces sommes sur des blocs discontinus ne sont pas un rendement de compte.

La confirmation principale était fixée sur trois fenêtres de 2025, hors
sélection du Pullback sur 2026. Ces dates avaient été utilisées avec une autre
stratégie ; elles ne sont donc pas entièrement vierges de recherche.

| Fenêtre | Séances évaluées/prévues | Trades | Net | Coûts doublés |
| --- | ---: | ---: | ---: | ---: |
| Juillet–août 2025 | 43/43 | 26 | −4,8949 R | −5,4845 R |
| Septembre–octobre 2025 | 40/44 | 29 | +4,3282 R | +3,7483 R |
| Novembre–décembre 2025 | 41/41 | 28 | +4,6169 R | +4,1432 R |
| Total partiel du contrôle | 124/128 | 83 | +4,0502 R | +2,4071 R |

Chaque fenêtre dépasse 12 trades. Le contrôle échoue néanmoins : juillet–août
est négatif, et quatre séances de septembre servent à terminer la préparation
après les trous du contrat suivant. Ne pas remplacer ces fenêtres par des mois
plus favorables. **Verdict : non confirmé.**

## Robustesse descriptive

Sur le contrôle 2025, retirer les cinq meilleurs trades laisse −3,3699 R.
Un bootstrap de semaines (10 000 tirages, graine 14092026, 27 semaines
observées) donne un intervalle indicatif à 95 % de −0,04565 à +0,11959 R/jour.
Il traverse zéro ; ces rééchantillonnages ne sont pas de nouveaux trades et
ne corrigent pas tous les effets de sélection ou les trous de couverture.

Sur l'ensemble évalué, les positions Long contribuent +16,4416 R (113 trades)
et les Shorts −5,5496 R (121 trades). Ces contributions ne sont pas un backtest
Long only : supprimer les Shorts pourrait modifier les pauses et les entrées.
Après retrait des cinq meilleurs trades du total, il reste +3,4350 R.

Les 19 lignes mensuelles et les huit fenêtres de deux mois sont conservées
dans `jeu14-report.json`. Les tableaux regroupent les mêmes 234 trades ;
ils ne multiplient pas l'effectif. Juin 2025 reproduit exactement les huit
trades et les deux résultats du contrôle précédent.

## Données, intégrité et reproduction

La recherche des horaires MNQ/XCME de mai 2019 à mars 2025 retrouve des séances
complètes seulement à partir du 17 mars 2025. Six contrats successifs et
40 418 bougies 5 min ont été examinés, préparation comprise. Les 372 séances
cash de la période accessible se répartissent en 330 évaluées, 40 de préparation
et deux avec prix incomplets : 6 mars et 8 septembre 2026. Les trous de contrats
encore peu échangés pendant leur préparation sont également conservés et listés.

Les blocs complets maximaux sont fixés par la qualité des données, avant PnL.
Après un trou, au moins 220 bougies 30 min préparent à nouveau les indicateurs.
Les jours de préparation d'un contrat futur ne retirent pas les jours valides
du contrat alors utilisé. Aucun prix plat inventé, jour perdant retiré ou
paramètre modifié après calcul. Les rollovers suivent le calendrier CME.

Snapshot privé : `jeu14/available-history-v1.json`, 2 426 693 octets,
SHA256 `028e914bb10ea38b73b6fcbc867c5d81937b967701448913fc88ca85746557cf`.
Captures CSV des prix, des six contrats et des horaires sous `jeu14/raw/`.
Les 16 nouvelles archives privées ont été vérifiées par relecture exacte.
`prepare-trading-jeu14.mjs DOSSIER_PRIVE` prépare le snapshot ; conserver
ses octets originaux pour le contrôle d'empreinte. Puis exécuter
`run-trading-jeu14.mjs DOSSIER_PRIVE` avec la source épinglée.

Audit : 437 préfixes de signaux, 660 comparaisons de simulations arrêtées,
468 positions auditées en comptant normal et stress. Vérifications des coûts,
ticks, sens, horaires, clôtures, daily brakes et absence de chevauchement.
Le bilan expose uniquement les agrégats ; aucun prix ni historique membre
n'est publié dans Git.

Validation locale : 95 tests de trading réussis, build réussi, hygiène sans
anomalie et 25 Functions valides. Les 216 anciens identifiants HTML sont
préservés parmi 237 identifiants uniques. Syntaxe, liens et totaux vérifiés ;
le rapport publié correspond exactement au rapport privé. Les huit trades du
contrôle de juin 2025 et les 88 trades des périodes de développement reproduisent
exactement les anciens trades, dans les deux scénarios de coûts.

La programmation Pullback ajoutée au jeu précédent a été désactivée à la
demande de Diego. Aucune nouvelle tâche future, achat, broker, compte ou ordre.
Les deux tâches MNQ préexistantes n'ont pas été modifiées. Aucun nouveau test
visuel navigateur ou test d'exécution Paper Trading n'a été effectué.
