# Jeu 41 — Le filtre de marge nette MES n’est pas retenu

Une seule campagne terminée, sans recalcul ni changement après résultat. La référence Jeu40/Jeu37 fixed100 est conservée. L’audit initial des232 trades ne trouvait aucun nouvel écart arithmétique ; MES était le plus faible contributeur actif, avec41,25USD nets sur huit mois.

## Modification réellement testée

Uniquement sur MES : refuser une entrée si le gain net à la cible2R est inférieur à1,5fois la perte planifiée frais compris. Cela exige un risque de prix au moins égal à5fois les coûts. L’égalité passe. Le filtre utilise le signal clôturé et l’ouverture suivante ; il ne lit pas les extrêmes futurs de cette M5. Le stop n’est jamais élargi pour faire passer un trade.

Même risque maximal100USD, limite quotidienne200USD, sorties2R, autres marchés et ordre de priorité. Compte funded50K hypothétique neuf chaque mois. Aucun modèle lancé, aucune nouvelle donnée, aucune activation.

## Huit mois, tous les résultats

Montants nets en USD, pas des euros disponibles au retrait. Février/mars sont partiels ;164/166séances,25février et6mars exclus conjointement. Leur résultat potentiel et celui de huit mois complets restent inconnus. La moyenne observée divise bien le total par huit, sans extrapoler les jours manquants.

| Mois | Coûts | Net référence | Net filtre MES | Trades filtre | Gagnants/perdants | Moyenne/trade | Drawdown référence → filtre |
|---|---|---:|---:|---:|---:|---:|---:|
| Janvier | Normaux | 511,00 $ | 487,25 $ | 15 | 7/8 | 32,48 $ | 227,00 $ → 337,00 $ |
| Janvier | Doublés | 48,00 $ | −88,50 $ | 12 | 4/8 | −7,37 $ | 336,00 $ → 241,00 $ |
| Février · partiel | Normaux | 663,25 $ | 663,25 $ | 10 | 7/3 | 66,33 $ | 88,50 $ → 88,50 $ |
| Février · partiel | Doublés | 616,75 $ | 511,75 $ | 9 | 6/3 | 56,86 $ | 93,00 $ → 93,00 $ |
| Mars · partiel | Normaux | −297,50 $ | −297,50 $ | 11 | 3/8 | −27,05 $ | 330,00 $ → 330,00 $ |
| Mars · partiel | Doublés | −250,50 $ | −193,00 $ | 9 | 3/6 | −21,44 $ | 356,00 $ → 356,00 $ |
| Avril | Normaux | 323,75 $ | 518,75 $ | 14 | 7/7 | 37,05 $ | 263,00 $ → 263,00 $ |
| Avril | Doublés | 216,25 $ | 303,75 $ | 11 | 5/6 | 27,61 $ | 234,50 $ → 142,00 $ |
| Mai | Normaux | −256,50 $ | −53,75 $ | 18 | 6/12 | −2,99 $ | 730,25 $ → 678,75 $ |
| Mai | Doublés | −197,50 $ | 44,25 $ | 14 | 5/9 | 3,16 $ | 689,50 $ → 528,25 $ |
| Juin | Normaux | 1 048,75 $ | 1 010,00 $ | 14 | 10/4 | 72,14 $ | 172,50 $ → 167,50 $ |
| Juin | Doublés | 785,50 $ | 763,50 $ | 11 | 8/3 | 69,41 $ | 145,00 $ → 97,00 $ |
| Juillet | Normaux | 176,00 $ | 176,00 $ | 21 | 8/13 | 8,38 $ | 312,50 $ → 312,50 $ |
| Juillet | Doublés | 164,00 $ | −303,50 $ | 17 | 5/12 | −17,85 $ | 330,50 $ → 469,00 $ |
| Août | Normaux | −245,50 $ | −167,00 $ | 8 | 2/6 | −20,87 $ | 442,00 $ → 333,50 $ |
| Août | Doublés | −228,50 $ | −230,50 $ | 8 | 2/6 | −28,81 $ | 359,50 $ → 355,50 $ |

| Mesure | Référence normale | Filtre normal | Référence coûts doublés | Filtre coûts doublés |
|---|---:|---:|---:|---:|
| Total observé | 1 923,25 $ | 2 337,00 $ | 1 154,00 $ | 807,75 $ |
| Moyenne mensuelle observée | 240,41 $ | 292,13 $ | 144,25 $ | 100,97 $ |
| Trades | 122 | 111 | 110 | 91 |
| Gagnants / perdants | 53 / 69 | 50 / 61 | 48 / 62 | 38 / 53 |
| Moyenne nette / trade | 15,76 $ | 21,05 $ | 10,49 $ | 8,88 $ |
| Pire drawdown mensuel | 730,25 $ | 678,75 $ | 689,50 $ | 528,25 $ |
| Mois à4 000USD / retrait personnel obtenu | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

## Marchés et profils

Contributions dans un portefeuille avec occupation commune, pas résultats de robots indépendants. MYM reste exclu. MNQ/MGC peuvent changer indirectement même si leurs règles sont identiques.

| Marché | Coûts | Net référence | Net filtre | Trades filtre | Gagnants/perdants | Moyenne filtre |
|---|---|---:|---:|---:|---:|---:|
| MNQ | Normaux | 1 464,00 $ | 1 515,50 $ | 51 | 25/26 | 29,72 $ |
| MNQ | Doublés | 897,00 $ | 743,00 $ | 54 | 24/30 | 13,76 $ |
| MES | Normaux | 41,25 $ | 557,50 $ | 32 | 14/18 | 17,42 $ |
| MES | Doublés | 35,00 $ | −71,25 $ | 12 | 4/8 | −5,94 $ |
| MGC | Normaux | 418,00 $ | 264,00 $ | 28 | 11/17 | 9,43 $ |
| MGC | Doublés | 222,00 $ | 136,00 $ | 25 | 10/15 | 5,44 $ |
| MYM | Normaux | 0,00 $ | 0,00 $ | 0 | 0/0 | — |
| MYM | Doublés | 0,00 $ | 0,00 $ | 0 | 0/0 | — |

## Gagnants retirés, pertes évitées et nouvelles admissions

| Mois | Coûts | Gagnants retirés | Perdants retirés | Nouveaux gagnants/perdants | Écart net |
|---|---|---:|---:|---:|---:|
| Janvier | Normaux | 1 | 1 | 0/0 | −23,75 $ |
| Janvier | Doublés | 2 | 4 | 0/2 | −136,50 $ |
| Février · partiel | Normaux | 0 | 0 | 0/0 | 0,00 $ |
| Février · partiel | Doublés | 1 | 0 | 0/0 | −105,00 $ |
| Mars · partiel | Normaux | 0 | 0 | 0/0 | 0,00 $ |
| Mars · partiel | Doublés | 0 | 1 | 0/0 | 57,50 $ |
| Avril | Normaux | 0 | 2 | 0/0 | 195,00 $ |
| Avril | Doublés | 1 | 2 | 0/0 | 87,50 $ |
| Mai | Normaux | 1 | 2 | 1/0 | 202,75 $ |
| Mai | Doublés | 2 | 5 | 1/2 | 241,75 $ |
| Juin | Normaux | 1 | 3 | 0/2 | −38,75 $ |
| Juin | Doublés | 2 | 1 | 1/0 | −22,00 $ |
| Juillet | Normaux | 0 | 0 | 0/0 | 0,00 $ |
| Juillet | Doublés | 4 | 0 | 0/0 | −467,50 $ |
| Août | Normaux | 1 | 3 | 0/1 | 78,50 $ |
| Août | Doublés | 0 | 2 | 0/2 | −2,00 $ |

- Normal :15trades retirés, dont4gagnants et11perdants ; leur net était−492,75USD. Quatre nouvelles admissions,1gagnant/3perdants, net−79USD. Écart total+413,75USD. Aucun trade commun modifié.
- Coûts doublés :27trades retirés, dont12gagnants et15perdants ; leur net était+177USD. Huit nouvelles admissions,2gagnants/6perdants, net−169,25USD. Écart total−346,25USD. Aucun trade commun modifié.
- Juillet doublé : quatre gagnants MES supprimés, aucune perte évitée, aucune admission nouvelle. Le net passe de164 à−303,50USD ; drawdown330,50→469USD.
- Mai normal : une nouvelle MES gagnante prend la place d’un MNQ perdant. Les deux nouvelles MGC normales perdent154USD au total. En janvier doublé, une nouvelle MNQ antérieure consomme le quota de sens et empêche une autre MNQ gagnante. On ne peut donc pas soustraire seulement les MES bloquées pour obtenir le nouveau portefeuille.

## Décision et limites

Le critère exigeait net et drawdown non dégradés dans chacune des16cellules, et un net strictement meilleur dans au moins une. Sept cellules échouent : janvier normal/doublé, février doublé, juin normal/doublé, juillet doublé, août doublé. Le meilleur total normal et le meilleur pire drawdown ne compensent pas ces échecs. **Variante non retenue ; référence conservée.**

Le ratio net théorique ne mesure ni la probabilité de réussite ni l’espérance réelle. Le filtre peut supprimer des gagnants même quand leurs frais sont proportionnellement élevés. Aucun seuil n’est retouché ; aucun second essai n’est lancé. Données déjà vues, préparation historique non uniforme et petits effectifs : zéro validation indépendante et aucune promesse de4Kmensuels.

## Audit, conservation et calendrier

Gel publié avant performance : `73aa1a6208a85f5a622e5d81f2675cd561ca0bb2`,67dépendances inchangées ; SHA du gel `4103b44c49687f32310f9f46d7ff3579fca8f1edc48c2c392df3d4f6d8019722`.

32relectures ;16témoins Game40 JSON entiers identiques ;656préfixes compte,656filtre,656contexte ;434trades vérifiés. L’audit arithmétique séparé recoupe434trades,656journées observées et156semaines, sans relancer de performance. Prix, multiplicateurs, quantités, frais, net, cibles/stops, drawdowns, soldes, retraits, calendriers et rapprochements concordent. Les664lignes de calendrier comprennent8occurrences des deux journées manquantes sur quatre combinaisons.

Rapport700142octets, SHA `57126d9f313c03b63e73be2e531a07670e2cd62d1b04fe49467e45f297f6b559`. Runs privés1073114octets, SHA `06db6f39fae5c0009b5e55da69310863fe4f8eb03b2d6cd2ea530d2749e9516c`.

Trois fichiers privés archivés sans écrasement sous `jeu41/mes-net-reward-v1/`, quatre parties relues en16morceaux puis recomposées exactement. Manifeste SHA `312d0a56709698f6372507496131a32746347252c788947e0487a50dad0485f5`. Les anciennes archives, sources, gels et protocoles sont intacts.

Une configuration exécutée ajoutée, les16témoins ne sont pas de nouvelles configurations. Registre94/catalogue111 après conservation des93/110entrées précédentes. Le calendrier propose les Jeux33–41,68sélections et234vues mensuelles avec coûts ; janvier–août pour40/41 et juin–août pour33–39. Les jours manquants restent barrés, «Données non correspondantes», net null.

Publication limitée aux agrégats, au bilan, aux leçons et au calendrier. Kronos/RSI/news, collecteJeu08 et rendez-vous du3décembre préservés. Aucun achat, ordre, broker, Paper/Shadow, fusion main ou surveillance permanente.

[Calendrier](./#historyCalendarGame) · [Rapport](./jeu41-report.json) · [Audit](./jeu41-execution-audit.json) · [Protocole original](./JEU41_PROTOCOL.md) · [Recherche préalable](./JEU41_RESEARCH.md) · [Leçons](./RESEARCH_LESSONS.md).

Validation locale de publication :278tests trading passent, build et hygiène sans alerte,25Functions validées. Les521anciens identifiants HTML sont conservés parmi523uniques ; les32montants du tableau41 concordent avec le rapport. Aucun test navigateur revendiqué. L’état CI/déploiement du commit final est consigné dans la PR83 après vérification effective.
