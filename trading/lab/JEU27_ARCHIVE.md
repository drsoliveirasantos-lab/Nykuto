# Jeu 27 — restauration privée

Archive TRADING_DATASETS, namespace `5eba3a535f584bb3b0dbcdff623811ca`,
clé `jeu27/fresh-reentry-v1/manifest.json`. Les trois parties puis le manifeste
ont été écrits et relus à l'identique le 9 septembre 2026.

| Fichier privé | Octets originaux | SHA-256 | Parties |
| --- | ---: | --- | ---: |
| train-runs-private.json | 1092723 | `062d1c1c0e7070346ece73fe91bb52dad155270c8f97decea907a5fd7f91c4fa` | 1 |
| report.json | 76091 | `5b7269aff341fd725bc545e215b8e467f598dd17c03f0ab360c008adac2b36c0` | 1 |
| selection.json | 340 | `d6ca907e98183ac398143b25dcefeb972d0cebb05fec6bfc987948ee5ed7c689` | 1 |

Pour restaurer : lire le manifeste, lire les parties dans leur ordre, vérifier
leurs tailles et SHA-256, concaténer le texte ASCII, décoder base64 puis
décompresser gzip. Vérifier taille et SHA-256 du fichier original.

Les références de source pointent vers Jeu 19 (MES/MYM/MGC), Jeu 14 (MNQ)
et Jeu 23 (témoin fixed150). Les observations ne sont pas dupliquées ni
présentées comme inédites. Toutes les archives précédentes sont conservées.
Git contient seulement code, protocoles, empreintes et statistiques agrégées.
