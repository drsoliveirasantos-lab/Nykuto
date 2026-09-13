# Jeu 36 — attendre une confirmation supplémentaire avant l'entrée

Demande du 10 septembre : continuer les améliorations, profil par marché et
risque inchangé. Les extensions 3R du Jeu 35 ont échoué. Sur ses trois mois
témoins aux coûts normaux, 6 des 11 pertes MNQ et 5 des 10 pertes MES se
produisent dans la bougie d'entrée. Ce constat exploratoire motive le test ;
ce n'est pas une preuve que retarder l'entrée améliorera le résultat.

## Règle fixée avant nouveau calcul

| Variante | MNQ | MES | MGC |
|---|---|---|---|
| Témoin | Entrée actuelle | Entrée actuelle + RSI | Réintégration avant 11 h |
| MNQ confirmation | Une confirmation M5 | Identique au témoin | Identique au témoin |
| MES confirmation | Identique au témoin | Une confirmation M5 + RSI | Identique au témoin |

Base : Jeu 34 sans MYM, reproduit par le témoin du Jeu 35. Chaque signal
initial doit déjà avoir passé les filtres actuels. Sur le seul marché modifié,
attendre exactement la bougie M5 suivante entièrement clôturée :

1. Le stop original du retest n'a pas été touché, même par une mèche.
2. La clôture reste au-delà de la borne du range d'ouverture : au-dessus pour
   l'achat, en dessous pour la vente. Une traversée intrabar du niveau suivie
   d'une clôture correcte reste permise, tant que le stop est intact.
3. Le corps est dans le sens de l'entrée et la clôture progresse strictement
   par rapport à celle du retest : plus haute pour l'achat, plus basse pour
   la vente. Pas de seuil ajusté après observation.
4. Entrer à l'ouverture suivante, cinq minutes après l'horaire initial, au
   plus tard à midi New York. Même journée et même contrat ; sinon annulation.
5. Recontrôler le filtre existant au nouvel horaire : pour MES, RSI Wilder14
   connu, pas d'achat >70 ni vente <30. Aucun ancien signal refusé ressuscité.

Un signal non confirmé est annulé, sans attente supplémentaire ni place
consommée. Les nouveaux retests historiques restent des candidats distincts.
Pas d'entrée au prix ancien après avoir observé la confirmation. L'open réel
suivant détermine le risque et la quantité entière, au stop original intact ;
si le risque ou le ratio net ne convient plus, le moteur refuse l'entrée.
Il peut donc y avoir moins de contrats. Le stop n'est jamais élargi pour
récupérer une entrée refusée. Les autres marchés peuvent occuper la place
pendant les cinq minutes d'attente : tout le portefeuille est rejoué.

La cible reste à 2R de distance de prix depuis la nouvelle entrée, avant
coûts. Risque prévu maximum 100 USD tout compris, réduction 50/25 selon marge,
20 micros maximum, une position, deux entrées par jour, perte quotidienne
200 USD, réserve 100 USD. Gaps et règle pessimiste stop avant cible conservés.
Pas de sortie partielle, déplacement de stop ni report de nuit. Sortie au plus
tard quinze minutes avant clôture cash. Drawdown réalisé entre trades ; durées
M5 minimales, sans prétendre connaître les horaires intrabar.

## Distinction avec les recherches existantes

Les registres des deux branches ont été consultés. Le Jeu 24 et l'audit F1
portent sur des confluences/figures ; le Jeu 27 de recherche autorise une
réentrée après sortie ; le Jeu 28 déplace un stop après 1R ; le Jeu 32 ajoute
un alignement EMA9/21 H1/M5. Ici, l'entrée attend une deuxième clôture après le
retest, sans ajouter d'indicateur. Ce n'est pas une reproduction de la méthode
H1 20/50 + réactions sur pivots/Daily Open décrite dans l'appel. Ses paramètres
encore inconnus et les observations nocturnes manquantes restent documentés
dans ASSOCIATE_METHOD_2026-09-10.md. MGC et la cible 2R sont préservés.

## Comptage, suivi et décision

Trois mois déjà vus : juin, juillet et août 2026, chacun avec un compte neuf
50K. Étapes évaluation et funded déjà obtenu distinctes, coûts normaux et
doublés. 36 replays, dont 12 témoins exactement identiques au Jeu 35. Quatre
nouvelles configurations (deux marchés modifiés, deux étapes), deux variantes
de stratégie. Aucune confirmation indépendante ; aucun assemblage des deux
filtres ni choix différent par mois après résultat.

Suivi hebdomadaire et mensuel, contributions par marché, moyenne gagnants,
perdants et tous trades, drawdown, refus et entrées communes/retirées/nouvelles.
Les entrées communes sont rapprochées par le retest d'origine même si leur
horaire diffère. Le résultat inclut les gagnants abandonnés et les occasions
déplacées sur les autres marchés, sans simplement soustraire les pertes.

Objectif personnel et hypothèses du Jeu 34 inchangés : un versement de
1 000 EUR après 90/10, change fixe 1,1652 USD/EUR, hors impôts et frais de
change/transfert. Seuil de bénéfice modélisé 2 589,34 USD, cinq journées à
150 USD ; demande brute 1 294,67 USD et arrêt du mois après versement supposé
immédiat. Aucun bénéfice d'évaluation retirable, aucune transition automatique
vers funded. La remise à zéro est une hypothèse de simulation.

Critère fixé : une piste favorable ne dégrade le net d'aucun mois/coût/étape,
n'augmente aucun drawdown et améliore au moins une cellule. Sinon conserver
l'entrée actuelle. Même favorable, aucune activation ni qualification de
rentabilité : les observations ont déjà servi au développement. Zéro
promotion réelle/Paper/Shadow, réserve prospective toujours fermée.

## Audit et reproduction

Gel commité et publié avant performance. Sources privées et témoin Jeu 35
épinglés par taille/SHA-256. Moteur de compte Jeu 34 importé sans modification.
Tests synthétiques : causalité de la confirmation, stop touché, symétrie,
RSI au nouvel horaire, midi, open suivant et occupation d'un autre marché.
Contrôle de chaque préfixe de journée avec confirmations reconstruites, des
risques/cashflows/cibles et des douze témoins complets. Sources et transactions
privées archivées séparément ; seuls code, protocole et agrégats publiés.
