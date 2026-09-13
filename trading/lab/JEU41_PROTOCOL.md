# Jeu 41 — Marge nette des entrées MES

Statut au gel : préparé, aucune performance de cette règle calculée. Une seule campagne est autorisée ; aucune optimisation de seuil après résultat.

## Constat préalable

L’audit des 232 trades existants du Jeu40 ne détecte aucun nouvel écart de prix, multiplicateur, quantité, frais, net, stop, cible, solde ou chronologie. Il ne faut pas appeler une perte conforme une erreur de calcul. Le profil MES a la plus faible contribution active sur huit mois : 44 trades normaux, 17 gagnants/27 perdants, brut576,25 USD moins535 USD de coûts, net41,25 USD. Les coûts absorbent92,84% de ce solde brut ; cela ne signifie pas92,84% de chaque trade. Les stops étroits conduisent au dimensionnement de plusieurs micros, avec leurs coûts linéaires.

Les sous-groupes MES après11h et ventes sont également faibles dans l’audit descriptif, mais ils ne sont pas transformés en filtres dans cette campagne. Les découpages, le choix de MES et l’hypothèse sont informés par des données déjà vues. Voir `jeu41-entry-audit.json` et `JEU41_RESEARCH.md`.

## Règle unique et paramètres générés

La référence est le Jeu40, donc Jeu37 fixed100, identique sur janvier–août. La variante `mes-net15` refuse seulement les signaux MES dont le rapport entre le gain net à la cible et la perte planifiée frais compris est strictement inférieur à1,5. L’égalité est acceptée. Le minimum du moteur de référence reste1.

Soit R le risque de prix en USD, C le coût aller-retour simulé : ratio = (2R−C)/(R+C). La nouvelle condition équivaut à R≥5C. Comparer des cents entiers pour éviter une frontière flottante. Ce ratio est invariant à la quantité avec les coûts linéaires conservés. Il n’est ni un taux de réussite ni une espérance de profit.

<!-- POLICY41:START -->
| Paramètre | Valeur figée |
| --- | --- |
| Début inclus | 2026-01-01 |
| Fin exclue | 2026-09-01 |
| Marché du nouveau veto | MES |
| Minimum gain net / perte prévue | 1.5 |
| Risque de prix minimal / coûts | 5 |
| Cible brute R | 2 |
| Risque maximal USD | 100 |
| Limite journalière USD | 200 |
| Compte initial USD | 50000 |
| Réinitialisation | new-account-each-month |
| Séances attendues | 166 |
| Séances disponibles | 164 |
| Relectures | 32 |
| Témoins exacts | 16 |
| Préfixes compte / filtre / contexte | 656 / 656 / 656 |
| Nouvelle configuration | 1 |
| Activation autorisée | false |
<!-- POLICY41:END -->

L’entrée considérée est l’ouverture M5 suivant le signal clôturé. Son prix d’ouverture est disponible au moment de l’admission. Les high/low/close de cette nouvelle M5 ne sont jamais utilisés pour le veto. Un stop invalide reste traité par le moteur historique, sans créer une autre règle. Le filtre se place avant les contrôles du compte et ne consomme ni position, ni sens, ni quota quotidien.

Pour MES, les coûts unitaires historiques sont5 USD normaux et10 USD doublés ; la condition correspond à un stop structurel éloigné d’au moins5/10points. On n’élargit aucun stop pour faire passer une entrée. On ne change ni cible brute2R, ni taille, ni plafonds de100/200USD, ni réserve, ni frein, ni priorités. MNQ et MGC gardent leurs règles, MYM reste exclu. Les effets indirects sur les admissions des autres marchés doivent être publiés.

## Données, comptes et périmètre

Huit comptes mensuels funded50K réinitialisés, janvier à août2026. Coûts normaux et doublés, référence et une variante :32 relectures, dont16 témoins Jeu40 JSON entiers identiques. Aucun modèle, entraînement, donnée nouvelle ou activation.

Même préparation que le Jeu40, y compris la chauffe janvier–mai depuis janvier, juin/juillet depuis mai et le chemin historique particulier d’août. Les fonctions de préparation sont reprises exactement ; un test exige leur identité. Les seules journées exclues restent25février et6mars, tous marchés conjointement. Couverture164/166. Les autres journées de ces mois restent calculées ; pauses forcées, calendriers `null` et moyennes observées sur huit mois partiels explicitement conservés.

Toutes les données sont rétrospectives et déjà vues. Aucune réserve indépendante n’est ouverte ; collecte Jeu08 et rendez-vous du3décembre intacts. Sources vérifiées par tailles/SHA, sorties existantes jamais écrasées. Le gel et toutes les dépendances doivent être publiés avant le premier résultat de variante.

## Critère descriptif fixé

Comparer chacune des16 cellules mois×coût à sa référence : net non inférieur, drawdown réalisé non supérieur, aucun compte dépassant sa limite, et amélioration stricte du net dans au moins une cellule. Publier aussi les dégradations isolées si la moyenne s’améliore. Même si ce critère passe : sélection automatique nulle, confirmation indépendante fausse, activation interdite. Ce test ne garantit ni4Kmensuels ni retrait personnel.

Pour chaque variante et coût : mois, marchés, trades/gagnants/perdants, moyenne, drawdown, objectifs/retraits, journées/semaines. Rapprocher les gagnants retirés, perdants évités, nouvelles admissions et changements des trades communs. Un signal refusé n’est pas nécessairement une perte évitée. Vérifier656 préfixes chronologiques de contextes, filtres et comptes chacun.

## Exécution et conservation

```bash
node scripts/build-trading-jeu41.mjs /CHEMIN_PRIVE/jeu41-bundle.js
node scripts/run-trading-jeu41.mjs /CHEMIN_PRIVE/sources /CHEMIN_PRIVE/jeu40 /CHEMIN_PRIVE/jeu41
```

Une configuration exécutée ajoutée seulement après succès. Archiver rapport, runs privés et audit existant sous un nouveau préfixe Jeu41, avec manifeste hashé et relecture exacte. Publier uniquement agrégats, bilan, leçons et calendrier. Préserver tous les anciens protocoles/gels/résultats, modèles/RSI/news et travaux concurrents. Aucun achat, compte, abonnement, broker, ordre, Paper/Shadow ou merge main. Tests pertinents, build, hygiène,25Functions, CI et déploiement du même commit avant annonce finale.
