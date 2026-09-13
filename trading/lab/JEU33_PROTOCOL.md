# Jeu 33 — compte 50K et risque réduit

Protocole fixé avant calcul. Demande : continuer sur LucidFlex 50K, expliquer la
cohérence 50 %, améliorer les profils de marché. Recherche sur données déjà vues ;
aucune qualification indépendante, activation ou commande de trading.

## Comparaison limitée

Quatre configurations : 25K et 50K, chacune avec plafond fixe 100 dollars ou
réduction 100 → 50 → 25. Le 25K est le témoin ; le 50K est le compte demandé.
Quatre fenêtres : juin, juillet, août 2026, puis juin–août sans réinitialisation.
Deux coûts : normaux et doublés (commission et slippage, pas le ratio gain/risque).
32 replays ; les fenêtres et coûts ne sont pas des confirmations indépendantes.
Les comptes mensuels repartent du nominal. Ne jamais additionner ces résultats
pour annoncer le résultat du compte continu.

## Signaux et risque

Reprendre exactement les signaux Jeu 31 et la sortie fixe 2R du Jeu 32 : MES
retour après cassure, hors RSI extrêmes ; MGC échec de cassure, entrée avant
11:00 New York ; MNQ et MYM retour après cassure. Les spécifications du produit
(tick, multiplicateur, frais et bornes de stop) restent propres au marché.
Les anciens déplacements de stop de MNQ/MYM ne s'appliquent pas à cette variante
2R à stop fixe. Le H1/M5 rejeté n'est pas rajouté. Aucun nouveau filtre ne sera
choisi après lecture du résultat. Tous les profils restent non qualifiés.

Stop structurel inchangé, quantité entière ajustée au plafond tout compris,
vingt micros maximum (plafond interne commun), deux entrées par jour au total,
une position, priorité MES/MGC/MNQ/MYM conservée, réserve de seuil 100 dollars,
limite quotidienne interne 200 dollars et freins existants. Le compte 50K
autorise officiellement jusqu'à quarante micros en évaluation : le test retient
volontairement un plafond interne inférieur. Ni le stop ni le nombre d'entrées
ne sont élargis pour forcer un gain journalier.

Le risque réduit utilise la distance solde−seuil : 100 dollars à partir de 1 000,
50 sous 1 000, 25 sous 500. Les bornes sont strictes. Après une réduction,
réaugmentation uniquement avec solde au moins initial ET marge suffisante.
Frais compris dans le budget. Si un micro dépasse le budget, aucune entrée.

## Modèle LucidFlex

Évaluation seulement : 25K / MLL 1 000 / cible 1 250 et 50K / MLL 2 000 /
cible 3 000. Le seuil monte aux clôtures et se bloque au nominal +100. Un
contact intraday avec le seuil invalide le compte. Fills conservateurs aux
gaps et si stop et cible sont touchés dans la même bougie.

Cohérence : meilleure journée / bénéfice net cumulé ≤50 %, bénéfice cumulé
au moins égal à la cible. Une journée trop grande demande davantage de
bénéfice total ; ce n'est pas une invalidation automatique. Lucid publie un
exemple de tolérance (1 560 dollars pour 3 000 de bénéfice sur 50K), mais
précise que ce n'est pas un montant fixe pour tous les cas. Le modèle reste
volontairement à 50 % stricts, avec mention explicite de cette limite. Il ne
prétend pas reproduire une décision Lucid dans la zone de tolérance.
Arrêt en fin de séance lorsque les conditions conservatrices sont remplies.
Le funded n'a pas de cohérence 50 %. Les retraits/scaling/passage funded ne
sont pas simulés et les bénéfices du test ne sont pas des revenus retirables.

Sources officielles vérifiées le 9 septembre 2026 :
- https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account
- https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown
- https://support.lucidtrading.com/en/articles/12945805-lucidflex-consistency-percentage
- https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account

## Reproduction et décision

Les dépendances absentes du site sont importées à l'identique du commit
9df4d691122ff6b2137da4bc93e30a4ddf1aac31. Aucun ancien fichier gelé n'est modifié.
Huit contrôles reproduisent le Jeu 32 archivé (150 dollars, 2R, compte 25K),
puis huit contrôles vérifient l'équivalence du nouveau moteur à ce réglage.
Contrôle des quantités, PnL, limites et préfixes de chaque journée simulée.
Un seul gel et aucune recherche de paramètres supplémentaire après le calcul.
Tous les essais sont comptabilisés, même perdants. Comparer coûts, baisse
maximale, contributions et semaines complètes ; ne pas sélectionner sur le seul
total. Les semaines tronquées par fenêtre ou arrêt ne comptent pas comme
semaines complètes. L'échantillon est exploratoire quel que soit le résultat.

Sources : archives privées Jeu 19 (dataset), Jeu 14 (MNQ), Jeu 32 (contrôle),
empreintes dans jeu33-source.json et jeu33-freeze.json. Données brutes et
trades individuels restent hors Git. Rapport agrégé public dans le Lab.
