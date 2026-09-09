# Jeu 30 — restauration privée

Archive TRADING_DATASETS, namespace `5eba3a535f584bb3b0dbcdff623811ca`,
clé `jeu30/august-v1/manifest.json`. Les deux parties et le manifeste ont été
écrits puis relus à l'identique le 9 septembre 2026.

| Fichier privé | Octets | SHA-256 | Parties |
| --- | ---: | --- | ---: |
| august-runs-private.json | 165382 | `956724bc7aa63689a3d90c1be5495b53697841f768e7abc23dfe532987ddf7eb` | 1 |
| report.json | 90677 | `0e58b436140e13f7e287cedf334988ba4c2962db8080a84d2e9a683b591e69ff` | 1 |

Lire le manifeste puis les parties ordonnées. Vérifier tailles et empreintes,
concaténer leur texte ASCII, décoder base64 puis décompresser gzip. Vérifier
ensuite taille et SHA-256 des octets originaux. La compression/décompression
locale a reproduit les originaux ; toutes les valeurs distantes ont été
relues identiques avant validation du manifeste.

Les sources réutilisent les archives Jeux 19 (MES/MYM/MGC) et 14 (MNQ),
référencées dans le manifeste. Les données de prix ne sont pas recopiées
publiquement. Les lignes quotidiennes et hebdomadaires publiques sont des
agrégats demandés par Diego ; prix, trades et décisions individuels restent privés.
