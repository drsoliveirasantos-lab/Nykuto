# Archive du Jeu 38

Préfixe neuf `jeu38/structure-obstacle-v1/`, binding privé `TRADING_DATASETS`.
Le [manifeste public](./jeu38-archive.json) décrit les empreintes, sans exposer les transactions.

- Manifeste privé : `jeu38/structure-obstacle-v1/manifest.json`.
- SHA-256 du manifeste : `4ce3001ca588452bb571ec8dc66f7219468c9a578c4941324591f3f6bbc0b5a0`.
- Rapport : 94 837 octets, SHA `dc6ea2f52b3f69f0f5dd9e8cd6534ba6498c10b21e96d6fa001244affb4f221f`.
- Exécutions privées : 363 799 octets, SHA `e6f05d0848c2d8e7cdd6032c8d6bd29462c8bf6cf709087fa2c653e1ef7b1776`.
- Deux parties et manifeste relus à l’identique après écriture le 10 septembre 2026.

Pour restaurer hors Git, lire le manifeste, vérifier son SHA puis chaque partie (taille/SHA), concaténer les parties dans l’ordre, décoder base64 et décompresser gzip. Vérifier enfin taille et SHA du fichier reconstitué. Une sortie existante doit être vérifiée et reprise, jamais écrasée ni recalculée comme un nouvel essai.

Les trois sources d’entrée restent définies par `jeu38-source.json`. Les anciennes archives et les collectes prospectives ne sont pas modifiées. Le gel original est publié au commit `563ab6eff9e475ddcc40058b9fb9b2342ef4618a`.
