# Jeu 39 — Recherche préalable aux résultats

Consultation le 10 septembre 2026. Diego autorise des propositions autonomes : reproduire exactement les associés n’est pas une exigence. Les publications ci-dessous motivent la méthode ; aucune ne démontre que nos deux variantes seront rentables.

| Source primaire | Ce qu’elle apporte | Limite pour ce test |
| --- | --- | --- |
| Bailey et al., [The Probability of Backtest Overfitting](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf), version du 27 février 2015 | La sélection parmi des essais historiques peut produire des gagnants trompeurs. | Nous conservons le registre des essais et figeons les règles. Nous ne calculons ni PBO ni CSCV et ne prétendons pas obtenir une validation indépendante. |
| Fleming et Remolona, [NY Fed Staff Report 27](https://www.newyorkfed.org/research/staff_reports/sr27.html), juillet 1997 | Les annonces peuvent modifier rapidement volatilité, spreads et activité. | Étude sur les Treasuries, pas preuve d’une meilleure heure MNQ. Aucun nouveau filtre news quantifié. |
| [NYSE — Hours and Calendars](https://www.nyse.com/trade/hours-calendars) | Repères de la séance cash américaine, heures Eastern et jours fériés. | Les futures ont leurs propres horaires. La séance cash ne prouve pas un avantage avant 11 h. |
| [BLS — septembre 2026](https://www.bls.gov/schedule/2026/09_sched.htm) | Les annonces ont des heures précises, souvent 08:30 ou 10:00 Eastern. | Le calendrier actuel ne remplace pas une archive connue à la date des anciens trades. Pas de nouvelles données macro révisées dans les relectures. |
| [Kronos — dépôt des auteurs](https://github.com/shiyu-coder/Kronos) | Un modèle génératif OHLCV peut fournir une prévision à comparer à des références simples. Les auteurs distinguent leur démonstration d’un système de trading de production. | Une prévision n’est pas un taux de réussite, et ses coûts, sa latence et ses erreurs doivent être distingués de son intérêt économique. |

## Pourquoi ces deux pistes

Le Jeu 38 n’a changé aucun trade exécuté : ses deux refus concernaient déjà des signaux refusés par le risque. Le prochain diagnostic doit mesurer un changement réel d’admission, sans augmenter les montants. Le Jeu 37 a déjà montré que grossir le risque ne résout pas tous les mois. Les sorties 3R et l’attente M5 ont aussi eu des effets défavorables selon le marché.

Le plafond de nouvelles entrées MNQ avant 11 h New York est une hypothèse simple, choisie avant calcul. Il n’a pas été testé tel quel : les anciens essais matin/après-midi portaient sur d’autres fenêtres et règles ; le filtre avant 11 h de MGC appartient déjà à la référence. Ce choix n’est pas issu d’un classement inédit des heures gagnantes.

Kronos-mini est le seul modèle téléchargé et vérifié ici. K1 évaluait des prévisions sur 24 fenêtres : son erreur moyenne dépassait celle de la référence naïve et deux fenêtres contenaient des OHLC invalides. Cela ne mesurait pas son effet sur les admissions du bot. Le Jeu 39 applique donc réellement ce modèle, avec ses poids existants, à toutes les entrées MNQ candidates. Les fiches RSI/tendance et news restent intégrées mais ne deviennent pas arbitrairement de nouveaux signaux chiffrés.

## Auto-évaluation délimitée

Le module `research-self-review.mjs` compare les six cellules mois/coûts de chaque variante selon des critères écrits avant résultat. Il conserve aussi les échecs et les gagnants supprimés. Il ne réécrit pas le bot, n’apprend pas de nouveaux poids, ne recherche pas de seuil et n’active aucune variante. Une amélioration future exige une autre proposition explicite, un protocole et des données adaptés ; aucune boucle permanente d’optimisation sur juin–août.
