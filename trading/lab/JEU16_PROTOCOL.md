# Jeu 16 — stop structurel et marge après coûts

Défini le 9 septembre 2026 avant le premier calcul de ce jeu. Une seule
nouvelle variante, issue du diagnostic du Jeu 15 : développement adaptatif sur
un historique déjà examiné, jamais confirmation indépendante. Les anciens
moteurs, protocoles, rapports et captures restent inchangés.

## Comparaison fixée

- Référence : `entry5trend30` du Jeu 15, stop ATR14 × 1,25 et budgets actifs.
- Variante : mêmes signaux Pullback 5 min, même contexte EMA9/21 et ADX14 ≥20
  sur 5/30 min, mêmes Long et Short. Seuls le stop et le contrôle de marge
  décrit ci-dessous changent ensemble. Ce jeu ne permettra donc pas d'attribuer
  leur effet séparément. Aucun autre filtre, réglage ou classement après résultat.
- Un pivot 5 min est un low strictement inférieur (ou high strictement supérieur)
  aux deux bougies de gauche et aux deux de droite. Les cinq bougies doivent
  être contiguës et de la même séance. Les égalités ne forment pas de pivot.
  Le pivot devient connu seulement à la clôture de la deuxième bougie de droite.
- Utiliser le dernier low confirmé encore intact en Long, ou high en Short,
  disponible à la clôture du signal. Un retour au niveau du pivot l'invalide ;
  aucun retour à un ancien pivot. Remise à zéro à chaque séance et bloc.
- Entrée à l'open 5 min suivant le signal. Stop un tick (0,25 point) derrière
  le pivot. Si aucun pivot n'est disponible, s'il est déjà invalidé ou si l'open
  traverse/touche le pivot, refuser. Jamais de déplacement du stop pour faire
  rentrer un trade dans le budget, ni d'entrée déduite du low/high futur.
- Target 1,5 fois la distance au stop, arrondie vers le bas en nombre de ticks
  comme la référence. Refuser dans la variante si le gain à la target après
  coûts est inférieur à la perte au stop après coûts : ratio net prévu ≥1.
  Ce ratio minimal de 1 est un filtre de marge, pas un objectif de prix 1:1.

## Risque et exécution conservés

Un MNQ, $2/point, tick 0,25, une position, trois entrées maximum par séance,
freins à deux pertes consécutives ou −2R réalisés. Risque prévu stop + coûts
≤50 $, budget de perte journalier 100 $, réserve 100 $ au-dessus du seuil MLL.
Sortie à l'open 15 minutes avant clôture cash (y compris séance raccourcie).
Coût hypothétique 3,50 $ puis 7 $ par aller-retour. Les deux simulations sont
rejouées entièrement : refus et pauses peuvent modifier la séquence des trades.
Ces hypothèses ne sont pas les frais certifiés d'une plateforme Lucid ; aucune
réduction de coût supposée pour améliorer le résultat. Le forfait comprend
commissions et slippage supposé, pas abonnement, achat/reset, payout ou impôts.

La mécanique de compte du Jeu 15 est conservée : 25 000 $ initiaux, plancher
initial 24 000 $, EOD trailing de 1 000 $ plafonné à 25 100 $, contrôle des
pertes latentes, arrêt définitif au breach ou à l'objectif de 1 250 $ avec
consistency ≤50 % stricte. Pas de reset dans une fenêtre, pas de funded simulé.
La première limite adverse est exécutée, stop avant target si ambiguïté.
Un gap peut dépasser les budgets ; les sorties sur OHLC5 min ne prouvent ni
la séquence tick par tick ni les fills d'un broker. Aucun break-even/trailing
stop nouveau, aucune martingale, aucun changement de quantité.

## Données, critères et arrêt

Source Jeu 14 exacte et immuable : SHA256
`028e914bb10ea38b73b6fcbc867c5d81937b967701448913fc88ca85746557cf`.
Même `inspectHistory`, mêmes warmups, rollovers et calendriers : 330 séances
évaluables, cinq fenêtres de deux mois complètes, trois incomplètes affichées
sans performance. Aucune interpolation ni sélection a posteriori des dates.
Le diagnostic sur 330 séances ne représente pas un compte continu ; les
comptes par fenêtre réutilisent ces observations et ne sont pas indépendants.
Prix récupérés après la période, sans archive live de leur état intrabar.

Critères du Jeu 15 inchangés : ≥40 trades, ≥12 dans chacune des cinq fenêtres
complètes, chaque fenêtre positive, PF en R ≥1,10 avant arrondi, drawdown
réalisé ≤8R, total stress positif, aucun breach normal ou stress. Afficher aussi
les dollars, PF en dollars, brut/coûts/net, gain/perte moyens, jours positifs,
négatifs et sans trade, refus, sorties ambiguës et fréquence 0/1/2/3 trades.
Les comptes s'arrêtent à leur objectif ou breach ; le diagnostic continue
sur toute la couverture. La référence doit reproduire les trades du Jeu 15.

Une seule comparaison référence/variante aux coûts 1 et 2. Pas de grille
d'optimisation, sélection d'heure/sens après résultat ou répétition pour obtenir
un gain. Une correction technique démontrée doit être documentée ; elle ne peut
pas changer les paramètres pour rendre le résultat favorable. Un éventuel
résultat prometteur reste du développement, pas une autorisation Paper ou live.

## Audit et publication

Tester sur fixtures avant performance : confirmation retardée des pivots,
égalités, gaps, frontières de séance, Long/Short, ticks, refus et marge nette.
Comparer les signaux par préfixes et l'ajout de bougies futures ; vérifier
chaque pivot retenu, chaque risque/coût, l'absence de lecture du high/low d'entrée
pour décider, et les replays par préfixes de séances. Épingler par SHA256 les
dépendances du moteur et conserver un commit local de gel avant résultat.

Nouveau préfixe privé `jeu16/structural-v1/`, sans écraser d'archives. Seuls le
rapport agrégé et le bilan exact, favorable ou défavorable, vont dans Git et
le Lab sur `feat/trading-hq-v1` / PR83. Ne pas modifier les règles CI, main,
les autres sites, les comptes membres ni les deux tâches MNQ. Aucun broker,
ordre, Paper Bot, Shadow, achat ou flux live ajouté ou activé.
