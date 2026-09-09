# Jeu 25 — résultats du risque gradué

Calcul unique du 9 septembre 2026, après gel et commit du protocole et du code.

**Quatre configurations rejetées, aucune sélection, réserve mai–août non calculée.** Une seule politique graduée par marché : 50 USD si le contexte est faible ou incomplet, 75 USD si 3–4 familles concordent, 150 USD si les 5 concordent. Un microcontrat, limite quotidienne fixe 300 USD, stop structurel inchangé.

## Résultats janvier–avril 2026

| Marché | Trades normaux | Net normal USD | Trades stress | Net stress USD | Témoin constant 150 USD, normal | Drawdown constant → gradué USD |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| MNQ | 16 | +98.50 | 14 | +71.50 | +887.50 | 369.00 → 219.00 |
| MES | 20 | -70.00 | 6 | -8.75 | -206.25 | 471.25 → 168.75 |
| MYM | 36 | -303.00 | 19 | -369.50 | -288.50 | 367.50 → 382.00 |
| MGC | 10 | +137.00 | 5 | +131.00 | -370.00 | 772.50 → 139.00 |

Les témoins sont les résultats archivés du Jeu 23 à plafond 150 USD, mêmes frais et enveloppe quotidienne 300 USD. Aucune simulation témoin n’a été refaite. Les coûts doublés modifient aussi les entrées admissibles et le ratio gain/risque net : une perte stress peut donc être moins forte tout en comportant moins de trades.

L’or passe de −370 à +137 USD et réduit son drawdown sur ces observations. Le S&P 500 réduit sa perte mais reste négatif. Le Nasdaq réduit son drawdown mais abandonne une grande partie du gain du témoin ; le Dow Jones perd davantage. Cela ne démontre pas une amélioration générale ni une confiance calibrée.

## Chaque fenêtre reste visible

| Marché | Janvier–février : trades / net USD | Mars–avril : trades / net USD | Échecs de qualification |
| --- | --- | --- | --- |
| MNQ | 7 / +154.50 | 9 / -56.00 | Deux fenêtres entièrement couvertes ; Au moins 40 trades au total ; Au moins 12 trades par fenêtre ; Chaque fenêtre positive en R et dollars ; Aucun franchissement du seuil dans les comptes complets |
| MES | 13 / +82.50 | 7 / -152.50 | Deux fenêtres entièrement couvertes ; Au moins 40 trades au total ; Au moins 12 trades par fenêtre ; Chaque fenêtre positive en R et dollars ; Profit factor en R au moins 1,10 ; Total positif en R et dollars avec coûts doublés ; Aucun franchissement du seuil dans les comptes complets |
| MYM | 18 / -129.50 | 18 / -173.50 | Au moins 40 trades au total ; Chaque fenêtre positive en R et dollars ; Profit factor en R au moins 1,10 ; Drawdown réalisé au plus 8 R ; Total positif en R et dollars avec coûts doublés |
| MGC | 7 / +141.50 | 3 / -4.50 | Deux fenêtres entièrement couvertes ; Au moins 40 trades au total ; Au moins 12 trades par fenêtre ; Chaque fenêtre positive en R et dollars ; Aucun franchissement du seuil dans les comptes complets |

Aucun marché n’atteint 40 trades totaux. La seconde fenêtre est négative dans les quatre cas ; MYM dépasse aussi le drawdown maximal en R. Les couvertures restent MNQ/MES 81/82, MYM 82/82, MGC 80/82 séances de développement. Les lacunes du 6 mars et du 25 février MGC restent bloquantes, sans bougie fabriquée ni exclusion déclarée complète.

## Signaux et plafonds

| Marché | Signaux au plafond 50 | Au plafond 75 | Au plafond 150 | Préparation insuffisante, incluse dans 50 |
| --- | ---: | ---: | ---: | ---: |
| MNQ | 20 | 33 | 1 | 12 |
| MES | 23 | 16 | 2 | 16 |
| MYM | 25 | 36 | 1 | 6 |
| MGC | 34 | 16 | 2 | 15 |

Ces groupes décrivent la même politique. Les six signaux au plafond élevé ne donnent pas six trades exécutés : d’autres conditions d’entrée peuvent encore refuser une opération et une entrée antérieure peut avoir consommé le même sens. Le rapport conserve aussi trades, net et risque prévu moyen pour chacun des niveaux, sans nouvelle recherche de seuils après résultats.

## Pourquoi des gains identiques apparaissaient au Jeu 24

Vérification directe des transactions privées archivées, sans relancer les simulations : MYM conserve exactement le même trade aux plafonds 50, 75, 100 et 150 USD. Le +44,50 USD est un unique résultat historique comparé sous quatre règles, pas quatre gains distincts ni quatre confirmations. MES conserve les mêmes deux trades aux plafonds 75, 100 et 150 USD, d’où le même −22,50 USD.

La taille reste un microcontrat. Un plafond autorisé plus haut ne change ni l’entrée, ni le stop structurel, ni la cible d’un trade déjà admissible. Les résultats identiques réapparaissent donc légitimement. Le Lab rend cette distinction explicite et affiche le risque prévu moyen à côté du plafond.

## Traçabilité

- Gel SHA-256 `1b8758d5364c68d4e2058c49a18c9347e4c4340b8439cc24ce79622441ee2b4d` : 74 fichiers et dépendances inchangés après performance.
- Sélection nulle SHA-256 `889af7db797ffe54ba0bed8fa2990a238ac856ef5dd99e45a2f83b140f9e6c18`.
- Audits : 37362 préfixes de signaux, 323 de contexte, 320 de comptes ; 32 comparaisons au témoin constant et 32 au filtre strict archivés.
- Registre : 53 configurations des Jeux 19–25. Les deux témoins ne sont pas recomptés. Aucune confirmation indépendante sur ces dates déjà vues ou corrélées.
- 181 tests logiciels réussis, dont cinq tests du risque gradué et deux du rapport/interface. Ces tests ne prouvent pas une rentabilité. Vérifications statiques du HTML et de la préservation des IDs ; aucun navigateur.
- Archive privée vérifiée : `jeu25/graded-risk-v1/manifest.json`, sources référencées Jeux 19/14 et témoins Jeux 23/24. Données, trades et décisions individuelles restent privés.

Aucune autre hypothèse testée dans cette occurrence. Aucune réserve ouverte, aucun Paper Bot, Shadow, ordre réel, abonnement ou changement de collecte. Les fenêtres prospectives restent octobre–novembre 2026, décembre 2026–janvier 2027, février–mars 2027, sans candidate fixée.

Voir [protocole](JEU25_PROTOCOL.md), [rapport agrégé](jeu25-report.json), [registre](research-ledger.json) et [archive](JEU25_ARCHIVE.md).
