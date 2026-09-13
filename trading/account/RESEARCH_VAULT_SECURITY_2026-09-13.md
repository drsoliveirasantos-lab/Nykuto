# Protection du coffre de recherche — 13 septembre 2026

## Décision

Les données de recherche difficiles à obtenir ne sont plus accessibles aux
comptes `tester`. Les routes `/analysis`, `/historique`, `/lab`, `/live`,
`/models`, `/suivi` et `/api/lab` sont réservées au rôle serveur `owner`.
Masquer un lien n'étant pas une protection, le refus est appliqué par la
Function Pages avant la lecture d'un fichier statique ou d'une clé KV.

| Surface | Propriétaire | Testeur | Contrôle effectif |
|---|---:|---:|---|
| Dashboard, Risque, Journal, Plan | Oui | Oui | compte D1 isolé |
| Trade assisté, Replay public, Discipline | Oui | Oui | membre actif |
| Alertes, Connexions, Compte, Feedback | Oui | Oui | compte/jeton isolé |
| Analyse MNQ et calendrier Historique | Oui | Non | rôle `owner` avant contenu |
| Strategy Lab et rapports de recherche | Oui | Non | rôle `owner` avant contenu |
| API et jeux de données privés `/api/lab/*` | Oui | Non | rôle `owner` répété avant KV |

Un testeur qui appelle directement une page du coffre reçoit une réponse 404 ;
un appel direct de l'API reçoit 403. La navigation retire aussi ces liens après
chargement du rôle, mais cela reste uniquement une mesure d'interface. Toutes
les réponses authentifiées sont marquées `private, no-store`, les ressources du
coffre sont limitées à la même origine et les pages restent non indexables.

## Limite honnête

Cette barrière empêche le serveur d'envoyer les sources aux associés. Elle ne
constitue pas un DRM : le propriétaire peut sauvegarder ce que son propre
navigateur reçoit, et une personne disposant déjà du dépôt, d'une archive ou
d'une ancienne copie conserve cette copie. La protection dépend aussi de la
bonne affectation des rôles dans `TRADING_USERS`, de Cloudflare Access et du
déploiement du même commit testé. Révoquer un associé exige de désactiver son
adhésion D1 et de retirer sa règle Access.

## Vérification locale

Les tests signent des identités propriétaire et testeur, utilisent une base D1
de test et vérifient notamment qu'un refus testeur intervient avant toute lecture
KV. Ils couvrent aussi les routes statiques, le manifeste historique et chaque
endpoint Lab partagé. Ils ne remplacent pas un contrôle du rôle et des règles
Access sur le déploiement Cloudflare réel.
