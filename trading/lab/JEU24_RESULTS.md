# Jeu 24 — résultats du contexte combiné

Calcul unique le 9 septembre 2026, après gel du protocole et du code.

**Les 16 configurations sont rejetées.** Aucun candidat sélectionné, aucune performance mai–août calculée. Le nouveau filtre retient 6 des 209 signaux de retour sur les quatre marchés, puis 0 à 2 trades par configuration sur janvier–avril 2026. Ces observations sont déjà vues ou corrélées ; elles ne constituent pas une confirmation indépendante.

## Tous les résultats de développement

Un microcontrat ; montants nets en USD. Les profils sont des alternatives, pas des gains à additionner. Les coûts doublés peuvent refuser une entrée que le scénario initial admettait.

| Contrat | Plafond | Trades normaux | Net normal | Trades stress | Net stress | Ancien net au même plafond |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 50 | 0 | +0.00 | 0 | +0.00 | +180.00 |
| MNQ | 75 | 0 | +0.00 | 0 | +0.00 | +193.50 |
| MNQ | 100 | 0 | +0.00 | 0 | +0.00 | +672.00 |
| MNQ | 150 | 0 | +0.00 | 0 | +0.00 | +887.50 |
| MES | 50 | 1 | +41.25 | 0 | +0.00 | +92.50 |
| MES | 75 | 2 | -22.50 | 1 | -68.75 | -86.25 |
| MES | 100 | 2 | -22.50 | 1 | -68.75 | -68.75 |
| MES | 150 | 2 | -22.50 | 1 | -68.75 | -206.25 |
| MYM | 50 | 1 | +44.50 | 1 | +41.00 | -288.00 |
| MYM | 75 | 1 | +44.50 | 1 | +41.00 | -234.00 |
| MYM | 100 | 1 | +44.50 | 1 | +41.00 | -288.50 |
| MYM | 150 | 1 | +44.50 | 1 | +41.00 | -288.50 |
| MGC | 50 | 0 | +0.00 | 0 | +0.00 | +32.50 |
| MGC | 75 | 0 | +0.00 | 0 | +0.00 | -304.50 |
| MGC | 100 | 1 | +118.50 | 1 | +114.00 | -171.50 |
| MGC | 150 | 2 | +10.00 | 2 | +1.00 | -370.00 |

Le Nasdaq ne conserve aucune entrée exécutée, quel que soit le plafond. Le MYM ne conserve qu’un trade (+44,50 USD normal, +41 USD stress). Le MGC à 100 USD conserve un seul trade positif ; ce total ne permet aucune qualification. Le MES à 75–150 USD est négatif en dollars malgré un PF en R supérieur à 1,1, parce que les risques structurels des trades diffèrent. Les critères exigent bien un résultat positif dans les deux unités.

## Signaux restant après chaque condition

| Marché | Retours | + Tendance | + Structure | + Dynamique | + Volume | + Figure | Contexte insuffisant |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 54 | 48 | 30 | 29 | 11 | 1 | 12 |
| MES | 41 | 34 | 18 | 18 | 7 | 2 | 16 |
| MYM | 62 | 51 | 25 | 25 | 9 | 1 | 6 |
| MGC | 52 | 36 | 13 | 13 | 5 | 2 | 15 |

Les cinq familles sont toutes requises. Les motifs de bougies sont des alternatives. Les comptages du tableau sont cumulatifs dans l’ordre préenregistré ; les désaccords peuvent se chevaucher. Les 209 signaux ne représentent pas 209 observations indépendantes et ne sont pas 209 trades exécutés. Le rapport JSON conserve aussi les accords séparés de chaque famille.

## Critères et lacunes

Aucun profil n’atteint les 40 trades totaux ni les 12 par fenêtre. Les gains isolés ne suffisent pas. La couverture de développement reste 81/82 séances pour MNQ/MES, 82/82 pour MYM, 80/82 pour MGC. Les lacunes du 6 mars 2026 et du 25 février MGC restent des obstacles ; elles ne sont ni comblées ni déclarées complètes. Les comptes des fenêtres incomplètes ne sont pas présentés comme validés.

Les plafonds de 50/75/100/150 USD, limites quotidiennes doubles, réserve 100 USD, frais, stops structurels, règle d’un microcontrat et critères de qualification restent ceux préenregistrés. Le nouveau filtre ne calibre aucune probabilité de réussite et n’ajuste pas le risque selon la confiance.

La réserve reste fermée. Les trois fenêtres prospectives prévues restent octobre–novembre 2026, décembre 2026–janvier 2027 et février–mars 2027, sans candidate fixée pour elles. Aucun ordre, Paper Bot, Shadow, broker ni flux réel activé. Aucune collecte existante modifiée.

## Reproductibilité et vérifications

- Gel SHA-256 : `6f762afc85b4ef830449ad5481963f6c4171e35da42494bd422fcdfc30cb453c` ; 67 fichiers et dépendances figés.
- Sélection nulle SHA-256 : `5ee938db6c4401297a03037ec79848b3363240c2de5105b0f476b2e14bb43808`.
- Source et témoin Jeu 23 vérifiés en taille et SHA-256 ; témoin lu dans ses transactions archivées, sans recalcul de référence.
- Audits : 37362 préfixes de signaux, 323 préfixes de contexte, 1280 préfixes de comptes, 128 comparaisons à plafond/coût identiques et 96 comparaisons au nouveau 50 USD.
- 174 tests logiciels réussis, dont six tests synthétiques de contexte et deux tests de rapport/interface. Les tests logiciels ne prouvent pas une rentabilité. Validation des modules Cloudflare, hygiène du dépôt et build réussis ; aucun test navigateur.
- Le registre conserve les 49 configurations des Jeux 19–24, sans retirer les échecs. Les nouvelles configurations peuvent aboutir aux mêmes trades à différents plafonds ; cela ne les rend pas indépendantes.

Archive privée vérifiée : `jeu24/combined-context-v1/manifest.json`. Voir [protocole](JEU24_PROTOCOL.md), [rapport agrégé](jeu24-report.json), [registre](research-ledger.json) et [description des archives](JEU24_ARCHIVE.md).

## Piste demandée après ces résultats, non testée

Diego propose de conserver un plafond réduit lorsque le contexte est partiel
et d'autoriser davantage de risque lorsque tous les signes concordent. Cette
idée de risque gradué est distincte du filtre strict du Jeu 24. Elle n'est ni
préenregistrée ni évaluée ici ; aucun plafond ou résultat gelé n'a été changé.
Un protocole ultérieur devra définir avant performances les conditions
indispensables, les niveaux autorisés et une comparaison à risque constant.
Le nombre de signes concordants n'est pas une probabilité de gain calibrée.
