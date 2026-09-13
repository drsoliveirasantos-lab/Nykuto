# Audit du Pine Nykuto — 13 septembre 2026

**Priorité : rendre le suivi et les mesures fidèles avant de chercher de meilleurs pourcentages.** Le code étudié est celui collé par Diego : titre V15.1 Explainable State Engine, HUD V15.1.1. Le fichier « V15.1.1 Partner Clean » cité dans les anciens échanges n’est pas disponible ici comme fichier complet vérifiable ; son identité exacte avec ce code n’est pas présumée. Cet audit de code ne vaut ni compilation TradingView ni reproduction des 11 545 opportunités.

## Ce qui est déjà cohérent dans le code fourni

Le stop structurel précède le sizing ; la quantité est réduite avant de modifier un stop. Le coût prévu inclut frais et glissement, le budget est un plafond pour toute la position, et le nombre d’unités est borné à cinq. Le scanner peut détecter pendant qu’une carte existe déjà. Les signaux admis exigent une bougie confirmée. Les pivots sont utilisés après confirmation ; leur affichage antérieur sur le graphique ne signifie pas qu’ils étaient connus à cet instant.

Sur un graphique M5, les requêtes H1/M15 décalées d’une barre avec `lookahead_on` correspondent au schéma documenté pour demander des valeurs HTF confirmées. Cette observation ne valide pas les autres unités ni la parité du moteur complet. [Documentation TradingView : autres unités de temps](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/).

## Défauts et corrections proposées

| ID | Priorité | Constat dans le code | Correction à tester |
|---|---|---|---|
| A01 | P0 | `is5m` accepte 2/3/4 minutes. | Plans/alertes uniquement à 300 secondes ; contexte séparé sur les autres unités. |
| A02 | P0 | Nouvelle admission avant évaluation TP/SL de l’ancien plan. | Évaluer l’ancien plan et conserver ses événements avant de remplacer la carte visible. |
| A03 | P0 | Le ladder entièrement liquidé peut rester actif. | État terminal dès quantité restante nulle, y compris après TP1 ou TP2. |
| A04 | P0 | Affectations successives d’`alertText` : événements précédents perdus. | Une enveloppe contient tous les événements, horodatages et identifiants de plans concernés. |
| A05 | P1 | `mapBars` est à la fois longueur visuelle et horizon de calcul. | Réglages indépendants ; référence analytique fixée à 180 min lors de la comparaison. |
| A06 | P1 | Faisabilité fondée sur tout le temps avant flat, malgré expiration plus tôt. | Plafonner le temps par l’horizon réel ; mesurer l’effet sur admission et TP2/TP3. Une correction peut être neutre à certains paramètres. |
| A07 | P1 | Fraîcheur S/R liée à un timestamp global par côté. | Identité, dernière touche, fusion et invalidation par zone. |
| A08 | P1 | Overnight exclut la bougie 09:25–09:30 à cause de l’heure de clôture. | Fenêtres explicites ; dernière M5 overnight incluse. |
| A09 | P1 | Le capteur M1 n’observe pas la séquence complète des intrabars. | Stocker le capteur confirmé ; analyser les minutes disponibles et signaler la couverture insuffisante. |
| A10 | P1 | Taux et coefficients fixes même si paramètres/symbole/timeframe changent. | Signature de calibration et mention non calibré en cas de divergence ; aucune extrapolation automatique. |
| A11 | P1 | Cooldowns temporels sans identité du setup. | Journal multi-familles et parent causal ; rapprocher répétitions et idées indépendantes. |
| A12 | P2 | FAILED sans âge/consommation explicites du niveau. | Variantes fresh sweep, âge et profondeur séparées ; ce sont des hypothèses d’admission. |
| A13 | P2 | FVG limité par l’âge mais sans cycle de vie complet. | Journal création/retest/invalidation/consommation ; évaluer l’effet avant promotion. |
| A14 | P2 | All = 80 marqueurs et Session = 60 ; objets partagés avec autres labels. | Noms honnêtes, gestion des objets et journal complet distinct du dessin. |
| A15 | P2 | ATR courant dans l’explication d’un plan figé ; tooltips T5 obsolètes. | Stocker les valeurs d’entrée ; retirer l’ancienne promesse d’extension H1/H4. |
| A16 | P2 | Horaires fixes sans calendrier officiel complet ; H4 dépend d’une bougie à la frontière. | Contrôler DST, jours partiels et données absentes ; détecter le changement de bucket H4 avec provenance. |
| A17 | P1 | Entrée close dans le Pine, prochain open dans certains rapports. | Deux conventions explicites avant comparaison, y compris risque, cible, coûts et horizon. |

P0/P1 désignent une priorité technique, pas un effet financier prédit. Les corrections proposées vivent dans une spécification JavaScript isolée ; elles ne sont pas déjà installées sur TradingView.

`request.security_lower_tf()` fournit des tableaux d’intrabars ; leur disponibilité doit être vérifiée. Sur la barre en formation, les valeurs d’un indicateur évoluent selon le modèle d’exécution. Le HUD peut afficher un aperçu vivant, mais une décision historique doit conserver son état confirmé. [Données multi-unités](https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/), [modèle d’exécution](https://www.tradingview.com/pine-script-docs/language/execution-model/).

Les alertes TradingView existantes conservent une copie du script et des réglages utilisés à leur création. Une future installation du Pine corrigé exige de recréer les alertes correspondantes. [Documentation des alertes](https://www.tradingview.com/pine-script-docs/concepts/alerts/).

## Axes pour les indicateurs

- **RSI/MACD :** conserver les états directionnels propres à chaque famille ; vérifier Wilder/EMA, initialisation, mémoire des croisements et prix des pivots. Tester une seule modification de mémoire ou de pente à la fois. Un RSI fort n’est pas universellement favorable ; ne pas cumuler plusieurs indices corrélés comme preuves indépendantes.
- **EMA :** comparer localisation et reprise, distinguer EMA réglables et EMA21 fixe du scanner. Fixer les longueurs lors des témoins. Contrôler les contextes M15/H1 à l’instant exact où ils deviennent disponibles.
- **DMI/ADX :** reproduire lissage, différence DI, maturité et persistance dans l’unité native. Tester les seuils voisins seulement après parité, sans choisir le maximum sur les mêmes données puis le nommer validation.
- **Volume :** conserver le volume absent comme inconnu. La moyenne M5 utilise déjà le passé ; le capteur M1 inclut la minute courante dans sa moyenne. Comparer cette définition au passé strict, puis seulement mesurer sa valeur marginale. La normalisation par créneau horaire nécessite son propre témoin.
- **ATR/volatilité :** vérifier ATR précédent et percentiles causaux. Mille M5 constituent une fenêtre roulante, pas un régime universel. Les bas volumes ou faibles volatilités restent des contextes tant que leur effet net n’est pas confirmé.
- **Structure/S/R/FVG :** séparer moment réel du pivot et moment de confirmation, niveau encore défendu et niveau consommé. Attribuer des identifiants stables. Une tolérance mobile en ATR peut fusionner des zones différentes : cette règle doit être explicite.
- **Sessions/VWAP :** documenter l’ancre réelle du VWAP et celle du Daily Open ; séparer fuseau NY, plages de recherche et calendrier des fermetures. Le CSV de contrat continu ne révèle pas à lui seul le réglage de rollover.
- **NEXT60 :** cible = côté du prochain setup, pas mouvement brut ni gain. Vérifier la définition des observations sans setup sous 60 min, le sampling M15, les features à l’entrée et la calibration par période. Sans données d’entraînement complètes et parité des signaux, les anciens AUC/Brier restent des chiffres rapportés.

## Données et interprétation des tests

La base corrigée est désormais reproductible depuis le site. Les anciens effectifs par famille peuvent se chevaucher ; leur somme ne doit pas être comparée à une population dédoublonnée sans reconstruire ses membres. Les tiers historiques figés ne sont pas des probabilités individuelles actuelles. Une touche TP1 suivie d’un SL, une liquidation TP1 et un TP1 avant SL sont trois définitions différentes.

La première étape vérifie des mécanismes isolés et des mesures sur les bougies réelles. Son résultat est dans `fidelity-stage-a.json`. Elle ne compte pas encore les signaux du Pine. Le protocole suivant impose une parité au niveau bougie, un census sans plafond quotidien, un replay séquentiel distinct, des coûts explicites et la conservation des cas ambigus. Les critères Time-Pace ne sont pas intégrés avant l’union par parent causal.

Voir [le protocole](./PINE_TEST_PROTOCOL.md) et [la procédure de restauration](./README.md). Aucun gain nouveau, aucun taux TP recalibré ni aucune activation broker n’est revendiqué.
