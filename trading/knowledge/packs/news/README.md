# Nykuto — dossier de veille des marchés

Recherche publique réalisée le 2026-09-09. Périmètre prioritaire : MNQ, MES, MYM, MGC.

## Contenu

- `rapport_recherche.md` : synthèse et architecture proposées.
- `registre_sources.md` : annuaire lisible des 77 ressources avec leurs limites.
- `sources.json` : mêmes ressources en JSON, toutes désactivées, sans clés ni endpoints inventés.
- `evenement.schema.json` : schéma JSON proposé pour conserver provenance, dates, chiffres et corrections.
- `politique_news.json` : proposition de politique shadow-only; aucun ordre de trading autorisé.
- `consignes_bot.md` : consignes pour le lecteur IA, séparé du moteur de risque.
- `tests_acceptation.md` : tests à réaliser avant utilisation opérationnelle.

## Ce que ce dossier ne fait pas

Il ne modifie pas trading.nykuto.com, n’installe aucun connecteur, ne souscrit aucun abonnement et n’entraîne aucun modèle. L’existence d’une API est vérifiée au niveau de la documentation publique, pas par un test contractuel ou authentifié. Aucun contenu privé de Discord n’est inclus. Aucun article intégral tiers n’est redistribué.

Plusieurs fiches peuvent renvoyer au même producteur. Le nombre de ressources ne mesure donc ni l’indépendance des confirmations ni la diversité des informations.

## Intégration proposée

Commencer par lire le rapport et choisir un noyau réduit. Pour chaque source retenue, vérifier ses droits, son offre réelle, son délai et sa couverture. Implémenter ensuite un adaptateur serveur autorisé, valider le schéma et la politique dans le laboratoire, puis mesurer le comportement en shadow/paper. Les clés restent côté serveur. Une configuration ne remplace pas une implémentation testée.

## Vérifications effectuées sur ce dossier

Parsing des fichiers JSON, unicité des identifiants, présence de liens HTTPS, désactivation de toutes les sources, absence de permissions d’exécution et contrôle structurel du schéma JSON. Ces contrôles de fichiers ne sont pas un test d’intégration des fournisseurs ni un backtest financier.
