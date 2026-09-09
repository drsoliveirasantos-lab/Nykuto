# Jeu 29 — restauration privée

Archive TRADING_DATASETS, namespace `5eba3a535f584bb3b0dbcdff623811ca`,
clé `jeu29/shared-portfolio-v1/manifest.json`. Les deux parties et le manifeste
ont été écrits puis relus à l'identique le 9 septembre 2026.

| Fichier privé | Octets | SHA-256 | Parties |
| --- | ---: | --- | ---: |
| train-runs-private.json | 667931 | `f9e723832d179d507415760dd0942aa1e7cb1e6a13bd4ddc2439d1ce6cf835c1` | 1 |
| report.json | 20284 | `0ffe68a1563e1d385afab728726a22e2c8f22db39b8c95262fd1bcdf160709dc` | 1 |

Lire le manifeste, puis les parties ordonnées. Vérifier taille et empreinte,
concaténer le texte ASCII, décoder base64, décompresser gzip et vérifier les
octets originaux. L'encodage/décodage local a reproduit les originaux à
l'identique avant écriture ; la relecture des valeurs distantes est identique.

Les sources réutilisent les archives Jeux 19 (MES/MYM/MGC) et 14 (MNQ),
référencées dans le manifeste. Aucune nouvelle capture ni duplication des
prix bruts. Les détails privés incluent trades, journées et décisions de refus.
Git ne contient que code, protocoles, empreintes et statistiques agrégées.
