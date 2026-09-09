# Jeu 28 — restauration privée

Archive TRADING_DATASETS, namespace `5eba3a535f584bb3b0dbcdff623811ca`,
clé `jeu28/closed-breakeven-v1/manifest.json`. Les trois parties et le manifeste
ont été écrits puis relus à l'identique le 9 septembre 2026. La restauration
des fichiers originaux vérifie toutes les tailles et empreintes.

| Fichier privé | Octets originaux | SHA-256 | Parties |
| --- | ---: | --- | ---: |
| train-runs-private.json | 996848 | `a3ff3193265be5f7729ef054be37ea1dddd2671885baf2b5844b051fa031d959` | 1 |
| report.json | 94800 | `5e673a699eb90f28c3f4c4379d2dc9787a8372d97d7c15a26755abd726f5d200` | 1 |
| selection.json | 340 | `7a62b255d62fccd5a38155b32f632afe6dbd16a0bc165efe92baa7a87219ab90` | 1 |

Lire le manifeste puis les parties dans l'ordre. Vérifier taille et SHA-256
des parties, concaténer le texte ASCII, décoder base64, décompresser gzip et
vérifier taille et empreinte du fichier original.

Les sources référencent les archives Jeux 19 (MES/MYM/MGC), 14 (MNQ) et 23
(témoin fixed150). Elles ne sont ni dupliquées ni présentées comme inédites.
Les archives précédentes restent intactes. Git ne contient que code,
protocoles, empreintes et statistiques agrégées.
