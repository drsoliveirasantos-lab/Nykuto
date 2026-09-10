# Jeu45 — Pourquoi tester horaires et sortie à 30 minutes

La demande de Diego vise le gain net moyen par trade et le choix des séances. La mémoire et le catalogue croisé sont consultés : Jeu35 (cible3R) et Jeu39 (MNQ avant11h) sont rejetés ; Jeux41–44 n'ont confirmé aucune amélioration. Cette campagne ne relance aucune de ces règles et ne combine pas les variantes vidéo rejetées.

Les horaires sont exploitables sans modèle ni anticipation des prix. Les nouvelles variantes utilisent un repère conventionnel Londres08:00–16:30 avec ses changements d'heure, appliqué aux signaux matinales américains déjà disponibles. Le sous-groupe hors Londres comprend les jours fériés londoniens, étiquetés séparément. Les dates janvier–août proviennent des [jours fériés officiels anglais/gallois](https://www.gov.uk/bank-holidays). La [page LSE](https://www.londonstockexchange.com/trade/trading-access/business-days) ne fournit pas de corps exploitable lors de cette lecture : ne pas prétendre posséder son calendrier complet. Le repère Londres reste une hypothèse documentée et non un flux européen observé.

La fenêtre US est celle de la référence et de la [séance principale NYSE](https://www.nyse.com/trade/hours-calendars). Les archives ne permettent pas l'étude des ouvertures asiatiques/européennes. Le moteur n'invente pas leurs bougies et n'élargit pas les entrées jusqu'à l'après-midi.

L'espérance observée d'un trade est le net total divisé par le nombre de trades, donc le taux de gain multiplié par le gain moyen, moins le taux de perte multiplié par la perte moyenne absolue. Les valeurs utilisées ici sont déjà nettes de coûts. Agrandir la cible peut perdre des gagnants ; réduire les pertes peut aussi sacrifier des gagnants lents. La sortie proposée vérifie une seule fois le net latent après30minutes et sort à l'ouverture suivante s'il reste non positif. Elle doit être testée, pas présentée comme un avantage acquis.

Le [CME](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size) relie le dimensionnement au stop et au budget de risque. Notre campagne conserve donc100/200USD et2R. Cette source ne justifie pas l'efficacité du délai30minutes, qui est une hypothèse Nykuto. Pas de grille de paramètres, de promesse mensuelle ni de données réservées après coup.

Voir le protocole, le manifeste de sources et la politique exécutable. La campagne produira des hypothèses descriptives sur les données déjà vues, jamais une confirmation indépendante.
