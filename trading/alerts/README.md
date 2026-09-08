# Alertes TradingView

`/alerts/` affiche au plus 50 événements, triés par heure de déclenchement
décroissante. La lecture et la configuration privées passent par Cloudflare
Access puis vérification de sa signature JWT, comme les historiques du Lab.
Le test interne exige en plus POST, Origin identique et un en-tête d'action.
Chaque événement de test est marqué `Test du site`, avec prix nul.

Le Worker isolé `nykuto-trading-alerts` reçoit uniquement POST
`/hook/<jeton aléatoire de 256 bits>`. Il exige simultanément le hash SHA-256 du
jeton et une adresse source TradingView provenant de l'en-tête de confiance
Cloudflare `CF-Connecting-IP`. Aucun chemin ne lit les événements ou les
réglages. GET `/health` répond 204 sans donnée. Il n'existe aucun bypass Access
sur le domaine privé. Aucune API de courtier ni d'envoi d'ordres n'est appelée.

## Déploiement

Sources Worker : `workers/trading-alerts/worker.mjs` et
`trading/alerts/alert-service.mjs`, avec ces mêmes noms de modules dans l'upload
multipart. Le premier est `main_module`. Bindings :

- `TRADING_ALERTS` : namespace KV dédié, également lié aux Functions Pages de
  production, sans remplacer le binding existant `TRADING_DATASETS`.
- `WEBHOOK_TOKEN_HASH` : secret du Worker, hash du jeton, jamais de secret en Git.

La clé KV `config/webhook-v1` contient le schéma `trading-alerts-v1` et l'adresse
complète `webhookUrl`. Sa valeur est provisionnée hors Git et délivrée seulement
par `/api/alerts/setup` à une session Access valide. Aucune sauvegarde navigateur
du lien. Logs d'invocation, traces et Logpush désactivés pour éviter de journaliser
le jeton dans le chemin. Ne pas utiliser cette adresse dans une capture publique.
Une rotation doit remplacer le hash Worker et la configuration privée, puis
l'adresse des alertes TradingView existantes.

Corps JSON borné à 4 096 octets, même sans Content-Length. Seuls `name`, `symbol`,
`price`, `interval`, `triggeredAt` sont acceptés. Le nom est limité à 100 caractères,
le symbole à 80. `triggeredAt` utilise `{{timenow}}`, avec maximum 24 heures de
retard et cinq minutes d'avance ; ce n'est pas l'heure d'ouverture de la bougie.
Le prix est un nombre fini ; des prix nuls ou négatifs restent possibles.

Une même livraison normalisée écrit une même clé de contenu. Les valeurs et
métadonnées KV permettent une liste sans cinquante lectures supplémentaires.
KV est éventuellement cohérent : environ une minute de délai de visibilité est
possible, et ce mécanisme ne garantit pas une exécution exactement une fois.
Les livraisons identiques du même nom/symbole/prix/intervalle à la même seconde
sont regroupées. Utiliser des noms distincts pour les alertes différentes.
La réponse de succès suit l'écriture persistante ; un échec renvoie 503.
Aucune suppression automatique ni interface de suppression n'est ajoutée.

## Configuration côté TradingView

L'utilisateur crée la condition sur son compte et colle le lien et le message
du site dans l'alerte. TradingView demande 2FA et une offre donnant accès aux
webhooks. Le widget du Dashboard ne configure pas les alertes du compte et ne
prend pas en charge les scripts Pine personnalisés. Une alerte arbitraire ne
reproduit pas le moteur du Jeu 06. Aucun achat d'abonnement n'est effectué.

Sources officielles vérifiées le 8 septembre 2026 :

- https://www.tradingview.com/support/solutions/43000529348-how-to-configure-webhook-alerts/
- https://www.tradingview.com/support/solutions/43000531021-how-to-use-a-variable-value-in-alert/
- https://www.tradingview.com/widget-docs/faq/general/

TradingView impose un délai de réponse de trois secondes ; les alertes peuvent
échouer côté fournisseur, à consulter dans son journal. L'enregistrement Nykuto
ne promet pas une livraison garantie. `{{interval}}` peut valoir `1` pour une
alerte de prix, quelle que soit l'unité visuelle du graphique.

`npm run test:trading-validation` inclut les tests du récepteur, de confidentialité,
de signature Access, de protection des écritures, de normalisation, de doublons
et d'échec du stockage. Les IP TradingView ne sont simulées que dans les tests
locaux. Ne pas usurper les en-têtes sur l'endpoint déployé. Le test interne du site
ne confirme pas TradingView de bout en bout : seul un vrai déclenchement le fait.
