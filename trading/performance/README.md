# Personal performance dashboard

The Dashboard's `Mes performances` section presents a monthly calendar, cumulative
R curve, per-day trade details and six statistical cards. It borrows the useful
journal/calendar interaction shown by the owner while preserving Nykuto's dark
theme and compact 12px content / 10–11px metadata hierarchy. Inputs remain 16px
and touch targets 44px. The calendar can scroll inside its panel on narrow screens.

## Data and ownership

`performance.mjs` waits for the existing account session and reads only the
current member's `nykuto-trading-trades-v1` document through `window.Nykuto`.
It never reads another account, queries a broker or stores data on the device.
The current D1 ownership and optimistic revision checks remain unchanged.
Journal save/delete emits `nykuto:journal-updated` only after acknowledged writes;
the dashboard rereads account memory. Fresh page loads retrieve the saved server
state. There is no live cross-device push or new background request.

`closedAt` is an explicit timestamp added to new manual, discipline and Replay
entries. Manual entry accepts a local device date/time and serializes it as ISO.
Replay uses the historical exit-candle timestamp; it is marked `mode: replay`.
The discipline journal keeps the recorded result time and manual/paper mode.
Old records are never rewritten: missing closing time uses `createdAt` and is
disclosed; absent modes stay unknown. A setup label alone cannot prove a mode.
Malformed explicit closing dates do not fall back to another date. Duplicate IDs,
invalid dates and nonnumeric/nonfinite R values are excluded with a visible count.

The opening month is the last valid entry's month in the device timezone, or the
current month for an empty journal. Users can choose months, step months, return
to the current month, filter modes and change timezone. Date attribution uses
the selected timezone, including DST. The detail table follows the chosen day.
No demonstration profits are inserted into empty accounts.

## Metric definitions

All metrics use the selected month's valid records and mode filter, ordered by
closing timestamp, then input order for ties. Old dates use their disclosed
fallback. R is per-trade initial risk, not a fixed monetary amount. Commissions
are included only insofar as the entered R includes them. No conversion from the
current capital/risk settings is allowed: those are not historical trade sizes.

- Total: sum R. Average: sum / valid count.
- Win rate: positive records / all valid records, including zero outcomes.
- Gains/losses: positive R sum / absolute negative R sum. No losing trades shows
  `Sans perte` if gains exist; all zero or empty shows unavailable. This is not a
  monetary profit factor when risk amounts differ.
- Maximum drawdown: largest peak-to-trough cumulative R after each trade, with
  a zero starting point at the beginning of the selected month. It does not include
  unrealized trades, intratrade extremes, earlier peaks or percentage equity.
- Longest loss streak: consecutive negative trades, reset by a zero or gain.
- Curve: end-of-day cumulative R from zero, so intraday drawdowns may exceed the
  visible daily curve's decline. Day cells and detail rows share the same records.

Broker synchronization is explicitly shown as unconnected. Automatic import
requires identifying the users' broker/platform, its export or read-only API,
consent and a separate verified integration. No account password/API-key field,
import success claim, balance, trading signal or future-performance score is added.

## Validation and delivery

`scripts/test-trading-performance.mjs` checks calendar/statistic reconciliation,
mode separation, timezone boundaries, legacy attribution, malformed rows, leap
years and monthly drawdown isolation. Existing account tests continue to cover
owner isolation. Page identifiers, imports and assets are checked statically;
no browser rendering check is claimed. Publication uses the existing trading
branch, then a scheduled follow-up verifies its exact CI and Cloudflare commit.

September 8 validation: 69 trading tests passed, including four new performance
tests and the existing account, Replay-related and discipline checks.

## Ergonomie et couleurs personnelles

Le sélecteur Affichage propose le calendrier complet et une liste des seuls jours
avec des trades. La liste est proposée par défaut sur une largeur ≤540px ; un
choix explicite reste conservé pendant l'ouverture de la page. Les totaux et
filtres sont identiques dans les deux vues. Sur mobile, sélectionner une journée
amène à son détail. Un mois sans trade reste explicitement vide.

« Personnaliser les couleurs du calendrier » règle les journées positives,
négatives et le fond. L'aperçu est immédiat ; Enregistrer attend la confirmation
du compte. Couleurs par défaut prépare un aperçu à enregistrer. Le texte devient
noir ou blanc selon le meilleur contraste ; les signes des résultats subsistent.
Le calendrier seul change de couleur, pas le graphique TradingView.

La clé personnelle `nykuto-trading-appearance-v1` réutilise les contrôles
d'appartenance et de révision existants. Le serveur exige exactement trois
couleurs hexadécimales ; aucune chaîne CSS ni propriété supplémentaire n'est
acceptée. Voir `appearance-core.mjs`, `appearance.mjs` et l'audit
`../UX_AUDIT.md`. Aucun historique n'est modifié par ces réglages.
