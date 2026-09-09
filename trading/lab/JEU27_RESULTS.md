# Jeu 27 — davantage de trades, sans amélioration validée

Le 9 septembre 2026, une seule hypothèse a été figée puis évaluée : permettre
un deuxième trade dans le même sens après une nouvelle cassure et un nouveau
retour, formés après la sortie précédente. Maximum deux trades par jour, un
microcontrat et plafond fixe de 150 USD frais compris. Le témoin est le Jeu 23
fixed150 archivé, à mêmes dates et coûts. Le Jeu 26 utilise une autre famille
d'entrée et n'est donc pas le témoin de cette modification.

## Développement — janvier à avril 2026

| Marché | Trades normaux | Gagnants | Net normal USD | Trades stress | Net stress USD | DD réalisé USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 42 | 50,0 % | +456,50 | 40 | +365,50 | 643,50 |
| MES | 29 | 41,4 % | −247,50 | 19 | −277,50 | 471,25 |
| MYM | 42 | 35,7 % | −307,00 | 20 | −358,50 | 416,00 |
| MGC | 36 | 36,1 % | −320,00 | 33 | −270,00 | 724,50 |

Résultats nets après les coûts prévus, sur les seules séances évaluables.
Les coûts doublés participent aussi à l'admission sous le plafond de risque :
le scénario stress peut donc exécuter moins de trades. Les quatre marchés
sont simulés séparément ; leurs gains ne constituent pas un portefeuille.

| Marché | Janvier–février : trades / net USD | Mars–avril : trades / net USD |
| --- | ---: | ---: |
| MNQ | 21 / +435,50 | 21 / +21,00 |
| MES | 16 / −15,00 | 13 / −232,50 |
| MYM | 21 / −139,50 | 21 / −167,50 |
| MGC | 20 / −590,00 | 16 / +270,00 |

## Ce qu'ajoute la nouvelle règle

| Marché | Trades du témoin | Net témoin USD | Nouvelles entrées | Net des ajouts / écart USD |
| --- | ---: | ---: | ---: | ---: |
| MNQ | 36 | +887,50 | 6 | −431,00 |
| MES | 28 | −206,25 | 1 | −41,25 |
| MYM | 37 | −288,50 | 5 | −18,50 |
| MGC | 32 | −370,00 | 4 | +50,00 |

En coûts normaux, tous les trades du témoin sont conservés à l'identique.
Les seules différences sont ces réentrées. MNQ atteint le minimum de 40 trades,
mais les six ajouts réduisent son net de 431 USD. MGC progresse de 50 USD tout
en restant négatif. La variante n'est pas retenue comme amélioration validée.
Aucun filtre n'a été ajusté après observation de ces pertes.

## Activité quotidienne — coûts normaux

| Marché | Séances observées | Positives | Négatives | Actives à zéro | Sans trade | Moyenne USD / séance | Pire séance USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 81 | 19 | 16 | 1 | 45 | +5,64 | −263,50 |
| MES | 81 | 12 | 15 | 0 | 54 | −3,06 | −137,50 |
| MYM | 82 | 14 | 23 | 0 | 45 | −3,74 | −100,00 |
| MGC | 80 | 11 | 20 | 0 | 49 | −4,00 | −220,00 |

La moyenne inclut les jours observés sans trade. Une journée absente n'est
jamais remplacée par une journée à zéro. Ces moyennes historiques ne sont pas
des revenus quotidiens attendus ni garantis.

## Qualification et limites

MNQ passe six critères sur huit : 42 trades, au moins 12 par fenêtre, chaque
fenêtre positive en R et USD, profit factor en R de 1,363, drawdown réalisé
de 6,381R et total stress positif. La séance manquante du 6 mars empêche de
considérer toute la couverture complète et de qualifier le compte simulé
sur la seconde fenêtre. Six critères sur huit ne signifie pas 75 % de chances
de gagner. Le total normal est +8,046R, avec seulement +21 USD en mars–avril.

MES échoue à la couverture, au nombre total, aux fenêtres positives, au profit
factor, au stress et au critère de compte complet. MYM dispose des 82 séances,
mais échoue aux fenêtres positives, au profit factor, au drawdown (14,201R)
et au stress. MGC échoue à ces critères, à la couverture et au nombre total ;
son drawdown est de 10,800R. MES et MGC manquent aussi le 6 mars ; MGC manque
en outre le 25 février. Leurs comptes incomplets ne sont pas qualifiés.

Aucune des quatre configurations n'est sélectionnée. La réserve mai–août
n'a pas été calculée. Les données déjà vues restent du développement ; le
registre conserve les 57 essais précédents et les quatre nouveaux, soit 61.
Aucune candidate n'est fixée pour les trois fenêtres prospectives existantes.
Paper, Shadow, broker et exécution réelle restent désactivés.

## Reproductibilité

Protocole et 30 dépendances, y compris les huit tests synthétiques, gelés avant
performances ; commit public `8d66f7a0f80c8d92a80c6189f325e78b1b2ee128`.
SHA-256 du gel : `74a83011cae840824c08426d27c790d4d9f4e4a9b425ca1d5b4a5f58c4ca22dc`.
Sélection nulle : `d6ca907e98183ac398143b25dcefeb972d0cebb05fec6bfc987948ee5ed7c689`.
L'audit vérifie 37 362 préfixes de signaux, 320 préfixes de comptes,
650 trades incluant comparaisons et replays, et 32 paires de témoins archivés.
Ces vérifications ne sont pas des observations de marché indépendantes.

Les anciennes règles, sources, résultats, collectes et sélections sont
préservés. Le rapport public ne contient que des statistiques agrégées ;
les exécutions détaillées sont restaurables par [l'archive privée](JEU27_ARCHIVE.md).
Le gel et les empreintes du rapport sont vérifiés par les tests logiciels.

Validation locale : 211 tests trading réussis, zéro alerte d'hygiène,
25 modules Pages Functions validés et build réussi. Les 414 anciens IDs HTML
sont préservés parmi 425 IDs uniques ; structure et liens locaux vérifiés.
Les deux vues de coûts et le masquage d'un rapport invérifiable sont testés
par un DOM simulé. La typographie du nouveau panneau suit des rôles partagés
et des contrôles de 44 px ; aucun contrôle visuel dans un navigateur réalisé.
Les trois parties privées et le manifeste ont été relus à l'identique ;
la restauration gzip/base64 retrouve les tailles et SHA-256 originaux.
