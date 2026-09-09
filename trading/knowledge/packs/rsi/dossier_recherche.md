# RSI, tendances et figures — Base de recherche pour Nykuto

**Version 1.0 — 9 septembre 2026. Recherche documentaire ; aucune stratégie validée ni modification du site.**

Cette base rassemble 30 références institutionnelles, documentations de plateformes et travaux originaux. Elle sépare les définitions mathématiques, les usages chartistes et les propositions de conception à évaluer. Une référence expliquant un signal n’est pas une preuve de rentabilité. La sélection est étendue mais non exhaustive.

## Conclusion de travail

Le RSI doit décrire le momentum dans un contexte de prix. Une règle « acheter sous 30, vendre au-dessus de 70 » ne suffit pas. Le moteur proposé doit pouvoir reconnaître une tendance, caractériser un repli, dater une divergence réellement disponible, demander une confirmation et refuser un trade lorsque les données ou le risque ne conviennent pas. Les hypothèses de ce dossier sont à tester, non à activer en réel.

## Lecture des images transmises

La première image présente des divergences, avec quelques cas d’extrêmes apparemment égaux malgré des légendes répétant un nouveau plus haut ou plus bas. Pour du code, il faut classer les valeurs numériques, avec tolérances explicites. Les flèches de retournement sont des illustrations, pas des résultats observés. La seconde montre une série historique en unité mensuelle, marquée « 1M » : elle ne valide pas une règle sur des bougies d’une minute.

## Architecture proposée

Données contrôlées → indicateurs déterministes → régime de marché → motif candidat → déclencheur confirmé → contrôle du risque → simulation et journal → explication en langage naturel.

L’intégration documentaire donne au bot des définitions et des raisons explicables. Elle n’entraîne pas automatiquement un modèle prédictif et ne remplace pas la collecte de données de marché. L’image peut être une aide de lecture ; les décisions automatisées devraient s’appuyer sur les valeurs horodatées d’ouverture, plus haut, plus bas, clôture et volume.

Les seuils, règles de pivots, sorties, frais et fenêtres de test doivent être figés avant évaluation. Un protocole sans sorties ni coût d’exécution ne constitue pas une stratégie testable complète. Les fiches d’hypothèses indiquent ce qui reste à préciser.

## Notation

HH : sommet plus haut ; HL : creux plus haut ; LH : sommet plus bas ; LL : creux plus bas. « Confirmé » signifie que toutes les données nécessaires sont déjà disponibles à l’heure indiquée. « Source » signifie référence de définition ou de méthode, pas certification de profit.

## Fiches de connaissance


## RSI


### K01 — Ce que le RSI mesure

Statut : definition.

Oscillateur borné de momentum construit à partir de variations de prix. Sa valeur n’est ni un pourcentage d’acheteurs, ni une probabilité de hausse.


**Proposition pour le bot :** Afficher séparément la valeur observée, son contexte et une éventuelle hypothèse de trading.


Références : S01.


### K02 — Formule

Statut : definition_mathematique.

Pour ΔC=C[t]−C[t−1], G=max(ΔC,0) et L=max(−ΔC,0). Avec U et D leurs moyennes lissées : RSI=100×U/(U+D), lorsque U+D>0.


**Proposition pour le bot :** Conserver prix source, période, lissage et état de validité. Un RSI de 75 correspond à U=3D, pas à 75 % de chances de gain.


Références : S01.


### K03 — Lissage de Wilder

Statut : definition_mathematique.

Initialiser U et D par les moyennes des n premières variations. Puis U[t]=((n−1)U[t−1]+G[t])/n, idem pour D. Il faut n+1 clôtures pour n variations.


**Proposition pour le bot :** Tester la parité avec un calcul de référence. Ne pas remplacer discrètement ce lissage par une moyenne mobile simple. L’initialisation doit être identique en historique et en direct.


Références : S03.


### K04 — Cas limites et données absentes

Statut : proposition_ingenierie.

Si D=0 et U>0, le résultat est 100 ; si U=0 et D>0, il est 0. Lorsque les deux sont nuls, la formule est indéterminée. Une donnée absente ne représente pas une variation nulle.


**Proposition pour le bot :** Convention proposée : RSI indisponible pour série entièrement plate ou historique incomplet, avec motif explicite. Toute convention différente doit être documentée et testée.


Références : S01.


### K05 — Période et mémoire

Statut : deduction_mathematique.

14 désigne 14 périodes de calcul et non obligatoirement 14 jours. La récurrence conserve une mémoire décroissante au-delà des 14 dernières variations. Réduire n augmente le poids de la dernière variation.


**Proposition pour le bot :** Commencer par une référence fixe, puis comparer un petit nombre de périodes prédéclarées, sans chercher le meilleur résultat parmi des centaines de réglages.


Références : S01, S03.


### K06 — Surachat et survente

Statut : heuristique_chartiste.

70 et 30 sont des seuils conventionnels, pas des plafonds ou planchers de prix. Un oscillateur peut rester extrême en tendance.


**Proposition pour le bot :** Enregistrer entrée dans la zone, durée, sortie et contexte ; ne pas transformer la seule présence en zone en ordre.


Références : S02, S04.


### K07 — Plages liées à la tendance

Statut : heuristique_chartiste.

Repères publiés : en hausse, RSI souvent 40–90 avec replis vers 40–50 ; en baisse, souvent 10–60 avec rebonds vers 50–60. Ces plages varient.


**Proposition pour le bot :** Les traiter comme hypothèses, avec statistiques conditionnelles par instrument et horizon, jamais comme définition certaine du régime.


Références : S02.


### K08 — Ligne 50

Statut : deduction_mathematique.

Quand U=D>0, RSI=50. Cela décrit l’équilibre des variations lissées, pas nécessairement l’absence de tendance de prix.


**Proposition pour le bot :** Distinguer être au-dessus de 50, franchir 50 à la clôture et persister au-dessus pendant plusieurs barres.


Références : S01.


### K09 — Caractéristiques temporelles

Statut : proposition_ingenierie.

Une valeur isolée perd l’information de trajectoire. Propositions : pente sur k barres, durée au-dessus de 70, dernier franchissement, minimum depuis un repli, maximum depuis un rebond.


**Proposition pour le bot :** Pour chaque mesure, enregistrer fenêtre, bougies utilisées et date de disponibilité. Ne pas multiplier les paramètres sans mesure d’apport.


Références : S01.


## Divergences


### K10 — Régulière haussière

Statut : heuristique_chartiste.

Deux creux de prix : le second est plus bas ; creux de RSI correspondant plus haut. Désaccord entre progression du prix et momentum, souvent interprété comme avertissement de faiblesse de la baisse.


**Proposition pour le bot :** Exemple fictif : prix 100→98, RSI 22→31. Ce motif seul n’autorise pas une entrée.


**Limite :** La baisse peut se poursuivre malgré plusieurs divergences.


Références : S03.


### K11 — Régulière baissière

Statut : heuristique_chartiste.

Deux sommets de prix : le second est plus haut ; sommet de RSI correspondant plus bas. Avertissement potentiel, pas preuve de retournement.


**Proposition pour le bot :** Exemple fictif : prix 100→103, RSI 79→68. Tester séparément alerte, sortie et entrée vendeuse.


**Limite :** Une simple consolidation peut suffire à résorber le désaccord.


Références : S03.


### K12 — Cachée haussière

Statut : heuristique_chartiste.

Prix : creux plus haut ; RSI : creux plus bas. Motif couramment utilisé pour étudier une continuation haussière.


**Proposition pour le bot :** Exiger que la tendance haussière soit caractérisée avant le motif, avec une règle indépendante.


**Limite :** La nomenclature et l’alignement des pivots doivent être explicites.


Références : S01, S03.


### K13 — Cachée baissière

Statut : heuristique_chartiste.

Prix : sommet plus bas ; RSI : sommet plus haut. Motif étudié comme continuation dans une tendance baissière préexistante.


**Proposition pour le bot :** Ne pas le mélanger au motif régulier baissier ; conserver des résultats séparés.


Références : S01, S03.


### K14 — Extrêmes égaux et tolérances

Statut : proposition_ingenierie.

Classer explicitement les écarts : hausse, baisse, égalité dans une tolérance. Éviter d’imposer higher high à deux sommets pratiquement identiques.


**Proposition pour le bot :** Proposition : égalité de prix si |P2−P1|≤εprix, avec εprix défini en ticks ou ATR ; égalité RSI avec εRSI séparé. Fixer les paramètres avant évaluation.


Références : S03.


### K15 — Failure swing

Statut : heuristique_chartiste.

Motif propre au RSI. Exemple haussier : passage sous 30, retour au-dessus, repli maintenu au-dessus, puis dépassement du sommet RSI intermédiaire. Inverse autour de 70.


**Proposition pour le bot :** Séquences fictives : 24→39→33→43 et 77→61→67→57. L’événement n’existe qu’à la confirmation de la dernière étape.


Références : S01.


### K16 — Figures sur le RSI

Statut : heuristique_chartiste.

Des lignes de tendance ou doubles sommets/creux peuvent être tracés sur l’oscillateur lui-même. Ce n’est pas automatiquement la même figure sur le prix.


**Proposition pour le bot :** Préférer des règles numériques de pivots à une ligne dessinée discrétionnairement. Tester ce module après les motifs simples.


Références : S02.


## Variantes


### K17 — Stochastic RSI

Statut : definition_mathematique.

StochRSI=(RSI−minimum RSI sur m)/(maximum RSI sur m−minimum RSI sur m). Forme brute sur 0–1, parfois affichée sur 0–100, puis lissée en K/D.


**Proposition pour le bot :** Versionner n, m, K, D et échelle. Si le dénominateur est nul, produire un état non valide ou une convention documentée.


**Limite :** Un extrême de StochRSI ne veut pas dire que le RSI lui-même dépasse 70 ou passe sous 30.


Références : S05.


### K18 — Connors RSI

Statut : definition.

Moyenne de trois composantes : RSI du prix, RSI de la longueur signée de la série de hausses/baisses, rang percentile de la variation sur une période. Réglage usuel : 3, 2, 100.


**Proposition pour le bot :** Ne pas utiliser le ROC brut à la place de son rang percentile. Garder ce candidat séparé du RSI de Wilder.


Références : S06.


### K19 — RSI lissé versus lissage interne

Statut : proposition_ingenierie.

Le lissage utilisé pour calculer U/D et une moyenne mobile ajoutée au RSI sont deux opérations différentes. Croiser RSI et sa moyenne n’est pas la formule du RSI.


**Proposition pour le bot :** Noms distincts : rsi_smoothing_method, rsi_signal_ma_type, rsi_signal_ma_length. Toute moyenne ajoutée doit montrer son apport net.


Références : S01.


## Tendances


### K20 — Structure des sommets et creux

Statut : definition_chartiste.

Hausse : sommets et creux ascendants. Baisse : sommets et creux descendants. Une structure latérale ne présente pas cette progression directionnelle.


**Proposition pour le bot :** Utiliser uniquement les pivots déjà confirmés. Conserver leur sensibilité et l’âge de la dernière confirmation.


Références : S07.


### K21 — Horizons superposés

Statut : definition_chartiste.

Une baisse courte peut être un repli dans une hausse plus longue. Des unités différentes peuvent décrire des tendances opposées sans contradiction.


**Proposition pour le bot :** Proposition de recherche, non réglage optimal : 15 min pour le contexte, 5 min pour le motif, 1 min pour l’exécution.


Références : S07.


### K22 — Transition et incertitude

Statut : proposition_ingenierie.

Ne pas imposer un choix binaire hausse/baisse lorsque la structure est mixte ou les données insuffisantes.


**Proposition pour le bot :** États proposés : uptrend, downtrend, range, transition, unknown. Autoriser l’abstention et garder la volatilité dans un champ indépendant.


Références : S07.


### K23 — Moyennes mobiles

Statut : definition.

Une EMA pondère davantage les observations récentes et conserve une mémoire décroissante. Elle aide à décrire le mouvement mais réagit avec retard.


**Proposition pour le bot :** Étudier pente normalisée par ATR et position du prix ; ne pas assimiler tout croisement à une nouvelle tendance durable.


Références : S28.


### K24 — ADX et direction

Statut : definition.

ADX décrit l’intensité directionnelle, pas le sens. Les lignes DI+ et DI− sont distinctes. Les repères 20 et 25 sont conventionnels.


**Proposition pour le bot :** Un ADX en baisse n’implique pas une baisse de prix. Ne pas déclarer automatiquement un range dès qu’ADX<20.


**Limite :** Les seuils et l’efficacité doivent être évalués sur le marché choisi.


Références : S12.


## Contexte


### K25 — ATR et unités comparables

Statut : definition_mathematique.

TR=max(H−L, |H−Cprécédent|, |L−Cprécédent|). L’ATR en lisse les valeurs. Il mesure l’amplitude, sans indiquer le sens futur.


**Proposition pour le bot :** Proposition : distance d’un niveau / ATR, amplitude d’une cassure / ATR. ATR nul ou indisponible interdit ces divisions.


Références : S13.


### K26 — VWAP et ancrage

Statut : definition_mathematique.

Le VWAP pondère les prix par les volumes depuis un ancrage. Une approximation par barres emploie Σ(hlc3×V)/ΣV ; les transactions individuelles donnent une mesure différente.


**Proposition pour le bot :** Enregistrer prix source, volume, ancrage et horaire de séance. Être au-dessus ne suffit pas à prouver une hausse.


Références : S14.


### K27 — Volume relatif à heure comparable

Statut : definition.

Le volume relatif à l’heure compare le volume à des moments comparables de séances passées. La séance et le caractère cumulatif ou par barre comptent.


**Proposition pour le bot :** Ne pas comparer une première minute de séance à une moyenne arbitraire de minutes creuses. Vérifier la qualité du volume et la clôture de la barre.


Références : S15, S16.


### K28 — Bandes de Bollinger

Statut : definition.

Enveloppe autour d’une moyenne, élargie ou resserrée selon l’écart-type. Paramètres habituels : 20 périodes et 2 écarts-types. Le prix peut longer une bande en tendance.


**Proposition pour le bot :** Étudier la largeur comme caractéristique de compression. Un contact de bande associé à un RSI extrême ne prouve pas un retournement.


Références : S29.


### K29 — VWMA n’est pas VWAP

Statut : definition.

La VWMA utilise une fenêtre mobile pondérée par les volumes, tandis qu’un VWAP ancré cumule depuis son origine.


**Proposition pour le bot :** Ne pas réutiliser le même nom de variable ni les mêmes règles de remise à zéro.


Références : S17, S14.


## Figures


### K30 — Supports et résistances

Statut : heuristique_chartiste.

Des zones associées à des réactions antérieures peuvent servir de support ou résistance ; leur rôle peut changer après une cassure.


**Proposition pour le bot :** Définir largeur, ancienneté, nombre de réactions et moment de disponibilité. Éviter de sélectionner uniquement les niveaux qui ont ensuite fonctionné.


Références : S09.


### K31 — Cassure et retest

Statut : proposition_ingenierie.

Définir une cassure par un événement mesurable, puis un retour éventuel vers la zone. Le retest n’est pas obligatoire dans la réalité.


**Proposition pour le bot :** Variante à tester : clôture au-delà d’une zone avec marge en ticks, puis retest confirmé dans un délai fixé. Ne pas introduire ce délai après observation du résultat.


Références : S09.


### K32 — Figures de continuation

Statut : heuristique_chartiste.

Rectangles, drapeaux, fanions et triangles décrivent des consolidations. Leur géométrie ne garantit pas le sens de sortie.


**Proposition pour le bot :** Définir nombre de points, pente, durée et tolérance. Étiqueter figure en formation séparément de cassure confirmée.


Références : S10.


### K33 — Figures de retournement

Statut : heuristique_chartiste.

Doubles sommets/creux et épaules-tête-épaules sont étudiés avec une rupture de niveau intermédiaire ou de ligne de cou.


**Proposition pour le bot :** Deux sommets seuls ne constituent pas un ordre de vente. Conserver un état provisoire jusqu’à l’événement défini de confirmation.


Références : S11.


### K34 — Bougies et mèches

Statut : definition.

Les bougies représentent ouverture, plus haut, plus bas et clôture. Le corps et les mèches décrivent la période, sans raconter à eux seuls les intentions des intervenants.


**Proposition pour le bot :** Mesures proposées : corps/étendue, mèche haute/étendue, mèche basse/étendue, position de clôture. Définir le cas H=L.


Références : S08.


## Donnees


### K35 — Graphiques synthétiques

Statut : contrainte_technique.

Des graphiques construits ou lissés peuvent contenir des niveaux non assimilables à des prix d’exécution réels.


**Proposition pour le bot :** Pour le backtest de base, utiliser des OHLC réels. Tout signal sur série synthétique doit être exécuté sur des données négociables séparées.


Références : S21.


### K36 — Disponibilité des pivots

Statut : contrainte_technique.

Un pivot qui exige r bougies à droite n’est identifiable qu’après leur clôture. Une flèche replacée sur le pivot passé peut masquer ce délai.


**Proposition pour le bot :** Enregistrer pivot_time et confirmed_at. Pour r=3, un pivot sur la barre j n’est exploitable qu’à j+3 au plus tôt. Aucun ordre rétroactif.


Références : S18.


### K37 — Unité supérieure incomplète

Statut : contrainte_technique.

Une bougie d’unité supérieure en formation peut changer. Utiliser sa valeur finale avant clôture introduit du futur dans le test.


**Proposition pour le bot :** À 10:07, ne pas utiliser la clôture finale de la bougie 10:00–10:15. Documenter les conventions d’ouverture/fermeture des timestamps.


Références : S19.


## Execution


### K38 — Détection et prix d’entrée

Statut : contrainte_technique.

Un ordre ne peut être rempli avant que son signal et sa soumission n’existent. Le simulateur doit décrire le délai et le type d’ordre.


**Proposition pour le bot :** En stratégie sur clôture, modéliser la prochaine occasion d’exécution disponible ; ne pas choisir après coup le meilleur prix de la bougie du signal.


Références : S20.


### K39 — Stop et objectif touchés dans la même barre

Statut : proposition_ingenierie.

Des OHLC seuls ne donnent pas toujours l’ordre des événements internes. Un stop et un objectif inclus dans l’étendue de la même barre créent une ambiguïté.


**Proposition pour le bot :** Utiliser des données plus fines, sinon publier une convention conservatrice et le nombre de trades concernés ; ne pas sélectionner le résultat favorable.


Références : S20.


## Donnees


### K40 — Futures continus et rollover

Statut : contrainte_technique.

Une série continue assemble des échéances. Le rétro-ajustement modifie l’historique pour réduire certains écarts de raccordement.


**Proposition pour le bot :** Conserver le contrat négociable, la politique de rollover et celle d’ajustement. Tester la cohérence des indicateurs et des remplissages autour des raccordements.


Références : S22, S23.


### K41 — Séance, calendrier et qualité

Statut : proposition_ingenierie.

Un indicateur n’est reproductible que si les données, la construction des barres et les conventions sont connues.


**Proposition pour le bot :** Contrôler tri, doublons, trous, fuseau, changements d’heure, dernière bougie complète, latence et corrections du fournisseur. Les données absentes ne sont pas inventées.


Références : S15, S16, S19.


## Validation


### K42 — Essais multiples

Statut : recherche_methodologique.

Sélectionner le meilleur résultat parmi de nombreux backtests favorise les découvertes dues au bruit. Réutiliser un test final pour choisir des règles le contamine.


**Proposition pour le bot :** Tenir le registre de toutes les variantes, y compris perdantes ; réserver une nouvelle période intacte après toute modification issue du test.


Références : S24, S27.


### K43 — Résultats RSI favorables mais circonscrits

Statut : recherche_empirique.

Chong, Ng et Liew rapportent des résultats favorables à certaines règles RSI/MACD dans des marchés historiques particuliers. Cela ne démontre pas leur efficacité actuelle sur un autre instrument.


**Proposition pour le bot :** Ne transférer aucun taux de réussite ou paramètre réputé optimal sans réplication adaptée.


**Limite :** La présente base ne réplique pas les expériences de l’article.


Références : S25.


### K44 — Les frais peuvent effacer le résultat

Statut : recherche_empirique.

Zhu et collègues étudient des règles de moyennes mobiles et de cassure sur des indices chinois ; dans leur analyse, les coûts éliminent la rentabilité observée avant frais. Ce n’est pas une étude RSI.


**Proposition pour le bot :** Utiliser l’exemple comme avertissement méthodologique, non comme preuve que toute analyse technique échoue.


Références : S26.


### K45 — Découpage chronologique

Statut : proposition_recherche.

Séparer construction, validation et test final ; figer la règle avant le test final. Répéter des fenêtres glissantes peut examiner différentes périodes sans mélanger passé et futur.


**Proposition pour le bot :** Définir les dates avant les essais, laisser les préchauffages utiliser uniquement le passé et purger les positions/étiquettes chevauchant les frontières selon le protocole.


Références : S24, S27.


### K46 — Nombre de trades et incertitude

Statut : proposition_recherche.

Un résultat agrégé ne résume ni la variabilité, ni la dépendance entre trades d’une séance. Il n’existe pas de nombre universel de trades garantissant la validité.


**Proposition pour le bot :** Publier effectif, séances, intervalles d’incertitude et sensibilité aux périodes. Étudier un rééchantillonnage par blocs de séances plutôt qu’une indépendance supposée des trades.


Références : S24.


### K47 — Apport propre d’un indicateur

Statut : proposition_recherche.

Comparer une règle témoin et la même règle enrichie d’une seule information permet d’étudier ce que cet ajout change réellement.


**Proposition pour le bot :** À risque, coûts et sorties comparables : témoin prix seul, +RSI, +divergence, puis combinaison. Analyser aussi les bons trades supprimés et les nouveaux mauvais trades.


Références : S24.


## Risque


### K48 — Risque séparé du signal

Statut : proposition_ingenierie.

Une figure convaincante ne doit pas pouvoir désactiver un plafond de risque ou une contrainte d’exécution.


**Proposition pour le bot :** Dimensionner selon distance au stop, valeur du point, coûts et marge de sécurité ; refuser si une unité minimale dépasse le budget. Un stop ne garantit pas son prix de remplissage.


Références : S20.


## Architecture


### K49 — Moteur numérique et explication

Statut : proposition_ingenierie.

Séparer calculs déterministes, classification, décision candidate, contrôle de risque et explication en langage naturel.


**Proposition pour le bot :** L’IA reçoit les valeurs observées et les raisons de refus. Les documents enrichissent ses explications ; ils ne constituent pas à eux seuls un modèle statistique entraîné.


Références : S18, S20.


### K50 — Score et probabilité

Statut : proposition_ingenierie.

Un score construit en additionnant des critères n’est pas automatiquement une probabilité de réussite.


**Proposition pour le bot :** Sans calibration hors échantillon, afficher score heuristique ou hypothèse, jamais 82 % de chances de gain. Probabilité absente dans l’exemple fourni.


Références : S24.


## Contexte


### K51 — Événements et facteurs externes

Statut : guide_contextuel.

Les indicateurs de prix n’expliquent pas à eux seuls les facteurs fondamentaux et les événements susceptibles d’affecter les futures.


**Proposition pour le bot :** Ajouter un contexte d’événements daté provenant d’un flux vérifié ; lorsqu’il manque, indiquer inconnu. Ne pas inventer le motif économique d’une bougie.


Références : S30.


## Architecture


### K52 — Éviter une validation circulaire

Statut : proposition_recherche.

Définir une tendance seulement par RSI>50, puis conclure que RSI>50 prédit la tendance, ne teste pas un apport prédictif indépendant.


**Proposition pour le bot :** Définir d’abord le régime avec la structure/prix ; évaluer ensuite si le RSI améliore une décision ou un résultat futur explicitement défini.


Références : S24.


## Validation


### K53 — Rapport quotidien et hebdomadaire

Statut : proposition_recherche.

L’analyse doit distinguer les jours sans signal, les jours bloqués par qualité/risque et les jours avec trades.


**Proposition pour le bot :** Exporter net, coûts, nombre de trades, séries de pertes, drawdown, excursions favorable/défavorable et motif de chaque refus. Ne pas forcer un trade pour remplir une journée.


Références : S20, S24.


## Risque


### K54 — Plusieurs marchés, risque total

Statut : proposition_ingenierie.

Des modules évalués séparément peuvent proposer des positions simultanées. Le risque doit aussi être mesuré au niveau du portefeuille.


**Proposition pour le bot :** Tester chaque instrument, puis la combinaison temporelle ; plafonner expositions simultanées et pertes globales. Ne pas simplement additionner les meilleurs backtests indépendants.


Références : S20.


## Architecture


### K55 — Traçabilité de la connaissance

Statut : proposition_ingenierie.

Associer chaque règle à ses références et à son statut : définition, usage chartiste, hypothèse interne ou résultat validé.


**Proposition pour le bot :** Conserver version du code, du protocole, des paramètres et des données. Les sources servent à justifier la définition, pas à certifier le profit.


Références : S24.


## Donnees


### K56 — Provisoire versus confirmé

Statut : contrainte_technique.

Sur une bougie en cours, le prix et les indicateurs calculés à partir de lui évoluent. Une condition vraie temporairement peut disparaître avant la clôture.


**Proposition pour le bot :** Afficher deux états distincts. Les alertes sur clôture ne doivent pas se déclencher depuis une mesure provisoire.


Références : S18.


## Six hypothèses à comparer


### H01 — Repli dans une tendance

**Contexte :** Structure haussière indépendante du RSI ; repli vers zone prédéfinie. Variante baissière séparée.

**Déclencheur candidat :** Tester une reprise du RSI après passage dans une bande candidate 40–50, avec reprise du prix confirmée.

**Invalidation :** Cassure de la structure de référence ou expiration du motif.

**Comparaison :** Comparer au même repli et même confirmation de prix sans filtre RSI.

Statut : non validée, non exécutable, réel désactivé.


### H02 — Retour dans un range

**Contexte :** Range caractérisé avant la réaction ; proximité d’une borne.

**Déclencheur candidat :** Après RSI<30, clôture de RSI au-dessus de 30 et réintégration de prix ; symétrique pour la borne haute.

**Invalidation :** Sortie confirmée du range ou expiration avant réintégration.

**Comparaison :** Même réaction de prix sans seuil RSI ; analyser fausses cassures et tendances naissantes.

Statut : non validée, non exécutable, réel désactivé.


### H03 — Divergence régulière avec confirmation

**Contexte :** Deux pivots correspondants, tous confirmés ; zone et tendance documentées.

**Déclencheur candidat :** Motif régulier puis rupture de microstructure de prix selon règle fixée.

**Invalidation :** Prix invalidant le niveau retenu avant entrée, divergence périmée, délai maximal dépassé.

**Comparaison :** Même confirmation de prix avec et sans divergence ; distinguer utilisation en filtre, sortie et entrée.

Statut : non validée, non exécutable, réel désactivé.


### H04 — Continuation avec divergence cachée

**Contexte :** Tendance préalable, pivots de prix/RSI appariés sans futur.

**Déclencheur candidat :** Motif caché confirmé et reprise du prix dans le sens du régime.

**Invalidation :** Rupture du dernier pivot structurel de référence.

**Comparaison :** Comparer aux replis ordinaires dans le même régime ; ne pas compter deux fois le même mouvement.

Statut : non validée, non exécutable, réel désactivé.


### H05 — Failure swing confirmé

**Contexte :** Séquence RSI complète disponible sur clôtures.

**Déclencheur candidat :** Dépassement du sommet RSI intermédiaire après échec au-dessus de 30 ; séquence inverse sous 70.

**Invalidation :** Retour en zone extrême avant dernière étape, ordre incohérent des étapes ou expiration.

**Comparaison :** Comparer au simple retour de RSI dans 30–70 avec risque et sorties identiques.

Statut : non validée, non exécutable, réel désactivé.


### H06 — Continuation après cassure

**Contexte :** Zone construite causalement, cassure de prix confirmée, contexte de volatilité connu.

**Déclencheur candidat :** Tester une confirmation RSI>50 plutôt qu’un rejet mécanique de tout RSI>70 ; volume relatif comme ablation distincte.

**Invalidation :** Réintégration invalidante ou conditions d’exécution insuffisantes.

**Comparaison :** Cassure prix seule, +RSI, puis +volume relatif séparément.

Statut : non validée, non exécutable, réel désactivé.


## Protocole d’évaluation proposé

Avant les essais, fixer instrument, échéance, flux, séance, unités de temps, règles d’entrée et de sortie, budget, frais, modèle de remplissage et dates. Comparer les mêmes conditions avec et sans chaque module. Séparer développement, validation et test final chronologiquement. Les optimisations ultérieures n’utilisent pas un test final déjà consulté comme une réserve intacte.

Rapporter espérance nette par trade, profit factor, drawdown, nombre de trades et de séances, concentration des gains, durée en position et sensibilité aux coûts. Conserver aussi les motifs non exécutés et leurs raisons de refus. Publier les résultats par jour, semaine, instrument et régime, sans obligation de trader tous les jours.

La moyenne des profits moins celle des pertes et des coûts importe davantage qu’un taux de réussite seul. Exemple purement arithmétique : 40 % de gains à +2R et 60 % de pertes à −1R donnent +0,2R par trade avant frais ; si les frais valent 0,25R par trade, le résultat devient −0,05R. R désigne ici le risque initial planifié, non une perte maximale garantie.

Après résultat hors échantillon suffisamment stable au regard de l’incertitude et du risque choisi, observer le moteur sans ordre réel, puis en simulation. Cette recherche ne fournit ni validation statistique du bot ni autorisation d’exécution.

## Catalogue de charts

Les 18 fiches du fichier catalogue_charts.json spécifient les motifs à illustrer et leur contre-exemple. Aucune image tierce n’a été copiée dans le pack. Les pages de référence permettent de consulter les exemples publiés par leurs auteurs.


**C01 — Surachat en tendance haussière :** Prix ascendant avec RSI au-dessus de 70. Contre-exemple à montrer : Le prix continue à monter longtemps malgré le premier passage au-dessus de 70. Références : S02.


**C02 — Survente en tendance baissière :** Prix descendant avec RSI sous 30. Contre-exemple à montrer : Chaque nouveau seuil bas est suivi d’un autre plus bas. Références : S04.


**C03 — Divergence régulière haussière :** Prix LL ; oscillateur HL. Contre-exemple à montrer : Divergence suivie d’une poursuite de la baisse. Références : S03.


**C04 — Divergence régulière baissière :** Prix HH ; oscillateur LH. Contre-exemple à montrer : Divergence suivie d’une poursuite de la hausse. Références : S03.


**C05 — Divergence cachée haussière :** Prix HL ; oscillateur LL. Contre-exemple à montrer : Dernier creux de prix ensuite invalidé. Références : S01.


**C06 — Divergence cachée baissière :** Prix LH ; oscillateur HH. Contre-exemple à montrer : Cassure du dernier sommet de prix. Références : S01.


**C07 — Extrêmes égaux :** Double sommet/creux dans une tolérance de prix ou RSI. Contre-exemple à montrer : Un écart de moins d’un tick est faussement traité comme un nouveau sommet. Références : S03.


**C08 — Failure swing du RSI :** Extrême, retour, échec du retest, rupture du pivot RSI intermédiaire. Contre-exemple à montrer : Retest qui retourne en zone extrême avant la rupture. Références : S01.


**C09 — Tendance, repli et reprise :** Structure HH/HL puis correction locale. Contre-exemple à montrer : Le repli devient une rupture de structure. Références : S07.


**C10 — Range :** Oscillation entre deux zones construites sans futur. Contre-exemple à montrer : Le troisième contact traverse le niveau au lieu de rebondir. Références : S09.


**C11 — Cassure et retest :** Franchissement d’une zone, puis retour vers celle-ci. Contre-exemple à montrer : Fausse cassure avec retour durable dans le range. Références : S09.


**C12 — Drapeau ou fanion :** Consolidation après déplacement directionnel. Contre-exemple à montrer : Sortie opposée au déplacement précédent. Références : S10.


**C13 — Triangle :** Resserrement entre limites convergentes. Contre-exemple à montrer : Première sortie avortée. Références : S10.


**C14 — Double sommet ou double creux :** Deux tests de zone séparés par un mouvement intermédiaire. Contre-exemple à montrer : Deux sommets qui précèdent une accélération haussière. Références : S11.


**C15 — Épaules-tête-épaules et inverse :** Trois extrêmes structurés autour d’un central plus marqué. Contre-exemple à montrer : Ligne de cou jamais rompue, ou rupture immédiatement invalidée. Références : S11.


**C16 — Compression des bandes :** Réduction de la largeur de l’enveloppe de volatilité. Contre-exemple à montrer : Compression prolongée sans départ exploitable. Références : S29.


**C17 — Rejet par mèche :** Grande mèche relativement au corps et à l’étendue. Contre-exemple à montrer : Mèche identique dans une zone sans intérêt ou avant continuation. Références : S08.


**C18 — Piège du pivot rétrospectif :** Marqueur placé sur la bougie du pivot après confirmation tardive. Contre-exemple à montrer : Backtest qui achète au pivot avant les bougies nécessaires pour le connaître. Références : S18.


## Références consultées


### S01 — Relative Strength Index (RSI)

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000502338-relative-strength-index-rsi/

Limite : Définitions et usages usuels ; aucune validation de notre stratégie.


### S02 — Relative Strength Index

Fidelity — guide_institutionnel. Consulté le 2026-09-09.

https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI

Limite : Les plages de RSI par tendance sont des repères variables, pas des lois.


### S03 — Relative Strength Index (RSI)

StockCharts ChartSchool — documentation_plateforme. Consulté le 2026-09-09.

https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/relative-strength-index-rsi

Limite : Référence de calcul et interprétations chartistes ; pas une preuve de gains.


### S04 — Oscillators: MACD, RSI, Stochastics

CME Group — guide_bourse. Consulté le 2026-09-09.

https://www.cmegroup.com/education/courses/technical-analysis/oscillators-macd-rsi-stochastics

Limite : Retenir les limites des oscillateurs en tendance ; vérifier les formules dans les documentations propres à chaque indicateur.


### S05 — Stochastic RSI (STOCH RSI)

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000502333-stochastic-rsi-stoch-rsi/

Limite : Transformation du RSI ; sensibilité accrue ne signifie pas meilleure précision.


### S06 — Connors RSI (CRSI)

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000502017-connors-rsi-crsi/

Limite : Indicateur distinct : ne pas substituer ses seuils à ceux du RSI de Wilder.


### S07 — Basic concepts of trend

Fidelity — guide_institutionnel. Consulté le 2026-09-09.

https://www.fidelity.com/learning-center/trading-investing/technical-analysis/basic-concepts-trend

Limite : Définition chartiste, non prédiction garantie.


### S08 — Chart Types: Candlestick, Line, Bar

CME Group — guide_bourse. Consulté le 2026-09-09.

https://www.cmegroup.com/education/courses/technical-analysis/chart-types-candlestick-line-bar

Limite : Différencier le mode d’affichage et les données effectivement négociables.


### S09 — Support and Resistance

CME Group — guide_bourse. Consulté le 2026-09-09.

https://www.cmegroup.com/education/courses/trading-and-analysis/support-and-resistance

Limite : Niveaux interprétés comme zones, susceptibles de casser.


### S10 — Trend and Continuation Patterns

CME Group — guide_bourse. Consulté le 2026-09-09.

https://www.cmegroup.com/education/courses/technical-analysis/trend-and-continuation-patterns

Limite : Figures candidates ; aucune probabilité universelle utilisable pour le bot.


### S11 — Technical Patterns: Reversals

CME Group — guide_bourse. Consulté le 2026-09-09.

https://www.cmegroup.com/education/courses/technical-analysis/technical-patterns-reversals

Limite : Distinguer formation et confirmation par le prix.


### S12 — Average directional index (ADX)

Fidelity — guide_institutionnel. Consulté le 2026-09-09.

https://www.fidelity.com/viewpoints/active-investor/average-directional-index-ADX

Limite : Utiliser la définition de l’indicateur, pas le commentaire de marché daté de la page.


### S13 — Average True Range (ATR)

Fidelity — guide_institutionnel. Consulté le 2026-09-09.

https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/atr

Limite : Mesure non directionnelle ; un multiple d’ATR ne garantit pas la perte maximale.


### S14 — Volume Weighted Average Price (VWAP)

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000502018-volume-weighted-average-price-vwap/

Limite : Préciser source de prix et ancrage. La formule par bougies approxime le VWAP des transactions.


### S15 — Volume

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000591617-volume/

Limite : La signification de l’unité dépend du marché et du flux.


### S16 — Relative Volume at Time

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000705489-relative-volume-at-time/

Limite : Comparer des instants comparables ; une bougie en formation est incomplète.


### S17 — Volume Weighted Moving Average (VWMA)

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000592293-volume-weighted-moving-average-vwma/

Limite : Fenêtre mobile, différente de l’ancrage du VWAP.


### S18 — Repainting

TradingView Pine Script — documentation_technique. Consulté le 2026-09-09.

https://www.tradingview.com/pine-script-docs/concepts/repainting/

Limite : Référence pour distinguer un dessin rétrospectif d’un signal disponible en direct.


### S19 — Other timeframes and data

TradingView Pine Script — documentation_technique. Consulté le 2026-09-09.

https://www.tradingview.com/pine-script-docs/concepts/other-timeframes-and-data/

Limite : Respecter l’heure de disponibilité des données de chaque unité de temps.


### S20 — Strategies

TradingView Pine Script — documentation_technique. Consulté le 2026-09-09.

https://www.tradingview.com/pine-script-docs/concepts/strategies/

Limite : Documentation d’un simulateur, pas preuve de fidélité de notre moteur non audité.


### S21 — Strategy produces unrealistically good results by peeking into the future

TradingView — documentation_technique. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000614705-strategy-produces-unrealistically-good-results-by-peeking-into-the-future/

Limite : Éviter l’accès au futur et les prix artificiels d’exécution.


### S22 — What are 1! and 2! continuous futures contracts?

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000483493-what-are-1-and-2-continuous-futures-contracts/

Limite : Une série continue assemble plusieurs échéances.


### S23 — How can I enable backadjustment for continuous futures?

TradingView — documentation_plateforme. Consulté le 2026-09-09.

https://www.tradingview.com/support/solutions/43000685266-how-can-i-enable-backadjustment-for-continuous-futures/

Limite : Le choix d’ajustement doit être versionné et rapproché des contrats réellement exécutés.


### S24 — The Probability of Backtest Overfitting

Bailey, Borwein, López de Prado et Zhu — recherche_originale. Consulté le 2026-09-09.

https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf

Limite : Recherche méthodologique. Ne fournit pas de performance attendue pour un RSI particulier.


### S25 — Revisiting the Performance of MACD and RSI Oscillators

Chong, Ng et Liew — archive universitaire MPRA — recherche_originale. Consulté le 2026-09-09.

https://mpra.ub.uni-muenchen.de/54149/

Limite : Résultats historiques propres aux marchés, paramètres et protocole étudiés ; non transférables automatiquement à l’intraday actuel.


### S26 — Profitability of simple technical trading rules of Chinese stock exchange indexes

Zhu, Jiang, Li et Zhou — arXiv — recherche_originale. Consulté le 2026-09-09.

https://arxiv.org/abs/1504.04254

Limite : Étude de moyennes mobiles et cassures, pas du RSI ; exemple de disparition des profits après coûts dans cet échantillon.


### S27 — How Backtest Overfitting in Finance Leads to False Discoveries

Bailey et López de Prado — Significance — article_auteurs. Consulté le 2026-09-09.

https://academic.oup.com/jrssig/article/18/6/22/7038278

Limite : Complément méthodologique sur les découvertes trompeuses issues d’optimisations historiques.


### S28 — Exponential Moving Average (EMA)

Fidelity — guide_institutionnel. Consulté le 2026-09-09.

https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/ema

Limite : Lissage réactif mais retardé ; le croisement ne localise pas parfaitement un retournement.


### S29 — Bollinger Bands

Fidelity — guide_institutionnel. Consulté le 2026-09-09.

https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/bollinger-bands

Limite : Un contact de bande n’impose pas de retour à la moyenne.


### S30 — Futures: Looking Beyond Technical Analysis

CME Group — guide_bourse. Consulté le 2026-09-09.

https://www.cmegroup.com/articles/2026/futures-looking-beyond-technical-analysis.html

Limite : Le contexte fondamental et les événements ne sont pas entièrement expliqués par les indicateurs de prix.
