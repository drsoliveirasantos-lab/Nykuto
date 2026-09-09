# Site architecture — Nykuto

## Current production model

Nykuto is a static multi-page website deployed through Cloudflare Pages.

Two Cloudflare Pages projects consume the same `main` branch:

- `nykuto` publishes the complete commercial site on `nykuto.com`;
- `nykuto-demo` publishes the autonomous Nykuto Local experience at the root of
  `cde.nykuto.com` by copying `demo-imobiliaria.html` to `index.html` during
  its build. Its production build command is
  `cp demo-imobiliaria.html index.html`, with `/` as the output directory.

Both projects stay connected to the GitHub repository, so a production update
on `main` triggers their deployments independently.

The authoritative production sources are:

```txt
index.html                     Homepage
offres.html                    Nykuto Digital
international.html             Nykuto Business International
exemples.html                  Illustrative scenarios
demo-imobiliaria.html          Autonomous Nykuto Local homepage
imoveis/index.html             Complete searchable property catalogue
mapa/index.html                Map-focused property search
favoritos/index.html           Device-local saved-property selection
anunciar/index.html            Autonomous listing/request publication journey
anunciar/anunciar.js           Direct form, carpool flow, images and API publication
anunciar/openfreemap-basemap.js  Vector publisher map with raster fallback
anuncio/index.html             Public local-listing detail shell
anuncio/anuncio.js             Gallery, zone/route map, WhatsApp and reporting
conta/index.html               Lightweight publisher profile and listing controls
conta/conta.js                 Online profile/session and own-listing management
regras/index.html              Community, safety and import rules
gestor/login/index.html        Private manager sign-in
gestor/index.html              Authenticated manager dashboard
gestor/imoveis/                Persistent listing management
gestor/imoveis/novo/           Guided test-draft creation
gestor/conta/                  Professional WhatsApp profile, pass and account status
functions/                     Cloudflare Pages authentication and APIs
migrations/                    D1 schema for accounts, passes, sessions and listings
process.html                   Method
a-propos.html                  Founder and company
faq.html                       FAQ
contact.html                   Mailto contact journey
mentions-legales.html          Legal notice
confidentialite.html           Privacy policy
cgv.html                       B2B terms
ellen-studio/index.html        Ellen Studio concise preview homepage
ellen-studio/nails/            Proposed nail services
ellen-studio/cilios/           Proposed eyelash services
ellen-studio/sobrancelhas/     Proposed eyebrow services
ellen-studio/sobre/            Preview identity and limitations
ellen-studio/agenda/           Temporary care cart and WhatsApp appointment enquiry
ellen-studio/ellen-cart-model.mjs  Care IDs, reference prices and enquiry construction
ellen-studio/ellen-cart.mjs    Cart controls and temporary draft handoff
styles.css                     Shared design system
demo-imobiliaria.css           Real-estate demo interface styles
i18n.js                        FR/EN/PT/ES translations and language state
script.js                      Shared interactions
demo-imobiliaria.js            Static demo inventory, filters, map and dialogs
demo-build-stamp.js             Visible demo release marker
nykuto-local.js                Live local catalogue, filters and request routing
assets/                        Production images
assets/demo-imobiliaria/       Optimised, neutralised real-estate demo media
assets/nykuto-emblem.webp      Production brand emblem
assets/nykuto-emblem-favicon.png  Browser icon
imovel/*/index.html             Share pages with property-specific metadata
favicon.svg                    Legacy fallback icon
robots.txt / sitemap.xml       Search discovery
_headers                       Cloudflare response headers
scripts/prepare-cloudflare-output.js
```

## Generated outputs

The private `trading/` site is a separate Cloudflare Pages project,
`trading-nykuto`, publishing that directory directly from `feat/trading-hq-v1`
during owner validation. It is not part of the main commercial build outputs.
Its `/lab/` includes an independent-validation module, with pure CSV parsing,
indicators and browser simulation modules. The default Jeu 04 snapshot loads
from `trading/functions/api/lab/jeu04.js`, backed by the private
`TRADING_DATASETS` KV binding. Cloudflare Access protects the site and the
endpoint also verifies the JWT signature, issuer, audience and expiry. Raw
market data is provisioned only in KV, never Git. Optional imported histories
remain in the tab. See `trading/lab/INDEPENDENT_VALIDATION.md` for the frozen
protocol and snapshot identity. `npm run test:trading-validation` covers both
the engine and private data-loading checks.

Jeu 05 adds `session-comparison.mjs`, `session-source.mjs` and `lab-session.mjs`.
It tests one frozen session-close policy, keeping the Jeu 04 engine's default
behavior intact. `trading/functions/api/lab/jeu05.js` reuses the same Access
verification and private KV binding to serve a checksum-pinned 2025 snapshot
with exchange calendars. The 2026 comparison is explicitly exploratory;
only the new 2025 windows determine the research verdict. No market history
is committed to Git. See `trading/lab/SESSION_COMPARISON.md`.

Jeu 06 compares SPY, MES and MNQ over frozen July–December 2025 windows using
`market-comparison.mjs` and private `/api/lab/jeu06`. See
`trading/lab/MARKET_COMPARISON.md` and `trading/lab/JEU06_AUDIT.md`.

Jeu 07 uses `mnq-confirmation.mjs`, `mnq-source.mjs`, `lab-mnq.mjs` and protected
`/api/lab/jeu07`. Its October–November 2024 MNQZ4 snapshot has complete cash
prices but lacks complete verified futures schedules. The v2 snapshot adds only
the November 29 holiday interval from Ironbeam's November 26, 2024 publication
(1/59 covered sessions, 58 still missing), with explicit provenance. It displays the missing coverage
and refuses performance calculation. The incomplete snapshot stays in private
KV; no licensed prices enter Git. See `trading/lab/MNQ_CONFIRMATION.md` for the
frozen protocol, sample-size limits, availability evidence and repair boundary.

At the owner’s request, Jeu 07 now offers a replacement July 1–24, 2026
MNQU6 diagnostic through `mnq-retest.mjs`, `retest-source.mjs` and private
`/api/lab/jeu07b`. The old snapshot and default engine policy are preserved.
The validator/simulator accepts the fixed replacement policy; 28 sessions and
728 candles pass, but this short test cannot satisfy three complete two-month
confirmation windows. See `trading/lab/MNQ_RETEST.md`.

Jeu 09 adds `mnq-six-months-policy.mjs`, `mnq-six-months.mjs`,
`six-months-source.mjs`, `lab-six-months.mjs` and private `/api/lab/jeu09`.
It evaluates January–February, April–May and July–August 2026 on three separately
prepared MNQ contracts, using the unchanged market simulator. An initial
January–June attempt remains unscored because March 6 prices are missing;
the replacement windows were fixed before performance calculation. Exact
calendar support and the Christmas early close extend the confirmation data
validator without changing its existing default 2024 behavior. Source bytes
are pinned and private; the browser recalculates on load and on request.
This is retrospective, nonconsecutive and overlaps previously seen markets;
it cannot satisfy independent confirmation or activate a bot. See
`trading/lab/MNQ_SIX_MONTHS.md` for dates, the failed availability attempt,
results and audit. Game 08 and account isolation remain intact.

Jeu 10 adds `confluence-policy.mjs`, `confluence-engine.mjs` and
`lab-confluence.mjs`, reusing the private pinned Jeu 09 history and its endpoint.
Eight fixed exploratory variants compare hourly trend, engulfing bodies,
same-slot relative volume, three official macro-event categories, their joint
filter, long-only and short-only with the original baseline. A signal-filter
hook in `simulateMarket` preserves default results and fully resimulates daily
brakes for every variant/cost. Hourly candles must be closed; volume references
only five prior sessions. The UI provides per-period, per-direction and causal
signal explanations, with all failed gates and event coverage limitations.
This is already-seen history, not independent evidence or a live news service.
See `trading/lab/CONFLUENCE_DIAGNOSTIC.md` for the frozen rules and full results.
A separate one-time follow-up is scheduled for December 3 after the existing
collection ends. It audits the archive before comparing the same eight rules
on October–November, preserves Jeu 08 and stops with a precise report if data
or access is incomplete. This does not imply continuous optimization or trading.

The Dashboard includes `trading/performance/`: an account-only monthly R calendar,
curve and daily trade table with mode/timezone filters. Its pure metrics never
invent cash balances or convert historical R using current risk settings. New
journal entries retain a closing timestamp and explicit mode; Replay uses its
historical time. Existing records remain intact with visible legacy-date and
unknown-mode treatment. It reuses account-scoped D1 state without new APIs or
broker credentials. See `trading/performance/README.md` for exact definitions.

The ergonomics audit in `trading/UX_AUDIT.md` records the shared mobile menu,
calendar/list views, account-scoped calendar colors, journal feedback and
cash-risk validation. `trading/performance/appearance-core.mjs` restricts the
new appearance state to three hex colors; the existing member/revision gate
remains authoritative. `trading/risk-core.mjs` only sizes euro cash units.

`trading/analysis/` adds a native MNQ candle chart beside an explainable reading.
The selected 20–500 closed candles determine both the chart and every measure;
confirmed swing structure, potential MSS/BOS, EMA9/21 and candle bodies never use
unselected future context. Three contract histories reuse the existing verified,
private Jeu 09 source. Optional hourly bars require four complete cash candles.
This is descriptive historical analysis with no order or news path. The common
navigation and Dashboard link to it; TradingView remains a separate widget. See
`trading/analysis/README.md` for exact definitions and validation boundaries.

`trading/discipline/` hosts the drawdown scenario and emotional self-report,
with an optional pause and post-trade journal linkage. Pure rules are in
`discipline-core.mjs`. Records use account-scoped D1 persistence with device sync. There is no broker endpoint
or server emotional profiling. Shared navigation exposes this page;
the Journal shows linked before/after emotion. See `trading/README.md`.

Jeu 08 adds `prospective-collection.mjs`, `lab-collection.mjs` and private
GET-only `/api/lab/jeu08`. It archives future MNQZ6 sessions (September 9–30,
2026 preparation, October–November first test window) using existing Massive
and Cloudflare connections. The endpoint recomputes coverage from private KV;
it exposes neither raw prices nor a write interface. A bounded scheduled task
uses `scripts/collect-trading-session.mjs` to normalize captures and retain
private hashed revisions. There is no performance calculation or bot activation.
See `trading/lab/PROSPECTIVE_COLLECTION.md` for the fixed calendar, protocol,
collection procedure, data boundaries and limitations.

The Lab interface separates `Suivi actuel`, `Tests précédents` and `Test manuel`
with accessible tabs in `lab-workspace.mjs` and scoped `lab-workspace.css`.
Jeu 22 opens as the default follow-up, comparing four opening-range retest experiments. Jeux 21 and 20 remain in disclosures; Jeu 20 compares MYM development with the
reserved months after separately verified 5- and 30-minute preparation.
Jeu 19 preserves eight micro-futures comparisons; Jeu 18 remains in a disclosure
with one frozen cash-session
VWAP entry filter. Jeu 17 remains in a disclosure with its 2 × 2 stop/margin comparison.
The owner explicitly authorized publication of the code and aggregate results for
Jeux 17–18 on September 9, 2026, resolving the earlier publication hold. Raw market
data, individual trades and per-signal contexts remain in private storage.
PR #83 records the release and deployment verification.
Jeu 16 remains in a disclosure with its original structural-stop comparison.
Jeu 15 remains in a disclosure with its exploratory LucidFlex 25K risk replay.
Jeu 14 remains in a disclosure with the fixed Pullback tested across all currently
verifiable historical blocks (234 trades over 330 scored sessions).
Jeux 12–13 remain in a disclosure with 54 explicit timeframe/session/direction trials
and the selected Pullback's separate June 2025 control (positive but only eight
of twelve required trades). Jeu 11 remains available in a disclosure with its
separately scored April–May 2025 report.
Jeu 10 remains available in a disclosure with its 2026 exploratory comparison. Jeu 09 remains in a
disclosure with its original six-month MNQ retrospective result.
Jeu 08 retains its collection state, next action and three-step calendar in
a collapsible disclosure. Older games remain available in collapsed native details;
their IDs and deep links are preserved, and navigation reveals the matching tab
and disclosure. The manual strategy form is isolated visually and does not
modify the frozen Jeu 08 protocol. No trading engine, data or automation changes
are part of this presentation layer.

Jeu 11 uses `jeu11-policy.mjs`, `jeu11-engine.mjs`, `jeu11-source.mjs` and
`lab-jeu11.mjs`. `scripts/prepare-trading-jeu11.mjs` validates private captures;
`scripts/run-trading-jeu11.mjs` checks the pinned snapshot, runs eight unchanged
variants with two cost assumptions, checks every feature prefix and compares
every completed-session simulation prefix. The aggregate-only
`jeu11-report.json` is an explicitly generated, reproducible research report,
not an alternative price source. Licensed prices, raw captures and their hashes
are archived privately under `jeu11/` in TRADING_DATASETS, with no new public
dataset route. See `trading/lab/JEU11_PROTOCOL.md` and `JEU11_RESULTS.md`.
No new strategy or paper execution adapter is enabled. Existing prospective
collection/test automations and their rules remain unchanged.

Jeux 12–13 use `jeu12-engine.mjs` for closed 5/15/30-minute signals and a shared
5-minute execution clock, with next-open entries, tick-rounded stops/targets,
cash-session boundaries, daily brakes and fully resimulated doubled costs.
`JEU12_PROTOCOL.md` freezes the first 27 EMA Cross trials; `JEU13_PROTOCOL.md`
freezes the subsequent 27 Pullback trials and selection rule. The second family
was formulated after the first failed; it is explicitly adaptive development.
`JEU13_AVAILABILITY.md` documents a pre-performance June 2025 rollover amendment.
Preparation/run scripts pin private snapshots, verify full coverage, compare
every reconstructed 15-minute OHLCV bar with the prior reference, and audit
signal/simulation prefixes. `lab-timeframes.mjs` renders aggregate-only
`jeu12-report.json` and `jeu13-report.json`, including losing trials and every
failed gate; UI filters never recompute or change the selected strategy.
Raw captures remain in private TRADING_DATASETS under `jeu12/` and `jeu13/`.
`TIMEFRAME_RESULTS.md` records results and reproducibility;
`PULLBACK_FORWARD_PROTOCOL.md` preserves a proposed future comparison whose
separate automation was disabled at the owner’s request; both earlier MNQ tasks
are unchanged. No broker or paper execution is enabled.

Jeu 14 adds `jeu14-policy.mjs`, `jeu14-history.mjs`, a pinned private source,
prepare/run scripts and `lab-history.mjs`. Its predeclared coverage policy forms
maximal consecutive complete-session blocks and requires 220 fresh 30-minute
warmup bars after any gap. Every expected day belongs exactly once to scored,
warmup or unavailable coverage. The unchanged Jeu 12 execution engine runs
only the selected Pullback; monthly/window/direction tables aggregate the same
trades. The separate 2025 confirmation fails consistency and full coverage;
weekly bootstrap intervals include zero. `JEU14_PROTOCOL.md`, `JEU14_RESULTS.md`
and aggregate-only `jeu14-report.json` document the methods and limitations.
Private captures remain under `jeu14/` in TRADING_DATASETS; no new API or bot.

Jeu 15 adds `jeu15-policy.mjs`, `jeu15-engine.mjs`, a private-output runner,
focused account-risk tests and `lab-lucid.mjs`. Three predeclared scenarios
compare the unchanged 30-minute candidate, its budget-limited version and one
new 5-minute pullback in a closed 30-minute trend. A simulated LucidFlex 25K
evaluation enforces the EOD trailing floor, open-loss checks, terminal breach,
profit target and strict consistency. Dollar budgets are internal research
guards, not broker settings. Five fully covered two-month windows are used;
three incomplete windows remain blocked. Existing source archives and reports
are preserved. `JEU15_PROTOCOL.md`, `JEU15_RESULTS.md` and aggregate-only
`jeu15-report.json` document failures, costs and daily results. The private
`jeu15/` archive contains the replay details. No account API, live feed, Paper
Trading, payout or order execution is added; readiness gates remain closed.

Jeu 16 adds an isolated extension of the frozen account replay, strict same-session
2-left/2-right pivots and a net target/stop margin check. It compares one new
structural-stop hypothesis to the unchanged protected 5-minute reference.
`JEU16_PROTOCOL.md`, `jeu16-freeze.json` and the local pre-result commit pin the
rules and 18 dependencies. Both cost assumptions and all complete windows are
reported, including the failed candidate; all earlier engines and results remain
unchanged. The new aggregate report is checked by SHA256 before display through
`lab-structural.mjs`; a malformed or unavailable report fails closed. The private
`jeu16/structural-v1/` archive contains full trades and account days. Tests cover
pivot confirmation/invalidation, cost and risk gates, replay causality, the
unchanged reference, report integrity and four menu selections with a simulated
DOM. This is not browser rendering QA or independent strategy confirmation.
`JEU16_RESULTS.md` records the exact negative result. No broker, live feed,
Paper/Shadow activation, account state or MNQ automation is modified.

Jeu 17 separates the two factors changed together in Jeu 16: ATR/pivot stop
and net-margin filter off/on. It adds only the two missing combinations, with
unchanged source data, signals, risk budgets and evaluation windows. The frozen
runner verifies the previous two cells against the Jeu 16 private archive,
audits chronological prefixes and publishes every result and four paired
policy contrasts. No strategy is automatically selected. `jeu17-freeze.json`
pins 20 dependencies; `JEU17_PROTOCOL.md` and `JEU17_RESULTS.md` record scope
and failure. `lab-ablation-report.mjs` verifies the aggregate report fingerprint
before displaying all eight selections (four policies × two costs). Full trades
remain private under `jeu17/ablation-v1/`; previous results, account state,
MNQ tasks and execution activation remain unchanged. No browser QA is implied.

Jeu 18 adds a causal HLC3/volume estimate anchored to 09:30 New York, using
integer tick-volume sums and rejecting incomplete sessions. One direction filter
is applied before the unchanged Jeu 17 ATR/margin replay; all entries and daily
brakes are resimulated. The reference reproduces its archived trades/days/statuses.
The added filter does not change any executed trade in this historical test and
is not adopted. `JEU18_PROTOCOL.md`, `jeu18-freeze.json` and `JEU18_RESULTS.md`
record the frozen scope, result and limits. `lab-vwap.mjs` verifies the aggregate
report before rendering the two cost views; raw signal contexts and trades
remain private under `jeu18/vwap-v1/`. No new data endpoint, activation, account
change or MNQ task change is made. Publication is authorized as described above.

Jeux 19–20 extend the research engine to contract-specific MNQ, MES, MYM and
MGC arithmetic without modifying earlier frozen engines. Jeu 19 declares eight
configurations and keeps the May–August reserve unopened when development
coverage fails. Jeu 20 tests one separate MYM preparation hypothesis using native
30-minute bars reconciled against available 5-minute OHLCV, with no invented bars.
All 166 sessions become eligible. Development passes all eight gates, but the
candidate pinned before reserve evaluation loses money in May–August and is
rejected. Both development and final reports, selection records, protocols and
freezes remain under `trading/lab/`; `lab-multimarket.mjs` loads fingerprint-pinned
aggregate reports and displays both costs, all attempted configurations and the
negative reserve result. Raw sources and execution details remain private. No
new endpoint, member access change, broker connection or bot activation is added.
The local DOM fixture covers both report views and rejection of a corrupted file;
no browser QA is performed. Research details are in `JEU19_RESULTS.md` and
`JEU20_RESULTS.md`.

`trading/account/` adds required first/last-name onboarding, personal settings and
feedback to the site owner. Cloudflare Access email PIN verifies identity;
Functions middleware additionally checks the private D1 membership registry and
profile completion. `TRADING_USERS` is a dedicated D1 database; schema migrations
are in `trading/migrations/`. No invite email or credential is committed.
Personal journal, preparation and settings queries always derive ownership from
the signed identity. Conditional revisions reject stale tab/device overwrites.
The browser keeps only document memory; an owner-only import can preserve the
previous device-local journal. Feedback is visible only to its author and the
owner, who can respond and update its status. Brokers remain unconnected.
See `trading/account/README.md` for provisioning and access tests.

`trading/alerts/` adds the private TradingView inbox and account setup guide.
`trading/functions/api/alerts/` reuses the signed Access verification. A separate
Worker in `workers/trading-alerts/` receives TradingView POSTs using a random
capability URL and the official source IP allowlist, without opening the private
site through Access. Its shared validation module is
`trading/alerts/alert-service.mjs`. Dedicated `TRADING_ALERTS` KV binds the Worker
and Pages; only a hash of the webhook token is provisioned as a Worker secret.
No secrets or actual alert data are committed. See `trading/alerts/README.md` for
deployment, data boundaries, test labeling and eventual-consistency limits.
This Worker is not part of the commercial static build and never sends orders.

`npm run build` creates three equivalent static outputs:

- `out/` — Cloudflare Pages production output;
- `dist/` — generic static output;
- `.vercel/output/static/` — compatibility output.

Never edit these folders directly.

## Inactive scaffolding

`app/`, `components/`, `data/`, Next.js configuration, Tailwind configuration and the legacy layered CSS files are currently inactive scaffolding. They remain in the repository to avoid destructive cleanup without approval. They are not used by the build.

Before a framework migration:

1. obtain user approval;
2. update `SOURCE_OF_TRUTH.md`;
3. document new build and deployment settings;
4. migrate all production pages and metadata;
5. verify parity before retiring static sources.

## Page principles

- shared header and footer across commercial pages;
- homepage limited to the brand introduction and direct links to dedicated pages;
- primary navigation uses separate HTML routes rather than reproducing full service content on the homepage;
- unique title, description and canonical URL;
- Open Graph image on public sales pages;
- only the publisher data required for public contact and account control is
  stored server-side; visitor messages and transactions are never collected;
- no invented proof or unsupported claim;
- responsive and keyboard-accessible interactions.

`/ellen-studio/` is an isolated, non-indexed Portuguese visual preview. Its concise
homepage and five dedicated pages use the same compact menu, direct specialty links
and local styles. Cream, cherry and candy-rose surfaces use locally bundled regular
and italic Cormorant Garamond, with its OFL license. The homepage's care-selection
action links to its existing specialty cards. Entry motion and cart-count feedback
respect reduced-motion preferences. The homepage features Ellen's supplied real portrait.
The care catalogue uses compact price/icon rows with labelled 44px controls and
selected check states. Shared typography tokens define page, section, category,
care, body/price and metadata levels; nested prices and descriptions remain below
their care heading. Specialty and technique images remain clearly labelled
AI-generated references. Compact
technique galleries use local image links enhanced by a native dialog. The nail
catalogue contains six simple finishes for natural nails; the eyebrow catalogue
compares four techniques using full-width horizontal close-ups and effect descriptions. There is no
fixed bottom Agenda bar. It does not use Nykuto authentication, D1 or shared commercial
styles. Dated market prices appear as indicative Brazilian reais, with unknown
amounts marked for consultation. Its temporary cart stores only selected service IDs
in tab-scoped sessionStorage; same-site query parameters carry them when storage is
blocked. This is an enquiry draft, not authoritative business data. Optional name,
date and notes are never persisted by the site. Submitting the agenda form opens
the supplied WhatsApp contact with the selection, a qualified price subtotal and
appointment preferences. The site does not send messages, take payment or confirm
bookings automatically. The catalogue model and handler checks live separately
from the unchanged image-viewer and menu script.

`demo-imobiliaria.html` is the autonomous Nykuto Local homepage linked from the
Nykuto commercial site and published canonically on `cde.nykuto.com`. The
subdomain opens directly on a compact, mobile-first buying surface. Search,
product and service categories, subcategories and the separate `Anunciar`
action are visible before the real-estate demonstration. `Comprar` never links
to the seller form. Product and service cards come from the public local API;
clearly labelled illustrative cards appear only when a live category is empty.
The eight-entry discovery grid groups phones with electronics and freight with
services while retaining the older canonical sections behind the interface.
`Preciso de…` opens the same direct single-page form in request mode and never
routes the user to Nykuto's WhatsApp.

`nykuto-local.js` loads offers from `GET /api/local/listings`, handles category,
subcategory and text search, and links every genuine card to `/anuncio/?id=`.
That detail page loads the public record, images and approximate zone, then
opens WhatsApp directly to the listing author through a compact floating action.
Category, subtype and neutral operational defaults remain catalogue/search
metadata and are not repeated as public detail cards. The detail prioritizes
photos, title, price, description, approximate zone and seller. Nykuto is not
part of payment, delivery, booking or dispute handling.

The property experience remains on dedicated static routes: `/imoveis/` for the
full catalogue, `/mapa/` for map-first search, `/favoritos/` for the visitor's
local selection and `/anunciar/` for direct publication. Except for shared
rides, `/anunciar/` is a single page limited to the essential public inputs:
category and subtype, title, optional description, price or contribution,
photos, an approximate area and the author's name and WhatsApp. Hidden
category-specific operational values use neutral defaults (`A combinar` or
`Sob consulta`) so the interface never invents a condition, vehicle type or
availability claim. The picker accepts at most two gallery images up to 100 MB,
including HEIC, HEIF or DNG when the browser can decode them. Client-side
processing removes embedded metadata, reduces the longest side to at most 960 px and
targets a JPEG no larger than 180 KB before the server validates Turnstile and
publishes atomically to a separate `LOCAL_DB` D1 database. The server retains a
300 KB hard ceiling for each converted image.

The preferred image store is the private `LOCAL_MEDIA` R2 binding. Because R2
is not yet enabled at account level, the pilot has an explicit constrained D1
fallback: two images maximum, 300 KB each and 600 KB total. Exact typed or
reverse-geocoded addresses are never sent to the publication API or shown on
the public listing. The author chooses a public radius of about 50 m, 200 m,
500 m, 1 km, 2 km, 3 km or 5 km; persisted public coordinates are rounded to
four decimals so that small selected radii remain coherent. The UI warns
authors to use a safe public point for 50 or 200 m. Address search remains an
explicit, rate-limited OpenStreetMap Nominatim action. Device geolocation is
requested only after the author clicks the dedicated control and grants the
browser permission; reverse geocoding can then propose a readable address.
Permission refusal or any location failure keeps explicit address search and
manual map placement available as fallbacks.
The shared pure `cde-local-reference.js` helper projects that already-rounded
public centre onto a locally calibrated CDE/PY02 axis. It adds an approximate
`Km` and Monday/Acaray orientation to cards, detail and publication preview only
inside the calibrated corridor; no new address or coordinate is persisted.
An explicit `Km N` homepage query paginates the public API and filters these
derived references client-side, so existing listings work without a D1 backfill.

The publisher preserves the existing Leaflet markers, radius circle and OSRM
route while rendering the base map with the OpenFreeMap `liberty` vector style
through MapLibre GL. It requires no user API key. If vector rendering is not
supported or the style cannot load, `anunciar/openfreemap-basemap.js` restores
the standard OpenStreetMap raster layer automatically, so location selection
and route publication remain usable. Provider and OpenStreetMap attribution
must remain visible in either mode. Photo-capable publisher flows keep the
raster map on iPhone and iPad to protect Mobile Safari's graphics-memory budget;
the dedicated carpool flow can use the vector map because it omits photo
selection and still retains the automatic raster fallback.

`/conta/` is a real lightweight online profile. A secure `HttpOnly`, `Secure`,
`SameSite=Lax` cookie keeps a passwordless 180-day device session; unsafe
requests require same-origin and CSRF. The author can update their contact,
pause, republish, conclude and delete listings. Google/Facebook OAuth is not
shown until owner-controlled applications and account recovery are configured;
Instagram is not a launch authentication method. The user-supplied WhatsApp is
public but explicitly labelled unverified until OTP is added.

`Carona compartilhada` uses the same listing model for offers and requests but
has a dedicated three-screen publisher: intention, route/schedule and WhatsApp
contact. Structured fees store the public departure/destination labels,
frequency, date when applicable, time and seats;
the normal price fields hold an optional per-person contribution. Route-first
catalogue cards and the carona search read these fields directly. Publication
also stores validated destination coordinates after the author confirms both
points through lookup, a frequent-place selector or direct map placement. The
detail page can therefore request and display the
approximate OSRM road path directly, while still presenting it only as a place
to arrange a safe pickup along the route—not navigation, booking or payment.
The publisher keeps a compact map visible on the route screen because local
street names are not always practical. Separate `Saída` and `Destino` map modes
support direct point placement, while a compact selector for UCP Lago, UCP
Plaza City and UCP Hospital prefills common destinations and remains manually
adjustable.

The demo uses owner-supplied photos and videos of real Ciudad del Este
properties that were neutralised before publication and stripped of embedded
metadata. Property names, references, prices, availability and locations remain
illustrative. Its static inventory is displayed over a real interactive map of
Ciudad del Este powered by Leaflet and OpenStreetMap tiles. Each listing exposes
an intentionally approximate centre and a privacy radius in metres; no exact
property address is stored or displayed. OpenStreetMap attribution remains
visible in the map. The demo has no paid mapping API, live client account,
payment flow, booking flow or production property database.

Within the real-estate routes, the public journey prioritises property search
before any commercial message. Property cards include an in-page media carousel, deliberate visual
privacy masks over neutralised areas, favourites stored locally and a comparison
flow. Cards and price markers are synchronised: selecting either highlights the
corresponding approximate area, while map markers open a compact property
preview before the full detail sheet. The detail sheet groups media, monthly and
entry costs, approximate distances and privacy information. Contact buttons open
the WhatsApp number verified on the listing owner's profile with a structured,
pre-filled enquiry; the site does not store or transmit the visitor's message
itself. Nykuto's own number remains the destination for platform sales, pass
renewals and manager support. A persistent WhatsApp button uses locally saved favourites as the
visitor's selection and can send either one property or a concise multi-property
request when the selected properties share a contact. Different owners remain
separate so no enquiry is sent to the wrong manager. On small screens, filters
use a bottom sheet. The local homepage uses a fixed four-action bar for
home, properties, publication and profile. The same four destinations remain
visible on every local route; list, map and favourites stay as contextual
controls inside the property section. Every Leaflet map creates an isolated
stacking context below the sticky header and fixed mobile navigation.

Each illustrative property also has a static `/imovel/<reference>/` share page
with its own Open Graph title, description and neutralised cover image. These
pages redirect human visitors to the matching detail sheet but remain readable
by link-preview crawlers. The preview is best effort: no image or video is
silently attached to the WhatsApp message, and the readable reference and URL
remain in the pre-filled text.

The owner journey remains public and illustrative, but the manager pilot is now
a real protected environment on `/gestor/`. Cloudflare Pages Functions validate
an opaque `HttpOnly`, `Secure`, `SameSite=Lax` session cookie and an active D1
access pass on every protected page and manager API request. Only the SHA-256
session-token digest is stored. The temporary pass uses a randomly generated,
high-entropy access code verified by HMAC-SHA-256 with a per-user salt and a
server-side pepper. Unsafe requests also require a same-origin CSRF token.
Credentials and the pepper are provisioned directly in Cloudflare and never
committed to Git.

The pilot D1 database stores one test manager, pass history, sessions, rate-limit
state, audit events and a management projection of the five illustrative
properties. Status and cover changes persist across devices and are exposed to
the public catalogue through a read-only, privacy-limited endpoint. Exact
addresses, private owner details, visitor messages, payments and leads are not
stored. Newly created properties remain drafts in this pilot. The guided editor
stores the complete rental offer: property type, rooms, availability, currency,
rent, guarantee, agency fee, rules, parking, included utilities and public
location notes. Its mobile media picker enforces a product limit of five photos
(10 MB per photo), shows local thumbnails and keeps demo covers secondary.
Video upload is intentionally
disabled during the no-revenue pilot. Binary persistence remains visibly
disabled until R2 is activated on the Cloudflare account; the interface never
claims that a locally selected file was uploaded.

The manager API records first publication and explicit availability verification
timestamps. A listing becomes due for review after 14 days. The public API hides
it after 30 days without a property confirmation or after 30 days without a
manager login; the row remains recoverable in D1. Logging in never changes the
property verification timestamp by itself.

The manager account page also stores the agency name and one WhatsApp contact in
normalized E.164 form. Common country codes are presented as mobile-friendly
choices and the server validates the full 8–15 digit international number. A
change invalidates the previous confirmation. The free pilot uses manual
verification: the manager sends a generated account code to Nykuto from the
same WhatsApp number, then Nykuto confirms it administratively. Publication,
reservation and availability confirmation are blocked until that verification
timestamp exists. The public API joins listings to their owner profile and
returns only verified contact routing; drafts and private account fields remain
private.

## Language architecture

- The French HTML is the content source of truth.
- `i18n.js` injects an accessible language selector into the shared header and translates text, labels, placeholders and page titles for English, Brazilian Portuguese and Spanish.
- Language state is carried through `?lang=` on internal links and stored locally in the visitor's browser.
- `script.js` reads the active language for dynamic estimator and contact-email text.
- Legal-page body copy is intentionally excluded from client-side translation; a localized notice identifies French as the authoritative legal version.

## Validation

```bash
npm run build
npm run hygiene
npm run functions:check
```

Before merging, inspect the production output, verify internal links, confirm legal publisher data and wait for user approval.

## Shared typography

[The common typography standard](typography-standard.md) defines the text-size
hierarchy for page, section, category, item, description/price and metadata roles.
AGENTS and Copilot require it before UI work and require its inclusion in future
site repositories. Compact interface text and long-form learning text have
different readability needs; both keep details subordinate to their own heading.

Jeux 21–22 continue immediate research. Jeu 21 extends independently reconciled
native preparation to MES/MGC for four frozen comparisons. Jeu 22 introduces
one opening-range breakout/retest family across four microcontracts, with a
causal stop behind the retest wick, fixed 10:00–12:00 New York entries and at
most one signal per direction. All eight new configurations fail selection;
no reserve performance is computed. Existing frozen code remains unchanged.
`lab-research-continuation.mjs` displays checksum-pinned aggregate reports,
both cost assumptions, all failed gates, daily counts and incomplete windows.
`research-ledger.json` records all 17 configurations from Games 19–22, including
the Game 20 failed reserve, to support avoiding identical research repeats.
Licensed sources and individual trades remain in private TRADING_DATASETS.
See `JEU21_RESULTS.md`, `JEU22_RESULTS.md` and `JEU21_22_ARCHIVE.md`.


Game 24 adds a frozen combined-context entry gate to the Game 23 retest engine.
`jeu24-context.mjs` joins causal EMA/VWAP trend, confirmed swings, Wilder RSI,
same-time previous-session volume and alternative candle shapes;
`jeu24-engine.mjs` enforces that gate before the unchanged one-contract simulator.
All 16 new configurations fail; 6 of 209 candidate signals survive and each
profile executes at most two trades. No reserve is opened.
`lab-combined-context.mjs` displays the checksum-pinned aggregates, equal-risk
Game 23 comparison and fixed-order signal funnel as the current Lab panel;
Game 23 and all earlier IDs remain in expandable archives. The research ledger
now retains 49 configurations from Games 19–24. Private contexts and individual
trades are archived in TRADING_DATASETS at `jeu24/combined-context-v1/manifest.json`.
See `trading/lab/JEU24_PROTOCOL.md`, `JEU24_RESULTS.md` and `JEU24_ARCHIVE.md`.
No live/Paper/Shadow activation, collection change or independent confirmation.


Game 25 introduces one graded admission-cap policy per microcontract through
`jeu25-risk.mjs` and `jeu25-engine.mjs`. It reuses Game 24 causal context, assigns
50/75/150 USD by the frozen score and preserves a fixed 300 USD daily envelope,
one microcontract and structural stops. Four configurations fail; reserve stays
closed. Game 23 fixed150 and Game 24 strict150 are read from private archived
executions, not resimulated or counted as new trials. `lab-graded-risk.mjs` is the
current checksum-pinned Lab panel, showing both costs, archived comparisons,
risk tiers and mean planned risk. It explains that repeated PnL across caps can
represent the same historical trade, rather than additional gains. Game 24 and
all previous IDs remain in expandable history. The ledger retains 53 trials.
Private sources and individual decisions/trades remain in TRADING_DATASETS at
`jeu25/graded-risk-v1/manifest.json`. See `trading/lab/JEU25_PROTOCOL.md`,
`JEU25_RESULTS.md` and `JEU25_ARCHIVE.md`. No live, Paper or Shadow activation.


Game 26 introduces a separately frozen closed-failure entry after public
video/transcript and community research. `jeu26-signals.mjs` requires a closed
opening-range breakout and a first directional close back inside within 30
minutes; `jeu26-terms.mjs` anchors the stop to the whole excursion and bounds
the target at the opposite range edge. One microcontract, fixed150/daily300,
the Game23 execution/account protections, source gaps and qualification gates
are retained. All four configurations fail; reserve stays closed and the
research ledger retains 57 configurations. `lab-failed-breakout.mjs` is the
current checksum-pinned Lab panel; Game25 and all prior HTML IDs remain in
expandable history. Private data and trades: `jeu26/failed-breakout-v1/manifest.json`.
See `trading/lab/JEU26_PROTOCOL.md`, `JEU26_RESULTS.md`, `JEU26_ARCHIVE.md`.
Public Discord-community archives are distinguished from inaccessible private
Discord channels. No live, Paper or Shadow execution is enabled. Historical
PR83 body is preserved in `docs/trading-pr83-history-through-game25.md` to
allow a concise current PR description within GitHub's length limit.


Game 27 adds a bounded filter diagnostic: twelve January–April configurations,
all below qualification. The existing Game23 engine and all earlier freezes
remain unchanged. The public aggregate report and current Lab panel show both
cost paths, the MNQ trend-only comparison, an archived Game20 monthly breakdown,
and the official LucidFlex 25K/50K differences. This is not an H1/M5 strategy
or a 50K account backtest. No new holdout is opened; 69 trials remain recorded.
Private executions are in `jeu27/filter-diagnostic-v1/manifest.json`.
See `trading/lab/JEU27_PROTOCOL.md`, `JEU27_RESULTS.md`, and `JEU27_ARCHIVE.md`.


Research continuation must also consult `trading/lab/research-catalog.json`.
The branch `research/trading-game32-trend500` at `9df4d691122ff6b2137da4bc93e30a4ddf1aac31`
contains the latest Games27–32. The filter diagnostic provisionally named Game27
in this checkout is audit F1, with distinct frozen files and private archive;
it must not overwrite the research branch's Game27 reentry experiment. The
current Lab synopsis links both histories. Their 57 shared configuration keys
are deduplicated in a catalog of 86 keys, with zero independent confirmations.
See `trading/lab/RESEARCH_SYNTHESIS_2026-09-09.md` before new work.


Game 33 executes the owner-selected LucidFlex 50K comparison at fixed100 and
reduced100/50/25 risk, with 25K controls: four configurations, 32 summer
replays, all exploratory. The 50K continuous result is +691.25 USD normal /
+265.50 stress; August remains negative and the evaluation target is not met.
The published Lab now includes account/period comparison, market contributions,
and an evaluation-versus-funded consistency calculator. No broker execution.
Eleven missing pure dependencies are imported unchanged from research commit
9df4d691122ff6b2137da4bc93e30a4ddf1aac31; historical freezes remain intact.
The published ledger holds 73 entries and the cross-history catalog 90 unique
configuration keys. See trading/lab/JEU33_PROTOCOL.md and JEU33_RESULTS.md.
Private archive: jeu33/account-sizing-v1/manifest.json, fully read back.
