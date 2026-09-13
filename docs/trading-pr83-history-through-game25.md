# PR 83 — historique conservé jusqu’au Jeu 25

Le corps de la PR atteignait 65 069 caractères, proche de la limite GitHub.
Le texte ci-dessous est conservé intégralement avant le remplacement par une
présentation concise du périmètre actuel. Source : PR 83, relevée le 9 septembre
2026, tête 612bbdc1a76ec90fe313a9d7871664ab19f0eb8f. Les états historiques ne
remplacent pas les résultats et contrôles du commit courant.

---

## Summary

Nykuto Trading HQ needs evidence beyond the small Jeu 03 sample before progressing to paper trading. This PR keeps the private workspace, Replay and existing diagnostic games, and adds a fixed independent comparison without enabling broker execution.

- Preserve Trading HQ, Replay, Backtest V1, Jeu 02 and Jeu 03 on `feat/trading-hq-v1`.
- Add Jeu 04: SPY 15m EMA 9/21 alone versus EMA 9/21 with ADX >=20, evaluated separately over January–February, March–April and May–June 2026, with December preparation bars.
- Keep next-bar entries, ATR x1.25 stops, 1.5R targets, daily limits and a 0.05R simulated cost. Re-simulate at 0.10R for cost sensitivity.
- Apply adverse opening-gap fills and daily counter resets equally to both variants in the new engine; document the difference from the older games.
- Load the verified Alpaca snapshot directly when the owner clicks « Lancer le Jeu 04 ». Keep local CSV import as an optional advanced control, and export a provenance-bearing JSON report.
- Require >=40 filtered trades overall, >=12 per period, positive expectancy in every period, improvement over baseline, PF >=1.10, realized drawdown <=8R and positive aggregate cost-stress expectancy before labeling a hypothesis worth examining.
- Serve the fixed snapshot from private Cloudflare KV through an endpoint that verifies the Trading HQ Access JWT signature, audience, issuer and expiry. Check the CSV SHA-256 and 3,758-bar count before calculation. No raw dataset or credentials are committed to Git.
- Keep Paper Bot and Shadow OFF; the snapshot is historical and no brokerage execution is connected.

## Validation

- 18 targeted regression tests pass, covering the frozen engine, invalid data, duplicate inflation, causality, next-bar execution, sample gates, authenticated snapshot access, altered bytes, unavailable data and expired sessions.
- The hosted loader reproduces the previously calculated 47 filtered trades and -7.614160272285612 R from the exact CSV.
- Repository hygiene and the existing static build pass locally.
- CI executes the new regression suite through `npm test`.

## Integrated historical data

The Yahoo 60-day limit was resolved using Alpaca SIP history from December 2025 through June 2026. All 145 exchange sessions and 3,758 regular-session bars were checked, including the December 24 early close. The unchanged protocol yields **Non confirmé**: 94 baseline trades, -14.14 R; 47 filtered trades, -7.61 R; doubled-cost filtered total -9.96 R.

The snapshot is installed in the dedicated `TRADING_DATASETS` KV binding. A read-back matched all 245,210 UTF-8 bytes. Access continues to protect the custom and Pages domains; endpoint responses are private/no-store and both production and preview fail closed. This is a fixed snapshot, not automatic ongoing Alpaca synchronization.

## Jeu 05 — fixed session-close comparison

The owner requested improvement after Jeu 04 failed. The diagnostic found four filtered adverse-gap exits totaling -9.96 R. A single policy was frozen in a local protocol commit before retrieving the new history: flatten at the opening of the final 15-minute regular-session bar and cancel overnight signals, with all signal, stop, target and cost settings unchanged.

- Add one-click Jeu 05, comparing the original EMA+ADX strategy and the session-close version on January–June 2025, prepared with December 2024.
- Load 3,706 bars and complete exchange calendars from the existing private KV binding through a separately authenticated endpoint. Read-back matches all 271,688 UTF-8 bytes; the client verifies the fixed SHA-256.
- New 2025 comparison: 54 trades in each version; total -24.03 R → -5.99 R; win rate 35.2% → 40.7%; worst observed trade -7.90 R → -1.05 R. Candidate still fails profitability, drawdown and cost-stress gates: **Non confirmé**.
- Display the negative May–June 2025 period and doubled-cost result (-8.69 R). No additional filter or new dates were selected after seeing the holdout result.
- Show the 2026 diagnostic and exploratory comparison separately. Jeu 04 still reproduces its original 47 trades and -7.614160272285612 R exactly.
- Test final-bar open-only execution, early closes/DST, missing sessions, signal cancellation, dataset integrity and private endpoint authorization. Bots remain OFF.

Protocol: `trading/lab/SESSION_COMPARISON.md`. Historical bar fills and fixed costs are modeling assumptions, not execution guarantees. The holdout is retrospective and is now considered seen.

## Owner validation

Open `/lab/#sessionGame` and click **Lancer le Jeu 05**; no file download/import is required. Jeu 04 remains available below. Reusing these inspected periods after tuning parameters is not fresh validation. This PR remains open for owner review before merging into `main`.

Protocol and limits: `trading/lab/INDEPENDENT_VALIDATION.md`.

## Jeu 06 — SPY versus micro futures

The owner asked to continue improving the Lab after connecting Massive. The new first-screen comparison uses the fixed EMA9/21 + ADX session-close strategy on SPY, MES and MNQ over July–December 2025. Cost scenarios are explicitly hypothetical per-unit fees plus two ticks; stress reruns the entire simulation at doubled costs. Returns are normalized in R, not a same-capital account simulation.

- Private 13,440-bar snapshot, including separate-contract warmup, and 148 verified calendar sessions. All products score the same 128 cash sessions. Each futures interval is checked against Massive schedules, and rolls are fixed before the corresponding expiries with separate indicator preparation.
- January–June 2024 was ruled out before price retrieval because futures schedules were unavailable; the availability amendment and final protocol were committed locally before the 2025 prices were retrieved/scored.
- SPY: 57 trades, −5.46 R. MES: 54 trades, −12.16 R. MNQ: 66 trades, +5.23 R (+3.36 R with doubled costs). All three remain **Non confirmé**: MNQ loses −0.66 R in September–October, failing the fixed consistency gate.
- `/api/lab/jeu06` reuses Access signature verification and the private KV binding; the browser verifies the snapshot and recalculates on click. Licensed prices are not committed to Git. No broker execution or bot activation.

Validation: 24 tests pass, covering tick/cost arithmetic, causal entries, session-close open-only execution, ambiguous bars/gaps, actual stress reruns of daily brakes, missing-history rejection and private endpoint integrity/authentication. Full snapshot integration reproduces results; static build and repository hygiene pass. Visual browser QA was not requested. The exact stored snapshot was read back and matched byte for byte. PR remains open against main; no merge requested.


## Jeu 06 audit and TradingView alerts — 8 September 2026

The Jeu 06 snapshot was recalculated unchanged and its 354 normal/stressed trades checked separately for cash-to-R accounting, chronological drawdown, contract/tick/session rules and daily brakes. MNQ remains unconfirmed: +5.23 R over 66 trades, +3.36 R with doubled costs, but September–October loses 0.66 R. The Lab now explains the next independent confirmation campaign and paper-execution checks without promising a number of games or enabling a bot.

The private /alerts/ page adds an inbox, refresh, a clearly labeled internal test and a guide that reveals the private webhook address only to authenticated users. TradingView conditions must still be created in the user's own account; 2FA and webhook availability under that account's offer are required. No genuine TradingView delivery has been received yet.

An isolated Cloudflare Worker accepts only bounded JSON POSTs with the random 256-bit address and official TradingView source IPs. It persists alerts in dedicated TRADING_ALERTS KV before acknowledging, groups identical deliveries, and exposes no reads. Existing Access protection and TRADING_DATASETS remain in place. No broker/order API, subscription purchase, email or SMS sending was added. KV eventual consistency and provider delivery limits are documented.

Validation: 29 trading tests passed, npm run build and npm run hygiene passed, all new UI control references resolve. The receiver /health responds 204 and its public /api/alerts returns 404. Private configuration read-back matches; inbox has no seeded market alerts. No browser QA performed. Pages deployment and CI are checked on this commit. Main is not merged; owner validation remains required for merge.


## Jeu 07 — supplementary MNQ confirmation, data gate blocked

The next frozen candidate is MNQZ4, October–November 2024, with September 9–30 preparation and the unchanged Jeu 06 trading/cost rules. These dates precede the previously used periods. The initial local protocol commit was recorded before price retrieval. One two-month window cannot satisfy the existing three-window research requirement or activate a bot.

Massive returned 5,481 raw bars: all 1,522 expected cash bars across 59 Alpaca sessions are present, including 416 preparation bars and 43 scored-calendar sessions. Its futures schedule query returned only two duplicate pre-open events; November 29's targeted query returned no records. Thus 0/59 futures sessions can be verified. Searches of official CME pages did not recover the exact 2024 schedules; 2026 hours are not substituted.

The Lab now exposes a Jeu 07 data-check button and missing-session report, without presenting zero or fabricated performance. The engine refuses scoring before indicators/simulation if prices or schedules are incomplete. The incomplete snapshot is retained only in private KV and served through the signed Access endpoint; its SHA-256 is checked in the client. No bot or brokerage integration was activated.

Validation: 34 trading tests passed, plus the final targeted confirmation tests after tightening pause/PCP and timestamp checks. Build and hygiene passed; new control references resolve. KV write/read-back matches all 86,442 bytes. No browser QA performed. The publication adds a prepared, blocked experiment, not a successful backtest. Owner validation is still required for a main merge.


## Jeu 07 — partial schedule recovery

The owner asked us to find the missing historical schedules. Ironbeam's November 26, 2024 publication explicitly supplies the November 28 17:00 CT opening and November 29 12:15 CT close for equities. Only that interval was added, with source URL, publication date and planned-schedule provenance. It is not represented as a Massive event or a record of intraday incidents.

The private v2 snapshot preserves all 1,522 prices and the full cash calendar unchanged. Coverage is now 1/59 sessions; 58 remain missing. The engine, dates and trading rules are unchanged, and scoring remains blocked with null performance. A CME April 2023 fact card and the 2024 settlement advisories were found but not used to invent per-day trading intervals. CME's public historical-hours service and a targeted Massive NQ query supplied no usable replacement. The Lab displays this precise progress and the sources.

Validation: all 9 targeted confirmation/access tests pass, including a new partial-holiday regression; actual v2 integration verifies the original prices/calendar and the 58-session block. Build, hygiene and diff checks pass. Private KV write/read-back matches all 88,012 bytes exactly; v1 is retained. No browser QA, bot activation, or main merge. CI and the private site's deployment are checked separately on the publication commit.


## Jeu 08 — prospective collection

The remaining Jeu 07 schedule gaps cannot currently be completed with the existing historical source. This adds a new, predeclared MNQZ6 collection instead of reusing previously tested periods. Preparation is September 9–30, 2026; the first test window is October–November. Existing game rules and data are preserved.

- Add an authenticated, read-only Lab status endpoint and collection panel, showing missing prices, schedules and late observations.
- Validate contract identity, tick/grid integrity, early close, DST, source pagination and capture delay. Keep raw captures and hashed journal revisions in private KV only.
- Program one bounded daily task with the existing Massive, Cloudflare and GitHub connections, first capture September 10 and final run December 2. No Databento signup or purchase; no live execution or performance calculation.
- Keep Paper Bot and Shadow disabled. One new window cannot satisfy the three-window confirmation requirement; a final calendar/interruption and data audit remains required.

Validation: all 40 trading tests passed locally, static build and repository hygiene passed. Website CI and Repository hygiene are green for `04c7cb9c1d6cf37eb1fc11bdbe45ded76cb686de`; Cloudflare publication succeeded for that exact commit. Private journal initialized with zero observations and the confirmed active collection task. No browser preview was requested or performed. Published only to the existing Trading HQ branch; main is unchanged.


## Lab clarity and navigation

The Lab previously displayed collection, historical games and editable strategy controls in one long page, making a prepared collection look like an immediately runnable performance test. This change adds three views: current follow-up, previous tests, and manual testing.

- Open on Jeu 08 with confirmed status, a clear next action and the preparation / test-data / review calendar. Explicitly distinguish scheduled collection from unavailable performance results.
- Collapse historical games into named disclosures; preserve existing controls, IDs and deep links. Add keyboard navigation and browser back/forward handling for tabs.
- Separate manual settings from the frozen prospective protocol. Apply consistent 12px content, 11px metadata and larger headings, with mobile stacking and fewer simultaneous panels.

Validation: 145 unique HTML IDs, every previous control retained, structural nesting and asset paths checked; 40 existing trading tests pass; status messaging checked for scheduled, unscheduled, failed and complete-archive states. Static build and repository hygiene pass. No browser visual QA was requested or performed. Trading engines, stored data and collection automation are unchanged.


## Replacement dates and manual trading discipline

At Diego’s request, replace the unavailable Jeu 07 dates with a fixed July 1–24, 2026 MNQU6 diagnostic, while retaining the old 2024 snapshot and the Jeu 08 prospective collection. Dates were fixed locally before downloading prices. June 15–30 prepares indicators; the new snapshot has 28 complete sessions and 728 candles. All prices remain private, checksum-pinned and Access-protected through `/api/lab/jeu07b`.

The unchanged strategy produces 7 trades, 5 wins, +3.1786 R net (+3.0794 R with doubled costs). This short sample does not meet the transaction or three-window confirmation requirements and enables no bot. The Lab links to this runnable diagnostic and correctly places the middleware-mounted legacy games in the historical disclosures.

Add `/discipline/` with peak-to-current drawdown, recovery percentage and compounded losing-streak scenarios; pre-trade self-reported emotion, stress, fatigue, FOMO, revenge motive, plan and checks; an optional persistent five-minute pause; and a post-trade result/plan-adherence review linked idempotently to the existing journal. Journal entries show mode and before/after emotion. Browser-local persistence and optional export are explicit; storage errors retain saved results and expose journal-link retries. There is no broker lock, order, diagnostic emotion classifier or profitability score.

Validation: all 44 trading tests pass, including unchanged 2024 validation behavior, new-period coverage failures, private endpoint authentication, drawdown/recovery calculations and journal idempotence. HTML IDs/module references, JavaScript syntax, static build and repository hygiene pass. The private snapshot was written and verified by exact readback. No browser QA was requested or performed. Main and the scheduled prospective task remain unchanged.


## Personal tester accounts and feedback

Two specifically requested testers can use separate email-PIN identities. Required first/last-name onboarding and an active private D1 membership check now protect every route. Membership addresses, webhook tokens and profile records are provisioned outside Git; no invitation messages are sent automatically.

Journal, emotional preparation, checklist and strategy settings are stored per user in the dedicated TRADING_USERS D1 database. Server-derived ownership, expected-session checks and conditional revisions prevent cross-account access or silent stale overwrites. Browser state is document memory; the owner can copy absent legacy local records from Mon compte without replacing existing online data.

Each tester has a personal TradingView webhook configuration and inbox, with active membership checked by the isolated receiver. The owner's original webhook and history are retained. Feedback is visible only to its author and the site owner, who can respond and track À examiner / En cours / Traité. Broker choices are saved as preferences and clearly remain non-connected; there is no brokerage execution.

Validation: all 50 trading tests pass, including real SQLite queries for signed membership, onboarding, cross-user state/feedback/webhook isolation, owner privileges, CSRF, size bounds, revision conflicts and failed/concurrent saves. Build, hygiene, Functions syntax validation and account control references pass. Actual email-PIN delivery and actual TradingView alerts must be tested by each user; no browser QA or broker trading was performed. Published only through the existing Trading HQ branch; main and the prospective collection remain unchanged.


## Jeu 09 — six available MNQ months

Continue the unchanged bot tests beyond the seven-trade July diagnostic. The initial January–June 2026 attempt failed its price-completeness gate on March 6; targeted 15-minute and 1-minute retrievals confirmed missing data. No strategy result was scored for that sample. Following the owner's instruction to replace unavailable dates, a second local protocol was frozen before retrieving additional prices or scoring: January–February, April–May and July–August 2026, with separate contract preparation. These are six nonconsecutive months, not continuous account performance.

The complete private snapshot has 4,746 cash bars, 183 sessions including preparation and 123 scored sessions. Unchanged EMA/ADX, stops, targets, daily brakes and session-close rules produce 49 trades, 21 wins (42.9%), +2.097047 R net and +1.176098 R in a full doubled-cost rerun. January–February loses 1.043394 R and aggregate PF 1.094313 remains below 1.10 before rounding: **Non confirmé**. Historical date overlap also prevents calling this fresh independent validation. Paper Bot and Shadow remain OFF.

The Lab now opens on Jeu 09, automatically verifies and recalculates the snapshot, shows three period results and the failed gates, and keeps prospective Jeu 08 collection accessible in a disclosure. A new authenticated endpoint serves only the pinned private dataset; raw prices, accounts and credentials are not committed. The final snapshot and the incomplete initial archive were saved and read back byte for byte (331,299 and 310,738 bytes).

Validation: 53 regression tests pass; all 98 normal/stressed trades independently checked for dollar-to-R arithmetic, chronology, session boundaries, nonoverlap, costs and daily brakes. New control references, syntax, build, hygiene and diff checks pass. No browser QA or broker execution. Publish through the existing trading branch only; main remains unchanged. Protocol and limitations: trading/lab/MNQ_SIX_MONTHS.md. Owner entry: /lab/#sixMonthsGame.


## Jeu 10 — explained confluence, events and direction tests

The owner requested autonomous testing and evidence for additional trend, candle, volume, event and long/short criteria. Eight versions were fixed in a local protocol commit before their calculation; no parameter grid or post-result threshold changes. The existing private Jeu 09 snapshot is reused, so all results are explicitly exploratory, not independent confirmation.

Add causal cash-hour EMA20/50, same-session engulfing bodies, signal volume relative to five previous sessions at the same New York slot, exclusion of CPI/Employment Situation/FOMC decision days from official BLS/Fed calendars, their four-filter combination, and long-only/short-only variants. Every variant and cost scenario resimulates the daily brakes. Existing market-engine output is preserved when no filter is supplied. Calendars are historical and may have been revised; this does not provide live news, sentiment, earnings or geopolitical analysis.

Results (normal / doubled-cost R): reference 49 trades +2.10 / +1.18; hourly trend 22 trades −2.83 / −3.24; engulfing 4 trades −0.02 / −0.08; volume 33 trades +5.38 / +4.73; excluding announcement days 39 trades +3.61 / +2.87; all four 0 trades; long-only 28 trades +4.42 / +3.95; short-only 24 trades +0.19 / −0.30. None satisfies all existing gates. The event version remains below 40 trades, and volume loses in July–August. Thresholds stay fixed; no bot is enabled.

The Lab now opens on the comparison and includes per-period and per-direction results, median-duration limits, all failed checks, the exact event scope and an expandable explanation for every assessed signal. An accepted signal canceled before entry is labeled accordingly. Jeu 09, older IDs, private accounts, datasets and the original prospective collection remain available.

A separate one-time autonomous audit/test follow-up has been created for December 3 after the existing prospective collection, with its future event calendar fixed now. It must audit complete data before scoring the same eight rules, preserve the original Jeu 08, publish failures honestly and stop on stable data/access blocks. This is a bounded campaign, not endless optimization or a promise of perfection.

Validation: 59 tests pass; a separate audit checked all 398 normal/stressed trades for dollar-to-R accounting, chronological drawdown, session bounds, daily brakes, direction and event exclusions. Jeu 09 baseline and stress trades match exactly. 185 unique HTML IDs and all 20 new control references checked, previous IDs retained, syntax/build/hygiene/diff checks pass. No browser QA, broker order or main merge. Entry: /lab/#confluenceGame. Protocol: trading/lab/CONFLUENCE_DIAGNOSTIC.md.


## Selected-candle analysis — September 8

The Dashboard widget cannot supply candles to the site's analysis. This update adds /analysis/ with its own chart using the existing private, verified MNQ history. Members choose a contract, 20–500 candles, 15-minute/hourly bars and an endpoint; the chart and explanations consume exactly that window. Confirmed swing structure, potential MSS/BOS and latest candle shapes include explicit causal rules and event timestamps. Failed loads clear stale results; chart-library failure retains the text.

Navigation and Dashboard expose the page. Auth, personal state, bot protocols and private datasets are preserved; no prices or credentials enter Git. Documentation records data boundaries and definitions.

Validation: 65 trading tests passed (six new analysis tests); 72 real-data selections passed across three contracts and both intervals. Build, hygiene (zero findings), 25 Pages Function checks and static page references passed. Browser rendering was not checked.

Published to the existing trading validation branch as 29708cc08c37f08293d131d55dee7d21ce72acfd; main is not merged. A confirmed scheduled follow-up checks this exact commit's GitHub workflows and Cloudflare deployment after approximately three minutes, with bounded later checks if necessary. Remote publication success remains to be confirmed.

## Personal performance calendar — September 8

The Dashboard now turns each member's saved journal into a monthly calendar with selectable days, cumulative R curve, daily trade details and six metrics. Mode and timezone filters apply consistently to the cards, calendar and curve. Empty, invalid and legacy records are disclosed instead of producing fictitious profit figures.

New journal entries capture closing time and mode; Replay records retain their historical exit-candle time and explicit Replay mode. Existing entries and per-account D1 ownership are preserved. There is no broker synchronization, cash-balance inference or new private-data endpoint. The design follows the owner's calendar reference and existing compact Nykuto theme.

69 trading tests passed, including four new calendar/statistic/timezone tests. Build, hygiene (zero findings), 25 Pages Function checks, script syntax and static page references passed. No browser rendering test was requested or performed. Definitions and limitations are in trading/performance/README.md.

Published to the trading validation branch as 6f223bef05043c59b5053719864ab81526bf300f; main remains unmerged. An enabled follow-up checks this exact revision's workflows and Cloudflare deployment in approximately three minutes. Remote success remains pending verification.

## Ergonomics audit and calendar personalization — September 8–9

The audit found ambiguous risk calculations, hidden mobile navigation, duplicate Replay links and a calendar that required horizontal scrolling on small screens. Blank prices and contradictory Long/Short levels now refuse misleading ratios; the sizing scope is explicitly euro cash units, not MNQ contracts or Forex lots.

- Unify navigation on every trading page, add a collapsible mobile menu, restore module history and focus, and retain 44px controls with 16px inputs.
- Add a mobile list of traded days and three personal calendar colors with immediate preview, explicit acknowledged saving and automatic text contrast. The new account state accepts only three hex colors under the existing ownership/revision gate.
- Clarify global versus filtered metrics and historical versus TradingView selections; protect journal deletion with confirmation, improve local save feedback and add Analyse to tester feedback destinations.

73 trading tests pass, along with build, zero-finding hygiene, 25 Pages Functions and control/asset references. Browser interactions were checked in an isolated local preview with synthetic journal/session data; desktop and 375/320px layouts were inspected. Real account mutation/authentication was not exercised. Native MNQ chart rendering could not be verified because the HTTP preview lacks Web Crypto; integrity checks remain enforced and now explain HTTPS in French. TradingView refused NASDAQ:NDX in the audit widget; an external-chart fallback is visible. No realtime MNQ feed or broker sync was added.

Full evidence and remaining work: trading/UX_AUDIT.md. No private prices, fixtures, accounts, bot protocols or existing MNQ automations were changed or published. Published commit 648524ed151980d581bc745dc58e02ec9fddff83, tree f388b82e82496368f295aee47eefc2f9fe7b0edb, to feat/trading-hq-v1 only. CI/deployment confirmation for this new revision remains pending; main is not merged.

## Dashboard compact et indicateurs du graphique — 9 septembre 2026

Le Dashboard occupait trop d’espace et les membres ne distinguaient pas clairement historique, alertes et connexion courtier. Cette livraison réduit les marges et les cases du calendrier, ajoute un accès Connexions et précise que le courtier et l’import automatique ne sont pas implémentés.

L’analyse possède un menu pour afficher/masquer EMA 9/21, HH/HL/LH/LL confirmés, BOS, MSS potentiel, autres ruptures, englobantes, doji/mèches, niveaux, RSI 14, volume et Bollinger 20. Le RSI a une échelle séparée ; masquer un tracé préserve la sélection et le zoom. La dernière séance disponible vient du vrai historique vérifié (31 août 2026), avec un raccourci vers son contrat. Aucun flux en direct ni changement de stratégie.

Validation locale : 78 tests de trading, 72 sélections sur le vrai historique (3 contrats, 2 intervalles), build, hygiène sans anomalie, 25 Functions, syntaxe et références de page. Tests de calculs et adaptateur graphique ; aucun nouvel essai visuel navigateur, aucune authentification réelle ou sauvegarde de compte essayée. Configurations des 3 boîtes d’alertes vérifiées en lecture seule ; aucune livraison TradingView réelle enregistrée au contrôle.

Commit publié : `0ac760a2406fe3035d3327a91661582819e110df` ; arbre `8afe45befed3f3aff5a5c4674077ddf91a2554da`. Les workflows et le déploiement Cloudflare exact sont vérifiés séparément. Aucun compte, journal, bot ou tâche MNQ modifié.


## Connexions et validation du bot — 9 septembre 2026

La sélection d’un broker était un simple champ et pouvait être confondue avec une connexion opérationnelle. Ajout de `/connections/` : galerie compacte, recherche et filtres, choix par carte ou nom personnalisé, sauvegarde explicite dans l’état personnel existant. L’ancien formulaire reste compatible et le pseudo TradingView est préservé. Les cartes séparent simulation, alertes, brokers et Lucid (prop firm), avec des statuts honnêtes et des liens officiels.

Un guide distingue backtests, période indépendante, Paper Trading manuel et exécution simulée du bot. Il reprend le verdict non confirmé du Jeu 10 et les seuils existants. Aucun broker, flux temps réel, import de trades ni exécution automatique ajouté ; comptes réels, historiques et tâches MNQ inchangés.

Validation locale : 82 tests de trading, build, hygiène sans anomalie, 25 Pages Functions, syntaxe JS et références de page. Tests de compte sur fixtures : isolation, révisions, rejet de credentials et confirmation de sauvegarde. Aucun contrôle visuel navigateur, authentification broker ou sauvegarde d’un compte réel. Suivi de publication sur le commit exact `78e8abab9498c97409a786080776fbf1a1bbfc04`, arbre `fa5472d9ba4c96f6da4acab4080814ae49d05556`.


## Jeu 11 — additional MNQ validation (9 September 2026 UTC)

The 2026 results did not establish a reliable strategy. This update tests the same eight variants on the additional April–May 2025 MNQM5 window, selected for data availability before performance calculation. The Lab displays all outcomes and the unchanged prospective schedule.

- 53 complete sessions, 42 scored; 1,378 candles and 286 warmup candles. Fixed private snapshot and raw captures archived and read back; no prices or member records added to Git.
- 16 simulations: baseline −4.4344 R; Volume −4.4622 R; Long only +0.9514 R with only seven trades. No variant is confirmed or enabled. Costs 3.50/7 dollars are assumptions.
- Causality checked at all 1,378 candle prefixes; 672 completed-session simulation comparisons; 108 simulated trades audited across variants/costs (not independent observations). Prior Jeu 10 results reproduced unchanged.
- Local validation: 85 trading tests, build, zero hygiene findings, 25 Functions, JS syntax and page references. No new browser visual check, broker integration, paid data, order or real-account test.
- Existing MNQ collection and December 3 test tasks remain unchanged. See trading/lab/JEU11_PROTOCOL.md and JEU11_RESULTS.md. Exact commit `b80117020ae9772947c64ba7d47578c1f409f4bd` verified: [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34299973854) and [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34299973874) succeeded. Cloudflare production deployment bb6f4225-8e42-4c4a-b895-6aeb6bb29b93 succeeded for the identical commit and trading.nykuto.com alias. No browser visual validation.


## Jeux 12–13 — timeframes, hours and a fixed Pullback candidate

The owner requested actual bot experiments over other minutes and times of day. Two documented development phases compare 5/15/30-minute signals, Full/Morning/Afternoon entry hours and Both/Long/Short directions: 54 configurations in total. The Pullback hypothesis was formulated after the first EMA Cross grid failed; all trials remain visible and the research is explicitly adaptive.

- Shared 5-minute execution, closed signals, next-open entries, fixed ATR/ADX/EMA parameters, tick-rounded stops/targets, session-close flattening and daily brakes. Doubled costs rerun the positions and brakes.
- 14,238 private 5-minute candles; all 4,746 reconstructed 15-minute OHLCV bars exactly match the pinned Jeu 09 reference. Ten new private archives were written and verified by exact readback; no raw prices or member records in Git.
- No EMA Cross configuration passes all gates. Two Pullback configurations pass the 2026 development gates; the frozen ranking selects 30-minute Full Both: 88 trades, +9.8188 R net, +8.6193 R at doubled costs, PF 1.3917, realized drawdown 5.4787 R.
- A separately scored June 2025 control returns +2.6092 R / +2.4522 R at doubled costs, but only eight of twelve required trades: still unconfirmed. Missing warmup bars prompted a documented June 16 contract rollover amendment before control performance; no evaluated session was removed. No replacement candidate was tried afterward.
- The Lab opens on these results with family/timeframe display filters and every failed gate. Prior games, accounts and the two MNQ tasks are preserved. PULLBACK_FORWARD_PROTOCOL.md fixes a separate future comparison; no broker, subscription, paper adapter or order is enabled.

Validation: 93 trading tests pass, build succeeds, zero hygiene findings, 25 Functions, 216 unique HTML IDs with all 198 previous IDs preserved. Signal/simulation prefix audits: 549/6,642 per grid, then 58/40 for the separate control; audit repetitions are not independent trades. Public report bytes match private results and candidate selection is unchanged. No new browser visual validation.

Publication verified for commit ab904a4d884cf2b19934469425995b7847d00e85, tree cd740ef6b567bfd6e1195d52c93a925c0fe29e7e: [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34303087604) and [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34303087568) succeeded. Cloudflare production deployment 30c04123-f356-4bbe-ba6b-6c827a21309c succeeded for that identical commit and trading.nykuto.com alias. A separate enabled follow-up will evaluate the fixed Pullback candidate after the prospective collection, on December 3, 2026; both existing MNQ tasks were read back and confirmed unchanged. No visual browser validation. See trading/lab/TIMEFRAME_RESULTS.md and the frozen protocols.


## Jeu 14 — immediate expanded historical validation

The owner requested testing the available past now and rejected another future appointment. The newly added Pullback follow-up has been disabled; the two earlier MNQ collection/test tasks are unchanged. No new automation was created.

The frozen 30-minute Full Both Pullback was tested across six MNQ contracts from the first verifiable schedules (March 17, 2025) through the latest completed September 8, 2026 session. Availability rules and the three primary 2025 windows were committed before performance. Complete chronological blocks restart with 220 warmup bars after a gap; missing data never becomes flat prices or zero-return days.

- 40,418 five-minute candles inspected; 372 expected cash sessions, 330 scored, 40 warmup and two incomplete price sessions. Sixteen private archives were saved and verified by exact readback; no prices or member history in Git.
- 234 simulated trades: +10.8921 R net, +7.2168 R at doubled costs, 48.72% win rate, PF 1.1362, realized drawdown 9.7384 R. This is partial historical coverage, not continuous-account performance.
- Separate July–December 2025 control: 83 trades, +4.0502 R / +2.4071 R stressed. Each window exceeds twelve trades, but July–August loses 4.8949 R and September–October is incomplete (40/44 days). Confirmation remains failed; windows are not replaced with winners.
- Without the control's best five trades: −3.3699 R. A fixed-seed 10,000-draw weekly bootstrap interval crosses zero. Direction contributions are descriptive, not a newly optimized Long-only strategy.
- Lab opens on the expanded report with monthly results, coverage, failed criteria and uncertainty; older games remain available. All eight earlier June-control trades and 88 development trades reproduce exactly in both cost scenarios, so 138 trades are additional to those prior candidate results.

Validation: 95 trading tests, build, zero-finding hygiene, 25 Functions, JS syntax, report byte equality, monthly/yearly totals and 237 unique HTML IDs with all 216 prior IDs retained. Actual-history audit: 437 signal prefixes, 660 stopped-simulation comparisons and 468 normal/stressed trade audits. No browser visual test, broker, order, account change or main merge.

Publication verified for commit cf76e035698e44233674be980f2bc06b099f49a4, tree 51dee5ea37e8bfafdb01681ad92bc44e86d486c9: [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34304940239) and [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34304940191) succeeded. Cloudflare production deployment cd93ab38-cb3e-44f9-b318-398557f6cefa succeeded for the identical commit and trading.nykuto.com alias. The Pullback future task is disabled and verified by readback; no new automation. See trading/lab/JEU14_PROTOCOL.md and JEU14_RESULTS.md.


## Jeu 15 — LucidFlex 25K (9 septembre 2026)

Le risque du Pullback était trop élevé pour la marge de perte d’un compte 25K. Cette livraison ajoute un simulateur d’évaluation LucidFlex (MLL EOD, pertes latentes, arrêt au breach, objectif et consistency stricte), trois scénarios fixés avant résultat et leur bilan au Lab.

- Référence30 min inchangée : 234 trades historiques reproduits aux deux coûts. Dans les cinq évaluations complètes, 3 breaches et 2 objectifs atteints indicatifs, aux deux coûts.
- Même Pullback avec budget50 $/trade et100 $/jour : aucun trade ;405 signaux refusés dans le diagnostic.
- Une nouvelle hypothèse de développement, Pullback5 min dans la tendance30 min :63 trades, +14 $ ;57 trades et −178 $ avec coûts doublés. Pire journée −94,50 $ (stress −96 $). Aucun objectif atteint sur les cinq comptes ; absence de breach ne valide pas la rentabilité.
- Cinq fenêtres complètes utilisées, trois incomplètes affichées sans calcul. Historique déjà examiné : aucune confirmation indépendante ou activation.
- Rapports et détails privés archivés sous jeu15/ avec relecture exacte et SHA256 ; source Jeu14 inchangée.
- 104 tests de trading, build, hygiène sans anomalie,25 Functions, syntaxe et références validés ;237 anciens IDs préservés. Les six combinaisons de menus et le rejet d’un rapport invalide sont vérifiés avec un DOM simulé, sans rendu navigateur.
- Aucun nouveau feed, broker, Paper Bot, Shadow, payout, ordre, achat ou automation. Les comptes membres et les deux tâches MNQ restent inchangés.

Version publiée : `39ad4af11b30b8753ede215cb2de497e62c26f4a` ; arbre `29d7208a6f6f66fb9389a8b809875d36753bfab7`.
[Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34307965362) et [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34307965357) réussis pour ce commit. Déploiement de production Cloudflare `b08d39e9-6cc5-48ad-9c2d-e250d2d10962` réussi pour ce même commit le 9 septembre 2026. [Ouvrir le Jeu 15](https://trading.nykuto.com/lab/#lucidGame).


## Jeu 16 — stop structurel et marge nette

Le diagnostic du Jeu 15 montrait des coûts absorbant presque tout le gain et de nombreux signaux refusés pour risque. Cette livraison teste une seule hypothèse supplémentaire : stop un tick derrière le dernier pivot 5 min confirmé et encore intact, avec refus si le gain visé après coûts est inférieur à la perte prévue après coûts. Les signaux Pullback, le contexte 30 min, les budgets, la quantité et les freins restent identiques.

- Protocole, moteur et 18 dépendances figés avant calcul (commit local `61f7314`, empreintes dans `jeu16-freeze.json`). Aucune optimisation après résultat.
- Référence reproduite : 63 trades, +14 $ ; coûts doublés : 57 trades, −178 $.
- Nouvelle variante : 91 trades, −279,50 $ ; coûts doublés : 71 trades, −455 $. Elle n’est pas retenue comme amélioration.
- Même historique déjà examiné : 330 séances ; cinq fenêtres complètes et trois incomplètes conservées. Aucune évaluation n’atteint l’objectif, aucun breach observé pour ces deux configurations. Ce n’est pas une confirmation indépendante.
- Nouveau bilan au Lab avec comparaison, brut/coûts/net, PF en dollars et en R distincts, jours positifs/négatifs/sans trade, fréquence, refus et comptes simulés. Les 258 anciens IDs sont préservés.
- Rapport et replays privés archivés sous `jeu16/structural-v1/` et relus exactement. Aucun cours brut ni trade individuel ajouté à Git.
- 116 tests de trading, build, hygiène sans anomalie, 25 Functions, syntaxe et références validés. Audit : 437 préfixes de signaux, 437 de pivots, 828 de comptes, 456 trades dont 196 reproductions de référence.
- Les quatre choix de menus et le rejet d’un rapport altéré sont contrôlés avec un DOM simulé. Aucun rendu visuel dans un navigateur, broker ou compte membre testé.
- Aucun achat, flux actuel, Paper Bot, Shadow, ordre, compte membre ou automation modifié/activé. Les deux tâches MNQ et les anciens résultats restent inchangés.

Version publiée : `b6a15a0b01c4a17704187d6a32c403ec913ed04d` ; arbre `2a49d7609668d7954e8e67615c18b0ec62ff0687`.
[Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34310475113) et [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34310475223) réussis pour ce commit. Déploiement de production Cloudflare `6ab6dd7e-1d8f-4633-9ec5-1713bff9ee20` réussi le 9 septembre 2026 pour ce même commit exact.
[Ouvrir le Jeu 16](https://trading.nykuto.com/lab/#structuralGame).


## Jeux 17–18 — isoler les effets du stop, des coûts et du filtre VWAP

Le Jeu 16 mélangeait le changement de stop et l'exigence de marge nette. Le Jeu 17 sépare ces deux effets dans une comparaison 2 × 2, puis le Jeu 18 teste une seule condition d'entrée VWAP sur la référence ATR avec marge nette. Les budgets, la quantité de 1 MNQ et les freins restent figés.

### Jeu 17 : stop × marge nette

| Configuration | Trades / net, coûts normaux | Trades / net, coûts doublés |
| --- | --- | --- |
| ATR | 63 / +14 $ | 57 / −178 $ |
| ATR + marge nette | 63 / +14 $ | 52 / −137,50 $ |
| Pivot | 92 / −296 $ | 77 / −517,50 $ |
| Pivot + marge nette | 91 / −279,50 $ | 71 / −455 $ |

Le stop pivot dégrade les résultats. La marge nette améliore certains totaux mais aucune configuration ne passe tous les critères fixés. Protocole et 20 dépendances conservés dans `jeu17-freeze.json`, gel local `644d346` avant calcul.

### Jeu 18 : une seule condition VWAP

- VWAP de séance cash, ancrée à 09:30 New York, approximée par HLC3 × volume des bougies 5 min terminées. Achat au-dessus, vente en dessous ; égalité ou contexte incomplet refusé. Les contextes sont réinitialisés par séance et contrat, sans bougie future.
- 1 544 signaux bruts, 147 filtrés, mais **aucun trade exécuté ne change** : 63 trades / +14 $ avec coûts normaux ; 52 trades / −137,50 $ avec coûts doublés, identiques à ATR + marge nette.
- Le filtre n'est pas retenu comme amélioration. Les cinq critères en échec restent visibles ; aucune pente, bande ou ancre alternative essayée après ce résultat.
- Même historique déjà examiné : 330 séances, cinq fenêtres complètes de deux mois et trois bloquées. Aucune fenêtre n'atteint l'objectif ; aucun franchissement du seuil de perte simulé. Ces observations ne constituent pas une confirmation indépendante.
- Gel local `2fdd9e4` avant calcul, 22 dépendances dans `jeu18-freeze.json`. Audit : 437 préfixes de signaux, 437 contextes VWAP, 828 préfixes de comptes ; 12 paires d'exécution comparées exactement.
- Le Lab ouvre le Jeu 18 et conserve le Jeu 17 ainsi que tous les jeux précédents. Les deux choix de coûts et le rejet d'un rapport altéré sont contrôlés avec un DOM simulé ; les 305 anciens identifiants sont préservés parmi 322.

### Validation et publication autorisée

- 133 tests de trading réussis, build réussi, hygiène sans anomalie, 25 Functions valides ; références locales et gels des Jeux 16–18 vérifiés.
- Archives privées des rapports, replays et manifestes sous `jeu17/ablation-v1/` et `jeu18/vwap-v1/`, écrites puis relues à l'identique. Seuls le code, les protocoles et les statistiques agrégées sont publiés ; les prix bruts, trades individuels et contextes par signal restent privés.
- Le propriétaire a explicitement autorisé cette publication publique le 9 septembre 2026, après le blocage initial. Les protocoles gelés et manifestes gardent leur statut historique antérieur à l'accord.
- Le transport Git local étant dépourvu d'authentification, les cinq commits ont été publiés via l'API GitHub connectée. Chaque arbre est vérifié identique à l'arbre local correspondant ; les messages conservent le SHA et la date du commit local original. Les gels restent des gels locaux antérieurs aux calculs, distincts de leur publication.
- Aucun rendu navigateur, broker ou compte membre testé. Paper Bot, Shadow et ordres restent désactivés ; comptes membres, protections, anciennes archives et tâches MNQ restent inchangés. Aucune fusion dans `main`.

Version publiée : `6a838774247e9a11570509b35835be70b6b0901d` ; arbre `78f71ce9906920935b416c6ac9366b7782f4143e`.
[Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34314668235) et [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34314668283) réussis pour ce commit.
Déploiement de production Cloudflare `e332f33d-b421-4233-b879-747895c3291a` réussi le 9 septembre 2026 à 05:24:04 UTC pour ce même commit exact ; version canonique confirmée sur `trading.nykuto.com`.
[Ouvrir le Jeu 18](https://trading.nykuto.com/lab/#vwapGame) · [Ouvrir le Jeu 17](https://trading.nykuto.com/lab/#ablationGame).


## Games 19–20 — micro-futures comparison and rejected MYM holdout

The owner requested continued bot research, including the gold and index microcontracts used by their associates. This release compares MNQ, MES, MYM and MGC with contract-specific tick values, costs and one-contract risk, then fixes an identified MYM data-preparation defect. It preserves every result. No candidate is confirmed and Paper Bot, Shadow and broker execution remain disabled.

### Game 19: eight predeclared comparisons

Pullback and Cross on 5-minute signals with a 30-minute trend were tested on each market. January–April is development; May–August was reserved. Every candidate fails at least the completeness gate, so no candidate is selected and Game 19 does not evaluate holdout performance.

| Market | Pullback trades / net USD | Cross trades / net USD |
| --- | ---: | ---: |
| MNQ | 5 / +171.50 | 0 / 0 |
| MES | 51 / −408.75 | 11 / −10.00 |
| MYM | 69 / +251.00 | 14 / +49.50 |
| MGC | 0 / 0 | 0 / 0 |

These are development diagnostics at the normal cost assumption, not qualified alternatives or a simulated portfolio. Both cost scenarios and all failed gates are retained in the public aggregate report.

### Game 20: native timeframe preparation

The nine missing MYM development sessions had market prices; their eligibility was blocked by a preparation rule requiring complete 5-minute sub-bars throughout the 30-minute warmup. The new frozen experiment prepares the two timeframes independently. Native 30-minute OHLCV reconciles against available 5-minute observations across all 3,202 intervals, with zero divergence and no fabricated candles. Coverage becomes 166/166 sessions. This affects indicator context and trades without changing EMA/ADX/ATR, stop, target, costs, quantity or acceptance thresholds.

| Period | Normal trades / net USD | Doubled-cost trades / net USD |
| --- | ---: | ---: |
| Development, January–April | 75 / +364.50 | 44 / +238.00 |
| Reserved, May–August | 91 / −424.50 | 57 / −340.50 |

Development passes all eight research gates and its selection was pinned before opening the reserve. The reserved period fails four gates: positive windows, PF, drawdown and cost stress. Reserved PF in R is 0.745497 and maximum drawdown is 21.663538 R / USD 688. May–June gains USD 134; July–August loses USD 558.50 at normal costs. The candidate is rejected without another selection or retuning on the reserve. Nine configurations were evaluated across these two games; they are not nine independent confirmations. These dates share a provider and events correlated with previously examined markets, so even the reserved MYM result is not prospective confirmation.

The Lab opens Game 20 at [nativeGame](https://trading.nykuto.com/lab/#nativeGame); [multiGame](https://trading.nykuto.com/lab/#multiGame) retains all eight Game 19 comparisons. All 322 prior HTML IDs and experiment views remain accessible. The existing compact typography is retained.

### Reproducibility and private records

Protocols and dependency manifests were frozen locally before their respective performance calculations; the positive development report and selection were committed before the reserved calculation. GitHub API publication preserved each local file tree exactly, in order, with original local commit and timestamp in commit messages:

| Original local commit | Published commit |
| --- | --- |
| `9f3b33cc0885a38332569b847ce8bf6cb59f23c5` | `f961c2dc4f878da32bcf5227650eca1063dbfbec` |
| `84b27975988c582826ae5821a3b0128b9e8863f5` | `38dfea8a6439a3b79a257256ebe55a9e10afba16` |
| `b74f3145e4fb53a8b6420929806abe902cd99bd1` | `a99cada3ade14b6ec9fc9c36d4f5380e780d23f4` |
| `8771b65b055bfc5bf2561978695afff6abef6f47` | `93ebc8e023fe574b193f3f13fe0e5b6766c6a2c7` |
| `b004abc3ca22137340a4342862dfde54ca3eccc8` | `f286b19473acf98b5915f37a23b0046db0d3a672` |

Game 20 selection SHA-256: `5af8cf71162a66e4cf7490de53ffbcc09056f94e71706faae88fe2c66d10c96a`. Both frozen dependency inventories, source manifests, public reports and their integrity checks are included.

Licensed observations and individual trades are archived only in private TRADING_DATASETS. All 26 fragments and both restoration manifests were written and read back identically. `JEU19_20_ARCHIVE.md` documents original hashes and reconstruction; the reused MNQ reference stays in its existing private Game 14 archive. Git contains aggregate reports only.

### Validation and deployment

- 143 software tests pass, including contract arithmetic, native/aggregated data agreement, gap handling, causal prefix checks, all report fingerprints and both UI cost views.
- Build succeeds; hygiene reports zero critical issues and zero warnings; all 25 functions validate; diff checks are clean.
- Existing 322 HTML IDs are preserved among 343 unique IDs; local links resolve. No browser, live broker, member account or live-feed execution was tested.
- Exact published head: `f286b19473acf98b5915f37a23b0046db0d3a672`.
- [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34318511281) and [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34318511293) both succeed for that head.
- Cloudflare deployment `1466ae31-6301-4606-ab66-9ca1cd8a4715` succeeds for the same head and is aliased to [trading.nykuto.com](https://trading.nykuto.com).

A weekly research continuation was created for Monday mornings in America/Asuncion, beginning 14 September. Each occurrence permits at most one new justified, frozen hypothesis, preserves failures, avoids identical reruns, and requires unseen observations for new confirmation. Existing MNQ prospective collection/testing tasks remain unchanged. Successful software checks do not imply a profitable trading system.


## Games 21–22 — immediate continuation, eight further trials

Diego requested continued improvements immediately. Two new experiments were implemented and frozen before performance calculations. All eight outcomes are preserved, including small positive totals that do not satisfy the acceptance gates. No candidate is selected and neither game calculates reserved-period performance.

### Game 21 — complete the native preparation comparison

The Game 20 correction is extended to MES and MGC, with both prior signal families. Native 30-minute OHLCV reconciles with available 5-minute observations on 6,486 intervals without divergence. January–August coverage improves from 144 to 162 of 166 sessions for MES, and from 96 to 145 for MGC. Remaining gaps still block qualification.

| Development configuration | Normal trades / net USD | Doubled-cost trades / net USD |
| --- | ---: | ---: |
| MES Pullback | 55 / −385.00 | 7 / −50.00 |
| MES Cross | 11 / −10.00 | 1 / +7.50 |
| MGC Pullback | 0 / 0 | 0 / 0 |
| MGC Cross | 0 / 0 | 0 / 0 |

The MGC zero-trade outcomes reflect risk refusals, not stability or profitability. Prices and stops are not changed to make entries fit.

### Game 22 — a different entry and invalidation rule

The new family uses the first 30 minutes' high/low, a subsequent closed breakout and a distinct closed retest within 30 minutes. Entry is at the next opening price by noon New York, with a stop one tick beyond the retest wick, a tick-rounded 1.5R target and the existing net-reward/risk gate. Only one signal per direction per session is allowed, even if execution is refused. No overnight indicator preparation or future retest information is used.

| Development market | Trades | Net USD | Doubled-cost net USD |
| --- | ---: | ---: | ---: |
| MNQ | 9 | +145.50 | +29.00 |
| MES | 14 | +138.75 | 0 |
| MYM | 30 | −173.00 | −117.00 |
| MGC | 2 | −51.00 | 0 |

All four fail selection. The positive MNQ/MES totals have insufficient samples; coverage and other failed gates remain explicit. No reserve is opened to look for a more favorable result. An additional targeted Massive read still returns no MESH6 bars for March 6, 10:05–10:55 New York. The available calendars do not fully establish the interruption, so missing observations are not treated as a proven market closure or fabricated.

The official Lucid product/commission list was checked: MNQ, MES, MYM and MGC are listed; the smaller CME 1OZ gold contract is not currently listed. The conservative USD 2.50 round-trip commission assumption plus tick friction is preserved and explicitly distinguished from the listed per-side commission rates.

### UI, audit and private data

The Lab now opens [Game 22](https://trading.nykuto.com/lab/#openingGame). [Game 21](https://trading.nykuto.com/lab/#expandedGame) and prior Game 20 remain in disclosures. All 343 previous HTML IDs remain among 363 unique IDs, with local links verified and compact typography retained. Both cost views show all configurations, daily counts, refusals, failed gates and window/account completeness.

`research-ledger.json` records all 17 configurations from Games 19–22 to prevent treating an identical replay as a new research attempt. Earlier studies remain in their own reports. No independent confirmation, Paper Bot, Shadow or live execution is enabled.

Game 21 audited 426 signal prefixes, 156 account prefixes and 178 trades. Game 22 audited 37,362 signal prefixes, 320 account prefixes and 200 trades. These counts include replays, not independent observations. All 17 private archive fragments and both restoration manifests were written and read back identically in TRADING_DATASETS; Game 22 references its existing licensed source archives. Public Git contains only code, hashes, protocols and aggregate results.

Local frozen commits and result commits were published in the same order, with identical file-tree hashes and the original local SHA/date retained in each GitHub commit message:

| Original local commit | Published commit |
| --- | --- |
| `e5c8f407c08992b04dedeb72d328717b6598f9f4` | `b92eeb54541e9a3d8641f09111d9c7fecf640f7b` |
| `2c1f3e215906092bb617a8e55959a09172f066ce` | `251b0818b1d223f222965def4c82a9fd11ad4228` |
| `bb1bdc1d0f03b5c9a314a421e6ad4f2f7d5958e7` | `53ce4841bc2c97e03c5460ab70427ffb3be1f2ba` |
| `070c86d006a960c5e5fb53d23e72043cfa1e9572` | `7687e76d2f8d7f58ce162da20ce3365ab449598d` |
| `8b853291731dab6fde7016b7a3b14daad3b9e63e` | `37fed24279e98298f54a653c063a04a27f5eb835` |

### Verification and continuation

154 software tests pass. Build succeeds; hygiene has zero critical findings and zero warnings; all 25 Pages Functions validate. No browser, live feed, broker or actual member-account execution was tested.

Both [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34340779996) and [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34340779074) succeed for `37fed24279e98298f54a653c063a04a27f5eb835`. Cloudflare deployment `5d561b82-cd69-4b89-9cce-9acfd7bdb66d` succeeds for that exact head and is aliased to [trading.nykuto.com](https://trading.nykuto.com).

The existing research continuation was brought forward to daily mornings, starting September 9 in America/Asuncion, with the latest results and ledger in its prompt. Each occurrence remains bounded to one distinct frozen hypothesis, preserves failures and requires genuinely unseen observations for confirmation. Existing prospective MNQ collection/testing tasks are unchanged. Passing software tests does not imply a profitable trading system.

## Jeu 23 — admission et plafonds de risque autorisés (9 septembre 2026)

Le premier signal du Jeu 22 consommait une occasion quotidienne même quand l’entrée était refusée. Le Jeu 23 attend désormais un nouveau retour admissible, avec une seule entrée exécutée par sens et par séance. Diego a aussi autorisé avant le gel la révision des plafonds internes de risque : 50, 75, 100 et 150 USD, frais compris, limite quotidienne égale au double. Quantité inchangée : un microcontrat.

Les 16 configurations ont été déclarées avant performances. Toutes sont conservées et aucune n’est sélectionnée. Développement janvier–avril 2026 ; aucune ouverture de mai–août pour ce jeu. Les dates déjà vues restent rétrospectives.

| Marché | Net à 50 $ | Net à 75 $ | Net à 100 $ | Net à 150 $ |
| --- | ---: | ---: | ---: | ---: |
| MNQ | +180 | +193,50 | +672 | +887,50 |
| MES | +92,50 | −86,25 | −68,75 | −206,25 |
| MYM | −288 | −234 | −288,50 | −288,50 |
| MGC | +32,50 | −304,50 | −171,50 | −370 |

Le plus grand total MNQ repose sur 36 trades, sous les 40 requis, avec une séance incomplète. Stress +714 USD, drawdown réalisé 369 USD ; 20 jours positifs, 16 négatifs et 45 sans trade. Aucun critère abaissé et aucune promesse de rentabilité. Les écarts sont rapprochés des trades du Jeu 22 déjà archivés, sans resimuler son témoin, puis du nouveau profil 50 USD.

- Gel : `75909f9fc39b9d4b58e6628695ca0a5b2f4fa2388c78782481879cedb37b59f5`, 59 dépendances. Commit local antérieur aux performances `b98e2d27feb48afe1ae4cfb0aed34aff8873afee`, publié avec arbre identique en `976a40f8636d57ba01a78671f3e40d315d3f812c`.
- Sélection nulle : `baa404fdf22b45dce510c6a2a9269c81080e609b06e91567e1900a84cbed6e58`.
- Archive privée `jeu23/admission-risk-v1/manifest.json` : trois fichiers, cinq parties et manifeste relus et vérifiés. Sources Jeux 19/14 et témoin Jeu 22 référencés. Aucun prix ou trade individuel publié.
- Audit : 37 362 préfixes de signaux, 479 premiers signaux comparés, 1 280 préfixes de compte, 128 comparaisons au témoin archivé et 96 au nouveau profil 50 USD.
- 166 tests logiciels réussis ; compilation, hygiène et 25 fonctions Pages validées. Les 363 anciens IDs HTML sont conservés parmi 376 IDs uniques. Pas de test dans le navigateur.
- Registre : 33 configurations Jeux 19–23 ; zéro confirmation indépendante. Paper, Shadow, broker et flux réel restent désactivés.
- Les deux workflows incluent maintenant explicitement `feat/trading-hq-v1` dans leur déclenchement push, pour vérifier chaque publication sur la branche utilisée par Cloudflare.

[Lab Jeu 23](https://trading.nykuto.com/lab/#admissionGame). Protocoles, bilans, coûts doublés et détail des journées restent consultables.

Vérification de la publication finale `686e1fe6ae7864de50eb3d8db27173a7a95c69e8` :
[Website CI réussie](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34347874002) et [Repository hygiene réussie](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34347874043), toutes deux déclenchées par push sur ce commit exact. Les étapes de tests, validation Functions et build ont réussi.

Cloudflare `trading-nykuto` : déploiement `20e40391-777e-4624-ac5b-1869d759db00`, toutes les étapes réussies, commit exact ci-dessus et alias `https://trading.nykuto.com`. Le déploiement a été relancé explicitement car le filtre de chemins `trading/*` écartait le commit modifiant uniquement les workflows. Aucune modification de main et aucune fusion de PR.


## Jeu 24 — contexte combiné (9 septembre 2026)

Diego demande de réunir les analyses avant l’entrée. Le Jeu 24 ajoute un filtre obligatoire de tendance EMA/VWAP, structure à pivots confirmés, RSI, volume au même créneau sur cinq séances antérieures et figure de bougie. Englobante, marteau et corps dominant sont des alternatives directionnelles. Les observations sont causales ; préparation remise à zéro aux lacunes et changements de contrat. Les quatre marchés × quatre plafonds du Jeu 23 sont conservés, un microcontrat, mêmes frais et coûts doublés.

Une hypothèse, 16 configurations préenregistrées et toutes rejetées : seuls 6 des 209 signaux de retour passent les cinq familles, puis 0–2 trades par configuration. MNQ : aucun trade. MES : +41,25 USD au plafond 50, −22,50 aux autres (stress 0 / −68,75). MYM : +44,50 USD sur un seul trade, stress +41. MGC : 0 / 0 / +118,50 / +10 USD, stress 0 / 0 / +114 / +1. Ces faibles échantillons ne qualifient aucun profil. Sélection nulle ; mai–août non calculé ; aucune confirmation indépendante.

Le Lab affiche le Jeu 24, les comparaisons au Jeu 23 archivé à risque/coût identiques, l’entonnoir de signaux, les échecs et les comptes incomplets. Les 376 anciens IDs sont préservés (391 au total). Le registre conserve 49 configurations des Jeux 19–24. Code gelé inchangé après calcul. Données, transactions et contextes individuels privés : `jeu24/combined-context-v1/manifest.json`, quatre fichiers/parties et manifeste relus après écriture, tailles et SHA-256 conservés. Sources Jeux 19/14 et témoin Jeu 23 référencés sans duplication ni recalcul du témoin.

Gel : `6f762afc85b4ef830449ad5481963f6c4171e35da42494bd422fcdfc30cb453c` (67 dépendances). Sélection nulle : `5ee938db6c4401297a03037ec79848b3363240c2de5105b0f476b2e14bb43808`.

Validation locale : 174 tests logiciels, hygiène, 25 modules Cloudflare, build ; HTML équilibré, IDs et références vérifiés. Aucun navigateur, ordre, activation Paper/Shadow/réelle, changement des collectes ou fusion dans main. Le risque gradué demandé ensuite est seulement documenté comme prochaine piste, non testé ici.


Vérification finale Jeu 24 : commit publié `98397c2071de35fe0479bb4739eaabb35bc17317`, arbre identique à la version locale vérifiée. [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34351997978) et [Repository hygiene](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34351998005) réussies sur ce commit ; les deux contrôles PR sont aussi verts. Déploiement Cloudflare `63db6d1d-4b18-4495-a9ef-513ff2b208b0` terminé avec toutes les étapes réussies à 12:37:09 UTC le 9 septembre 2026, même commit, alias `https://trading.nykuto.com`. [Bilan du Lab](https://trading.nykuto.com/lab/#combinedGame).


## Jeu 25 — risque gradué, 9 septembre 2026

Quatre nouveaux profils : 50 $ si contexte faible/incomplet, 75 $ pour 3–4 familles, 150 $ pour 5 ; un microcontrat, stops inchangés, limite quotidienne fixe 300 $. Témoins Jeux 23/24 lus en archive, sans nouveau calcul. Résultats janvier–avril : MNQ +98,50 $/16 trades (stress +71,50), MES −70/20 (−8,75), MYM −303/36 (−369,50), MGC +137/10 (+131). Tous rejetés ; réserve fermée. Registre : 53 configurations. Le Lab explique les +44,50 $ répétés du Jeu 24 : un même trade historique comparé quatre fois. 391 IDs préservés, 403 au total.

74 dépendances gelées avant performance ; 181 tests logiciels, hygiène, Functions et build réussis. Archive privée `jeu25/graded-risk-v1/manifest.json` : quatre fichiers et manifeste relus/vérifiés. [Protocole et bilan](https://trading.nykuto.com/lab/JEU25_RESULTS.md). Aucun navigateur, ordre, Paper/Shadow, collecte modifiée ou merge main.

Commit exact `612bbdc1a76ec90fe313a9d7871664ab19f0eb8f` : [Website CI](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34354120044) et [hygiène](https://github.com/drsoliveirasantos-lab/Nykuto/actions/runs/34354120026) vertes (push et PR). Cloudflare `9e1f76f9-0188-4ef1-bb08-6bcb01c3cb15`, toutes étapes réussies, même commit et alias trading.nykuto.com, 12:58:29 UTC.

