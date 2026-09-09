# Bougies japonaises et structure du marché

## Cours de référence pour un bot de trading — version 1.0

**Date de recherche : 9 septembre 2026. Langue : français. Usage : apprentissage, spécification et simulation.**

Ce dossier contient une synthèse originale, des exemples fictifs et des propositions de règles. Il ne constitue ni une stratégie rentable démontrée, ni un conseil d’achat ou de vente, ni un moteur d’exécution. Aucun backtest sur des cotations historiques et aucune modification du site n’ont été effectués pour ce dossier.

Les références [S01] à [S28] sont détaillées à la fin. Trois statuts doivent rester distincts dans le futur bot : **définition observable**, **hypothèse d’interprétation**, **résultat empirique obtenu selon un protocole**. Reconnaître une figure ne démontre pas qu’elle prédit le marché.

## 1. Ce que la recherche apporte réellement

Les textes pédagogiques de CME, Fidelity, StockCharts et Schwab servent à définir le vocabulaire. TradingView et TA-Lib apportent des contraintes d’implémentation. Deux études originales présentent des résultats empiriques différents. Des discussions publiques Reddit éclairent les difficultés pratiques. YouTube a permis de repérer des ressources, mais pas de vérifier intégralement leurs vidéos. Aucun contenu interne à un serveur Discord n’a été consulté.

**Décision d’architecture proposée :** les sources communautaires peuvent produire des hypothèses à tester, jamais des règles de risque exécutées automatiquement. Une affirmation commerciale, même répétée dans plusieurs vidéos, ne devient pas une preuve statistique.

Le bon enchaînement pour ce module est :

**Données fiables → mesures → figures → structure → contexte → scénario → contraintes de risque → évaluation.**

L’objectif n’est donc pas de donner cent noms supplémentaires au bot, mais de lui apprendre à reconnaître ce qu’il observe, à préciser ce qu’il ignore et à refuser les conclusions non justifiées.

## 2. Lire une bougie sans lui faire dire plus qu’elle ne contient

Une bougie standard résume l’ouverture **O**, le maximum **H**, le minimum **L** et la clôture **C** pendant un intervalle. Son corps relie O à C ; les mèches prolongent ce corps jusqu’à H et L. Une bougie est haussière lorsque C > O et baissière lorsque C < O. [S01]

Cela ne dit pas nécessairement que sa clôture dépasse celle de la bougie précédente. Exemple fictif : la clôture précédente vaut 105 ; la suivante ouvre à 100 et clôture à 103. Son corps est haussier, mais sa clôture reste inférieure à 105.

### 2.1 Mesures exactes proposées

À partir des définitions OHLC, on déduit :

```text
amplitude       = H − L
corps           = abs(C − O)
meche_haute     = H − max(O, C)
meche_basse     = min(O, C) − L
ratio_corps    = corps / amplitude
position_close = (C − L) / amplitude
```

Lorsque H = L, les deux ratios sont indéfinis : renvoyer `null`, et classer la bougie `ZERO_RANGE`. Un zéro arbitraire serait trompeur.

**Contrôle arithmétique :** `corps + meche_haute + meche_basse = amplitude`. Exemple : O = 100, H = 106, L = 98, C = 105. Amplitude 8, corps 5, mèche haute 1, mèche basse 2. Position de clôture : 7/8 = 0,875.

### 2.2 Ce qui n’est pas identifiable avec OHLC

Une même bougie peut résulter de chemins différents. O = 100, H = 110, L = 90, C = 105 est compatible avec une visite de 110 avant 90, ou l’inverse. Un bot ne peut donc pas reconstituer l’ordre des transactions à partir de ces seules quatre valeurs.

Par la même logique, OHLC ne révèle ni l’identité des intervenants, ni leurs intentions, ni la présence de stops précis. Une longue mèche permet de décrire un dépassement suivi d’une clôture éloignée de l’extrême ; « une banque a chassé les stops » demande d’autres éléments et reste une interprétation.

### 2.3 Mesurer « grand » et « petit »

Les descriptions traditionnelles emploient des notions relatives. Schwab expose d’ailleurs des paramètres distincts pour le corps moyen, la longueur des mèches et la tendance préalable. [S07]

Pour une première spécification, on peut comparer le corps à la médiane des vingt corps **précédents**, et l’amplitude à une mesure de volatilité calculée sur les bougies déjà connues. Il faut fixer la fenêtre et la méthode, garder l’historique des versions, puis vérifier leur utilité hors échantillon.

Exemples de seuils d’ingénierie, **non validés ici** : doji si corps/amplitude ≤ 0,10 ; quasi-marubozu si ≥ 0,90 ; longue mèche si elle mesure au moins deux corps, sous réserve que le corps ne soit pas quasi nul. Ces seuils ne sont pas des lois du marché.

## 3. Les principales bougies isolées

Les noms ci-dessous décrivent des morphologies et, parfois, une position dans une tendance. Le sens traditionnel est une hypothèse, pas une probabilité. [S02][S03][S07]

| Famille | Morphologie résumée | Lecture prudente |
|---|---|---|
| Doji | Ouverture et clôture proches | Faible déplacement net ; aucune direction future imposée |
| Doji longues jambes | Petit corps, deux grandes mèches | Large excursion des prix malgré faible déplacement net |
| Dragonfly doji | Corps près du haut, grande mèche basse | Retour depuis un minimum ; dépend du contexte |
| Gravestone doji | Corps près du bas, grande mèche haute | Retour depuis un maximum ; dépend du contexte |
| Toupie / spinning top | Petit corps, deux mèches visibles | Pause ou hésitation possible |
| Marubozu | Corps occupant presque toute l’amplitude | Mouvement directionnel sur l’intervalle observé |
| Marteau / hammer | Petit corps en haut, longue mèche basse | Nom de retournement potentiel après baisse |
| Pendu / hanging man | Forme proche du marteau après hausse | Alerte possible, pas une vente automatique |
| Marteau inversé | Petit corps en bas, longue mèche haute après baisse | Tentative de reprise, à confirmer selon la règle choisie |
| Étoile filante / shooting star | Forme proche après hausse | Rejet possible des prix supérieurs |

### Exemple : même forme, trois descriptions différentes

Imaginons O = 102, C = 103, H = 103,5 et L = 98. La mèche basse mesure 4 et le corps 1.

Après une baisse préalablement définie, le module peut produire `HAMMER_CANDIDATE`. Après une hausse, il peut produire `HANGING_MAN_CANDIDATE`. Sans historique suffisant, il doit conserver uniquement `LONG_LOWER_WICK`.

Cette séparation évite de transformer automatiquement une géométrie en retournement. Le détecteur de forme peut avoir raison alors que le scénario de marché reste indéterminé.

## 4. Les configurations de deux bougies

| Figure | Critère descriptif essentiel | Confusion à éviter |
|---|---|---|
| Englobante haussière | Corps haussier contenant le corps baissier précédent | Les mèches ne doivent pas obligatoirement être englobées |
| Englobante baissière | Corps baissier contenant le corps haussier précédent | Une grande bougie rouge quelconque ne suffit pas |
| Harami | Petit corps contenu dans le corps précédent | Ne signifie pas nécessairement que toute la bougie est contenue |
| Harami cross | Harami dont le deuxième corps est un doji | Ne prouve pas un retournement |
| Pénétrante / piercing | Reprise au-delà du milieu du premier corps baissier | Définir séparément les exigences de gap |
| Couverture en nuage noir | Repli au-dessous du milieu du premier corps haussier | Version classique et adaptation intraday différentes |
| Inside bar | Haut et bas contenus dans l’amplitude précédente | Contraction, pas direction obligatoire |
| Outside bar | Haut supérieur et bas inférieur aux précédents | Expansion de l’amplitude, pas forcément engulfing |
| Pinces / tweezers | Deux extrêmes proches, avec une tolérance fixée | Proximité ne signifie pas support ou résistance garanti |

Les pinces rapprochent deux extrêmes comparables ; leurs couleurs et leur contexte doivent aussi être précisés. [S28]

La nomenclature des englobantes et des haramis distingue le corps de l’amplitude complète. Certaines sources diffèrent même sur les couleurs admissibles d’un harami : le bot doit donc déclarer sa variante, plutôt que présenter une convention comme universelle. [S02][S04][S05]

### 4.1 Englobante haussière : spécification exacte

Notons `p` la bougie précédente, `t` la bougie actuelle. Variante proposée `BODY_ENGULF_BOUNDARY_V1` :

```text
C[p] < O[p]
C[t] > O[t]
O[t] <= C[p]
C[t] >= O[p]
O[t] < C[p] OU C[t] > O[p]
```

La dernière ligne impose au moins un dépassement strict. Deux corps identiques de couleurs opposées ne sont donc pas classés englobants dans cette version. Une autre convention pourrait les accepter, mais devrait porter un identifiant différent.

La variante `BODY_ENGULF_STRICT_V1` exige les deux dépassements stricts. Une variante excluant les quasi-dojis précédents exige en plus un seuil minimal de corps/amplitude. Le filtre de tendance préalable doit rester **séparé** : reconnaître la forme et prétendre reconnaître un retournement sont deux opérations distinctes.

### 4.2 Englobante baissière

La règle miroir est :

```text
C[p] > O[p]
C[t] < O[t]
O[t] >= C[p]
C[t] <= O[p]
O[t] > C[p] OU C[t] < O[p]
```

Toutes les comparaisons doivent utiliser des prix normalisés à la grille du contrat, ou des entiers en ticks, pour éviter les erreurs d’arrondi informatique.

### 4.3 Exemple chiffré : englobante sans outside bar

| Bougie fictive | Ouverture | Haut | Bas | Clôture |
|---|---:|---:|---:|---:|
| Précédente | 100 | 102 | 97 | 98 |
| Actuelle | 97,5 | 101,5 | 97 | 101 |

Le premier corps occupe [98 ; 100]. Le second occupe [97,5 ; 101] et le contient : englobante haussière. Pourtant, 101,5 reste inférieur au précédent haut de 102, et le minimum n’est pas plus bas : ce n’est pas une outside bar selon la règle stricte.

**Conclusion du bot :** forme détectée ; cassure du précédent haut non détectée ; tendance non déterminable à partir de deux bougies ; probabilité de gain inconnue.

### 4.4 Pourquoi la clôture compte

Avant la fin de l’intervalle, C est encore une valeur provisoire. La même bougie peut satisfaire une règle à un instant et ne plus la satisfaire à la clôture. Pour ce module, les patterns opérationnels utilisent uniquement `is_final = true`. Une prévisualisation est possible, avec un statut explicitement provisoire. [S09]

## 5. Figures de trois bougies et séquences plus longues

Une étoile du matin associe traditionnellement une baisse marquée, une petite bougie intermédiaire et une reprise pénétrant le premier corps. L’étoile du soir est son miroir. Les trois soldats blancs et les trois corbeaux noirs décrivent des séries directionnelles. Les méthodes ascendantes ou descendantes combinent impulsion, consolidation et reprise. [S02][S04][S05]

Pour l’implémentation, les formulations « petite », « longue », « à l’intérieur », « reprise » et « gap » doivent toutes devenir explicites. La base JSON conserve les variantes classiques séparément des variantes sans gap.

**Exemple original de règle trois-bougies sans gap à tester :**

```text
1. Première bougie baissière.
2. Deuxième corps <= 40 % du premier corps.
3. Troisième bougie haussière.
4. Troisième clôture > milieu du premier corps.
5. Tendance préalable et seuil de taille étudiés séparément.
```

Nommer ce détecteur `MORNING_STAR_NOGAP_EXPERIMENTAL`, pas « étoile du matin classique garantie ».

L’**abandoned baby** exige une séparation par gaps autour d’un doji, y compris au niveau des extrêmes dans sa version classique. Retirer cette contrainte change substantiellement le pattern. [S05]

Une série spectaculaire de trois grandes bougies peut aussi laisser une entrée très éloignée de l’invalidation. Il faut donc mesurer séparément la qualité géométrique de la figure et le risque de l’entrée envisagée.

## 6. HH, HL, LH, LL : la structure du marché

La tendance haussière classique associe des sommets et des creux ascendants ; la tendance baissière leurs équivalents descendants. Une structure latérale nécessite des limites suffisamment horizontales. [S06]

| Terme | Traduction | Comparaison pertinente |
|---|---|---|
| HH — Higher High | Sommet plus haut | Nouveau sommet contre précédent sommet comparable |
| HL — Higher Low | Creux plus haut | Nouveau creux contre précédent creux comparable |
| LH — Lower High | Sommet plus bas | Nouveau sommet contre précédent sommet comparable |
| LL — Lower Low | Creux plus bas | Nouveau creux contre précédent creux comparable |
| EQH / EQL | Sommets / creux équivalents | Écart inférieur ou égal à la tolérance choisie |

### 6.1 Exemples fictifs de séquences alternées

**Hausse :** creux 100 → sommet 110 → creux 105 → sommet 115. Le creux 105 est HL par rapport à 100 ; le sommet 115 est HH par rapport à 110.

**Baisse :** sommet 115 → creux 105 → sommet 110 → creux 100. Le sommet 110 est LH ; le creux 100 est LL.

**Expansion :** sommet 110 → creux 100 → sommet 115 → creux 95. On obtient HH et LL : l’amplitude s’élargit. Ce n’est pas une hausse ordonnée ni un simple rectangle.

**Contraction :** sommet 115 → creux 95 → sommet 110 → creux 100. On obtient LH et HL : les oscillations se resserrent. Une résolution reste inconnue.

### 6.2 La notion de sommet dépend de l’algorithme

Une règle simple : un sommet local en i dépasse les hauts des deux bougies précédentes et des deux suivantes. Un creux est défini symétriquement. Ce choix `left = right = 2` est illustratif ; ce n’est pas une valeur optimale démontrée.

**Le sommet i n’est connu qu’à la clôture de i+2.** Un indicateur peut dessiner son symbole sur i après confirmation, ce qui rend sa lecture historique trompeuse si l’on oublie ce délai. TradingView documente explicitement ce problème. [S09]

À conserver dans chaque événement :

```json
{
  "pivot_index": 100,
  "confirmed_at_index": 102,
  "left_bars": 2,
  "right_bars": 2,
  "status": "CONFIRMED"
}
```

En 15 minutes, si la bougie 100 clôture à 10 h, la confirmation ne peut arriver qu’à 10 h 30, sous réserve de deux bougies consécutives disponibles. Le bot ne peut pas reconstruire fictivement une entrée à 10 h à partir de cette confirmation.

### 6.3 Cas limites indispensables

Une tolérance `epsilon` doit être fixée pour les prix presque égaux. Exemple : avec epsilon = 0,25, deux sommets à 100 et 100,25 sont EQH dans une convention où seul un écart strictement supérieur à epsilon donne HH.

Des pivots successifs de même type demandent une politique : conserver les pivots bruts, ou construire des swings alternés avec une règle de consolidation versionnée. Ne pas changer silencieusement un ancien swing déjà utilisé dans une décision.

Une outside bar peut satisfaire simultanément une condition de pivot haut et de pivot bas. Sans détail intrabougie, l’ordre reste ambigu : produire `DUAL_PIVOT_AMBIGUOUS`, plutôt que fabriquer une séquence.

### 6.4 États proposés pour le bot

Utiliser `UPTREND`, `DOWNTREND`, `RANGE`, `CONTRACTION`, `EXPANSION`, `TRANSITION`, `UNKNOWN`. L’état inconnu est une information utile, pas un échec. Un marché qui ne satisfait ni HH+HL ni LH+LL n’est pas automatiquement un range.

## 7. BOS, CHOCH et changement de tendance

Des implémentations de praticiens utilisent BOS pour les ruptures de continuation et CHOCH pour les ruptures opposées à la structure récente. Les détecteurs et les alias diffèrent : l’exemple LuxAlgo consulté utilise une construction par fractales et se présente comme expérimental. [S13]

### Convention proposée, à versionner

**BOS haussier :** dans un état haussier déjà établi, clôture au-dessus d’un sommet structurel confirmé et disponible avant cette bougie, avec dépassement supérieur au buffer choisi.

**BOS baissier :** miroir sous un creux structurel connu, en état baissier.

**CHOCH baissier :** dans une structure haussière, première clôture sous le creux protégé choisi par la règle. Dans ce dossier, ce creux est un creux structurel confirmé, identifié avant la cassure, qui sert de référence d’invalidation à la dernière continuation haussière.

**CHOCH haussier :** règle miroir. Le statut produit est `TRANSITION`, et non « nouvelle tendance certaine ».

Exemple fictif : 100 → 110 → 105 → 115. Une clôture à 104 remet en cause le maintien du creux 105. Elle n’interdit pas un retour ultérieur à 116. Si un sommet plus bas puis un creux plus bas sont confirmés ensuite, la nouvelle structure baissière dispose d’éléments supplémentaires.

Un simple passage de mèche sous 105 avec clôture à 107 ne satisfait pas notre définition de cassure par clôture. Le bot conserve un événement distinct `WICK_BREACH`.

**MSS :** ne pas fusionner automatiquement toutes les occurrences de « Market Structure Shift » avec CHOCH. Enregistrer la définition propre à chaque source ; l’alias éventuellement retenu dans le logiciel doit être explicite.

## 8. Support, résistance et environnement

Les cours StockCharts replacent les figures près de supports et résistances, plutôt que de les traiter comme des commandes isolées. [S26][S27]

Pour notre spécification, une zone est un intervalle [borne basse ; borne haute], avec un instant de création et une méthode. Elle ne doit pas être dessinée après coup parce que le prix y a réagi.

### Questions que le module doit pouvoir renseigner

Quelle zone était déjà connue avant la figure ? Quelle est la distance jusqu’à elle, en ticks et en unités de volatilité ? Le prix est-il au bord d’un range ou en son milieu ? Un niveau opposé laisse-t-il de la place à l’objectif ? Les données couvrent-elles une session cohérente ?

**Exemple original :** un achat hypothétique à 110, un stop à 106 et une résistance connue à 112 offrent seulement 2 points de potentiel avant cette résistance pour 4 points de risque, soit 0,5R brut. La présence d’une belle englobante ne corrige pas ce calcul.

Les triangles, rectangles, drapeaux et fanions sont des structures plus larges que les figures de bougies. Les configurations de continuation décrites par CME ne garantissent pas leur sortie dans le sens attendu. [S08]

## 9. Plusieurs unités de temps sans contradiction artificielle

Une organisation pédagogique possible est : **journalier pour le contexte, 1 heure pour la structure, 15 minutes pour le scénario**. C’est un cadre de travail proposé, pas une hiérarchie optimale prouvée.

Une tendance quotidienne haussière peut contenir une correction horaire baissière. Une englobante 15 minutes peut ne signaler qu’un rebond dans cette correction. Le module doit donc conserver les états séparément, plutôt que produire un unique mot « haussier » pour toutes les échelles.

La synchronisation doit utiliser la dernière bougie supérieure **clôturée et disponible** au moment de la décision. À midi, la clôture du jour n’existe pas encore. Les requêtes multi-unités mal paramétrées peuvent mélanger valeurs confirmées et provisoires ; `lookahead_off` seul ne rend pas nécessairement une valeur supérieure courante définitive. [S10]

Proposition de sortie : `daily_context = UP`, `hourly_structure = DOWN`, `m15_pattern = BULL_ENGULF`, `alignment = CONFLICT`, `decision = WAIT`. L’alignement est une règle de scénario, pas une vérité universelle interdisant toute stratégie contre-tendance.

## 10. Volume, RSI et vocabulaire communautaire

### 10.1 Ajouter des informations sans créer de fausse certitude

Pour ce module, enregistrer le type de volume, sa source et ses données manquantes. Une valeur absente doit rester `null`. Un filtre de volume doit définir son comparateur : volume précédent, médiane glissante, ou médiane de la même tranche horaire sur plusieurs sessions. Ces variantes sont des expériences différentes.

Le RSI décrit un autre aspect des mouvements de prix. Les seuils usuels 70 et 30 n’impliquent pas une inversion immédiate : il peut rester en zone extrême. Une divergence doit être définie sur des pivots comparables et déjà connus. [S15]

Ne pas traiter trois mesures dérivées des mêmes prix comme trois preuves indépendantes. Si l’on ajoute RSI, volume ou volatilité, comparer chaque ajout à une version sans cet ajout, sur des périodes de test identiques.

### 10.2 Sweep et fausse cassure : garder le fait observable

Définition expérimentale d’un dépassement-réintégration au-dessus d’un niveau P connu : `H[t] > P + buffer`, puis `C[t] < P`. Le miroir s’applique sous un niveau. Cette description est calculable ; une intention de « chasse aux stops » ne l’est pas à partir de ces seules conditions.

### 10.3 FVG : une géométrie de trois bougies

Une convention de fair value gap haussier compare le haut de la première bougie au bas de la troisième : `H[t−2] < L[t]`. La zone va de H[t−2] à L[t]. Le miroir baissier utilise `L[t−2] > H[t]`. Certaines implémentations ajoutent des contraintes sur la bougie centrale. [S14]

Le non-recouvrement des bougies extérieure gauche et extérieure droite **ne démontre pas l’absence de transactions dans la zone** : la bougie centrale peut l’avoir traversée. Il ne démontre pas non plus un retour futur obligatoire. Le bot doit enregistrer une zone observée, pas une promesse de « comblement ».

### 10.4 Order blocks et récits institutionnels

Dans ce dossier, ces notions restent du vocabulaire à étudier, sans déclencheur opérationnel. Pour devenir une règle, il faudrait définir précisément la bougie ou zone sélectionnée, son instant de création, les cassures admissibles, sa durée de validité et la gestion des retests. Un rectangle dessiné sur un graphique ne révèle pas à lui seul les positions d’une institution.

## 11. Quatre scénarios expérimentaux complets

Les propositions suivantes sont des **hypothèses de recherche originales**, sans résultat de rentabilité associé.

### A. Reprise après repli dans une tendance haussière

Contexte : structure supérieure haussière connue. Zone : support préidentifié. Observation : repli puis forme de rejet ou englobante haussière clôturée. Choix obligatoire : soit attendre un HL confirmé, soit utiliser un creux candidat avec une règle causale distincte. Les deux stratégies ne doivent pas être mélangées.

Déclencheur de simulation : reprise au-dessus d’un niveau défini avant l’ordre. Invalidation : sous le creux de référence, avec buffer fixé. Sortie : objectif, stop, ou expiration temporelle prédéfinis. Refus : bougie non clôturée, données insuffisantes, niveau opposé trop proche ou coût excessif.

### B. Rejet après rebond dans une tendance baissière

Contexte : structure supérieure baissière. Zone : résistance connue. Observation : rebond puis englobante baissière ou rejet supérieur. Ne pas appeler automatiquement le sommet courant « LH confirmé ». L’événement d’entrée et le sommet confirmé peuvent avoir des horaires différents.

Le scénario est le miroir du précédent, mais ses résultats doivent être mesurés séparément : la symétrie d’un code n’est pas une preuve de symétrie des performances.

### C. Cassure puis retest

Une clôture dépasse une zone connue. Le scénario attend une revisite de cette zone dans un délai fixé, puis une condition de reprise. Si la revisite n’arrive jamais, le trade n’existe pas. Si la réintégration invalide la cassure avant le déclencheur, le scénario expire.

Enregistrer les cassures sans retest, les retests non déclenchés et les trades exécutés : n’étudier que les belles captures d’écran supprimerait les cas gênants.

### D. Réintégration d’une borne de range

Le range doit être identifié avant le signal. Un dépassement de sa borne, puis une clôture de retour à l’intérieur, créent un candidat. La cible hypothétique et l’invalidation sont fixées avant l’évaluation.

Ce scénario doit être désactivé quand les conditions propres au détecteur de range ne sont plus satisfaites. Transformer automatiquement chaque cassure en pari de retour à la moyenne serait une autre stratégie.

## 12. Calculer le risque avant de qualifier l’entrée

Pour un contrat linéaire, le risque de prix par contrat est déduit de sa distance au stop et de sa valeur par point. Exemple documentaire : CME indique un multiplicateur de 2 dollars par point pour le Micro E-mini Nasdaq-100, contre 5 pour le Micro E-mini S&P 500 et 0,50 pour le Micro E-mini Dow. [S24]

Formule de dimensionnement proposée :

```text
risque_unitaire = abs(entree − stop) × valeur_point
                 + frais_aller_retour
                 + provision_glissement
nombre = floor(budget_risque / risque_unitaire)
```

Les frais et la provision sont exprimés **par contrat**. Si le résultat est inférieur à 1, aucun contrat n’entre dans ce budget. La réserve de glissement n’est pas une borne garantie de perte réelle.

**Exemple fictif :** entrée 20 010, stop 20 000, valeur du point 2 dollars. Risque de prix 20 dollars par contrat. Avec 4 dollars de coûts/provision hypothétiques et un budget de 50 dollars, `floor(50 / 24) = 2` contrats. Ce calcul ne démontre pas que 50 dollars est un risque adapté à un compte précis.

Les limites du courtier, la marge, l’exposition simultanée et les règles éventuelles d’un programme de trading financé constituent des contrôles supplémentaires. Un stop n’est pas une assurance d’exécution exacte ; les limites peuvent ne pas être exécutées même lorsqu’un niveau semble avoir été touché. [S11]

## 13. Ce que les études permettent — et ne permettent pas — de conclure

**Tharavanij et al., 2017 :** sur les composantes du SET50 entre juillet 2006 et juin 2016, la majorité des configurations étudiées n’offre pas de résultats convaincants. Les filtres RSI, stochastique et MFI n’apportent pas d’amélioration générale. Limite importante reconnue par les auteurs : le rôle de la tendance et des supports/résistances n’est pas testé. [S16]

**Lin et al., 2021 :** les auteurs rapportent des résultats favorables pour une méthode combinant formes, position des prix et apprentissage automatique sur des actions chinoises, avec séparation temporelle apprentissage/prédiction et un scénario de coûts. Ce résultat ne constitue ni une réplication indépendante ni une validation pour des micro-futures intraday. [S17]

**Conclusion pour ce projet :** ces travaux ne permettent pas d’attribuer un taux de réussite universel à une englobante, un marteau ou un HH. Ils justifient de tester des définitions précises dans leur environnement, plutôt que d’accepter ou rejeter en bloc toute lecture des bougies.

L’espérance nette d’un système se calcule à partir de ses propres résultats :

```text
E = p × gain_moyen − (1 − p) × perte_moyenne − cout_moyen
```

Exemple arithmétique, non issu d’un backtest : 40 % de gains à +2R et 60 % de pertes à −1R donnent +0,2R avant coûts. À l’inverse, 80 % de gains à +0,2R et 20 % de pertes à −1R donnent −0,04R avant coûts. Un bon win rate ne suffit donc pas.

## 14. Protocole de validation proposé

### 14.1 Tester le détecteur avant la stratégie

Créer des fixtures synthétiques pour chaque condition limite : ouverture égale à la clôture précédente, corps précédent nul, données non finies, amplitude nulle, bougie non définitive, sommets égaux, double pivot et retard de confirmation. Vérifier les événements et leurs dates, pas seulement les étiquettes dessinées.

### 14.2 Comparer des variantes limitées

Définir une version de base puis des variantes par ajout : forme seule ; forme et structure ; ajout d’une zone ; ajout d’un filtre de volatilité ou volume. Conserver les mêmes règles d’exécution et les mêmes périodes pour isoler ce que chaque ajout change.

### 14.3 Respecter le temps

Entraînement, sélection des réglages et test final doivent être séparés chronologiquement. Le test final ne doit pas redevenir un terrain d’ajustement après chaque mauvaise performance. Si les fenêtres de caractéristiques ou les horizons de résultats se chevauchent, prévoir une séparation adaptée pour empêcher les fuites entre ensembles.

Bailey souligne que le nombre total d’essais et la réutilisation répétée d’un jeu réservé sont essentiels pour juger le surajustement. Un résultat isolé parmi de nombreux essais ne suffit pas. [S18]

### 14.4 Simuler une exécution défendable

Utiliser des prix de marché standard pour les exécutions. TradingView avertit que les prix synthétiques, notamment Heikin Ashi, peuvent produire des résultats irréalistes par défaut. Les commissions et le glissement doivent être modélisés. [S11]

Notre politique proposée : après un signal connu à la clôture, ne pas supposer une exécution rétroactive à ce même prix sans mécanisme réaliste. Si stop et cible se trouvent tous deux dans l’amplitude d’une bougie et que leur ordre est inconnu, utiliser des données plus fines, une hypothèse conservatrice déclarée, ou classer le trade ambigu. Ne jamais choisir systématiquement l’ordre favorable.

### 14.5 Mesures et critères de décision

Rapporter le nombre de configurations testées, les observations, les trades et les jours effectivement couverts ; l’espérance nette ; le profit factor ; le drawdown ; les pertes extrêmes ; les excursions favorables et défavorables ; les résultats par marché, unité, session et régime. Définir précisément le succès : cible atteinte avant stop, rendement à horizon donné ou autre événement.

Documenter l’incertitude et la dépendance entre trades, par exemple avec une méthode de rééchantillonnage par blocs adaptée aux sessions. Dix trades verts n’établissent pas la fiabilité. Aucun nombre magique de trades ne garantit à lui seul une preuve.

**Critère proposé de promotion :** règles gelées, intégrité temporelle testée, résultat net hors échantillon documenté, sensibilité aux coûts supportable, puis observation prospective en simulation. Tant que ces éléments manquent, conserver `RESEARCH_ONLY`.

## 15. Architecture de connaissance et format de réponse

### Quatre composants séparés

**Base documentaire :** définitions, exemples, sources, mises en garde. Elle aide le modèle à expliquer, mais ne constitue pas des observations de marché.

**Moteur de mesures :** OHLC, géométrie, pivots, instants de disponibilité. Calculs déterministes, testables, indépendants du texte généré.

**Moteur de scénarios et de risque :** conditions, invalidation, expiration, coût, exposition et motifs de refus. L’IA ne doit pas pouvoir modifier ses limites par une phrase persuasive.

**Interface explicative :** restituer les faits calculés, les scénarios admissibles et les informations manquantes. Une capture d’écran peut aider à expliquer, mais ne doit pas remplacer silencieusement des prix numériques fiables.

### Exemple original de sortie

```json
{
  "schema_version": "1.0.0",
  "mode": "RESEARCH_ONLY",
  "bar_status": "CLOSED",
  "pattern": "BULLISH_BODY_ENGULF_BOUNDARY_V1",
  "structure": "UNKNOWN",
  "pivot_status": "UNCONFIRMED",
  "context_alignment": "NOT_EVALUATED",
  "decision": "WAIT",
  "reasons": ["Forme présente", "Structure et risque non établis"],
  "probability_of_success": null,
  "execution_authorized": false
}
```

**Une note de qualité de 8/10 n’est pas une probabilité de réussite de 80 %.** Une probabilité exige un événement cible, un horizon, un échantillon et une calibration documentée. Sans cela, renvoyer `null`.

Les fonctions TA-Lib peuvent servir de référence d’implémentation pour comparer des détecteurs, mais leurs paramètres et conventions doivent être vérifiés avant toute équivalence avec les règles de ce dossier. [S12]

## 16. YouTube, Reddit et Discord : usage honnête des sources

La ressource StockCharts TV « From Hammer to Harami » et la playlist d’analyse technique CME ont été repérées. L’accès disponible ne permet pas de revendiquer le visionnage complet ni la vérification de tous leurs propos. Elles sont donc des pistes pédagogiques, pas des preuves utilisées pour fixer un taux de réussite. [S22][S23]

Les discussions publiques r/algotrading consultées illustrent trois problèmes : rendre le price action programmable ; comparer des détecteurs dans un outil de backtest ; éviter les simulations trompeuses sur prix Heikin Ashi. Les participants ne constituent pas un échantillon représentatif et leurs performances éventuelles ne sont pas auditées. [S19][S20][S21]

Aucun échange interne de Discord n’a été analysé. Les invitations et pages promotionnelles visibles ne permettent pas d’évaluer le contenu d’un serveur. Ce manque d’accès ne doit pas être remplacé par une synthèse inventée.

**Filtre éditorial proposé :** écarter toute source promettant une figure infaillible, des gains quotidiens garantis ou une détection certaine des opérations institutionnelles à partir d’une seule bougie. Conserver une idée testable et sa provenance, sans importer les affirmations commerciales.

## 17. Exercices et corrigés

### Cas 1 — Corps et mèches

La bougie A est O100/H102/L97/C98. B est O97,5/H101,5/L97/C101. Est-ce une englobante haussière ? Une outside bar ?

**Corrigé :** englobante oui ; outside stricte non. Aucun diagnostic de tendance possible avec ces seules deux bougies.

### Cas 2 — HH prématuré

Un sommet local exige deux bougies à droite. La bougie candidate vient de clôturer. Le bot annonce « HH confirmé » et ouvre une simulation immédiatement.

**Corrigé :** la confirmation du pivot manque. Il peut signaler un sommet candidat, mais pas utiliser une confirmation future pour justifier l’action actuelle.

### Cas 3 — Structure contradictoire

Les deux derniers sommets passent de 110 à 115 ; les deux derniers creux de 100 à 95. Quelle structure ?

**Corrigé :** HH et LL, donc expansion dans notre classification. Ce n’est pas HH+HL.

### Cas 4 — Cassure ou mèche ?

Le support connu vaut 100. La bougie descend à 99 puis clôture à 101. Le moteur exige une clôture sous 100 pour casser.

**Corrigé :** dépassement intrabougie, mais aucune cassure par clôture selon cette règle. Aucune intention institutionnelle démontrée.

### Cas 5 — Rentabilité et fréquence de succès

Système A : 40 % de gains de 2R, pertes de 1R. Système B : 80 % de gains de 0,2R, pertes de 1R. Sans coûts, lequel a l’espérance positive ?

**Corrigé :** A : +0,2R ; B : −0,04R. La fréquence des trades gagnants ne suffit pas pour choisir.

### Cas 6 — Information supérieure future

À 11 h, un test utilise la clôture quotidienne publiée à la fin de la séance pour qualifier le contexte.

**Corrigé :** fuite de données futures. Utiliser la dernière clôture quotidienne disponible, ou une caractéristique intrajournalière distincte calculée uniquement avec les données disponibles à 11 h.

### Cas 7 — Deux sorties dans une bougie

Entrée 100, stop 98, objectif 104. La bougie suivante atteint 97 et 105. OHLC ne donne pas l’ordre.

**Corrigé :** résultat ambigu sans données plus fines. Le profit ne peut pas être présumé.

### Cas 8 — FVG

H de la première bougie vaut 100 ; L de la troisième vaut 102. Peut-on conclure qu’aucune transaction n’a eu lieu entre 100 et 102 ?

**Corrigé :** non. La non-superposition des deux bougies extérieures ne décrit pas toutes les transactions de la bougie centrale.

## 18. Ordre d’intégration proposé

Commencer par les contrôles OHLC, puis la géométrie et les englobantes, ensuite les pivots causaux et HH/HL/LH/LL, puis les zones et les scénarios. Ajouter seulement après les variantes multi-bougies et les filtres complémentaires.

Conserver les modèles de figures rares dans la documentation sans les activer dans un moteur de décisions tant que leurs règles sont incomplètes. La base peut être riche ; le moteur opérationnel doit rester limité à ce qui est explicite, testé et observable.

Les fichiers JSON associés sont des **spécifications et jeux de cas**, pas du code exécutant des ordres. Le guide d’intégration décrit les étapes nécessaires pour les utiliser dans une recherche documentaire augmentée et un moteur de calcul séparé.

## Registre des sources

Les documents ci-dessous ont été repérés ou consultés dans les conditions indiquées. Les descriptions ne constituent pas une recommandation commerciale. Aucune illustration externe n’est redistribuée dans ce dossier.

### S01 — CME Group — Chart Types: Candlestick, Line and Bar

Source : <https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Anatomie OHLC; ne prouve aucune rentabilité.

### S02 — StockCharts ChartSchool — Candlestick Pattern Dictionary

Source : <https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlestick-pattern-dictionary>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Nomenclature; certains critères diffèrent entre sources.

### S03 — StockCharts ChartSchool — Introduction to Candlesticks

Source : <https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/introduction-to-candlesticks>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Formes et interprétations traditionnelles, non probabilités calibrées.

### S04 — StockCharts ChartSchool — Candlestick Bullish Reversal Patterns

Source : <https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlestick-bullish-reversal-patterns>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Englobante haussière et contexte; exemples illustratifs sélectionnés.

### S05 — StockCharts ChartSchool — Candlestick Bearish Reversal Patterns

Source : <https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlestick-bearish-reversal-patterns>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Englobante baissière et variantes; pas de taux universel de réussite.

### S06 — Fidelity — Basic Concepts of Trend

Source : <https://www.fidelity.com/learning-center/trading-investing/technical-analysis/basic-concepts-trend>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Comparaison des sommets et creux; plusieurs échelles de tendance.

### S07 — Schwab thinkorswim — Hammer

Source : <https://toslc.thinkorswim.com/center/reference/Patterns/candlestick-patterns-library/bullish-only/Hammer>

Type : documentation_implementation. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Critères paramétrables de corps, mèche et tendance.

### S08 — CME Group — Trend and Continuation Patterns

Source : <https://www.cmegroup.com/education/courses/technical-analysis/trend-and-continuation-patterns>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Triangles, rectangles, drapeaux; continuation non garantie.

### S09 — TradingView Pine Script — Repainting

Source : <https://www.tradingview.com/pine-script-docs/concepts/repainting/>

Type : documentation_implementation. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Pivots affichés dans le passé et valeurs non confirmées.

### S10 — TradingView Pine Script — Other Timeframes and Data

Source : <https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/>

Type : documentation_implementation. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Dernière valeur supérieure confirmée; différence historique/temps réel.

### S11 — TradingView Pine Script — Strategies

Source : <https://www.tradingview.com/pine-script-docs/concepts/strategies/>

Type : documentation_implementation. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Simulation, prix synthétiques, commissions, glissement et limites non exécutées.

### S12 — TA-Lib Python — Pattern Recognition Functions

Source : <https://ta-lib.github.io/ta-lib-python/func_groups/pattern_recognition.html>

Type : documentation_implementation. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Catalogue de détecteurs; un code de signal ne représente pas une probabilité.

### S13 — LuxAlgo — Market Structure CHoCH/BOS (Fractal), publication TradingView

Source : <https://fr.tradingview.com/script/ZpHqSrBK-Market-Structure-CHoCH-BOS-Fractal-LuxAlgo/?amp=>

Type : implementation_praticien. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Implémentation expérimentale spécifique; ne valide pas la théorie institutionnelle.

### S14 — TrendSpider — Fair Value Gap Basics

Source : <https://trendspider.com/blog/fair-value-gap-basics/>

Type : documentation_praticien. Accès : texte_public_indexe. Consultation/repérage : 2026-09-09. Limite : Définition de zone sur trois bougies; hypothèses économiques non démontrées par OHLC.

### S15 — Fidelity — Relative Strength Index

Source : <https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : RSI et persistance possible dans les zones extrêmes.

### S16 — Tharavanij, Siraprapasiri & Rajchamaha (2017) — Profitability of Candlestick Charting Patterns in the Stock Exchange of Thailand

Source : <https://journals.sagepub.com/doi/full/10.1177/2158244017736799>

Type : etude_originale. Accès : texte_integral_consultable_passages_et_conclusion_lus. Consultation/repérage : 2026-09-09. Limite : Résultats principalement négatifs sur SET50, 2006–2016; tendance/support/résistance non étudiés.

### S17 — Lin et al. (2021) — Improving stock trading decisions based on pattern recognition using machine learning technology

Source : <https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0255558>

Type : etude_originale. Accès : texte_integral_consultable_resume_methode_conclusion_lus. Consultation/repérage : 2026-09-09. Limite : Résultats favorables rapportés sur actions chinoises, protocole particulier; non répliqués ici.

### S18 — David H. Bailey — FAQs on Backtest Overfitting

Source : <https://mathinvestor.org/2014/04/faqs-on-backtest-overfitting/>

Type : auteur_recherche_methodologique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Nombre d’essais et réutilisation du jeu de test; FAQ liée aux recherches des auteurs.

### S19 — Reddit r/algotrading — Need help backtesting price action strategies

Source : <https://www.reddit.com/r/algotrading/comments/1m5glei/need_help_backtesting_price_action_strategies/>

Type : discussion_communautaire. Accès : messages_publics_consultes. Consultation/repérage : 2026-09-09. Limite : Questions pratiques sur les définitions programmables; témoignages non audités.

### S20 — Reddit r/algotrading — Dashboard for playing with candlestick patterns using Dash, TA-Lib and vectorbt

Source : <https://www.reddit.com/r/algotrading/comments/j03mn0/i_made_a_dashboard_for_playing_with_candlestick/>

Type : discussion_communautaire. Accès : messages_publics_consultes. Consultation/repérage : 2026-09-09. Limite : Projet d’exploration de figures et comparaisons; aucune garantie de rentabilité.

### S21 — Reddit r/algotrading — Backtesting strategies on Heikin Ashi candlesticks

Source : <https://www.reddit.com/r/algotrading/comments/1813qrh/am_i_ever_supposed_to_testbase_my_strategy_on/>

Type : discussion_communautaire. Accès : messages_publics_consultes. Consultation/repérage : 2026-09-09. Limite : Alerte pratique sur prix synthétiques; justification technique dans S11.

### S22 — StockCharts TV / David Keller — From Hammer to Harami: Using StockCharts to Crack the Candlestick Code

Source : <https://www.youtube.com/watch?v=ykD18QMBmxc>

Type : video_pedagogique. Accès : titre_description_indexes_uniquement. Consultation/repérage : 2026-09-09. Limite : Vidéo repérée; pas de visionnage intégral ni de transcription complète vérifiée.

### S23 — CME Group — Technical Analysis, playlist YouTube

Source : <https://www.youtube.com/playlist?list=PLkJQh4MWlJksvfjIFozNAT3LJ1M_DBBD9>

Type : playlist_pedagogique. Accès : titres_indexes_uniquement. Consultation/repérage : 2026-09-09. Limite : Repérage de cours; contenu textuel CME utilisé séparément.

### S24 — CME Group — Micro E-mini Equity Index Futures Products Overview

Source : <https://www.cmegroup.com/education/courses/micro-e-mini-futures/micro-e-mini-futures-products-overview>

Type : specification_emetteur_marche. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Multiplicateurs des microcontrats; vérifier la fiche exacte avant usage opérationnel.

### S25 — CME Group — Micro Gold Futures Contract Specifications

Source : <https://www.cmegroup.com/markets/metals/precious/e-micro-gold.contractSpecs.html>

Type : specification_emetteur_marche. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Contrat MGC et valeur du tick; pas de frais de courtage inclus.

### S26 — StockCharts ChartSchool — Candlesticks and Support

Source : <https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlesticks-and-support>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Contexte de support; les exemples ne constituent pas un backtest.

### S27 — StockCharts ChartSchool — Candlesticks and Resistance

Source : <https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlesticks-and-resistance>

Type : documentation_pedagogique. Accès : texte_public_consulte. Consultation/repérage : 2026-09-09. Limite : Contexte de résistance; pas de probabilité de retournement universelle.


### S28 — IG Academy — Candlestick Patterns

Source : <https://www.ig.com/sg/ig-academy/the-basics-of-technical-analysis/candlestick-patterns>

Type : documentation pédagogique de courtier. Accès : texte public indexé, 9 septembre 2026. Utilisé pour la nomenclature des pinces et les variantes de gaps, pas pour les promesses de fiabilité.

[S01]: https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar
[S02]: https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlestick-pattern-dictionary
[S03]: https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/introduction-to-candlesticks
[S04]: https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlestick-bullish-reversal-patterns
[S05]: https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlestick-bearish-reversal-patterns
[S06]: https://www.fidelity.com/learning-center/trading-investing/technical-analysis/basic-concepts-trend
[S07]: https://toslc.thinkorswim.com/center/reference/Patterns/candlestick-patterns-library/bullish-only/Hammer
[S08]: https://www.cmegroup.com/education/courses/technical-analysis/trend-and-continuation-patterns
[S09]: https://www.tradingview.com/pine-script-docs/concepts/repainting/
[S10]: https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/
[S11]: https://www.tradingview.com/pine-script-docs/concepts/strategies/
[S12]: https://ta-lib.github.io/ta-lib-python/func_groups/pattern_recognition.html
[S13]: https://fr.tradingview.com/script/ZpHqSrBK-Market-Structure-CHoCH-BOS-Fractal-LuxAlgo/?amp=
[S14]: https://trendspider.com/blog/fair-value-gap-basics/
[S15]: https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI
[S16]: https://journals.sagepub.com/doi/full/10.1177/2158244017736799
[S17]: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0255558
[S18]: https://mathinvestor.org/2014/04/faqs-on-backtest-overfitting/
[S19]: https://www.reddit.com/r/algotrading/comments/1m5glei/need_help_backtesting_price_action_strategies/
[S20]: https://www.reddit.com/r/algotrading/comments/j03mn0/i_made_a_dashboard_for_playing_with_candlestick/
[S21]: https://www.reddit.com/r/algotrading/comments/1813qrh/am_i_ever_supposed_to_testbase_my_strategy_on/
[S22]: https://www.youtube.com/watch?v=ykD18QMBmxc
[S23]: https://www.youtube.com/playlist?list=PLkJQh4MWlJksvfjIFozNAT3LJ1M_DBBD9
[S24]: https://www.cmegroup.com/education/courses/micro-e-mini-futures/micro-e-mini-futures-products-overview
[S25]: https://www.cmegroup.com/markets/metals/precious/e-micro-gold.contractSpecs.html
[S26]: https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlesticks-and-support
[S27]: https://chartschool.stockcharts.com/table-of-contents/chart-analysis/candlestick-charts/candlesticks-and-resistance

[S28]: https://www.ig.com/sg/ig-academy/the-basics-of-technical-analysis/candlestick-patterns
