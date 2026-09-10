# MNQ — résultat de la comparaison du gain par trade

Étude calculée une seule fois le 10 septembre 2026, sans réglage après résultat.
Le protocole original [PROFIT_STUDY_PROTOCOL.md](./PROFIT_STUDY_PROTOCOL.md)
et le commit de préparation restent inchangés. Les quatre configurations
exécutées, y compris les rejets, sont inscrites dans
[profit-study-ledger.json](./profit-study-ledger.json), supplément explicite
au registre/catalogue historiques figés à111/128 au départ de cette branche.
Aucune de ces configurations n'est une observation indépendante.

## Provenance et vérification

- Gel : `b0bd4bcfdcad50aa85bd7e5173df0837f290e1ba`.
- PR102 : https://github.com/drsoliveirasantos-lab/Nykuto/pull/102
- Workflow : https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34521475105
- Job historique `103019775722`, artefact `10169820719`.
- ZIP téléchargé et SHA256 rapproché : `1933376a3c4307e54d1c2466a85ff1f1cab6385c86ca22575b716d91862391e3`.
- `report.json`, SHA256 des octets : `e37c6e949f000965bea0b5389689ef89e8b104bf2994071aa6380c5e2dfa1a5e`.
- Rapport JSON compact, SHA256 rapproché du statut : `96673def890e8574e52b4aa62e3f6bf36c6bc209797dad86a3868b33048954f9`.
- Fin du calcul : `2026-09-10T19:37:30.791Z` ; calcul3,558secondes, hors préparation CI.
- 16 tests logiciels réussis, 24 comptes mensuels rejoués, 512 préfixes quotidiens vérifiés.
- 64 séances du calendrier cash de juin–août ; zéro séance attendue manquante.
- Au commit gelé, Repository hygiene, Website CI et MNQ profit study sont réussis.

Ces réussites techniques ne constituent pas une qualification financière.
Le statut natif `incomplete` des comptes signifie objectif mensuel non atteint,
pas des données manquantes : le rapport de couverture est complet dans le
périmètre cash annoncé. Aucun compte n'a le statut `breached` dans cette étude.

## Quatre profils comparés

Référence100 ; plafond150 ; plafond200 ; filtre de cible nette100 avec
plafond100. Toujours200USD de limite interne quotidienne, même si le risque
par trade augmente. Stop structurel, cible brute2R, sortie MNQ30, quantités
entières et règles du compte conservés. Les coûts sont les hypothèses natives
3,50USD par contrat aller-retour, puis7USD en stress, pas un tarif vérifié
sur le compte personnel de Diego.

Le filtre de cible nette100 vérifie le gain POSSIBLE si le prix atteint la
cible existante. Il n'impose pas de gagner100USD, ne resserre pas le stop et
ne change pas les poids d'un modèle. Les positions et budgets sont rejoués
pour chaque profil, jamais simplement multipliés après coup.

## Résultats par mois — coûts normaux

| Risque / filtre | Juin net USD | Juillet net USD | Août net USD | Somme des trois comptes | Trades | Moyenne nette de TOUS les trades |
|---|---:|---:|---:|---:|---:|---:|
| Référence100 | 516,50 | -200,50 | -223,50 | 92,50 | 23 | 4,02 |
| Plafond150 | 934,00 | -581,00 | -656,50 | -303,50 | 31 | -9,79 |
| Plafond200 | 1536,00 | -492,00 | -779,00 | 265,00 | 32 | 8,28 |
| Filtre net100 / risque100 | 516,50 | -200,50 | -223,50 | 92,50 | 23 | 4,02 |

Il s'agit d'une SOMME DE COMPTES MENSUELS réinitialisés, pas d'un compte
continu sur l'été. Ce sont des résultats MNQ seul, non comparables directement
aux totaux de l'ancien portefeuille MES/MGC/MNQ.

## Résultats par mois — coûts doublés

| Risque / filtre | Juin net USD | Juillet net USD | Août net USD | Somme des trois comptes | Trades | Moyenne nette de TOUS les trades |
|---|---:|---:|---:|---:|---:|---:|
| Référence100 | 474,50 | -232,00 | -301,50 | -59,00 | 23 | -2,57 |
| Plafond150 | 871,00 | -481,50 | -662,50 | -273,00 | 29 | -9,41 |
| Plafond200 | 1375,00 | -572,50 | -872,50 | -70,00 | 32 | -2,19 |
| Filtre net100 / risque100 | 474,50 | -232,00 | -242,50 | 0,00 | 22 | 0,00 |

## Gagnants, pertes et risque

| Profil normal | Gain moyen des gagnants juin/juillet/août USD | Perte moyenne juin/juillet/août USD | Plus grand drawdown réalisé d'un mois USD | Gagnants >=100 | Gagnants >=200 |
|---|---|---|---:|---:|---:|
| Référence100 | 130,58 / 132,50 / 158,00 | -89,00 / -77,58 / -76,30 | 252,00 | 9 | 0 |
| Plafond150 | 183,79 / 184,75 / 237,00 | -117,50 / -105,61 / -99,28 | 656,50 | 10 | 5 |
| Plafond200 | 295,71 / 313,00 / 316,00 | -178,00 / -159,00 / -121,67 | 779,00 | 11 | 11 |
| Filtre net100 / risque100 | 130,58 / 132,50 / 158,00 | -89,00 / -77,58 / -76,30 | 252,00 | 9 | 0 |

Le drawdown ci-dessus n'est ni le drawdown d'un compte continu sur trois mois
ni l'excursion intratrade tick par tick. Les moyennes gagnants/perdants sont
arrondies par mois ; ne pas en dériver une moyenne globale exacte à partir
des seules valeurs arrondies.

## Verdicts figés et décision

- `risk150` : rejeté. Juillet/août et drawdowns dégradés aux deux coûts ; aucun progrès agrégé total et espérance.
- `risk200` : rejeté. Total normal et moyenne normale supérieurs, mais juillet/août et drawdowns dégradés ; net stress-70 contre-59 pour la référence.
- `net100-risk100` : non retenu par le critère strict. Résultats normaux inchangés ; stress amélioré de59USD jusqu'à0, mais pas d'amélioration stricte aux DEUX coûts.

Aucune variante ne satisfait tous les critères fixés avant calcul.
Le profil maintenu reste100USD. `selection=null`, `confirmed=false`,
`executionAllowed=false`. Il n'est pas démontré que la référence soit robuste
non plus : elle est négative aux coûts doublés et porte23trades seulement.

## Leçon à conserver

Obtenir des gagnants100–200USD est déjà possible sous100USD de risque ; ce
n'est pas une espérance100–200USD par opération. Monter les tailles permet
ici des gagnants plus gros, mais ne répare pas les mois défavorables. Le
nombre d'entrées passe aussi23→31/32 : plus de budget rend admissibles des
stops auparavant trop coûteux. Les risques d'admission et de perte changent,
pas seulement les dollars d'une liste fixe de trades.

La prochaine priorité proposée est de distinguer les pertes liées aux
entrées/retests et à l'exécution, à risque constant, plutôt que reprendre
les cibles3R ou augmenter encore les lots. Cette proposition n'est pas une
nouvelle stratégie testée ni un lancement implicite.

## Limites

Historique déjà consulté, aucune confirmation indépendante. Source MNQ1!
continue, paramètres rollover/back-adjustment non vérifiés. Corpus M5 RTH
dérivé d'exports M1 : exécution M5, pas M1/tick ; ne pas inventer l'ordre des
extrêmes intrabougie. Calendrier cash hérité, pas toutes les séances futures.
Mai prépare les contextes ; septembre non noté. Aucun accès payant, broker,
ordre, activation Paper/Shadow ou déploiement du site. La PR reste une
modification de recherche, pas une mise en production du risque augmenté.
