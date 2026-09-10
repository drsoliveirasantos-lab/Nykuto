# Jeu46 — Question retenue avant mesure

La sortie MNQ30minutes a ajouté91USD aux deux coûts sur les mêmes deux pertes.
Le gain moyen des gagnants reste137,83USD normal ; la perte moyenne passe de
78,00 à76,68USD. La moyenne de tous les trades15,76→16,51USD ne représente pas
le montant de chaque gagnant. Les27 pertes dans la M5 d'entrée sont inchangées.
Sources : `JEU45_RESULTS.md`, `research-bot-evidence.json`, `RESEARCH_LESSONS.md`.

Hypothèse : une clôture revenue strictement à travers le niveau de cassure
peut invalider plus tôt certaines positions dont le stop structurel n'est pas
encore atteint. Une perte plus petite peut augmenter la moyenne nette sans
augmenter la taille, même si le montant moyen d'un gagnant reste identique.
Le risque opposé est de couper un retest qui finit par atteindre sa cible.

Le niveau original existe avant l'entrée dans `jeu23-signals.mjs`. Le motif
MGC de `jeu26-signals.mjs` utilise déjà une réintégration clôturée comme
déclenchement d'une autre entrée. Cette nouvelle adaptation utilise le motif
comme **sortie d'une position indices existante**, séparément surMNQ/MES.
Elle n'ajoute pas de position inverse et ne prétend pas reproduire une vidéo.

Le catalogue croisé et les protocoles ont été relus : les cibles3R, les
réentrées, le break-even1R, le délai d'entréeM5, les filtres d'horaires,
de coût1,5, de volume de retour, d'extension1σ, de direction des pairs,
de force relative et d'AVWAP sont conservés comme essais passés. Aucun n'est
combiné ou réglé de nouveau. Les recherches web de cette préparation n'ont
fourni aucune nouvelle source primaire exploitable ; aucune nouvelle vidéo
visionnée ni efficacité externe revendiquée.

Le mécanisme s'appuie sur le constat d'entrée original, pas sur une sélection
des futurs perdants. Aucun calcul de résultat de cette nouvelle règle n'est
effectué avant gel. Les deux témoins et les deux variantes sont fixés dans
`JEU46_PROTOCOL.md` ; aucune recherche de seuil ou de durée.

Le diagnostic comparera aussi à la candidate30min, afin qu'une petite hausse
par rapport à la seule référence40 ne soit pas annoncée comme une nouvelle
amélioration du profil le plus récent. Ces comparaisons restent exploratoires
sur des données vues. Un échec sera conservé, sans campagne de rattrapage.
