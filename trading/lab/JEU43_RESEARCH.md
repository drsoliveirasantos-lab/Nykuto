# Jeu43 — Transférer des mécanismes vérifiables dans Nykuto

10 septembre 2026. Préparation avant performance. Demande de Diego : exploiter les mécanismes utiles des ressources récupérées, lancer un test puis annoncer sa durée et arrêter la surveillance.

## Inventaire réellement inspecté

| Ressource | Mécanisme utile | Application exacte et limites |
| --- | --- | --- |
| Code téléchargé Kronos, révision `67b630e67f6a18c9e9be918d9b4337c960db1e9a`, `model/kronos.py`, `KronosPredictor.predict` | Moyenne et écart-type de chaque colonne de la fenêtre passée ; représentation des dates | Nouvelle implémentation JavaScript indépendante de normalisation OHLCV, horodatage New York et diagnostic d'extension. Aucun poids copié, entraîné ou interrogé. |
| Préparation causale du Jeu39 | 64 bougies M15 clôturées, redémarrage au changement de contrat ou trou de séance | Généralisation à chaque marché actif, sans requête modèle et sans horizon prédictif. 64 est la fenêtre Nykuto déjà utilisée, pas une longueur universelle imposée par Kronos. |
| SMB, transcription officielle Daily Breakout | Distinguer une entrée étendue d'une consolidation proche d'un niveau | Hypothèse Nykuto : comparer distance au niveau et dispersion passée ; ce seuil n'est ni donné par SMB ni extrait des poids Kronos. |
| Dossier RSI/tendances récupéré, intégré dans `trading/models/knowledge.json` | Distinguer zone30/70, momentum50 et divergence confirmée ; causalité des pivots | Conservation du filtre RSI existant et de ses explications. Aucun nouveau veto RSI ajouté ; aucune divergence inventée. |
| Dossier news récupéré, `trading/models/news-sources.json` | Source primaire, fraîcheur et disponibilité à l'instant étudié | Conservation de la frontière documentaire. L'absence d'archives horodatées empêche un test news fiable : état non observable, jamais « absence d'annonce » présumée. |
| Jeu42, principe du volume par phase | Isoler cassure, retour et confirmation | Hypothèse déjà testée et rejetée ; ne pas l'empiler avec le nouveau filtre. |

Source du mécanisme : [Kronos, code téléchargé](https://github.com/shiyu-coder/Kronos/blob/67b630e67f6a18c9e9be918d9b4337c960db1e9a/model/kronos.py). Inspection locale effective ; la relecture web du code n'était pas disponible dans cette session. [Transcription SMB](https://www.smbtraining.com/blog/the-daily-breakout-trade-strategy), relue le10septembre2026 : exemples sur actions, transfert aux futures non démontré.

Kronos-small, Chronos-2 et FFM ne sont pas des modèles installés dans le pack inspecté. Les documents ne sont pas un corpus d'entraînement financier validé. L'essai porte sur une réutilisation de méthode, distincte du veto de prévision rejeté au Jeu39.

## Hypothèse indépendante des résultats futurs

Une entrée déjà loin de sa borne de cassure pourrait être moins favorable. Mesurer sa distance dans le sens du signal en unités de dispersion passée la rend comparable entre périodes de volatilité différente. La borne reste `rangeHigh` à l'achat, `rangeLow` à la vente, identifiée par la stratégie historique ; aucun niveau rétrospectif n'est recherché.

Deux variantes isolées, MNQ puis MES, appliquent la même règle fixée d'avance : veto au-delà d'un écart-type des clôtures des64 dernières M15. L'égalité est admise. Le seuil1 est un choix de recherche Nykuto, non optimisé et sans signification probabiliste. La variation des niveaux de clôture mesure aussi une tendance, pas seulement la volatilité des rendements. Un résultat négatif ne sera pas corrigé en déplaçant le seuil ou en combinant les variantes.

La normalisation utilise les nombres JavaScript en double précision et un epsilon1e-5, sans clipping. Cela reprend le mécanisme de standardisation ; ce n'est pas une reproduction bit-à-bit du pipeline NumPy float32 de Kronos. Le volume monétaire manquant n'est pas fabriqué.

Le calcul du filtre utilise idéalement l'ouverture suivante comme les témoins existants : aucune latence ou exécution réelle n'est démontrée. Les historiques sont déjà vus, limités aux séances cash et à une seule année. L'ancien contrôle de complétude des séances constitue une limite héritée, pas une garantie de réception en direct.
