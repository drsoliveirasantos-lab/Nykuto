# Jeu 26 — restauration privée

Archive TRADING_DATASETS, namespace `5eba3a535f584bb3b0dbcdff623811ca`,
clé `jeu26/failed-breakout-v1/manifest.json`. Les trois parties et le manifeste
ont été écrits puis relus à l’identique le 9 septembre 2026.

| Fichier privé | Octets originaux | SHA-256 | Parties |
| --- | ---: | --- | ---: |
| train-runs-private.json | 1053096 | `ad2e235da84fcae04314f8292de6f2ad93799b6a98d83c1a04794a2c590a07fa` | 1 |
| report.json | 71628 | `a3e991c45afcd93eca4ec7fe0560c80fcf0da17ebb239436d4a4320bf991af13` | 1 |
| selection.json | 340 | `c3d7e43ff7eec61647545e395bd0183fcf9b7183edfc4f5f349fe68af5e20473` | 1 |

Pour restaurer : lire le manifeste, lire les parties dans leur ordre, vérifier
leurs tailles et SHA-256, concaténer le texte ASCII, décoder base64 puis
décompresser gzip. Vérifier taille et SHA-256 du fichier original.

Les références de source pointent vers Jeu 19 (MES/MYM/MGC), Jeu 14 (MNQ)
et Jeu 23 (témoin fixed150). Les observations ne sont pas dupliquées ni
présentées comme inédites. Toutes les archives précédentes sont conservées.
Git contient seulement code, protocoles, empreintes et statistiques agrégées.
