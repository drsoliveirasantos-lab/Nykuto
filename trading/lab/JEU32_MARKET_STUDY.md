# Jeu 32 — pourquoi août 2026 a pénalisé la stratégie

**Août n’est pas défavorable à tous les marchés de la même manière.** Dans les sessions étudiées, les indices ont une amplitude plus petite, et Nasdaq/Dow ont davantage de cassures d’ouverture qui reviennent rapidement dans leur zone. L’or conserve un résultat positif dans la référence Jeu 31. Ce diagnostic décrit les données ; il ne prouve pas que les vacances ou une annonce particulière ont causé les pertes.

## Mesures comparables par marché

21 séances en juin, 22 en juillet, 21 en août ; mêmes horaires cash et mêmes conventions M5. L’amplitude est (plus haut − plus bas) / ouverture de séance ; 100 points de base = 1 %. L’efficacité est le déplacement absolu ouverture–dernière clôture divisé par le trajet absolu des clôtures M5. Un résultat proche de zéro décrit davantage d’allers-retours. Il ne mesure pas directement la qualité d’une entrée de trading.

| Mois | Marché | Amplitude médiane (pb) | Efficacité moyenne | Volatilité réalisée médiane (%) | Cassures échouées / total | Net référence |
| --- | --- | --- | --- | --- | --- | --- |
| Juin | MES | 102.63 | 0.132 | 0.774 | 19/31 | -91,25 $ |
| Juin | MGC | 126.55 | 0.113 | 0.777 | 17/36 | -89,50 $ |
| Juin | MNQ | 182.30 | 0.135 | 1.258 | 19/36 | +717,00 $ |
| Juin | MYM | 105.82 | 0.121 | 0.683 | 17/33 | -64,00 $ |
| Juillet | MES | 88.88 | 0.099 | 0.535 | 21/43 | +87,50 $ |
| Juillet | MGC | 108.43 | 0.095 | 0.686 | 23/35 | +84,00 $ |
| Juillet | MNQ | 155.43 | 0.108 | 0.989 | 15/31 | -317,50 $ |
| Juillet | MYM | 93.43 | 0.086 | 0.548 | 12/25 | +113,00 $ |
| Août | MES | 56.08 | 0.135 | 0.386 | 29/49 | -25,00 $ |
| Août | MGC | 120.04 | 0.137 | 0.706 | 16/33 | +131,50 $ |
| Août | MNQ | 94.84 | 0.132 | 0.725 | 20/32 | -289,00 $ |
| Août | MYM | 59.28 | 0.106 | 0.419 | 26/33 | -53,00 $ |

La volatilité réalisée est la racine de la somme des rendements logarithmiques M5 au carré sur la séance, non annualisée. Une cassure est comptée après l’ouverture de 30 minutes, jusqu’avant midi NY ; elle est dite échouée si une clôture revient strictement dans la zone sous six bougies, et avant midi. Des cassures proches de midi peuvent donc avoir une fenêtre de suivi plus courte. Ce proxy descriptif n’est pas le taux d’échec exact des setups du bot et n’a pas servi de filtre.

### Ce qui change en août

| Marché | Amplitude vs juillet | Volume/minute du contrat vs juillet | Cassures échouées juillet | Cassures échouées août |
| --- | --- | --- | --- | --- |
| MES | -36.9 % | -16.2 % | 48.8 % | 59.2 % |
| MGC | +10.7 % | -82.3 % | 65.7 % | 48.5 % |
| MNQ | -39.0 % | -18.7 % | 48.4 % | 62.5 % |
| MYM | -36.6 % | -27.6 % | 48.0 % | 78.8 % |

- **MES :** amplitude plus petite ; la stratégie de référence passe de +87,50 $ en juillet à −25 $ en août. Les faux départs augmentent selon le proxy, mais l’efficacité moyenne n’est pas plus faible qu’en juillet.
- **MNQ :** principal contributeur négatif en juillet et août ; il avait porté juin à +717 $. En août : −289 $, avec une amplitude médiane d’environ 0,95 % contre 1,55 % en juillet et davantage de cassures rapidement réintégrées. Une cible fixe lointaine peut alors devenir moins accessible ; c’est une hypothèse compatible avec les résultats 2R, pas une causalité démontrée.
- **MYM :** 26 réintégrations sur 33 cassures en août, contre 12 sur 25 en juillet. La stratégie passe de +113 $ à −53 $. Ce marché mérite une analyse spécifique des faux départs et de la session.
- **MGC :** amplitude en hausse par rapport à juillet et référence à +131,50 $. Il serait incorrect d’affirmer que tous les marchés étaient sans tendance en août.

Le volume est celui du microcontrat effectivement présent dans l’archive, pas celui de toute la famille de futures. En particulier, la très forte baisse sur MGC peut dépendre de l’échéance et du transfert d’activité entre contrats. Sans comparaison exhaustive des échéances actives, carnet d’ordres et spreads, on ne peut pas la transformer en conclusion sur la liquidité globale de l’or. L’étude ne crée donc aucun filtre de volume à partir de ce constat.

## Annonces connues dans chaque mois

Les dates retenues sont une sélection non exhaustive, sans historique du consensus ni score de surprise. Les annonces BLS de 08:30 précèdent l’ouverture cash de 09:30. Les publications Fed à 14:00 peuvent survenir après les entrées du bot ; le résultat total de la journée n’est pas une mesure de leur effet.

- **Juin :** emploi publié le 5, CPI le 10, décision FOMC le 17. [Calendrier BLS de juin](https://www.bls.gov/schedule/2026/06_sched.htm). La Fed maintient alors sa fourchette de taux à 3,50–3,75 %, à l’unanimité, dans un contexte d’inflation et d’incertitude géopolitique. [Décision du 17 juin](https://www.federalreserve.gov/newsevents/pressreleases/monetary20260617a.htm).
- **Juillet :** emploi le 2, minutes de juin le 8, CPI le 14, FOMC le 29. [Calendrier BLS de juillet](https://www.bls.gov/schedule/2026/07_sched.htm), [calendrier Fed](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm). La décision du 29 conserve la même fourchette ; trois membres préfèrent une hausse de 25 points de base. Cela renseigne sur le débat monétaire, pas sur une direction certaine des indices. [Décision du 29 juillet](https://www.federalreserve.gov/newsevents/pressreleases/monetary20260729a.htm).
- **Août :** emploi le 7, CPI le 12, minutes de juillet le 19. [Calendrier BLS d’août](https://www.bls.gov/schedule/2026/08_sched.htm), [minutes de juillet publiées en août](https://www.federalreserve.gov/monetarypolicy/fomcminutes20260729.htm). Il n’y a pas de réunion FOMC programmée en août ; les minutes décrivent la réunion de juillet et sa période antérieure, pas la performance réalisée de tout août.

Le 7 août, le rapport sur l’emploi de juillet indique −23 000 emplois salariés et 4,1 % de chômage, avec 103 000 emplois retirés par les révisions cumulées de mai et juin. Sans données de consensus, on ne peut pas qualifier objectivement la surprise de marché. [Publication emploi](https://www.bls.gov/news.release/archives/empsit_08072026.htm).

Le 12 août, le CPI de juillet progresse de 0,1 % sur le mois et de 3,4 % sur un an ; hors alimentation et énergie, +0,2 % et +2,5 %. Le CPI du mois d’août lui-même n’était pas encore publié pendant les tests d’août : il ne doit pas être utilisé pour justifier rétroactivement les entrées. [Publication CPI](https://www.bls.gov/news.release/archives/cpi_08122026.htm).

Ces informations peuvent alimenter des réévaluations des anticipations de croissance et de taux. C’est une interprétation économique plausible ; nous n’avons pas mesuré ici leur effet causal sur chaque trade.

### Résultat du bot les jours sélectionnés

Référence Jeu 31, diagnostic aux coûts initiaux. Un gain ou une perte ce jour-là ne prouve pas un effet de l’annonce. Les événements de 14:00 ne sont pas attribués aux trades ouverts avant publication.

| Date NY | Publication | Heure NY | Trades du jour | Net du jour |
| --- | --- | --- | --- | --- |
| 2026-06-05 | Emploi de mai | 08:30 | 1 | +23,50 $ |
| 2026-06-10 | CPI de mai | 08:30 | 2 | -166,50 $ |
| 2026-06-17 | Décision FOMC | 14:00 | 1 | -32,50 $ |
| 2026-07-02 | Emploi de juin | 08:30 | 0 | +0,00 $ |
| 2026-07-08 | Minutes FOMC de juin | 14:00 | 1 | +60,00 $ |
| 2026-07-14 | CPI de juin | 08:30 | 2 | +176,00 $ |
| 2026-07-29 | Décision FOMC | 14:00 | 2 | +171,50 $ |
| 2026-08-07 | Emploi de juillet | 08:30 | 1 | -132,00 $ |
| 2026-08-12 | CPI de juillet | 08:30 | 2 | +99,00 $ |
| 2026-08-19 | Minutes FOMC de juillet | 14:00 | 1 | -23,50 $ |

En août, les trois journées sélectionnées totalisent −56,50 $ ; les autres séances totalisent −179 $. Ces trois annonces ne suffisent donc pas à résumer le mois perdant de −235,50 $. Ni Jackson Hole, ni toutes les annonces géopolitiques, ni l’ensemble des données économiques ne sont codés dans cette sélection.

## Conséquence pratique pour Nykuto

Garder le diagnostic par marché. La nouvelle règle M5/H1 à EMA 9/21 cash supprime aussi des entrées profitables et ne corrige pas le problème observé. À risque 500 $, l’amplification des pertes et les refus de marge dominent la gestion du compte. Les résultats ne justifient ni son activation automatique, ni une promesse hebdomadaire.

Une prochaine hypothèse pourrait tester des cibles et des conditions de cassure adaptées à l’amplitude propre à chaque marché. Elle reste à définir avant calcul et à confirmer sur de nouvelles observations. Les mesures de fin de séance de cette étude restent descriptives et ne sont jamais présentées au moteur comme si elles étaient connues à l’entrée.

[Résultats jour par jour et semaine par semaine](JEU32_RESULTS.md) · [Protocole et données](JEU32_PROTOCOL.md) · [Agrégats vérifiables](jeu32-report.json).
