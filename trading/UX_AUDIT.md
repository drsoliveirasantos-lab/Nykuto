# Audit d’ergonomie — Trading HQ

Audit réalisé les 8–9 septembre 2026. Base examinée : `6f223bef05043c59b5053719864ab81526bf300f`, PR 83.

## Conclusion

Le site rassemble les fonctions utiles à la préparation et au suivi personnel,
mais la navigation mobile, les périodes des statistiques et le calcul du risque
créaient des ambiguïtés. Les corrections ci-dessous rendent ces parcours plus
explicites. Le calendrier peut maintenant être personnalisé par membre.

La lecture MNQ reste historique. La connexion à un courtier et l’import
automatique de son historique restent à construire. Cet audit ne mesure pas
la rentabilité du bot et ne remplace pas des essais avec les associés.

## Méthode et preuves

- Lecture des sources du Dashboard, Risque, Journal, Plan, Analyse, Lab, Replay,
  Avant un trade, Alertes et Mon compte ; contrôle des états et de la navigation.
- Essais réels dans un navigateur sur un aperçu local isolé, avec cinq trades
  fictifs en mémoire. Les styles et scripts de production sont utilisés ; la
  session personnelle et sa sauvegarde sont simulées. Aucun compte réel n’est
  modifié et aucun retour n’est envoyé.
- Présentation examinée sur ordinateur et dans des cadres de 375 et 320px.
  Sur le parcours Risque, les largeurs de contenu mesurées sont respectivement
  360 et 305px (barre de défilement déduite), sans débordement horizontal.
  Ce sont des largeurs de navigateur, pas des essais sur un iPhone physique.
- Contrôle du menu mobile, des filtres, du détail quotidien, des couleurs, de la
  fermeture du formulaire et du retour du focus. Le filtre Manuel restitue les
  trois trades fictifs attendus et +2,5 R, contre cinq et +2,7 R tous modes.
- Le scénario fictif entrée 100 / stop 98 / objectif 94 ne donne plus de ratio
  pour un Long. Objectif 106 donne 1:3 et cinq unités avec le capital de 1 000 €
  et le risque de 1 %. Les champs mesurés sur ordinateur ont une police de 16px
  et une hauteur de 44px.
- Une journée positive personnalisée en blanc affiche bien du texte noir ;
  l’état de sauvegarde attend la réponse de la session de test. La validation
  serveur des couleurs est également couverte par les tests automatisés.

## Constats et corrections

| Réf. | Priorité | Constat | Traitement |
| --- | --- | --- | --- |
| A01 | Haute | Une saisie vide devenait zéro ; un objectif du mauvais côté pouvait donner un ratio positif. | Corrigé : nombres manquants rejetés, sens Long/Short explicite et niveaux cohérents exigés. |
| A02 | Haute | La taille générique pouvait être comprise comme un nombre de contrats MNQ ou de lots Forex. | Périmètre explicite : unités au comptant en euros uniquement. Le calcul propre aux futures reste à ajouter. |
| A03 | Moyenne | Replay apparaissait deux fois dans le menu du Dashboard ; certaines pages n’offraient pas les mêmes destinations. | Corrigé : une navigation commune, également montée dans Replay. |
| A04 | Haute | Le menu horizontal masquait Analyse, Lab et les réglages sur téléphone. | Corrigé : bouton Menu, destinations sur deux colonnes, état ouvert annoncé et fermeture après choix. |
| A05 | Moyenne | Boutons de 32px et champs de 34px avec texte inférieur à 16px sur ordinateur. | Corrigé dans les contrôles partagés touchés : cibles de 44px et saisie à 16px, texte d’interface compact conservé. |
| A06 | Moyenne | Le calendrier à sept colonnes débordait sur les petits écrans. | Liste des jours tradés proposée sous 541px ; calendrier complet toujours disponible. Le détail du jour devient la destination du clic mobile. |
| A07 | Moyenne | Couleurs du calendrier fixes malgré la demande de personnalisation. | Trois couleurs personnelles avec aperçu, enregistrement, retour aux couleurs par défaut et contraste automatique du texte. |
| A08 | Moyenne | Les totaux du journal complet pouvaient être confondus avec ceux du mois filtré. | Libellés de période clarifiés, règles de validité des entrées communes. Les résultats restent en R, sans faux solde de courtier. |
| A09 | Haute | Une croix supprimait immédiatement un trade ; les erreurs de sauvegarde pouvaient n’apparaître qu’en haut de page. | Bouton Supprimer explicite, confirmation avant suppression, messages près du journal et focus restauré après fermeture du formulaire. |
| A10 | Moyenne | Le passage entre modules remplaçait l’historique du navigateur et ne déplaçait pas le focus. | Navigation avec historique, état courant accessible et focus sur le titre du module choisi. |
| A11 | Haute | Le widget TradingView et l’analyse propre au site pouvaient être compris comme une seule sélection en direct. | Limite affichée près du widget et dès l’introduction de l’analyse. Aucune prétendue lecture du widget ni actualisation en direct. |
| A12 | Moyenne | Modifier le nombre de bougies pouvait faire disparaître tout le graphique pendant une saisie incomplète. | La dernière sélection valide reste affichée avec un message explicite jusqu’à une saisie valide. Une erreur de rechargement continue à masquer les anciens résultats. |
| A13 | Moyenne | Analyse n’était pas proposée comme page concernée dans les retours des testeurs. | Option ajoutée, avec le circuit de retours existant. Aucun message envoyé pendant l’audit. |
| A14 | Haute | Dans le navigateur d’audit, le widget refuse `NASDAQ:NDX` et renvoie vers TradingView. | Limite externe constatée et conservée honnêtement ; lien direct visible et possibilité de choisir un autre symbole. La disponibilité de NDX dans le widget reste non résolue. |

## Limites de validation et travail restant

1. **Analyse MNQ en temps réel :** le site n’a actuellement aucun flux MNQ en
   direct configuré. Il faut une source autorisée, la gestion des bougies en
   formation, des déconnexions et de la fraîcheur avant de l’annoncer disponible.
   Les résultats historiques ne doivent pas devenir des signaux « live ».
2. **Graphique natif de l’analyse :** le navigateur de l’aperçu HTTP ne fournit
   pas Web Crypto pour vérifier l’intégrité de l’historique. L’analyse a bien
   refusé le chargement ; le message a été traduit en une explication HTTPS.
   Le contrôle n’a pas été contourné. Le rendu des bougies/MSS n’a donc pas été
   validé visuellement dans cet audit. Les tests des calculs restent exécutés.
3. **Comptes réels :** connexion e-mail, parcours d’inscription complet, sauvegarde
   distante depuis le navigateur et réception réelle des alertes TradingView
   n’ont pas été essayés. Les tests techniques existants de séparation des
   comptes, droits et conflits de sauvegarde restent requis et exécutés.
4. **Lab :** les vues Suivi / Tests précédents / Test manuel et les définitions
   sont inspectées dans le code. Les tableaux de résultats complets, toutes les
   variantes et les graphiques Replay ne font pas l’objet d’une validation
   visuelle exhaustive dans cet audit.
5. **Prochaines améliorations recommandées :** calcul de taille adapté au contrat
   et à sa devise ; explications courtes des sigles au point d’usage ; parcours
   guidé « préparer → journaliser → revoir » ; essais par les associés sur leurs
   appareils, en notant l’action voulue et l’endroit où ils hésitent.

## Contrôles techniques de cette correction

73 tests de trading réussis, dont quatre nouveaux cas pour le risque et les
couleurs. Build réussi, hygiène sans anomalie, validation des 25 Pages Functions,
syntaxe et références de contrôles vérifiées. Les contrôles GitHub et le
déploiement Cloudflare de la nouvelle révision sont suivis séparément dans la
PR 83. Un ancien déploiement réussi ne valide pas cette correction.

Les données privées, les protocoles du bot et les tâches de collecte/test MNQ
restent inchangés. L’aperçu local, son journal fictif et l’historique de prix ne
font pas partie des fichiers publiés.
