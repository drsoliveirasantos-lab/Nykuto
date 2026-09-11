# Jeu 07 — période de remplacement

Décision du 8 septembre 2026, à la demande explicite de Diego de changer les
dates indisponibles. Bornes fixées avant récupération des prix et calcul :
**MNQU6**, préparation du **15 au 30 juin 2026**, évaluation du **1er au
24 juillet 2026 inclus**. Pas de raccordement de contrats. Calendrier cash NYSE
09:30–16:00 America/New_York, hors 19 juin et 3 juillet, source
https://www.nyse.com/trade/hours-calendars consultée le 8 septembre 2026.

Cette fenêtre se situe après le Jeu 04 (fin juin 2026) et avant les dates du
Jeu 03 (à partir du 25 juillet 2026). La préparation peut reprendre une période
déjà vue : elle ne compte pas dans les performances. Janvier–février 2024 et
octobre–novembre 2023 ont été sondés pour leurs horaires MNQ : réponses vides.
Les horaires de juin–juillet 2026 sont disponibles dans Massive.

Le remplacement est un **diagnostic court**, pas une fenêtre complète de deux
mois ni une confirmation indépendante suffisante. Les exigences finales restent
trois fenêtres de deux mois, ≥40 transactions au total, ≥12 par fenêtre,
résultat positif dans chacune, PF ≥1,10, baisse réalisée ≤8 R et résultat positif
avec coûts doublés. Il n'autorise aucun bot. Le Jeu 08 prospectif est conservé.

Stratégie, moteur et hypothèses identiques au Jeu 06 : EMA 9/21 + ADX 14 ≥20,
ATR 14 ×1,25, objectif 1,5 R, entrée suivante, trois entrées/jour, arrêt après
deux pertes consécutives ou −2 R réalisés, sortie à l'ouverture de la dernière
bougie. Tick 0,25 ; 2 $/point ; coût 3,50 $ par aller-retour par contrat,
stress recalculé à 7 $. Les 220 bougies de préparation restent exigées.

L'ancien snapshot 2024 et son moteur restent conservés ; aucun prix n'est
modifié ou complété par interpolation. Le nouveau snapshot sera privé et épinglé
par SHA-256. Ses prix, calendrier, horaires et décompte doivent passer le contrôle
avant calcul. Les horaires annoncés ne prouvent pas l'absence d'incidents.

## Vérification et résultat du 8 septembre 2026

28/28 séances complètes, 728 bougies cash dont 286 de préparation, 17 séances
évaluées. Prix et horaires Massive ; les barres des jours fériés portant une
date de règlement ultérieure sont exclues selon leur date réelle cash.
Snapshot privé `jeu07/mnq-retest-july2026-v1.json`, 78 854 octets, SHA-256
`c1649cf44aa496466cc223902a50a6393f70c329f9e699ad217c48719404e09d`.

7 transactions, 5 gagnantes, +3,1786 R net, moyenne +0,4541 R, profit factor
2,5659, baisse réalisée maximale 2,0299 R. Avec coûts doublés : +3,0794 R.
Les seuils de transactions et les trois fenêtres ne passent pas. Ce petit
échantillon ne confirme pas la stratégie. Aucun bot activé.
