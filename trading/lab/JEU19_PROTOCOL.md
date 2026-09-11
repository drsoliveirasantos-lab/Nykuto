# Jeu 19 — comparaison de quatre microcontrats

Protocole du 9 septembre 2026, fixé avant tout calcul de performance du Jeu 19.
Le but est de tester le changement de marché, avec une comparaison bornée et
traçable. Aucun essai n'est effacé et aucun seuil n'est abaissé pour obtenir du vert.

## Huit configurations annoncées

MNQ, MES, MYM et MGC, chacun avec Pullback 5 min ou croisement EMA 5 min,
tous deux alignés avec la dernière tendance 30 min clôturée. Les deux méthodes
emploient les EMA 9/21, ADX 14 >=20, ATR 14 ×1,25, cible 1,5 R et marge nette
gain/perte >=1 du moteur existant. Les règles ne changent pas après résultat.
Le moteur reste purement historique : aucune connexion d'ordres ni activation.

| Produit | Valeur d'un point | Tick | Coût aller-retour supposé |
| --- | ---: | ---: | ---: |
| MNQ | 2 $ | 0,25 | 3,50 $ |
| MES | 5 $ | 0,25 | 5 $ |
| MYM | 0,50 $ | 1 | 3,50 $ |
| MGC | 10 $ | 0,10 | 4,50 $ |

Chaque coût comprend 2,50 $ de frais hypothétiques et un tick de friction par
côté ; le scénario de stress double le total. Il ne s'agit pas d'un tarif
certifié du courtier. Les montants de stop, cible et seuils de compte utilisent
le multiplicateur et le tick du contrat concerné, jamais ceux du MNQ par défaut.
Un seul microcontrat, perte prévue frais inclus <=50 $, budget de journée 100 $,
réserve 100 $, trois entrées au maximum, arrêt après deux pertes consécutives
ou -2 R. Un gap peut dépasser le risque prévu.

## Données et séparation temporelle

Développement : janvier–avril 2026, en deux fenêtres de deux mois.
Réserve hors sélection : mai–août 2026, en deux fenêtres de deux mois.
Toutes les données MNQ ont déjà été examinées : elles ne deviennent jamais
indépendantes par un nouveau découpage. MES avait été étudié en 2025 ; les séries
2026 des autres marchés sont nouvelles pour cette comparaison, mais leurs
événements économiques peuvent être corrélés aux historiques MNQ déjà vus.
Une réussite ici ne suffit donc pas à confirmer le bot.

Les échéances et roulements calendaires sont déclarés dans `jeu19-policy.mjs`
avant les résultats. Aucun graphique continu, aucune substitution par ETF,
indice cash, mini ou XAUUSD. Les échéances or sont quittées avant leur mois de
livraison. Les décisions d'exécution ne portent que sur 09:30–16:00 New York
(13:00 pour les demi-séances du calendrier partagé), sortie quinze minutes avant
la clôture de cette plage. Cette plage commune n'optimise pas les horaires de l'or.
Les horaires futures officiels du fournisseur doivent couvrir toute cette plage.

Les données brutes proviennent de Massive via la connexion existante, bougies
5 min, pagination intégrale et métadonnées des contrats. Le MNQ réutilise la
source gelée du Jeu 14. Chaque séance exige toutes les bougies prévues, des ticks
valides et ses horaires vérifiés. Aucun prix manquant n'est interpolé. Une lacune
réinitialise la préparation : 220 bougies 30 min complètes avant de scorer à
nouveau. Toutes les lacunes, y compris celles de préparation, sont comptabilisées.

## Sélection et verdict

Les huit configurations sont calculées sur les mêmes dates civiles de
développement ; les séances disponibles et les fenêtres incomplètes restent
visibles par marché. Les résultats partiels sont diagnostiques seulement.
Pour être sélectionnable, il faut deux fenêtres de développement intégralement
couvertes, >=40 trades au total, >=12 par fenêtre, chaque fenêtre positive en R
et en dollars, PF en R >=1,10, drawdown réalisé <=8 R, total positif en R et dollars
avec coûts doublés, aucun franchissement de la limite du compte aux deux coûts.
Le candidat éventuel maximise la plus faible espérance en R des deux fenêtres,
puis minimise le drawdown ; les égalités suivent l'ordre produits/méthodes déclaré.

Le candidat est écrit et gelé avant d'ouvrir ses performances mai–août. Seul ce
candidat est évalué sur la réserve, avec les mêmes critères et les deux fenêtres
complètes. Si aucun candidat n'est sélectionnable, aucune performance de la
réserve n'est consultée et il n'y a pas de second choix après échec. Toute nouvelle
hypothèse constitue un nouveau jeu, avec ses essais déclarés ; aucun balayage
illimité de paramètres. Une confirmation prospective et un test d'exécution
resteraient nécessaires même si tous les critères historiques étaient satisfaits.

Les évaluations simulées reprennent le LucidFlex 25K du Jeu 15 : départ 25 000 $,
objectif 1 250 $, limite de perte 1 000 $, cohérence 50 %, compte distinct par
fenêtre complète, aucun reset pendant celle-ci. Les limites internes de 50/100 $
sont plus restrictives que les limites commerciales du compte. Aucun cumul des
quatre marchés en portefeuille n'est simulé : les résultats ne sont pas additionnables.

## Reproductibilité et sources

Les fichiers de dépendances et ce protocole sont gelés dans un commit local
avant le premier calcul. Les sources, détails des trades et décisions restent
dans les archives privées ; seules les statistiques agrégées vont au Lab.
Les résultats négatifs et les états bloqués sont conservés.

- [Spécifications micro indices CME](https://www.cmegroup.com/articles/faqs/frequently-asked-questions-micro-e-mini-equity-index-futures.html).
- [Micro Gold CME](https://www.cmegroup.com/education/lessons/product-gold).
- [Compte LucidFlex 25K](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account), vérifié le 9 septembre 2026.
- [Recherche sur les biais des tests multiples](https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf).
