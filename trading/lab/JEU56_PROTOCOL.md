# Jeu 56 — Valeur incrémentale du micro-contexte 1 minute

Gel du protocole : 11 septembre 2026. Recherche uniquement. Aucune activation Paper, Shadow ou réelle.

## Question

Le 1 minute améliore-t-il réellement une décision déjà formée sur 5m/15m, ou ajoute-t-il surtout du bruit ? Le test ne cherche pas le « meilleur réglage 1m » ; il mesure la valeur **incrémentale** du 1m par rapport à une référence sans 1m.

Hiérarchie gelée :
- 15m = contexte principal ;
- 5m = setup / alerte principale ;
- 1m = micro-contexte de timing, confirmation ou danger ;
- aucune alerte 1m autonome n'est activée en production pendant la recherche.

## Quatre familles micro indépendantes

Le score 1m doit éviter de compter plusieurs fois la même information. Une famille vaut au maximum un point :
1. **Structure** : rupture/pivot causal dans le sens observé ;
2. **Momentum** : impulsion directionnelle mesurée indépendamment de la structure ;
3. **Participation** : volume relatif/activité disponible avant la décision ;
4. **Réaction au niveau** : tenue, rejet ou reprise d'un niveau issu du setup 5m.

REV, RSI, divergence et structure ne peuvent pas chacun ajouter un point si l'information sous-jacente est la même. Les variantes doivent journaliser les familles actives, pas seulement un score total.

## Variantes à comparer

A. Référence 5m/15m sans 1m.
B. 1m même sens = confirmation informative.
C. 1m opposé = avertissement, sans veto.
D. 1m opposé = veto sur l'entrée.
E. 1m fort = amélioration du timing seulement, sans changer la direction du setup.
F. 1m autonome = témoin de recherche pour mesurer directement le bruit ; aucune notification production.

## Recherche de paramètres bornée

Étape 1 : matrice 3 × 3 avec cooldown fixé à 10 minutes :
- fenêtre micro : 2, 3 ou 5 minutes ;
- score minimum : 2/4, 3/4 ou 4/4.

Étape 2 autorisée seulement si une zone voisine est robuste : conserver la fenêtre/score gelés puis comparer cooldown 5 / 10 / 20 minutes. Ne pas relancer une grille ouverte jusqu'à obtenir du vert.

## Mesures obligatoires

Pour chaque variante : nombre d'événements/jour, TP1 avant SL, TP2 avant SL, expectancy en R/trade, MFE, MAE, temps avant premier passage positif, drawdown réalisé, pire série de pertes, gagnants supprimés, perdants évités et delta d'espérance contre la même population 5m sans 1m.

Le verdict principal est le **gain marginal du 1m**, pas le win rate isolé.

## Règles de lecture

- Une configuration isolée excellente avec voisines mauvaises est suspecte d'overfit.
- Une amélioration doit survivre aux coûts et à plusieurs sous-périodes ; une seule journée ou un seul mois ne suffit pas.
- Le 1m peut être plus utile comme détecteur d'opposition/danger que comme générateur d'entrée : les deux usages sont mesurés séparément.
- Toute information postérieure à l'entrée (MFE/MAE futurs, résultat final) est interdite dans le filtre d'admission.
- Les données déjà consultées restent du développement rétrospectif ; aucune « confirmation indépendante » ne sera revendiquée avec elles.

## Sortie attendue

Le Jeu 56 doit conclure explicitement parmi :
1. 1m inutile → le retirer du flux opérationnel ;
2. 1m informatif → l'afficher sans notification ;
3. 1m utile comme veto/danger → l'utiliser uniquement pour freiner une entrée 5m ;
4. 1m utile au timing → l'utiliser comme confirmation du 5m ;
5. 1m autonome utile → résultat exceptionnel qui exige ensuite une validation indépendante avant toute alerte production.

Aucun résultat de ce jeu ne modifie automatiquement le Pine ou le moteur actif.
