# Jeu 34 — chaque mois repart de zéro, objectif personnel de retrait

Demande du 10 septembre 2026 : compte 50K neuf au début de chaque mois,
résultats par semaine, objectif atteint dès qu'un retrait représente 1 000 EUR
pour Diego ; poursuivre une amélioration ciblée du bot et mesurer chaque trade.

## Comparaison fixée avant les nouveaux résultats

Juin, juillet et août 2026, chacun indépendant dans sa comptabilité : solde
50 000 USD, seuil 48 000, gains et compteurs à zéro au début du mois. Aucun
gain, perte ou jour qualifiant n'est reporté d'un mois au suivant. Il s'agit
de scénarios alternatifs ; un compte réel ne se remet pas à zéro gratuitement.

Deux variantes : référence à quatre marchés du Jeu 33 ; même système sans MYM.
Cette ablation, motivée par le Jeu 33, a été annoncée avant calcul. Retirer ses
signaux libère des créneaux, donc tout le portefeuille est resimulé. Aucun
autre filtre, stop, taille, plage horaire ou ordre de priorité modifié.

Deux étapes distinctes du compte : évaluation et funded déjà obtenu. La référence
évaluation reproduit le Jeu 33 ; les trois autres couples étape/variante sont
les nouvelles configurations. Trois mois × deux variantes × deux étapes × deux
coûts = 24 replays, dont six témoins déjà observés. Une seule nouvelle variante
de stratégie ; aucune confirmation indépendante.

Le funded hypothétique part de 50 000 USD au début du mois, sans simuler ni
financer son obtention préalable. L'évaluation suit la cohérence conservatrice
50 % et la cible 3 000 USD ; ses bénéfices ne sont jamais retirables. L'argent
de l'évaluation n'est pas transféré dans le funded. Pas de simulation de chaîne
évaluation → funded dans le même mois.

## Risque conservé

Plafond 100 USD frais compris, réduit à 50 sous 1 000 USD de marge et 25 sous
500 ; réaugmentation après récupération du capital initial et d'une marge
suffisante. Stop structurel fixe et cible 2R. Une position, deux entrées par
jour tous marchés confondus ; limite quotidienne 200 USD, réserve avant seuil
100 USD. Maximum vingt micros : ce plafond interne respecte le premier palier
funded 50K de vingt micros et reste inférieur aux paliers suivants (30 puis 40).
Les paliers Lucid sont actualisés en clôture ; le test ne relève jamais sa taille
maximale au-delà de vingt. Aucun nouveau test à risque 250–500 dollars.

## Retrait personnel et conversion

Dans le funded : cinq journées distinctes à au moins 150 USD net ; profit net
positif ; demande minimale 500 USD, maximum 50 % du profit avec plafond 2 000 USD.
Part trader 90 %. Aucun retrait intermédiaire plus petit : attendre une demande
unique atteignant l'objectif personnel, puis arrêter le mois en clôture.

Conversion de comparaison fixe : **1 EUR = 1,1652 USD**, référence BCE du
9 septembre 2026, consultée le 10 septembre. Ce n'est ni le taux de conversion
historique de chaque semaine ni une cotation exécutable garantie. Frais de
transfert/change supposés nuls, fiscalité non modélisée et mentionnée.
Objectif : 1 000 EUR après partage Lucid, avant ces frais et fiscalité.
Demande brute arrondie au cent supérieur : 1 294,67 USD ; bénéfice nécessaire
2 589,34 USD, plus cinq journées qualifiantes. Le module permet aussi de
recalculer ce seuil avec un autre taux ou des frais explicites.

À la première clôture éligible : simulation de demande et approbation immédiate,
déduction du montant brut du compte, crédit de la part trader en équivalent EUR,
seuil verrouillé à 50 100 USD et contrôle de la réserve interne de 100 USD.
Puis arrêt des entrées pour le reste du mois. L'approbation Lucid réelle et le
délai de versement ne sont pas garantis : « objectif simulé atteint » désigne
uniquement le scénario. Aucun retrait ni achat n'est réellement demandé.

## Comptabilité hebdomadaire

Semaines lundi–vendredi, coupées aux limites du mois et signalées si partielles.
Afficher PnL net USD, cumul du mois, nombre de trades, versement simulé EUR,
et montant maximum théoriquement retirable à la dernière clôture de la semaine.
Cette capacité ne s'additionne pas de semaine en semaine. Les semaines suivant
l'arrêt ont un PnL non calculé, pas un gain ni une projection.

Gain moyen des gagnants, perte moyenne des perdants et moyenne de tous les trades
sont séparés. Les résultats sont nets des commissions/slippage du modèle,
avant partage Lucid. Les coûts doublés peuvent changer les admissions.

## Sources et contrôles

- https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts
- https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account
- https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown
- https://support.lucidtrading.com/en/articles/12945808-lucidflex-scaling-plan
- https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html

Sources privées et anciennes empreintes inchangées. Six reproductions exactes
des trades et soldes du Jeu 33 ; préfixe de chaque journée pour vérifier la
causalité ; quantités, budgets et comptes réconciliés avant/après retrait.
Tests synthétiques des bornes d'éligibilité et des cashflows. Les résultats et
trades sont archivés puis relus ; seuls les agrégats sont publiés dans Git.
Tous les scénarios restent exploratoires même si un objectif est atteint.
