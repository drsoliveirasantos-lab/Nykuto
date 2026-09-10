# Mémoire de recherche — Nykuto Trading

Dernière revue : 10 septembre 2026. Lire ce document, le catalogue et les derniers bilans avant de proposer une nouvelle expérience. Cette mémoire conserve les constats et les règles de travail du projet ; elle ne correspond pas à un réentraînement automatique des poids de ChatGPT ou de Kronos.

## État à conserver

- Référence de recherche : Jeu 37 `fixed100`, cibles 2R, portefeuille sans MYM, profils MES/MGC/MNQ conservés. Bot réel, Paper et Shadow désactivés.
- Objectif étudié : 4 000 USD de PnL mensuel. Objectif personnel distinct : premier versement simulé équivalent à 1 000 EUR. Compte 50K neuf chaque mois, pas un été continu.
- 92 configurations dans le registre, 109 clés dans le catalogue croisé, **zéro confirmation indépendante**. Le Jeu 38 ajoute une configuration non retenue ; le Jeu 39 en ajoute deux, également non retenues.
- Le modèle Kronos-mini téléchargé est expérimental : K1 ne bat pas la prévision constante ; aucune adoption comme filtre ou modèle entraîné sur notre stratégie.

## Leçons et preuves

| ID | Nature | Constat vérifié | Règle à appliquer | Preuve |
|---|---|---|---|---|
| L01 | Erreur corrigée | La préparation multihorizon écartait des séances disponibles : neuf MYM récupérées, couverture 166/166 ; MES 144→162, MGC 96→145. | Séparer les trous réels de la préparation, contrôler les changements de contrat. Ne jamais fabriquer les bougies manquantes. | [Jeu 20](./JEU20_RESULTS.md), [Jeu 21](./JEU21_RESULTS.md) |
| L02 | Erreur de continuité corrigée | Une branche de recherche manquait à la reprise ; le numéro 27 désignait deux expériences. Audit du site renommé F1, clés dédoublonnées. | Lire les deux historiques et le catalogue avant de qualifier une idée de nouvelle. | [Synthèse](./RESEARCH_SYNTHESIS_2026-09-09.md), [catalogue](./research-catalog.json) |
| L03 | Priorité et explication à corriger | Le Jeu 37 changeait les montants et le cycle du compte, pas la qualité des signaux de juillet. | Une nouvelle capacité logicielle n’est pas un avantage de trading démontré. Tester les entrées à risque et sortie constants. | [Protocole 37](./JEU37_PROTOCOL.md) |
| L04 | Résultat négatif | À 100 $, juillet gagne 176 $ mais MNQ perd 228 $. MES +315 $ et MGC +89 $ compensent. 21 trades, huit gagnants. | Diagnostiquer le marché et le setup, sans dire que tous les marchés sont mauvais ni sélectionner les gagnants après coup. | [Audit chiffré](./research-learning-audit.json) |
| L05 | Hypothèse non validée | Le score du Jeu 25 avait déjà échoué. Aucun 5/5 exécuté sous 100 $ au Jeu 37 ; un seul 5/5 sous gradué 500, perdant. | Ne pas traduire le nombre de confirmations en probabilité ou en forte taille sans calibration indépendante. Un seul perdant ne prouve pas non plus l’inutilité du score. | [Jeu 25](./JEU25_RESULTS.md), [Jeu 37](./JEU37_RESULTS.md) |
| L06 | Hypothèse rejetée | Fixe 500 : +4 365,75 / −200,75 / −909 $ normaux ; juin stress +3 823,50 $. Le risque supérieur admet aussi d’autres trades. | Ne pas régler le risque pour atteindre un revenu exigé. Garder distincts plafond par trade, limite quotidienne, marge au seuil et occupation. | [Jeu 37](./JEU37_RESULTS.md) |
| L07 | Hypothèse rejetée | Attendre une M5 supplémentaire supprime les sept MNQ de juin, dont six gagnants. L’entrée devient souvent trop loin du stop pour un microcontrat. | Une entrée plus tardive n’est pas automatiquement meilleure. Compter les gagnants perdus et les refus de risque, pas seulement les pertes évitées. | [Jeu 36](./JEU36_RESULTS.md) |
| L08 | Hypothèses rejetées | MNQ à 3R transforme trois gagnants 2R en perdants. MGC à 3R dégrade juillet et sa baisse maximale. Réentrées et protection à 1R ont aussi déjà échoué dans l’autre historique. | Ne pas proposer « tenir plus longtemps », réentrée ou break-even comme solutions universelles. Toute variante doit préciser la différence avec les essais précédents. | [Jeu 35](./JEU35_RESULTS.md), [synthèse des deux branches](./RESEARCH_SYNTHESIS_2026-09-09.md) |
| L09 | Limite de fidélité | Les essais historiques utilisent notamment EMA9/21, un range cash et des filtres RSI. L’appel décrit H1 20/50, réactions aux niveaux, sessions et divergences. | Ne pas annoncer que le moteur teste exactement la méthode des associés. Ne pas assimiler RSI30/70 à une divergence, ni une ouverture cash au Daily Open18h. | [Audit de la transcription](./ASSOCIATE_METHOD_2026-09-10.md) |
| L10 | Limite statistique | Les mêmes mois ont été réutilisés ; une amélioration sur un marché ne constitue pas une confirmation. Exclure MYM améliore juin/août mais dégrade juillet. | Fixer règles et critères avant calcul, conserver tous les rejets, puis confirmer sur de nouvelles observations. Une journée gagnante ne valide pas un revenu mensuel. | [Jeu 34](./JEU34_RESULTS.md), [registre](./research-ledger.json) |
| L11 | Limite du modèle externe | Kronos-mini : MAE 78,9543 points contre 67,875 pour la dernière clôture constante, et deux prévisions OHLC incohérentes sur 24 fenêtres. | Un modèle téléchargé et exécuté n’est pas un bot profitable ni un apprentissage acquis. Exiger un témoin simple et la validité des sorties. | [Diagnostic K1](../models/PROTOCOL.md), [registre modèle](../models/registry.json) |
| L12 | Réussite technique, pas financière | Les moteurs vérifient prix, coûts, causalité, marge, soldes et retraits. Les témoins et calendriers se rapprochent. | Conserver ces contrôles ; ne jamais présenter les tests logiciels comme des preuves de rentabilité. | [Jeu 37](./JEU37_RESULTS.md), tests du dépôt |

## Pourquoi 4 000 $ ne sont pas atteints régulièrement

| Mesure, référence 100 $ normale | Juin | Juillet | Août |
|---|---:|---:|---:|
| Trades | 16 | 21 | 11 |
| Gagnants / perdants | 11 / 5 | 8 / 13 | 3 / 8 |
| Taux de réussite observé | 68,75 % | 38,10 % | 27,27 % |
| Gain moyen des gagnants | 133,64 $ | 141,44 $ | 148,17 $ |
| Perte moyenne | −84,25 $ | −73,50 $ | −86,25 $ |
| Moyenne de tous les trades | 65,55 $ | 8,38 $ | −22,32 $ |
| Bénéfice net | 1 048,75 $ | 176 $ | −245,50 $ |
| Moyenne nécessaire pour 4 000 $ au même nombre de trades | 250 $ | 190,48 $ | 363,64 $ |
| Pertes dans la bougie M5 d’entrée | 3 sur 5 | 3 sur 13 | 5 sur 8 |

La proportion de perdants augmente fortement alors que les gagnants rapportent davantage en moyenne. Le problème ne se réduit donc pas à une cible trop courte. Sur 26 pertes, 25 touchent le stop et une sort en fin de séance. Garder une position après son stop changerait le risque et la règle d’invalidation.

En juillet, aucun des treize trades indices n’a un contexte incomplet : l’absence de préparation n’explique pas ce mois. En août, deux trades indices ont un contexte incomplet, tous deux perdants, mais cet effectif ne suffit pas à valider un filtre général. Août est déjà négatif avant les coûts : −96 $ brut, auxquels s’ajoutent 149,50 $ de frais/glissement simulés. Les données M5 ne donnent pas l’instant exact d’une sortie intrabougie.

Notre audit n’a pas trouvé de nouvelle erreur arithmétique expliquant ces pertes. Cela ne certifie pas l’absence de tout bug ; les conclusions portent sur les contrôles réalisés. Une perte conforme aux règles n’est pas automatiquement une erreur reconnaissable avant l’entrée.

## Ce qui reste utile

MES juillet et MGC sur ces trois petits échantillons contribuent positivement. Le filtre RSI MES, la fenêtre horaire MGC, les stops structurels et la cible 2R constituent une référence documentée ; leur conservation ne vaut pas qualification. Les effectifs MGC sont seulement 2, 8 et 1 trades par mois. Préserver les profils utiles permet de tester une correction ciblée sans tout modifier simultanément.

Le dimensionnement part du stop et du budget de perte, conformément au principe expliqué par le [CME](https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size). Les pourcentages génériques de capital ne doivent pas être appliqués sans tenir compte du seuil de perte spécifique au compte prop. La [NFA rappelle les limites des résultats hypothétiques](https://www.nfa.futures.org/rulebooksql/rules.aspx?RuleID=9025&Section=9), notamment le bénéfice du recul et les différences de liquidité/glissement. Ces sources n’attestent pas l’efficacité de notre stratégie.

## Résultat du test après audit et limites de la mémoire

[Jeu 38 exécuté](./JEU38_RESULTS.md) : veto MNQ seulement lorsque structure M5 explicitement opposée et pivot confirmé avant la cible se cumulent. La campagne prévue de 12 relectures est terminée : six témoins exacts, 256 préfixes du compte et 256 du filtre. Aucun changement des trades, du net ou du drawdown dans les six cellules. Deux signaux d’août sont filtrés, mais ils étaient déjà refusés pour risque planifié excessif. Le filtre échoue donc à l’exigence d’au moins une amélioration stricte ; il n’est pas retenu.

**L13 — Un signal bloqué n’est pas une perte évitée.** Vérifier si le moteur aurait réellement exécuté ce signal, puis compter les gagnants retirés, perdants évités et nouvelles admissions. Ici : zéro dans les trois catégories. Aucun seuil n’est élargi après lecture pour produire artificiellement un effet. Le protocole original conserve son statut de préparation au moment du gel ; le bilan séparé atteste l’exécution ultérieure.

Les mois déjà vus restent du développement. La collecte prospective et son audit du 3 décembre sont conservés pour de nouvelles observations ; ils ne doivent pas être recyclés comme une réserve vierge après consultation. Cette campagne bornée est close, sans boucle d’optimisation.

Cette mémoire améliore la continuité des décisions du projet et oblige les prochaines reprises à consulter les échecs. Elle ne garantit ni que ChatGPT sera réentraîné par cette conversation, ni que le bot produira 4 000 $ chaque mois.

## Contrôle conservé de la préparation avant performance

La revue de préparation du Jeu 38 a détecté deux défauts avant toute performance : le nouveau test unitaire manquait à la première liste de fichiers à figer, et les préfixes quotidiens ne reconstruisaient pas encore le filtre. Les deux sont corrigés dans le gel publié : 49 fichiers, dont le test du filtre, et reconstruction/comparaison des décisions pour chaque préfixe. Les 236 tests logiciels passent ; build, hygiène et 25 modules Functions sont validés. Les 493 identifiants HTML précédents sont conservés parmi 495. Ces vérifications ne chiffrent pas la rentabilité du nouveau filtre.


## Jeu 39 — Ce que les horaires et le modèle changent réellement

Diego autorise désormais des propositions issues de recherches et du diagnostic du bot, sans obligation de reproduire exactement ses associés. Chaque idée conserve un protocole borné ; cette autonomie ne permet pas de modifier les seuils après résultat ou d’activer une stratégie.

- **L13 — Un meilleur juillet ne suffit pas.** MNQ avant11h retire3gagnants et7perdants aux coûts normaux. Net juin758,75 contre1 048,75 ; juillet426,50 contre176 ; août−31 contre−245,50. Juin à coûts doublés dégrade aussi le drawdown145→222. Le filtre ne passe pas les six cellules ; ne pas le présenter comme optimal ni déplacer maintenant11h vers10h45.
- **L14 — Modèle réellement appliqué, avantage non établi.** Kronos-mini a produit43prévisions pour49signaux. Trois OHLC invalides, sans erreur d’inférence ; le filtre s’abstient. Il supprime4gagnants et5perdants en normal, puis permet une entrée MGC perdante en août. Juin et août normal se dégradent. Prévision correcte, signal filtré et gain de portefeuille sont trois mesures distinctes.
- **L15 — Une erreur de protocole reste une erreur.** Le texte gelé indiquait top-p0 alors que code, politique et pack publiés fixaient0,9. Valeur exécutée0,9. Le conflit a été détecté après résultat et déclaré, sans modification rétroactive ou répétition de la campagne. Le prochain gel doit contrôler la concordance des paramètres textuels avec sa politique ; un SHA prouve une identité de fichier, pas sa justesse sémantique.
- **L16 — Auto-évaluer ne signifie pas auto-promouvoir.** `research-self-review.mjs` conserve les raisons d’échec sur les six cellules. Sélection nulle, poids inchangés, aucune activation, même si une cellule est meilleure. Une évaluation logicielle n’est pas une validation indépendante de performance.

[Résultats complets](./JEU39_RESULTS.md), [recherche préalable](./JEU39_RESEARCH.md), [audit avec écart déclaré](./jeu39-execution-audit.json). Les92/109configurations ne sont pas92/109observations indépendantes. Les18relectures sont closes, les quatre fichiers privés archivés et relus exactement. Aucune réaffectation de la collecteJeu08 ou du rendez-vous du3décembre. Prochaine priorité : qualité des sorties et latence mesurée, puis données réellement réservées à un protocole futur ; aucun nouveau test implicite.

## Jeu 40 — Élargir la période sans inventer les journées absentes

- **L17 — Une journée absente ne bloque pas nécessairement le mois.** Diego autorise de barrer seulement les dates manquantes. Les 25 février et 6 mars restent `null` ; les autres dates sont calculées avec une pause forcée du compte pendant ces trous. Février et mars sont explicitement partiels. Le résultat inconnu de ces jours n’est jamais un zéro observé.
- **L18 — Une moyenne positive ne signifie pas 4 000 USD chaque mois.** Sur 164/166 séances, le total normal est de 1 923,25 USD et la moyenne observée sur huit mois de 240,41 USD ; coûts doublés : 1 154 / 144,25 USD. Aucun objectif ou retrait obtenu. Mars, mai et août perdent ; un unique août n’établit pas une saisonnalité. Le pire drawdown mensuel est en mai, 730,25 USD. Ne pas augmenter le risque pour masquer cette insuffisance.
- **L19 — Inspecter une méthode interne ne valide pas un modèle décideur.** La correction de Diego précise qu’il cherchait des mécanismes réutilisables dans les bots téléchargés. La normalisation passée et la représentation du temps sont des pistes identifiées ; leur valeur marginale n’est pas démontrée ici. Les poids ne sont pas un catalogue de règles gagnantes. Le Jeu 40 ne lance aucune inférence.
- **L20 — Prévenir les incohérences de protocole dans le code.** Le tableau des paramètres est généré depuis les politiques d’exécution et vérifié avant gel et calcul ; un test rejette une divergence de risque. Cela corrige le risque documentaire observé au Jeu 39, sans réécrire son gel historique ni prétendre améliorer le PnL.
- **L21 — Mesurer la sensibilité des admissions aux frais.** Le doublement des coûts réduit le total et change aussi les tailles et trades admissibles (122 vers 110). Janvier passe de 511 à 48 USD. Les contributions d’un marché dans le portefeuille ne prédisent pas le résultat de son retrait : les créneaux libérés pourraient admettre d’autres trades.

[Bilan du Jeu 40](./JEU40_RESULTS.md) : une extension de période exécutée, zéro nouvelle stratégie, 16 relectures, six témoins entiers identiques et 328 préfixes compte/filtre/contexte. Aucun gagnant supprimé ni nouvelle admission sur les témoins estivaux ; gains et pertes des deux jours absents inconnus. Trois fichiers privés archivés et reconstruits exactement. Registre93/catalogue110, zéro confirmation indépendante, sélection nulle et aucune activation. Les moyennes complètes et le drawdown continu restent inconnus. La préparation historique non uniforme et les petits effectifs restent des limites. Aucun nouvel essai implicite, aucune modification de la collecte Jeu08 ou du 3 décembre.
