# Jeu 27 — deuxième entrée dans le même sens après un nouveau signal

Préenregistrement du 9 septembre 2026, avant toute performance de cette variante.
Une hypothèse d’admission, quatre configurations MNQ/MES/MYM/MGC. Le registre
contient 57 configurations des Jeux 19–26. Le Jeu 26 reste une famille distincte
de cassures échouées ; ici le témoin est la continuation du Jeu 23 à 150 USD.

## Hypothèse et règle unique

Le Jeu 23 autorise les signaux après un refus mais interdit de reprendre le
même sens après une entrée exécutée. Un nouveau retour peut pourtant apparaître
après la fermeture de cette position. Nous testons cette possibilité sans
augmenter le nombre maximal de trades quotidiens ni les budgets.

Le générateur `admissionSignals` du Jeu 23 est strictement inchangé : zone
09:30–10:00 New York, cassure clôturée puis retest directionnel sous 30 minutes,
entrée au prochain open extérieur à la zone, au plus tard à midi. La première
entrée conserve la règle actuelle. Une deuxième entrée du même sens est permise
uniquement si la bougie de sa nouvelle cassure commence à la clôture de la
bougie de sortie précédente, ou après. Avec des barres de cinq minutes :
`breakoutAt - 300 >= previousSameSideExitClose`, où `breakoutAt` est la clôture
de la bougie de cassure et `previousSameSideExitClose = exitTime + 300`.

Une nouvelle cassure au sens de ce générateur est une nouvelle bougie clôturant
hors de la zone puis un retour distinct. Elle n’exige pas un passage préalable
à l’intérieur de la zone. Un signal préparé pendant la première position reste
refusé pour une répétition du même sens ; il n’est jamais conservé en attente.
Le résultat gagnant ou perdant du premier trade ne change pas cette règle.
Le deuxième trade peut remplacer un ancien trade opposé en consommant le même
quota quotidien : la comparaison n’additionne pas simplement des gains.

## Protections conservées

- Maximum deux entrées exécutées par séance, une seule position à la fois,
  un microcontrat. Aucune augmentation de taille après perte.
- Plafond 150 USD frais compris par trade ; frein quotidien 300 USD ; réserve
  de seuil 100 USD. Stops inchangés : un tick au-delà de la mèche du retest.
  Cible 1,5R arrondie au tick, rapport gain/risque net minimum 1.
- Mêmes freins en R et pertes consécutives, même fin de séance et même compte
  simulé 25K que le Jeu 23. Les ouvertures défavorables utilisent l’open observé ;
  le stop est prioritaire lors d’une ambiguïté intrabougie.
- Coûts normaux : 2,50 USD aller-retour et un tick par côté ; stress : double
  de ces coûts, avec nouvelle simulation de toutes les admissions et protections.
  Les plafonds internes n’affirment aucune règle fournisseur nouvelle et les
  hypothèses historiques de compte ne constituent pas une vérification actuelle
  d’un contrat Lucid. Un gap peut dépasser le risque prévu.

## Données et critères avant résultats

Archives privées Jeu 19 pour MES/MYM/MGC et Jeu 14 pour MNQ, tailles et SHA-256
dans `jeu27-source.json`. Préparation et calendriers inchangés du Jeu 22.
Développement : janvier–février et mars–avril 2026. Les lacunes du 6 mars et du
25 février MGC restent bloquantes. Les séances évaluables peuvent produire
un diagnostic partiel, jamais une fenêtre réputée complète.

Critères inchangés : deux fenêtres complètement couvertes, au moins 40 trades
au total et 12 par fenêtre, chaque fenêtre positive en R et USD, PF global en
R ≥1,10, drawdown réalisé ≤8R, total positif en R et USD aux coûts doublés,
aucune violation des comptes complets aux deux coûts. Le seuil de trades
n’est pas abaissé pour déclarer la variante rentable.

Parmi les seules configurations satisfaisant tout : pire espérance de fenêtre
en R décroissante, drawdown R croissant, puis ordre MNQ/MES/MYM/MGC. Une seule
sélection est figée avant la réserve mai–juin et juillet–août. Sans candidate,
ne pas calculer cette réserve. Aucune nouvelle variante, second choix ou
retouche après le résultat. Les dates ont déjà servi au développement :
`independent=false`, `confirmed=false`, y compris si les chiffres progressent.

Le témoin fixed150 du Jeu 23 est lu dans son archive vérifiée, sans resimulation
ni nouveau comptage. Publier nombre de trades, net, taux gagnant, drawdown,
jours positifs/négatifs/sans trade, résultats par fenêtre et comparaison des
trades identiques/ajoutés/retirés. Les moyennes par séance incluent les jours
observés sans trade ; elles ne sont pas une promesse de gains quotidiens.
Ne pas additionner les quatre marchés comme un portefeuille commun non simulé.

## Vérification, gel et conservation

Avant performance : tests synthétiques de la nouvelle entrée, refus d’une
cassure commencée pendant la position, frontière temporelle exacte, symétrie
long/short, maximum deux entrées, pertes/frais/gaps, remise à zéro par séance,
préfixes causaux et conservation de la première entrée du témoin. Empreinter
protocole, moteur, runner, sources, tests et toutes leurs dépendances puis
commiter avant de calculer. Ne pas modifier un fichier gelé après le calcul.

Le runner refuse d’écraser une occurrence calculée et audite les préfixes des
signaux et des comptes. Tous les essais restent au registre, y compris négatifs.
Préfixe d’archive privée `jeu27/fresh-reentry-v1/` dans TRADING_DATASETS,
avec manifeste, SHA-256, tailles et lecture après écriture ; aucune ancienne
archive modifiée. Git ne reçoit que code, documentation et agrégats.

Trois fenêtres prospectives restent nécessaires avec candidate fixée avant
observation : octobre–novembre 2026, décembre 2026–janvier 2027, février–mars
2027. Aucune activation Paper/Shadow/réelle, collecte modifiée, ordre, abonnement,
message, secret ou workflow modifié. Travail sur branche dédiée et PR ;
aucune fusion dans main. Les corrections du test manuel en PR 84 sont conservées
séparément de ce moteur de recherche. Aucun test navigateur requis.
