# Jeu 22 — Cassure et retour sur la zone d’ouverture

Aucune candidate sélectionnée. Aucun calcul de performance de mai–août dans ce jeu. Les quatre configurations, leurs refus et les fenêtres incomplètes restent visibles.

| Contrat / méthode | Trades initiaux | Net initial USD | Trades coûts doublés | Net coûts doublés USD | Critères satisfaits |
| --- | ---: | ---: | ---: | ---: | ---: |
| MNQ/orb-retest | 9 | +145.50 | 6 | +29.00 | 3/8 |
| MES/orb-retest | 14 | +138.75 | 0 | +0.00 | 3/8 |
| MYM/orb-retest | 30 | -173.00 | 11 | -117.00 | 3/8 |
| MGC/orb-retest | 2 | -51.00 | 0 | +0.00 | 1/8 |

Ces résultats portent sur janvier–avril 2026. Un total positif avec trop peu de trades, une fenêtre négative ou des données incomplètes ne passe pas la sélection. Aucun cumul entre marchés ne représente un portefeuille exécuté. Les coûts doublés peuvent modifier les trades admissibles.

## Couverture sur janvier–août

- MNQ : 165/166 séances exploitables.
- MES : 165/166 séances exploitables.
- MYM : 166/166 séances exploitables.
- MGC : 164/166 séances exploitables.

La famille est désormais différente des anciens croisements EMA : zone des 30 premières minutes, cassure clôturée puis retour clôturé, entrée suivante et stop derrière la mèche. Les gains MNQ (+145,50 USD, 9 trades) et MES (+138,75 USD, 14 trades) restent trop peu documentés ; MYM et MGC perdent. Aucun signal de cassure ne connaît le retour à l’avance. Le stop ne se rapproche pas pour forcer l’admission sous 50 USD.

## Interruptions de données

Le 6 mars, 10:05–10:55 New York manque sur MNQ/MES et 10:05–10:40 sur MGC. Le 25 février, MGC présente aussi une interruption 13:05–14:45. Les horaires disponibles indiquent une réouverture MGC à 14:45, mais ne prouvent pas toute la période d’interruption ; ils ne justifient donc pas d’inventer des bougies ni de déclarer la séance complète. La page CME des horaires explique les états ouvert, en pause et fermé, mais n’a pas fourni ici une attestation couvrant tous les trous. Le diagnostic de lacunes reste distinct d’une preuve de suspension du marché.

## Reproductibilité

Audit : 37362 préfixes de signaux, 320 préfixes de comptes, 200 trades audités (replays inclus, pas des observations indépendantes).

Protocole et code gelés avant calcul. Sélection nulle : `46d1f0a74a8cb2bde3b763d74326950f31daceb3c66fac09e48baf3d62000d7c`. Les Jeux 19–20 et les fichiers gelés de ce jeu restent inchangés. Les observations sont rétrospectives, déjà vues ou corrélées : confirmed=false et independent=false. Paper Bot, Shadow et broker désactivés.

Prix et trades détaillés privés ; voir [archivage et contrôles](JEU21_22_ARCHIVE.md).
