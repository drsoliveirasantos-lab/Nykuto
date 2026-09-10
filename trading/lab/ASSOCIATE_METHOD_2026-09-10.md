# Méthode expliquée pendant l'appel — référence du bot

Transcription fournie par Diego le 10 septembre 2026. Cette synthèse conserve
les règles de trading utiles, leurs variantes et leurs incertitudes. Les
exemples graphiques ne sont pas visibles dans le texte : aucune entrée montrée
pendant l'appel n'est vérifiée à partir de la seule transcription.

**La méthode décrite n'est pas encore reproduite intégralement par le bot.**
Le Jeu 32 utilisait des EMA 9/21 en H1 et M5 ; l'appel précise surtout des
moyennes 20/50 en H1. Les Jeux 33–34 conservent les signaux historiques sans
ajouter ce nouveau biais H1. Leurs résultats ne valident ni ne réfutent la
méthode exacte des associés.

## Le socle commun et les variantes

| Élément | Ce que décrit l'appel | Traduction à retenir |
|---|---|---|
| Direction H1 | Moyennes 20 et 50 principalement | Déterminer un biais avant de chercher une entrée M5 ; type de moyenne et règle précise encore à confirmer |
| Moyenne 200 | Contexte plus large, poids variable selon l'intervenant | Information de contexte ; pas un veto universel affirmé par les deux intervenants |
| Moyenne 9 | Déclenchement rapide en M5 | Distinguer le prix qui traverse la moyenne et deux moyennes qui se croisent |
| Réaction sur niveau | Contact puis rejet du Daily Open ou d'un pivot, clôture du bon côté et confirmations | Famille prioritaire décrite ; ne pas la confondre avec une cassure poursuivie |
| Réintégration de range | Sortie puis retour rapide dans le range d'une session précédente | Famille séparée ; une simple mèche est explicitement écartée dans un exemple |
| Divergence RSI | Condition importante, voire obligatoire pour la réintégration chez l'un des intervenants | Divergence à partir de sommets/creux confirmés ; pas un simple seuil RSI 30/70 |
| Cassure de range | Troisième modèle évoqué, moins détaillé dans cet extrait | Garder ses règles séparées des réactions et réintégrations |
| MSS / fractales | Autres moyens de lire la structure | Ne pas rendre tous les moyens obligatoires : l'appel décrit aussi des alternatives |
| FVG | Confirmation près du niveau ; repérage M15/M30 chez un intervenant | Complément optionnel ; H1/M5 seuls conseillés au début dans l'appel |
| Nuage dit Ichimoku | Variante personnelle de l'autre intervenant | Nom du script et paramètres nécessaires avant reproduction |

L'appel ne décrit donc pas une règle unique demandant simultanément MA9,
MA20, MA50, MA200, MSS, RSI, FVG et nuage. Les usages des intervenants diffèrent.
Additionner tous ces filtres créerait une nouvelle stratégie.

## Écart avec la recherche existante

| Version vérifiée | Règle présente | Limite par rapport à l'appel |
|---|---|---|
| Jeu 32, branche de recherche | Clôture > EMA9 > EMA21 pour acheter, inverse pour vendre, sur M5 et H1 ; H1 cash ancrée à 09:30 New York | Ni périodes 20/50, ni reproduction certaine des bougies H1 du graphique des associés |
| Jeux 33–34, MES | Retour après cassure et exclusion des achats RSI >70 / ventes RSI <30 | Ce filtre n'est pas une divergence RSI |
| Jeux 33–34, MNQ et MYM | Retour après cassure avec le contexte causal historique | Pas de nouvelle condition H1 20/50 issue de cet appel |
| Jeux 33–34, MGC | Cassure échouée de la zone d'ouverture, entrée avant 11 h New York | Une zone d'ouverture américaine n'est pas le range London ou Asia |
| Jeu 34 | Compte 50K neuf chaque mois, risque commun, suivi par semaine et objectif de retrait | Infrastructure de mesure réutilisable ; aucun résultat attribué à la nouvelle méthode |

Références : [synthèse existante](RESEARCH_SYNTHESIS_2026-09-09.md),
[profils du Jeu 33](jeu33-policy.mjs), [bilan mensuel](JEU34_RESULTS.md).
Le protocole du Jeu 32 a été vérifié au commit
`9df4d691122ff6b2137da4bc93e30a4ddf1aac31` de la branche de recherche.

Un profil propre à chaque marché reste utile pour le tick, les frais, les
horaires, la taille entière et la distance du stop. Une différence de stratégie
entre marchés doit ensuite être justifiée par un test fixé à l'avance. Le
50K reste le format choisi pour la recherche ; une taille nominale plus grande
ne rend pas, à elle seule, la stratégie plus rentable.

## Les affirmations à ne pas transformer en certitudes

- Quatre confirmations ne multiplient pas automatiquement une probabilité par
  quatre. Plusieurs moyennes dérivent des mêmes prix : ce ne sont pas quatre
  preuves indépendantes. Seule une comparaison mesurée permet de chiffrer
  l'effet du filtre ajouté.
- Un croisement décrit un changement déjà observé. Il peut être suivi d'un
  faux départ ; un écart important prix/moyenne ne garantit pas la poursuite.
  Les moyennes sont des indicateurs réactifs, fondés sur le passé.
  [Documentation TradingView](https://www.tradingview.com/support/solutions/43000502589-moving-averages/).
- Surachat et survente ne sont pas des ordres automatiques. Une divergence
  fournit une hypothèse de ralentissement, sans imposer un retournement.
- Les images de carburant, de guerre entre sessions et d'ordres restant sur
  les niveaux sont des explications pédagogiques. Les seules bougies ne
  mesurent pas les ordres en attente ni l'intention des participants.
- Le retour dans un FVG et le rejet d'un pivot restent des événements à
  observer et tester, sans obligation pour le prix de remplir ou respecter
  ces zones.
- Le nuage Ichimoku standard utilise des calculs sur les plus hauts/plus bas
  et des décalages ; l'assimiler simplement à deux moyennes 20/50 risquerait
  de reproduire un autre indicateur. Un script personnalisé reste possible.
  [Documentation TradingView](https://www.tradingview.com/support/solutions/43000589152-ichimoku-cloud/).
- Pour des pivots traditionnels, P = (haut précédent + bas précédent +
  clôture précédente) / 3. Le type de pivot, la séance et l'usage éventuel du
  settlement changent les valeurs ; la formule approximative de l'audio ne
  suffit pas. [Documentation TradingView](https://www.tradingview.com/support/solutions/43000521824-pivot-points-standard/).

## Ce qui manque pour une reproduction fidèle

1. **Réglages des moyennes** : SMA ou EMA, source du prix, éventuel décalage,
   périodes affichées. Confirmer si le biais exige l'ordre 20/50, leur pente,
   la position de la clôture, ou un croisement récent.
2. **Graphique et temps** : contrat exact, séance complète ou cash, fuseau
   du graphique, découpage H1 et horaires des boîtes. Le « 18 h » de l'audio
   ne doit pas être interprété comme 18 h en France par défaut.
3. **Indicateurs personnels** : noms et réglages du nuage, des pivots,
   des sessions et de l'outil de réintégration.
4. **Entrée reproductible** : clôture ou franchissement intrabougie, délai
   maximal après contact, définition mesurable du rejet/englobante et de la
   divergence, point d'invalidation et cible. Les exemples 1R, 2R, 5R ne
   constituent pas une règle de sortie unique.

Une capture des paramètres TradingView et un exemple annoté H1/M5 d'une
réaction valide, avec un exemple refusé, permettent de résoudre une grande
partie de ces questions sans ajouter d'abonnement.

## Ordre de travail retenu

La priorité devient la **fidélité à la réaction sur niveau avec biais H1
20/50**, avant de rechercher une hausse de risque ou un gain de 500–900 par
trade. La réintégration avec divergence forme un essai ultérieur séparé.

Le prochain protocole devra fixer une seule définition de biais, de contact,
de clôture et de stop avant les calculs. Il comparera une référence à chaque
ajout isolé, à risque identique, avec le suivi mensuel du Jeu 34. Les réglages
encore inconnus seront explicitement des hypothèses si une approximation est
testée ; elle ne sera pas présentée comme la stratégie exacte des associés.

Les sources actuellement validées pour ces replays couvrent la séance
américaine cash. Elles ne permettent pas de reconstruire l'ouverture de 18 h,
les extrêmes Asia/London ou tous les pivots de séance complète. Aucun niveau
nocturne ne sera inventé à partir de ces données. Réutiliser les mois déjà vus
reste exploratoire ; une validation demande des observations nouvelles.

Cette intégration ajoute une référence de méthode, pas un nouveau backtest :
aucune configuration ni confirmation indépendante supplémentaire au registre.
Les résultats gelés du Jeu 34 restent inchangés. Le bot sert à expliquer et
tester des règles ; la transcription n'entraîne pas automatiquement un modèle
capable de reproduire le jugement discrétionnaire des associés.
