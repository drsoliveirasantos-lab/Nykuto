# Jeu 30 — août 2026, jour par jour et semaine par semaine

Le 9 septembre 2026, Diego demande explicitement le test du mois d'août,
avec les résultats quotidiens et hebdomadaires. Cette demande autorise une
évaluation séparée de la réserve d'août. Les protocoles et résultats antérieurs
restent gelés ; aucune autorisation d'ordre ou de bot réel n'en découle.

## Ce qui est évalué

Une seule configuration économique, identique au Jeu 29 : MES référence Jeu 23,
MGC cassure échouée Jeu 26, MNQ/MYM protection après clôture +1R Jeu 28.
Priorité simultanée MES/MGC/MNQ/MYM, un microcontrat, une seule position,
deux entrées quotidiennes pour le compte entier, une entrée par marché/sens.
Plafond 150 USD frais compris, enveloppe quotidienne 300 USD, réserve de seuil
100 USD, freins après deux pertes consécutives ou −2R. Les signaux clôturés,
stops, cibles, gaps, règles de coûts et occupation de la bougie de sortie
restent identiques. Aucun nouveau filtre ni suppression des marchés perdants.

`jeu30-engine.mjs` est une version isolée de l'exécuteur Jeu 29 : seuls l'import
de politique, le nom de fonction et le contrôle des dates changent. Un test
compare mécaniquement les deux sources. Le vieux moteur conserve sa barrière
janvier–avril. Le nouvel exécuteur refuse toute période hors août.

Deux coûts sont entièrement resimulés : forfait historique par contrat,
puis forfait doublé. Aucun résultat futur ne modifie une admission antérieure.

## Période et couverture

Du 1er août inclus au 1er septembre 2026 exclu, séances de 09:30 à 16:00
New York du calendrier gelé : 21 séances, du lundi 3 au lundi 31.
Les quatre historiques de cinq minutes existent dans les archives privées
Jeux 19/14. Leurs empreintes sont inchangées. La vérification de disponibilité,
effectuée avant performance, trouve 21/21 séances sur chaque marché.

Le runner revérifie les octets, données, horaires et horloges communes. Si une
séance devient indisponible, la nommer et l'exclure du diagnostic pour tous les
marchés ; refuser alors le mode compte complet. Ne jamais interpoler un prix
ou compter un jour absent comme un jour sans trade. Mai–juillet n'est pas
rejoué dans ce test. Les captures peuvent déjà avoir été vues dans d'autres
études : août n'est pas annoncé comme une période universellement inédite.

## Deux lectures du même mois

1. Diagnostic continu : toutes les séances évaluables, budgets et freins
   quotidiens conservés, seuil et objectif de compte ignorés.
2. Compte simulé : capital initial 25 000 USD au début du mois, modèle
   historique Jeu 15 avec perte maximale 1 000 USD, seuil ajusté en fin de
   journée et plafonné à 25 100, objectif 1 250 USD, cohérence 50 %. Arrêt
   terminal après franchissement du seuil, ou à la clôture d'une séance qui
   atteint l'objectif avec la cohérence prévue. Ce modèle gelé ne certifie
   pas les règles commerciales actuelles d'un fournisseur.

Le compte et le diagnostic commencent chacun à plat au début du mois. Capital,
drawdown et état de compte sont continus : aucun redémarrage hebdomadaire.
Seuls les compteurs quotidiens se réinitialisent à chaque nouvelle séance.
Le mode compte n'existe que si le mois entier a une couverture complète.
Les jours après arrêt terminal sont « arrêt après objectif/seuil » avec
résultat non calculé, pas des jours sans trade à zéro.

## Détails quotidiens et hebdomadaires

Pour chaque séance et chaque coût : trades, net USD après frais, cumul du mois,
solde simulé, statut de séance et contributions par marché. Conserver les
jours sans trade, les jours nuls actifs, les journées manquantes et les arrêts
avec des statuts différents. Aucun prix d'entrée/sortie ni trade individuel
ne sera public ; les lignes quotidiennes sont des agrégats demandés par Diego.

Regrouper ensuite ces mêmes journées par semaine commençant le lundi, sans
rejouer de compte par semaine : 3–7, 10–14, 17–21, 24–28 et 31 août. La dernière
semaine est partielle (une séance dans août), ce qui doit rester visible.
Chaque somme quotidienne et hebdomadaire doit égaler le total mensuel du mode
et du coût concernés. Le drawdown intramensuel réalisé trade par trade reste
distinct du repli des seuls soldes en fin de journée.

## Interprétation et registre

Ce test demandé décrit ce qu'aurait produit le modèle sur août. Le portefeuille
a échoué sur le développement du Jeu 29 et un seul mois ne le qualifie pas.
Aucune optimisation jour par jour sur les résultats d'août. Les observations
défavorables restent visibles et les prochains changements doivent être
évalués sur une autre période explicitement choisie, sans rebaptiser août
« réserve vierge ». Zéro confirmation indépendante, aucune sélection exécutable.

Une évaluation supplémentaire du portefeuille inchangé est enregistrée en
Jeu 30 : 67 essais au registre, 66 anciens conservés. Les jours, semaines,
deux coûts et deux modes ne sont pas des stratégies supplémentaires.
Août est marqué consommé pour ce portefeuille ; les autres protocoles,
collectes et activations ne changent pas.

## Gel et vérification

Avant performance : test de l'identité des règles d'exécution, des dates
autorisées, du découpage lundi/dimanche, du 31 août, de la continuité des
soldes et de l'arrêt terminal, de la séparation entre absence et zéro et des
sommes quotidiennes/hebdomadaires. Geler protocole, sources, tests, moteur,
agrégateur, runner et dépendances avec un commit local avant résultat.
Le runner vérifie les préfixes de signaux et de comptes à chaque fin de séance,
refuse de remplacer des résultats existants et archive les détails privés.
