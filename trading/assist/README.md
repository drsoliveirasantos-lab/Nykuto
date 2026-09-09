# Trading assisté — simulation manuelle, 9 septembre 2026

## Portée livrée

`/assist/` ajoute une simulation accompagnée utilisable dans le navigateur.
L'utilisateur observe le graphique, retient une analyse, renseigne son ticket,
vérifie le calcul et confirme chaque entrée puis chaque sortie. Ce n'est pas
le Paper Bot autonome du Lab, une connexion Lucid ou une validation de stratégie.
Aucun achat, abonnement, ordre broker, collecte live ou moteur de recherche n'est
activé. Le Lab, ses critères/archives et les tâches prospectives sont inchangés.
Le nouveau chemin se situe dans les sources actives privées `trading/` décrites
par SOURCE_OF_TRUTH.md et docs/site-architecture.md. Les fonctions sont dans
`trading/functions/api/assist/`. La navigation et la CI incluent ce module.

## Parcours sans API IA ni installation locale

1. Ajouter jusqu'à trois captures PNG/JPEG/WebP. Renseigner le microcontrat,
   l'échéance native ROOT-YYYYMM, les unités de temps, l'heure de capture et
   la nature déclarée des données. Une capture ou un symbole continu n'atteste
   pas la fraîcheur, la licence, l'échéance ni la qualité du marché.
2. Préparer/copier la demande pour ChatGPT, joindre les images séparément dans
   la conversation, puis recopier ou résumer l'analyse retenue dans la page.
   Le bouton de copie ne transmet PAS les images et ne reçoit aucune réponse.
3. Renseigner sens, quantité, entrée, stop, objectif, risque USD, frais par contrat
   et par côté, slippage par côté et heure du prix observé. Revoir le calcul,
   cocher la confirmation, puis ouvrir la simulation.
4. Relever et confirmer manuellement la sortie pour calculer le P&L. Sans flux,
   aucun prix ne s'actualise, aucun stop/TP n'est surveillé ou déclenché. Un stop
   peut avoir été dépassé entre deux observations : ne pas assimiler ce journal
   subjectif à un backtest ou à un forward test vérifié.

Les captures restent dans l'onglet (pas de stockage persistant Nykuto).
Elles sont redimensionnées à 1920 pixels et réencodées JPEG pour l'éventuel
appel vision. Images originales <=8 Mo, <=24 millions de pixels, <=3 captures,
JPEG produit <=900000 caractères par image. L'utilisateur doit masquer ses
informations sensibles. Aucune donnée de marché ou image réelle n'entre dans Git.

## Calculs déterministes

- MNQ : tick 0,25 / 0,50 USD ; MES : 0,25 / 1,25 USD.
- MYM : tick 1 / 0,50 USD ; MGC : 0,10 / 1 USD (10 onces).
- Entrée simulée : prix saisi + slippage en Long, - slippage en Short.
- Sortie simulée : prix saisi - slippage en Long, + slippage en Short.
- Risque modélisé : distance entrée-stop en ticks × valeur du tick × quantité,
  plus deux côtés de commission et de slippage.
- Objectif net modélisé : distance entrée-objectif × valeur du tick × quantité,
  moins ces mêmes coûts. Ratio affiché = objectif net / risque modélisé.
- P&L clôturé : différence directionnelle des prix simulés × multiplicateur ×
  quantité, moins les commissions aller-retour. Le slippage est déjà inclus
  dans les remplissages et n'est pas soustrait une seconde fois.

Le serveur recalcule, refuse les ticks incohérents, stop/objectif inversés,
quantités non entières, risque au-dessus du budget et objectif non viable après
coûts. Les données déclarées live exigent un prix relevé depuis moins de deux
minutes au clic ; cela ne vérifie PAS qu'il s'agit de vrai temps réel. Une capture
ancienne conserve un avertissement. Historique/retardé/non vérifié = hypothétique.
Le risque modélisé n'est jamais une garantie de perte maximale. Pas de contrôle
du calendrier, de marge, de capacité du compte ou de règles Lucid. Le plafond de
20 micros est seulement celui du simulateur, pas un droit de position broker.

## Persistance et sécurité

`GET /api/assist/` retourne le journal propre à l'identité signée et la révision.
`POST /api/assist/` accepte uniquement `{revision,command}` avec action `open`
ou `close`, confirmation booléenne stricte et champs exactement autorisés.
Le serveur utilise les contrôles existants de membre actif, profil complet,
Origin, X-Nykuto-Action et X-Nykuto-User. Une clé réservée
`nykuto-assisted-simulation-v1` dans TRADING_USERS/trading_state isole ce journal.
Elle n'est pas autorisée dans l'API générale de modification de réglages.

Révisions conditionnelles, IDs d'entrée idempotents, conflits explicites,
une simulation ouverte maximum, 500 tickets/2 Mo maximum sans purge automatique.
Aucune réussite avant accusé serveur, aucun effacement d'historique corrompu.
Export JSON personnel ; pas de fusion automatique au journal existant ou au Lab.
Les résultats dépendent de prix déclarés par l'utilisateur, non de cotations
vérifiées. Aucun solde ou classement de performance réelle n'est fabriqué.

## Analyse d'image API — option à configurer séparément

Le parcours manuel ci-dessus ne demande pas d'abonnement API supplémentaire.
L'analyse directe utilise `POST /api/assist/analyze` et la Responses API OpenAI.
Par défaut elle échoue fermée. Avant activation, le propriétaire doit configurer
côté serveur uniquement :

- secret OPENAI_API_KEY ;
- OPENAI_VISION_MODEL : identifiant explicite d'un modèle Responses compatible
  vision choisi dans la documentation actuelle ; aucun modèle coûteux par défaut ;
- NYKUTO_ASSIST_AI_ENABLED=true après accord sur le budget et les données.

Ne jamais saisir une clé dans la page, le journal, Git ou une conversation.
Ce module ne configure pas automatiquement Cloudflare, la clé ou la facturation.
L'abonnement ChatGPT et la facturation API sont distincts. Le statut client ne
signifie que configuration présente, pas validation effective du modèle/de la clé.

L'appel est réservé au propriétaire. Consentement explicite pour chaque envoi,
maximum trois tentatives par jour UTC et une par minute via compteur SQLite
atomique. Échecs compris, pas de retry automatique. Destination HTTPS fixe,
URLs d'images externes refusées, taille bornée, pas de redirection ni outil broker.
`store:false` demande de ne pas stocker l'objet Response ; ce n'est pas une
promesse de rétention nulle chez le fournisseur (ses règles restent applicables).
Pas de stockage de l'image ou de réponse complète côté Nykuto hors texte que
l'utilisateur retient volontairement dans son ticket. La réponse est rendue en
texte, sans HTML exécutable et sans remplir les prix ou envoyer d'ordre.

Le prompt demande observations/hypothèses/informations manquantes, ne prétend
pas voir un marché live et refuse les probabilités de succès fabriquées. Les
images et annotations sont des données non fiables, pas des instructions système.
Une revue humaine des niveaux reste indispensable. L'IA peut se tromper dans la
lecture des petits chiffres, des lignes et des graphiques.

## Validation et frontières

`node --test scripts/test-trading-assist.mjs` : 34 tests locaux réussis avant
publication (fixtures synthétiques et fournisseur IA simulé). Cas Long/Short,
quatre contrats, frais, ticks, budget, fraîcheur, confirmation, doublons,
concurrence SQLite, isolation, corruption, quota IA, échecs et absence d'ordre.
Les vérifications cryptographiques existantes restent celles du service compte ;
les nouveaux tests de transport injectent des dépendances, sans prétendre tester
une véritable session Cloudflare. CI complète et déploiement à vérifier pour
le SHA publié. Aucun appel IA facturé, aucune connexion broker ni donnée réelle.
Le navigateur de test Chromium n'est pas installé dans l'environnement local ;
aucune validation visuelle Safari/iOS ou session de production n'est revendiquée.

Sources officielles consultées le 9 septembre 2026 :
- https://www.cmegroup.com/articles/faqs/frequently-asked-questions-micro-e-mini-equity-index-futures.html
- https://www.cmegroup.com/markets/metals/precious/e-micro-gold.contractSpecs.html
- https://www.cmegroup.com/markets/microsuite/metals.html
- https://developers.openai.com/api/docs/guides/images-vision
- https://help.openai.com/en/articles/9039756-managing-billing-settings-on-chatgpt-web-and-platform
