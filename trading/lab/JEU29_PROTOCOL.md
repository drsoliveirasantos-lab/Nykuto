# Jeu 29 — quatre profils sur un seul compte simulé

Protocole du 9 septembre 2026, à geler et committer avec le moteur, ses tests
synthétiques et le runner avant le premier résultat. Une configuration commune,
aucun balayage de priorités, de marchés ou de seuils.

## Question et limites

Les bilans par marché des Jeux 23/26/28 ne s'additionnent pas en portefeuille.
Le Jeu 29 mesure la concurrence des signaux et l'effet d'un risque commun.
Les pistes ont été choisies après observation dans la PR 87 : il s'agit de
développement adaptatif, pas de quatre stratégies qualifiées ni d'une preuve
indépendante. Un résultat défavorable sera conservé sans retoucher les règles.

## Configuration unique fixée avant résultat

| Marché | Signaux et termes | Gestion de sortie |
| --- | --- | --- |
| MES | Retour admissible Jeu 23 / Jeu 22 | Stop initial et cible fixe |
| MGC | Cassure échouée Jeu 26 | Stop d'excursion, cible bornée par la zone |
| MNQ | Retour admissible Jeu 23 / Jeu 22 | Protection après clôture +1R Jeu 28 |
| MYM | Retour admissible Jeu 23 / Jeu 22 | Protection après clôture +1R Jeu 28 |

Les générateurs sont rejoués sur les bougies privées : on ne filtre pas des
trades déjà exécutés isolément. Un refus sur un marché ne consomme pas son
sens et un candidat ultérieur peut être examiné avec l'état commun actualisé.
Au plus une entrée par marché/sens/séance, deux entrées pour le compte entier,
une seule position et une unité du microcontrat. Limites partagées : 150 USD
de risque initial frais compris, 300 USD quotidiens, réserve 100 USD au-dessus
du seuil dans le scénario de compte, deux pertes consécutives ou résultat
quotidien ≤−2R. R conserve le risque de prix initial de chaque trade.

Entrée au prochain open après signal clôturé, créneau et règles de termes
hérités inchangés. Pour les candidats simultanés, ordre alphabétique
**MES, MGC, MNQ, MYM**, sans classement par gain, confiance ou résultat futur.
Le premier candidat admissible occupe la place ; les refus précédents ne la
consomment pas. Chaque candidat reçoit une seule décision et un motif.

À chaque intervalle de cinq minutes : décider l'admission depuis l'état au
début de l'intervalle, puis traiter les sorties. Une position présente à
l'open interdit toute nouvelle entrée pendant cette bougie, même si elle sort
sur un gap d'ouverture. C'est une convention conservatrice, fixée ici, qui
évite d'utiliser une sortie intrabougie pour entrer rétroactivement à l'open
d'un autre marché. Aucune position simultanée ni délai d'exécution fictif.

Les gaps, priorités stop/cible, coûts, clôtures avant fin de séance et la
protection différée reprennent les fonctions gelées. Les deux coûts sont
rejoués intégralement : frais aller-retour 2,50 USD plus un tick par côté,
facteur 1 puis 2. Les coûts peuvent modifier le marché admis et toute la suite.
Les ordres ne sont jamais envoyés : `executionAllowed` reste faux.

## Données et comparaison temporelle

Sources Jeux 19 et 14 privées, empreintes dans `jeu29-source.json`.
Seuls janvier–avril 2026 sont calculés. Deux fenêtres : janvier–février et
mars–avril, plus un diagnostic continu des quatre mois. Aucun calcul mai–août,
même si des données de réserve se trouvent dans l'archive source.

Pour chaque séance prévue, les quatre marchés doivent avoir leurs bougies
complètes et leurs horaires vérifiés. Sinon, exclure toute cette séance du
diagnostic, nommer les marchés manquants et compter la séance indisponible,
jamais « sans trade ». Ne jamais compléter un prix ou ne garder que le marché
disponible. L'horloge commune refuse doublons, décalages, ruptures, changements
de contrat intrajournaliers et extrêmes invalides.

L'intersection des séances complètes est une restriction de qualité connue
après coup. Elle ne simule pas un filtre de disponibilité utilisable à l'open.
Le diagnostic sur ces seules séances n'est donc pas une évaluation de compte
complète ; ses jours inconnus ne sont pas supposés avoir un résultat nul.
Les diagnostics gardent les budgets quotidiens mais ignorent le seuil et
l'objectif de compte. Un replay de compte n'est publié pour une fenêtre que
si elle est entièrement couverte, avec solde initial neuf, seuil EOD et arrêt
terminal du modèle historique Jeu 15. Ce modèle n'est pas une certification
des conditions commerciales actuelles de Lucid ou d'un autre fournisseur.

## Mesures et décision

Publier pour les deux coûts : nombre de trades, net et coûts USD, PF et
drawdown réalisés en R, drawdown USD, taux de trades positifs, jours
positifs/négatifs/nuls actifs/sans trade, moyenne sur séances observées,
pire séance, contributions par marché et motifs de refus. Les résultats par
marché sont des contributions au même replay, pas des backtests supplémentaires.
La somme des contributions, jours et trades doit égaler le net commun.

Critères hérités : couverture complète des deux fenêtres, au moins 40 trades
normaux, au moins 12 par fenêtre, chaque fenêtre positive en R et USD,
PF R ≥1,10, drawdown R ≤8, total stress positif en R et USD, aucun seuil
franchi dans les comptes des deux fenêtres aux deux coûts. Une fenêtre
incomplète échoue aussi au critère de compte ; ne pas la considérer réussie.
Ce test est un diagnostic du portefeuille de recherche. Il n'autorise aucune
sélection exécutable et n'ouvre pas la réserve, même si ces critères passaient.

Une configuration commune nouvelle s'ajoute aux 65 essais conservés : 66
au registre. Les fenêtres, coûts et contributions ne sont pas comptés comme
configurations nouvelles. Zéro confirmation indépendante. Les collectes,
Paper/Shadow, flux, comptes, ordres et secrets restent inchangés.

## Vérifications avant performance

Tester priorité indépendante de l'ordre des entrées, refus coûteux, occupation
de la bougie de sortie, budgets et freins partagés, reset quotidien, gaps et
seuil terminal, symétrie des sorties, conservation des fonctions historiques,
coûts doublés, signaux non causaux, données incomplètes et entrées immuables.
Le runner vérifie les préfixes de chaque générateur et de chaque replay au
terme de chaque séance. Il refuse de remplacer des résultats existants.
Protocoles, dépendances transitives, source, tests et runner sont gelés par
SHA-256 et commit avant résultat. Détails privés archivés séparément ; Git
ne reçoit que code, documentation, empreintes et agrégats.
