# Jeu 40 — Janvier à août, journées manquantes explicites

Statut au gel : préparé, aucune performance de cette extension calculée. Diego demande huit mois avec la même référence et autorise explicitement de barrer uniquement les jours manquants, sans bloquer les autres journées du mois.

## Paramètres autoritatifs

Le tableau ci-dessous est généré depuis les politiques de code et vérifié à l’identique avant gel et exécution. Il ne remplace pas les sources détaillées figées. Aucune nouvelle règle de trading ou prévision de modèle.

<!-- POLICY40:START -->
| Paramètre | Valeur figée |
| --- | --- |
| Début inclus | 2026-01-01 |
| Fin exclue | 2026-09-01 |
| Séances attendues | 166 |
| Séances communes disponibles | 164 |
| Relectures | 16 |
| Compte initial USD | 50000 |
| Profil | fixed100 |
| Risque maximal par trade USD | 100 |
| Limite de perte journalière USD | 200 |
| Trades maximum par jour | 2 |
| Positions simultanées maximum | 1 |
| Cible R | 2 |
| Micros maximum | 20 |
| Réinitialisation | new-account-each-month |
| Marché exclu | MYM |
| Objectif mensuel USD | 4000 |
| Objectif personnel EUR | 1000 |
| Change USD par EUR | 1.1652 |
| Part du trader | 0.9 |
| Continuer après objectif personnel | true |
| Activation autorisée | false |
<!-- POLICY40:END -->

## Données et calendrier fixés avant résultat

Les fichiers privés Jeu 19 et MNQ Jeu 14 sont réutilisés sans modification, avec leurs tailles et empreintes exactes. Les comptes témoins viennent des exécutions privées Jeu 37 `fixed100`. Les reprises ponctuelles du fournisseur confirment les mêmes trous ; elles sont conservées comme preuves, jamais utilisées pour inventer des bougies.

Couverture commune : 164 séances sur 166 attendues. Janvier 20/20, février 18/19, mars 21/22, avril 21/21, mai 20/20, juin 21/21, juillet 22/22, août 21/21. MYM reste exclu des signaux mais sa bande de prix est conservée pour les mêmes contrôles de synchronisation du moteur.

Deux journées exclues de l’exécution sur tous les marchés, pour garder un portefeuille synchronisé :

- 25 février 2026 : MGCJ6 manque 20 ouvertures M5 entre 13:05 et 14:40 New York ; la couverture des horaires est également insuffisante. Une réouverture est indiquée à 14:45, sans attestation complète permettant de remplacer les intervalles absents.
- 6 mars 2026 : MNQH6 et MESH6 manquent dix ouvertures M5 entre 10:05 et 10:50 ; MGCJ6 en manque sept entre 10:05 et 10:35 New York.

Ces dates apparaissent barrées, avec résultat journalier `null` et mention de données manquantes ou non correspondantes. Les jours disponibles de février et mars restent calculés. Le compte conserve son état d’une journée disponible à la suivante : cela représente une **pause forcée aux dates exclues**, pas le résultat inconnu qu’aurait produit le bot ces jours-là. Aucun remplacement par zéro, interpolation, contrat différent ou exclusion selon le PnL.

## Préparation et fidélité aux témoins

Janvier à mai utilisent les contextes calculés depuis le 1er janvier par les fonctions existantes, avec réinitialisation après un trou propre au marché ou un changement de contrat. Décembre n’est pas ajouté : cela demanderait une autre convention. Au démarrage de janvier, un RSI inconnu continue à refuser les entrées MES selon la règle existante ; cette chauffe est une limite explicitement conservée.

Juin et juillet conservent leur préparation historique depuis mai ; août conserve sa coupure historique particulière du Jeu 37. Cette convention non uniforme est conservée pour vérifier six témoins entiers identiques. On ne prétend pas tester une chauffe uniforme sur huit mois.

Le moteur est une copie documentée du Jeu 37 dont seule la borne des dates autorisées et son message d’erreur changent. Un test exige l’identité du reste du fichier. Les profils, frais, arrondis, tailles, stops, sorties, limites, hypothèses de change et retraits restent inchangés. Les anciens fichiers gelés ne sont pas modifiés.

## Campagne bornée

Une configuration d’extension de période, aucune nouvelle stratégie : huit comptes mensuels funded 50K réinitialisés, référence `fixed100`, coûts normaux et doublés, soit 16 relectures dont six témoins exacts estivaux. Les dix autres relectures portent sur janvier–mai, avec février et mars partiels. Aucune nouvelle inférence, aucun ajustement de seuil, aucune optimisation de risque ou sélection après résultat.

Tous les mois sont rétrospectifs, déjà utilisés ou exposés à la recherche. Ce bilan n’est pas une validation indépendante. Les périodes de réserve historiques et la collecte prospective Jeu 08 conservent leur statut ; le rendez-vous du 3 décembre n’est pas modifié.

## Moyennes et bilan

Publier les huit résultats mensuels observés, les jours couverts/exclus, les coûts, trades, gagnants/perdants, moyennes, drawdowns réalisés, contributions par marché, objectifs/retraits, journées et semaines.

- Résultat total observé = somme des huit comptes mensuels simulés sur les journées disponibles.
- Moyenne mensuelle observée = ce total divisé par huit, avec mention visible « deux mois partiels ».
- Moyenne par trade = total net / nombre total de trades ; taux de réussite = total des gagnants / total des trades. Pas de moyenne non pondérée des taux mensuels.
- Publier aussi médiane mensuelle, pire mois, nombre de mois négatifs et pire drawdown mensuel. La somme de comptes réinitialisés n’est pas la trajectoire ni le drawdown d’un compte continu.
- Le résultat et la moyenne de **huit mois entièrement couverts** restent inconnus. Les journées exclues ne prouvent ni un gain ni une perte nuls.

Il n’y a pas de critère qui adopte automatiquement une nouvelle stratégie : la règle est inchangée, sélection nulle, confirmation indépendante fausse et exécution interdite. Une moyenne favorable ne démontre pas 4 000 USD chaque mois ni 1 000 EUR retirés.

## Contrôles et conservation

Avant performance : vérifier le gel commité, toutes ses dépendances, le tableau de paramètres, les sources et les reprises fournisseur. Refuser tout écrasement de sortie existante. Pendant l’unique campagne : vérifier les six témoins JSON entiers et reconstruire filtres et comptes sur tous les préfixes de journées disponibles, sans lecture future.

```bash
node scripts/build-trading-jeu40.mjs /CHEMIN_PRIVE/jeu40-bundle.js
node scripts/run-trading-jeu40.mjs /CHEMIN_PRIVE/sources /CHEMIN_PRIVE/jeu37 /CHEMIN_PRIVE/source-probes.json /CHEMIN_PRIVE/jeu40
```

Archiver rapport et exécutions privés, plus preuves fournisseur, sous un nouveau préfixe Jeu 40 avec manifeste hashé et relecture exacte. Publier seulement agrégats, bilan et leçons, puis calendrier par jeu. Ajouter une configuration exécutée au registre après succès réel, conserver toutes les anciennes ; ce n’est pas un nouvel avantage de trading. Préserver les modèles, RSI/news et tous les travaux concurrents. Aucun achat, abonnement, compte, broker, ordre, Paper/Shadow ou merge main. Vérifier tests pertinents, build, hygiène, Functions, CI et déploiement du même commit avant d’annoncer la publication.
