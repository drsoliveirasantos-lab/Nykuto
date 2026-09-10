# Jeu44 — Contexte des indices et VWAP ancré, après revue de 20 vidéos

Préparation du 10 septembre 2026. Statut initial : protocole avant performance ; ce document ne prétend pas que la campagne est terminée.

## Paramètres exécutables

<!-- POLICY44:START -->
```json
{
  "policy": {
    "version": "jeu44-video-context-v1",
    "from": "2026-01-01",
    "end": "2026-09-01",
    "variant": null,
    "mode": "funded",
    "accountInitialUSD": 50000,
    "riskMaximumUSD": 100,
    "dailyLossUSD": 200,
    "targetR": 2,
    "reset": "new-account-each-month",
    "expectedSessions": 166,
    "availableCommonSessions": 164,
    "executionCount": 112,
    "missingSessionPolicy": "exclude-entire-common-session-carry-account-no-assumed-pnl",
    "winterPreparation": "available-complete-sessions-from-2026-01-01-no-december",
    "summerPreparation": "exact-game37-may-warmup-june-july-historical-august",
    "independent": false,
    "confirmed": false,
    "selection": null,
    "executionAllowed": false,
    "reference": "jeu40-fixed100",
    "cashOpenMinute": 570,
    "candleSeconds": 300,
    "decisionClock": "closed-signal-at-next-open",
    "peerSymbols": {
      "MNQ": "MES",
      "MES": "MNQ"
    },
    "returnDefinition": "last-closed-price-divided-by-own-cash-open-minus-one",
    "peerDirectionVeto": "side-signed-peer-return-below-zero",
    "relativeStrengthVeto": "side-signed-own-return-minus-peer-return-below-zero",
    "avwapAnchor": "original-breakout-bar-open",
    "avwapPrice": "hlc3",
    "avwapVeto": "side-signed-signal-close-minus-anchored-vwap-below-zero",
    "equality": "allowed",
    "missingContext": "keep-reference-and-label-unobservable",
    "minimumAnchorBars": 2,
    "parameterSearch": false,
    "combinedVariants": false,
    "exactControls": 16,
    "newConfigurations": 6,
    "accountPrefixes": 2296,
    "filterPrefixes": 2296,
    "contextPrefixes": 2296,
    "videoContextPrefixes": 2296,
    "criterion": "each-candidate-all-16-cells-net-and-realized-drawdown-nondegradation-plus-strict-net-improvement",
    "videoSources": 20,
    "sourcePerformanceVerified": false,
    "modelInferences": 0
  },
  "variants": [
    {
      "id": "baseline",
      "targetSymbol": null,
      "mechanism": null,
      "label": "Référence Jeu40"
    },
    {
      "id": "mnq-peer-direction",
      "targetSymbol": "MNQ",
      "mechanism": "peer-direction",
      "label": "MNQ · peer-direction"
    },
    {
      "id": "mes-peer-direction",
      "targetSymbol": "MES",
      "mechanism": "peer-direction",
      "label": "MES · peer-direction"
    },
    {
      "id": "mnq-relative-strength",
      "targetSymbol": "MNQ",
      "mechanism": "relative-strength",
      "label": "MNQ · relative-strength"
    },
    {
      "id": "mes-relative-strength",
      "targetSymbol": "MES",
      "mechanism": "relative-strength",
      "label": "MES · relative-strength"
    },
    {
      "id": "mnq-breakout-avwap",
      "targetSymbol": "MNQ",
      "mechanism": "breakout-avwap",
      "label": "MNQ · breakout-avwap"
    },
    {
      "id": "mes-breakout-avwap",
      "targetSymbol": "MES",
      "mechanism": "breakout-avwap",
      "label": "MES · breakout-avwap"
    }
  ]
}
```
<!-- POLICY44:END -->

## Hypothèses et horloge

Six variantes isolées : trois règles, chacune appliquée à MNQ seul puis MES seul. Référence inchangée : portefeuille Jeu40 fixed100, MGC conservé et MYM exclu. Aucun cumul des nouvelles règles, aucun nouveau signal et aucune inférence de modèle.

À l’instant prévu d’entrée, les nouvelles mesures n’utilisent que les bougies M5 déjà clôturées. Pour chaque indice, le rendement est la dernière clôture divisée par sa propre ouverture cash de 9h30 New York, moins un. Le pair est MES pour MNQ et MNQ pour MES. Les deux dernières clôtures doivent être exactement synchronisées avec la clôture du signal ; pas de report d’une cotation plus ancienne ni d’utilisation de l’ouverture suivante du pair.

Direction du pair : veto lorsque son rendement, multiplié par le signe du trade, est strictement négatif. Force relative : veto lorsque la différence rendement propre moins rendement du pair, multipliée par le signe du trade, est strictement négative. Aucun ajustement de bêta, aucune optimisation par marché ou mois. Le seuil zéro traduit seulement une opposition directionnelle.

AVWAP : ancre à `breakoutAt - 300`, soit l’ouverture de la bougie de cassure identifiée par le générateur de référence. Inclure cette bougie et les suivantes jusqu’à la bougie de confirmation déjà clôturée. Au moins deux bougies ; prix typique HLC3, pondéré par volume. Veto lorsque la clôture de confirmation est sous cet AVWAP pour un long, au-dessus pour un short. Ce n’est pas le VWAP de séance et aucun point d’ancrage alternatif n’est cherché.

Une égalité conserve le signal. Données de séance ou pair incomplets, volume inconnu/négatif ou total nul : contexte explicitement non observable, décision de référence conservée. Des données malformées (horloge incohérente, OHLC invalide, contrats mélangés dans une séance) interrompent le calcul. Toutes les nouvelles mesures se réinitialisent à chaque ouverture cash ; les contrats de séances passées ne sont pas mélangés. Le filtre conserve le contrôle historique de l’ouverture d’entrée propre au moteur ; il ne lit ni son haut/bas/clôture/volume futurs, ni ceux de bougies ultérieures.

## Comparaison arrêtée avant les résultats

112 relectures : huit mois × deux coûts × sept profils, dont 16 témoins complets identiques aux archives du Jeu40. Chaque variante est comparée séparément aux 16 cellules mois/coût de référence. Risque maximal de 100 USD incluant les coûts, plafond quotidien de 200 USD, cible 2R, stop initial sans déplacement, mêmes règles d’admission et tailles entières. Les frais/slippage historiques sont appliqués avec facteurs 1 et 2 ; les coûts peuvent modifier les admissions et les quantités.

Le critère descriptif exige simultanément : aucun net mensuel dégradé, aucun drawdown réalisé mensuel accru, aucune rupture du compte, et au moins une amélioration stricte du net. Une variante sans impact échoue donc au critère. Publier pour chacune gagnants retirés, perdants retirés, nouvelles admissions, différences éventuelles entre trades communs, net, nombre de trades, profit factor, drawdown, raisons de veto et contexte absent. Le rapport expose également si chaque compte entier est identique à sa référence. Une somme positive ou un seul bon mois ne suffit pas. Pas de classement suivi d’une promotion automatique, même si ce critère passe.

Vérifier 2 296 préfixes quotidiens par couche : compte, filtre, contexte historique et nouvelles mesures. Pour chaque préfixe, reconstruire les sources disponibles jusqu’au jour concerné et retrouver exactement les décisions, trades et états journaliers correspondants. Les tests synthétiques ciblent aussi la causalité intrajournalière, le pair en retard, les changements de contrat, l’ancrage et la symétrie long/short. Ils ne mesurent pas la rentabilité.

## Données, clôture de campagne et restrictions d’interprétation

Mêmes archives natives que Jeu40, empreintes dans `jeu44-source.json` ; 164 séances communes sur 166 attendues. Les 25 février et 6 mars restent absents et non chiffrés ; février et mars sont partiels. Les états de compte sont portés pendant ces exclusions, sans gain/perte supposé. Réinitialisation mensuelle des comptes hypothétiques funded 50 000 USD. Le maximum des drawdowns mensuels n’est pas un drawdown de compte continu sur huit mois.

Les historiques ont déjà été vus, les six variantes sont liées, et la préparation héritée reste non uniforme. Aucun mois n’est présenté comme un échantillon indépendant réservé. Pas de probabilité apprise ou garantie de profit ; pas de stratégie complète YouTube reproduite. Les règles sont des adaptations Nykuto documentées dans [la recherche](./JEU44_RESEARCH.md), fondées sur les sources V01/V02/V15. Les autres vidéos ont un niveau d’accès explicitement limité ou apportent un mécanisme déjà représenté.

Les fichiers et leurs dépendances sont gelés avant lecture des performances, puis le gel est publié dans une branche de recherche GitHub avant lancement. Exécution unique depuis ce commit ; le script refuse un dossier de sortie existant. En cas d’échec, conserver son statut et diagnostiquer avant toute décision de nouvel essai. Le protocole, ses critères et ses seuils ne seront pas modifiés en fonction du résultat.

Rapport et trades détaillés restent privés ; seules sources, code, paramètres et résultats agrégés vérifiés sont destinés au dépôt. Les nouvelles configurations sont préparées ici ; les registres historiques ne sont pas comptabilisés comme six essais achevés avant leur clôture. Aucune activation Paper/Shadow/broker, aucun ordre réel, aucune modification de la collecte prospective Jeu08 ou du rendez-vous du 3 décembre.

Après lancement confirmé : annoncer une durée estimée puis arrêter le suivi. Attendre un « Vérifie » de Diego pour lire les résultats une fois ; ne pas surveiller GitHub et ne pas démarrer une autre campagne implicitement.
