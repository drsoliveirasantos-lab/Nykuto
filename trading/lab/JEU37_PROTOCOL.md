# Jeu 37 — risque gradué et objectif mensuel de 4 000 USD

Demande du 10 septembre : risque adapté aux confirmations et au marché,
comparaison de plusieurs montants, calendrier journalier de juin/juillet/août.
L'objectif nouveau est interprété comme 4 000 USD de bénéfice du compte par
mois, après coûts, distinct d'un revenu personnel net de 4 000 EUR ou USD.

## Ce qui reste identique

Profils d'entrée du Jeu 36 témoin sans MYM : retest de cassure sur MNQ/MES,
filtre RSI actuel sur MES, cassure échouée sur MGC avant 11 h New York.
MGC conserve son risque nominal de 100 USD ; le score de continuation des
indices ne lui est pas appliqué. MYM reste exclu. Stop structurel fixe, cible
2R de distance de prix avant coûts, entrée au prochain open, maximum une
position et deux entrées par jour. Ordre simultané MES/MGC/MNQ/MYM inchangé.
Les variantes avec attente M5 ou cible 3R rejetées ne sont pas réintroduites.

## Les cinq familles de confirmations

Réutilisation causale du Jeu 24, sur la bougie signal M5 entièrement clôturée :

1. Tendance : EMA9/21 dans le sens du signal et clôture du bon côté du VWAP.
2. Structure : deux sommets et deux creux confirmés dans le sens du signal.
3. Momentum : RSI au-dessus de 50 pour achat, en dessous pour vente.
4. Volume : au moins la moyenne des cinq séances précédentes au même créneau.
5. Figure directionnelle admissible : englobante, rejet ou corps dominant,
   avec exclusion du doji selon les règles déjà gelées.

0–2 familles : faible ; 3–4 : intermédiaire ; 5 : complète. Si le contexte
supplémentaire n'est pas entièrement prêt, appliquer le niveau faible même
si les quelques informations connues concordent. Le signal obligatoire doit
toujours être valide : un montant plus petit ne rend pas un signal invalide
admissible. Les montants sont des plafonds de perte prévue, frais compris.

Ces familles sont corrélées : 5/5 n'est pas une probabilité de 100 %, ni cinq
preuves indépendantes. Le Jeu 25 utilisait déjà ce score avec 50/75/150 USD
sur un seul microcontrat ; il échouait sur les quatre marchés. Ici on teste
une allocation entière multicontrats dans le portefeuille 50K actuel. La
nouveauté est le dimensionnement et son impact sur le compte, pas le score.
Aucun H1 20/50 ni niveau nocturne n'est inventé.

## Six variantes préenregistrées

| Variante | MNQ/MES : faible / intermédiaire / complète | MGC | Limite quotidienne interne |
|---|---|---|---|
| Ancien témoin | 100 / 100 / 100 USD | 100 USD | 200 USD |
| Référence nouvel objectif | 100 / 100 / 100 USD | 100 USD | 200 USD |
| Fixe 250 | 250 / 250 / 250 USD | 100 USD | 500 USD |
| Gradué 250 | 50 / 150 / 250 USD | 100 USD | 500 USD |
| Fixe 500 | 500 / 500 / 500 USD | 100 USD | 1 000 USD |
| Gradué 500 | 100 / 250 / 500 USD | 100 USD | 1 000 USD |

Les limites quotidiennes augmentent explicitement avec l'intensité étudiée ;
les comparaisons gradué/fixe de même plafond partagent la même limite. Les
résultats ne doivent donc pas être attribués au seul score en comparant 250
ou 500 à la référence 100. Le scénario 500 est une exploration agressive :
500 USD représente 25 % de l'allocation initiale de perte de 2 000 USD.
Ni ordre réel, ni activation, ni recommandation de miser ce montant.

## Dimensionnement et protection du compte

Quantité entière = min(20, floor(plafond effectif / risque unitaire tout
compris)), avec les frais et le tick propres au marché. Refuser si zéro
contrat, ratio net inférieur à 1, limite journalière dépassée ou moins de
100 USD de réserve au-dessus du seuil de perte après perte planifiée.
Ne pas déplacer le stop pour rendre une taille admissible. Une entrée plus
risquée peut bloquer une autre entrée : rejouer tout le portefeuille.

État de réduction distinct du score : multiplicateur 1, 1/2 si marge sous
1 000 USD, 1/4 si sous 500 USD. Une réduction est immédiate ; une remontée
nécessite à nouveau un solde au moins égal à 50 000 USD et une marge suffisante.
Le choix ponctuel d'un petit risque pour un score faible ne réduit pas cet
état pour les prochains signaux. La réduction s'applique aussi à MGC100.

50K funded supposé déjà obtenu au début de chaque mois, seuil initial48K,
drawdown EOD2K et plancher verrouillé à50100. Stop avant cible si ambiguïté M5,
gaps au prix adverse et sorties de protection conservés. Le seuil MLL prend
en compte l'exposition latente via le moteur de remplissage ; le drawdown
publié est réalisé entre transactions, pas le maximum intrabougie complet.
La limite de20micros reste volontairement conservatrice, même lorsque Lucid
pourrait autoriser30/40. L'option DLL Lucid à l'achat est inconnue et n'est
pas simulée ; nos limites quotidiennes sont internes, pas des règles attribuées
au compte réel. Pas de report de nuit.

## Objectifs, retrait et calendrier

L'ancien témoin reproduit exactement le Jeu36 (arrêt après retrait personnel).
Les cinq nouvelles variantes continuent après le premier retrait personnel
modélisé jusqu'à une clôture de journée où le bénéfice cumulé de trading
atteint 4 000 USD, jusqu'à un compte invalidé ou jusqu'à la fin du mois.
Une deuxième demande de retrait n'est pas simulée.

Le premier versement personnel conserve les hypothèses du Jeu34 :1 000 EUR
après90/10, change fixe1,1652USD/EUR, demande brute1 294,67USD, cinq jours à
150USD et bénéfice suffisant. Réinitialiser les jours qualifiants après le
versement. Déduire réellement la demande du solde et verrouiller le seuil à
50100USD. Le traitement est supposé immédiat ; frais FX/transfert et impôts
non inclus. Le nouveau risque tient compte de la marge réduite après retrait.

Bénéfice de trading = solde − capital initial + retraits bruts. Un retrait
n'est ni une perte de trading ni un revenu ajouté une deuxième fois. Le
drawdown de performance exclut ce flux de trésorerie. Le but personnel peut
être atteint sans les4K, et les4K peuvent être atteints sans assez de jours
qualifiants pour retirer. Aucun transfert de gains d'évaluation n'est simulé.

Afficher séparément sur le calendrier : gains/pertes, journées sans trade,
arrêt après objectif ou invalidation, week-ends et journées non étudiées dans
le calendrier cash existant. Ce dernier ne représente pas toutes les heures
de négociation des futures. Chaque mois repart d'un compte neuf en simulation.

## Comparaison et décision avant résultats

36 replays =6 variantes ×3mois ×2coûts, tous funded. Six anciens témoins et
cinq nouvelles configurations, dont quatre politiques de risque nouvelles ;
la référence100 mesure séparément le nouveau cycle d'objectif/retrait.
Coûts doublés signifie frais et glissement doublés, pas un ratio1:1.

Publier tous les mois et jours, gains/pertes, drawdown, compte invalidé,
objectif4K, versement personnel, risques réellement exécutés et grades.
Comparer gradué250 à fixe250 et gradué500 à fixe500. Publier aussi les
résultats des grades sous référence100, pour ne pas confondre score et taille.
Les groupes ne concernent que les signaux exécutés et ne calibrent aucune
probabilité. Ne pas choisir de poids, seuil, montant ou profil par mois après
résultat. Une amélioration d'un seul mois ne suffit pas.

Une piste atteint l'objectif de cette recherche seulement si les4K sont
atteints dans chacun des trois mois aux deux coûts, sans invalidation et avec
drawdown réalisé <=1 000USD dans chaque cellule. Même si ce critère est atteint,
aucune promotion automatique : ce sont des observations déjà vues. Aucun
nouveau holdout, aucune activation réelle/Paper/Shadow.

## Audit et sources

Gel publié avant performance, 6 témoins complets, comparaison des trades
référence100 au moteur précédent tant que son objectif terminal n'interrompt
pas la comparaison, préfixes de journées identiques, risque/taille/stop/cible
et cashflows vérifiés. Ancienne initialisation d'août conservée exactement.
Sources et trades privés archivés, agrégats seuls publiés.

Règles officielles relues le10septembre2026 :
- [Funded](https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account)
- [Retraits](https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts)
- [Drawdown et verrouillage après retrait](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown)
- [Scaling](https://support.lucidtrading.com/en/articles/12945808-lucidflex-scaling-plan)
- [Option de perte quotidienne](https://support.lucidtrading.com/en/articles/16226050-lucidflex-customization)
