# Jeu 21 — préparation native sur MES et MGC

Version jeu21-native-markets-v1. Protocole déclaré avant tout calcul de performance du Jeu 21.

La correction de préparation du Jeu 20 est étendue à MES et MGC. Hypothèse : une préparation 30 minutes indépendante peut rétablir des séances dont les cours 5 minutes existent, sans fabriquer des observations manquantes. Les données MYM et MNQ ne sont pas rejouées comme nouvelles configurations. Deux méthodes préexistantes (Pullback et Cross 5 minutes avec tendance 30 minutes) sur deux marchés : quatre configurations supplémentaires, treize depuis le début des Jeux 19–21. Aucune recherche de paramètres.

Les prix et calendriers 5 minutes, métadonnées, passages d’échéance et politiques de risque du Jeu 19 sont conservés. Les bougies natives 30 minutes Massive sont rapprochées en OHLCV de toutes les bougies 5 minutes présentes. La préparation de chaque horizon demande 220 bougies et se réinitialise séparément lors d’une lacune. Les séances évaluées doivent rester entièrement couvertes en 5 et 30 minutes. Pas de raccordement entre contrats. Le support technique de MYM permet les contrôles de référence, pas un neuvième rejeu.

Développement : janvier–février puis mars–avril 2026. Sélection sur deux fenêtres entièrement couvertes, au moins 40 trades au total et 12 par fenêtre, chaque fenêtre nette positive en R et USD, PF en R ≥ 1,1, drawdown ≤ 8 R, total net positif aux coûts doublés, aucun franchissement du seuil dans les comptes complets. Classement inchangé : pire espérance par fenêtre, puis drawdown, puis ordre déclaré.

Mai–juin et juillet–août ne sont calculés que pour la candidate gelée avant ouverture ; sans candidate, aucune performance de réserve. Cette séparation technique ne rend pas les dates indépendantes : elles ont déjà été vues sur MYM/MNQ et sont corrélées. Le rapport garde independent=false et confirmed=false, même si les seuils passent. Aucun retuning après réserve.

Une quantité de 1 microcontrat, 50 USD de risque maximum frais compris, 100 USD de limite quotidienne, réserve de 100 USD et au plus 3 entrées/jour. EMA9/21, ADX14≥20, ATR14×1,25, cible 1,5R, marge nette ≥1, coût hypothétique aller-retour 2,50 USD + un tick par côté ; le scénario stress double l’ensemble. Les coûts ne sont pas présentés comme le tarif exact Lucid.

Source : `/futures/v1/aggs/{ticker}?resolution=30min`, récupération le 9 septembre 2026, pagination complète. Prix et trades privés. Le moteur, le protocole et leurs dépendances sont gelés par SHA-256 avant résultats. Les Jeux 19–20 restent inchangés. Paper Bot, Shadow, flux temps réel et broker désactivés.
