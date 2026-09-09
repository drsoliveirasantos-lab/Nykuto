# Apports des trois dossiers à Nykuto

Comparaison du 9 septembre 2026 avec le commit `991db96eb85522e0006fc070f26f8076add47781` (PR 91). Ce périmètre est la branche de recherche examinée, pas une preuve que toutes ses modifications sont déjà déployées sur trading.nykuto.com.

## Verdict

Oui, ces dossiers apportent des connaissances utiles. Ils approfondissent des éléments déjà calculés et ajoutent une documentation qui manquait. Ils ne contiennent ni modèle entraîné, ni flux d’actualités actif, ni preuve d’amélioration de rentabilité.

| Domaine | Présent avant l’import | Apport des dossiers | Après cette intégration |
| --- | --- | --- | --- |
| RSI 14, Wilder, 30/50/70 | Calcul du graphique ; RSI directionnel du Jeu 24 ; audit 30/70 de la PR 91 | Formules, limites, trajectoire, durée en zone et distinction entre présence et franchissement | Fiches sourcées reliées à la lecture ; calculs conservés |
| Divergences régulières/cachées et failure swings | Aucun détecteur dans le module Analyse examiné | Définitions, contre-exemples et protocoles candidats | Connaissances consultables ; aucun motif déclaré détecté |
| StochRSI, Connors RSI, ADX | Non calculés dans le module Analyse examiné | Distinctions entre indicateurs, unités et limites | Références documentaires ; aucun nouveau calcul |
| HH/HL/LH/LL, pivots et BOS/MSS | Pivots stricts 2/2, confirmation différée et ruptures par clôture | Égalités, pivots ambigus, swings consolidés, structure protégée et CHOCH | Définitions comparées ; les conventions du graphique ne sont pas remplacées |
| Englobantes, doji, marteau et longue mèche | Détecteurs descriptifs du graphique et variantes des recherches antérieures | Corps versus outside bar, variantes strictes/tolérantes et contexte | Fiches pertinentes jointes aux observations existantes |
| Figures supplémentaires et FVG | Pas de détection complète dans le module Analyse | Catalogue de 43 concepts, figures rares et spécifications parfois incomplètes | Consultation et préparation de futurs tests ; aucun déclencheur |
| Actualités et calendrier | Jeu 10 : dates historiques CPI, emploi et FOMC, filtre par journée | 77 ressources, hiérarchie des sources, révisions, consensus, horodatage et pertinence par marché | Annuaire et cours interrogeables ; aucun fournisseur connecté |
| Qualité, causalité, coûts et risque global | Nombreux contrôles déjà présents dans le Lab et son superviseur de risque | Documentation commune et cas limites supplémentaires | Règles du moteur conservées ; connaissances et décisions séparées |

Éléments du code examinés : `../analysis/structure-core.mjs`, `../analysis/chart-indicators.mjs`, `../lab/jeu24-context.mjs`, `../lab/rsi-zones.mjs`, `../lab/confluence-policy.mjs`, `../lab/confluence-engine.mjs`, `../lab/account-risk-supervisor.mjs` et leurs protocoles. L’absence d’un détecteur est relative à ce code, pas à une prétendue connaissance interne d’un modèle de langage.

## Contenu ajouté

- 56 fiches RSI/tendances et 43 concepts de bougies/structure : **99 fiches de concepts**. Ce nombre ne signifie pas 99 nouvelles stratégies.
- 77 fiches de ressources de veille, toutes désactivées.
- 18 sections du cours de bougies, 10 sections du rapport news et une politique de lecture : **205 entrées documentaires** au total.
- 135 références qualifiées par dossier, correspondant à 128 URL distinctes après normalisation du slash final. Ce ne sont pas 128 producteurs indépendants.
- 6 hypothèses RSI désactivées, 18 spécifications de charts et **84 cas d’acceptation proposés** : 24 RSI, 36 price action, 24 news. Leur conservation ne signifie pas que ces 84 cas ont été exécutés contre tous les détecteurs ou fournisseurs.

Les 23 documents JSON, JSONL et Markdown retenus sont conservés sans réécriture, avec empreintes et provenance dans `import-manifest.json`. Les présentations HTML redondantes et contrôles propres aux exports initiaux ne sont pas copiés. Les trois ZIP fournis restent les archives originales. `catalogue.json` est un index dérivé reproductible, explicitement distinct des sources.

## Différences de définition résolues explicitement

1. **RSI sur série plate :** le dossier RSI propose une valeur indisponible lorsque les deux moyennes sont nulles. Le graphique et le Jeu 24 utilisent la convention 50. Cette convention reste inchangée et apparaît sur la fiche K04. Une valeur 50 ne prouve ni une série plate ni un marché sans tendance.
2. **Englobantes :** le graphique admet une frontière égale et exige au moins une frontière strictement dépassée. Il est associé à la variante `BODY_ENGULF_BOUNDARY_V1`, sans substitution par la variante stricte ou l’outside bar. Les exigences de contexte de la fiche ne sont pas toutes des critères du détecteur actuel.
3. **BOS/MSS et CHOCH :** le dossier propose une structure protégée et d’autres règles de swing. Le graphique conserve ses définitions documentées ; un MSS potentiel n’est pas automatiquement renommé CHOCH.
4. **Marteau et étoile filante :** le moteur détecte une forme. Les conditions de tendance préalable décrites dans le cours ne deviennent pas des observations numériques par simple consultation.
5. **News « shadow-only » :** cette valeur appartient à une proposition de politique. L’import ne démarre aucun mode Shadow, aucune collecte et aucun ordre.

## Utilisation effective

`/knowledge/` recherche les concepts, exemples, cours et ressources. Chaque fiche conserve son texte, ses limites et les identifiants de sources préfixés par dossier pour éviter la collision entre les multiples `S01`.

Le module `/analysis/` appelle réellement `explainAnalysis` après chaque sélection valide de bougies. Il joint les fiches RSI, pivots et formes pertinentes aux observations déjà calculées. La zone RSI utilise la valeur non arrondie. Le texte ne prétend pas détecter une divergence absente du moteur. La base est vérifiée par empreinte avant utilisation ; une erreur retire les anciennes fiches et conserve la lecture numérique. Une réponse documentaire arrivée après un changement de sélection ne remplace pas la sélection récente.

`knowledgeContext` fournit aux futurs consommateurs un objet avec références, limites, règles de lecture, version et interdiction d’exécution. **Aucun appel à un modèle IA, entraînement, index vectoriel ou assistant distant n’est ajouté.** Le consommateur raccordé ici est l’analyse descriptive existante. La simple présence des cours ne modifie pas le moteur automatique de stratégie.

## Vérification des sources et limites

Vérifications ponctuelles lors de l’intégration : [Fidelity RSI](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI), [TradingView sur le repainting](https://www.tradingview.com/pine-script-docs/concepts/repainting/) et [calendrier FOMC de la Fed](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm). Elles corroborent les distinctions centrales entre oscillateur/tendance, donnée provisoire/confirmée et calendrier officiel. Leurs articles ne sont pas recopiés.

Le reste du registre conserve le statut de la recherche fournie : aucune nouvelle vérification exhaustive des 135 références, aucun audit de Discord privé, aucun test d’abonnement ou de latence. Les offres commerciales, horaires et droits devront être vérifiés au moment d’activer un fournisseur. Les nouvelles ne sont pas connues à partir d’une simple liste de sites.

Les prochaines expérimentations doivent définir séparément le marché, le sens, les paramètres et la confirmation, puis comparer à stratégie identique avec coûts. Le registre des 67 essais et les résultats historiques existants restent intacts. Aucun nouveau bénéfice ou taux de réussite n’est calculé dans cette intégration.


## Contrôles de l’intégration

Six tests ciblés couvrent la reproduction des imports, les références et statuts,
la recherche dans les trois dossiers, les bornes RSI, les divergences de définition,
les fichiers altérés, le rendu textuel sans exécution de contenu et les réponses
asynchrones obsolètes. Les identifiants HTML de l’analyse sont conservés et
22 références locales des deux pages sont vérifiées. Aucun fichier du Lab
ni du registre historique n’est modifié. Le contrôle d’interface utilise un
DOM simulé et une inspection statique ; aucun test visuel de navigateur n’est revendiqué.

Validation locale complète : **277 tests trading réussis, zéro échec** ; hygiène sans erreur ni avertissement, 25 modules Functions validés et build réussi. Le build commercial exclut le site Trading, qui possède son déploiement distinct.
