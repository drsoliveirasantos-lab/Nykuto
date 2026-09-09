# Jeu 29 — résultat du compte commun

Le portefeuille de recherche produit **+492,75 USD nets sur 100 trades**, mais
reste **non qualifié** : cinq des huit critères échouent. Le total positif
cache une deuxième période perdante et un drawdown trop élevé en R.
Ce n'est pas un résultat de compte Lucid validé ni une confirmation indépendante.

## Résultats mesurés

Janvier–avril 2026, 80 séances communes complètes sur 82 prévues. Une seule
position, deux entrées quotidiennes au total, un microcontrat, plafond 150 USD
frais compris et enveloppe quotidienne 300 USD. Les quatre profils et la
priorité alphabétique ont été fixés avant ce calcul.

| Mesure | Coûts initiaux | Coûts doublés |
| --- | ---: | ---: |
| Trades | 100 | 77 |
| Net USD | +492,75 | +591,75 |
| Coûts cumulés USD | 403,00 | 622,00 |
| Trades positifs | 44,00 % | 45,45 % |
| Profit factor en R | 1,060 | 1,071 |
| Net R | +3,494 | +3,163 |
| Drawdown réalisé USD | 657,75 | 676,50 |
| Drawdown réalisé R | 13,051 | 10,296 |
| Moyenne par séance observée USD | +6,16 | +7,40 |
| Pire séance USD | −237,50 | −246,00 |
| Séances positives | 32 | 29 |
| Séances négatives | 36 | 31 |
| Séances actives à zéro | 2 | 2 |
| Séances sans trade | 10 | 18 |

Le gain supérieur avec coûts doublés ne signifie pas qu'un coût élevé est
bénéfique. Les admissions et les trades suivants changent : 77 trades contre
100, et des compositions par marché différentes. Le stress reste une
sensibilité du même modèle, pas une stratégie supplémentaire ou une garantie.

## Contributions au même compte

| Marché | Piste fixée | Trades normaux | Net normal USD | Trades stress | Net stress USD |
| --- | --- | ---: | ---: | ---: | ---: |
| MES | Référence Jeu 23 | 22 | −303,75 | 15 | −273,75 |
| MGC | Cassure échouée Jeu 26 | 20 | +208,00 | 19 | +364,00 |
| MNQ | Protection Jeu 28 | 26 | +724,50 | 27 | +800,00 |
| MYM | Protection Jeu 28 | 32 | −136,00 | 16 | −298,50 |
| Total | Compte commun | 100 | +492,75 | 77 | +591,75 |

Ces contributions appartiennent à un seul replay : leur somme égale le net
du portefeuille. Elles diffèrent des anciens bilans séparés, car les budgets,
l'occupation du compte, les priorités et les séances observées diffèrent.
Ne pas comparer leur somme avec les anciens totaux comme si les conditions
étaient identiques. Retirer MES ou MYM modifierait aussi les trades admis sur
MNQ/MGC : le résultat d'un sous-portefeuille ne se déduit pas par soustraction.
Aucun sous-portefeuille ni ordre de priorité alternatif n'a été testé ici.

## Régularité temporelle et données manquantes

| Fenêtre | Séances | Net normal USD | Net stress USD | Compte 25K |
| --- | ---: | ---: | ---: | --- |
| Janvier–février | 38/39 | +682,75 | +826,50 | Non évaluable |
| Mars–avril | 42/43 | −190,00 | −234,75 | Non évaluable |

Deux séances ont été exclues pour tous les marchés : 25 février (MGC absent)
et 6 mars (MES, MGC et MNQ absents). MYM est disponible ces jours-là, mais le
protocole interdit de compléter le portefeuille avec les seuls marchés connus.
Ces jours ne deviennent pas des jours « sans trade » ou des résultats nuls.
La complétude est connue après coup : ce sous-ensemble ne simule pas un filtre
de disponibilité causal en direct. Aucun replay de compte complet n'a donc
été évalué. Les diagnostics ignorent le seuil et l'objectif du compte ;
les budgets, stops et freins quotidiens restent communs.

## Concurrence des signaux

232 candidats sur les mêmes séances aux deux coûts. Chaque candidat reçoit
exactement une admission ou un refus ; un refus n'est pas une perte évitée.

| Décision ou motif | Initial | Doublé |
| --- | ---: | ---: |
| Admis | 100 | 77 |
| Compte déjà occupé | 42 | 38 |
| Autre candidat simultané admis | 7 | 7 |
| Deux entrées déjà utilisées | 24 | 14 |
| Gain potentiel net insuffisant | 19 | 57 |
| Sens déjà utilisé sur ce marché | 20 | 14 |
| Risque initial supérieur au plafond | 20 | 25 |
| Total | 232 | 232 |

Les règles utilisent l'état au début de chaque bougie. Elles ne profitent
pas rétroactivement d'une sortie intrabougie pour entrer à l'open d'un autre
marché. Le premier candidat admissible dans l'ordre MES/MGC/MNQ/MYM gagne
la place ; cet ordre n'a pas été optimisé sur les résultats.

## Verdict et suite utile

Réussis : nombre total de trades, nombre par fenêtre, total stress positif.
Échoués : couverture, positivité de chaque fenêtre, PF R minimum 1,10,
drawdown maximal 8R et évaluation des comptes complets. Les 32 séances
positives contre 36 négatives aux coûts initiaux ne permettent pas de
présenter ce système comme une source de gains quotidiens réguliers.

L'amélioration apportée est une mesure fidèle des interactions entre marchés
et un moteur de recherche qui impose les limites au compte entier. La
rentabilité n'est pas améliorée de façon démontrée. La prochaine hypothèse
devra traiter les profils perdants et la dégradation de mars–avril, avec de
nouvelles règles gelées avant calcul ; elle ne doit pas simplement additionner
les gagnants ou effacer les essais défavorables.

Le registre conserve les 65 entrées précédentes et ajoute une configuration
commune, soit 66. Réserve mai–août non ouverte, aucune sélection exécutable,
zéro confirmation indépendante. Les quatre menus de recherche restent
disponibles avec leurs rapports antérieurs.

## Reproductibilité

- Gel local avant performance : commit `1d1c72df33c628a905beed3bf9e97545b8af298a`.
- 37 fichiers de protocole, source, moteur, tests, runner et dépendances gelés.
- Gel SHA-256 : `a4092388b447c49b2a381c6d60e71b630616cf8a7e33929ea25d34f2f2bacb8e`.
- Rapport : 20 284 octets, SHA-256 `0ffe68a1563e1d385afab728726a22e2c8f22db39b8c95262fd1bcdf160709dc`.
- Audit réussi : 24 960 préfixes de signaux, 320 préfixes de replays par séance,
  354 vérifications de trades à travers les périodes et coûts. Les 354 ne sont
  pas des trades indépendants : les fenêtres recoupent le diagnostic continu.
- Douze tests synthétiques du moteur avant résultat ; trois tests supplémentaires
  du rapport et de l'interface DOM. Aucune vérification visuelle de navigateur.
- Sources privées inchangées ; archive décrite dans [JEU29_ARCHIVE.md](JEU29_ARCHIVE.md).

Commande de reproduction, avec deux dossiers privés et un dossier de sortie neuf :

```bash
node scripts/run-trading-jeu29.mjs /chemin/prive/sources /chemin/prive/jeu29-neuf
```

Le runner refuse les résultats existants, les dépendances modifiées et les
dates de réserve. Les menus du Lab lisent le rapport vérifié ; ils ne relancent
pas de nouvelles configurations. La PR apporte cette étude sans fusion ni
activation de Paper, Shadow, broker ou réel.

Validation locale finale : 248 tests trading réussis, zéro échec ; compilation
et 25 modules Functions vérifiés, hygiène sans erreur ni avertissement. Les
478 anciens IDs HTML restent présents parmi 492 IDs uniques. Structure et
liens locaux vérifiés. Les 104 chemins de dépendances gelées précédentes et
les 65 anciennes entrées du registre sont inchangés.
