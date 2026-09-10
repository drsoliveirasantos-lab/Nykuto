# Jeu46 — Résultats vérifiés : sorties sur cassures invalidées

Les64 simulations sont terminées en167,861secondes (2min48s). Les32 comptes
témoins entiers reproduisent exactement référence40 et candidateMNQ30. Les
132 dépendances gelées sont intactes ;928 enregistrements de trades et13
sorties structurelles ont été rapprochés indépendamment avec les prix natifs.
Les1312 préfixes de chaque couche compte/filtre/contexte passent dans le calcul.
Aucune simulation supplémentaire lancée pendant la vérification.

## Résultat principal

Les deux variantes améliorent l'ancienne référence40 mais **aucune ne passe
le critère de progression contre les deux témoins**. MES améliore le total
par rapport à MNQ30, tout en dégradant juillet. Ce résultat n'autorise pas à
remplacer la candidate, à combiner les sorties après coup ou à annoncer une
confirmation indépendante. Le protocole original reste inchangé.

164/166 séances, janvier–août2026, huit comptes50K réinitialisés chaque mois.
Février et mars restent partiels. Les sommes ne sont pas un compte continu.

| Profil du portefeuille | Net normal USD | Net stress USD | Moyenne/trade normal | Moyenne/trade stress | Pire DD mensuel normal/stress |
|---|---:|---:|---:|---:|---:|
| Référence40 | 1923,25 | 1154,00 | 15,76 | 10,49 | 730,25 /689,50 |
| Candidate MNQ30 | 2014,25 | 1245,00 | 16,51 | 11,32 | 730,25 /689,50 |
| Invalidation MNQ | 1946,75 | 1177,50 | 15,96 | 10,70 | 730,25 /689,50 |
| Invalidation MES | 2065,75 | 1299,00 | 16,93 | 11,81 | 715,25 /674,50 |

Tous conservent122 trades normaux et110 stress,53/48 gagnants,69/62 perdants.
Trois mois restent négatifs ; aucun objectif4000USD ni retrait simulé atteint.
Le gain moyen des gagnants reste137,83USD normal /125,52USD stress.
Les coûts restent922USD /1275USD. La hausse provient de pertes réduites.

## Pourquoi ces résultats ne constituent pas le progrès exigé

- MNQ : une seule opportunité améliorée, +23,50USD aux deux coûts contre40.
  Le total reste67,50USD inférieur à MNQ30. Mai perd53,50 et juillet37,50USD
  contre MNQ30 à chaque coût : quatre cellules dégradées.
- MES : cinq pertes réduites au normal, six au stress, soit six opportunités
  uniques entre les coûts. Progrès contre40 :142,50USD normal /145USD stress.
  Progrès total contreMNQ30 :51,50 /54USD, soit environ0,42 /0,49USD par trade.
  Mais juillet vaut176USD normal et164USD stress, contre213,50 /201,50 pour
  MNQ30 : deux cellules dégradées. Le critère mensuel fixé avant calcul échoue.
- Aucun gagnant sacrifié, aucun trade supprimé ou ajouté et aucun changement
  de taille entre chaque variante et40 dans ces observations. Cela ne démontre
  pas que la sortie préservera les futurs gagnants ; les tests synthétiques
  conservent explicitement ce cas défavorable.

La perte moyenne MES-variante portefeuille passe de78,00 à75,93USD normale
contre40, et de78,56 à76,23USD stress. Les baisses maximales mensuelles gagnent
15USD. L'effet reste modeste ; la plupart des autres trades sont inchangés.

## Détail mensuel

Les chiffres sont nets, coûts normaux /doublés, en USD.

| Mois | Référence40 | MNQ30 | Invalidation MNQ | Invalidation MES |
|---|---:|---:|---:|---:|
| Janvier | 511,00 / 48,00 | 511,00 / 48,00 | 534,50 / 71,50 | 561,00 / 101,75 |
| Février (partiel) | 663,25 / 616,75 | 663,25 / 616,75 | 663,25 / 616,75 | 679,50 / 633,00 |
| Mars (partiel) | -297,50 / -250,50 | -297,50 / -250,50 | -297,50 / -250,50 | -297,50 / -250,50 |
| Avril | 323,75 / 216,25 | 323,75 / 216,25 | 323,75 / 216,25 | 323,75 / 216,25 |
| Mai | -256,50 / -197,50 | -203,00 / -144,00 | -256,50 / -197,50 | -184,00 / -125,00 |
| Juin | 1048,75 / 785,50 | 1048,75 / 785,50 | 1048,75 / 785,50 | 1048,75 / 785,50 |
| Juillet | 176,00 / 164,00 | 213,50 / 201,50 | 176,00 / 164,00 | 176,00 / 164,00 |
| Août | -245,50 / -228,50 | -245,50 / -228,50 | -245,50 / -228,50 | -241,75 / -226,00 |

## Conservation et limites

[Résumé vérifié](jeu46-summary.json) · [Audit](jeu46-execution-audit.json) ·
[Protocole gelé](JEU46_PROTOCOL.md). Gel initial :700eb159a8398572edd1e2b5d52d464e2ac3672d.
Les deux contrôles GitHub de ce gel sont verts. Le test logiciel348 réussi
ne représente pas348 trades rentables. Aucun nouveau contrôle GitHub attendu
ou surveillé pendant l'enregistrement de ces résultats.

Registre111/catalogue128 : deux configurations ajoutées, préfixes109/126
conservés exactement. Les deux évaluations contre40 passent ; les deux
évaluations contreMNQ30 échouent. `developmentPassed` suit la progression
complète, donc reste faux ; les verdicts intermédiaires sont conservés.
Zéro confirmation indépendante, sélection nulle, aucun déploiement ou ordre.
Aucune combinaison, modification du gel, de la collecteJeu08 ou du3décembre.
Archives complètes privées :Nykuto_Jeu46_resultats_verifies_2026-09-10.zip.
