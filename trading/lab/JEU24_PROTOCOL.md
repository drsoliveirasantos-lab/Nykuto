# Jeu 24 — déclencheur par contexte combiné

Version jeu24-combined-context-v1. Une hypothèse préenregistrée avant tout calcul
financier : le retour sur la zone d'ouverture du Jeu 23 peut être de meilleure
qualité lorsque cinq familles de signes clôturés sont cohérentes avec son sens.
Il ne s'agit ni de copier une stratégie inconnue d'associés, ni de promettre un
revenu hebdomadaire. Le registre contient 33 configurations des Jeux 19–23.

## Motif et distinction avec les essais précédents

Le Jeu 23 admet les retours successifs et quatre plafonds, mais ne conditionne
pas l'entrée aux motifs du module Analyse. Le Jeu 11 avait déjà éliminé toutes
les entrées avec ses quatre filtres, dont tendance horaire et englobante.
Cette expérience distincte conserve le déclencheur cassure/retour du Jeu 23 et
réunit des familles explicitement définies ci-dessous. Les figures de bougies
sont des alternatives ; elles ne doivent pas toutes apparaître simultanément.
Une baisse du nombre d'entrées peut invalider cette hypothèse. Aucun filtre ne
sera retiré, ni seuil changé, après consultation des résultats.

## Déclencheur causal figé

Sur chaque signal de retour du Jeu 23, exiger toutes les conditions suivantes :

1. Tendance : EMA 9 supérieure à EMA 21 et clôture au-dessus du VWAP de séance
   pour un achat ; inverses stricts pour une vente. Au moins 21 bougies réelles.
2. Structure : les deux derniers sommets confirmés et les deux derniers creux
   confirmés montent pour l'achat, descendent pour la vente. Un pivot strict
   exige deux bougies de chaque côté ; il n'est connu qu'à la clôture de la
   deuxième bougie de droite. La fenêtre de cinq bougies ne traverse pas la
   nuit. Une structure mixte ou insuffisante refuse le signal.
3. Dynamique : RSI de Wilder 14 strictement supérieur à 50 pour l'achat,
   inférieur à 50 pour la vente. La série plate donne 50, donc aucun accord.
4. Volume : volume de la bougie de signal au moins égal à la moyenne du même
   créneau de cinq minutes des cinq séances complètes précédentes du même
   contrat. La séance courante est exclue de la référence. Référence absente
   ou nulle : signal refusé.
5. Figure : achat si englobante haussière, forme de marteau OU corps haussier
   dominant ; vente si englobante baissière, longue mèche haute OU corps
   baissier dominant. Doji exclu. Règles descriptives du module existant :
   englobante de corps opposés avec au moins un dépassement strict ; mèche
   principale ≥2 corps et opposée ≤1 corps, corps >10 % de l'amplitude ;
   corps dominant ≥80 % de l'amplitude. Un marteau décrit ici une forme, pas
   une probabilité de retournement démontrée.

EMA et RSI sont initialisés sur la première observation et les 14 premières
variations respectivement. EMA, RSI et historique de pivots confirmés persistent
entre séances complètes consécutives du même contrat. Ils sont remis à zéro
à toute séance attendue manquante ou passage d'échéance. Les variations de nuit
entre clôture précédente et première observation réelle sont incluses dans
EMA/RSI, sans bougies nocturnes inventées. Le VWAP HLC3 pondéré par volume repart
à zéro à 09:30 New York chaque jour ; son calcul utilise les ticks entiers.
Le volume de référence ne traverse jamais une lacune ni un changement de
contrat. Les jours de préparation restent comptés dans la couverture.

Les cinq familles sont un filtre d'entrée, pas un score de confiance calibré.
Les actualités économiques et toutes les méthodes possibles d'analyse ne sont
pas couvertes par cette expérience. Le plafond de risque ne dépend pas du
nombre de signes : les cinq sont toujours obligatoires.

## Exécution, risques et coûts conservés

MNQ, MES, MYM et MGC × plafonds 50 / 75 / 100 / 150 USD, soit seize nouvelles
configurations et 49 cumulées. Un microcontrat. Le Jeu 23 fournit sans changement
les signaux, stops structurels, prochain open causal, cible 1,5 R, ratio net
minimal 1, maximum un trade exécuté par sens et deux par jour. Zone 09:30–10:00,
retour distinct dans les 30 minutes suivant une cassure, entrée au plus tard
12:00 New York. Un refus ne consomme pas le sens ; aucune entrée rétrospective.

Plafonds frais compris ; limite quotidienne = deux fois le plafond, réserve
100 USD. Compte simulé 25K, MLL 1 000 USD, verrouillage 25 100 USD, objectif
1 250 USD, cohérence 50 %, sans modification des règles du fournisseur.
Spécifications et calendriers archivés inchangés : tick/multiplicateur MNQ
0,25/2 USD, MES 0,25/5 USD, MYM 1/0,50 USD, MGC 0,10/10 USD. Frais 2,50 USD
aller-retour plus un tick par côté : respectivement 3,50 / 5 / 3,50 / 4,50 USD.
Le stress double tous ces coûts. Les gaps peuvent dépasser une perte prévue.

## Données, comparaison et sélection

Archives privées identiques : Jeu 19 pour MES/MYM/MGC, Jeu 14 pour MNQ. Les
lacunes du 6 mars et du 25 février MGC restent bloquantes. Aucune interpolation
ni exclusion déclarée complète. Même calendrier explicite et mêmes échéances.
Les transactions témoins du Jeu 23 sont lues depuis son archive vérifiée,
jamais recalculées comme un nouvel essai. Comparaison à marché, plafond,
fenêtre, coût et mode compte identiques ; sommes des trades identiques,
ajoutés et retirés conservées. Comparaison supplémentaire des nouveaux profils
au nouveau 50 USD, sans autre sélection. Les comparaisons portent sur les mêmes
observations et ne prouvent pas l'effet causal isolé de chaque filtre.

Janvier–février et mars–avril 2026 : développement uniquement. Critères conservés :
deux fenêtres entièrement couvertes ; ≥40 trades au total et ≥12 par fenêtre ;
chaque fenêtre positive en R et USD ; PF global en R ≥1,1 ; drawdown réalisé
≤8 R ; total positif en R et USD aux coûts doublés ; comptes complets normaux
et stress sans franchissement de seuil. Classement seulement parmi les profils
respectant tous ces critères : pire espérance par fenêtre, puis drawdown,
puis ordre MNQ/MES/MYM/MGC et plafonds croissants. Aucun seuil assoupli.

Sélection figée par empreinte avant toute performance mai–juin/juillet–août.
Sans candidate : réserve non calculée. Sinon une seule candidate, une seule
lecture financière réservée, sans second choix. Les dates déjà vues ou
corrélées ne sont pas indépendantes ; confirmed=false et independent=false.
Confirmation future obligatoire : trois fenêtres inédites et complètes,
octobre–novembre 2026, décembre 2026–janvier 2027, février–mars 2027, candidate
fixée avant observations et critères gelés conservés. Une observation utilisée
en développement ne peut plus confirmer indépendamment.

## Traçabilité et contrôles avant performances

Le code, ses dépendances, ce protocole, les dates, sources et empreintes sont
figés puis commités avant lancement. Cas synthétiques : familles obligatoires,
figures alternatives, volume sans séance courante, RSI neutre, pivots retardés,
préfixes sans futur, lacunes, passages d'échéance et intégration réelle avec
le simulateur à un contrat. Sur données réelles, vérifier les contextes au
préfixe de chaque signal, l'admission de chaque trade et tous les préfixes
journaliers des comptes simulés. Les résultats financiers ne servent pas à
ajuster ces contrôles. Aucun fichier gelé ne change après résultats.

Pour chaque marché, publier nombre de signaux de retour, accords par famille,
contexte indisponible et entonnoir cumulatif dans l'ordre tendance, structure,
dynamique, volume, figure. Les désaccords peuvent se chevaucher ; un signal
filtré n'est pas encore un trade exécuté. Conserver aussi les jours positifs,
négatifs, plats actifs et sans trade, et tous les résultats négatifs.

Sources, trades et décisions individuelles restent privés dans TRADING_DATASETS,
préfixe versionné jeu24/combined-context-v1/, avec tailles, SHA-256 et lecture
de vérification. GitHub contient uniquement code, protocole et agrégats. Paper
Bot, Shadow, broker et flux réel désactivés. Aucune collecte existante modifiée.

Référence méthodologique : [Bailey et al., Probability of Backtest Overfitting](https://scholarworks.wmich.edu/math_pubs/42/).
Multiplier les essais sur les mêmes observations exige de conserver les échecs
et une confirmation non consultée ; cela ne crée pas une garantie de gain.
