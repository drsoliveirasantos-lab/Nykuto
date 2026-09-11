# Audit F1 des filtres — moins de filtres, mais toujours aucun bot validé

**Mise à jour de contexte :** les Jeux 27–32 ont été retrouvés sur une autre
branche. Le numéro 27 de cet audit est provisoire et ne remplace pas leur Jeu 27.
Le H1/M5 a déjà été testé au Jeu 32. Pour la décision actuelle et les prochains
tests, lire d’abord la [synthèse consolidée](RESEARCH_SYNTHESIS_2026-09-09.md).
Les résultats et le gel ci-dessous restent inchangés.

Le 9 septembre 2026, douze configurations ont été exécutées après le gel
`64088f436a4c8113b1c310aae906c4dd4c09280c`. Les douze échouent aux critères.
Le registre conserve maintenant 69 configurations des Jeux 19–27, aucune
confirmation indépendante. Les observations se recouvrent ; ne pas additionner
leurs gains ou leurs nombres de trades comme un portefeuille.

## Ce qui mérite d'être conservé

Le retour après cassure sur MNQ reste une piste de développement. Avec le seul
filtre EMA9/21 M5 + côté VWAP, le Jeu 27 conserve +877 dollars contre +887,50
au témoin Jeu 23, et réduit le drawdown réalisé de 369 à 289,50 dollars (−21,5 %).
Aux coûts doublés : +721 contre +714 dollars. Les deux fenêtres restent positives
(+591,50 puis +285,50 dollars aux coûts normaux).

Cette amélioration descriptive n'est pas une validation : 31 trades, seulement
81 séances sur 82, dont 18 positives, 13 négatives et 50 sans trade. Le 6 mars
manque. Les 58,1 % de trades gagnants ne sont pas une probabilité calibrée pour le
prochain signal. +877 dollars correspondent à environ 54 dollars par cinq séances
observées sur ce passé ; l'objectif 1 000 dollars/semaine reste très éloigné.
Le compte complet mars–avril n'est pas évaluable, ce qui ne signifie pas qu'un
franchissement de seuil a été observé.

## Ce qui ne fonctionne pas dans les tests disponibles

- **Toutes les confirmations obligatoires** : Jeu 24, six signaux retenus sur
  209, puis zéro à deux trades par profil. Le filtre est trop rare pour évaluer
  la rentabilité de ce système.
- **Retirer seulement volume ou figure** : Jeu 27, trois à neuf trades par
  profil ; plusieurs totaux restent négatifs et les fenêtres sont instables.
- **Risque gradué suivant le nombre de confirmations** : Jeu 25, seconde fenêtre
  négative sur les quatre marchés. Moins de drawdown ne signifie pas plus de gain.
- **Inverser la logique vers les cassures échouées** : Jeu 26, aucun marché
  qualifié. MGC gagne au total mais perd en mars–avril.
- **Utiliser la tendance seule sur tous les contrats** : Jeu 27, MES −312,50,
  MYM −485,50, MGC −92 dollars. Le résultat MNQ ne se généralise pas.
- **Supposer que H1 améliore toujours les entrées** : ancien Jeu 10, le filtre
  horaire donne −2,825491 R contre +2,097047 R au témoin, sur son propre système
  M15 et ses anciennes fenêtres. Cela ne teste pas exactement la méthode H1/M5
  de l'associé ; cela empêche de la tenir pour acquise.

## Tous les nouveaux résultats

Janvier–avril 2026. Un microcontrat ; plafond 150 dollars frais/friction compris,
stop structurel conservé, cible 1,5R, limite quotidienne interne 300 dollars.
Le plafond n'est pas le risque effectivement pris sur chaque opération.

| Contrat | Variante | Trades normaux | Net normal $ | Net stress $ | Jan.–fév. $ | Mars–avr. $ |
|---|---|---:|---:|---:|---:|---:|
| MNQ | Sans volume | 5 | −21 | −38,50 | +16,50 | −37,50 |
| MNQ | Sans figure | 9 | +295 | +385,50 | +497 | −202 |
| MNQ | Tendance seule | 31 | +877 | +721 | +591,50 | +285,50 |
| MES | Sans volume | 4 | −30 | −68,75 | −22,50 | −7,50 |
| MES | Sans figure | 6 | −238,75 | −305 | −160 | −78,75 |
| MES | Tendance seule | 23 | −312,50 | −320 | −132,50 | −180 |
| MYM | Sans volume | 5 | −25,50 | −10 | +5 | −30,50 |
| MYM | Sans figure | 9 | −140,50 | −114,50 | −52,50 | −88 |
| MYM | Tendance seule | 29 | −485,50 | −489 | −192,50 | −293 |
| MGC | Sans volume | 3 | +93,50 | +80 | +202 | −108,50 |
| MGC | Sans figure | 5 | +95,50 | +73 | −22 | +117,50 |
| MGC | Tendance seule | 20 | −92 | −182 | −330,50 | +238,50 |

Les coûts doublés changent parfois les admissions et donc les trades. Ce n'est
pas un calcul sur une liste d'opérations nécessairement identique. Effectifs
stress, toutes les fenêtres, freins et huit critères : [rapport](jeu27-report.json).
La couverture demeure MNQ/MES 81/82, MYM 82/82, MGC 80/82.

## Juin, juillet, août : pourquoi le MYM archivé échoue

Ces chiffres ventilent les opérations déjà archivées du **Jeu 20**, seule
candidate des Jeux 19–26 ayant passé le développement puis échoué sur la réserve.
Ce ne sont pas les performances estivales du nouveau MNQ Jeu 27.

| Mois 2026 | Trades normaux | Gagnants | Brut $ | Coûts $ | Net $ | Trades stress | Net stress $ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mai | 28 | 12 | +133,50 | 98 | +35,50 | 19 | +29 |
| Juin | 14 | 7 | +147,50 | 49 | +98,50 | 12 | +110 |
| Juillet | 20 | 7 | −150 | 70 | −220 | 10 | −255 |
| Août | 29 | 8 | −237 | 101,50 | −338,50 | 16 | −224,50 |

En juin, 50 % des trades gagnent. En août, seulement 27,6 % (8/29), 19 sorties
au stop et deux à la clôture ; douze jours négatifs, quatre positifs et cinq sans
trade. Le gain moyen est 42,13 dollars contre une perte moyenne de 33,77 dollars :
les gains ne compensent pas la fréquence des pertes. Août perd déjà 237 dollars
avant les 101,50 dollars de coûts. Les frais aggravent le résultat, ils ne
l'expliquent pas entièrement.

Cela documente l'échec du pullback MYM testé. Les archives ne prouvent pas que
« tout août est difficile », ni que les vacances, le manque de liquidité ou une
annonce en sont la cause. Pour attribuer l'échec à un régime de marché, il faut
mesurer tendance, retournements, volatilité et volume par séance, avec des règles
fixées avant d'en examiner les liens avec les gains.

## LucidFlex : 25K ou 50K ?

Règles officielles relues le 9 septembre 2026. Comparaison de la même formule
LucidFlex ; ne pas la transposer à LucidPro ou LucidDirect.

| Règle | 25K | 50K |
|---|---:|---:|
| Perte maximale initiale (MLL) | 1 000 $ | 2 000 $ |
| Objectif d'évaluation | 1 250 $ | 3 000 $ |
| Objectif / perte maximale | 1,25 | 1,50 |
| Cohérence en évaluation | 50 % | 50 % |
| Seuil verrouillé | 25 100 $ | 50 100 $ |
| Jours bénéficiaires requis par cycle de retrait | 5 jours à ≥100 $ | 5 jours à ≥150 $ |
| Demande maximale par retrait | 50 % des profits, plafond 1 000 $ | 50 % des profits, plafond 2 000 $ |
| Part du trader | 90 % | 90 % |

[Évaluation](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account),
[drawdown](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown),
[retraits](https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts),
[compte financé simulé](https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account).

Le seuil suit le plus haut solde de clôture puis se verrouille. Atteindre le
seuil invalide le compte ; une demande de retrait le place au seuil verrouillé.
La marge disponible après retrait doit donc être recalculée. L'option de limite
quotidienne Lucid ne se confond pas avec notre limite interne. Le plan de montée
en taille du compte financé peut limiter les contrats ; nos tests utilisent un
seul microcontrat.

**Préférence conditionnelle : 50K, en gardant le même risque en dollars.** Sa
marge initiale est double, mais son objectif d'évaluation est 2,4 fois supérieur.
Le 25K demande proportionnellement moins de profit pour passer. Aucun avantage
de rentabilité du bot sur 50K n'a été testé ici et les prix d'achat n'ont pas été
vérifiés : ce n'est pas une comparaison complète des frais d'abonnement/achat.

Le risque 0,5–1 % du nominal 50K vaut 250–500 dollars, soit 12,5–25 % des
2 000 dollars réellement disponibles avant invalidation. Quatre pertes de 500
dollars ou huit de 250 dollars peuvent épuiser toute la marge initiale, avant
d'éventuels dépassements. Le compte plus grand ne justifie pas ce risque pour
un bot non confirmé. Pour une future simulation prudente, 50 dollars frais compris
par trade et 100 dollars de perte quotidienne seraient un point de départ à
tester, pas un réglage validé ni une activation.

Un retrait demandé de 1 000 dollars donne 900 dollars au trader avant taxes ou
autres frais. Le plafond 25K ne permet donc pas 1 000 dollars nets par retrait.
Le 50K donne davantage de latitude, sans prouver qu'il sera possible de produire
le profit nécessaire chaque semaine. L'achat pour faire tourner le bot reste
prématuré au vu de ces résultats.

## Prochaine expérimentation justifiée

Piste formulée avant la découverte de la branche Jeu 32 : MNQ retour après cassure, comparer la tendance actuelle
au H1/M5 correctement défini. Puis ajouter séparément pivots, open de séance et
FVG ; comparer 1,5R et 2R. Identifier auparavant si l'open/pivot voulu est cash
ou futures : les archives cash ne permettent pas de fabriquer l'overnight.

Le détail prêt à cadrer figure au [protocole](JEU27_PROTOCOL.md). Les nouvelles
confluences, le risque réduit sous 1 000 dollars de marge et la comparaison
complète des comptes 25K/50K ne sont pas présentés comme déjà backtestés. Les
réserves des Jeux 23–27 restent fermées ; aucune candidate fixée pour les trois
fenêtres prospectives déjà prévues. Aucun changement de collecte ni activation.

## Reproduction

30 dépendances/protocole/tests gelés, empreinte
`1f00b3930d2c97028647e891735f61e177fbab179f412660b5aaaf46ea1b9585`.
Huit reproductions témoins aux deux coûts identiques trade par trade ; 25 272
préfixes de signaux, 324 de contexte, 960 de compte et 662 trades audités.
Ces compteurs incluent des replays qui se recouvrent, pas des observations nouvelles.
194 tests logiciels passent ; ils vérifient le logiciel, pas la rentabilité.

Les opérations privées et le rapport ont été écrits puis relus à l'identique.
Voir [restauration et commande de reproduction](JEU27_ARCHIVE.md). Les quatre
montants mensuels reconstituent −424,50 dollars en normal et −340,50 en stress,
exactement les bilans mai–août du Jeu 20.
