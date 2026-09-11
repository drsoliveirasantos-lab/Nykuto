# Jeu 25 — risque gradué selon le contexte

Version jeu25-graded-risk-v1, déclarée avant performances. Une seule hypothèse,
quatre nouvelles configurations (MNQ, MES, MYM, MGC), portant le registre des
Jeux 19–25 à 53. Aucun ancien résultat n'est effacé ou compté de nouveau.

## Hypothèse et défaut concret

Le filtre strict du Jeu 24 ne conserve que 6 des 209 signaux de retour et
0–2 trades par configuration. Diego propose de garder un petit budget quand
les confirmations sont partielles et un budget supérieur quand elles sont
complètes. L'hypothèse est de préserver davantage d'occasions que le filtre
strict, tout en limitant l'admission des stops larges aux contextes concordants.
Elle n'établit aucune probabilité de gain. Les seuils ci-dessous ne seront pas
ajustés après résultats.

## Conditions indispensables et budget autorisé

Les conditions indispensables restent celles du Jeu 23 : séance validée,
zone d'ouverture complète 09:30–10:00 New York, cassure clôturée puis retour
distinct dans les 30 minutes, bougie de retour directionnelle clôturée,
entrée au prochain open au plus tard 12:00, stop structurel valide un tick
au-delà de la mèche, prix d'entrée hors de la zone et ratio gain/risque net ≥1.
Les limites de compte, la réserve et les freins journaliers restent obligatoires.

Les cinq familles supplémentaires sont calculées sans modification par le
module gelé du Jeu 24 : tendance EMA9/21 + VWAP de séance, structure de pivots
confirmés, RSI14 directionnel, volume au même créneau sur cinq séances complètes
antérieures du même contrat, et figure de bougie directionnelle. Englobante,
marteau/mèche haute ou corps dominant sont des alternatives. Chaque famille
compte une fois, sans pondération apprise et sans présenter le score comme
une probabilité.

| Contexte au signal clôturé | Plafond frais compris |
| --- | ---: |
| Préparation supplémentaire insuffisante, quel que soit le score partiel | 50 USD |
| Préparation disponible, 0 à 2 familles concordantes | 50 USD |
| Préparation disponible, 3 ou 4 familles concordantes | 75 USD |
| Préparation disponible, les 5 familles concordantes | 150 USD |

Une confirmation supplémentaire manquante ou contradictoire ne remplace jamais
le déclencheur indispensable. L'absence d'historique suffisant pour un indicateur
est explicitement distinguée d'une séance source incomplète : elle autorise
uniquement le petit plafond sur les séances réellement complètes. Les lacunes
sources restent bloquantes pour qualifier une fenêtre. Aucun remplissage de
bougies, aucune journée incomplète déclarée complète.

Le budget se décide à la clôture du signal. Les conditions réelles du prochain
open peuvent encore refuser l'entrée, mais ne réévaluent pas les signes avec
les extrêmes futurs. Pendant une position, le stop, la cible et le budget
journalier ne changent pas selon de nouvelles bougies.

## Un plafond ne multiplie pas les gains d'une même opération

Quantité toujours égale à un microcontrat. Le stop reste structurel et la cible
reste à 1,5R arrondie au tick ; ni l'un ni l'autre n'est éloigné pour consommer
un budget. Si une opération est identique et admissible à plusieurs plafonds,
son résultat est identique au centime. Les scénarios comparés ne sont pas des
gains distincts à additionner. Cette étude porte sur l'admission conditionnelle,
pas sur une augmentation du nombre de contrats.

Limite quotidienne interne fixe de 300 USD pour tous les niveaux, indépendante
du dernier score ; réserve de seuil 100 USD. Cela conserve l'enveloppe du témoin
constant à 150 USD du Jeu 23 et évite qu'un changement de score déplace un
stop journalier en cours de position. Le plafond 300 USD est une limite
interne déjà étudiée, pas une règle du fournisseur. Le reste du moteur conserve
au plus un trade exécuté par sens, deux par séance, une seule position, les
arrêts en R et les suites de pertes. Les gaps peuvent dépasser la perte prévue.

Compte LucidFlex 25K simulé : MLL 1 000 USD, seuil verrouillé à 25 100 USD,
objectif 1 250 USD et cohérence 50 %. Règles vérifiées le 9 septembre 2026 :
[LucidFlex évaluation](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account).
Dimensionnement à partir d'un stop logique et d'un budget :
[CME](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size).
Aucun pourcentage du nominal n'est traité comme une marge réellement disponible.

Spécifications conservées (tick / multiplicateur USD par point) : MNQ 0,25 / 2 ;
MES 0,25 / 5 ; MYM 1 / 0,50 ; MGC 0,10 / 10. Coût 2,50 USD aller-retour plus
un tick par côté, soit 3,50 / 5 / 3,50 / 4,50 USD. Stress = double de l'ensemble.
Les mêmes niveaux de score sont utilisés dans les deux hypothèses de coûts.

## Comparaisons et sélection avant toute réserve

Témoin principal : Jeu 23 à plafond constant 150 USD, limite quotidienne 300,
mêmes signaux, stop, cible, périodes et frais. Témoin secondaire : filtre strict
du Jeu 24 à plafond 150 USD et limite quotidienne 300. Les deux sont lus dans
les archives vérifiées en taille et SHA-256, sans recalcul des simulations ni
nouveau comptage d'essais. Leurs trades sont appariés par prix, horodatages,
sens, stop, cible et frais : identiques, ajoutés, retirés, différences de sommes.
Les différences de net normal, net stress et drawdown USD sont publiées, sans
choisir après coup un seul indicateur favorable. Un effet favorable descriptif
ne suffit pas à qualifier un profil.

Données privées Massive inchangées : Jeu 19 pour MES/MYM/MGC et Jeu 14 pour MNQ,
calendriers et passages d'échéance explicites hérités, mêmes lacunes du 6 mars
et du 25 février MGC. EMA/RSI et historique de pivots confirmés persistent entre
séances complètes consécutives du même contrat et repartent à zéro à toute
séance attendue manquante ou échéance. VWAP remis à zéro à chaque séance ;
référence de volume uniquement sur cinq séances complètes antérieures du même
contrat. Aucune observation indépendante supplémentaire n'est revendiquée.

Développement : janvier–février puis mars–avril 2026. Critères inchangés :
couverture entière de chaque fenêtre, ≥40 trades au total, ≥12 par fenêtre,
chaque fenêtre positive en R et USD, PF global en R ≥1,1, drawdown réalisé ≤8R,
total positif en R et USD aux coûts doublés, comptes complets normaux et stress
sans violation du seuil. Classement parmi les profils respectant tous les
critères : pire espérance par fenêtre, puis drawdown en R, puis ordre
MNQ/MES/MYM/MGC à égalité. Pas de relâchement ni d'autre profil testé.

Sélection figée avant les performances mai–juin et juillet–août ; sans
candidate, réserve non calculée. Une seule candidate éventuelle, sans second
choix après réserve. Dates déjà vues ou corrélées : independent=false et
confirmed=false. Qualification ultérieure soumise à trois fenêtres inédites
complètes, octobre–novembre 2026, décembre 2026–janvier 2027, février–mars 2027,
avec candidate fixée avant observation et critères conservés. Toute observation
consultée pour le développement perd son caractère indépendant.

## Vérifications et conservation

Avant calcul financier : protocole, code et dépendances, tests synthétiques,
sources et empreintes figés puis commités. Tests des 32 combinaisons de familles,
préparation manquante, passage 50/75/150, stop structurel inchangé, refus d'un
stop trop large au niveau moyen, exécution partielle refusée par le filtre
strict, préfixes et budgets. Pendant calcul : préfixes des signaux et contextes,
préfixes des comptes, plafond attribué de chaque trade et rapprochement des
deux témoins. Aucun fichier gelé ne change après performance.

Le rapport conserve les quatre résultats, les huit critères, les deux fenêtres,
comptes complets ou incomplets, coûts normaux/doublés, jours positifs/négatifs/
plats/sans trade, nombre de signaux par niveau et trades/net/risque prévu moyen
par niveau. Ces groupes sont descriptifs et ne sont pas une nouvelle recherche
de seuils après résultats. Les données et décisions individuelles restent
privées dans TRADING_DATASETS, préfixe versionné jeu25/graded-risk-v1/, avec
SHA-256, tailles et lecture après écriture. Anciennes archives préservées.

Paper Bot, Shadow, broker et exécution réelle désactivés. Aucune souscription,
ordre ou modification des collectes existantes. Les tests logiciels ne prouvent
pas une rentabilité et aucun gain journalier/hebdomadaire n'est promis.
