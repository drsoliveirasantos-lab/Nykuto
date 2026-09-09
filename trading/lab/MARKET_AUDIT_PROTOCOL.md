# Audit transversal des marchés — définition du 9 septembre 2026

Diego demande un audit de ce qui fonctionne et échoue, avec comparaison des
gagnants et perdants par marché, avant une bonne actualisation du bot. Cet audit
est descriptif, sur des résultats déjà vus. Ses dimensions sont fixées avant
leur nouveau calcul, sans prétendre que les données redeviennent indépendantes.

## Périmètre et observations

- Vérifier les 67 entrées des Jeux 19–30 contre leurs rapports conservés.
- Détailler les exécutions du portefeuille actuel : MES référence Jeu 23,
  MGC cassure échouée Jeu 26, MNQ/MYM protection après clôture à +1R Jeu 28.
- Comparer janvier–février, mars–avril et août 2026 séparément. Les données de
  mai–juillet et septembre ne sont pas évaluées. Les historiques bruts existants
  sont vérifiés puis seules les séances des périodes observées préparent le contexte.
- Janvier–avril reste un diagnostic de 80 séances communes sur 82, avec les
  journées incomplètes exclues pour tous les marchés. Août distingue diagnostic
  et modèle de compte 25K, 21 séances communes complètes. Les séances manquantes
  propres à chaque marché sont aussi indiquées.
- Les observations principales sont les trades aux coûts initiaux du diagnostic,
  sans additionner les replays de fenêtres, les coûts doublés ou le compte d'août.
  Les périodes disjointes ne forment pas une évaluation continue de compte.
- Aucun nouveau signal, filtre, classement automatique ou backtest de stratégie.
  Registre inchangé à 67 essais. L'audit n'autorise jamais une exécution.

## Gagnants et perdants

Classes nettes : gain strictement positif, perte stricte, zéro actif séparé.
Afficher effectifs, gain/perte moyens, espérance USD et R, PF USD et R, coûts,
sens, heure de New York, jour de semaine et motifs de sortie. Le taux de réussite
d'équilibre est une décomposition utilisant les gains/pertes moyens observés ;
il ne prédit pas le taux futur. Une classe vide a des statistiques inconnues.
La suppression descriptive du meilleur trade ou jour mesure la concentration,
sans simuler une stratégie qui saurait supprimer cette observation d'avance.

À l'entrée, utiliser uniquement les bougies closes et les indicateurs causaux
du Jeu 24 : EMA9/21 avec VWAP de séance, swings confirmés, RSI14 de Wilder,
volume comparé aux cinq séances antérieures au même horaire, forme de bougie.
Conserver les seuils déjà définis (RSI50, volume relatif1), sans les optimiser.
Un indicateur sans préparation suffisante reste inconnu, distinct d'un désaccord.
La conformité de tendance n'a pas le même sens pour une cassure suivie et pour
la stratégie MGC de retour dans la zone : ce sont des observations, pas une note.

Décrire aussi risque et frais, ratio gain/risque net prévu, largeur de la zone
en R, délai depuis la cassure, distance EMA/VWAP, RSI, volume et corps de bougie.
Comparer leurs moyennes et médianes, avec dénominateurs connus/inconnus. Les
associations découvertes après coup ne démontrent pas la cause d'une perte.
Tous les résultats sont exposés ; aucune recherche du meilleur seuil ni p-value
de confirmation après inspection de nombreux sous-groupes.

## Parcours et exécution

Rejouer chaque trade enregistré avec son stop initial et ses protections, ses
budgets, le seuil applicable et les mêmes règles de sortie. Vérifier la première
sortie, son prix, la raison, l'ambiguïté et le résultat, contre l'archive.
Vérifier le contexte de chaque entrée en supprimant toutes les bougies futures.

Mesurer les excursions favorables/défavorables en R de risque initial. Le haut
ou bas de la bougie de sortie peut survenir après la sortie : publier une borne
certaine et une borne supérieure possible. Pour une sortie à l'ouverture, ne
pas employer les extrêmes ultérieurs. Distinguer +1R confirmé, non atteint et
indéterminé ; distinguer un simple toucher d'une clôture à +1R avant la sortie.
La durée est bornée à cinq minutes près pour les sorties intrabougie.

Attribuer la différence des coûts doublés à quatre composantes : frais des
entrées communes, évolution brute des sorties communes, trades initiaux absents,
nouveaux trades en stress. Leur somme doit être égale à l'écart total.

Les refus sont rapprochés de tous les signaux évalués, avec le premier motif
enregistré. Un refus de budget ou de position occupée n'indique pas un signal
mauvais. Le résultat hypothétique de ces refus n'est pas calculé : le simuler
avec un autre portefeuille constituerait un nouvel essai, à définir séparément.

## Limites et correction

L'audit distingue défauts reproductibles, limites du modèle, fragilité statistique
et hypothèses à vérifier. Il conserve les moteurs et résultats gelés. Les défauts
d'affichage ou de diagnostic établis peuvent être corrigés ; une modification
économique devra être isolée, avec nouvelle définition et nouvelle évaluation.
Le compte et les coûts sont ceux de la recherche historique, pas des règles
commerciales actuelles certifiées. Aucune revue de sécurité exhaustive du site,
validation navigateur, connexion courtier ou exécution réelle n'est revendiquée.
Carnet d'ordres, bid/ask, tick par tick, latence, annonces et qualité des fills
réels ne sont pas disponibles dans ces archives et restent non audités.

Les simulations OHLC nécessitent des hypothèses intrabougie ; des données plus
fines peuvent améliorer l'estimation des fills, sans transformer une simulation
en exécution réelle. [Documentation officielle TradingView](https://www.tradingview.com/pine-script-docs/concepts/strategies/).
La multiplication des essais augmente le risque de sélection trompeuse, ce qui
justifie de conserver les échecs et de séparer découverte et confirmation.
[Bailey et López de Prado, Deflated Sharpe Ratio](https://www.davidhbailey.com/dhbpapers/deflated-sharpe.pdf).

## Reproduction

```bash
node scripts/audit-trading-markets.mjs /sources/privees /archives/privees /sortie/neuve
```

Les empreintes des prix, des exécutions, des rapports et du registre sont vérifiées.
Seul le rapport agrégé est écrit ; les détails par trade se reconstruisent en
mémoire depuis les archives privées déjà conservées. Le fichier de sortie ne
peut pas écraser un audit existant.
