# Jeu 28 — protection après une clôture à +1R

Protocole du 9 septembre 2026, écrit et gelé avant tout calcul de performance
du Jeu 28. Une seule hypothèse, quatre microcontrats, aucun balayage de seuils.

## Pourquoi cette analyse

Les Jeux 24–25 ont déjà étudié tendance, structure, dynamique, volume et figure
de bougie ; leur combinaison ne qualifie aucune configuration. Le Jeu 26 a
changé la famille d'entrée. Le Jeu 27 ajoute des réentrées, mais les six ajouts
MNQ perdent 431 USD et dégradent le témoin. Ajouter des indicateurs ou des
trades n'est donc pas une amélioration démontrée.

Le Jeu 28 revient au témoin Jeu 23 fixed150 et isole la gestion d'une position
déjà favorable. Hypothèse : rapprocher le stop après une clôture à +1R pourrait
réduire les pertes de retournement, au prix de certaines cibles coupées trop
tôt. Le seuil 1R est une convention simple décidée ici ; il n'est ni optimisé
sur des excursions historiques ni annoncé comme une valeur optimale.

Les analyses mesurées sont le net, les deux fenêtres temporelles, le drawdown,
les jours positifs/négatifs/sans trade, les coûts doublés et les effets appariés
sur les mêmes entrées. Les améliorations et dégradations sont toutes conservées.
Un carnet d'ordres, delta acheteur/vendeur ou filtre d'actualité demanderait des
sources historiques horodatées absentes de ce jeu ; les OHLCV ne les remplacent
pas. Aucun signal d'actualité, niveau lu sur image ou prix futur n'est inventé.

## Règle unique

1. Entrées : générateur Jeu 23 inchangé, cassure clôturée de la zone 09:30–10:00
   New York puis retour distinct, entrée au prochain open avant 12:00.
2. Au plus une entrée exécutée par sens et par jour, deux au total. Les
   réentrées du Jeu 27 ne sont pas cumulées avec cette expérience.
3. Stop initial structurel derrière la mèche du retour, cible fixe 1,5R,
   filtre de rapport net, admission et refus hérités du Jeu 23.
4. R représente la distance de prix entre entrée réelle et stop initial.
   Sur chaque bougie de cinq minutes, traiter d'abord les sorties avec le stop
   déjà actif, la cible et les freins. Si la position survit et que sa clôture
   est à au moins +1R brut dans le sens du trade, préparer le nouveau stop.
   Une mèche seule n'active rien. Le stop initial garde la priorité si touché
   pendant cette bougie, même si sa clôture serait favorable.
5. Le nouveau stop est entrée + sens × nombre de ticks couvrant les coûts.
   Nombre de ticks = plafond(coût total du trade / valeur d'un tick).
   Les coûts incluent les frais et le glissement forfaitaire déjà employés,
   rejoués entièrement au facteur 1 ou 2. Ce stop prend effet à la bougie
   suivante, jamais contre les extrêmes antérieurs de la bougie d'activation.
6. Un seul déplacement, toujours vers un risque moindre ; jamais au-delà de
   la cible ou de la clôture d'activation. Cible, risque initial en dollars
   et dénominateur R restent inchangés. Aucun stop suiveur supplémentaire.
7. Les gaps utilisent l'open réellement observé. Une sortie sous le prix
   préparé peut rester perdante : « break-even » désigne la règle de stop,
   pas une garantie de net nul. L'arrondi au tick peut donner un très petit
   gain de moins d'un tick après frais ; il sera compté comme gain dans le
   taux brut de trades gagnants, sans être présenté comme une nouvelle force
   prédictive. Le nombre de sorties par cette protection est affiché à part.

## Contraintes inchangées

Un microcontrat, une position, plafond d'admission 150 USD frais compris,
enveloppe quotidienne interne 300 USD, réserve du seuil 100 USD, freins
quotidiens en R et pertes consécutives conservés. Un gap peut dépasser un
budget prévu. Les quatre marchés sont des simulations séparées.

Le simulateur de compte 25K reste le modèle historique gelé au Jeu 15 ; ce
jeu ne certifie pas les conditions commerciales actuelles d'un fournisseur,
la file d'attente d'un ordre, sa latence ou un remplissage de courtier.
La première frontière adverse reste prioritaire, puis la cible ; clôture
avant la fin de séance et calendrier précédents conservés.

## Sources et preuve recherchée

- [CME, types d'ordres futures](https://www.cmegroup.com/education/courses/things-to-know-before-trading-cme-futures/futures-order-types),
  consulté le 9 septembre 2026 : le déclenchement d'un stop et son exécution
  sont distincts ; les types de protection et les limites affectent le prix
  et l'exécution. Notre modèle OHLC avec coût forfaitaire n'en reproduit pas
  toute la microstructure. CME n'établit pas la rentabilité de notre seuil 1R.
- [Bailey et al., The Probability of Backtest Overfitting](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf),
  consulté le même jour : multiplier les variantes sur les mêmes données
  favorise les faux positifs. Le registre, le gel et les fenêtres réservées
  rendent les essais traçables ; ils ne constituent pas une estimation de PBO.

Les données privées sont celles des Jeux 19/14 et le témoin est lu dans les
exécutions archivées Jeu 23 fixed150. Les empreintes figurent dans
`jeu28-source.json`. Aucun témoin n'est recalculé comme essai nouveau.

## Sélection préenregistrée

Janvier–février et mars–avril 2026 restent du développement déjà vu.
Les huit critères sont inchangés : couverture complète des deux fenêtres,
40 trades normaux au total, 12 par fenêtre, chaque fenêtre positive en R et
USD, profit factor en R ≥1,10, drawdown réalisé ≤8R, net stress positif en R
et USD, aucun franchissement du seuil sur les comptes complets aux deux coûts.
Une fenêtre incomplète bloque aussi le critère de compte ; elle n'est jamais
considérée sans perte par défaut. Les absences connues restent visibles.

Parmi les configurations éligibles : meilleure espérance de la moins bonne
fenêtre, puis drawdown inférieur, puis ordre déclaré des marchés. Sélection
et empreinte sont écrites avant la réserve. Sans éligible, mai–août reste
non calculé. Sinon, une seule candidate peut être évaluée une seule fois avec
la sélection épinglée. Aucun seuil ou filtre ne sera retouché pour ses résultats.

Les quatre nouvelles configurations s'ajoutent aux 61 précédentes : 65 au
registre, zéro confirmation indépendante. Les trois fenêtres prospectives et
leurs collectes ne sont pas modifiées. Paper, Shadow, broker et réel désactivés.

## Vérification et livrables

Avant performances, tests synthétiques : activation différée, mèche seule,
frontière exacte +1R, priorité stop/cible, symétrie Long/Short et quatre ticks,
coûts doublés, gap après activation, déplacement unique, budgets constants,
causalité, reset quotidien et rapprochement des mêmes entrées.

Le gel inclut runner, moteurs, dépendances transitives, tests, protocole et
empreintes des sources. Le runner refuse de réécrire des sorties existantes,
vérifie les préfixes de signaux et comptes, puis archive détails privés et
agrégats publics. Le rapprochement distingue les entrées communes améliorées,
dégradées ou au net identique, les entrées ajoutées et retirées. Leur somme
réconcilie exactement l'écart net ; un stop modifié n'est pas décrit comme
un trade supplémentaire lorsque l'entrée était identique.
