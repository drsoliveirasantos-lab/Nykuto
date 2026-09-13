# Jeu 26 — cassure échouée de la zone d'ouverture

Version jeu26-failed-breakout-v1, préenregistrée le 9 septembre 2026 avant
performances. Une hypothèse, quatre configurations, aucun ajustement après
résultats. Le registre consulté conserve 53 configurations des Jeux 19–25.
Les protocoles antérieurs décrivent continuation, pullback, croisements et
filtres VWAP/confluence, sans cette entrée de réintégration à contre-cassure.

## Recherche publique et adaptation

Sources consultées le 9 septembre 2026 :

- [David Bergstrom, Build Alpha, 9 avril 2026](https://www.buildalpha.com/opening-range-breakout/),
  section « Setup 2: Fade the False Breakout » : retour dans la zone après
  échec d'une sortie. C'est la source directe de l'idée d'entrée retenue.
- [Vidéo Trader Dale](https://www.youtube.com/watch?v=bwQ0ty3wNPo) et sa
  [transcription publiée par l'auteur le 13 août 2025](https://www.trader-dale.com/trading-failed-breakouts-at-vwap-es-futures-trade-from-our-live-room-13th-aug-25/)
  : attendre l'échec observable d'une cassure. L'exemple utilise aussi delta,
  déséquilibres et niveaux nocturnes. Ces informations ne sont pas présentes
  dans notre préparation cash OHLCV ; aucune absorption ou delta n'est inventé.
- [Discussion publique Bear Bull Traders, 22 mai 2020](https://forums.bearbulltraders.com/topic/1991-vwap-false-breakout/)
  : un exemple simulé sur action rappelle le problème du renforcement d'une
  position perdante. Cette communauté annonce sa migration vers Discord,
  mais seuls ses anciens échanges publics ont été lus. Aucun salon privé
  Discord n'a été consulté, rejoint ou contacté.

Les descriptions YouTube et la transcription de l'auteur ont été consultées,
pas une observation indépendante de comptes réels. Une ouverture directe
YouTube a été limitée par le service ; la transcription publique fournit le
contenu analysé. Les promesses commerciales et trades illustratifs ne sont
pas utilisés comme preuves de rentabilité. Aucun cours ou logiciel acheté.

Hypothèse causale : l'absence de maintien hors de la zone peut entraîner un
retour vers son intérieur. Les derniers jeux étudiaient la continuation ; le
Jeu 26 teste l'échec confirmé, sans inverser aveuglément tous les anciens trades.
Les paramètres précis ci-dessous sont notre adaptation, pas une reproduction
intégrale de la stratégie discrétionnaire d'un auteur.

## Définition figée

1. Zone 09:30–10:00 New York, haut/bas des six vraies bougies de cinq minutes
   entièrement clôturées. Horaires et changements d'heure fournis par les
   calendriers gelés, non déduits de l'axe d'une capture d'écran.
2. Après 10:00, une bougie clôture au moins un tick au-dessus du haut ou
   en dessous du bas. Une mèche seule ne suffit pas.
3. Dans les six bougies suivantes (30 minutes au maximum depuis l'open de
   la bougie de cassure), attendre la première clôture strictement entre
   les deux bornes. Cette bougie doit avoir un corps dans le sens du retour.
   Short après cassure haute, Long après cassure basse. Au-delà du délai,
   attendre un retour intérieur avant de réarmer une nouvelle excursion.
   Un retour sans corps directionnel termine l'excursion sans signal.
4. Entrée à l'open suivant, au plus tard 12:00 New York, et seulement si
   cet open reste strictement intérieur. Aucun extrême de la bougie d'entrée
   ne décide du signal ou du stop. Une tendance qui reste dehors ne déclenche
   aucun trade contraire.
5. Stop un tick derrière l'extrême de TOUTE l'excursion, bougies de cassure
   et de réintégration incluses. Il ne se rapproche pas pour respecter le budget.
   Cible au plus proche entre 1,5R arrondi au tick vers l'entrée et la borne
   opposée de la zone. Le potentiel est ainsi borné à l'intérieur de la zone.
   Rapport gain/risque net après frais au moins 1, sinon refus.
6. Un microcontrat. Plafond fixe 150 USD frais/friction compris, budget
   quotidien 300 USD, réserve de seuil 100 USD. Ces valeurs déjà étudiées
   au Jeu 23 isolent la nouvelle famille de signal ; aucun nouveau score de
   risque, filtre RSI/volume ou seuil appris. Une seule position, au plus une
   entrée exécutée par sens et deux par séance. Seule une entrée exécutée
   consomme le sens. Freins existants de pertes consécutives et pertes en R.
7. Arrêt au plus tard quinze minutes avant clôture cash. Fills causaux du
   Jeu 23 : stop prioritaire si stop et cible touchés dans la même bougie,
   gaps à l'open réel, protections de compte et quotidiennes pessimistes.

Les deux captures MNQ 15 minutes envoyées par Diego le 9 septembre illustrent
la nécessité de distinguer contexte, rebond et clôture confirmée. Elles ne sont
pas une source de backtest, ne fixent aucun niveau numérique dans le code et
ne constituent pas une confirmation. Le contexte des unités supérieures et
des annonces économiques n'est pas déduit d'une seule image. La présente
hypothèse n'ajoute pas de filtre d'annonces non disponible dans les archives.

## Données, coût et témoin

Sources privées inchangées : archives Jeu 19 MES/MYM/MGC, Jeu 14 MNQ ; tailles
et SHA-256 dans jeu26-source.json. Préparation complète du Jeu 22, échéances
explicites, aucune série continue réajustée ni bougie inventée. Les lacunes
du 6 mars et du 25 février MGC restent des lacunes bloquantes. Les résultats
partiels des séances évaluables sont diagnostiques, jamais une fenêtre complète.

Tick / USD par point : MNQ 0,25 / 2 ; MES 0,25 / 5 ; MYM 1 / 0,50 ;
MGC 0,10 / 10. Coût normal : 2,50 USD aller-retour plus un tick par côté,
soit 3,50 / 5 / 3,50 / 4,50 USD. Stress : double de tous ces coûts, avec
simulation complète des admissions. Pas de volume d'ordres ni de carnet simulé.
Compte LucidFlex 25K, MLL 1 000, seuil verrouillé 25 100, objectif 1 250,
cohérence 50 %, règles fournisseur gelées précédemment. Les plafonds internes
ne sont pas présentés comme des règles Lucid ou une fraction disponible du nominal.

Témoin descriptif : Game 23 fixed150/daily300, mêmes marchés, périodes et frais,
lu en archive vérifiée sans resimulation. Il teste une autre famille avec
sa cible 1,5R non bornée à la zone ; l'écart n'isole donc pas le seul sens.
Publier net, drawdown et rapprochement des trades identiques/ajoutés/retirés,
sans compter les témoins comme de nouveaux essais.

## Dates, sélection et arrêt

Développement janvier–février et mars–avril 2026. Critères inchangés : couverture
totale, ≥40 trades au total, ≥12 par fenêtre, chaque fenêtre positive en R ET USD,
PF global en R ≥1,1, drawdown réalisé ≤8R, total positif en R et USD aux coûts
doublés, comptes simulés complets aux deux coûts sans violation. Aucun critère
abaissé. Risques/échantillons/manques sont publiés même en cas de total positif.

Une seule candidate éventuelle : parmi les profils satisfaisant tous les
critères, classer par pire espérance de fenêtre en R décroissante, puis drawdown
en R croissant, puis ordre MNQ/MES/MYM/MGC. Épingler la sélection avant réserve
mai–juin et juillet–août ; si sélection nulle, ne pas calculer cette réserve.
Aucune seconde sélection après un échec. Ces dates et marchés corrélés ont déjà
été consultés ; independent=false, confirmed=false.

Confirmation indépendante ultérieure : trois nouvelles fenêtres complètes,
octobre–novembre 2026, décembre 2026–janvier 2027, février–mars 2027, avec candidate
fixée avant toute observation. Une période utilisée en développement ne peut
servir ensuite de confirmation. Les critères internes ne garantissent aucun gain.

## Gel, vérification et conservation

Avant performances : tests synthétiques du retour clôturé, longue baisse sans
réintégration, timing et échéance, expiration non renouvelée, premier retour
non directionnel, stop de toute l'excursion, cible bornée, gap hors zone,
coûts/budgets et ambiguïtés ; protocole, code, dépendances, sources et tests
empreintés puis commités. Audit de tous les préfixes de signaux, préfixes de
comptes et règles de chaque trade. Ne pas modifier de fichier gelé après calcul.

Chaque résultat est conservé. Sources et trades restent privés dans
TRADING_DATASETS, namespace 5eba3a535f584bb3b0dbcdff623811ca, nouveau préfixe
jeu26/failed-breakout-v1/, tailles/SHA-256 et lecture après écriture.
Anciennes archives préservées. Git contient code, protocole, statistiques agrégées
et registre actualisé. Tests logiciels et déploiement ne prouvent pas les gains.
Paper, Shadow, broker et réel restent désactivés ; aucun ordre, abonnement,
message, changement de collecte, fusion main ou test dans le navigateur.
