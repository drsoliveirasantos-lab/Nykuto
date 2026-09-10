# Jeu42 — Activité du retour après cassure MES

Statut au gel : préparé, aucune performance de cette règle calculée. Une seule campagne. Ce protocole historique ne sera pas réécrit après résultats ; le bilan attestera ensuite l'exécution.

## Règle unique

Référence Jeu40, donc Jeu37 fixed100, janvier–août2026. La variante `mes-pullback-volume` ajoute un veto MES avant le moteur de compte. Elle ne reprend pas le ratio1,5 rejeté du Jeu41.

L'événement est ancré sur le `breakoutAt` fourni par le générateur historique : clôture de sa bougie de cassure, sans recherche rétrospective d'une autre cassure. Considérer seulement les bougies M5 strictement entre cette bougie et la bougie de confirmation, donc ouvertures `breakoutAt <= time < signalOpen`. Parmi elles, sélectionner celles strictement opposées au sens du signal : close<open pour un achat, close>open pour une vente. Exclure les dojis et la bougie de confirmation.

Le contexte historique fournit pour chaque bougie son volume relatif : volume divisé par le volume moyen à la même minute sur les cinq séances complètes précédentes, selon la préparation40 inchangée. Arrondir chaque ratio à un millionième (`Math.round(ratio*1000000)`), puis comparer des sommes entières BigInt. Refuser si somme des volumes relatifs arrondis du retour >= nombre de bougies de retour × volume relatif arrondi de la cassure. L'égalité est refusée. Aucune moyenne glissante de performances ni seuil sélectionné après résultat.

Sans bougie opposée distincte, ou si le volume relatif de cassure/retour est indisponible, ou si celui de la cassure est nul après arrondi : conserver la décision de référence et journaliser le motif non observable. Une donnée malformée/non causale provoque une erreur ; elle n'est jamais assimilée à une simple absence de contexte. Le volume de confirmation est journalisé mais n'intervient jamais dans l'admission.

<!-- POLICY42:START -->
| Paramètre | Valeur figée |
| --- | --- |
| Début inclus | 2026-01-01 |
| Fin exclue | 2026-09-01 |
| Marché du nouveau veto | MES |
| Séances de volume de référence | 5 |
| Précision du volume relatif | 1000000 |
| Sélection des bougies de retour | strictly-counterdirectional-bars-after-breakout-before-confirmation |
| Veto | mean-rounded-pullback-relative-volume-greater-than-or-equal-to-rounded-breakout-relative-volume |
| Volume manquant | keep-reference-and-label-unobservable |
| Volume de confirmation | diagnostic-only |
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
<!-- POLICY42:END -->

## Invariants

Entrée à l'ouverture M5 suivante selon la référence, stop structurel inchangé, 2R, plafond100USD coûts inclus, budget200USD/jour, mêmes quantités/ordre de priorité/quota/réserve/freins et retraits simulés. MNQ et MGC inchangés ; MYM exclu. Le filtre ne lit jamais les high/low/close/volume de la M5 d'entrée ni de bougies ultérieures. Les distances entrée–niveau/stop et largeur du range sont seulement diagnostiques.

Compte50K funded supposé déjà qualifié, neuf chaque mois. Objectif4000USD de PnL distinct du versement personnel1000EUR selon les hypothèses historiques. Aucun ordre, activation, achat, compte, abonnement ou merge main.

## Période, contrôle et décision

Janvier à août2026, huit mois × deux coûts × deux profils =32relectures, dont16témoins JSON entiers identiques aux archives40. Même préparation `contexts40`/`filtered40` issue de `jeu41-preparation.mjs`, elle-même identique au gel40. Sources vérifiées par tailles/SHA ; aucun résultat existant écrasé. Le gel et toutes ses dépendances sont publiés avant calcul.

Couverture164/166 ; seules dates exclues conjointement25février et6mars, affichées barrées et nulles, jamais zéro ou inventées. Février/mars partiels. Les huit mois sont déjà vus et servent au développement. CollecteJeu08 et rendez-vous3décembre inchangés.

Critère descriptif : net non dégradé et drawdown réalisé mensuel non accru dans chacune des16cellules mois×coût, aucun dépassement du compte, amélioration stricte du net dans au moins une. Même en cas de réussite : sélection nulle, aucune confirmation indépendante ou activation. Aucun seuil modifié si échec ou absence d'effet.

Contrôler656préfixes chronologiques de compte, filtre et contexte chacun. Publier net/mois/coût/marché, effectif, gains/pertes/moyenne, drawdown, objectifs/retraits, journées/semaines et motifs observables/non observables. Rapprocher gagnants retirés, perdants évités, nouvelles admissions et trades communs ; distinguer veto direct et effets de portefeuille.

## Exécution et conservation

```bash
node scripts/build-trading-jeu42.mjs /CHEMIN_PRIVE/jeu42-bundle.js
node scripts/run-trading-jeu42.mjs /CHEMIN_PRIVE/sources /CHEMIN_PRIVE/jeu40 /CHEMIN_PRIVE/jeu42
```

Exécuter depuis le commit publié du gel. Les chemins privés sont hors checkout. Après succès réel, ajouter une configuration au registre/catalogue sans modifier les anciennes ; archiver rapport et runs sous un préfixeJeu42 neuf avec manifeste hashé et relecture exacte. Publier agrégats/bilan/leçons/calendrier sur la branche trading et PR83. Vérifier tests pertinents, build, hygiène,25Functions, CI et déploiement du même commit avant annonce. Tous anciens protocoles/gels/résultats et travaux concurrents sont conservés.
