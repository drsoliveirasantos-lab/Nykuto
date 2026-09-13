# Jeu 20 — préparation séparée des deux horizons MYM

Une seule modification, gelée avant résultats : préparer les indicateurs 5 min
et 30 min avec leurs propres bougies, au lieu d'exiger 220 bougies 30 min
composées chacune de six bougies 5 min dans toute la préparation. La piste MYM
Pullback a été choisie après les huit essais du Jeu 19 ; cet historique de
sélection reste déclaré. Aucun autre marché ni méthode n'est testé ici.

Le fournisseur explique qu'un intervalle sans transaction peut ne pas produire
de bougie. Ses bougies natives 30 min sont récupérées séparément. Chaque OHLC
et volume 30 min doit correspondre exactement à l'agrégation des bougies 5 min
présentes dans cet intervalle. Aucune bougie 5 min absente n'est créée. Un
intervalle 30 min absent ou divergent réinitialise la préparation 30 min ; une
séance 5 min incomplète réinitialise la préparation 5 min et ne peut être scorée.
Les horaires futures doivent toujours couvrir toute la plage cash commune.
Cette réconciliation utilise le même fournisseur, pas une source indépendante.

Il faut 220 bougies complètes préalables sur **chaque** horizon avant de scorer
une séance. Les EMA/ADX/ATR 5 min ne traversent pas une lacune 5 min et les
indicateurs 30 min ne traversent pas une lacune 30 min. Les moyennes et l'ADX
30 min utilisés pour une entrée sont toujours ceux d'une bougie déjà clôturée.
Les séries restent distinctes par échéance ; aucun raccordement de prix entre
contrats et aucune donnée future. Les périodes Jan–Avr et Mai–Août du Jeu 19,
les trois échéances MYM, les roulements, les frais, le risque 50/100 $, le stop,
la cible et les huit critères de réussite restent inchangés.

Le résultat de développement est écrit avant de lire la performance de réserve.
Il faut satisfaire **tous** les critères du Jeu 19 sur janvier–avril pour
évaluer mai–août. La décision est gelée dans un commit local et par empreinte.
Un échec ultérieur n'autorise pas un second choix sur cette réserve. Les nombres
de trades et les performances peuvent changer : les anciennes séances exclues
sont ajoutées et la préparation plus complète peut modifier les indicateurs.
Les résultats du Jeu 19 restent intacts ; le Jeu 20 n'est pas une réécriture.

Une réussite de développement n'est pas une validation. Une réserve positive
ne remplace ni plusieurs nouvelles fenêtres prospectives ni un test d'exécution.
Le bot reste désactivé ; l'objectif commercial de l'évaluation n'est pas garanti.
Les observations de mai–août MYM n'ont pas été utilisées pour choisir ce réglage,
mais sont corrélées à des marchés et événements déjà examinés sur MNQ.

Sources : métadonnées et horaires MYM du Jeu 19, et bougies natives Massive
`/futures/v1/aggs/{ticker}?resolution=30min`, récupérées le 9 septembre 2026.
Toutes les sources brutes, réconciliations et transactions restent privées.
