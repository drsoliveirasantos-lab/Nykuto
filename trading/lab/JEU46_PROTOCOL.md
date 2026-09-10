# Jeu46 — Sortie après invalidation clôturée du niveau de cassure

Préparation du 10 septembre 2026 avant toute performance nouvelle. Diego demande
de poursuivre les améliorations et de comprendre le gain par trade et les coûts
doublés. Une campagne bornée compare une hypothèse de sortie à risque constant.

## Paramètres exécutables

<!-- POLICY46:START -->
```json
{
  "policy": {
    "version": "jeu46-closed-invalidation-v1",
    "from": "2026-01-01",
    "end": "2026-09-01",
    "variant": null,
    "mode": "funded",
    "accountInitialUSD": 50000,
    "riskMaximumUSD": 100,
    "dailyLossUSD": 200,
    "targetR": 2,
    "reset": "new-account-each-month",
    "expectedSessions": 166,
    "availableCommonSessions": 164,
    "executionCount": 64,
    "missingSessionPolicy": "exclude-entire-common-session-carry-account-no-assumed-pnl",
    "winterPreparation": "available-complete-sessions-from-2026-01-01-no-december",
    "summerPreparation": "exact-game37-may-warmup-june-july-historical-august",
    "independent": false,
    "confirmed": false,
    "selection": null,
    "executionAllowed": false,
    "reference": "baseline",
    "priorCandidate": "mnq-time-exit30",
    "invalidation": "first-surviving-closed-M5-strictly-back-through-original-breakout-level",
    "longCondition": "closed-price-less-than-rangeHigh",
    "shortCondition": "closed-price-greater-than-rangeLow",
    "equalityInvalidates": false,
    "entryBarEligible": true,
    "fill": "next-open-original-gap-risk-stop-target-priority",
    "occupiedExitSlot": true,
    "stopMoved": false,
    "reversePosition": false,
    "combinedVariants": false,
    "parameterSearch": false,
    "modelInferences": 0,
    "newConfigurations": 2,
    "exactControls": 32,
    "accountPrefixes": 1312,
    "filterPrefixes": 1312,
    "contextPrefixes": 1312,
    "criterion": "separate-Game45-gates-against-baseline-and-prior-candidate; progression-requires-both",
    "costsDoubled": "commission-and-modeled-slippage-only-risk-cap-remains-100-USD"
  },
  "variants": [
    {
      "id": "baseline",
      "timeExitSymbol": null,
      "invalidationSymbol": null,
      "control": true
    },
    {
      "id": "mnq-time-exit30",
      "timeExitSymbol": "MNQ",
      "invalidationSymbol": null,
      "control": true
    },
    {
      "id": "mnq-closed-invalidation",
      "timeExitSymbol": null,
      "invalidationSymbol": "MNQ",
      "control": false
    },
    {
      "id": "mes-closed-invalidation",
      "timeExitSymbol": null,
      "invalidationSymbol": "MES",
      "control": false
    }
  ]
}
```
<!-- POLICY46:END -->

## Mécanisme et différence avec les essais antérieurs

Après une entrée cassure/retest sur MNQ ou MES, examiner chaque M5 clôturée,
dès la M5 d'entrée. Pour un achat, une clôture strictement sous `rangeHigh`
invalide le maintien au-dessus de l'ancienne résistance. Pour une vente, une
clôture strictement au-dessus de `rangeLow` invalide le maintien sous l'ancien
support. L'égalité au niveau ne suffit pas. Une simple mèche non plus.

Ces niveaux sont ceux du range cash09:30–10:00 New York déjà inscrit dans le
signal avant l'entrée. Aucun pivot choisi après coup, ATR, durée ou seuil
optimisé. Il s'agit d'une hypothèse Nykuto dérivée du motif d'entrée existant,
pas d'une technique annoncée comme rentable par une vidéo.

Le stop, les limites de compte/journalière et la cible restent prioritaires
sur la M5 qui fournit la décision. Si la position survit et invalide son
niveau à la clôture, programmer la sortie à l'ouverture de la M5 suivante.
Ne jamais simuler une exécution au prix de la clôture qui a donné la décision.
À l'ouverture suivante, les priorités historiques de gaps/risque/stop/cible
restent conservées. Sinon, sortir à l'open, raison `Closed range invalidation`.
La sortie cash15minutes avant la clôture reste prioritaire si elle coïncide.
Les extrêmes futurs de la M5 de sortie ne doivent pas modifier ce prix.

Le créneau de sortie M5 entier reste occupé, puis les admissions suivantes
doivent être rejouées avec les quotas et l'état du portefeuille. Pas de
retournement automatique, réentrée forcée, stop déplacé, cible3R ou quantité
augmentée. Un trade invalidé peut repartir ensuite : compter les gagnants
sacrifiés et les effets sur les autres marchés.

Cette règle ne correspond ni au filtre de distance1σ sans effet du Jeu43,
ni au délai d'entrée d'une M5 rejeté au Jeu36, ni à la sortie temporelle30min
du Jeu45. Elle intervient après entrée, à un niveau fixé avant celle-ci.

## Deux variantes nouvelles et deux témoins

1. `baseline` : référence Jeu40 fixed100 sans nouvelle sortie.
2. `mnq-time-exit30` : candidate expérimentale Jeu45 inchangée, témoin entier.
3. `mnq-closed-invalidation` : nouvelle sortie uniquement sur MNQ.
4. `mes-closed-invalidation` : nouvelle sortie uniquement sur MES.

Aucun cumul des deux nouvelles sorties, ni cumul avec la sortie30min.
MGC conserve sa réintégration du range et son admission avant11h ; MES garde
le filtre RSI original ; MYM est exclu des entrées. Les quatre flux natifs
restent requis pour la couverture commune. Fenêtre des entrées inchangée.

Janvier–août2026,164/166 séances disponibles, huit comptes50K mensuels neufs,
coûts normaux puis doublés : **64 relectures**, dont **32 comptes témoins
entiers** rapprochés de l'archive45 (16référence40 et16candidate30minutes).
Prix et archives contrôlés par tailles/SHA256. Les25février et6mars restent
absents, pas des journées à zéro. Février/mars sont explicitement partiels.
Les mêmes observations sont déjà vues ; aucune confirmation indépendante.

Préparation des contextes et filtres strictement identique à la référence40,
y compris ses limites historiques documentées. Chaque préfixe quotidien
reconstruit contexte, filtre et portefeuille :1312 contrôles par couche.
Trades, journées et décisions d'admission doivent être causaux.

## Gain par trade et critères fixés avant calcul

La moyenne nette de tous les trades inclut les pertes. La moyenne des seuls
gagnants et la perte moyenne sont publiées séparément. Une hausse de cette
moyenne obtenue en retirant beaucoup de trades peut réduire le total : les
deux métriques sont nécessaires, à risque et coût comparables.

Évaluer chaque nouvelle variante **séparément contre les deux témoins**.
Pour chaque comparaison, les16 cellules mois/coût doivent avoir un net non
inférieur, un drawdown réalisé non supérieur, aucun compte en dépassement,
au moins une amélioration stricte du net et une moyenne nette agrégée par
trade supérieure aux deux niveaux de coûts. Une moyenne inconnue échoue.

Le rapport garde les deux verdicts. Le champ `progressionGatePassed` exige
les deux : battre seulement l'ancienne référence ne constitue pas un progrès
par rapport à la candidate30minutes. Ce critère est descriptif, pas un test
de significativité statistique, et ne déclenche aucune sélection ou activation.
Ne pas déplacer les règles ni assouplir les critères après les résultats.

Publier net, nombre de trades, moyenne de tous les trades, moyenne des gagnants,
perte moyenne, profit factor, frais, drawdown mensuel, mois perdants et objectifs.
Réconcilier les trades communs modifiés, retirés et nouveaux, les gagnants
sacrifiés et les conséquences sur les autres marchés. Dédupliquer les mêmes
opportunités entre les deux scénarios de coûts ; afficher la concentration
des améliorations et les limites des soustractions arithmétiques.

## « Coûts doublés » ne change pas le plafond de risque

Le scénario stress multiplie par2 les commissions ET le glissement de prix
hypothétique. Le glissement modélise une exécution moins favorable que le
prix de référence. Dans ce moteur, ces deux éléments sont déduits ensemble
en dollars par aller-retour ; le spread et la latence ne sont pas observés.

Exemple du modèle, **un microcontrat MNQ** :2,50USD de commission aller-retour
et1USD de glissement modélisé donnent3,50USD normaux, puis7USD doublés. Sur un
gain brut hypothétique de100USD, il reste96,50USD ou93USD nets. Ces frais ne
sont pas un barème de courtier vérifié.

Le risque planifié maximal reste **100USD, frais compris**, et la limite
journalière200USD. Les quantités entières sont recalculées : davantage de
coûts peut réduire la taille ou refuser l'entrée. Le stress n'est donc pas
une simple soustraction supplémentaire sur une liste de trades inchangée.
Les gaps restent susceptibles de dépasser le budget nominal. La cible reste
2R brut du risque de prix ; elle n'est pas un bénéfice net garanti de200USD.

## Gel, tests et lancement unique

Le moteur46 est une dérivation séparée du moteur45 ; aucun fichier historique
gelé n'est modifié. Tests synthétiques long/short, MNQ/MES, deux coûts,
égalité/mèche, décision dès la M5 d'entrée, gagnant sacrifié, gaps, limite
journalière, stop/cible simultanés, occupation, causalité et clôture cash.
Les deux témoins doivent conserver leur compte entier exact.

Publier les politiques, tests et dépendances gelées avant la première mesure.
Le runner exige ce commit, refuse tout dossier de sortie existant et écrit
statut/progression/empreintes privées. Le registre109/catalogue126 reste
l'historique achevé jusqu'à vérification des résultats et ajout des deux
configurations exécutées, quel que soit leur résultat.

Les prix et trades restent hors du dépôt public. Aucun nouvel accès payant,
modèle, ordre, activation Paper/Shadow, déploiement, modification de collecte
Jeu08 ou du rendez-vous du3décembre. Après lancement, annoncer la durée estimée
puis arrêter sans attendre les résultats ni surveiller GitHub. Le prochain
« Vérifie » autorise une relecture, pas une nouvelle campagne automatique.
