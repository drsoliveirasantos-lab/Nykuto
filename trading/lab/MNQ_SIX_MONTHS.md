# Jeu 09 — MNQ sur six mois supplémentaires

Protocole fixé le 8 septembre 2026 avant récupération des prix et calcul.
Objectif : tester la même stratégie MNQ sur davantage de transactions, pendant
janvier–février, mars–avril et mai–juin 2026. Aucun paramètre ne sera ajusté sur
les résultats. Les jeux précédents et le Jeu 08 prospectif sont conservés.

Ce test est rétrospectif et complémentaire : les dates janvier–juin 2026 ont déjà
été examinées sur SPY au Jeu 04, marché corrélé au Nasdaq. Le MNQU6 de juin a
également servi à préparer le diagnostic de juillet. Ce n’est donc pas une
confirmation indépendante entièrement vierge ni une collecte prospective.
Les résultats seront intégralement rapportés, même en cas de pertes.

## Calendrier et contrats fixés

Score du 1er janvier au 30 juin 2026 inclus, bougies 15 minutes durant la séance
cash NYSE. Préparation et roulements séparés :

| Contrat | Préparation dès | Évaluation dès | Fin exclusive |
| --- | --- | --- | --- |
| MNQH6 | 2025-12-01 | 2026-01-01 | 2026-03-16 |
| MNQM6 | 2026-02-16 | 2026-03-16 | 2026-06-15 |
| MNQU6 | 2026-05-15 | 2026-06-15 | 2026-07-01 |

Roulement le lundi de la semaine d’expiration, comme au Jeu 06, avant les
échéances. Préparation de ≥220 bougies par contrat, sans concaténation des prix
bruts entre contrats et sans report de position ou signal la nuit.

Calendrier annoncé NYSE vérifié le 8 septembre 2026 : fermé le 25 décembre 2025,
les 1er et 19 janvier, 16 février, 3 avril, 25 mai et 19 juin 2026. Le 24 décembre
2025 ferme à 13 h ; autres séances 9 h 30–16 h, America/New_York. Les horaires
réels fournis par Massive doivent couvrir chaque séance ; les pauses et trous
restent bloquants. Les bougies des jours fériés sont exclues selon leur date
réelle à New York, jamais seulement leur date de règlement.

Source calendrier :
https://ir.theice.com/press/news-details/2024/NYSE-Group-Announces-2025-2026-and-2027-Holiday-and-Early-Closings-Calendar/default.aspx

## Moteur et critères inchangés

Moteur `simulateMarket` du Jeu 06 : EMA9/21, ADX14 ≥20, ATR14 ×1,25, cible 1,5 R,
entrée à l’ouverture suivante, une position, ≤3 entrées/jour, arrêt après deux
pertes consécutives ou −2 R réalisés. Stop prioritaire sur bougie ambiguë,
gap défavorable à l’ouverture, sortie à l’ouverture de la dernière bougie cash.
Tick 0,25 point, multiplicateur 2 $/point, coût hypothétique 3,50 $ aller-retour
par contrat, puis nouvelle simulation à 7 $. Frais du courtier et marges inconnus.
Ce calcul en R n’est pas un rendement de compte à capital constant.

Critères de recherche : ≥40 transactions au total, ≥12 par fenêtre, moyenne
nette positive dans chaque fenêtre, PF ≥1,10, baisse réalisée ≤8 R et résultat
positif avec coûts doublés. Un passage de ces seuils est seulement une piste
rétrospective à examiner ; l’indépendance reste non satisfaite dans ce jeu.
Paper Bot et Shadow restent désactivés quelle que soit l’issue.

## Disponibilité avant prix

Le 8 septembre, la requête horaires MNQ / XCME du 1er décembre 2025 au 30 juin
2026 a renvoyé 898 lignes sans pagination. Elle ne contient pas de prix. Les
contrats et expirations sont vérifiés dans le référentiel Massive avant la
récupération. Les horaires identiques sont dédupliqués pour le contrôle seulement.
Aucune séance manquante ne sera interpolée ou éliminée pour améliorer le résultat.

Données privées uniquement dans TRADING_DATASETS, sous une nouvelle clé Jeu 09,
épinglées par SHA-256 et servies derrière l’accès nominatif existant. Aucun prix,
compte ou secret dans Git. Le site doit permettre un recalcul d’un clic, sans
import manuel, et afficher l’état des données séparément du verdict de recherche.

## Amendement de disponibilité avant tout résultat — version 2

Le contrôle des 4 768 bougies cash échoue le 6 mars 2026 : MNQH6 et MNQM6 n’ont
pas les bougies 10 h 15 et 10 h 30 New York. Un nouvel appel 15min confirme le
trou. L’appel 1min MNQH6 contient seulement quatre minutes entre 10 h et 11 h,
ce qui ne permet pas de reconstruire les prix. Aucun résultat de stratégie
n’a été calculé (`calculated:false`, performances nulles). Le snapshot initial
incomplet est conservé séparément ; aucune interpolation ni substitution NQ.

Diego a explicitement demandé de remplacer les périodes indisponibles. La
nouvelle sélection est fixée avant récupération des prix supplémentaires et
avant tout calcul : **janvier–février, avril–mai, juillet–août 2026**. Ce sont
six mois non consécutifs sur huit mois calendaires ; mars et juin ne sont pas
évalués. Ne pas présenter le cumul ou la baisse comme un suivi continu annuel.
Trois blocs de deux mois se terminent avant les échéances, sans raccordement.

| Contrat | Préparation dès | Évaluation dès | Fin exclusive |
| --- | --- | --- | --- |
| MNQH6 | 2025-12-01 | 2026-01-01 | 2026-03-01 |
| MNQM6 | 2026-03-09 | 2026-04-01 | 2026-06-01 |
| MNQU6 | 2026-06-01 | 2026-07-01 | 2026-09-01 |

Les expirations Massive vérifiées au 2 mars 2026 sont respectivement les
20 mars, 18 juin et 18 septembre 2026. Exclure aussi le 3 juillet, férié NYSE.
Les paramètres et coûts restent identiques. La préparation ne compte jamais
dans la performance. Juin est utilisé seulement pour préparer MNQU6.
Les mois sur SPY et une partie de juillet MNQ ont déjà été vus : test
complémentaire rétrospectif, indépendance non satisfaite et bot désactivé.

## Résultat calculé et audité — 8 septembre 2026

183 séances de données/préparation complètes, 4 746 bougies cash ; 123 séances
évaluées, réparties en 39 / 41 / 43. Préparations séparées : 560 / 442 / 546
bougies. Les prix, ticks, calendriers, horaires et pagination passent tous.

| Période | Trades | Gagnants | Net R | Coûts doublés R | Profit factor |
| --- | ---: | ---: | ---: | ---: | ---: |
| Janvier–février | 16 | 6 | −1,043394 | −1,374020 | 0,871697 |
| Avril–mai | 17 | 7 | +1,731661 | +1,413725 | 1,217479 |
| Juillet–août | 16 | 8 | +1,408780 | +1,136394 | 1,229434 |
| Périodes retenues | 49 | 21 | +2,097047 | +1,176098 | 1,094313 |

Baisse maximale réalisée sur les périodes retenues : 5,620141 R (stress
5,789543 R). Réussite 42,86 %, moyenne +0,042797 R. Les seuils de nombre de
transactions, baisse et frais doublés passent. Janvier–février perd et le profit
factor **1,094313 < 1,10 avant arrondi** : verdict **Non confirmé**.
L’indépendance reste également non satisfaite ; aucun bot activé.

Les 98 transactions normales et stressées ont été contrôlées séparément :
résultat reconstruit en dollars puis en R, chronologie, entrées/sorties dans
la même séance, absence de chevauchement, coûts, trois entrées maximum,
freins après pertes, cumul et baisse maximale. Les 53 tests de régression
incluent les jeux précédents, l’isolation des comptes et les nouveaux contrôles.

Snapshot privé final `jeu09/mnq-six-months-v2.json`, 331 299 octets, SHA-256
`43bb1959f4fbb2db25b0fbe306beb1e7599602b6d1d7df2babbc214bf4e01a15`.
L’essai incomplet reste archivé sous `jeu09/unavailable-jan-jun-v1.json`.
Le chargement via `/api/lab/jeu09` vérifie la signature Access puis le navigateur
vérifie taille et SHA-256 avant de recalculer, sans appeler de courtier.

Sources de préparation : `scripts/prepare-trading-six-months.mjs` transforme
les captures CSV privées avec le calendrier figé. Ne pas relancer avec des
fichiers tronqués ou une pagination non terminée. Les CSV et leurs prix ne sont
pas committés. `mnq-six-months-policy.mjs` et `MNQ_SIX_MONTHS.md` conservent
les décisions fixées avant les résultats ; aucune recherche de paramètres.
