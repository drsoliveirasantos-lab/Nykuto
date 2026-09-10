# Jeu 34 — objectif personnel de 1 000 euros et résultats par semaine

**Chaque mois repart de 50 000 dollars, avec zéro bénéfice et zéro jour qualifiant.
Aucun des trois mois ne permet le retrait de 1 000 euros dans les scénarios testés.**
Retirer le MYM améliore juin et réduit la perte d'août, mais détériore juillet.
Cette variante reste une piste de recherche, sans activation.

## Comparaison mensuelle

Compte funded supposé déjà obtenu avant le mois. Aucun frais d'achat ou délai
pour obtenir ce compte n'est simulé. Les gains de l'évaluation ne sont jamais
transférés au funded ; chaque étape dispose de son scénario séparé.

| Mois | Référence, net normal | Sans MYM, net normal | Sans MYM, coûts doublés | Retrait personnel simulé |
|---|---:|---:|---:|---:|
| Juin | +733,75 $ | +1 048,75 $ | +785,50 $ | 0 € |
| Juillet | +460,50 $ | +176,00 $ | +164,00 $ | 0 € |
| Août | -503,00 $ | -245,50 $ | -228,50 $ | 0 € |

Le MYM n'a pas seulement été soustrait du total : tous les signaux du portefeuille
ont été rejoués, avec les occasions libérées. Juin gagne 315 dollars, juillet
perd 284,50 dollars par rapport à la référence, août récupère 257,50 dollars.
Les résultats ne justifient pas de conserver après coup le MYM uniquement en
juillet : cela utiliserait l'issue du mois pour choisir la stratégie.

## Ce que rapporte chaque semaine

Nouvelle variante sans MYM, funded hypothétique. Les dates délimitent les séances
observées ; les semaines sont coupées au début et à la fin du mois. Les cumuls
repartent de zéro le mois suivant. La semaine du 15 juin comporte quatre séances
observées, celle du 1er juillet deux. Le 31 août est une portion de semaine seule.

| Mois | Séances de la semaine | Net normal | Net coûts doublés | Cumul mensuel normal | Versement personnel simulé |
|---|---|---:|---:|---:|---:|
| Juin | 01/06–05/06 | +347,00 $ | +189,00 $ | +347,00 $ | 0,00 € |
| Juin | 08/06–12/06 | -15,25 $ | -5,00 $ | +331,75 $ | 0,00 € |
| Juin | 15/06–18/06 | +13,50 $ | +3,00 $ | +345,25 $ | 0,00 € |
| Juin | 22/06–26/06 | +573,50 $ | +478,50 $ | +918,75 $ | 0,00 € |
| Juin | 29/06–30/06 | +130,00 $ | +120,00 $ | +1 048,75 $ | 0,00 € |
| Juillet | 01/07–02/07 | +150,00 $ | +140,00 $ | +150,00 $ | 0,00 € |
| Juillet | 06/07–10/07 | -241,00 $ | -184,00 $ | -91,00 $ | 0,00 € |
| Juillet | 13/07–17/07 | +141,00 $ | +123,00 $ | +50,00 $ | 0,00 € |
| Juillet | 20/07–24/07 | -27,00 $ | -38,50 $ | +23,00 $ | 0,00 € |
| Juillet | 27/07–31/07 | +153,00 $ | +123,50 $ | +176,00 $ | 0,00 € |
| Août | 03/08–07/08 | -150,50 $ | -59,00 $ | -150,50 $ | 0,00 € |
| Août | 10/08–14/08 | +347,00 $ | +190,00 $ | +196,50 $ | 0,00 € |
| Août | 17/08–21/08 | -167,00 $ | -80,50 $ | +29,50 $ | 0,00 € |
| Août | 24/08–28/08 | -275,00 $ | -279,00 $ | -245,50 $ | 0,00 € |
| Août | 31/08–31/08 | +0,00 $ | +0,00 $ | -245,50 $ | 0,00 € |

Le maximum théoriquement retirable est également nul à toutes les clôtures
hebdomadaires de ces scénarios. Aucun petit retrait n'est simulé avant l'objectif.
Ce tableau présente des gains/pertes de trading et une simulation de versement,
pas un revenu réel. L'hypothèse de mois neufs n'est pas la vie d'un compte continu
et ne représente pas des réinitialisations gratuites.

## Combien rapporte un trade ?

Observations regroupées des trois mois, coûts normaux ; moyennes pondérées par
le nombre de trades. Ces statistiques ne transforment pas les mois en compte continu.

| Mesure | Référence à quatre marchés | Nouvelle variante sans MYM |
|---|---:|---:|
| Trades | 62 | 48 |
| Gagnants / perdants | 26 / 36 | 22 / 26 |
| Gain moyen des gagnants | +137,77 $ | +138,45 $ |
| Perte moyenne des perdants | −80,30 $ | −79,49 $ |
| Moyenne de tous les trades | +11,15 $ | +20,40 $ |
| Meilleur trade | +173 $ | +165 $ |
| Pire trade | −100 $ | −100 $ |

Le gain moyen des gagnants n'est pas ce que rapporte chaque entrée. Les pertes
et les journées sans trade doivent rester visibles. Les montants ci-dessus sont
nets des coûts de trading du modèle, avant partage Lucid et conversion.

## Peut-on viser 500–900 par trade ?

À cible 2R, viser 500–900 dollars nets demande un risque tout compris supérieur
à 250–450 dollars. Si la cible est en euros, au taux de comparaison retenu,
500–900 EUR correspond à 582,60–1 048,68 USD : risque théorique de départ
291,30–524,34 USD, encore à relever pour couvrir les frais. C'est déjà environ
14,6–26,2 % de la marge initiale de perte de 2 000 USD.

Plus précisément, si C est le coût aller-retour total et G le gain net ciblé,
le risque prix d'une cible 2R vaut (G+C)/2 ; le risque total au stop vaut
(G+3C)/2. Les contrats entiers et le stop structurel peuvent encore empêcher
une taille exacte. Ces calculs sont des relations de risque, pas une probabilité
de réussite ni une recommandation d'augmenter la taille.

Avec le plafond actuel de 100 USD frais compris et la cible 2R, un gain reste
inférieur à 200 USD dans le modèle. Conserver 100 dollars de risque tout en
visant 500–900 USD nécessiterait une autre sortie, supérieure à 5–9R. Son taux
de réussite ne peut pas être supposé identique. Aucun risque augmenté n'a été
appliqué ; l'objectif mensuel n'est pas forcé par la taille.

## Pourquoi 1 000 dollars de gain ne donnent pas 1 000 euros de retrait

Pour le funded LucidFlex 50K : cinq journées distinctes à au moins 150 USD,
profit de cycle positif, retrait minimum 500 USD et maximum 50 % du profit,
plafonné à 2 000 USD. Le trader reçoit 90 %. La cohérence 50 % de l'évaluation
ne s'applique pas au funded.

Conversion fixe de comparaison : **1 EUR = 1,1652 USD**, BCE du 9 septembre 2026,
consultée le 10 septembre. Le taux n'est pas celui de chaque semaine passée et
n'est pas un tarif de conversion garanti. Pour 1 000 EUR après partage :
**1 294,67 USD de demande brute, donc 2 589,34 USD de bénéfice minimum** et cinq
jours qualifiants. Fiscalité et frais de change/transfert non inclus.

En juin sans MYM, seulement quatre journées atteignent 150 dollars et le
bénéfice est de 1 048,75 dollars. En juillet, cinq jours qualifient, mais le
bénéfice n'est que de 176 dollars ; août est négatif. Aucun objectif atteint.

Le modèle attend cette demande unique, puis déduit le retrait brut, verrouille
le seuil à 50 100 USD et arrête le mois. Une approbation immédiate est une
hypothèse de simulation. Aucun paiement réel n'est sollicité.

Sources : [retraits LucidFlex](https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts),
[funded](https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account),
[seuil de perte](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown),
[limites de contrats](https://support.lucidtrading.com/en/articles/12945808-lucidflex-scaling-plan),
[taux BCE](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html).

## Contrôles et suite

Gel publié avant résultats : `5a23869cf02cc0bd798fb400c87719c9f1e61da8`.
24 replays, dont six témoins reproduits du Jeu 33 ; trois nouvelles configurations
étape/portefeuille et une seule nouvelle variante de stratégie. 512 préfixes de
journées et 418 enregistrements de trades contrôlés, avec répétitions. Toutes les
réconciliations passent. Les cas synthétiques testent aussi un objectif atteint,
la déduction du retrait, le verrouillage du seuil et l'arrêt des semaines suivantes.

La référence évaluation et le funded ont ici les mêmes trades : aucun seuil de
passage ou de retrait n'est atteint. Cela ne rend pas les deux étapes équivalentes.
Les résultats restent exploratoires sur des observations déjà vues. La priorité
suivante est de comprendre les entrées perdantes restantes, puis de confronter
une règle fixée à des données nouvelles, plutôt que viser un gros gain unitaire.

[Protocole](JEU34_PROTOCOL.md) · [Rapport agrégé](jeu34-report.json) ·
[Empreintes](jeu34-freeze.json) · [Manifeste](jeu34-archive.json).
Sources et trades privés archivés sous `jeu34/monthly-withdrawal-v1/`, puis
relus intégralement. Aucun prix brut, trade individuel ou secret dans Git.
