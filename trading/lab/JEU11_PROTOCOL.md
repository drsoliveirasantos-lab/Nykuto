# Jeu 11 — confrontation sur avril–mai 2025

Protocole fixé le 9 septembre 2026 UTC, avant récupération des prix et calcul
des performances de cette campagne. Il complète les Jeux 09–10 sans les remplacer.

## Choix des données avant résultats

Une sonde des horaires MNQ/XCME du 10 septembre 2024 au 31 mai 2025 a
retourné des horaires complets seulement à partir du 17 mars 2025, hormis
deux événements pre_open isolés du 1er octobre 2024. Les prix et performances
de ces dates n'ont pas servi au choix. Octobre–novembre 2024 et janvier–février
2025 restent inutilisables avec cette source d'horaires.

- Contrat unique MNQM5, expiration confirmée par Massive : 20 juin 2025.
- Préparation : 17–31 mars 2025. Évaluation : 1er avril–30 mai 2025 inclus.
- Bougies 15 min, séance 09:30–16:00 America/New_York, jours ouvrés, hors
  18 avril et 26 mai selon le calendrier NYSE. Aucune séance raccourcie prévue.
- Toutes les bougies attendues, ticks et horaires doivent être vérifiés.
  Aucun prix interpolé, aucune exclusion d'une séance difficile. En cas de trou,
  publier le blocage et ne pas calculer de performance partielle.
- Exiger au moins 220 bougies de préparation et pagination terminée.
- Prix, captures de référence et horaires conservés en stockage privé, avec SHA-256.

## Expériences fixées

Réutiliser exactement les huit variantes du Jeu 10 : référence, Trend 1 h,
Engulfing, Volume, exclusion des jours d'annonces, combinaison des quatre,
Long only, Short only. Aucun balayage de paramètres ni sélection du gagnant.
Le moteur, les périodes des EMA, ADX, ATR, les seuils et les freins quotidiens
restent inchangés. Chaque variante est simulée séparément avec 3,50 $ puis
7 $ de coûts hypothétiques par aller-retour, soit 16 simulations complètes.
Les coûts doublés recalculent les positions et les pauses après pertes.

Calendrier des événements excluant toute la séance : NFP 4 avril et 2 mai ;
CPI 10 avril et 13 mai ; décision FOMC 7 mai 2025. Ne pas utiliser le calendrier
2026 du Jeu 10. Les jours de préparation ne sont pas évalués. Les calendriers
historiques peuvent avoir été révisés : ce n'est pas un test des informations
disponibles en temps réel à l'époque, ni une analyse exhaustive de l'actualité.

Auditer les indicateurs par troncature des données futures, puis comparer
les simulations arrêtées à chaque fin de séance avec les mêmes trades du
calcul complet. Vérifier les entrées après clôture du signal, le tick, les
limites quotidiennes, les coûts et les résultats à partir des trades.

## Lecture et arrêt

Il s'agit d'une seule nouvelle fenêtre historique de deux mois, distincte des
périodes MNQ évaluées dans les Jeux 06–10. Pas d'ajout aux 2026 pour maquiller
un échec et pas de qualification « indépendant/prospectif » globale.
Afficher toutes les variantes et leurs résultats, même défavorables.

Les critères de confirmation restent trois fenêtres, au moins 40 trades au
total et 12 par fenêtre, résultat positif dans chacune, profit factor >= 1,10
avant arrondi, drawdown réalisé <= 8 R et résultat positif à coûts doublés.
Ce jeu seul ne peut pas satisfaire les trois fenêtres : le verdict reste
« Confirmation incomplète » ou « Non confirmé » selon les autres critères.
Une campagne, puis arrêt des recalculs identiques. Aucun réglage après résultats.

Les deux tâches existantes de collecte et de test prospectif MNQ restent
inchangées : préparation septembre 2026, observation octobre–novembre,
analyse programmée le 3 décembre après audit. Paper Bot et Shadow restent OFF.
Aucun abonnement, broker, ordre, compte ni historique privé modifié.

## Sources consultées le 9 septembre 2026 UTC

- Massive : `/futures/v1/contracts` (MNQM5, date 2025-04-01),
  `/futures/v1/schedules` (MNQ/XCME).
- [NYSE 2025](https://ir.theice.com/press/news-details/2024/NYSE-Group-Announces-2025-2026-and-2027-Holiday-and-Early-Closings-Calendar/default.aspx)
- [BLS 2025](https://www.bls.gov/schedule/2025/home.htm)
- [FOMC 7 mai 2025](https://www.federalreserve.gov/newsevents/pressreleases/monetary20250507a.htm)
