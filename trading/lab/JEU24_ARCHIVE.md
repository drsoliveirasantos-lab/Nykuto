# Archive privée du Jeu 24

Namespace TRADING_DATASETS ; aucune source, transaction ni décision individuelle dans GitHub. Préfixe neuf vérifié vide avant écriture : `jeu24/combined-context-v1/`. Les anciennes archives sont préservées.

Manifeste : `jeu24/combined-context-v1/manifest.json`. Quatre fichiers, quatre parties ASCII base64 de gzip déterministe. Chaque partie puis le manifeste ont été relus et comparés exactement au contenu écrit. Les empreintes SHA-256 et tailles avant compression sont enregistrées ; la décompression a été vérifiée égale à chaque original.

| Fichier | Octets | SHA-256 |
| --- | ---: | --- |
| train-runs-private.json | 1248690 | `8a63aff90ecdba499c0fdc2ac745de4fe75fde2b34c6042521809d204bdafdd6` |
| train-context-private.json | 350874 | `019cd4ea6b2e2861b461ea22b9e0c44793dad5f4c269bb0e6d28a348fdc720c3` |
| report.json | 275822 | `fd9a87d4ed562802ef0f98eb995e13b2854fba6d8e2d400b5d942aee92c6b0bb` |
| selection.json | 341 | `5ee938db6c4401297a03037ec79848b3363240c2de5105b0f476b2e14bb43808` |

Références reproductibles privées, vérifiées avant calcul :

- `dataset.json` : `jeu19/multimarket-v1/manifest.json`, 4331838 octets, SHA-256 `6ba2265d46292bfff985cbbb74ddde8998a56a21f7e086e9d3f768269bcada09`.
- `mnq-dataset.json` : `jeu14/available-history-v1.json`, 2426693 octets, SHA-256 `028e914bb10ea38b73b6fcbc867c5d81937b967701448913fc88ca85746557cf`.
- `reference-train.json` : `jeu23/admission-risk-v1/manifest.json`, 3139653 octets, SHA-256 `bce23d425464ef1735acc3fa9612c8f035dad08cf6666952c1476d5f9cd27239`.

Le témoin est l’archive des exécutions du Jeu 23, appariée au même marché, plafond, période, hypothèse de coûts et mode compte. Aucune ancienne simulation n’est refaite. Les sources Jeux 19/14 restent les mêmes observations de développement.

Reproduction contrôlée : reconstituer les fichiers privés indiqués par les manifests ; placer `dataset.json`, `mnq-dataset.json` et `reference-train.json` dans un dossier hors dépôt, puis utiliser un autre dossier privé neuf avec le script gelé `scripts/run-trading-jeu24.mjs` (phase `train`). Une reproduction identique n’est pas un nouvel essai. Ne pas écraser les résultats archivés ni ouvrir la réserve sans sélection non nulle gelée.
