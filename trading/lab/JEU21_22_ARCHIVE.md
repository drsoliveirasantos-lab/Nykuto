# Archivage et contrôles des Jeux 21–22

Le 9 septembre 2026, les 17 fragments privés et les deux manifestes ont été écrits dans TRADING_DATASETS, puis relus intégralement et comparés aux valeurs écrites. Toutes les comparaisons sont identiques. Les données de marché et les transactions ne sont pas publiées dans Git.

Pour restaurer : concaténer les fragments ASCII dans l’ordre du manifeste, décoder base64, décompresser gzip et vérifier la taille/SHA-256 originale. Le Jeu 22 référence les sources préexistantes des Jeux 19 et 14 ; il n’invente pas un nouveau jeu indépendant.

| Jeu | Manifeste privé | SHA-256 du manifeste |
| --- | --- | --- |
| 21 | `jeu21/native-markets-v1/manifest.json` | `bb3ac646c8c484cc6702f3e37386529cd68dd13b1fe5a8de96d42c4a9346e037` |
| 22 | `jeu22/opening-retest-v1/manifest.json` | `ebfb4d9984e0e61d32ba8ca2389e0d122bc45383a7bdd29a2c2532ad9e967fe2` |

| Jeu | Fichier | Octets | SHA-256 |
| --- | --- | ---: | --- |
| 21 | `dataset.json` | 3363302 | `21bb71d50ef00065a08d8f74ae2b5def70286014d9750fd870e8c8566bb6de5f` |
| 21 | `train-runs-private.json` | 386575 | `ab1b4a3c31063bdbd066113998a85405c67b8a51b057b2fd58b7eb88fd198afa` |
| 21 | `report.json` | 166244 | `3e94a559dc2cc4acf3321275d81e560e7c7f1204497a1d74f99cd5f0419733d7` |
| 21 | `selection.json` | 340 | `1c9aee2fa93a10a8d8df1276d9ed2fb6699dd3c82858110a80a7d8b2a50a4f6b` |
| 22 | `train-runs-private.json` | 508976 | `afac5b0f62e143f0ebc2a528a245b828c55f97a6f990b0d3902c3cf7cf892d15` |
| 22 | `report.json` | 54521 | `58544dfba3dc1c77badfd329aaf8115d0a6f13881b527a72767792c1a16fdb58` |
| 22 | `selection.json` | 340 | `46d1f0a74a8cb2bde3b763d74326950f31daceb3c66fac09e48baf3d62000d7c` |

Validation avant publication : 154 tests logiciels réussis ; construction réussie ; hygiène sans alerte ; 25 fonctions Pages vérifiées. Les inventaires gelés comportent respectivement 42 et 50 fichiers, contrôlés par SHA-256. Les 17 configurations des Jeux 19–22 figurent dans le registre ; les autres essais antérieurs restent dans leurs propres rapports. Aucun ordre, broker, Paper Bot ou Shadow activé. Pas de vérification dans un navigateur. Les contrôles logiciels ne prouvent aucune rentabilité.
