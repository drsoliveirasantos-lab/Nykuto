# Jeu 28 — une perte évitée sur MNQ, mais aucun marché qualifié

Le 9 septembre 2026, le bot a testé une seule nouvelle règle : après une
clôture à +1R brut, déplacer le stop au prix d'entrée augmenté des coûts
arrondis au tick. Le déplacement prend effet à la bougie suivante. Les mêmes
entrées Jeu 23 fixed150 sont conservées ; les réentrées Jeu 27 ne sont pas
cumulées. Ce résultat est du développement historique, pas du trading réel.

## Résultats — janvier à avril 2026

| Marché | Trades normaux | Gagnants | Net normal USD | Trades stress | Net stress USD | DD normal USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 36 | 55,6 % | +931,50 | 36 | +761,50 | 325,00 |
| MES | 28 | 39,3 % | −247,50 | 19 | −277,50 | 471,25 |
| MYM | 37 | 35,1 % | −213,00 | 20 | −276,00 | 292,00 |
| MGC | 32 | 34,4 % | −700,00 | 30 | −672,00 | 912,50 |

Net après les coûts prévus, sur les seules séances évaluables. Les coûts
doublés participent aussi à l'admission et peuvent modifier le nombre de
trades. Les quatre simulations ne forment pas un portefeuille à additionner.

| Marché | Janvier–février : trades / net USD | Mars–avril : trades / net USD |
| --- | ---: | ---: |
| MNQ | 18 / +592,00 | 18 / +339,50 |
| MES | 15 / −15,00 | 13 / −232,50 |
| MYM | 18 / −151,50 | 19 / −61,50 |
| MGC | 18 / −756,00 | 14 / +56,00 |

MNQ totalise +13,018R, profit factor en R de 1,821 et drawdown réalisé de
3,194R. MGC mars–avril gagne 56 USD mais perd 0,424R : la différence vient
des risques initiaux variables, d'où l'exigence de positivité dans les deux
unités. Le risque R ne diminue pas artificiellement après déplacement du stop.

## Effet exact sur les entrées du témoin

| Marché | Net Jeu 23 USD | Stops déplacés | Sorties de protection | Entrées améliorées / dégradées | Écart net USD |
| --- | ---: | ---: | ---: | ---: | ---: |
| MNQ | +887,50 | 6 | 1 | 1 / 0 | +44,00 |
| MES | −206,25 | 6 | 1 | 0 / 1 | −41,25 |
| MYM | −288,50 | 8 | 2 | 2 / 0 | +75,50 |
| MGC | −370,00 | 4 | 3 | 0 / 3 | −330,00 |

À chaque coût, toutes les entrées sont appariées au témoin ; aucune n'est
ajoutée ou retirée. Seules certaines sorties changent. Un stop déplacé mais
jamais déclenché ne suffit pas à modifier le résultat.

- MNQ : une perte de 44 USD devient zéro. Les 35 autres résultats sont
  identiques. Le drawdown passe de 369 à 325 USD. Avec coûts doublés, cette
  même différence vaut +47,50 USD, de +714 à +761,50 USD. L'amélioration
  observée repose donc sur un seul trade, pas sur six gains supplémentaires.
- MES : une sortie à zéro remplace un gain de 41,25 USD. En stress, aucun
  résultat n'est modifié.
- MYM : deux pertes totalisant 75,50 USD deviennent zéro ; le marché reste
  négatif. L'amélioration stress vaut 82,50 USD.
- MGC : trois sorties à +0,50 USD remplacent des gains totalisant 331,50 USD,
  soit 330 USD de moins. Ces trois très petits gains restent classés gagnants
  dans le taux de réussite brut. En stress, trois sorties à zéro retirent
  318 USD au témoin. Le winrate ne mesure pas le montant gagné.

Aucun seuil n'a été modifié après observation. Le Jeu 27 utilisait une autre
règle d'admission ; l'écart entre Jeux 27 et 28 n'est pas attribuable au seul
déplacement du stop. La comparaison contrôlée est ici celle au Jeu 23.

## Journées — coûts normaux

| Marché | Observées | Positives | Négatives | Actives à zéro | Sans trade | Moyenne USD / séance | Pire séance USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 81 | 20 | 15 | 1 | 45 | +11,50 | −149,50 |
| MES | 81 | 11 | 15 | 1 | 54 | −3,06 | −137,50 |
| MYM | 82 | 13 | 22 | 2 | 45 | −2,60 | −100,00 |
| MGC | 80 | 11 | 20 | 0 | 49 | −8,75 | −220,00 |

Les jours observés sans trade entrent dans la moyenne. Les jours absents
n'y entrent pas ; ils ne sont pas remplacés par zéro. Ces moyennes ne sont
pas des revenus quotidiens attendus ou garantis.

## Verdict et analyses à privilégier

MNQ satisfait cinq critères sur huit, mais reste à 36 trades au lieu de 40,
avec une séance absente qui bloque couverture et qualification du compte.
MES, MYM et MGC restent négatifs et sous 40 trades. MYM dépasse aussi 8R de
drawdown (10,417R), MGC 12,571R. Les absences restent le 6 mars sur MNQ/MES/MGC
et le 25 février sur MGC. Tous les échecs figurent dans le rapport JSON.

La priorité méthodologique est de documenter plus d'observations fiables avant
de conclure sur MNQ : son bénéfice incrémental n'a qu'un exemple favorable.
Le rapprochement des mêmes entrées, les montants moyens et extrêmes, la
stabilité entre périodes et les coûts sont plus informatifs qu'un winrate
isolé. Les filtres tendance/structure/volume/dynamique déjà étudiés restent
documentés dans les Jeux 24–25 ; ce jeu n'apporte pas de nouvelle preuve en
leur faveur. Carnet d'ordres, flux acheteur/vendeur et annonces économiques
exigent des données historiques propres, horodatées, qui ne sont pas
reconstruites depuis les seules bougies OHLCV.

Les sources et limites de cette décision sont dans [le protocole](JEU28_PROTOCOL.md),
notamment les explications CME sur l'exécution des stops et le travail de
Bailey et al. sur le surajustement des backtests. Le seuil 1R reste une
hypothèse, pas une recommandation de rentabilité démontrée.

Aucune candidate sélectionnée, réserve mai–août non calculée. Le registre
conserve 65 configurations des Jeux 19–28, aucune confirmation indépendante.
Collectes prospectives inchangées ; Paper, Shadow, broker et réel désactivés.

## Reproductibilité

32 dépendances et huit tests synthétiques figés avant performances,
commit public `76915b149189307a9f75e2e812ec7b82fbaafcff`.
SHA-256 du gel : `1b7e6df2a381d4b6b2f8908ed53c20bc9eb8dba97417a09438fe0245a097c6af`.
Sélection nulle : `7a62b255d62fccd5a38155b32f632afe6dbd16a0bc165efe92baa7a87219ab90`.
Audit réussi : 37 362 préfixes de signaux, 320 préfixes de comptes,
593 trades incluant replays/comparaisons, 32 paires de témoins archivés.
Ces vérifications ne sont pas de nouvelles observations indépendantes.
Les agrégats publics sont vérifiés par SHA-256 ; les détails restent dans
[l'archive privée](JEU28_ARCHIVE.md).

Validation locale : 221 tests trading réussis, zéro alerte d'hygiène,
25 modules Pages Functions validés et build réussi. Les 425 anciens IDs
sont préservés parmi 436 IDs uniques ; structure et liens locaux vérifiés.
Le rapport et les deux vues de coûts sont testés avec un DOM simulé, y compris
le refus d'afficher un rapport corrompu. Aucun test visuel dans un navigateur.
Les trois parties privées et le manifeste ont été relus à l'identique ;
la restauration retrouve les trois fichiers et leurs SHA-256 originaux.
