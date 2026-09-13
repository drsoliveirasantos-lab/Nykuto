# Historique MNQ réutilisable

Point d’entrée : https://trading.nykuto.com/historique/ . Menu **Historique** ; choix M1/M5/M15/H1, mois et jour. Télécharger le mois ou tout le timeframe en CSV. Horodatage Unix en secondes UTC à l’ouverture ; colonne volume vide si absente. Ce calendrier décrit les exports observés, pas les annonces économiques ni un calendrier officiel de bourse.

## Source canonique privée

Version `2026-09-13-v1`, namespace existant `TRADING_DATASETS`, préfixe `mnq-history/2026-09-13-v1/`.

- `manifest` : couverture quotidienne/mensuelle, découpage, empreintes et limites.
- `m1/part-000`…`part-052`, `m5/part-000`…`part-028`, `m15/part-000`…`part-009`, `h1/part-000`…`part-004` : tableaux OHLCV encodés gzip/base64, 5 000 lignes au maximum par bloc.
- `restoration` : provenance des archives et avant/après des trois corrections M5. Pour retrouver l’export M5 brut, inverser les deux remplacements et enlever la bougie ajoutée à 10:35 UTC le 9 septembre 2026. Les anciens archives/jeux KV sont préservés.

L’API protégée `/api/lab/history` sert le manifeste ; `?dataset=m5&part=0` sert un bloc. L’authentification Access et le contrôle des membres existants restent obligatoires. Aucun accès arbitraire aux clés KV n’est offert. Les prix ne sont pas dans Git.

Le module `history-source.mjs` fournit `loadManifest()`, `loadHistory(dataset, {from,to,progress})` et `toCsv(rows)`. Il contrôle l’empreinte de chaque bloc et, pour une restauration complète, celle du tableau assemblé. Les bornes `from` inclus / `to` exclu sont en secondes UTC. Ce point d’entrée permet aux prochains replays de charger exactement la même source.

Les sources sont Archive(4).zip et Archive 3.zip, après déduplication de valeurs compatibles. M5 corrigé 142 311 ; M15 47 437 dont 27 137 agrégés par groupes complets de trois M5 ; H1 21 825 ; M1 263 190 dont 108 420 avec volume. Sur l’ancienne fenêtre du 27 octobre 2024 au 11 septembre 2026 : 132 650 M5 brutes et 132 651 corrigées. L’effet sur les anciens résultats du Pine n’est pas encore calculé.

## Reprise de l’audit

Lire `PINE_AUDIT.md`, `PINE_TEST_PROTOCOL.md`, `fidelity-stage-a.json`, puis `../lab/RESEARCH_LESSONS.md` et le catalogue avant un nouveau test. Le premier rapport porte sur les mécanismes et les données ; aucune parité complète du scanner TradingView n’est encore attestée. Préserver les anciennes preuves et séparer code fourni, variante corrigée et résultat calculé.
