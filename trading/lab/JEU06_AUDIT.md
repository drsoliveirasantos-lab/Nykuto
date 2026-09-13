# Jeu 06 — audit du 8 septembre 2026

Les règles de `MARKET_COMPARISON.md` et le moteur n'ont pas été modifiés.
Le chargement du snapshot privé vérifie SHA-256
`68336737884c2beb1ea0323c0079441b985e834e4940b2214cad82e1ee6a6b3b`,
13 440 bougies et 148 séances, dont 128 séances de comparaison.

| Marché | Transactions | Net | Coûts doublés | Baisse réalisée max. |
| --- | ---: | ---: | ---: | ---: |
| SPY | 57 | −5,458612 R | −7,336042 R | 8,145683 R |
| MES | 54 | −12,163183 R | −16,407614 R | 13,558531 R |
| MNQ | 66 | +5,230231 R | +3,361278 R | 5,165787 R |

Recalcul du snapshot, puis contrôle séparé des 354 transactions normales et
stressées : résultat reconstruit en dollars puis converti en R, frais et
glissement, cumul et baisse maximale, absence de chevauchement, entrée et sortie
dans la même séance commune, aucune entrée sur la dernière bougie, maximum
trois entrées, respect des freins après pertes, contrats et dates de roulement,
prix des futures au tick. Le calendrier et chaque séance complète sont aussi
validés au chargement. Le SPY est conservé aux prix fournis par la source, qui
peuvent être sous-centimes ; ses distances de stop et cible utilisent le tick
déclaré. Ce modèle reste une approximation d'exécution.

MNQ échoue au critère positif dans chaque période : juillet–août +3,274471 R,
septembre–octobre −0,662309 R, novembre–décembre +2,618069 R. Les trois marchés
restent « Non confirmé ». Aucun bot n'est activé.

## Décision suivante

Pas de quota de jeux. Proposition : une campagne de confirmation MNQ distincte,
avec règle, dates, coûts et critères définis avant le calcul, sans réutiliser
les fenêtres déjà examinées dans les jeux précédents. Le choix de MNQ parmi
trois produits crée un effet de sélection ; le Jeu 06 ne devient pas une preuve
indépendante après ce choix. Ne pas ajuster un paramètre sur les mois perdants
puis présenter les mêmes mois comme validation.

Avant un pilote paper : confirmation satisfaisante, coûts du courtier vérifiés,
risque d'un contrat compatible avec le capital, contrôles de séance, taille,
perte maximale, doublons, prix périmés et arrêt manuel. Le pilote mesure les
exécutions et incidents en argent fictif. Sa durée dépend du nombre de signaux
et des observations, pas d'une date promise ; il ne déclenche jamais seul le
passage à l'argent réel. Les seuils du Jeu 06 sont des critères de recherche,
pas une probabilité de gain ni une certification de rentabilité.
