# Jeu 26 — les cassures échouées ne qualifient aucun marché

Le 9 septembre 2026, une nouvelle famille a été figée puis évaluée sur les
quatre microcontrats. Les sources publiques vidéo/transcription et communauté
sont distinguées des règles précisément codées dans [le protocole](JEU26_PROTOCOL.md).
Aucun apprentissage autonome, accès à un Discord privé ou résultat réel vérifié
n'est revendiqué. Les 57 configurations des Jeux 19–26 restent au registre.

## Résultats de développement, janvier–avril 2026

| Marché | Trades normaux | Net normal USD | Trades stress | Net stress USD | Net R normal | DD normal USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| MNQ | 36 | −52 | 34 | +125,50 | −0,320 | 635 |
| MES | 41 | −1 043,75 | 32 | −1 103,75 | −15,170 | 1 100 |
| MYM | 36 | −356,50 | 31 | −471,50 | −2,790 | 504,50 |
| MGC | 27 | +636,50 | 24 | +767 | +5,392 | 551,50 |

Les totaux partiels conservent les performances des séances évaluables ; les
séances manquantes ne sont jamais marquées complètes. Aucun portefeuille des
quatre marchés n'a été simulé : ne pas additionner ces résultats comme un compte.

| Marché | Janvier–février : trades / net USD | Mars–avril : trades / net USD |
| --- | ---: | ---: |
| MNQ | 17 / −109 | 19 / +57 |
| MES | 17 / −235 | 24 / −808,75 |
| MYM | 13 / −96,50 | 23 / −260 |
| MGC | 15 / +672,50 | 12 / −36 |

Tous échouent au critère de fenêtres positives. MNQ mars–avril est positif
en dollars mais négatif en R ; MYM janvier–février a la situation inverse.
Les stops variables expliquent pourquoi les deux unités sont exigées.
MNQ/MYM/MGC restent sous 40 trades. MES/MYM dépassent 8R de drawdown
(16,533R / 8,492R). MNQ/MES ont une séance absente, MGC deux ; MYM seul
dispose des deux fenêtres entièrement couvertes. Les comptes complets MYM
ne franchissent pas le seuil, mais n'atteignent pas l'objectif.

MGC obtient un PF en R de 1,391 et un drawdown de 5,318R, mais son total
positif n'annule ni la deuxième fenêtre négative, ni le faible échantillon,
ni les comptes non évaluables sur fenêtres incomplètes. Sélection nulle ;
mai–août non calculé. Aucune confirmation indépendante.

## Pourquoi des coûts doublés peuvent donner un meilleur total

Ce ne sont pas les mêmes listes de trades : les frais participent à l'admission
du stop et au potentiel net. La politique est intégralement rejouée aux deux
coûts, comme annoncé avant le calcul.

- MNQ : les 34 entrées stress étaient déjà présentes au coût normal. Deux
  autres, qui perdaient ensemble 296,50 USD en normal, dépassent le plafond
  avec les frais doublés. L'écart est donc +296,50 moins 119 de surcoûts
  sur les 34 trades conservés, soit +177,50 USD : −52 devient +125,50.
- MGC : 23 entrées communes, quatre retirées et une ajoutée. Les quatre
  retirées totalisaient −119 USD au coût normal ; la nouvelle donne +115
  en stress. Les entrées communes supportent 103,50 de coûts supplémentaires.
  L'écart est +119 +115 −103,50 = +130,50 USD : +636,50 devient +767.

Ce rapprochement décrit les résultats déjà obtenus ; aucun seuil n'est modifié
pour exploiter les trades perdants observés. Le stress favorable ne remplace
pas les autres critères. Les détails des opérations restent privés.

## Comparaison conservée et limites

Jeu 23 fixed150, mêmes dates et coûts normaux : MNQ +887,50, MES −206,25,
MYM −288,50, MGC −370 USD. Ces témoins archivés n'ont pas été recalculés.
Le nouveau jeu change l'entrée, le stop de l'excursion et la cible bornée
par la zone ; l'écart n'est pas attribué au seul sens du trade. Aucune des
anciennes ou nouvelles configurations n'est validée indépendamment.

Les captures 15 minutes de Diego servent à discuter le contexte ; la règle
historique emploie de vraies bougies cinq minutes et l'horaire New York.
Une bougie verte en formation ou une longue mèche dans une baisse ne déclenche
pas à elle seule un achat. Une observation de septembre ne valide pas les
fenêtres prospectives, et aucun niveau lu sur image n'est codé en dur.

82 dépendances et les tests synthétiques ont été gelés avant performances,
commit local `7f2b9ecf55da0c38bacf3adaf063bcfd225b5679`.
SHA-256 du gel : `292867f4d7457d0cf57fd680ad14f8ed3f281ec05874000788715849d6acc9cc`.
Sélection nulle : `c3d7e43ff7eec61647545e395bd0183fcf9b7183edfc4f5f349fe68af5e20473`.
L'audit vérifie 37 362 préfixes de signaux, 320 préfixes de comptes,
655 trades incluant les comparaisons/replays, et 32 paires de témoins archivés.
Ces nombres ne sont pas des observations indépendantes.

La réserve reste fermée ; aucune candidate n'est fixée pour octobre–novembre
2026, décembre 2026–janvier 2027 ou février–mars 2027. Paper, Shadow, broker
et réel restent désactivés. Aucun objectif hebdomadaire n'est garanti.

Validation locale : 191 tests logiciels réussis, zéro alerte d'hygiène,
25 modules Pages Functions validés et build réussi. Les 403 IDs HTML précédents
sont préservés parmi 414 IDs uniques ; structure, liens et références vérifiés
sans navigateur. Les trois fichiers privés et le manifeste ont été relus
à l'identique après écriture, avec tailles et SHA-256 conservés.
