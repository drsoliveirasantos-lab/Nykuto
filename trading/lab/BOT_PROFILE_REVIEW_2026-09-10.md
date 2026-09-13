# Revue des profils Nykuto et priorités après le Jeu 41

Revue en lecture seule, 10 septembre 2026. Aucun nouveau replay, entraînement, inférence ou seuil sélectionné. Dépôt examiné au commit `73aa1a6208a85f5a622e5d81f2675cd561ca0bb2`, 67 fichiers du gel 41 contrôlés sans différence. Analyse des règles de recherche ; les propositions ci-dessous ne lancent aucune nouvelle campagne.

## Conclusion utile pour Diego

La faiblesse principale de la référence est MES : 44 trades et seulement 41,25 USD nets sur janvier–août. MNQ apporte 1 464 USD et MGC 418 USD. Le moteur calcule correctement les flux contrôlés ; une perte n'est pas automatiquement une erreur de calcul ni une entrée identifiable comme mauvaise avant son résultat. La priorité est de mieux caractériser les faux retests et leur coût, avec les seuls indices disponibles avant entrée. Augmenter la mise ou accumuler des confirmations non calibrées n'est pas une amélioration démontrée.

Le nouveau filtre MES de marge nette 1,5, déjà calculé au Jeu 41, améliore le total normal mais dégrade le total stress et plusieurs mois. Il n'est pas retenu. Son seuil ne doit pas être déplacé après lecture pour sauver le résultat.

## Sources contrôlées

- Rapport 40 : 329 827 octets, SHA `fd57be160b7fd20f60449f13f379da138687acc1174f2c01d25889c7475fa6b0`.
- Trades 40 : 557 662 octets, SHA `63f9f1e819e3affff761a3ae4e3ad12bb3a5e2eb43ee91f125ace5c22dd006ff`, rapproché de l'empreinte attendue avant les agrégations de refus.
- Rapport 41 existant : 700 142 octets, SHA `57126d9f313c03b63e73be2e531a07670e2cd62d1b04fe49467e45f297f6b559`.
- Trades 41 existants : 1 073 114 octets, SHA `06db6f39fae5c0009b5e55da69310863fe4f8eb03b2d6cd2ea530d2749e9516c`.
- Audit descriptif déjà figé : `trading/lab/jeu41-entry-audit.json`, 232 trades contrôlés, aucune nouvelle simulation.
- Instructions, catalogue, `RESEARCH_LESSONS.md`, `ASSOCIATE_METHOD_2026-09-10.md`, `MODEL_METHODS_AND_SEASONS.md`, `JEU41_RESEARCH.md`, politiques 19/22/23/24/26/29/31/33/34/37/40 et moteur 40.

## Profils réellement exécutés dans la référence

Ces profils sont des règles de laboratoire désactivées pour les ordres, et non quatre modèles entraînés autonomes.

| Marché | Déclenchement exact | Filtre supplémentaire obligatoire | Entrée et stop | Cible et statut |
|---|---|---|---|---|
| MNQ, micro Nasdaq | Range des six M5 cash 09:30–10:00 New York ; clôture au moins un tick hors du range ; retest ultérieur sous six bougies/30 minutes, mèche touchant le niveau et clôture directionnelle toujours hors du range | Aucun filtre H1, EMA, VWAP, RSI, structure, volume ou score ajouté à l'admission de la référence | À l'ouverture M5 qui suit la confirmation clôturée, jusqu'à 12:00 inclus ; ouverture doit encore être hors du range. Stop un tick au-delà de l'extrême de la bougie de retest | Stop fixe et 2R brut ; pas de break-even ni suivi de tendance en sortie |
| MES, micro S&P 500 | Même cassure puis retest que MNQ | RSI Wilder 14 connu : refuser achat >70, vente <30. Les égalités 70/30 passent ; ce n'est pas une divergence | Même entrée à l'ouverture suivante et même stop structurel | 2R brut. Candidat 41 ajoute seulement net gain/planned loss ≥1,5 ; il est non retenu |
| MGC, micro or | Cassure clôturée du même range cash ; première clôture strictement réintégrée dans le range sous 30 minutes, bougie dans le sens du retournement | Nouvelle entrée strictement avant 11:00 New York ; pas de divergence RSI obligatoire | Ouverture suivante strictement dans le range. Stop un tick au-delà de l'extrême de toute l'excursion, réintégration comprise | 2R brut dans le moteur courant ; pas de break-even. L'ancien plafond à l'autre bord du range n'est plus la cible exécutée |
| MYM, micro Dow | Profil historique de cassure/retest conservé | Toutes les entrées sont supprimées avant la référence courante | Aucun trade 40/41 | Exclu de la recherche courante, historique conservé ; zéro trade ne signifie pas rentabilité nulle mesurée |

Précision temporelle : la première entrée est normalement 10:10 au plus tôt, car il faut une bougie clôturée de cassure après le range puis une bougie ultérieure de confirmation. Le moteur accepte un horodatage à partir de 10:00 mais le générateur n'émet pas de retest instantané.

**Preuves code :** `jeu23-signals.mjs::admissionSignals`, `jeu26-signals.mjs::failedBreakoutSignals`, `jeu31-filters.mjs::assessMarketFilter`, `jeu40-diagnostic.mjs::filtered40`, `jeu37-risk.mjs::confidenceSizedTerms`, `jeu40-engine.mjs::simulateConfidencePortfolio`.

### Deux étiquettes historiques à ne pas interpréter trop vite

1. `jeu29-policy.mjs` appelle encore MNQ/MYM « protection » avec origine Jeu 28. Le moteur exécuté 40 met `breakEvenAt:null` et ne déplace pas le stop. L'étiquette d'origine ne décrit pas la gestion actuelle.
2. `failedBreakoutTerms` calcule une ancienne cible limitée au bord opposé. `confidenceSizedTerms` en conserve les contrôles de cohérence/ouverture/stop, puis recalcule une cible 2R pour tous. Il laisse aussi une ancienne raison `netReward` être réévaluée selon le 2R courant. Ce comportement est la règle publiée de la référence ; il ne faut pas le « réparer » en silence ni attribuer au MGC une cible plafonnée qui n'est pas utilisée.

## Ce qui est commun : compte, risque et exécution

- Nouveau compte simulé 50 000 USD chaque mois ; seuil initial de perte 48 000, réserve d'admission 100 USD. Le solde nominal de 50K n'est pas la marge de perte disponible.
- Risque planifié maximal 100 USD **coûts inclus**, réduit à 50 % ou 25 % si la marge au seuil devient inférieure à 1 000 ou 500 USD. Une récupération du risque exige aussi le retour du compte à son capital initial. Le score de signal ne commande pas ces réductions.
- Quantité entière `min(20, floor(cap / (risque unitaire au stop + coût unitaire)))`. Le risque effectivement pris est souvent inférieur au plafond : moyenne 79,47 USD au normal.
- Deux entrées par jour maximum, une seule position commune, une exécution par marché et sens/jour. Refuser un candidat n'en consomme pas le quota. La priorité simultanée est alphabétique MES, MGC, MNQ, MYM ; elle n'est pas un classement de qualité.
- Budget interne quotidien 200 USD ; freins de pertes et réserve au seuil. Sortie au stop/2R ou à l'ouverture de la M5 située 15 minutes avant la clôture de séance (15:45 sur séance complète). Pas de détention nocturne.
- Si stop et cible sont touchés dans la même M5, le stop est pris en premier ; gaps défavorables réalisés à l'ouverture. Une position existante occupe tout le créneau M5, même si elle sort à son ouverture.
- Coûts hypothétiques par contrat et aller-retour : commission 2,50 USD + deux ticks de glissement au total. Donc MNQ 3,50 ; MES 5 ; MGC 4,50 ; MYM 3,50 USD. Le stress double ensemble frais et glissement et modifie également les admissions/quantités.
- Retraits simulés : conditions spécifiques 5 journées ≥150 USD, fraction de profit et plafonds ; 1 000 EUR personnel distinct de 4 000 USD de PnL. Conversion fixe 1,1652 USD/EUR, partage 90 %, frais de transfert et fiscalité non modélisés. Compte « funded » courant : la consistency 50 % du modèle d'évaluation n'est pas appliquée comme si nous étions encore en évaluation.
- Le drawdown affiché est une baisse réalisée mensuelle, pas le pire flottant intratrade ni un drawdown de compte continu sur huit mois.

## La méthode de l'appel et la méthode mesurée diffèrent

La méthode décrite oralement privilégie H1 20/50, réactions sur pivots/Daily Open, ranges Asia/London, MSS et parfois divergence RSI/FVG M15/M30/nuage personnel. La référence mesurée travaille un range cash américain et deux patterns d'ouverture.

Les EMA9/21 M5, VWAP cash, structure de pivots confirmés 2+2, RSI directionnel, volume relatif à la même heure sur cinq séances passées et formes de bougies **existent dans le code**. `contextDecision` fournit cinq vérifications ; `confidenceGrade` les compte. Dans `fixed100`, `desiredRisk` renvoie le plafond fixe même si score faible/incomplet : ces éléments sont journalisés, pas cinq feux obligatoires. `trendClosedAt` du signal correspond à la clôture du range d'ouverture ; ce nom ne prouve pas un biais H1.

Les données validées actuelles sont cash : Daily Open 18h, niveaux Asia/London et pivots de séance complète ne peuvent pas être reconstitués honnêtement. Cela n'empêche pas de rechercher une autre méthode ; il faut la nommer et la mesurer comme une autre méthode. Diego a explicitement levé l'obligation de reproduire exactement ses associés.

## Où se trouvent les faiblesses observées

Janvier–août, 164/166 séances, février et mars partiels ; contributions dans **le même portefeuille**, pas performances autonomes de chaque marché.

| Marché | Trades | Gagnants/perdants | Net normal USD | Gain moyen de tous trades | Net stress USD |
|---|---:|---:|---:|---:|---:|
| MNQ | 52 | 25 / 27 | 1 464 | 28,15 | 897 |
| MES | 44 | 17 / 27 | 41,25 | 0,94 | 35 |
| MGC | 26 | 11 / 15 | 418 | 16,08 | 222 |
| Portefeuille | 122 | 53 / 69 | 1 923,25 | 15,76 | 1 154 |

- MES : solde brut 576,25, coûts 535 USD. Les coûts absorbent 92,84 % du **solde brut agrégé**, pas 92,84 % de chaque gain. Quantité moyenne 2,43 contrats ; coûts moyens 12,16 USD par trade. Le taux de réussite 38,64 % laisse une marge très faible face au gain moyen 126,03 et à la perte moyenne 77,82.
- 27 des 69 pertes surviennent dans la M5 d'entrée : MNQ 14/27 pertes ; MES 9/27 ; MGC 4/15. Ce sont des sorties entre 0 et 5 minutes, pas des stops instantanés prouvés. L'ordre intrabougie détaillé n'est pas connu.
- MES avant 11h vaut +478,75 sur 20 trades ; après vaut −437,50 sur 24. MES ventes −338,75 sur 23 ; achats +380 sur 21. Ces coupes ont été observées après résultat : elles orientent une question, ne justifient pas d'interdire maintenant les ventes ou la fin de matinée.
- Refus normaux après filtres : 85 pour risque unitaire trop élevé (54 MGC, 29 MNQ, 2 MES), 28 occupation, 21 limite par sens, 12 simultanéité, **seulement 8 plafond quotidien de trades**. Tous ne sont pas des gains manqués ; certains sont des pertes évitées. Relever arbitrairement « deux trades/jour » ne traite pas la principale limitation constatée.

### Pourquoi 4K ne peut pas se résoudre avec une simple retouche

Les effectifs mensuels normaux sont 17, 10, 11, 16, 20, 16, 21 et 11. Avec risque planifié ≤100 coûts compris, la cible 2R produit moins de 200 USD nets pour un gagnant. Au nombre de trades inchangé, sept mois sur huit restent sous 4 000 même dans le scénario théorique où tous les trades gagnent ; le mois à 20 reste strictement sous 4 000 à cause des coûts. Ce plafond arithmétique n'est pas un backtest contrefactuel.

La fréquence actuelle moyenne est 15,25 trades/mois et l'espérance observée 15,76 USD/trade, soit 240,41 USD/mois. Augmenter la fréquence doit ajouter des trades dont l'espérance nette est positive ; multiplier le risque multiplie aussi la sensibilité aux pertes et au seuil du compte, avec d'autres admissions possibles.

## Ce que le Jeu 41 vient réellement de montrer

Les sorties existantes indiquent : référence 1 923,25 → candidat MES 2 337 USD normal ; 1 154 → 807,75 stress. Moyennes mensuelles 240,41 →292,13 normal, 144,25 →100,97 stress. Le critère exigeait non-dégradation nette et du drawdown dans 16 cellules : il échoue. En particulier juillet stress 164→−303,50. Aucune sélection, aucune activation, aucun objectif/retrait.

La marge de frais est une faiblesse réelle, mais un filtre qui paraît économiquement raisonnable peut retirer les bons trades et réorganiser les admissions des autres marchés. Garder ce résultat négatif est une information ; modifier aussitôt 1,5 en un autre chiffre serait apprendre le passé par ajustements successifs.

## Cinq axes concrets, hiérarchisés

### 1. MES : distinguer les faux retests avant l'entrée

Prochaine question de recherche : est-ce que l'entrée arrive après une extension excessive, ou avec un stop qui se trouve encore dans le bruit ordinaire ? Annoter **tous** gagnants/perdants et signaux refusés avec distance entrée–niveau, largeur du range, taille du rejet et distance du stop, rapportées à une volatilité calculée seulement sur des bougies déjà clôturées. Distinguer l'extension de cassure du retour sur niveau, et le sens. L'ATR existe déjà ; la nouveauté éventuelle serait son utilisation dans le diagnostic de géométrie des retests, pas la découverte de l'indicateur. Ne pas remplacer immédiatement le stop structurel par un stop ATR : cette famille de changements a déjà été étudiée auparavant.

Puis fixer **une seule hypothèse** et ses définitions avant un futur essai ; comparer au même risque/coûts/2R, compter gagnants supprimés, pertes évitées et nouvelles admissions. Aucun seuil chiffré n'est sélectionné dans cette note. Les mêmes mois restent du développement. Le coût1,5 du Jeu41 n'est pas retesté ni ajusté.

### 2. MNQ : comprendre les stops dans les cinq premières minutes sans retarder toutes les entrées

MNQ est la meilleure contribution actuelle mais 14 de ses 27 pertes touchent le stop sur la M5 d'entrée. Examiner la distance relative au niveau, le rejet et la volatilité préalable peut distinguer un vrai défaut de placement d'une perte normale. Les données M5 ne permettent pas de décider après coup « attendre quelques secondes » ni « le marché repartait juste après » avec une séquence d'exécution certaine. Si des données intraminute gratuites et autorisées sont déjà présentes, leur provenance et complétude doivent être auditées avant usage ; aucun achat ou collecte nouvelle implicite.

Le délai uniforme d'une M5 a déjà retiré les sept MNQ de juin, dont six gagnants (Jeu36). Ne pas le reproposer. L'objectif est une information d'entrée propre à un mécanisme précis, pas l'ajout automatique d'une bougie d'attente ou d'un score supérieur.

### 3. Mesurer les coûts et la robustesse d'exécution avant d'augmenter le risque

Rapprocher les commissions supposées d'un barème confirmé lorsque le produit/compte est choisi ; distinguer frais fixes, glissement et quantité. La présente simulation suppose un glissement constant au tick, sans spread observé, carnet, latence ou remplissage partiel. Doubler tout donne un stress utile mais ne remplace pas ces mesures. Les journaux doivent séparer refus de donnée, signal, coûts, risque, occupation et quota afin que « mauvaise entrée » ait un sens causal.

Préserver et rendre visibles les cas stop/cible simultanés et les sorties dans la M5. Le rapport ne doit pas les convertir en séquences certaines. Cette amélioration renforce la fiabilité de mesure, sans promettre un surplus de gain.

### 4. Auditer l'allocation commune avant d'ajouter des trades ou d'enlever un marché

Le premier marché alphabétique peut bloquer le suivant dans un créneau ; retirer MES ne donne pas simplement 1 923,25−41,25, car MNQ/MGC pourraient être admis à sa place. Le Jeu41 montre précisément ce phénomène. Commencer par l'attribution existante des refus et admissions, avec preuve qu'un concurrent était effectivement admissible avant les mouvements futurs. Ne pas appeler les 54 refus MGC pour risque trop élevé « 54 occasions rentables ».

La priorité et les quotas n'ont pas à être choisis sur les marchés qui ont gagné dans le passé. Une politique d'allocation fondée sur une information pré-entrée vérifiable, puis comparée sous un protocole unique, serait une expérience distincte. MGC doit rester un témoin inchangé tant que son très faible effectif ne permet pas mieux ; MYM n'est pas réactivé pour créer artificiellement de la fréquence.

### 5. Séparer qualité du diagnostic et confirmation sur des données nouvelles

Uniformiser la préparation dans un **futur** protocole explicite : janvier–mai commence sans décembre ; juin/juillet réutilisent mai ; août conserve une préparation historique particulière. Contexte cash transporté entre jours, remise à zéro aux trous/rolls et comparaison de cinq séances demandent une traçabilité. Ne pas recalculer les témoins gelés pour lisser ces limites. Deux journées manquantes restent nulles et barrées, pas zéro ou gagnantes.

Registre94 / catalogue111 après ajout de la seule nouvelle configuration41 ; zéro confirmation indépendante. Ne pas supprimer un août défavorable ni en déduire une saisonnalité annuelle. Préserver la collecte prospective et l'échéance du3décembre. Figer à l'avance une courte liste d'hypothèses, tenir un journal de raisons d'échec, puis évaluer sur des observations qui n'ont pas servi à choisir les règles. Les préfixes prouvent une propriété de causalité des replays, pas la rentabilité future.

## Ce qui ne constitue pas une nouvelle solution à essayer maintenant

- « Plus de confirmations donc plus de risque » : Jeux24/25/37, score non calibré, répétition interdite comme promesse.
- « Tenir jusqu'à3R » : extensions MNQ/MGC rejetées au Jeu35 ; des gagnants2R sont devenus perdants.
- « Une bougie M5 supplémentaire » : Jeu36 rejeté, notamment les gagnants MNQ perdus.
- « MNQ seulement avant11h » : Jeu39 rejeté, juin et drawdown stress dégradés.
- « Veto Kronos directionnel » : Jeu39 rejeté ; trois OHLC invalides parmi43 prévisions, aucun avantage de portefeuille établi.
- « Structure opposée + obstacle pivot » : Jeu38 n'a changé aucun trade ; les signaux bloqués étaient déjà refusés au risque.
- « EMA9/21 H1 et M5 obligatoires » : Jeu32 déjà étudié/rejeté ; ce n'est pas la méthode H1 20/50 exacte de l'appel.
- « Extraire la formule gagnante des poids téléchargés » : seul Kronos-mini/tokenizer/code est dans le pack vérifié, pas Kronos-small/FFM. La normalisation des fenêtres et représentation du temps peuvent informer des diagnostics ; les poids ne constituent pas un catalogue de stratégies lisibles. Le score K1 de prévision n'est pas un winrate de trading. Les documents RSI/news ne sont pas des flux/détecteurs exécutables ajoutés à la référence.

## Décision recommandée

Conserver la référence de recherche inchangée, clore/publier le résultat complet du Jeu41 non retenu, puis proposer un seul diagnostic de géométrie des retests MES/MNQ avec données pré-entrée, sans lancer une recherche de seuils dans cette analyse. La première amélioration de produit est une fiche explicable par trade : signal observé, stop et risque, coût, contrôles obligatoires, contexte informatif, raison d'admission/refus et incertitude. Elle permet à Diego de comprendre une perte conforme, un défaut de données et une vraie erreur d'implémentation sans confondre ces catégories.


## Sources primaires pour cadrer les améliorations

Le [CME explique le dimensionnement à partir du stop et du budget de risque](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size). Le stop doit correspondre à une invalidation logique, en tenant compte des mouvements ordinaires du marché. Nous reprenons ce principe ; ses pourcentages génériques sur le capital nominal ne sont pas transposés au compte prop50K et à son seuil de perte.

L’étude de [Bailey, Borwein, López de Prado et Zhu sur le surajustement des backtests](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf) explique pourquoi multiplier les essais sur le même historique augmente le risque de sélectionner une réussite fortuite. Notre catalogue n’est pas une estimation calculée de cette probabilité, et94configurations ne sont pas94preuves indépendantes.

La [NFA décrit les limites des performances hypothétiques](https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9), dont le bénéfice du recul et l’écart possible avec l’exécution réelle. Ces références cadrent la méthode d’évaluation ; elles ne valident aucun profil Nykuto.

[Bilan Jeu41](./JEU41_RESULTS.md) · [Calendrier conservé](./#historyCalendarGame) · [Leçons](./RESEARCH_LESSONS.md).
