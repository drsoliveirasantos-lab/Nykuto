# Jeu 35 — augmenter la cible sans augmenter le risque

Demande du 10 septembre : préserver ce qui fonctionne par marché, améliorer
les profils fragiles et vérifier comment augmenter les profits. Le diagnostic
antérieur du Jeu 34 sert à choisir l'expérience ; aucun nouveau résultat n'est
connu au moment de ce gel.

## Trois règles fixées

Base : variante sans MYM du Jeu 34, toujours exploratoire. MNQ, MES et MGC
gardent leurs signaux, horaires, filtres et stops. Les quatre flux restent
requis pour valider les données synchronisées, mais MYM ne génère aucune entrée.

| Variante | MNQ | MES | MGC |
|---|---|---|---|
| Témoin | 2R | 2R | 2R |
| MNQ 3R | 3R | 2R | 2R |
| MGC 3R | 2R | 2R | 3R |

Le ratio est la distance de prix cible/stop initial. Les coûts diminuent le
ratio net. Chaque variante ne change qu'une cible de marché. Le passage à 3R
est une expérience distincte de la règle 2R actuelle, pas une reproduction de
la méthode de l'appel ni une modification de ses résultats antérieurs.

Le dimensionnement et le filtre de rémunération minimale restent calculés
comme à 2R : aucune entrée auparavant refusée n'est admise uniquement grâce
à la cible plus lointaine. Les occasions ultérieures sont entièrement rejouées.
Une position retenue plus longtemps peut bloquer un autre marché.

## Risque, temps et sorties

Risque prévu maximum 100 USD tout compris, réduction 50/25 selon la marge,
20 microcontrats au total, une position et deux entrées par jour au maximum,
limite quotidienne 200 USD, réserve de seuil 100 USD. Aucun ajout à la position,
aucun déplacement du stop, aucune prise partielle, aucune nouvelle unité de
temps, aucun report de nuit. Un gap peut dépasser le risque nominal prévu.

Le moteur précédent n'avait pas de minuterie courte : il pouvait déjà laisser
courir jusqu'à quinze minutes avant la clôture cash, normalement 15:45 New York.
Changer M5 en M15 ne rallongerait pas mécaniquement le bénéfice ; cela changerait
les signaux. Ici les bougies restent M5 et seule la cible change.

Entrées à l'ouverture suivante, extrêmes de la bougie d'entrée inconnus au
moment de décider. Stop prioritaire si stop et cible sont touchés dans la même
bougie ; gap défavorable au prix d'ouverture, gap favorable à la cible. La
position occupe tout le créneau M5 de sa sortie. Durées reportées : différence
entre timestamps d'ouverture des bougies d'entrée/sortie, borne basse ; l'heure
intrabar exacte n'est pas connue. Drawdown réalisé entre trades, pas maximum
complet de l'exposition latente.

## Mois, objectif et comparaison

Chaque juin/juillet/août 2026 repart d'un compte neuf 50K. Évaluation et funded
déjà obtenu sont simulés séparément. L'objectif funded reste un versement
équivalent à 1 000 EUR après 90/10, référence fixe 1,1652 USD/EUR du Jeu 34,
avant impôts et frais de change/transfert. Cinq jours à 150 USD et au moins
2 589,34 USD de bénéfice dans le modèle ; demande brute 1 294,67 USD puis arrêt
du mois. Aucun gain d'évaluation n'est retirable ; aucune transition automatique
évaluation/funded simulée. Aucun compte réel n'est remis à zéro gratuitement.

36 replays prévus : 3 règles × 3 mois × 2 étapes × 2 coûts. Douze témoins du Jeu
34 seront reproduits exactement. Quatre nouvelles configurations (deux cibles,
deux étapes), deux variantes de stratégie ; les mois/coûts et répliques ne sont
pas des confirmations indépendantes. La référence quatre marchés du Jeu 34
reste accessible comme comparaison archivée, sans nouveau comptage.

Mesures : résultat par semaine et mois, retraits, contributions par marché,
moyenne gagnants/perdants et tous trades, drawdown, jours qualifiants,
durées et décomposition de l'écart : entrées communes, retirées et nouvelles.
Ne pas multiplier les gains anciens par 3/2 : les trades peuvent changer d'issue.

## Décision avant résultats

Une variante n'est une piste favorable que si elle ne dégrade le bénéfice
d'aucun des trois mois, aux deux coûts, sans augmenter le drawdown d'aucune
cellule ; au moins une cellule doit s'améliorer. Ce filtre de recherche ne
valide pas la rentabilité. Si aucune variante le satisfait, conserver 2R comme
référence et publier les pertes supplémentaires. Aucun assemblage MNQ3R+MGC3R,
aucun choix différent selon le mois après lecture du résultat.

Toutes les observations sont déjà vues. Les échantillons par marché restent
petits ; aucune promotion réelle/Paper/Shadow. La fidélité H1 20/50, les pivots
complets, le Daily Open et les ranges nocturnes demeurent des travaux distincts
avec les limites de [la fiche de méthode](ASSOCIATE_METHOD_2026-09-10.md).

## Reproduction

Empreintes de toutes les dépendances, du protocole, du runner et des tests
avant performance ; gel commité et publié avant exécution. Sources privées
identiques au Jeu 34, pin explicite de ses transactions témoins. Contrôles :
douze reproductions exactes, chaque préfixe de journée identique à l'historique
complet, risque/quantité/cible et cashflows vérifiés. Tests synthétiques de
retournement après 2R, immobilisation d'une place et symétrie long/short.

Seuls code et résultats agrégés sont publiés. Transactions et données de marché
restent dans une archive privée distincte ; manifeste écrit en dernier puis
relu intégralement. [Retraits LucidFlex](https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts)
relus le 10 septembre 2026 ; hypothèses de change identiques au Jeu 34.
