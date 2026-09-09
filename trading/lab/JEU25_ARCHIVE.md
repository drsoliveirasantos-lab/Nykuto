# Archive privée du Jeu 25

Namespace TRADING_DATASETS. Préfixe neuf vérifié vide avant écriture : `jeu25/graded-risk-v1/`. Anciennes archives préservées.

Manifeste : `jeu25/graded-risk-v1/manifest.json`. Quatre fichiers et quatre parties ASCII base64 de gzip déterministe. Chaque partie et le manifeste ont été relus et comparés exactement aux contenus écrits. Tailles et SHA-256 vérifiées avant compression ; décompression égale à chaque original.

| Fichier | Octets | SHA-256 |
| --- | ---: | --- |
| train-runs-private.json | 704852 | `b7027ef2b833860aa1f0a8407e8a76bfe4c291d07f282893ef39a2b025bce752` |
| train-grades-private.json | 85707 | `23e9061581b888014b8b7490486336fe687356f8c3e6199445a7fa5385086ba7` |
| report.json | 103103 | `f0a0911e169f3b41e8f4b9c0a61495c847e3e07102e6136a6f31add686a726a1` |
| selection.json | 340 | `889af7db797ffe54ba0bed8fa2990a238ac856ef5dd99e45a2f83b140f9e6c18` |

Références privées vérifiées avant calcul :

- `dataset.json` : `jeu19/multimarket-v1/manifest.json`, 4331838 octets, SHA-256 `6ba2265d46292bfff985cbbb74ddde8998a56a21f7e086e9d3f768269bcada09`.
- `mnq-dataset.json` : `jeu14/available-history-v1.json`, 2426693 octets, SHA-256 `028e914bb10ea38b73b6fcbc867c5d81937b967701448913fc88ca85746557cf`.
- `reference-train.json` : `jeu23/admission-risk-v1/manifest.json`, 3139653 octets, SHA-256 `bce23d425464ef1735acc3fa9612c8f035dad08cf6666952c1476d5f9cd27239`.
- `strict-reference-train.json` : `jeu24/combined-context-v1/manifest.json`, 1248690 octets, SHA-256 `8a63aff90ecdba499c0fdc2ac745de4fe75fde2b34c6042521809d204bdafdd6`.

Pour une reproduction contrôlée, reconstituer `dataset.json`, `mnq-dataset.json`, `reference-train.json` et `strict-reference-train.json` dans un dossier privé hors dépôt, puis utiliser le script gelé `scripts/run-trading-jeu25.mjs` et un autre dossier de résultats privé neuf, phase `train`. Une reproduction identique ne constitue pas un nouvel essai. Ne pas écraser les archives ni ouvrir la réserve sans sélection non nulle gelée.
