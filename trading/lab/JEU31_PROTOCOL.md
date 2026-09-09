# Jeu 31 — filtres indépendants MES et MGC

Définition du 9 septembre 2026, avant le nouveau calcul. Diego demande d’améliorer le bot et d’effectuer les tests maintenant après l’import des trois dossiers. Le protocole, le filtre, le runner et les tests sont commités et gelés avant performance.

## Origine des hypothèses

L’audit précédent a déjà montré des pertes sur les rares MES pris en extrême RSI et une différence horaire sur MGC. Les dossiers RSI/price action rappellent de séparer forme, momentum et régime ; la survente n’est pas un achat automatique. Ces observations motivent un test spécifique au marché. Elles ne sont pas indépendantes des données évaluées.

Trois nouvelles configurations et une référence, sans balayage de seuils :

| Variante | MES | MGC | MNQ / MYM |
| --- | --- | --- | --- |
| Référence | Jeu 23 | Jeu 26 | Jeu 28 |
| MES RSI | Refuser achat si RSI >70, vente si RSI <30 ; refuser RSI inconnu | Inchangé | Inchangés |
| MGC matin | Inchangé | Refuser toute nouvelle entrée à partir de 11 h New York | Inchangés |
| Ensemble | Filtre MES RSI | Filtre MGC matin | Inchangés |

Les valeurs exactes 30 et 70 restent admises. RSI 14 Wilder, non arrondi, sur la dernière bougie 5 minutes close, issu du contexte gelé Jeu 24 ; il conserve sa convention 50 si gains et pertes sont nuls. Données préparatoires limitées à janvier–avril et août, comme l’audit RSI. Réinitialisation après coupure/changement de contrat. Le filtre horaire regarde l’heure d’entrée, pas l’heure de sortie ; les positions MGC déjà ouvertes restent gérées normalement après 11 h. Une entrée à 10 h 55 est admise, à 11 h refusée, avec conversion New York tenant compte du changement d’heure.

Ces filtres ne génèrent pas de nouveau motif et ne vendent pas automatiquement en surachat. MNQ conserve ses achats éventuellement supérieurs à 70 ; son audit n’appuyait pas la même suppression. Le catalogue de connaissances fournit une base de formulation, pas une probabilité de gain.

## Exécution et données

Les quatre flux de signaux sont recalculés depuis les données privées Jeux 19/14. Appliquer les filtres avant de rejouer intégralement les moteurs Jeux 29/30, jamais en retirant simplement des trades d’une liste de résultats. Un signal refusé ne consomme ni sens, ni entrée quotidienne, ni risque. La capacité libérée peut admettre un autre marché ; son effet sera attribué séparément.

Une seule position, un microcontrat, deux entrées quotidiennes, 150 USD par trade frais compris, enveloppe quotidienne 300 USD et réserve 100 USD : règles historiques inchangées. Priorité alphabétique MES/MGC/MNQ/MYM, occupation de toute la bougie de sortie, stops/targets, protection +1R et freins inchangés. Coûts initiaux et doublés intégralement rejoués. Il s’agit du modèle de compte historique, sans certification des règles commerciales actuelles d’une prop firm.

Janvier–février, mars–avril, diagnostic janvier–avril et août sont évalués séparément. Le compte continu 25K est simulé uniquement pour août entièrement couvert ; janvier–avril reste un diagnostic avec séances incomplètes explicitement exclues en commun. Les semaines ne remettent jamais le solde à zéro. Aucun calcul mai–juillet ni septembre. Août a déjà été consommé par les recherches précédentes ; aucune réserve fraîche ni confirmation indépendante.

## Mesures et décision fixées

Publier net, trades, gains/pertes/zéros, taux de réussite, PF et drawdown réalisés, frais, contributions des quatre marchés, refus de filtre et refus du moteur. Les candidats rejetés avant simulation ne sont pas nécessairement des trades évités. Comparer aux trades réellement exécutés par la référence : gagnants et perdants absents, nouvelles entrées, changements de sorties communes. Réconcilier leur somme avec la différence de résultat. Fournir les jours et semaines d’août pour toutes les variantes, coûts et modes.

Une piste ne sera présentée comme améliorant ce diagnostic que si janvier–février, mars–avril et août ont chacun un net strictement positif aux deux coûts, si août au compte n’augmente pas le drawdown par rapport à sa référence aux deux coûts et n’a pas franchi son seuil, avec au moins 40 trades janvier–avril et 12 dans chacune des deux fenêtres. Ce filtre de recherche ne qualifie aucune exécution et la couverture développement reste incomplète. Si ces critères échouent, conserver le résultat négatif sans modifier les paramètres après lecture.

La référence doit reproduire exactement les trades, jours, décisions et résultats privés Jeux 29/30. Vérifier causalité RSI par préfixes aux signaux affectés, invariance des replays par fin de séance et réconciliation des agrégats. Les tests synthétiques des bornes et du budget précèdent performance. Ajouter les trois essais au registre (67 →70), en conservant les 67 précédents. Prix et décisions individuels restent privés ; seuls code, empreintes et agrégats sont publiés. Aucune activation Live/Paper/Shadow, aucun ordre, flux nouveau, abonnement ou modification des collectes.

Références : [audit RSI](RSI_ZONES_RESULTS.md), [audit marchés](MARKET_AUDIT_RESULTS.md), [connaissances importées](../knowledge/INTEGRATION_AUDIT.md), [Fidelity RSI](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/RSI).
