# Jeu 39 — Horaires et modèle téléchargé, essais séparés

Statut au gel : préparé, aucune prévision ni performance de ces règles calculée. Publication du protocole, du code, des sources et des requêtes hashées avant lancement. Une campagne bornée, sans surveillance permanente.

## Référence conservée

Jeu 37 `fixed100` exact, compte funded 50K neuf par mois ; risque nominal maximal 100 $ frais compris, limite quotidienne interne 200 $, au plus deux trades par jour et une seule position, réserves et quantités inchangées, stops et sorties 2R inchangés. Les objectifs/retraits et hypothèses de conversion restent ceux du Jeu 37 : premier objectif personnel de 1 000 EUR puis poursuite vers 4 000 USD de résultat. Aucune promesse de revenu ni hausse de risque.

MES garde son filtre RSI, MGC sa cassure échouée avant 11 h New York, MYM reste exclu. Préparation et ruptures historiques, dont le chemin particulier d’août, identiques à la référence. Un refus MNQ peut libérer une admission ailleurs : les effets de portefeuille et par marché seront publiés.

## Exactement deux variantes nouvelles

1. `mnq-before-11` : refuser les nouvelles entrées MNQ dont `signalClose`, égal à l’heure d’ouverture d’entrée, tombe à 11:00 ou après en `America/New_York`. 10:55 est accepté ; 11:00 et 12:00 refusés. Le signal initial appartient à la fenêtre existante 10:00–12:00 ; la première entrée possible après breakout/retest distincts est 10:10. Une position déjà ouverte continue selon ses sorties habituelles, éventuellement jusqu’à 15:45. Ce n’est pas un arrêt de toute activité à 11 h.
2. `mnq-kronos` : aux mêmes signaux MNQ, refuser seulement si la quatrième clôture prédite par Kronos-mini est strictement opposée au trade par rapport au prix d’ouverture d’entrée. Achat refusé si prévision < entrée ; vente si prévision > entrée. Égalité acceptée. Aucun seuil de confiance ou distance recherché. Les autres contrôles restent applicables.

Pas de combinaison des variantes et pas d’extension à MES/MGC. Aucun seuil ne sera modifié après résultat.

## Modèle et causalité

Kronos-mini, tokenizer et code aux révisions de `jeu39-policy.mjs`, sept fichiers locaux contrôlés par SHA selon le registre et l’adaptateur K1. Aucun téléchargement, abonnement ou réentraînement. CPU, deux threads, versions exactes du registre ; seed 42, température 1, top-k 0, top-p 0, un échantillon. Une inférence par requête unique, sans sélection entre tirages ni nouvelle tentative après erreur.

Chaque requête contient 64 bougies M15 complètes, agrégées de trois M5 consécutives de la même séance cash et du même contrat, volume conservé et montant nul. Quatre bougies futures M15 sont prédites. Les données futures réelles ne sont jamais entrées dans le modèle. Le contexte se réinitialise aux changements de contrat, trous intrajournaliers ou séances attendues manquantes ; un week-end/jour férié ne crée pas de faux trou. Aucune bougie overnight n’est inventée.

La dernière bougie d’entrée du modèle doit être clôturée depuis 0 à strictement moins de 900 secondes à `signalClose`. L’horizon prédit reste dans la séance. Seul `entry.open` de la bougie d’entrée est utilisé par le filtre ; ni son high, ni son low, ni sa clôture. Les paramètres restent identiques sur chaque préfixe chronologique.

Le pack préparé avant inférence contient 49 signaux MNQ : juin 16, juillet 20, août 13. Il comporte 43 requêtes uniques et 46 liens utilisables ; trois signaux de juin manquent de contexte après roll. Taille 287 627 octets, SHA-256 `a9578a01fe5e8512468d55e17611e8d094e196f58482d4790afbb88e6d313703`. Aucun résultat de prévision n’a été consulté pour ce choix.

Contexte insuffisant, erreur d’inférence ou sortie OHLC invalide : abstention du nouveau filtre, règles de référence maintenues, incident conservé. Toute erreur ou sortie invalide fait en plus échouer le critère qualité de Kronos. Les timestamps, métadonnées et bornes OHLC sont revérifiés sans faire confiance au seul drapeau du modèle.

Limite d’exécution : la relecture conserve l’entrée à l’ouverture suivante et ne simule pas un délai supplémentaire d’inférence ou l’impact de marché. C’est une hypothèse idéale de recherche, pas une validation d’exécution en production. Les prévisions sont des prix générés, pas des probabilités calibrées de gain.

## Campagne et critère préalables

Juin, juillet et août 2026, déjà vus, réinitialisés chaque mois ; trois configurations (référence et deux variantes), coûts normaux et doublés : **18 relectures, six témoins exacts entiers et deux configurations nouvelles**. Aucune sélection de belle journée ni diagnostic présenté comme validation indépendante.

Pour chaque variante : net au moins égal et drawdown réalisé au plus égal à la référence dans les six cellules mois/coûts ; aucune rupture de compte ; amélioration stricte du net dans au moins une cellule. Pour Kronos, aucune sortie invalide ni erreur. Tout échec donne « non retenue ». Même si tous les critères passent : candidat de recherche seulement, sélection automatique nulle, confirmation indépendante fausse, exécution interdite.

Publier tous les résultats : net, effectif, gains/pertes, moyenne, drawdown, objectifs/retraits, marchés, heures, journées/semaines, refus, gagnants retirés, perdants évités et nouvelles admissions. Ne pas additionner ces mois comme un compte continu. Ne pas multiplier le risque pour atteindre artificiellement 4 000.

## Contrôles et archivage

Le runner vérifie gel commité, empreintes des dépendances, sources privées, requêtes et lien des prévisions au même gel/commit. Il reconstruit les requêtes par préfixes quotidiens, vérifie les six témoins JSON entiers puis filtre et comptes sur chaque préfixe. Aucun écrasement : une sortie existante doit être auditée/reprise, jamais recalculée en changeant la règle.

```bash
node scripts/build-trading-jeu39.mjs /CHEMIN_PRIVE/jeu39-bundle.js
python scripts/run-trading-jeu39-model.py --input /CHEMIN_PRIVE/requests.json --output /CHEMIN_PRIVE/predictions.json --assets-dir /CHEMIN_PRIVE/model-assets
node scripts/run-trading-jeu39.mjs /CHEMIN_PRIVE/sources /CHEMIN_PRIVE/jeu37 /CHEMIN_PRIVE/requests.json /CHEMIN_PRIVE/predictions.json /CHEMIN_PRIVE/jeu39
```

Sources exactes dans `jeu39-source.json` ; prix, requêtes, prévisions et trades individuels hors Git. Archiver les quatre sorties privées sous un préfixe Jeu 39 neuf de TRADING_DATASETS, avec manifestes hashés et relecture exacte. Publier agrégats, bilan et leçons dans le Lab et son calendrier ; ajouter deux configurations exécutées seulement après succès réel, sans modifier les anciennes ni le gel. Préserver Kronos/RSI/news, les travaux concurrents, Jeu 08 et le rendez-vous du 3 décembre. Aucun broker, ordre, Paper/Shadow, compte, abonnement, achat ou merge main. Vérifier tests, build, hygiène, Functions, CI et déploiement du même commit avant d’annoncer la publication.
