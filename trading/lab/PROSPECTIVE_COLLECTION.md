# Jeu 08 — collecte prospective MNQ

Protocole fixé le 8 septembre 2026, avant la première séance. Le Jeu 07 reste
bloqué sur ses 58 horaires historiques manquants. Aucun ancien intervalle ne
devient une nouvelle confirmation. Cette collecte utilise les connexions
Massive et Cloudflare existantes ; aucun compte Databento ni achat n'est requis
par ce mécanisme. La disponibilité future du fournisseur n'est pas garantie.

## Période et règles figées

- Un seul contrat : **MNQZ6**, produit MNQ, XCME, sans raccordement de contrats.
  La fiche Massive du 8 septembre indique une dernière séance le 18 décembre
  2026, après la fin de cette fenêtre.
- Préparation : **9–30 septembre 2026** (16 séances prévues).
- Première fenêtre : **1 octobre–30 novembre 2026** (42 séances prévues).
- Bougies 15 minutes pendant la séance actions américaine, horaire New York.
- Calendrier prévisionnel : [NYSE](https://www.nyse.com/trade/hours-calendars),
  consulté le 8 septembre 2026 : 9 h 30–16 h, fermeture le 26 novembre,
  clôture à 13 h le 27 novembre. Conversion IANA pour le changement d'heure.
  Ce calendrier annoncé ne certifie pas l'absence d'interruptions imprévues.
- Moteur gelé au commit `7a20a9459bfdd2b4546c7b0ec6b04ee721d9a2be` :
  `validation-engine.mjs`, `market-comparison.mjs`, leurs indicateurs et la
  politique de séance. EMA 9/21, ADX 14 ≥ 20, ATR 14 × 1,25 ; risque au stop
  arrondi au tick de 0,25 point ; objectif 1,5 R arrondi vers l'entrée.
- Entrée à l'ouverture suivante ; une position ; au plus trois entrées par
  séance ; arrêt après deux pertes consécutives ou −2 R réalisés ; sortie à
  l'ouverture de la dernière bougie ; aucun signal reporté pendant la nuit.
  Stop prioritaire si stop et objectif touchés dans la même bougie ; gap
  défavorable exécuté à l'ouverture, gain plafonné à l'objectif.
- 2 $ par point ; coût hypothétique de 3,50 $ par aller-retour et par contrat,
  puis nouvelle simulation complète à 7 $. Ce ne sont pas des frais de courtier
  vérifiés, ni une simulation à capital/marge constants.
- Confirmation inchangée : trois fenêtres distinctes de deux mois, ≥40
  transactions au total et ≥12 par fenêtre, résultat positif dans chacune,
  profit factor ≥1,10, baisse réalisée ≤8 R, résultat positif avec coûts doublés.
  Cette campagne ne fournit qu'une seule fenêtre : elle ne peut pas valider
  à elle seule le bot, même si tous ses résultats sont positifs.

## Ce qui est réellement automatisé

Une collecte quotidienne **après séance**, pas une simulation d'exécution en
direct ni un enregistrement de signaux au fil des bougies. Les captures doivent
être effectuées sous 48 heures après la clôture. Une capture plus tardive reste
archivée mais ne devient pas une observation prospective complète. Aucun
rendement n'est calculé au cours de cette phase. Ne pas adapter les paramètres
ou choisir d'autres dates en fonction des prix reçus.

Le premier passage est prévu le 10 septembre au matin pour la séance du 9.
La tâche court jusqu'au 2 décembre inclus pour archiver la dernière séance et
signaler les manques. Le journal affiche la programmation seulement après
confirmation de la création de la tâche ; cela ne prouve pas sa bonne exécution.
Les échecs et dates de mise à jour restent visibles. Les heures futures reçues
de Massive sont des horaires annoncés et ne garantissent pas que chaque
interruption de marché ait été observée.

## Données et intégrité

- Source prix : Massive `/futures/v1/aggs/MNQZ6`, résolution `15min`,
  `window_start.gte=DATE`, `window_start.lt=LENDEMAIN`, tri ascendant,
  limite 1000. Ces bornes sont UTC ; le normaliseur ne garde que la plage cash.
- Source horaires : Massive `/futures/v1/schedules`, produit MNQ, date de fin
  de séance exacte, XCME, limite 1000. Les doublons identiques sont dédupliqués
  seulement pour le contrôle ; les réponses sources sont conservées.
- Récupérer toute pagination et toute sortie complète avant de marquer
  `paginationComplete:true`. Ne pas transformer une erreur, un tableau tronqué
  ou une réponse vide en réussite. Ne pas reconstituer les horaires à partir
  des prix, d'un simple pré-open ou d'un autre jour.
- `prospective-collection.mjs` valide contrat, provenance, dates, horodatages,
  ticks, OHLC, volumes, doublons, grille de bougies et intervalle ouvert–fermé
  couvrant la séance. Une pause interrompt cet intervalle.
- Les captures brutes JSON et leurs SHA-256 vont dans le KV privé
  `TRADING_DATASETS`, sous `jeu08/raw/DATE/SHA.json`. Aucune donnée fournisseur
  ni clé dans Git ou dans un fichier public.
- Le journal normalisé est `jeu08/collection-v1.json`. Avant chaque mise à jour,
  conserver l'ancien et le nouveau journal sous `jeu08/revisions/SHA.json`.
  Vérifier chaque écriture par relecture exacte, puis actualiser le journal
  courant en dernier. Un seul rédacteur automatique ; KV n'offre pas de
  transaction multi-clés. Relire le journal juste avant l'écriture ; abandonner
  et recalculer si un autre rédacteur l'a modifié.
- Une première séance complète n'est jamais remplacée automatiquement.
  Les tentatives incomplètes peuvent être complétées dans le délai de 48 h,
  en conservant toutes les versions. Les erreurs ne suppriment pas les données.
- `/api/lab/jeu08` est GET uniquement et vérifie la signature Cloudflare Access
  avant toute lecture KV. Il recalcule la couverture depuis les enregistrements
  et ne renvoie que le suivi, sans prix bruts.

## Procédure de collecte pour la tâche

Lire ce protocole et le code de la branche `feat/trading-hq-v1` du dépôt
`drsoliveirasantos-lab/Nykuto`. Le journal privé appartient au namespace
`5eba3a535f584bb3b0dbcdff623811ca`, compte Cloudflare courant. Aucun autre
namespace ou historique des jeux précédents ne doit être modifié.

1. Lire le journal et appeler `inspectCollection`. Choisir les séances terminées
   manquantes, par ancienneté, dans le délai de 48 h ; au plus trois dates par
   passage. Ne pas exclure les trous plus anciens du bilan. Ils restent bloquants.
2. Pour chaque date, appeler les deux sources Massive ci-dessus. Construire une
   capture exacte : `{date, collectedAt, paginationComplete, pricesCsv,
   schedulesCsv}`. `collectedAt` est l'instant réel après récupération des deux
   réponses, avec fuseau UTC. Ne jamais antidater.
3. Utiliser `node scripts/collect-trading-session.mjs CURRENT.json CAPTURE.json
   NEXT.json` dans un checkout de travail. Les entrées/sorties restent privées.
   Le script renvoie les clés de capture et de révision, ainsi que la couverture.
   Pour une erreur fournisseur, utiliser une capture `{date, error:"unavailable"}`
   (codes possibles : `unavailable`, `pagination`, `invalid`, `access`).
4. Archiver la capture brute sous la clé renvoyée, l'ancien journal sous son
   hash, puis le nouveau journal sous son hash ; relecture exacte à chaque fois.
   Relire le courant pour éviter d'écraser une modification concurrente et
   publier `NEXT.json` sous la clé courante en dernier. Vérifier cette relecture.
5. Ne faire aucun commit ni redéploiement pendant la collecte. Aucun contact
   support, aucun abonnement, aucun achat, aucun ordre, aucune activation du
   bot. Signaler au propriétaire une erreur nécessitant une action, puis un
   bilan à la fin de la fenêtre ; ne pas envoyer de notification pour chaque
   collecte normale. Ne pas masquer les manques après plusieurs échecs.

L'accès Alpaca calendar répondait en erreur lors de la préparation ; il ne fait
pas partie des dépendances de cette tâche. Le calendrier NYSE prévisionnel est
fixé dans le code et sourcé ci-dessus. Avant tout calcul ultérieur, auditer les
changements de calendrier, interruptions, intégrité et couvertures, puis
réutiliser le moteur gelé. L'archive complète ne déclenche aucun calcul ni bot.

## Validation

Tests ciblés : calendrier et DST, jour raccourci, absence de données, prix et
horaires manquants, interruptions, retard, mauvais contrat, doublons, tick,
collecte prématurée, nanosecondes et pagination ; endpoint authentifié et fermé
en cas de données invalides. Le pipeline Trading existant doit rester vert.
