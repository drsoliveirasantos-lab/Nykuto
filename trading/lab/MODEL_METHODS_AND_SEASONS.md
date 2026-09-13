# Méthodes internes des modèles et hypothèse saisonnière

Revue du 10 septembre 2026, après la correction de Diego. Il souhaite reprendre des éléments utiles du code téléchargé pour améliorer Nykuto, et non brancher directement un modèle comme décideur. Le Jeu 39 mesurait un veto de prévision : son échec ne teste pas la valeur de chaque méthode interne.

## Ce qui a réellement été inspecté

Seuls Kronos-mini, son tokenizer et leur code sont présents dans le pack vérifié. Kronos-small et FFM sont référencés mais ne sont pas installés dans ce pack. Les poids du réseau ne sont pas une liste de règles de trading lisibles dont on pourrait extraire les règles gagnantes. Le corpus d’entraînement brut n’a pas été audité. Les fiches RSI et news restent des ressources documentaires.

Source primaire : [code Kronos à la révision téléchargée](https://github.com/shiyu-coder/Kronos/tree/67b630e67f6a18c9e9be918d9b4337c960db1e9a).

| Méthode observée | Fichier / fonction | Utilité possible pour Nykuto | État réel |
| --- | --- | --- | --- |
| Normaliser chaque fenêtre avec son passé | `model/kronos.py`, `KronosPredictor.predict` ; `finetune/dataset.py`, `QlibDataset.__getitem__` | Comparer l’extension du prix à la volatilité disponible avant l’entrée, plutôt qu’au seul nombre de points | Proposition de diagnostic ; aucun nouveau veto ou seuil testé ici. ATR existe déjà dans Nykuto. |
| Représenter le temps | `calc_time_stamps` et `TemporalEmbedding` | Comparer les horaires, jours et mois avec leurs effectifs et conditions de marché | Le modèle connaît déjà une représentation du mois. Cela ne prouve ni saisonnalité profitable ni bonne compréhension d’août. Les horaires New York sont déjà utilisés dans Nykuto. |
| Séparer configuration, entraînement et évaluation | Configuration et pipeline de fine-tuning | Éviter de régler les paramètres sur le résultat qu’on présente comme test | Les contrôles chronologiques existent déjà. Le Jeu 40 ajoute une vérification du tableau de paramètres avant gel. Aucun poids entraîné. |

Le volume relatif à la même heure sur cinq séances passées existe aussi dans `jeu24-context.mjs`. Il ne doit pas être présenté comme un nouvel indicateur découvert dans Kronos. Les prochaines idées doivent partir de ces outils existants et mesurer leur effet isolément.

## Août est-il un mauvais mois ?

Des travaux universitaires étudient la saisonnalité des rendements, notamment Bouman et Jacobsen, [The Halloween Indicator, “Sell in May and Go Away”: Another Puzzle](https://www.aeaweb.org/articles?id=10.1257/000282802762024683), American Economic Review, 2002. La page des auteurs à [Erasmus](https://pure.eur.nl/en/publications/the-halloween-indicator-sell-in-may-and-go-away-another-puzzle/) décrit ce sujet. Nous n’en déduisons pas une règle d’interdiction d’août pour notre stratégie intrajournalière.

Un seul août perdant donne une observation d’août, pas plusieurs années d’observations saisonnières. Une moyenne janvier–août compare huit mois d’une année ; elle ne sépare pas l’effet du mois, du régime de marché, des règles d’entrée et du hasard. Le bot prend aussi des ventes : une baisse d’indice ne signifie pas automatiquement une perte de stratégie.

Dans la référence déjà publiée, MNQ et MES perdent en août tandis que MGC gagne sur un seul trade. Dire que tous les marchés américains étaient mauvais masquerait ces différences et les petits effectifs. Le Jeu 40 conserve donc août, les mêmes profils et le même risque. Aucun mois ne sera exclu parce qu’il perd.

## Ce qui change au Jeu 40

On élargit d’abord la mesure à janvier–août, sans modifier les entrées, les sorties ni les montants et sans nouvelle inférence Kronos. À la demande explicite de Diego, seules les journées aux données manquantes sont exclues et barrées dans le calendrier ; les autres journées du mois sont calculées.

Il n’est pas nécessaire de trader chaque jour pour atteindre un objectif. En revanche, une journée sans données n’est pas une journée où la stratégie aurait certainement gagné zéro : les comptes partiels simulent une pause forcée à ces dates. Les résultats et leur moyenne porteront sur les journées disponibles, avec cette limite visible.
