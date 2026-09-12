# NYKUTO — Test complet des axes d'amélioration

Date: 2026-09-12  
Instrument: MNQ  
Statut: recherche historique. Aucun résultat ci-dessous n'est une garantie future ni une validation indépendante.

## Résumé

Le scanner actuel augmenté produit **4 119 opportunités** avec TP1 **45,55%**, TP2 **20,95%**, TP3 **10,95%**.

Le meilleur nouvel axe testé est le **failed breakout / faux breakout avec retour dans la structure**. En l'ajoutant au scanner:
- opportunités: **4 673**
- TP1: **46,20%**
- TP2: **22,36%**
- TP3: **12,45%**
- les **554 nouvelles opportunités uniques** ont TP1 **51,08%**, TP2 **32,85%**, TP3 **23,65%**
- l'amélioration TP1 du système complet vs scanner 4 119 est +0,66 point; bootstrap par journée 95% ≈ **+0,16 à +1,19 point**

Ajouter ensuite le **VWAP reclaim/reject** puis le **FVG retest** donne le meilleur compromis robuste de cette campagne:
- **4 903 opportunités**
- environ **21,5 opportunités par journée active**
- BUY: **2 604**
- SELL: **2 299**
- TP1: **46,48%**
- TP2: **22,70%**
- TP3: **12,52%**

Le S/R rejection pousse encore à 5 376 opportunités et TP2/TP3 montent, mais sa stabilité développement/validation est insuffisante pour le promouvoir comme famille principale.

## Régimes de marché

Le meilleur nouveau découpage contextuel est très simple:

### NORMAL
Ni volatilité haute, ni tranche NY PM tardive:
- n=2 829
- TP1 **48,82%**
- TP2 **24,50%**
- TP3 **13,15%**

### CAUTION
Volatilité haute **ou** NY PM:
- n=1 290
- TP1 **38,37%**
- TP2 **13,18%**
- TP3 **6,12%**

Cette séparation est stable entre développement et validation. Recommandation: **ne pas masquer les BUY/SELL**, mais afficher `CAUTION` et réduire leur priorité.

## Nombre de signaux dans la journée

Il n'y a pas de justification pour un plafond arbitraire de 3 ou 5 trades.

Les signaux 9–12 sont même parmi les meilleurs de l'échantillon. En revanche, les signaux **17+** d'une même session baissent à:
- TP1 **38,92%**
- TP2 **17,17%**

Recommandation: aucun hard cap; après le 16e setup distinct, afficher `FLOW_LATE ⚠`.

## Distance entre signaux

Un nouveau signal moins de 10 minutes après le précédent n'est pas automatiquement mauvais:
- TP1 all: **46,48%**
- validation: **50,50%**

Donc un simple cooldown temporel long supprimerait de bonnes opportunités. La déduplication doit viser le **même setup parent**, pas seulement le temps écoulé.

Le premier prototype de déduplication structurelle plus permissive conserve 5 140 opportunités mais TP1 tombe à 44,77%. Il n'est donc pas encore assez précis pour remplacer la logique actuelle.

## Daily / Weekly

Faire de D1/W1 des hard gates n'aide pas:
- D1+W1 alignés: TP1 **43,61%**
- le contexte opposé D1+W1 n'est pas moins performant sur TP1.

Conclusion: Daily/Weekly peuvent expliquer le macro-régime, mais **pas bloquer les entrées M5** sur les données actuelles.

## Nouvelles familles

### À garder / promouvoir en recherche
- Failed breakout reversal: **fort et stable**
- FVG retest: **secondaire utile**
- VWAP reclaim/reject: **bon bonus, peu de nouveaux cas**
- BOS retest: **shadow, TP1 intéressant mais extension faible**
- ORB retest: **shadow, petit échantillon**
- Daily Open retest: **shadow, petit échantillon**

### À ne pas promouvoir
- Double wick break: instable
- Compression→expansion: validation faible
- MSS pullback strict: trop rare
- Sweep+MSS strict: trop rare
- S/R rejection: seulement shadow pour l'instant, car développement et validation divergent

## Multi-position

Le scanner doit continuer à **afficher toutes** les opportunités. Mais prendre automatiquement toutes les 4 903 opportunités du meilleur scanner n'est pas sûr.

Dans un replay TP1-only simplifié avec le sizing actuel:
- jusqu'à **8 positions simultanées**
- risque planifié agrégé maximum ≈ **3 277 $**
- drawdown diagnostique en prenant tout ≈ **27 226 $**

Même avec un plafond agrégé de 1 000 $, le drawdown diagnostique reste très élevé dans ce modèle simplifié.

Conclusion: **scanner illimité = oui; auto-exécution illimitée = non**. Le prochain Position Manager doit afficher le risque agrégé des positions réellement choisies par l'utilisateur.

## Architecture recommandée après cette campagne

1. Scanner toujours actif, indépendant de `planActive`.
2. Un seul Trade Map visuel: le dernier signal remplace les anciennes lignes TP/SL.
3. Les anciens BUY/SELL restent sous forme de petits marqueurs historiques.
4. Familles principales:
   - Nykuto actuel
   - H1 STRONG + M15 booster
   - EMA21 pullback
   - failed breakout
   - FVG retest
5. VWAP / BOS / ORB / Daily Open = tags ou shadow setups.
6. `CAUTION` si volatilité haute ou NY PM.
7. `FLOW_LATE` après le 16e setup distinct de la session, sans bloquer.
8. Sunday SAFE/PRIME, gap et MIDNIGHT_CAUTION restent actifs comme étudié précédemment.
9. NEXT 60M BUY/SELL Bias reste un contexte directionnel, pas un win-rate.
10. Daily/Weekly restent du contexte, pas des hard gates.
