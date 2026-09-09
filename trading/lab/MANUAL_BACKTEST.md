# Test manuel — exécution et séparation temporelle

Correction du 9 septembre 2026, basée sur la PR 83 au commit
`33f6ed9823c47f3cf15a036b1d2760d2b121fa0d`.

Cette correction concerne uniquement l’onglet **Test manuel**, piloté par
`lab.js` et le module pur `manual-backtest.mjs`. Elle ne constitue pas un
nouveau Jeu, un nouvel essai de stratégie ou une confirmation du bot futures.
Les moteurs, gels, sélections, rapports, données privées et 57 configurations
des Jeux 19–26 sont conservés sans recalcul. La réserve mai–août reste fermée.

## Défauts reproduits et comportements corrigés

| Situation synthétique | Ancien comportement | Comportement corrigé |
| --- | --- | --- |
| Long à 100, stop 99, ouverture suivante à 97 | Sortie à 99, −1R hors frais | Sortie à 97, −3R hors frais |
| Short à 100, stop 101, ouverture suivante à 103 | Sortie à 101, −1R hors frais | Sortie à 103, −3R hors frais |
| Entrée avant la séparation 70/30, encore ouverte ensuite | Résultat de développement utilisant les prix de validation ; validation empêchée d’entrer tant que la position reste ouverte | Clôture à la dernière clôture du développement ; validation distincte sans position ni signal hérité |
| Une perte hier, pause après deux pertes | Première perte aujourd’hui pouvant bloquer le reste de la journée | Compteur des pertes consécutives réinitialisé à chaque nouveau jour UTC |

Ces prix sont des fixtures logicielles, jamais des résultats de marché.

## Ordre des événements

1. Le signal et son ATR proviennent de la bougie précédente ; l’entrée utilise
   l’ouverture suivante. Les hauts/bas de la bougie d’entrée ne choisissent
   pas la direction, le prix d’entrée ou la distance du stop.
2. Une ouverture au-delà du stop utilise son prix observé. Une ouverture
   atteignant la cible utilise la cible, sans amélioration favorable du prix.
3. Si aucun niveau n’est déjà atteint à l’ouverture, un stop et une cible
   touchés dans la même bougie donnent priorité au stop, car leur ordre est inconnu.
4. Le coût fixe configuré en R est soustrait une fois par trade, y compris aux
   clôtures forcées de fin de segment. Les freins en R n’assurent pas une perte
   maximale : un gap peut dépasser le stop et le budget de la journée.

## Deux simulations distinctes

La séparation reste `floor(nombre de bougies × 0,70)`. La préparation initiale
des indicateurs reste exclue des entrées. Le développement se termine sur la
bougie précédant la séparation ; un signal sur cette dernière bougie ne crée
pas d’entrée dans la validation. Le premier signal admissible en validation
est formé dans la validation, avec entrée sur sa bougie suivante.

La validation dispose de positions, signaux en attente, compteurs de trades,
pertes réalisées et pause indépendants. Ses indicateurs peuvent utiliser les
bougies antérieures, qui étaient déjà connues. Les tests vérifient que modifier
tous les prix futurs ne change aucun trade de développement pour les trois
familles EMA, RSI et breakout. Le total affiché réunit ces deux simulations ;
ce n’est pas le résultat d’un compte continu traversant la séparation.

Dans chaque segment, les freins quotidiens repartent à zéro au changement de
date UTC, même si le seuil de pause n’était pas atteint la veille. Une position
encore ouverte peut traverser une journée UTC à l’intérieur d’un segment,
comme auparavant ; sa perte réalisée est attribuée au jour de sortie.
Cette convention générique n’est pas le calendrier cash New York des Jeux futures.

## Validation des entrées et limites

Le calcul refuse les OHLC invalides/non positifs, les volumes négatifs ou non
finis, les doublons et l’ordre chronologique incorrect. L’interface ne supprime
plus silencieusement une bougie invalide et ne trie plus une réponse mal ordonnée
pour la présenter comme correcte. Une préparation trop longue pour conserver
des bougies de développement bloque explicitement le calcul. Les anciens
résultats sont masqués pendant un nouvel essai ou après erreur, puis réaffichés
uniquement après un calcul réussi.

Le module conserve les trois signaux et les coûts configurables du test manuel.
Il ne certifie ni la complétude du calendrier fournisseur, ni la clôture de sa
dernière bougie, ni les frais, ticks ou tailles de contrats d’un compte futures.
Le découpage 70/30 porte sur les bougies reçues, préparation comprise ; il peut
couper une journée. La date saisie sert aussi au fournisseur à récupérer du
contexte. Des essais répétés sur ces mêmes dates ne sont pas indépendants.
Les badges décrivent uniquement ce diagnostic temporel ; Paper et Shadow
restent OFF. Aucun accès broker, ordre, compte ou collecte n’est modifié.

Validation : `scripts/test-trading-manual-backtest.mjs`, inclus dans
`npm run test:trading-validation` et donc dans la CI existante. Aucune modification
des workflows ou secrets. Tests synthétiques et vérifications statiques,
sans test navigateur ni nouvelle simulation sur les archives de marché.
