# Nykuto — bilan consolidé avant le Jeu 33

**Mise à jour : le comparatif 25K/50K a été exécuté.** Le 50K termine juin–août à +691,25 $ aux coûts normaux et +265,50 $ au stress, sans atteindre l’objectif. [Bilan actuel du Jeu 33](JEU33_RESULTS.md). Le texte ci-dessous conserve le raisonnement antérieur au test.

**Le 50K offre davantage de marge à risque identique, mais les tests ne justifient
pas encore l'achat d'un compte pour faire tourner le bot.** Aucun scénario de
compte protégé du Jeu 32 n'atteint 1 000 dollars sur une semaine complète observée
aux coûts normaux. Un objectif passé en évaluation ne démontre pas un revenu
régulier ni un retrait possible.

## Deux historiques retrouvés et rapprochés

Le site publié suivait `feat/trading-hq-v1`, avec les Jeux 19–26. L'autre branche
`research/trading-game32-trend500`, retrouvée lors du contrôle de déploiement,
contient les Jeux 27–32 jusqu'au commit
`9df4d691122ff6b2137da4bc93e30a4ddf1aac31`. C'est elle qui contient la dernière
mise à l'épreuve des indications de l'associé.

L'audit des filtres exécuté pendant cette reprise a reçu provisoirement le numéro
27 sur la branche du site. Il est désormais désigné **audit F1 des filtres** dans
le catalogue et l'interface. Ses noms de fichiers, code et empreintes gelés sont
conservés pour reproduire les calculs. Il est distinct du véritable Jeu 27 de la
branche de recherche, qui testait une deuxième entrée dans le même sens. Aucun
ancien résultat, code gelé ou manifeste privé n'a été écrasé.

Les registres contiennent respectivement 69 et 74 configurations, dont 57 communes :
**86 identifiants de configurations distincts**, pas 86 validations indépendantes.
Le [catalogue des deux historiques](research-catalog.json) conserve les origines.
Les moteurs de la branche de recherche ne sont pas fusionnés dans le site par
cette synthèse ; ses résultats sont cités à leur commit exact. Les prochains
travaux doivent consulter ce catalogue avant de choisir un numéro ou une règle.

## Ce qui améliore certaines observations

| Règle | Amélioration observée | Limite |
|---|---|---|
| Éviter les RSI extrêmes sur MES | Jeu 31 : janvier–avril passe de +492,75 à +812,75 $ pour le portefeuille | Aucun trade d'août changé ; pas une règle universelle |
| MGC : entrer avant 11 h New York | Jeu 31 : perte d'août réduite de −561,50 à −235,50 $ | Portefeuille toujours perdant en août ; effet variable aux coûts doublés |
| Les deux filtres ensemble | Jeu 31 : janvier–avril +1 076,25 $, contre +492,75 $ | Août reste −235,50 $, puis −622 $ au stress |
| Filtre MNQ M5 EMA/VWAP seul, audit F1 | +877 $ contre +887,50 $ ; drawdown réalisé 289,50 $ contre 369 $ | Janvier–avril seulement, 31 trades et une séance manquante |
| Stop déplacé, nouvelles réentrées ou famille de signal | Des campagnes distinctes existent déjà en Jeux 27–30 | Ne pas les retester comme des idées inédites |

[Bilan Jeu 31](https://github.com/drsoliveirasantos-lab/Nykuto/blob/9df4d691122ff6b2137da4bc93e30a4ddf1aac31/trading/lab/JEU31_RESULTS.md)
et [audit F1](JEU27_RESULTS.md).

## Ce qui échoue dans la méthode H1/M5 testée

Le Jeu 32 a déjà testé le H1/M5 : clôture > EMA9 > EMA21 pour acheter, inverse
pour vendre, sur heures cash closes construites à partir de 09:30 New York.
Cette définition peut différer du graphique Globex/H1 de l'associé. Son ajout
dégrade le résultat estival à risque et sortie constants.

Comptes 25K repartant de zéro au début de chaque mois, risque plafonné à 500 $
frais compris, cible 2R et filtre H1/M5 :

| Vue | Net normal | Net stress |
|---|---:|---:|
| Juin, compte neuf | +1 531,50 $ | +198 $ |
| Juillet, compte neuf | +894 $ | −843 $ |
| Août, compte neuf | −785 $ | −890,50 $ |
| Juin–août, même compte sans reset | +223,50 $ | −189 $ |

Les lignes mensuelles ne s'additionnent pas pour reproduire le compte continu.
Le compte continu n'exécute que huit trades et refuse 23 entrées pour marge
insuffisante. Le diagnostic qui ignore le seuil de compte continue et perd
2 215,50 dollars sur l'été, dont 3 222 dollars en août. Il ne représente pas
des gains/pertes réalisables tels quels dans un compte 25K.

À 150 dollars et 2R **sans** le nouveau filtre H1/M5, le compte continu atteint
l'objectif d'évaluation le 29 juillet puis s'arrête : +1 503 dollars. Poursuivre
le diagnostic jusqu'à fin août réduit le gain à +395,50 dollars, et le stress
devient −98,50 dollars. Ne pas transformer l'arrêt réussi en preuve de stabilité.

Le modèle historique emploie 50 % stricts de cohérence. La fiche actuelle Lucid
décrit une petite tolérance : la non-validation de juin à 50,93 % dans ce modèle
ne permet pas de trancher une décision réelle de Lucid. Cette hypothèse conservatrice
reste gelée dans les anciens calculs et doit être explicitée dans une nouvelle
simulation des conditions actuelles.

[Résultats et protocole du Jeu 32](https://github.com/drsoliveirasantos-lab/Nykuto/blob/9df4d691122ff6b2137da4bc93e30a4ddf1aac31/trading/lab/JEU32_RESULTS.md),
[cohérence officielle Lucid](https://support.lucidtrading.com/en/articles/12945805-lucidflex-consistency-percentage).

## Pourquoi août a pénalisé le système

La référence multi-marché du Jeu 31 donne +472,25 dollars en juin, −33 en juillet,
puis −235,50 en août. Sur ces séances, l'amplitude médiane du MNQ passe de 1,55 %
en juillet à 0,95 % en août (environ −39 %), et son proxy de cassures rapidement
réintégrées passe de 48,4 à 62,5 %. Sur MYM : 48 à 78,8 % de réintégrations.
Ces descriptions sont compatibles avec une continuation qui réussit moins bien ;
elles ne prouvent ni une causalité, ni un filtre d'entrée connu à l'avance.

MGC reste positif en août dans la référence (+131,50 dollars sur trois trades).
Un filtre global « ne pas trader août » masquerait ces différences. La semaine
du 17 au 21 août coûte encore 477 dollars au portefeuille malgré les filtres
du Jeu 31. L'exclure après coup serait un ajustement rétrospectif.

La chute du volume du contrat MGC ne permet pas de conclure à la liquidité de
toute la famille or : elle peut dépendre du changement d'échéance. L'étude ne
prouve pas non plus que les annonces expliquent tout le mois perdant.

[Mesures de marché du Jeu 32](https://github.com/drsoliveirasantos-lab/Nykuto/blob/9df4d691122ff6b2137da4bc93e30a4ddf1aac31/trading/lab/JEU32_MARKET_STUDY.md).

## 50K ou 25K : décision et prochain test

LucidFlex 25K : MLL initial 1 000 $, objectif d'évaluation 1 250 $. LucidFlex 50K :
MLL initial 2 000 $, objectif 3 000 $. Le 50K double la marge initiale et demande
2,4 fois le bénéfice. Le 25K a un objectif proportionnellement plus faible.
Le 50K convient davantage à une progression avec le même risque absolu et aux
plafonds de retraits souhaités ; aucune simulation 50K n'a encore établi cet
avantage sur la stratégie. Les prix d'achat n'ont pas été vérifiés.

Risquer 250–500 dollars par trade sur 50K reste 12,5–25 % de ses 2 000 dollars
de marge initiale. Augmenter le compte ne corrige pas une espérance négative.
Le risque doit dépendre de la distance actuelle au seuil, y compris après
retrait, plutôt que du nominal 25K/50K.

Le prochain test de compte est cadré en quatre variantes, sur la même version
de signal Jeu 31 + 2R, sans retester le filtre H1/M5 identique déjà rejeté :

1. Compte 25K, plafond fixe 100 dollars ; même modèle sur 50K.
2. Compte 25K, plafond 100 dollars réduit à 50 sous 1 000 dollars de marge au
   seuil, puis 25 sous 500 ; même modèle sur 50K. Réaugmentation seulement après
   retour à un solde au moins initial et marge suffisante.

Pour isoler les différences, garder le stop structurel, les quantités entières,
le plafond commun de vingt micros, la réserve de 100 dollars et la limite
quotidienne interne de 200 dollars. Il faut fixer avant exécution le traitement
de la tolérance de cohérence, distinguer évaluation/funded et simuler les retraits
si un objectif de revenu retiré est annoncé. Les quatre variantes sont **préparées,
non exécutées** ; ce n'est pas une nouvelle stratégie profitable annoncée.

Les gains ne sont ni multipliés par deux avec le nominal ni ciblés en augmentant
le risque après une perte. Une amélioration historique devra encore être testée
sur des observations nouvelles, sans activation automatique.

[Comparaison Lucid détaillée](JEU27_RESULTS.md#lucidflex--25k-ou-50k-),
[évaluation officielle](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account),
[drawdown officiel](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown),
[retraits officiels](https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts).

## Contrôles de cette reprise

Audit F1 : douze nouveaux calculs, huit reproductions de témoins et archives
privées relues. Suite de trading du site : 194 tests réussis après correction
du statut normalisé de registre. Branche Jeu 32 : treize tests ciblés réussis,
dont vérification SHA-256 du rapport, 47 dépendances gelées, 80 vues de résultats,
réconciliation quotidienne/hebdomadaire et comportement des seuils. Ces derniers
vérifient les résultats existants ; ils ne sont pas 80 nouveaux backtests.

Le catalogue rapproche les identifiants de recherches et leurs origines sans
réécrire les registres historiques. Aucun ordre, activation Paper/Shadow/réelle,
achat, secret ou collecte modifié. Les comptes 50K et la réduction dynamique
du risque restent à simuler.
