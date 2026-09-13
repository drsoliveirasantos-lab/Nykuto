# Kronos-mini — diagnostic technique K1

Protocole fixé le 10 septembre 2026 avant toute prévision sur les données Nykuto.
Ce diagnostic ne constitue pas un nouveau jeu de stratégie et ne modifie aucun
registre ou moteur gelé. Aucun ordre ni activation Paper/Shadow.

- Modèle : NeoQuasar/Kronos-mini et Kronos-Tokenizer-2k, code et poids épinglés
  aux révisions relevées pendant le téléchargement ; safetensors uniquement.
- Données : snapshot privé Jeu09 v2, SHA-256
  `43bb1959f4fbb2db25b0fbe306beb1e7599602b6d1d7df2babbc214bf4e01a15`.
  Contrat MNQU6, bougies M15, séance cash. Validation existante complète requise.
- Fenêtres : 5e, 10e, 15e et 20e séances observées de chacun des mois juin,
  juillet et août 2026 ; prévision à 12h et 14h New York, à partir de la
  bougie qui vient de clôturer. 24 fenêtres prévues, sans sélection au résultat.
- Contexte : exactement 64 bougies terminées ; horizon : 4 bougies M15.
  Les heures futures proviennent des heures de la séance vérifiée, sans prix futurs.
- amount=0, indisponible sur cette source futures ; volumes natifs conservés.
  Horodatages convertis en heure New York sans fuseau pour les caractéristiques
  temporelles du modèle ; le fichier conserve les secondes UTC.
- Température 1, top_p 0.9, sample_count 1, seed 42 pour chaque fenêtre.
  Aucun ajustement après lecture des sorties. CPU privilégié pour reproduction.
- Comparaison : MAE sur les quatre clôtures contre la dernière clôture constante,
  par mois et globalement. MAE finale et direction finale exactes supplémentaires.
  Directions nulles traitées comme une troisième catégorie, sans les omettre.
- Rapporter toute fenêtre manquante, sortie non finie ou incohérence OHLC ; ne pas
  supprimer un échec pour améliorer la moyenne. Aucun réglage de stratégie.
- Seuil descriptif : erreur inférieure au témoin dans chacun des trois mois
  ET globalement. Ce seuil ne valide ni rentabilité ni qualité statistique.

L'historique a déjà été observé pendant le développement de Nykuto. Ce petit
diagnostic rétrospectif ne constitue pas une confirmation indépendante. Il ne
simule aucune entrée, sortie, commission ou slippage et ne chiffre aucun gain.
Un avantage éventuel devra être testé séparément à règles et coûts constants.
Les données, requêtes et sorties détaillées restent privées. Le rapport public
contient seulement les mesures agrégées et métadonnées de reproduction.
