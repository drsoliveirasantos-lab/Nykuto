# Protocole d’audit Pine — 13 septembre 2026

Référence : code V15.1 Explainable State Engine fourni dans la conversation, HUD V15.1.1. Le nom Partner Clean, livré ailleurs, ne prouve pas l’identité octet par octet. Aucun ancien moteur V12/Jeu43/Jeu51 ne peut être présenté comme le replay de ce Pine.

## Étape A — correction et fidélité

Avant tout nouveau calcul de performance : geler les modules et ce protocole ; exécuter les tests des mécanismes proposés, vérifier intégrité des données, causalité des contextes fermés et des indicateurs, horloges et sizing. Sortie : rapport agrégé `fidelity-stage-a.json`. Les cas de test sont des spécifications JavaScript isolées, pas une compilation du Pine.

Le corpus corrigé est `mnq-history/2026-09-13-v1`, identifié par le manifeste et les SHA-256. M5 : 142 311 bougies ; M15 : 47 437 ; H1 : 21 825 ; M1 : 263 190 dont 108 420 avec volume. Aucun remplissage artificiel. Le M1 absent le 18 juin et les fenêtres qui en dépendent sont exclus des diagnostics minute. Le calendrier indique une couverture observée, sans certification d’un calendrier boursier complet.

Les comparaisons de cette étape sont fixées avant calcul :

1. M5 strict au lieu de 2–5 minutes.
2. Événements ancien plan avant nouvelle admission ; enveloppe de plusieurs événements.
3. Quantité restante nulle comme état terminal.
4. Fraîcheur indexée par identifiant de zone.
5. Overnight incluant la M5 clôturée à 09:30 NY.
6. Faisabilité bornée par min(temps avant flat, 180 minutes), sans modification de la durée de référence.
7. Participation M1 : moyenne des 20 minutes précédentes comparée à la moyenne incluant la minute présente, au seuil inchangé 1,10. Mesurer les changements de diagnostic, sans verdict de performance.

## Étape B — scanner de référence et parité

Conserver le fichier source complet, son empreinte et les inputs exacts. Contrôler compilation dans TradingView puis exporter par bougie : timestamp signal/clôture, sens, membres de famille, famille primaire, niveaux, ATR, scores, H1/M15 sources et heures de disponibilité, admission/refus et identifiants parents.

Reproduire BASE, BOOST, EMA21, FAILED, FVG et VWAP. Reconstituer d’abord les paramètres du code fourni : entrée analytique au close, ATR précédent, stop lookback 8, buffer 0,10 ATR, max 4 ATR, frais 2,50 USD + 2 ticks, plafond 5 MNQ/500 USD, horizon 180 min et flat 16:45 NY. Évaluer séparément l’entrée au prochain open décrite dans les rapports antérieurs. L’ordre des ticks dans une M1 touchant TP et SL reste inconnu ; conserver un résultat ambigu ou des bornes, jamais un ordre favorable inventé.

Ne pas ajuster le moteur pour forcer 11 545 opportunités. Rapprocher les écarts de source, d’entrée, de déduplication, d’horizon et de population. Les effectifs familiaux se chevauchent ; la famille primaire n’est pas le nombre total de membres d’une famille.

## Étape C — essais de performance bornés

Toujours deux sorties distinctes : census de toutes les opportunités, sans plafond quotidien ni blocage par plan actif ; replay séquentiel aux positions et coûts explicitement simulés. Conserver témoins raw/corrected pour l’impact des trois bougies corrigées. Les changements d’admission consécutifs à une correction sont déclarés, même si le résultat baisse.

Après parité, mesurer les corrections A02/A03/A04 ensemble comme réparation du suivi ; tester les modifications d’admission séparément. Puis variantes indépendantes : FAILED fresh sweep, âge du pivot ≤8 M5, profondeur ≤0,5 ATR ; état FVG invalidé/consommé ; M1 informatif et M1 veto conformément au Jeu56 ; union Time-Pace selon sa définition corrigée, dédupliquée par parent causal. Les paramètres ne sont pas déplacés après résultat. Toute information inconnue dans la définition Time-Pace est résolue avant son exécution.

Rapporter effectifs, fréquence/jour observé, TP1/TP2/TP3 avant stop, ambiguïtés, MFE/MAE, temps, expectancy nette, coûts normaux/doublés, drawdown séquentiel, gagnants supprimés/perdants évités/nouvelles admissions. Tableaux mois, sens, famille et tier, avec effectifs et intervalles d’incertitude regroupés par journée. Aucun mélange entre cash des opportunités chevauchantes et PnL d’un compte.

2024–2025 et 2026 restent des découpages rétrospectifs, déjà utilisés pour choisir des règles. Aucun résultat n’est appelé validation indépendante. Chaque variante garde une identité, un témoin et un statut ; ni promotion automatique ni nouvelle exécution broker.

Pour une campagne longue : annoncer le lancement réel et la durée estimée, puis arrêter la surveillance jusqu’à la demande de Diego. Ne pas annoncer un job lancé s’il n’existe pas.
