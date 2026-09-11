# Pine V13.8 ↔ Nykuto Lab — cross-audit du 11 septembre 2026

Statut : **précheck rétrospectif uniquement**. Aucun ordre, Paper, Shadow ou filtre de production n'est activé par ce document.

## Objet

Comparer les nouvelles règles Pine V13.8 (BUY/SELL adaptatifs, REV, confluence 6 familles, Trade Map 1R/2R/3R) avec la mémoire de recherche Nykuto et effectuer un replay d'émulation sur les exports MNQ TradingView fournis par Diego.

Ce replay n'est **pas** une exécution byte-for-byte du moteur Pine TradingView : il reproduit les principales séries et états (RSI/ATR Wilder, EMA, pivots, BOS/MSS, REV, score de confluence, cooldown, SL structurel et observation 2R) dans un harness externe. Les différences possibles de VWAP/session, agrégation HTF, égalités de pivots et ordre intrabougie interdisent de présenter les chiffres comme une validation officielle du Pine.

## Données utilisées

- Export continu `CME_MINI_MNQ1!, 5.csv`, du 31 mai au 10 septembre 2026.
- Exports 1 minute chevauchants, dédupliqués ; les doublons contrôlés avaient les mêmes OHLCV.
- Analyse principale ci-dessous : M5, session cash New York 09:30–16:00.

## Précheck de la confluence V13.8 actuelle

Réglage Pine actuel : `confluenceMin=3`, `contextBars=12`, `confluenceCooldown=4`.

Sur 73 séances cash disponibles à partir de juin :

- 379 événements de confluence bruts, soit **5,19 par séance** en moyenne ;
- 335 événements ont produit une carte exploitable dans l'émulation ;
- observation conservatrice vers TP2 (2R) sur 24 bougies : 61 TP2, 157 stops, 117 expirations ;
- total indicatif : **-35R**.

Conclusion : le seuil 3/6 est trop permissif pour être traité comme un BUY/SELL principal. Le problème est aussi structurel : `REV` réutilise déjà momentum/divergence/structure/volume, alors que ces familles peuvent être recomptées séparément dans la confluence. `HTF` est en outre un état persistant et `contextBars=12` n'a pas la même durée réelle en 1m, 5m et 15m.

## Variante exploratoire la moins mauvaise dans ce précheck

M5 uniquement :

- `confluenceMin=4`
- `contextBars=5`
- `confluenceCooldown=8`
- logique de familles inchangée pour isoler l'effet des trois paramètres.

Résultat :

- 28 événements cash sur 73 séances, soit **0,38/séance** ;
- 20 cartes exploitables ;
- 7 TP2, 9 stops, 4 expirations ;
- total indicatif **+5R**.

Ventilation : juin -5R, juillet +8R, août 0R, septembre disponible +2R. Le résultat est donc **instable par mois** et a été découvert sur des données déjà utilisées : il ne doit pas être promu.

La coupe post-hoc 09:30–12:00 paraît meilleure dans ce même échantillon (+6R sur 9 cartes exploitables) mais elle n'est pas retenue comme règle, précisément parce qu'elle a été choisie après lecture.

## Comparaison avec la recherche Nykuto déjà publiée

1. Le Lab a déjà montré que l'empilement de confirmations générales ne garantit pas un meilleur signal : tendance H1 et englobante n'avaient pas amélioré le vieux système de confluence, et quatre confirmations simultanées avaient supprimé tout l'échantillon.
2. Sur la famille ORB+RSI, les alignements EMA H1→M5 obligatoires ont dégradé l'espérance et supprimé des gagnants. HTF doit donc rester contexte/diagnostic tant qu'un test incrémental ne démontre pas sa valeur comme veto.
3. Les meilleurs indices récents sur MNQ sont locaux à l'ORB : retest rapide, géométrie du range et impulsion récente. Le replay Jan→11 septembre du fast-retest+RSI reste modestement positif (+7R/26 trades) mais faible en fréquence ; le seuil compact `OR <= 3 ATR` n'est pas transférable tel quel entre implémentations ATR.
4. Le 3R MNQ a déjà dégradé un essai antérieur. TP3 dans Pine doit être une information de carte, pas la cible principale supposée du pipeline. Le comparateur de recherche reste 2R tant qu'une expérience de sortie séparée n'est pas gelée.

## Décision de pipeline

- **Ne pas injecter V13.8 3/6 comme stratégie d'admission.**
- Conserver le BUY/SELL adaptatif existant comme couche séparée ; ne pas le remplacer par Confluence.
- Conserver ORB+RSI / fast-retest comme famille de recherche indépendante.
- Geler pour le prochain test exact un diagnostic M5 `4/6, contexte 5, cooldown 8`, sans activation et sans retouche ultérieure sur juin–septembre.
- Avant tout test de promotion, refaire la parité exacte Pine : mêmes sessions, VWAP, HTF, ATR/RSI, pivots et priorité intrabougie.
- Tester ensuite une **seule** modification sémantique : retirer le double comptage de REV par rapport à RSI/DIV/structure. Ne pas modifier simultanément seuil, session et sorties.
- 1m et 15m : garder la confluence en information visuelle/alerte expérimentale, pas en entrée principale, jusqu'à campagne dédiée.

## Risque / taille

Le Lab conserve une logique de quantité dérivée du stop et du budget de perte. Le nombre de contrats n'est pas un score de conviction. La carte Pine peut afficher un P&L théorique, mais elle ne connaît pas les fills réels Tradovate/Lucid. Les paramètres de risque du Pine ne doivent donc pas devenir l'autorité du compte tant qu'il n'existe pas de synchronisation broker.

## Statut

- `executionAllowed`: false
- `paperPromotion`: false
- `independentConfirmation`: false
- résultat utile : **réduction du bruit à étudier, pas nouvel edge validé**.
