# Archivage privé des Jeux 19 et 20

Les 26 fragments et les deux manifestes ont été écrits puis relus intégralement dans le stockage privé TRADING_DATASETS le 9 septembre 2026. Chaque valeur relue est identique à la valeur écrite. Aucun prix brut ni trade individuel n’est publié dans Git.

Pour restaurer un fichier : lire son manifeste, concaténer les fragments dans l’ordre indiqué, décoder la chaîne base64, décompresser gzip, vérifier la taille et le SHA-256 du fichier original. Les manifestes décrivent aussi les empreintes de chaque fragment.

| Jeu | Manifeste privé | SHA-256 du manifeste |
| --- | --- | --- |
| 19 | `jeu19/multimarket-v1/manifest.json` | `2f09733a0cf6c020779afdeaf50f79c5b0593014e7523a3b25d53b4170c64973` |
| 20 | `jeu20/native-prep-v1/manifest.json` | `2ff39be1ce5e5ef6e3951df06c59c3765614d2547f491ec21dc12485ac9bf0a7` |

## Fichiers conservés

| Jeu | Fichier | Octets | SHA-256 original |
| --- | --- | ---: | --- |
| 19 | `dataset.json` | 4331838 | `6ba2265d46292bfff985cbbb74ddde8998a56a21f7e086e9d3f768269bcada09` |
| 19 | `train-runs-private.json` | 898098 | `8917adc5419109aefde468c06260dec01bdfd83e96d66501b72dbd08b6b081a4` |
| 19 | `report.json` | 142462 | `a7f08dce96f0596e93e78dcfc5923fc04d4d6b983fd084edda786b02a3c79912` |
| 19 | `selection.json` | 312 | `d6ebdf582aaad2f4a9773feb7f2894b7d4ebf92d888f36e24aa20a05581d1964` |
| 20 | `dataset.json` | 1677004 | `3d5d75c8efd50f6db55d28c1d9d93f7bace1d58f2912c963701674e3a7aad21f` |
| 20 | `train-runs-private.json` | 396349 | `e8ed1f6615e8d5119ebaf7de9a83148c267bf4b7289b5c27784ed90eff6a3819` |
| 20 | `holdout-runs-private.json` | 472016 | `18ba0e4c506dc7d7ca9c55e19207f258f03281cb8e1af90568e1a27e002ac2d9` |
| 20 | `report.json` | 89646 | `40a89644fc8257a7b4600f441d67fdc68dc13d2a0ce40cc856be4b78874557e1` |
| 20 | `selection.json` | 349 | `5af8cf71162a66e4cf7490de53ffbcc09056f94e71706faae88fe2c66d10c96a` |
| 20 | `development.json` | 74660 | `7bb28e7ef84df8b568f79f30ca77466b9a1efc50c159512045767fd10b66fe39` |

Le jeu MNQ de référence reste dans l’archive privée préexistante `jeu14/available-history-v1.json` (SHA-256 `028e914bb10ea38b73b6fcbc867c5d81937b967701448913fc88ca85746557cf`). Le Jeu 19 n’a pas de fichier de réserve calculée : aucune candidate n’avait été sélectionnée. Le Jeu 20 conserve son développement, sa sélection antérieure à la réserve et le résultat négatif final.

Validation logicielle avant publication : 143 tests réussis, construction réussie, hygiène sans alerte, 25 fonctions vérifiées. Les 322 identifiants HTML préexistants sont conservés parmi 343 identifiants uniques. Ces contrôles attestent du fonctionnement du code ; ils ne prouvent aucune rentabilité.
