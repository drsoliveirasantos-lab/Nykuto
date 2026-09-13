# Jeu 27 — diagnostiquer les filtres avant une nouvelle stratégie

Préenregistré le 9 septembre 2026. Le registre contient 57 configurations des
Jeux 19–26. Douze nouveaux essais exploratoires : quatre marchés, trois variantes.
Les règles antérieures gelées ne sont pas modifiées. Aucun réglage après résultats.

## Question et comparaison

Le Jeu 24 conserve six signaux sur 209 et au plus deux trades par configuration.
Le Jeu 25 réduit parfois le drawdown mais toutes ses secondes fenêtres perdent.
Cette campagne mesure les suppressions d'entrées au même risque, avant de changer
simultanément signal, unités de temps, objectifs et gestion du compte.

1. **Sans volume** : tendance + structure + RSI + figure, définition Jeu 24.
2. **Sans figure** : tendance + structure + RSI + volume, définition Jeu 24.
3. **Tendance seule** : EMA9/21 M5 et côté VWAP, définition Jeu 24.

Les deux premières enlèvent une seule famille du filtre strict. La troisième
mesure le filtre de tendance seul par rapport au Jeu 23. Il ne s'agit PAS d'un
test H1/M5 ni d'une reproduction de la méthode discrétionnaire de l'associé.
Les contrôles de données absentes restent bloquants pour les familles requises.

Entrée, stop structurel, cible 1,5R, un microcontrat, plafond 150 dollars frais
compris, limite quotidienne interne 300 dollars et réserve 100 dollars : Jeu 23
inchangé. Simulation complète des admissions, freins et sorties, coûts normaux
et doublés. Jamais une soustraction des trades filtrés à un bilan existant.

Janvier–février et mars–avril 2026 uniquement. Calendriers, sources et empreintes
des Jeux 19/14/23. Les lacunes existantes restent explicites. Les huit critères
antérieurs sont affichés sans abaissement. Un compte 25K n'est simulé que si sa
fenêtre est complète. Aucun backtest 50K ni simulation de retrait revendiqué.

But diagnostique préannoncé : aucune sélection ni ouverture de réserve dans
cette campagne. Un profil satisfaisant les critères resterait exploratoire et
devrait faire l'objet d'une décision gelée distincte avant évaluation ultérieure.
Les dates déjà vues, marchés corrélés et essais répétés ne sont pas indépendants.

## Contrôles avant et après calcul

Figer le code, les imports transitifs, ce protocole et les tests synthétiques
par SHA-256 puis commit avant performances. Reproduire exactement les trades
témoins Jeu 23 à 150 dollars aux deux coûts, sans les compter comme de nouveaux
essais. Vérifier les préfixes de signaux, de contexte et des comptes complets.
Conserver les transactions de chaque replay en privé ; Git reçoit les agrégats.

## Juin, juillet et août

Ventiler seulement le MYM Jeu 20 déjà calculé et rejeté sur mai–août. Vérifier
les empreintes originales puis réconcilier sommes par trade et par jour.
Publier les deux trajectoires de coûts, brut/net, frais et effectifs. Il s'agit
d'une lecture d'archive, pas d'un nouveau test ni d'une réouverture des réserves
Jeux 23–27. Aucune attribution à une saisonnalité ou annonce sans données.

## Méthode de l'associé et choix de compte

Pour une campagne ultérieure H1/M5, figer d'abord la définition des tendances,
la séance (cash ou futures), l'open journalier et les pivots. Les archives cash
ne certifient pas l'ouverture futures 18 h ni des pivots overnight. Un FVG doit
être défini sur trois bougies closes, puis utilisé seulement après sa formation.
Ajouter chaque confluence séparément ; comparer 1,5R à 2R sans dépasser 2R.
Ne pas présenter une somme de signes comme une probabilité de réussite.

Comparer ensuite 25K et 50K à risque absolu identique avec recalcul intraday des
seuils, admissions, passage et retraits. Ne jamais doubler mécaniquement les PnL.
Sous 1 000 dollars est interprété comme la distance restante au seuil de perte,
et non le solde nominal ; la précision devra être figée avant ce test spécifique.
Les risques 250–500 dollars représentent 12,5–25 % du budget initial de perte du
50K. Ils ne sont pas adoptés par cette campagne. L'objectif 1 000 dollars/semaine
est un repère à mesurer, jamais une obligation de prendre position.

Sources Lucid vérifiées le 9 septembre 2026 :
- https://support.lucidtrading.com/en/articles/12945790-lucidflex-evaluation-account
- https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown
- https://support.lucidtrading.com/en/articles/12945796-lucidflex-payouts
- https://support.lucidtrading.com/en/articles/12945795-lucidflex-funded-account
