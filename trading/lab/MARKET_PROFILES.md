# Profils de recherche par marché

Le 9 septembre 2026, Diego a demandé de poursuivre la spécialisation du bot
par marché. Cette évolution organise des profils indépendants et ajoute un
contrôle partagé du risque. Elle ne calcule aucune nouvelle performance et
ne qualifie aucune stratégie. À cette étape, le registre restait à 65 essais, sans modification.
Le [Jeu 29](JEU29_RESULTS.md), réalisé ensuite, ajoute un replay commun :
66 essais au registre, profils toujours non qualifiés.

## Pistes initiales

Ces choix sont effectués après lecture des résultats existants. Ils indiquent
où poursuivre la recherche, pas une sélection indépendante ni des règles
autorisées à trader. Aucun classement automatique sur le seul gain total.

| Marché | Piste de recherche | Jeu | Trades normaux | Net normal USD | Net stress USD | Pourquoi cette piste reste non qualifiée |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| MNQ | Retour admissible + protection après +1R | 28 | 36 | +931,50 | +761,50 | Moins de 40 trades, séance absente, effet positif d'une seule sortie |
| MES | Retour admissible, stop initial | 23 | 28 | −206,25 | −277,50 | Base encore perdante, faible échantillon et couverture incomplète |
| MYM | Retour admissible + protection après +1R | 28 | 37 | −213,00 | −276,00 | Toujours négatif, moins de 40 trades et drawdown excessif en R |
| MGC | Cassure échouée, retour dans la zone | 26 | 27 | +636,50 | +767,00 | Deuxième fenêtre négative, moins de 40 trades et séances absentes |

Janvier–avril 2026, plafond d'admission de 150 USD frais compris, une unité
du microcontrat. Les coûts doublés peuvent modifier les admissions. Les
montants sont ceux des rapports existants, sans nouveau calcul de marché.
Ils ne s'additionnent pas en portefeuille : les simulations, comptes et
disponibilités ont été évalués séparément.

Chaque marché peut consulter les quatre alternatives à risque égal : Jeu 23
fixed150, Jeu 26 failed-breakout150, Jeu 27 fresh-reentry150 et Jeu 28
closed-breakeven150. Les autres variantes restent dans leurs rapports et
dans le registre. Deux profils peuvent conserver une même famille lorsque
la recherche le justifie ; quatre marchés n'imposent pas quatre formules
entièrement différentes.

## Comportement du Lab

`market-profile-registry.mjs` charge les quatre rapports par leurs validateurs
SHA-256 existants. Il extrait seulement les données agrégées des configurations
au plafond 150 USD et crée un registre immuable. Un objet JSON copié ou construit
en dehors de ce chargement ne peut pas se substituer au registre vérifié.

`lab-market-profiles.mjs` affiche quatre fiches avec menus indépendants, deux
coûts, nombre de trades, net, drawdown, périodes, couverture et critères en
échec. Le menu change la consultation du seul marché concerné. Les choix
restent dans la page pendant sa consultation et une revérification ; au
rechargement, les pistes initiales du code reviennent. Aucune préférence de
compte ou configuration manuelle existante n'est écrasée.

Un rapport absent, mal formé ou modifié rend ses alternatives indisponibles.
Il ne force pas une autre stratégie. Les marchés disposant encore de leur
rapport vérifié restent consultables. Les anciennes valeurs de l'alternative
défaillante sont masquées. Le bouton de revérification peut restaurer les
résultats lorsque leur source est à nouveau disponible.

Chaque `executionStrategyId` reste nul. `inspectProfileIntent` rapproche le
marché demandé, son profil vérifié et le contrôle du risque. Même si le budget
est suffisant, il renvoie `executionAllowed: false` : les profils sont de
recherche, sans confirmation indépendante. Aucun menu ne peut activer un bot.

## Contrôle partagé du risque

`account-risk-supervisor.mjs` est un composant de précontrôle pour la recherche.
Il ne remplace pas un moteur d'exécution ni un contrôle de compte côté serveur.

| Limite du modèle | Valeur commune à tous les profils |
| --- | --- |
| Quantité proposée | Un microcontrat |
| Risque prévu par entrée, coûts inclus | Au plus 150 USD |
| Perte quotidienne interne | 300 USD |
| Réserve au-dessus du seuil fourni | 100 USD |
| Positions et projets réservés simultanés | Un au total |
| Entrées quotidiennes | Deux au total, projets en attente compris |
| Freins de perte | Deux pertes consécutives ou résultat quotidien ≤−2R |

Le risque est recalculé depuis l'entrée et le stop, selon le multiplicateur
et le tick du contrat. Une quantité différente de un, un stop du mauvais
côté, un prix hors tick, un instrument non autorisé ou un coût inconnu
refuse le projet. Les coûts sont les hypothèses gelées des études : 2,50 USD
aller-retour plus un tick par côté, au facteur 1 ou 2. Ce ne sont pas des
tarifs certifiés du futur courtier.

Les réservations de tous les marchés sont soustraites de la marge quotidienne
et de la marge au-dessus du seuil. Un projet en attente occupe aussi la limite
commune d'une position. Il ne suffit donc pas de changer de marché pour obtenir
un nouveau budget. Le risque réservé reste le risque initial frais compris ;
un stop rapproché n'est pas traité comme une garantie de risque nul.

Le précontrôle refuse les identifiants déjà présents, les révisions périmées,
les mélanges de comptes et les projets d'une autre séance. La fonction de
réservation produit un nouvel état sans modifier l'original. Elle ne remet
pas les compteurs à zéro sur la simple réception d'une nouvelle date et ne
libère pas une réservation sans mécanisme de rapprochement des exécutions.

## Exemples vérifiés, sans cours ni compte réel

- MNQ fictif : entrée 20 000, stop 19 960. Risque de prix 80 USD, coûts 3,50,
  total réservé 83,50. Le projet MES suivant (entrée 5 000, stop 4 980,
  risque total 105 USD) est refusé parce qu'une réservation existe déjà.
- Après 250 USD de pertes réalisées, la marge quotidienne n'est plus que
  50 USD. Un nouveau projet à 83,50 est refusé quel que soit le profil.
- Solde fictif 24 150, seuil fourni 24 000, réserve 100 : seulement 50 USD
  utilisables au-dessus de la réserve. Le même projet est refusé.

L'interface calcule ces exemples avec le composant partagé. Aucune réservation
n'est écrite dans une base ni envoyée à un courtier. Les gains/pertes réels
de Diego, ses positions et ses journaux ne sont ni lus ni modifiés.

## Limites et intégration future

La révision est vérifiée dans un état en mémoire transmis par l'appelant.
Pour un véritable compte, un adaptateur serveur devra obtenir des soldes,
positions, frais et séances fiables, vérifier leur fraîcheur, appliquer les
révisions atomiquement dans un stockage durable, rapprocher les fills et
les annulations, puis gérer les redémarrages. Deux processus recevant une même
copie d'état ne sont pas coordonnés par ce module seul. Aucun verrou de
courtier ni protection distribuée en production n'est revendiqué.

La limite d'une position commune borne les expositions simultanées de ce
modèle ; elle n'est pas une estimation de corrélation ni un backtest de
portefeuille. Un gap peut dépasser la perte prévue. Le seuil de compte est
un paramètre d'exemple, pas une certification des règles commerciales actuelles.

Les moteurs, protocoles et résultats gelés restent inchangés. La réserve
mai–août n'est pas ouverte, les collectes prospectives ne changent pas,
Paper/Shadow/broker/réel restent désactivés. Les profils ne sont pas un Jeu 29.

## Validation

Douze nouveaux tests vérifient les quatre pistes, les données exactes et
immuables, l'indépendance des menus, les erreurs partielles/totales et leur
récupération, le rapprochement profil/marché, les calculs par tick et coûts,
les budgets partagés, les frontières exactes, les réservations, doublons,
révisions, comptes, séances et freins. Les contrôles d'interface utilisent
un DOM simulé. Aucun test visuel dans un navigateur n'est revendiqué.

Validation locale finale : 233 tests trading réussis, zéro échec, zéro alerte
d'hygiène, 25 modules Pages Functions validés et build réussi. Les 436 anciens
IDs restent présents parmi 478 IDs uniques ; structure et liens locaux
vérifiés. Aucun des 104 chemins de dépendances gelées n'est modifié. Le registre
des 65 essais est identique octet pour octet à celui du Jeu 28.
