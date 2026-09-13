# Jeu 23 — admission et plafonds de risque

Version jeu23-admission-risk-v1, déclarée avant performances.

## Défaut examiné et modifications déclarées avant résultats

Au Jeu 22, le premier signal de chaque sens consomme l’occasion quotidienne,
même lorsque l’entrée suivante est refusée pour risque ou marge nette. Les
refus de risque concernent notamment 30 des 39 signaux MNQ et 34 des 36 signaux
MGC de développement. Une occasion ultérieure avec un autre retour observé
peut être admissible. Cette possibilité n’a pas été testée au Jeu 22.

Le générateur émet désormais les retours successifs causalement valides. Le
simulateur consomme un sens à l’ouverture effective de la première position
admissible dans ce sens. Un refus ne le consomme pas ; une position ouverte
empêche toute autre entrée. Après une entrée, ce sens reste consommé jusqu’à
la séance suivante, même après la sortie. Un signal apparu pendant une position
n’est jamais mis en attente pour être exécuté plus tard.

Cela change la règle d’admission, sans déplacer les stops. Le niveau de référence reste à 50 USD.
La première cassure/retour de chaque sens doit rester identique à celle du
Jeu 22 ; chaque nouveau signal vient de nouvelles bougies clôturées.

## Paramètres conservés

- Seize configurations déclarées : MNQ, MES, MYM et MGC × plafonds 50, 75, 100 et 150 USD.
- L’utilisateur a explicitement autorisé une révision des règles de risque avant le gel et tout calcul de performance. Le plafond 50 isole l’admission ; les trois autres mesurent le relèvement de risque à admission identique.
- Zone 09:30–10:00 New York ; cassure clôturée puis retour distinct dans les
  30 minutes ; entrée au prochain open au plus tard à 12:00.
- Stop un tick au-delà de la mèche du retour ; cible 1,5R arrondie au tick ;
  rapport gain/risque net minimal 1. Le stop doit rester du bon côté du prix
  d’entrée réel. Une ouverture revenue dans la zone est refusée.
- Un microcontrat ; au plus un trade exécuté par sens, donc deux par jour.
  Risque prévu ≤50/75/100/150 USD frais compris selon le profil, limite quotidienne égale à deux fois le plafond (100/150/200/300 USD), réserve de
  seuil 100 USD et politique de compte 25K inchangées. Un gap peut dépasser
  une perte prévue.
- Coût hypothétique 2,50 USD aller-retour plus un tick par côté ; stress =
  double de l’ensemble. Aucune réduction opportuniste des frais.

## Sélection, contrôle et limites

Janvier–février puis mars–avril 2026 : développement. Critères inchangés : deux
fenêtres entièrement couvertes, ≥40 trades totaux, ≥12 par fenêtre, chaque
fenêtre positive en R et USD, PF en R ≥1,1, drawdown ≤8R, total positif en R et
USD aux coûts doublés, aucun franchissement de seuil dans les comptes complets.
Classement : pire espérance par fenêtre, drawdown, puis ordre MNQ/MES/MYM/MGC et plafond croissant à égalité.

Une candidate éventuelle est gelée avant mai–juin puis juillet–août. Sans
candidate, la réserve n’est pas calculée. Pas de second choix ou retouche après
ouverture. Ces dates sont déjà vues ou corrélées ; confirmed=false et
independent=false restent obligatoires. Il s’agit de seize essais de plus,
soit 33 configurations pour les Jeux 19–23, pas de confirmations indépendantes.

Les sources 5 minutes, métadonnées, calendrier et passages d’échéance sont
identiques au Jeu 22, y compris ses lacunes bloquantes. Le témoin utilise ses
transactions déjà archivées, vérifiées par SHA-256 ; ses performances ne sont
pas recalculées. La différence avec le Jeu 22 à 50 USD est décomposée en trades identiques, ajoutés et
retirés pour chaque profil. Les profils de risque sont aussi comparés au nouveau témoin 50 USD pour isoler le changement de plafond. Les transactions et prix restent privés ; seules les sommes et les
comptages de comparaison sont publics.

Avant résultats : cas synthétiques montrant un premier refus suivi d’une
occasion admissible, limites par sens, alternance des coûts, arrêt quotidien,
préfixes sans futur et inventaire de dépendances gelées. Aucun ordre, Paper Bot,
Shadow, flux réel ou broker activé.

## Sources vérifiées le 9 septembre 2026

- [LucidFlex évaluation](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account) : compte 25K, objectif 1 250 USD, MLL 1 000 USD, cohérence 50 %. La limite quotidienne étudiée est interne au bot, pas une règle imposée par défaut à Flex.
- [LucidFlex drawdown](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown) : seuil suiveur en clôture puis verrouillage à 25 100 USD.
- [CME, dimensionnement](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size) : dimensionnement à partir du stop logique et du budget accepté.

Les plafonds représentent 5 / 7,5 / 10 / 15 % du MLL initial, et 0,2 / 0,3 / 0,4 / 0,6 % du nominal. Ce choix est une expérience, pas un niveau optimal établi. Un seul microcontrat reste utilisé : relever le plafond admet des stops structurels plus larges, sans multiplier les contrats. Le classement et les critères ne changent pas après résultats. Une hausse de gain sans couverture complète et robustesse suffisante ne valide pas un profil. Aucun contournement des règles réelles du fournisseur.

## Confirmation future obligatoire

Une éventuelle réussite rétrospective ne suffit pas. Avant toute qualification Paper/Shadow, exiger trois fenêtres de deux mois non consultées et entièrement couvertes, avec les mêmes critères gelés et une seule candidate fixée avant leur observation. Fenêtres prospectives prévues : octobre–novembre 2026, décembre 2026–janvier 2027, février–mars 2027. Si une de ces observations est utilisée pour le développement, elle perd son caractère indépendant et ne peut servir de confirmation. Sans candidate fixée, ces dates ne constituent pas une confirmation acquise. Aucune collecte existante n’est modifiée par cet essai.
