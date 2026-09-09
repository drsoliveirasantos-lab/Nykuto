# Jeu 18 — filtre VWAP de séance, 9 septembre 2026

**Filtre non retenu : aucun trade ni résultat n’est amélioré. Le bot reste
non confirmé et désactivé.** Le filtre écarte 147 signaux de base, mais ces
signaux ne produisaient déjà aucun trade sous les règles de la référence.

Une seule hypothèse fixée avant calcul dans le commit local `2fdd9e4` :
Long au-dessus du VWAP cash de séance, Short en dessous. La référence reste
`atrNet5` du Jeu 17. Aucun paramètre ni sens de filtre n’a été changé après
résultat. C’est du développement sur un historique déjà examiné, sans
validation indépendante. Aucun modèle ne s’entraîne en continu entre les tests.

## Résultats identiques avec et sans le filtre

Même source Jeu 14 et mêmes 330 séances évaluables, du 9 avril 2025 au
4 septembre 2026. Préparations et interruptions sont conservées : ce n’est
pas un compte continu. Un MNQ par position, 50 $ de risque prévu avec coûts,
100 $ de budget de perte par séance, trois entrées maximum.

| Hypothèse de coûts | Trades | Avant coûts | Coûts | Net | PF en R |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3,50 $ par aller-retour | 63 | +234,50 $ | 220,50 $ | **+14 $** | 1,000575 |
| 7 $ par aller-retour | 52 | +226,50 $ | 364 $ | **−137,50 $** | 0,868105 |

Les coûts sont hypothétiques et comprennent frais/slippage supposés, hors
achat/reset, plateforme, payout et fiscalité. Les coûts doublés rejouent les
admissions, les pauses et les sorties. Ce ne sont pas les 63 mêmes trades
auxquels on retire seulement davantage de frais.

Au coût normal : 17 jours positifs, 21 négatifs et 292 sans trade ; pire
journée −94,50 $, drawdown réalisé 522,50 $ (13,493984 R). Au stress :
16 positifs, 18 négatifs et 296 sans trade ; pire journée −96 $, drawdown
563,50 $ (15,012625 R). Aucun total quotidien positif n’est garanti.

## Ce que le filtre change réellement

1 544 signaux de base sont comptés sur toutes les séances évaluables :
1 397 du côté autorisé du VWAP, 147 refusés, 0 sans VWAP disponible.
Ce décompte inclut les signaux pendant une position ou hors des conditions
d’entrée ; ce ne sont ni 1 544 opportunités exécutables ni des trades.

Aux coûts normaux, les signaux examinés à plat passent de 1 342 à 1 197,
et les refus de risque de 1 279 à 1 134. Les 63 entrées restent identiques.
Au stress, ils passent de 1 360 à 1 215, et les refus de risque de 1 299 à
1 154 ; les 9 refus de marge nette et les 52 trades restent identiques.

Le filtre ajoute donc ici du calcul sans avantage d’exécution. Le risque
prévu trop élevé reste la principale cause de refus parmi les signaux examinés
à plat. Rejeter davantage de signaux ne suffit pas à améliorer la rentabilité.
Ce constat ne prouve pas que le VWAP est inutile pour d’autres stratégies.

## Cinq évaluations distinctes

| Fenêtre complète | Trades normal / stress | Net normal / stress |
| --- | ---: | ---: |
| Mai–juin 2025 | 9 / 7 | +30,50 / +90,50 $ |
| Juillet–août 2025 | 17 / 17 | −299,50 / −457 $ |
| Novembre–décembre 2025 | 10 / 6 | −87 / −34,50 $ |
| Janvier–février 2026 | 4 / 4 | +110,50 / +96,50 $ |
| Juillet–août 2026 | 0 / 0 | 0 / 0 $ |

Chaque compte démarre à 25 000 $, sans reset interne. Aucun objectif atteint,
aucun breach observé. Les deux configurations, les coûts et les fenêtres
réutilisent les mêmes observations. Les trois fenêtres incomplètes restent
affichées sans performance, avec leur couverture exacte.

Les mêmes critères échouent : nombre de trades par fenêtre, positivité de
chaque fenêtre, PF en R ≥1,10, drawdown ≤8R et net R positif au stress.
Seuls le nombre total de trades et l’absence de breach satisfont les seuils.

## Audit et limites

22 dépendances figées ; 437 préfixes de signaux, 437 préfixes du VWAP et
828 préfixes de comptes vérifiés. 378 trades audités au total, dont 189
reproductions de la référence et 189 contrôles du VWAP recalculé séparément
depuis les bougies clôturées. Ces répétitions ne gonflent pas l’échantillon.
Les 12 paires diagnostic/fenêtre/coût ont aussi été comparées exactement :
mêmes trades, jours, statut, arrêt, solde et seuil de compte avec ou sans VWAP.

La formule utilise HLC3 et le volume des bougies 5 min depuis 09:30 New York,
avec sommes entières de ticks × volume et refus si séance incomplète.
Ce n’est ni un VWAP transaction par transaction ni celui de la séance Globex.
Les prix ont été récupérés après la période ; les fills réels et les gaps
peuvent différer. Aucun navigateur, compte membre, flux live ou broker testé.

Reproduction :
`node scripts/run-trading-jeu18.mjs DOSSIER_JEU14 DOSSIER_JEU17 DOSSIER_PRIVE`.
Le runner refuse une dépendance ou une source dont l’empreinte a changé.

La comparaison est terminée. L’hypothèse n’est pas promue ; aucune pente,
bande ou ancre alternative n’a été essayée après ce résultat. Le 9 septembre
2026, le propriétaire a explicitement autorisé la publication du code et des
statistiques agrégées des Jeux 17 et 18. Cette autorisation lève le blocage
antérieur ; la PR #83 consigne la publication et la vérification du déploiement.
Le protocole gelé et le manifeste privé conservent le statut historique qui
précédait cet accord. Les données de marché brutes, les trades individuels et
les contextes par signal restent privés.

Validation finale : 133 tests de trading réussis, build réussi, hygiène sans
anomalie, 25 Functions valides. Les 305 identifiants de page antérieurs sont
préservés parmi 322 ; les références locales et les trois fichiers de gel des
Jeux 16–18 sont vérifiés. Les deux choix de coûts et le rejet d’un rapport
altéré sont contrôlés avec un DOM simulé, sans rendu navigateur.

Archives privées écrites, relues et comparées exactement :

- `jeu18/vwap-v1/report.json` : 64 366 octets, SHA256
  `30e5029396d4d4b97c79868da54310211d7e3534cfe35b953eb2bc1a55fc1d3d`.
- `jeu18/vwap-v1/runs.json` : 714 125 octets, SHA256
  `feea9556fb297369e2ff7602cc067c208ae39e713ba0120ef7c9a9f49d096ab5`.
- `jeu18/vwap-v1/manifest.json` : sources, empreintes, 12 paires d’exécution
  identiques et statut de publication.

Les contextes VWAP par signal contiennent des données de marché et restent
dans l’archive privée avec les trades. Le rapport du Lab ne contient que des
agrégats. Comptes membres, anciennes archives, tâches MNQ et activation des
ordres restent inchangés.
