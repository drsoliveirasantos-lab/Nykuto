# Nykuto Market Scanner — protocole de recherche

Date: 2026-09-12  
Statut: **recherche uniquement**. Aucun ordre broker/Paper/Shadow n'est activé.

## But

Séparer définitivement deux responsabilités:

1. **Market Scanner**: détecte et affiche chaque setup BUY/SELL distinct dès que les critères de marché sont satisfaits, même si un autre plan ou runner est déjà actif.
2. **Position Manager**: suit uniquement les positions que l'utilisateur décide réellement de prendre.

Un `planActive` ne doit donc jamais supprimer un signal du scanner. Il reste une information d'exécution seulement.

## Contrat gelé pour ce test

- aucun plafond de signaux/trades par jour;
- une opportunité indépendante peut apparaître pendant un plan actif;
- un signal opposé peut également apparaître;
- seul un nouvel affichage du **même setup parent** est dédupliqué;
- un signal techniquement valide mais incompatible avec le risque/session reste visible comme `ANALYTICAL_ONLY`/warning au lieu d'être silencieusement supprimé;
- H1 = direction principale par structure/BOS + DMI; `STRONG` si ADX >= 22;
- H4 = tag `PRIME`, jamais hard gate universel;
- M15 = score décisionnel 0–5;
- M5 = trigger opérationnel;
- M1 = timing/context facultatif, jamais gate obligatoire;
- booster M5 testé: B/S >= 10 ou qualité >= 3 uniquement si H1 STRONG + M15 5/5 sont alignés;
- Sunday 18:00–18:30 ET: signal visible mais `WAIT`;
- gap dimanche <= 0.50 ATR H1: régime gap-fill; 0.50–0.75: neutre; >= 0.75: continuation; >2 ATR: attendre 60 minutes avant statut opérationnel;
- 23:30–00:30 ET: `MIDNIGHT_CAUTION`, pas blocage;
- `NEXT 60M NYKUTO BIAS` signifie la probabilité estimée de direction du **prochain setup Nykuto qualifié**, pas un win-rate et pas une probabilité brute de hausse/baisse du prix.

## Résultats historiques déjà mesurés avant promotion

Replay causal long V14.9.1 reconstruit sur 62 279 bougies M5:

- baseline séquentiel: 1 554 plans; TP1 44.92%; TP2 19.43%; TP3 10.75%;
- 3 671 barres de signal principales;
- 3 218 opportunités ont une géométrie stop/risque/session indépendamment valide;
- le verrou mono-plan explique donc la majorité de l'écart entre opportunités visibles et plans admis;
- census indépendant: 3 218 opportunités, TP1 45.06%, TP2 20.54%, TP3 10.85%;
- H1 STRONG + M15 5/5 booster: 415 opportunités supplémentaires, TP1 50.36%, TP2 24.82%, TP3 11.81%;
- hybride lifecycle + booster: 1 709 plans, TP1 45.70%, TP2 20.13%;
- Sunday SAFE: 34 trades dimanche, TP1 67.6%, TP2 35.3% (petit échantillon, ne pas présenter comme probabilité future garantie);
- Sunday PRIME gap-aware: 22 trades, TP1 77.3%, TP2 40.9% (échantillon encore plus petit);
- NEXT 60M setup-bias walk-forward: AUC ~0.77, précision directionnelle ~71.4%; utile comme contexte, pas comme hard gate d'entrée.

Ces résultats proviennent d'historiques déjà étudiés. Ils ne constituent pas une confirmation indépendante.

## Test d'expansion du scanner toujours actif

Un test borné supplémentaire a été lancé pour répondre au besoin d'augmenter le nombre de boutons BUY/SELL visibles sans réintroduire `planActive` comme verrou.

Référence scanner indépendant avec cooldown 8:

- 3 218 opportunités valides;
- moyenne 12.87 opportunités par jour actif;
- médiane 13/jour;
- maximum 25/jour;
- TP1 45.06%; TP2 20.54%; TP3 10.85%.

Le meilleur compromis de fréquence du lot testé utilise:

- scanner indépendant de `planActive`;
- cooldown principal ramené de 8 à 5 barres, uniquement comme déduplication temporelle;
- booster M5 B/S >=10 ou qualité >=3 lorsque H1 STRONG + M15 >=4/5 sont alignés;
- famille secondaire de pullback/reprise EMA21 M5 dans le même contexte HTF/LTF.

Résultat:

- **4 119 opportunités indépendantes**;
- **16.35 opportunités/jour actif** en moyenne, médiane 17/jour;
- 2 175 BUY et 1 944 SELL;
- maximum observé 35 opportunités sur une journée;
- TP1 **45.55%**;
- TP2 **20.95%**;
- TP3 **10.95%**.

Par rapport au scanner indépendant de référence, cela ajoute 901 opportunités (+28.0%) tout en conservant des taux TP1/TP2/TP3 légèrement supérieurs à la référence. Par rapport à l'ancien moteur mono-plan de 1 554 plans, le scanner voit environ 2.65 fois plus d'opportunités analytiques distinctes.

Un test sans cooldown réel (chaque réémission de barre comptée) monte jusqu'à 4 529 opportunités valides, mais TP1 tombe à 44.58% et TP2 à 19.41%. Cette variante n'est **pas** retenue: elle mélange davantage de réémissions du même mouvement et dilue la qualité. La priorité reste donc de supprimer seulement les doublons du même setup, pas de supprimer les nouvelles opportunités parce qu'un autre trade est actif.

Ce résultat est une optimisation sur historique déjà étudié. Il sert à choisir la prochaine variante de scanner, pas à prétendre à une confirmation indépendante.

## Tests logiciels ajoutés

`node --test scripts/test-trading-market-scanner.mjs` vérifie notamment:

- 12 setups distincts le même jour restent tous affichés;
- 11/12 peuvent être détectés pendant qu'un plan est déjà actif;
- BUY puis SELL opposé restent tous deux visibles;
- les répétitions du même `setupId` sont supprimées, pas les nouvelles opportunités;
- un setup non compatible risque reste visible en analytique;
- le booster H1 STRONG + M15 5/5 fonctionne sans relâcher globalement les seuils;
- H4 et M1 restent des tags/contextes;
- Sunday WAIT/SAFE/PRIME, gap extrême et midnight caution n'effacent pas le signal du scanner;
- le `% BUY/SELL` NEXT 60M est explicitement distinct d'une probabilité de gain.

Le test ciblé local passe actuellement **12/12**.

## Ce qui n'est pas encore validé

Le scanner peut compter et afficher toutes les opportunités, mais le portefeuille multi-position réel n'est pas encore validé monétairement. Avant d'autoriser plusieurs trades simultanés en exécution, il faut rejouer exactement:

- 5 unités max par position;
- perte totale au SL <= 500 USD par position;
- sorties partielles et runners;
- frais/glissement;
- risque agrégé de plusieurs positions simultanées;
- pire PnL possible si plusieurs stops sont touchés.

Le scanner n'attend pas ce test pour **afficher** les opportunités. Seule l'exécution automatique en dépend.
