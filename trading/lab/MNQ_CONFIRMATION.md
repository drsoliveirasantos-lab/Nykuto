# Jeu 07 — Confirmation complémentaire MNQ, protocole figé

Décision du 8 septembre 2026, avant récupération ou calcul des prix ci-dessous.
MNQ a été sélectionné pour examen après le Jeu 06, dont septembre–octobre 2025
reste négatif. Ne modifier aucun paramètre pour obtenir un résultat favorable.

## Historique retenu et indépendance

- Contrat individuel : MNQZ4 (décembre 2024), sans concaténation ni roulement
  pendant la période évaluée.
- Préparation : du 9 au 30 septembre 2024, minimum 220 bougies de séance cash.
- Une fenêtre évaluée : du 1er octobre au 30 novembre 2024 inclus.
- Bougies 15 minutes et séances communes au marché actions américain, avec
  calendrier Alpaca et horaires futures Massive vérifiés, y compris le
  changement d'heure et la clôture anticipée du 29 novembre.

Les Jeux 04–06 ont utilisé décembre 2024 à juin 2026 (préparation incluse), puis
le Jeu 03 utilise juillet–septembre 2026. Ne pas recycler les mois récents comme
confirmation neuve. Les horaires futures Massive sont limités à deux ans :
les deux mois complets octobre–novembre 2024 précèdent les données déjà utilisées
et permettent une préparation disponible en septembre. Cette sélection repose
sur la disponibilité, avant lecture des prix ; ne pas déplacer les bornes selon
les gains ou pertes. Ce constat porte sur les sources documentées du projet,
pas sur l'absence de toute exposition du propriétaire à ces anciens marchés.

Il s'agit d'un complément historique rétrospectif court, pas d'une validation
prospective. MNQ a été choisi parmi plusieurs produits et les jeux successifs
créent un effet de sélection. Ne pas additionner ce résultat au Jeu 06 pour
faire passer artificiellement le minimum de transactions.

## Règles inchangées

Réutiliser `simulateMarket` du Jeu 06 et les indicateurs existants : EMA9/21,
ADX14 >=20, ATR14*1,25, objectif <=1,5R arrondi vers l'entrée, distance de stop
arrondie vers le haut au tick de 0,25 point, multiplicateur 2 $/point.
Coût hypothétique aller-retour : 2,50 $ + deux ticks, soit 3,50 $/contrat.
Recalculer la simulation avec 7 $/contrat pour le stress de coûts.
Les frais réels du courtier et la taille adaptée au capital restent à vérifier.

Entrée à l'ouverture suivante, une position, trois entrées/jour maximum, arrêt
des nouvelles entrées après deux pertes consécutives ou -2R réalisés.
Sortie à l'ouverture de la dernière bougie cash, aucun signal conservé la nuit,
aucune entrée dans cette dernière bougie. Stop prioritaire si la même bougie
touche stop et objectif, gap défavorable au prix d'ouverture. Aucune recherche
de paramètres, sélection de direction, filtre horaire ou exclusion d'annonce.

## Critères et portée du résultat

Conserver les exigences de recherche précédentes : trois fenêtres complètes de
deux mois distinctes, >=40 transactions au total, >=12 par fenêtre, moyenne nette
positive dans chaque fenêtre, PF >=1,10, baisse réalisée <=8R et total net
positif à coûts doublés. Le Jeu 07 n'apporte qu'une fenêtre : la confirmation
reste donc **incomplète**, même si tous les autres critères sont satisfaits.
Les détails mensuels sont descriptifs et ne créent pas deux fenêtres de deux
mois. Aucun jeu précédent n'est ajouté au total. Aucun bot n'est activé.

Afficher résultat net, coûts, transactions, réussite, R moyen, PF, baisse
réalisée et pire perte, avec le stress recalculé. Une relance doit donner les
mêmes résultats et ne compte pas comme une expérience supplémentaire.
Si données ou horaires manquent, annoncer l'indisponibilité au lieu d'inventer
des bougies ou de changer les dates. Aucune donnée licenciée dans Git : snapshot
privé en KV et endpoint authentifié, empreinte vérifiée avant le calcul.

## Contrôle de disponibilité initial — calcul bloqué

Le protocole initial a été enregistré dans le commit
`04af428f835e7245ab576c865d5d6ce25a13dc5f`, avant récupération des prix.
Massive confirme le contrat MNQZ4, avec dernière négociation le 20 décembre 2024.
Les 5 481 barres brutes renvoyées permettent d'extraire 1 522 bougies cash sur
les 59 séances du calendrier Alpaca, dont 416 bougies de préparation et 43
séances évaluables en octobre–novembre. Aucune pagination de prix supplémentaire
n'a été annoncée.

La requête Massive `/futures/v1/schedules`, MNQ du 9 septembre au 30 novembre
2024, a cependant renvoyé seulement deux préouvertures identiques pour le
1er octobre. Après déduplication : un événement, aucun intervalle ouverture–
fermeture vérifié, soit 0/59 séances. Une requête ciblée du 29 novembre renvoie
zéro événement. La documentation annonce deux ans d'historique mais cela ne
certifie pas une couverture complète. La recherche de remplacement auprès des
pages publiques CME n'a pas fourni les horaires historiques exacts de 2024.
Les horaires de 2026 ne sont pas substitués à ceux de 2024.

Le snapshot de 86 442 octets, SHA-256
`770306897634833cca092cdd5730bb8d30d5a9a72d8a56e571f87a6ef0c79390`,
est conservé en KV privé sous `jeu07/mnq-confirmation-v1.json`, exposé seulement
via `/api/lab/jeu07` après signature Access valide. Il est **incomplet** et n'est
pas autorisé pour un calcul de performance. Les prix sont conservés pour ne pas
les récupérer de nouveau, mais aucun score ni choix de paramètres n'en dérive.

Le bouton du site vérifie ce snapshot et affiche les séances manquantes.
`runConfirmation` retourne `calculated: false`, `normal: null`, `stress: null`,
sans construire les indicateurs ni simuler des transactions si les horaires ou
les prix sont incomplets. Aucun zéro n'est présenté comme une performance.
Une future réparation devra compléter les horaires authentiques, vérifier la
nouvelle empreinte, puis publier explicitement ce nouveau snapshot. Elle ne
doit ni changer les dates ni déduire le calendrier des bougies disponibles.

## Recherche et réparation partielle du 8 septembre 2026

La recherche demandée par Diego a retrouvé un calendrier opérationnel publié
par Ironbeam le 26 novembre 2024 :
https://www.ironbeam.com/thanksgiving-holiday-futures-trading-hours-2024/
Pour les indices, il précise l'ouverture du 28 novembre à 17:00 CT et la
clôture du 29 novembre à 12:15 CT. Avec `America/Chicago` en UTC−6 à ces dates,
cela donne `2024-11-28T23:00:00Z` et `2024-11-29T18:15:00Z`. La séance cash
du 29 novembre, 09:30–13:00 New York, est entièrement incluse. Seul cet
intervalle est transcrit : pas d'ouverture inventée pour le 27 novembre.

Ces deux événements sont explicitement attribués à Ironbeam, de type
`published-holiday-schedule`. Ils décrivent le calendrier annoncé et ne sont
ni des événements Massive ni une garantie d'absence d'incident intrajournalier.
Les préouvertures Massive d'origine restent conservées. Les prix, le calendrier
actions, les dates, les paramètres, les critères et le moteur sont inchangés.

Le snapshot v2 compte 88 012 octets, SHA-256
`2dc405ce2e5fd33ebcb065c33c4192c62362abc62f37d9981ec323254e8fc891`,
sous `jeu07/mnq-confirmation-v2.json` en KV privé. L'endpoint du Jeu 07 sert cette
révision avec contrôle d'empreinte côté client ; v1 est conservé. Le contrôle
passe à **1/59 séance documentée**, avec **58 séances encore manquantes**.
`calculated` reste `false`, `normal` et `stress` restent `null` : aucune
performance ne peut être calculée par cette réparation partielle.

Autres sources examinées, non utilisées pour remplir les intervalles manquants :

- Fiche CME Micro E-mini, référence PM2662/0423 (avril 2023), horaires
  habituels 17:00–16:00 du dimanche au vendredi :
  https://www.cmegroup.com/trading/equity-index/files/cme-micro-e-mini-futures-fact-card.pdf
  Une règle générale ne certifie pas chaque séance historique et ses exceptions.
- CME, horaires de settlement Columbus Day 2024 et Veterans Day 2024 :
  https://www.cmegroup.com/tools-information/holiday-calendar/files/columbus-day-holiday-settlement-times-2024.pdf
  https://www.cmegroup.com/tools-information/holiday-calendar/files/veterans-day-holiday-settlement-times-2024.pdf
  Ils annoncent des settlements aux heures normales, pas les ouvertures et
  fermetures de négociation. Ne pas les transformer en preuves d'intervalles.
- CME, Thanksgiving 2024 :
  https://www.cmegroup.com/tools-information/holiday-calendar/files/thanksgiving-holiday-settlement-times-2024.pdf
  Le settlement indices à 12:00 CT le 29 novembre ne désigne pas la clôture
  de négociation à 12:15 CT.
- Le service public utilisé par la page CME Trading Hours,
  `/services/trading-hours-by-product`, identifie MNQ par le produit 8668,
  groupe NQ. Les requêtes ciblant les 9–11 septembre et 28–30 novembre 2024
  renvoient les dates demandées mais zéro événement. Pas de calendrier de
  remplacement disponible dans ces réponses.
- Une recherche Massive supplémentaire sur NQ, groupe identifié par CME,
  renvoie également seulement deux préouvertures le 1er octobre. Aucun horaire
  NQ n'est substitué à MNQ. Les recherches précédentes sur MNQ ne sont pas
  répétées pour prétendre améliorer la couverture.

La recherche publique ne suffit donc pas à lever le blocage. La suite exige
des intervalles historiques vérifiables pour les 58 dates listées dans le site,
ou une source d'archive couvrant explicitement toute la période. Aucune nouvelle
fenêtre ni aucun résultat n'est sélectionné pour contourner cette indisponibilité.
