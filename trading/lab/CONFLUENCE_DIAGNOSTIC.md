# Jeu 10 — expliquer et tester les confirmations du signal MNQ

Protocole fixé le 8 septembre 2026 avant calcul des variantes. Réutilise le
snapshot privé et les trois périodes du Jeu 09. Ces prix et leur résultat global
sont déjà connus : diagnostic exploratoire, jamais validation indépendante.
Les anciennes stratégies et la collecte prospective du Jeu 08 sont conservées.

## Question et campagne bornée

Diego demande d'analyser tendance, forme des bougies, événements, volume et sens
long/short. Ajouter des critères ne prouve pas un avantage : mesurer chaque
ajout, puis une seule combinaison stricte. Huit versions, sans grille de
paramètres, sans modification des seuils après les résultats, toutes rapportées.
Pas de boucle « jusqu'à gagner » ou de promesse de bot parfait.

| Version | Règle ajoutée au signal EMA9/21 + ADX14 ≥20 |
| --- | --- |
| Référence | Aucune, mêmes longs et shorts que le Jeu 09 |
| Tendance 1 h | EMA20 > EMA50 pour un long, inverse pour un short, sur heures cash entièrement closes |
| Englobante | Corps de la bougie signal englobe celui de la précédente de couleur opposée, même séance |
| Volume | Volume signal ≥ moyenne des cinq séances précédentes au même créneau New York |
| Événements | Aucune entrée durant une séance CPI, emploi américain ou décision FOMC recensée |
| Quatre confirmations | Les quatre critères ci-dessus simultanément |
| Long seulement | Autoriser seulement les signaux Long |
| Short seulement | Autoriser seulement les signaux Short |

Bougie englobante : précédent corps non nul de sens contraire ; corps courant
non nul, inclusion des deux bornes (égalité admise), avec au moins une borne
strictement dépassée. Pas de comparaison entre jours. C'est une définition de
test, pas la preuve d'un retournement. Aucun marteau, doji ou motif supplémentaire
n'est optimisé dans cette campagne.

Heures : groupes de quatre bougies de 15 minutes depuis 9 h 30, même séance,
contigus ; six blocs complets habituels de 9 h 30–15 h 30. Le dernier demi-bloc
n'est pas une heure. Une heure devient disponible seulement à sa clôture.
Au moins 50 heures complètes avant une confirmation ; préparation indépendante
par contrat. Aucune donnée de nuit n'est inventée.

Volume : cinq observations antérieures au même quart d'heure, hors jour courant,
préparation comprise ; moyenne strictement positive. Pas de moyenne contenant
la bougie signal, ni de moyenne de volumes futurs ou d'une séance entière future.

Chaque variante et chaque coût sont entièrement resimulés : enlever un trade
peut modifier les freins quotidiens et les entrées suivantes. Les résultats
Long/Short de la référence sont une ventilation descriptive ; les versions
Long seul/Short seul sont des simulations distinctes. Durée approximative à
15 minutes, avec entrée et sortie dans la même bougie comptées 0 minute.

## Événements couverts et limites

Calendriers officiels consultés le 8 septembre 2026, dates de publication (pas
mois statistique) à New York. Filtre conservateur de journée entière, commun
aux longs et shorts. Il ne lit ni résultat macro, ni surprise, ni sentiment.
Ces calendriers peuvent avoir été révisés : ils ne constituent pas une archive
de ce que le trader connaissait à chaque instant. Test rétrospectif uniquement.

- CPI : 13 janvier, 13 février, 10 avril, 12 mai, 14 juillet, 12 août 2026.
- Emploi (Employment Situation/NFP) : 9 janvier, 11 février, 3 avril, 8 mai,
  2 juillet, 7 août 2026. Le 3 avril est déjà hors du calendrier cash.
- Décisions FOMC : 28 janvier, 29 avril, 29 juillet 2026.

Sources :
- https://www.bls.gov/schedule/news_release/cpi.htm
- https://www.bls.gov/schedule/news_release/empsit.htm
- https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm

Ce périmètre ne couvre pas PCE, PIB, résultats d'entreprises, discours, minutes
FOMC, géopolitique ni nouvelles imprévues. L'absence d'une date dans ce petit
calendrier ne signifie pas « aucun événement ». Aucun flux d'actualités en direct.

## Exécution et lecture

Moteur, stops, cible, coûts 3,50 $ / 7 $, taille d'un contrat, limites quotidiennes
et sortie avant clôture identiques au Jeu 09. Informations du signal connues à
sa clôture, entrée à l'ouverture suivante. Arrondis de tick et stop prioritaire
préservés. Les freins −2 R ne garantissent pas une perte journalière maximale.

Afficher effectif, réussite, net R, moyenne R, coûts doublés, profit factor et
baisse réalisée ; trois périodes et résultats par sens. Seuils inchangés :
40 trades, 12 par fenêtre, toutes fenêtres positives, PF ≥1,10, baisse ≤8 R,
stress positif. Ajouter à la lecture exploratoire la comparaison de moyenne
avec la référence ; un seuil réussi ne valide jamais une stratégie sur ce jeu.

Afficher les motifs de refus/acceptation des signaux effectivement évalués
par chaque simulation normale. Une entrée acceptée peut être annulée à la
clôture ou par les freins : le journal distingue signal et trade exécuté.
Les anciennes périodes ne deviennent pas neuves en changeant de filtre.

Les formes de bougies sont une hypothèse à vérifier, pas une probabilité de
gain. Référence méthodologique sur les essais multiples :
https://carmamaths.org/jon/backtest.pdf

Paper Bot et Shadow restent OFF, aucun ordre ou achat. Une campagne indépendante
future et des essais d'exécution restent nécessaires même après un bon diagnostic.

## Résultats des huit versions

Même snapshot vérifié de 4 746 bougies, 123 séances évaluées. Aucun changement
de règle après ces résultats ; les coûts doublés sont une nouvelle simulation.

| Version | Trades | Gagnants | Net R | Frais doublés R | Baisse R |
| --- | ---: | ---: | ---: | ---: | ---: |
| Référence | 49 | 21 | +2,097047 | +1,176098 | 5,620141 |
| Tendance 1 h | 22 | 7 | −2,825491 | −3,244550 | 6,121381 |
| Englobante | 4 | 2 | −0,016480 | −0,081109 | 2,035907 |
| Volume | 33 | 15 | +5,380222 | +4,730099 | 3,581962 |
| Sans jours d'annonces | 39 | 18 | +3,608435 | +2,871938 | 4,594870 |
| Quatre confirmations | 0 | 0 | 0 | 0 | 0 |
| Long seul | 28 | 13 | +4,424844 | +3,952132 | 4,135290 |
| Short seul | 24 | 10 | +0,192441 | −0,302695 | 3,048321 |

Aucune version ne satisfait tous les critères. Le volume a seulement 33 trades
et perd 0,470585 R en juillet–août (6 trades). Le filtre événements reste à
39 trades, sous 40 : ne pas abaisser ce seuil parce qu'il manque un trade.
Ses trois résultats sont +0,996399 / +0,052237 / +2,559799 R ; la faible marge
avril–mai mérite prudence. Les englobantes et leur combinaison sont trop rares
avec ce signal précis ; cela ne prouve pas leur inutilité sur d'autres systèmes.

Dans la référence mixte : 26 longs, +1,460997 R ; 23 shorts, +0,636050 R.
Les versions à sens unique ont leurs propres freins et entrées : ne pas les
confondre avec cette ventilation. Durées médianes long seul 60 min / short seul
22,5 min, gains et pertes inclus, précision limitée aux bougies de 15 minutes.
Un short plus court n'est pas une preuve de gain plus rapide.

Les décisions normales sont 52 / 55 / 56 / 54 / 52 / 56 / 54 / 54 selon les
versions. Elles sont expliquées dans le Lab ; les signaux acceptés mais annulés
à la clôture ne sont pas présentés comme des entrées.

## Poursuite autonome après la collecte

Diego autorise les tests sans clic manuel. Le contrôle suivant porte sur la
collecte existante MNQZ6, préparation 9–30 septembre et score octobre–novembre
2026, après son dernier passage prévu le 2 décembre. Programmer une seule
reprise le 3 décembre, sans boucle de réglage jusqu'à obtenir du vert.

Après audit du calendrier, des captures brutes, des délais, de la complétude
et des interruptions : recalculer la référence et les mêmes huit versions,
sans changer une règle ou le périmètre selon leurs résultats. Conserver le
Jeu 08 d'origine ; la comparaison complémentaire aura un rapport distinct.
Pour le filtre événements, calendrier prévu fixé dès aujourd'hui : emploi
2 octobre / 6 novembre, CPI 14 octobre / 10 novembre, décision FOMC 28 octobre
2026 (mêmes sources officielles). Vérifier au moment de l'audit tout décalage
de publication : ne pas substituer silencieusement les dates révisées. Un
changement empêche de présenter ce filtre comme un test conforme au protocole.

Une seule fenêtre future ne satisfait pas les trois fenêtres exigées. Même
des résultats favorables ne permettent ni activation, ni changement de seuil,
ni garantie de rentabilité. Si les données sont incomplètes, publier le bilan
des manques sans performance et sans remplir les trous ; aucune donnée payante.
En cas de blocage stable, le signaler et arrêter plutôt que consommer des
exécutions répétées. Ce rendez-vous est une campagne bornée, pas une promesse
de surveillance permanente ni de perfection.

Cette reprise unique a été créée et confirmée active le 8 septembre 2026,
pour le 3 décembre au matin, fuseau America/Asuncion. La collecte quotidienne
existante reste inchangée ; les deux tâches ont des rôles distincts.

## Vérification de cette livraison

59 tests passent, dont six nouveaux contrôles ciblés : définition des corps
englobants, causalité des heures closes, volume de cinq séances passées, filtres
événements/sens, resimulation avec freins et statistiques de durée. Un audit
séparé des 398 trades normaux/stressés vérifie prix vers dollars vers R,
chronologie, absence de chevauchement, séance, coûts, freins, cumul, baisse,
sens unique et exclusion des 14 journées d'annonces effectivement évaluées.
La référence et son stress reproduisent exactement tous les trades du Jeu 09.
Les 185 IDs HTML sont uniques, les anciens sont conservés et les 20 nouveaux
contrôles référencés existent ; structure et imports vérifiés. Aucun navigateur
ni ordre de courtier n'a été utilisé pour cette vérification.
