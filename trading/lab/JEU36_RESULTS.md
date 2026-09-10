# Jeu 36 — la confirmation M5 ne remplace pas les entrées actuelles

**Les deux variantes échouent au critère fixé avant calcul.** L’attente améliore
juillet sur le Nasdaq, mais dégrade juin et août. Sur le S&P, elle améliore août,
mais dégrade juillet. La référence reste inchangée, avec une cible 2R.

36 replays terminés, dont 12 témoins complets identiques au Jeu 35. Juin,
juillet et août repartent chacun de 50K. Évaluation et funded hypothétique
restent séparés. Aucun objectif de retrait personnel de 1 000 EUR atteint.
Les données ont déjà servi au développement ; aucun résultat n’est une
confirmation indépendante.

## Ce qui a été amélioré dans le système de recherche

Le bot dispose maintenant de variantes d’entrée testables séparément par
marché, d’une annulation si le stop est touché pendant l’attente, et d’un
rapprochement des trades par leur retest d’origine. Le suivi montre les
entrées confirmées mais encore refusées pour le risque ou la place disponible.
Ces outils sont conservés ; les variantes qui dégradent les résultats restent
inactives. Aucune hausse de risque pour compenser les entrées manquées.

## Décision par marché

| Marché | Décision | Ce que montre le test |
|---|---|---|
| MNQ — Nasdaq | Garder le retest et 2R | L’attente élimine les sept entrées de juin, dont six gagnantes ; juillet s’améliore, août se dégrade |
| MES — S&P | Garder le retest, RSI 30/70 et 2R | L’attente améliore août, mais détériore juillet et son drawdown |
| MGC — Or | Garder la réintégration avant 11 h et 2R | Aucune nouvelle règle testée sur l’or ; les autres marchés peuvent toutefois lui libérer ou bloquer une place |
| MYM — Dow | Toujours exclu de cette variante de recherche | Référence à quatre marchés conservée dans le Jeu 34 ; exclusion non confirmée indépendamment |

« Garder » signifie préserver la référence de recherche, pas déclarer le
profil rentable. Le modèle historique n’est pas encore une reproduction
exacte des réactions sur pivots/Daily Open avec H1 20/50 de l’appel.

## Comparaison mensuelle du portefeuille

Funded supposé déjà obtenu au début de chaque mois. Résultats après frais et
glissement modélisés, en dollars ; aucune somme de mois ne décrit un compte
continu. Les replays d’évaluation exécutent ici les mêmes trades, sans être
équivalents au funded ni rendre leurs bénéfices retirables.

| Mois | Entrée | Net normal | Net coûts doublés | Baisse maximale normale | Versement |
|---|---|---|---|---|---|
| Juin | Référence · entrée actuelle | +1 048,75 $ | +785,50 $ | +172,50 $ | 0 € |
| Juin | Nasdaq · confirmation M5 | +348,75 $ | +226,50 $ | +201,25 $ | 0 € |
| Juin | S&P · confirmation M5 | +996,50 $ | +818,50 $ | +90,00 $ | 0 € |
| Juillet | Référence · entrée actuelle | +176,00 $ | +164,00 $ | +312,50 $ | 0 € |
| Juillet | Nasdaq · confirmation M5 | +269,75 $ | +280,75 $ | +270,25 $ | 0 € |
| Juillet | S&P · confirmation M5 | -74,75 $ | -32,25 $ | +471,00 $ | 0 € |
| Août | Référence · entrée actuelle | -245,50 $ | -228,50 $ | +442,00 $ | 0 € |
| Août | Nasdaq · confirmation M5 | -414,00 $ | -344,50 $ | +605,50 $ | 0 € |
| Août | S&P · confirmation M5 | +1,50 $ | -95,50 $ | +333,50 $ | 0 € |

Baisse maximale réalisée entre transactions, sans mesure complète de la perte
latente intrabougie. Stop prioritaire si stop et cible sont touchés sur la
même bougie ; gap défavorable au prix d’ouverture. Risque prévu maximum
100 USD frais compris, réduit 50/25 selon marge, 20 micros maximum, une seule
position et deux entrées par jour au total. Un gap peut dépasser ce plafond.

## Pourquoi les pertes précoces ne justifient pas une attente systématique

Dans la référence normale, 6 des 11 pertes MNQ et 5 des 10 pertes MES se
produisent dès la bougie d’entrée. Le test attend une bougie M5 supplémentaire,
avec stop original intact, clôture dans le sens attendu et hors du range ;
entrée à l’open suivant, prix et taille recalculés. Le filtre MES est revérifié
au nouvel horaire. Le protocole donne les règles exactes.

**Nasdaq, juin :** 16 signaux initiaux, 8 confirmations. Six sont encore refusées
par le risque et deux par l’occupation du portefeuille. Aucune entrée MNQ
exécutée. Le portefeuille perd donc les 700 USD apportés par les sept entrées
initiales, dont six gagnantes. Attendre éloigne parfois l’entrée du stop au
point qu’un seul microcontrat dépasse le budget ; augmenter le risque aurait
masqué cette limite.

**S&P, juillet :** net du portefeuille de +176 à −74,75 USD, soit −250,75 USD.
La baisse maximale passe de 312,50 à 471 USD. Deux gagnants MES communs
deviennent perdants sur l’ensemble juin/juillet aux coûts normaux.

**S&P, août :** net de −245,50 à +1,50 USD aux coûts normaux, mais encore
−95,50 USD avec coûts doublés. Au normal, +247 USD s’expliquent par +20 USD
sur les retests communs, 382,50 USD de pertes retirées et 155,50 USD de pertes
sur de nouvelles entrées. Cela inclut les autres marchés qui prennent la place.
Ce n’est pas uniquement un effet du filtre sur le S&P.

Le critère exigeait de ne dégrader aucun mois/coût/étape en net et drawdown,
avec au moins une amélioration. Les deux variantes échouent. Aucun seuil,
horaire ou combinaison MNQ+MES n’a été réajusté après ce résultat.

## Moyenne par trade

Les trois mois neufs sont regroupés uniquement pour décrire les transactions.
La moyenne des gagnants ne représente pas celle de tous les trades.

| Entrée | Trades | Gagnants / perdants | Gagnant moyen | Perdant moyen | Moyenne générale | Meilleur trade |
|---|---|---|---|---|---|---|
| Référence · entrée actuelle | 48 | 22 / 26 | +138,45 $ | -79,49 $ | +20,40 $ | +165,00 $ |
| Nasdaq · confirmation M5 | 34 | 13 / 21 | +141,00 $ | -77,55 $ | +6,01 $ | +165,00 $ |
| S&P · confirmation M5 | 42 | 19 / 23 | +138,97 $ | -74,66 $ | +21,98 $ | +175,00 $ |

Le S&P avec attente augmente légèrement la moyenne par trade, mais produit
moins de trades et détériore juillet. Améliorer une moyenne isolée ne suffit
pas à améliorer le revenu mensuel ni la régularité.

## Toutes les semaines — coûts normaux

Compte et cumul remis à zéro au début de chaque mois. Les semaines sont
coupées aux limites du mois ; les tableaux affichent les jours observés.
Les coûts doublés et l’étape d’évaluation sont aussi consultables dans le Lab.
Bénéfice du compte et versement personnel sont distincts : 0 EUR versé partout.

### Juin

| Dates | Référence | Attente MNQ | Attente MES | Cumul référence | Versement |
|---|---|---|---|---|---|
| 2026-06-01 – 2026-06-05 | +347,00 $ | -42,50 $ | +452,00 $ | +347,00 $ | 0 € |
| 2026-06-08 – 2026-06-12 | -15,25 $ | -158,75 $ | +58,50 $ | +331,75 $ | 0 € |
| 2026-06-15 – 2026-06-18 | +13,50 $ | +0,00 $ | +13,50 $ | +345,25 $ | 0 € |
| 2026-06-22 – 2026-06-26 | +573,50 $ | +420,00 $ | +366,00 $ | +918,75 $ | 0 € |
| 2026-06-29 – 2026-06-30 * | +130,00 $ | +130,00 $ | +106,50 $ | +1 048,75 $ | 0 € |

### Juillet

| Dates | Référence | Attente MNQ | Attente MES | Cumul référence | Versement |
|---|---|---|---|---|---|
| 2026-07-01 – 2026-07-02 * | +150,00 $ | +150,00 $ | +132,50 $ | +150,00 $ | 0 € |
| 2026-07-06 – 2026-07-10 | -241,00 $ | -162,00 $ | -471,00 $ | -91,00 $ | 0 € |
| 2026-07-13 – 2026-07-17 | +141,00 $ | -14,75 $ | +207,25 $ | +50,00 $ | 0 € |
| 2026-07-20 – 2026-07-24 | -27,00 $ | -93,50 $ | -27,00 $ | +23,00 $ | 0 € |
| 2026-07-27 – 2026-07-31 | +153,00 $ | +390,00 $ | +83,50 $ | +176,00 $ | 0 € |

### Août

| Dates | Référence | Attente MNQ | Attente MES | Cumul référence | Versement |
|---|---|---|---|---|---|
| 2026-08-03 – 2026-08-07 | -150,50 $ | -95,00 $ | -55,50 $ | -150,50 $ | 0 € |
| 2026-08-10 – 2026-08-14 | +347,00 $ | +122,50 $ | +390,50 $ | +196,50 $ | 0 € |
| 2026-08-17 – 2026-08-21 | -167,00 $ | -168,00 $ | -77,00 $ | +29,50 $ | 0 € |
| 2026-08-24 – 2026-08-28 | -275,00 $ | -273,50 $ | -256,50 $ | -245,50 $ | 0 € |
| 2026-08-31 – 2026-08-31 * | +0,00 $ | +0,00 $ | +0,00 $ | -245,50 $ | 0 € |

## Objectif et étape suivante

L’objectif reste un versement de 1 000 EUR après partage 90/10, puis arrêt du
mois : référence fixe 1 EUR = 1,1652 USD du Jeu 34, hors fiscalité et frais de
change/transfert. Le modèle nécessite 2 589,34 USD de bénéfice et cinq jours
à 150 USD ; demande brute 1 294,67 USD, traitement supposé immédiat.
Aucun objectif n’est atteint dans le Jeu 36.

Les entrées retardées ne sont pas promues. Il reste à préciser les moyennes,
les pivots et les horaires exacts des associés, puis obtenir les données de
séance correspondantes pour tester leur modèle sans inventer des niveaux
nocturnes. La collecte et les fenêtres prospectives existantes sont conservées,
sans ouvrir une réserve supplémentaire ni empiler des filtres sur ces mois.

## Vérification et restauration

Gel publié avant calcul : `de6365e691b2b137c6a73689765d448cb6a69249`.
Empreinte du gel : `a699ec5436db54f07a63e86bce07a22571a4b1373d4c6c282361a2ea8f2d70a1`.
Rapport : `d8c1f793f00d23989838d83d62abbb130195a75eb957db342ac18e8cf7612537`.

46 dépendances et fichiers de protocole/test/runner gelés ; 12 témoins complets,
768 préfixes de journées avec confirmations reconstruites, 472 transactions
vérifiées en risque, taille, stop, cible et cashflow. Quatre nouvelles
configurations, deux variantes de stratégie ; registre 84 entrées et catalogue
101 clés distinctes entre historiques, zéro confirmation indépendante.

Archive privée : `jeu36/entry-confirmation-v1/manifest.json`. Les trois parties
et le manifeste ont été relus à l’identique. Pour restaurer : lire le manifeste,
contrôler taille/SHA de chaque partie, concaténer dans l’ordre, décoder base64,
décompresser gzip puis vérifier les taille/SHA des JSON originaux. Sources
identiques au Jeu 35, également épinglées dans `jeu36-source.json`.

Aucun prix brut ni détail de transaction publié, aucune activation réelle,
Paper ou Shadow, aucun achat de compte ni retrait demandé. Les anciens gels
et résultats restent inchangés. Aucun contrôle navigateur revendiqué.

Validation logicielle finale : 218 tests réussis, build et hygiène sans
anomalie, 25 modules Functions validés. Les 461 IDs précédents sont conservés
parmi 476 IDs uniques ; les liens locaux et toutes les 36 vues de comparaison
sont vérifiés par code. Ces contrôles n’établissent aucune rentabilité.

Une hypothèse EMA9/VWAP avec distance au prochain support/résistance a été
ajoutée parallèlement dans `experiments/ema9-vwap-obstacle-filter-v1.json`
(commit 1404fa6e9d2aedc1e25ef2790f13870b81820a60). Elle est conservée comme
candidate à préciser et tester ; elle n’a pas été exécutée dans le Jeu 36,
n’est pas incluse dans ses résultats et n’active aucun profil.
