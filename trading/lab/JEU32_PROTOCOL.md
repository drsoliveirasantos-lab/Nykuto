# Jeu 32 — été 2026, tendance M5/H1 et risque 500 $

Définition avant les nouveaux résultats. Diego demande les tests de juin, juillet et août, une étude du marché et un objectif hebdomadaire de 1 000 $, avec les indications de son associé : suivre la tendance, M5 aligné H1, risque 500 $ par transaction et ratio 1:2 maximum. « Objectif - 1000 » est interprété comme **+1 000 $ de net de trading par semaine**, pas une perte souhaitée ni un retrait garanti. « 1:2 » signifie stop à 1R et cible à 2R de prix ; les coûts abaissent le ratio net.

## Hypothèses fixées

Conserver les signaux par marché du Jeu 31 combiné : retour après cassure pour MES/MNQ/MYM, retour dans la zone pour MGC, filtre RSI MES et horaire MGC avant 11 h. Ne pas transposer le filtre RSI à MNQ. Les nouvelles variantes passent à une cible fixe 2R, sans déplacement du stop à +1R ; MGC peut viser au-delà de l’autre bord de sa zone. Ce changement de sortie est explicite.

| Variante | Sortie et quantité | Alignement | Risque maximum frais compris / jour |
| --- | --- | --- | --- |
| Référence Jeu 31 | Sorties précédentes, 1 micro | Aucun ajout | 150 / 300 $ |
| 1:2, 150 | Stop fixe, cible 2R, quantité calculée | Aucun ajout | 150 / 300 $ |
| M5/H1, 150 | Même sortie et dimensionnement | Oui | 150 / 300 $ |
| 1:2, 500 | Stop fixe, cible 2R, quantité calculée | Aucun ajout | 500 / 1 000 $ |
| M5/H1, 500 | Même sortie et dimensionnement | Oui | 500 / 1 000 $ |

Les deux contrôles sans alignement permettent de mesurer l’apport du filtre à risque et sortie constants. Comparer les deux risques alignés mesure aussi les changements d’admission dus aux contraintes du compte ; ce n’est pas une simple multiplication du P&L.

**Tendance opérationnelle** : EMA 9 et EMA 21, paramètres déjà présents dans le contexte M5, maintenant appliqués aussi aux bougies H1. Achat si clôture > EMA9 > EMA21 sur les deux unités ; vente si clôture < EMA9 < EMA21. Tous les autres cas sont mixtes ou inconnus, refusés. EMA initialisée à la première clôture ; disponibilité après 21 bougies de l’unité concernée. Ce choix est une définition de recherche, pas la transcription certaine de la méthode discrétionnaire de l’associé.

**H1 de séance cash** : 12 bougies M5 closes à partir de 09:30 New York : 09:30–10:30, 10:30–11:30, etc. Une tranche finale de 30 minutes ne devient jamais H1. Avant la clôture de la première H1 du jour, utiliser la dernière H1 complète de la séance précédente, si le contrat et la suite de séances sont continus. Les EMA repartent après trou de séance ou rollover. Ce découpage n’est pas identique à tous les réglages H1/Globex de TradingView ; aucune H1 en formation ni donnée future n’est utilisée.

**Dimensionnement** : quantité entière = min(20, floor(plafond / perte par micro au stop frais compris)). Le stop reste celui du signal ; ne pas l’élargir pour dépenser 500 $. Plafond, arrondi entier et maximum de contrats peuvent laisser le risque réalisé inférieur à 500 $. La cible 2R n’est donc pas une promesse de +1 000 $ par gain. Coûts par micro = commission historique 2,50 $ + deux ticks de friction, puis scénario doublé, quantité multipliée. Un gap peut dépasser la perte planifiée ; rapporter séparément les dépassements observés.

## Compte et comparaison

Une position totale, maximum deux entrées par jour et un trade par sens/marché, priorité MES/MGC/MNQ/MYM, occupation de toute la bougie de sortie et sortie 15 minutes avant clôture : conventions conservées. La limite journalière 2× le plafond est une garde propre au bot, pas une limite imposée par LucidFlex. Réserve de seuil 100 $ conservée ; le moteur refuse une entrée si sa perte planifiée laisserait moins que cette réserve. Aucun contournement pour atteindre l’objectif hebdomadaire.

Rejouer juin, juillet, août chacun depuis 25 000 $, puis **juin–août dans un compte continu sans reset mensuel ou hebdomadaire**. Deux modes : diagnostic sans seuil/objectif de compte, et modèle d’évaluation LucidFlex 25K historique (MLL 1 000 $, suivi EOD plafonné à 25 100 $, objectif 1 250 $, meilleur jour ≤50 % du profit). Le mode évaluation s’arrête à l’objectif ou au franchissement du seuil ; les jours suivants restent non calculés. Aucun retrait ni redémarrage automatique après arrêt.

Les fiches officielles consultées le 9 septembre 2026 confirment 1 250 $ d’objectif, 1 000 $ de MLL et 20 micros maximum pour l’évaluation 25K. **500 $ représente la moitié de la marge de perte initiale**, même si cela correspond à 2 % du montant nominal. Le modèle ne certifie ni fills réels, ni qualification effective, ni conditions funded/scaling/retraits.

## Données, origine et limites

Les archives Massive Jeux 19/14 restent privées et identiques à leurs empreintes. Juin : 21 séances communes complètes ; juillet : 22 ; août : 21. Mai sert uniquement à préparer les indicateurs, sans calcul de stratégie sur mai. Les contextes M5/H1 des nouvelles variantes utilisent mai–août. Pour conserver exactement la référence RSI d’août du Jeu 31, son contexte reste celui de janvier–avril puis août, avec coupure avant août ; juin/juillet disposent du contexte préparé depuis mai. Ce filtre historique identique est commun aux cinq variantes. Une future modification de cette convention demanderait un autre essai.

Juin et juillet sont nouvellement évalués à la demande de Diego dans ce protocole ; ils étaient historiquement désignés comme réserve. Le registre des recherches a déjà utilisé certaines fenêtres d’autres jeux : aucune indépendance globale n’est affirmée. Août est déjà observé. Les seuils ne seront pas ajustés après les résultats. Quatre configurations nouvelles, registre 70 →74, anciennes entrées intactes.

## Mesures et contrôles

80 replays : quatre fenêtres × deux modes × cinq variantes × deux coûts. Publier tous les nets, effectifs, gains/pertes/zéros, PF, risques effectivement planifiés, quantité, perte maximale observée, coûts, drawdown réalisé et activité, même nulle. Comparaisons d’entrées communes, gagnants retirés/perdants retirés, nouveaux trades et sorties/dimensionnement modifiés. L’écart commun inclut l’effet de quantité et ne sera pas attribué seulement aux sorties.

Publier les jours et semaines, la proportion de semaines complètes ≥1 000 $, positives et négatives. Une semaine partagée par deux mois est reconstituée correctement dans le replay continu. Les semaines tronquées par la borne du test sont séparées ; un jour férié ne rend pas une semaine tronquée. Les semaines interrompues après arrêt de compte ne deviennent pas des zéros. L’objectif 1 000 $ est une mesure ; ne pas arrêter de trader à son atteinte ni compenser en augmentant le risque.

Comparer l’état des marchés par amplitudes en points de base, volatilité intrajournalière non annualisée, efficacité directionnelle |clôture−ouverture|/somme des variations absolues des clôtures, volume médian par minute du microcontrat et retours dans la zone d’ouverture sous 30 minutes. Mesures descriptives après séance, jamais filtres d’entrée. Calendrier BLS/FOMC non exhaustif : association jour/résultat, sans causalité prétendue ni données d’annonces fictives.

Vérifier la reproduction des 16 replays d’août du Jeu 31, les préfixes des signaux M5/H1, les préfixes de journées, les coûts/quantités et les totaux. Tester les seuils, gaps, sessions courtes, changements d’heure/contrat, budgets et semaines tronquées. Commit/freeze avant nouveaux calculs. Exécution et sélection restent désactivées, quels que soient les résultats.

Sources : [évaluation LucidFlex](https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account), [drawdown](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown), [compte funded distinct](https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account), [calendrier FOMC](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm), [BLS juin](https://www.bls.gov/schedule/2026/06_sched.htm), [BLS juillet](https://www.bls.gov/schedule/2026/07_sched.htm), [BLS août](https://www.bls.gov/schedule/2026/08_sched.htm).
