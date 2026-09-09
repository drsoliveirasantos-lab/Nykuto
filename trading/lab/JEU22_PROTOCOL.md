# Jeu 22 — cassure et retour sur la zone d’ouverture

Protocole jeu22-opening-retest-v1, fixé avant les performances. Après les huit comparaisons du Jeu 19, une correction au Jeu 20 et quatre comparaisons au Jeu 21, ce jeu ajoute quatre essais : une même nouvelle règle sur MNQ, MES, MYM et MGC. Total cumulé de cette reprise : 17 configurations. Aucun balayage de paramètres.

## Hypothèse et règles d’entrée

L’ancienne famille EMA/ATR ne qualifie pas de candidate ; les stops ATR de tous les signaux MGC dépassent le risque autorisé. Une structure de prix intrajournalière peut fournir un autre contexte d’entrée et un niveau d’invalidation observé, sans agrandir le budget. Ceci est une hypothèse à tester, pas une propriété rentable annoncée.

- Zone d’ouverture : plus haut et plus bas des six bougies 5 minutes complètes de 09:30 à 10:00, heure New York.
- Cassure : clôture d’une bougie ultérieure au moins un tick au-dessus du haut (Long) ou au-dessous du bas (Short).
- Retour : dans les six bougies suivantes (30 minutes), une autre bougie touche le niveau cassé puis clôture à l’extérieur de la zone avec un corps orienté dans le sens de la cassure. Une clôture revenue dans la zone ou un délai dépassé annule l’attente ; une nouvelle clôture extérieure peut réarmer une cassure.
- Entrée à l’ouverture de la bougie suivante, au plus tard à 12:00 ; refus si cette ouverture revient dans la zone. Une bougie ne peut pas être à la fois la cassure initiale et son retour.
- Stop : un tick au-delà de la mèche du retour. Le risque est calculé depuis l’ouverture réellement observée, sans déplacer ce niveau pour faire accepter le trade. Refus si le stop est du mauvais côté, hors tick ou trop éloigné.
- Cible : 1,5 fois la distance du stop, arrondie au tick inférieur comme auparavant ; rapport gain/risque net minimal 1. Un seul signal par sens et par séance, même si refusé à l’exécution : au plus deux occasions/jour. Aucun signal réutilisé pendant une position.

Aucun indicateur ou historique antérieur n’est nécessaire pour cette famille : les six bougies d’ouverture suffisent à sa préparation. Les séances de prix restent intégralement vérifiées ; aucun cours ou calendrier manquant n’est remplacé. Les séances incomplètes rendent la fenêtre non qualifiable. Aucun prix n’est raccordé entre échéances.

## Risque, exécution et verdict

Une unité du microcontrat ; risque maximum 50 USD frais compris, limite quotidienne 100 USD, réserve 100 USD, seuil du compte et cohérence inchangés (Jeu 15). Coût conservateur hypothétique : 2,50 USD aller-retour plus un tick par côté ; stress = double de tout ce coût. Le stop est prioritaire lorsque stop et cible sont touchés dans la même bougie, les gaps sont exécutés au premier prix défavorable disponible, sortie avant la fermeture selon le moteur précédent.

Janvier–février puis mars–avril 2026 servent au développement. Les huit critères de sélection restent : couverture complète des deux fenêtres, ≥40 trades totaux, ≥12 par fenêtre, chaque fenêtre positive en R et USD, PF en R ≥1,1, drawdown ≤8R, total positif aux coûts doublés et absence de violation des comptes complets. Classement : pire espérance par fenêtre, drawdown, ordre MNQ/MES/MYM/MGC. Une sélection éventuelle est gelée avant calcul de mai–juin puis juillet–août. Aucun deuxième choix après ouverture de cette réserve.

Toutes ces dates ont déjà contribué à la recherche sur d’autres méthodes ou marchés. Les résultats constituent du développement rétrospectif ; independent=false et confirmed=false restent obligatoires, même si les seuils passent. Une confirmation opérationnelle exige de nouvelles observations indépendantes. Le code et les paramètres ne sont pas retouchés après résultats.

## Produits et limites vérifiés

Le 9 septembre 2026, la [liste officielle Lucid](https://support.lucidtrading.com/en/articles/11508978-approved-products-and-commissions) inclut MNQ, MES, MYM et MGC. Les commissions affichées par côté sont 0,50 USD pour les trois indices et 0,80 USD pour MGC ; le coût de 2,50 USD aller-retour conservé ici est une hypothèse prudente, pas leur tarif exact. Le [contrat CME 1OZ](https://www.cmegroup.com/education/lessons/1-ounce-gold-futures-product-overview) représente une once, avec un tick de 0,25 USD, mais ne figure pas dans cette liste Lucid : il n’est pas ajouté aux essais destinés à ce compte. Les contrats mini, plus grands, n’améliorent pas l’adéquation au plafond de risque.

Sources privées identiques aux Jeux 14/19, avec SHA-256 vérifiés. La préparation et le moteur sont audités sur des préfixes sans bougies futures et des cas synthétiques significatifs avant gel. Aucun ordre, Paper Bot, Shadow, broker ou flux live activé.
