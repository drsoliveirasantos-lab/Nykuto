# Jeu 21 — Préparation native MES et MGC

Aucune candidate sélectionnée. Aucun calcul de performance de mai–août dans ce jeu. Les quatre configurations, leurs refus et les fenêtres incomplètes restent visibles.

| Contrat / méthode | Trades initiaux | Net initial USD | Trades coûts doublés | Net coûts doublés USD | Critères satisfaits |
| --- | ---: | ---: | ---: | ---: | ---: |
| MES/pullback | 55 | -385.00 | 7 | -50.00 | 2/8 |
| MES/cross | 11 | -10.00 | 1 | +7.50 | 2/8 |
| MGC/pullback | 0 | +0.00 | 0 | +0.00 | 1/8 |
| MGC/cross | 0 | +0.00 | 0 | +0.00 | 1/8 |

Ces résultats portent sur janvier–avril 2026. Un total positif avec trop peu de trades, une fenêtre négative ou des données incomplètes ne passe pas la sélection. Aucun cumul entre marchés ne représente un portefeuille exécuté. Les coûts doublés peuvent modifier les trades admissibles.

## Couverture sur janvier–août

- MES : 162/166 séances exploitables.
- MGC : 145/166 séances exploitables.

La correction augmente la couverture MES de 144 à 162 séances et MGC de 96 à 145 séances. Les 6 486 intervalles 30 minutes sont rapprochés sans divergence OHLCV. Les interruptions encore présentes restent bloquantes. Les zéros MGC proviennent des refus de risque ; ils ne représentent pas une méthode stable ou rentable.

## Reproductibilité

Audit : 426 préfixes de signaux, 156 préfixes de comptes, 178 trades audités (replays inclus, pas des observations indépendantes).

Protocole et code gelés avant calcul. Sélection nulle : `1c9aee2fa93a10a8d8df1276d9ed2fb6699dd3c82858110a80a7d8b2a50a4f6b`. Les Jeux 19–20 et les fichiers gelés de ce jeu restent inchangés. Les observations sont rétrospectives, déjà vues ou corrélées : confirmed=false et independent=false. Paper Bot, Shadow et broker désactivés.

Prix et trades détaillés privés ; voir [archivage et contrôles](JEU21_22_ARCHIVE.md).
