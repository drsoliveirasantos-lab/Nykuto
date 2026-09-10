# MNQ — gain net par trade : protocole borné v1

Gel avant performance, à la demande de Diego le 10 septembre 2026.
Objectif personnel : comprendre comment obtenir des gagnants de 100–200 USD.
Ce n'est pas une promesse de gain sur chaque trade ni une moyenne garantie.

## État antérieur et nouveauté

Lire RESEARCH_LESSONS.md, research-catalog.json, JEU37_RESULTS.md,
JEU35_RESULTS.md et JEU46_PROTOCOL.md. Les politiques à 250/500 USD et les
extensions 3R ont déjà échoué à leurs critères. Elles ne sont pas réintroduites.
La référence conserve la sortie MNQ30 du Jeu45. La sortie structurelle46,
Kronos, les filtres horaires rejetés et les scores non calibrés ne sont pas ajoutés.

Le catalogue existant reste à 128 clés / 111 entrées du registre au gel.
Cette campagne est distincte, MNQ seul, sur le corpus TradingView PR101.
Elle ne reproduit PAS le portefeuille multi-marchés archivé des Jeux40–46.
Après lecture des résultats, enregistrer toutes les configurations exécutées,
y compris les rejets, sans réécrire les anciens protocoles ni ajuster les seuils.

## Paramètres figés

`profit-study-policy.mjs` est la source exécutable. Quatre profils :

| Profil | Risque planifié maximum, frais compris | Cible nette minimale avant admission |
|---|---:|---:|
| reference100 | 100 USD | garde historique seulement |
| risk150 | 150 USD | garde historique seulement |
| risk200 | 200 USD | garde historique seulement |
| net100-risk100 | 100 USD | 100 USD |

Chaque variante change UNE dimension. Le dernier filtre regarde le gain net
possible à la cible existante ; il ne prédit pas que la cible sera atteinte.
Il peut retirer des gagnants et autoriser de nouvelles entrées après un refus.
Toutes les décisions et les comptes sont donc rejoués, jamais multipliés après coup.

Compte HYPOTHÉTIQUE 50K funded, neuf chaque mois ; max loss 2 000 USD,
réserve au seuil de 100 USD, limite INTERNE quotidienne de 200 USD inchangée.
Plafond 20 micros, quantités entières. Réduction native 1 / 0,5 / 0,25 selon
la marge restante au seuil. Aucun risque choisi d'après un score de confluence.
Stops structurels inchangés, cible brute 2R, sortie MNQ30 et règles natives
journalières, d'occupation, de fin de séance et de retrait simulé conservées.
Un gap peut dépasser le risque planifié ; le seuil de compte reste contrôlé.
L'option de limite journalière du contrat Lucid personnel n'est pas vérifiée.

Coûts normaux 3,50 USD/contrat aller-retour ; stress 7 USD : hypothèses
héritées, pas le tarif du compte de Diego. Un MNQ vaut 2 USD par point.
Le stress recalcule les tailles et les admissions, il ne double pas le risque.
Exemple de calcul, pas de performance : stop à 10 points, risque100 →
4 contrats, perte planifiée94, cible nette146. Risque150 → 6 contrats,
perte141, cible219. Risque200 → 8 contrats, perte188, cible292.

## Données et exécution

Source : commit061eb66a3d95b5a93119eaf6622c71b85a440207,
corpus mnq1-tradingview-rth-m5-2026-05-25_2026-09-10, checksum vérifié
par le loader existant. Les données source sont des exports M1, mais
**ce test exécute le moteur M5**, pas un simulateur M1 ou tick.
Mai sert à préparer les contextes. Juin, juillet et août sont les trois mois
notés. Septembre n'est pas noté ; aucune réserve indépendante n'est revendiquée.
Le calendrier cash hérité exclut notamment les19juin/3juillet. Ce n'est pas
un calendrier de toutes les séances CME. Toute séance attendue incomplète
est exclue, listée avec raison, et bloque le verdict positif de couverture.
Aucune bougie ni aucun autre marché n'est fabriqué pour remplir un trou.
MNQ1! est une série continue ; réglages de rollover/back-adjustment non vérifiés.
Ne pas l'assimiler aux contrats natifs de l'archive historique.

Le moteur45 reste octet pour octet inchangé (blob Git
0b934165ccb636c1060d39de02055bd422d6436e). L'adaptateur Node vérifie cette
identité puis applique six substitutions à occurrence unique en mémoire :
validation MNQ seul, parcours des profils présents, paramètre d'expérience,
plafond de compte interne, risque demandé MNQ, filtre de cible nette.
Les imports ne visent que les fichiers locaux du checkout. Une divergence de
source arrête l'expérience. Le profil reference100 conserve le compte natif
entier dans les tests à quatre flux synthétiques ; ces tests ne prouvent pas
une rentabilité. Les signaux MNQ sont ceux de admissionSignals, sans inventer
une exigence H1 alignée qui n'existe pas dans cette entrée native.

24 relectures complètes : 4 profils × 3 mois × 2 coûts. Chaque préfixe de
journée reconstruit les entrées/contextes puis rapproche trades, journées et
décisions avec la relecture complète. Pas de sélection ni d'optimisation en boucle.
Le runner exige le SHA publié et un checkout propre ; il refuse un répertoire
résultat existant. Le workflow ne calcule la performance qu'à l'ouverture
initiale de la PR, tentative1 ; les commits suivants ne relancent que les tests.

## Mesures et verdict fixés avant calcul

Publier par mois/coût : net total, nombre de trades, moyenne incluant les pertes,
gain moyen des gagnants, perte moyenne, taux observé, profit factor, frais,
nombre de gagnants ≥100 et ≥200 USD, taille maximale, risque planifié maximal,
refus, ambiguïtés M5, dépassements et drawdown RÉALISÉ. Ne pas présenter ce
dernier comme une mesure des excursions intratrade effectivement observées.

Une candidate passe le critère descriptif seulement si les six cellules ont
un net non inférieur et un drawdown réalisé non supérieur au reference100,
sans dépassement de compte ni donnée manquante. Le total et la moyenne de
tous les trades agrégés doivent s'améliorer strictement aux DEUX coûts.
L'absence de trades ou de cellules échoue. Une hausse du risque n'est donc
pas qualifiée d'amélioration parce qu'elle amplifie mécaniquement les montants.
Même un succès garde selection=null, confirmed=false, executionAllowed=false.
Tous ces mois sont déjà observés : aucune confirmation indépendante.

Rapports agrégés et empreintes des comptes en artefact GitHub ; pas de prix
ni de trades détaillés supplémentaires en Git ou dans les logs publics.
Aucun ordre, broker, flux live, abonnement payant, changement de collecte,
activation Paper/Shadow ou déploiement du site public.

## Sources externes vérifiées le 10 septembre 2026

- CME, spécifications MNQ : https://www.cmegroup.com/markets/equities/nasdaq/micro-e-mini-nasdaq-100.html
- LucidFlex drawdown : https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown
- LucidFlex funded/scaling : https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account ; https://support.lucidtrading.com/en/articles/12945808-lucidflex-scaling-plan

Ces sources donnent les spécifications et limites, pas un avantage prouvé.

## Lancement / suivi

Le workflow lance la campagne une fois puis archive report.json, REPORT.md et
status.json. Après lancement, donner la durée estimée et arrêter la surveillance.
Un prochain « Vérifie » lit les résultats ; il n'autorise pas un réglage des
seuils, un nouveau backtest ou une fusion automatique.
