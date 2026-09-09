# Jeu 27 — archive privée et reproduction

Namespace TRADING_DATASETS `5eba3a535f584bb3b0dbcdff623811ca`.
Manifeste `jeu27/filter-diagnostic-v1/manifest.json`.
Trois parties et le manifeste écrits puis relus intégralement à l'identique.

| Fichier | Octets | SHA-256 | Parties |
|---|---:|---|---:|
| report.json | 164578 | `8ed896cdb39335d3af3d0cdba221b919e6afe29660a460b9e2baac5f59890b9b` | 1 |
| train-runs-private.json | 1618842 | `88adcf149ea9bc5340e712343e973e6f5fb752e4aed88583ae4ee72539297680` | 2 |

Restaurer en vérifiant chaque partie, concaténant dans l'ordre, décodant base64,
puis décompressant gzip. Vérifier taille et SHA-256 de chaque original.

Sources privées, sans duplication dans Git :
- dataset.json : Jeu 19, `jeu19/multimarket-v1/manifest.json`.
- mnq-dataset.json : `jeu14/available-history-v1.json`.
- reference-train.json : train-runs-private.json du Jeu 23.
- jeu20-holdout-runs-private.json : holdout-runs-private.json du Jeu 20.

`node scripts/run-trading-jeu27.mjs /chemin/sources-privees /chemin/sortie-neuve`

Les deux chemins doivent être hors dépôt. Le script contrôle les empreintes et
refuse d'écraser un résultat. Le cœur de calcul est `jeu27-diagnostic.mjs`.
Le calcul de cette livraison a exécuté ce même module et ses imports sous forme
d'un bundle IIFE, dans l'environnement privé ayant accès aux archives, après
vérification du gel. La commande locale produit les mêmes champs financiers
`results`, `audit` et `monthlyMYM`; les métadonnées de provenance diffèrent
(`source` dans le CLI, `sourceHashes` dans le rapport archivé). Ne pas attendre
une empreinte du rapport complet identique entre ces deux enveloppes.

`node scripts/build-trading-jeu27.mjs /chemin/prive/bundle.js verify`

Utilise le bundler déjà livré avec Vite, sans nouvelle dépendance ni changement
de lockfile. Le bundle exécuté a pour SHA-256
`5eddb10610eca40b94c8529c350f29c553fee3af7ebdc5e40e7f909d1ca8f596`.
Toutes les archives précédentes sont préservées. Aucun ordre ni appel broker.

