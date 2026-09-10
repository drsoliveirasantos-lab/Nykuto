# Source of truth — Nykuto

This file defines what contributors and AI assistants must treat as authoritative in this repository.

## Project identity

Nykuto is a French professional-services brand with two coordinated business lines:

1. **Nykuto Digital** — simple, clear and responsive showcase websites.
2. **Nykuto Business International** — administrative organization, diagnostics and project coordination between France, Europe and Latin America.

The umbrella message is:

> Le digital et l’international, réunis pour faire avancer votre entreprise.

`Nykuto Local` is a progressive audience-acquisition pilot for Ciudad del Este
and Foz do Iguaçu. It is a free local publication and discovery platform, not a
payment, booking or transaction intermediary. People publish products,
properties, freight, local services, permitted Foz requests and shared rides;
interested visitors contact the author directly on that author's WhatsApp. The
existing illustrative property catalogue remains available for demos.

## Positioning rules

Nykuto is a consultancy and coordination business. It is not a bank, payment institution, acquirer, law firm or accounting firm.

When payment projects are discussed, Nykuto may:

- qualify business needs and flows;
- compare possible payment journeys;
- help prepare KYC/KYB information;
- coordinate onboarding with a regulated provider.

Nykuto must never claim to:

- hold or transmit funds for third parties;
- capture or store card data;
- guarantee merchant account acceptance, a virtual terminal, MOTO capability or payment limits;
- provide regulated legal, tax, accounting, banking or payment services.

## Branches

- `main` is the production branch.
- Use a short working branch for every meaningful change.
- Open a pull request before merging into `main`.
- Do not merge unless checks are green and the user validates the merge.

## Editable production sources

The current production source of truth is the static root site:

- root HTML pages;
- `styles.css`, `i18n.js` and `script.js`;
- `demo-imobiliaria.html`, `demo-imobiliaria.css`, `demo-imobiliaria.js` and
  `demo-build-stamp.js` and `nykuto-local.js` for the autonomous local portal;
- `anunciar/index.html`, `anunciar/anunciar.js` and
  `anunciar/openfreemap-basemap.js` for autonomous listing and request
  publication;
- `anuncio/` for the public listing page and direct author contact;
- `conta/` for the lightweight online publisher profile and listing controls;
- `regras/` for community, safety and external-import rules;
- `assets/`, `favicon.svg`, `robots.txt`, `sitemap.xml` and `_headers`;
- `ellen-studio/`, an isolated Portuguese multipage beauty preview with its own assets and navigation;
- `trading/`, the private Trading HQ published separately from its validation
  branch; its lab protocol and data boundaries are documented in
  `trading/lab/INDEPENDENT_VALIDATION.md`;
- `workers/trading-alerts/`, the isolated TradingView webhook receiver; private
  inbox, shared validation and deployment details live in `trading/alerts/`;
- `scripts/prepare-cloudflare-output.js`;
- `gestor/` for the private real-estate manager pilot interface;
- `functions/` for Cloudflare Pages authentication, manager and local APIs;
- `migrations/` for the manager and local D1 schemas;
- documentation in `docs/`;
- repository workflows and instructions in `.github/`.

`out/`, `dist/` and `.vercel/output/static/` are generated outputs and must never be edited directly.

The existing `app/`, `components/` and `data/` folders and the old layered CSS files are inactive scaffolding. They are not included in the production build. A future migration or cleanup must update this file and `docs/site-architecture.md` before those sources become authoritative or are removed.

## Commercial scope

Allowed digital positioning:

- one-page or small multi-page showcase websites;
- clear service presentation and contact paths;
- responsive design and basic technical SEO structure;
- simple external integrations such as Calendly or Tally when scoped.

Allowed international positioning:

- diagnostic and action plan;
- administrative organization;
- cross-border project coordination;
- research and comparison of service providers;
- remote or on-site training and transmission;
- coordination with regulated specialists.

Do not promise guaranteed SEO rankings, complex custom platforms, merchant acceptance or outcomes controlled by third parties.

## Trust rules

- No invented client, partner, certification, testimonial or performance figure.
- Illustrative cases must be labelled as scenarios or concepts.
- Confidentiality claims must match actual practice.
- Legal pages must contain confirmed publisher information before production publication.
- Sensitive personal information must not be committed to a public repository without explicit owner confirmation.

The real-estate manager pilot stores no plaintext credential in Git. Account
credentials, access periods and sessions are provisioned directly in Cloudflare;
protected routes must enforce both the session and the active pass on the server.
Listing drafts store structured rental details in D1. Manager media is limited
to five photos per property; video upload is disabled. Files must not be
presented as persisted until the R2 bucket and binding are active.

Public availability freshness is property-specific. A manager login is recorded
but never silently verifies every listing. Published and reserved properties
must be explicitly confirmed at least every 30 days or they are hidden from the
public API without being deleted. The manager starts seeing them as needing
review after 14 days.

Each manager profile owns one professional WhatsApp number stored in normalized
international E.164 form. Drafts may exist without a confirmed contact, but a
listing cannot be published, reserved or availability-verified until that
number has been manually confirmed. Changing the number removes the previous
confirmation. Public property enquiries use the verified number of the listing
owner; Nykuto's own business number remains reserved for sales, pass renewal,
manual profile confirmation and manager support. Every non-property enquiry
must route directly to the publishing user's WhatsApp, labelled as unverified
until an OTP mechanism exists, instead of making Nykuto an undisclosed
transaction intermediary.

The Nykuto Local catalogue reads genuine public offers and requests from the
separate `LOCAL_DB` D1 database. Except for shared rides, public `Anunciar` is a
direct single-page form: category and subtype, title, optional description,
price or contribution, up to two images, an approximate public zone and the
author’s name and WhatsApp. Category-specific operational values that are not
part of this essential form use neutral public defaults such as `A combinar` or
`Sob consulta`; the interface must not infer a product's state, a vehicle type
or an availability claim. Category, subtype and these operational values remain
search metadata; the public detail does not repeat them as cards and instead
prioritizes photos, title, price, description, approximate zone, seller and the
direct WhatsApp action. Publication remains direct after server validation
and Turnstile. Images are re-encoded in the browser to
remove embedded metadata and targeted to two JPEG files of 180 KB each. The
picker accepts gallery images up to 100 MB, including HEIC, HEIF and DNG when
the user's browser can decode them; every accepted source is converted to JPEG
at no more than 960 px on its longest side before publication. The server keeps a
300 KB ceiling per converted image. Until account-level R2 is enabled, the
pilot may use the explicit D1 media fallback with a 600 KB total per
publication; `LOCAL_MEDIA` becomes
the preferred private storage binding as soon as R2 is available.

The homepage uses eight concise discovery entries. `Eletrônicos` groups the
legacy phone and electronics sections, and `Serviços` groups the freight and
local-service entrances. Their canonical category, subtype and market-section
values remain distinct for validation, specialized publication fields and
backward compatibility; this is a presentation grouping, not a D1 migration.

The publisher profile is a real, passwordless, cookie-backed session on the
current device. It lets the author update contact data, pause, republish, mark
complete or delete publications. Google and Facebook sign-in must not be shown
as active until the owner's OAuth applications and recovery flow are configured.
The public WhatsApp number is user-supplied and must be described as unverified
until an OTP or WhatsApp Business verification mechanism exists.

`Preciso de…` opens the same direct single-page form with
`listing_kind=request`; it never sends a request to Nykuto's WhatsApp. External
listings are never scraped
or copied automatically. The direct form does not expose source-link
republication. Any future managed import must require the author or rights
holder's express permission and keep a safe original-source link.

`Carona compartilhada` has a dedicated route-first journey while reusing the
same listing model. The public catalogue can search approximate origin,
destination and date, and it separates available rides from ride requests.
Publication is intentionally limited to three screens: offer or request, route
and schedule, then WhatsApp contact and confirmation. Recurring and occasional
trips are supported with an approximate departure zone, destination, time,
seats and an optional per-person contribution. The only hand-off is a prefilled
WhatsApp conversation; Nykuto does not book a seat, confirm a passenger or
process payment. It is sharing a journey and expenses, not a guaranteed
transport service.

Address lookup is an explicit, user-triggered convenience for the CDE–Foz pilot,
not autocomplete. It may query the public OpenStreetMap Nominatim endpoint only
with visible attribution, an in-memory result cache, a maximum rate of one
request per second and a bounded regional query. Current-device location may be
requested only after an explicit click: the browser must show its permission
prompt, and refusal must keep address search and manual map placement available.
After permission, Nominatim reverse geocoding may propose a readable address for
the selected point. The interface must disclose that the entered search or
selected coordinates are sent to this third-party service. Neither the complete
typed nor reverse-geocoded address is persisted or published. The author chooses
the public precision: about 50 m, 200 m, 500 m, 1 km, 2 km, 3 km or 5 km.
Persisted public coordinates are rounded to four decimals so the selected
circle is technically coherent; choosing 50 or 200 m must carry a visible
warning to use a safe public point rather than a private home.
Within the established Ciudad del Este PY02 corridor, the rounded public centre
also produces a coarse local orientation such as `Km 8 · lado Monday (aprox.)`.
This follows the city's local bridge-to-west convention, not national PY02
chainage. It is omitted for Foz, the microcentre and places outside the calibrated
corridor, and it never requires or reveals the typed address.
The homepage may filter the already-public catalogue by an explicit `Km N`
query using this derived coarse reference, including legacy rows at read time.

Shared-ride publication requires an approximate departure point, destination
and departure time. After the author confirms both points through lookup, a
frequent-place selector or direct map placement, the publisher requests an
approximate road route. The validated destination coordinates are stored with
the listing so the public
detail can render the suggested route without repeating address lookup. The
route is a planning aid for arranging a safe pickup along the way through
WhatsApp, not a guaranteed itinerary or booking mechanism.
Because street addresses are often difficult to identify locally, the route
screen keeps a compact map visible and lets the author mark either departure or
destination directly. Frequent UCP destinations may be offered in a compact
selector; selecting one must remain adjustable on the map before publication.

## Languages

- French is the editorial source of truth in the production HTML files.
- `i18n.js` provides the English, Brazilian Portuguese and Spanish interface and commercial-page translations.
- The selected language is preserved in the URL and local browser storage so navigation remains consistent across pages.
- Legal documents remain officially published in French. In another interface language, the site must display a clear notice that the French text is authoritative rather than presenting an unofficial translation as legally binding.

## Publication blockers and fiscal wording

- The recommended current VAT treatment is the French *franchise en base de TVA*, subject to confirmation from the competent SIE that no voluntary VAT option is active.
- Do not publish a definitive VAT status until that confirmation is obtained. Quotes and invoices must use the wording appropriate to the client's status and location; international B2B services must not automatically reuse the domestic franchise wording.
- The owner explicitly approved publication of the professional address `23 Mail des Bordelais, 33300 Bordeaux, France` and telephone number `+33 7 68 34 56 08` on 31 July 2026. Do not expand the address with an apartment number or reuse any other personal coordinate without a new explicit confirmation.
- A city, district or postcode alone is not an acceptable substitute for the full address in production legal notices.

## Documentation and validation

- `docs/brand.md` — visual and verbal identity.
- `docs/offers.md` — service lines, prices and boundaries.
- `docs/content-strategy.md` — audiences, messages and conversion logic.
- `docs/site-architecture.md` — active source and deployment structure.

Run before proposing a merge:

```bash
npm run build
npm run hygiene
```

## Shared typography standard

[Typography hierarchy](docs/typography-standard.md) is the required visual
instruction for new and updated interfaces, including sites created from this
repository. It defines role-based sizes, readable learning content and the
instruction handoff to future repositories. Adding the instruction does not
itself change the existing runtime styles.


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


Game 34 resets a hypothetical 50K account each month and measures weekly PnL
separately from withdrawals. A new without-MYM ablation improves June/August
but worsens July. No month meets the personal 1000 EUR payout goal. Funded
assumes prior qualification; evaluation gains are never treated as withdrawable.
The fixed ECB reference is 1.1652 USD/EUR (2026-09-09), after 90/10 split,
before tax and transfer/FX fees. Required gross request 1294.67 USD and profit
2589.34 USD plus five 150 USD days. See trading/lab/JEU34_PROTOCOL.md and
JEU34_RESULTS.md. 24 replays include 6 controls; 3 new configurations, one new
strategy ablation. The ledger holds 76 entries, cross-history catalog 93 keys,
zero independent confirmations. Private archive fully read back under
jeu34/monthly-withdrawal-v1/. No order, payout request or activation.

The owner-provided call transcript is distilled in
trading/lab/ASSOCIATE_METHOD_2026-09-10.md and linked from the Lab. It distinguishes
H1 20/50 and level reactions from the historical H1 EMA9/21 experiment, records
unknown indicator/session settings and the cash-only data limit, and separates
the two speakers' optional confirmations. This is a method audit, with no new
performance run or ledger entry; frozen research remains unchanged.


Game 35 compares unchanged Game34-without-MYM entries with one target extension
per variant: MNQ 3R or MGC 3R. Neither meets the predeclared non-degradation
criterion; 2R remains the reference. MNQ worsens June/August; MGC worsens July
and raises normal realized drawdown from 312.50 to 536.50 USD. The 50K monthly
reset and EUR1000 withdrawal objective remain; no goal achieved. The Lab shows
weekly results, market contributions, duration lower bounds and reconciled
common/removed/new entries. See trading/lab/JEU35_PROTOCOL.md and JEU35_RESULTS.md.
36 replays include 12 exact controls; 4 new configurations, 2 strategy variants,
80 ledger entries and 97 cross-history keys; zero independent confirmations.
All private archive parts read back under jeu35/market-exits-v1/. Historical
freezes, entry rules, live/Paper/Shadow inactivity and collection stay intact.


Game 36 adds isolated MNQ/MES entry-confirmation experiments, importing the
Game34 account engine unchanged. One extra closed M5 candle must retain the
original stop and confirm directional progress; sizing uses the next open.
Both variants fail the frozen research gate. The current entry profiles and
2R targets remain the reference, with MGC unchanged and MYM still excluded
in this exploratory portfolio. See trading/lab/JEU36_PROTOCOL.md and
JEU36_RESULTS.md. The checksum-pinned lab-entries.mjs panel shows 36 replays,
market effects, confirmation/admission counts and weekly results. Twelve
Game35 controls are exact; 768 daily prefixes and 472 executions checked.
84 ledger entries, 101 cross-history keys; zero independent confirmations.
Monthly 50K reset and EUR1000 withdrawal goal persist; no goal achieved.
All archive parts verified under jeu36/entry-confirmation-v1/. Existing freezes,
HTML IDs, collection and live/Paper/Shadow inactivity are preserved.


Game 37 implements frozen diagnostic risk policies for the monthly funded50K
portfolio: fixed100/250/500 and graded50/150/250 or100/250/500 on MNQ/MES.
MGC retains nominal100 and its failed-breakout profile; MYM remains excluded.
The signal score and account-headroom tier are separate. One personal EUR1000
payout can occur before continuing toward USD4000 trading PnL; every month
resets. No policy meets the predeclared all-month/all-cost objective and
USD1000 drawdown gate. Reference100 remains; all new risk policies stay research.
The checksum-pinned lab-confidence.mjs panel at #risk37Game shows June/July/
August2026 daily calendars, exact date/market details, weekly PnL and simulated
withdrawals, plus score evidence from the fixed100 cohort. Absent dates and
stopped periods are not zero-profit days. See JEU37_PROTOCOL.md and JEU37_RESULTS.md.
36 replays: six exact controls, six new100 engine parity checks, 766 daily
prefixes and563 executions audited. Five new configurations/four risk policies;
89 ledger entries,106 cross-history keys, zero independent confirmations.
Freeze was published at ff0948823ee670385aaf34b6865bf9cb49317c82 before performance.
All three private archive parts and manifest read back under
jeu37/confidence-risk-v1/. Broker optional daily loss choice remains unknown;
only internal daily limits are modeled. No activation, order, payout request,
new collection or independent validation. Earlier reports and freezes persist.


`trading/models/` integrates the recovered RSI/news documentation and a separate
Kronos-mini experimental import/export boundary. The pinned CPU model was tested
on 24 predeclared MNQU6 windows (K1): MAE 78.9543 points versus last-close
persistence 67.875, with two invalid OHLC forecast windows; no trading adoption.
Analysis exports the selected closed bars; assisted prompts use source-aware RSI
and news guidance. No hosted inference, strategy filter, training, news feed or
order execution is enabled. Frozen research and ledgers remain unchanged. See
`trading/models/README.md` and `PROTOCOL.md`; model weights and individual private
data/results stay outside Git.


The learning audit at trading/lab/RESEARCH_LESSONS.md records corrected data/history
errors separately from rejected strategy hypotheses, including Kronos K1.
research-learning-audit.json reaggregates the six existing Jeu37 fixed100 runs;
no new performance is claimed. JEU38_PROTOCOL.md and jeu38-obstacles.mjs prepare
one MNQ-only veto (opposed confirmed M5 structure plus a confirmed pivot strictly
before 2R), keeping the whole fixed100 account and other market profiles unchanged.
The runner is frozen before a later bounded 12-replay diagnostic; six exact
controls are required. No new configuration is counted before execution.
The Lab #learning38Game exposes the lessons and pending experiment. Existing
model integration, 493 HTML IDs, freezes and prospective collection are preserved.
No weights retrained, live/Paper/Shadow activation, new data or main merge.


Game 38 is now executed once after the published freeze 563ab6eff9e475ddcc40058b9fb9b2342ef4618a.
The MNQ opposed-structure/obstacle veto changes no executed trades or monthly
results: its two August signals were already denied for planned risk. No strict
PnL improvement, so the filter is not retained; fixed100 remains the research
reference. Twelve replays, six exact controls, 256 account prefixes and 256
filter prefixes; one added configuration, ledger90/catalog107, no independent
confirmation. See trading/lab/JEU38_RESULTS.md and RESEARCH_LESSONS.md.
The original 49-file freeze and protocol retain their pre-performance wording.
Private archive jeu38/structure-obstacle-v1/ was written and fully read back.

The shared Lab #historyCalendarGame adds a game/profile/mode/cost selector for
monthly-reset June/July/August2026 views from Games33–38. Immutable reports stay
checksum-verified by their original validators. history-calendar-manifest.json,
history-calendar-view.mjs and lab-calendar-history.mjs/css are presentation
sources only; changing a selection does not rerun or tune strategies. Game33
continuous-summer views are excluded from this monthly calendar; early-stop
nulls and unavailable daily market/risk details remain explicit. Preferences
can persist locally; actual result history is versioned with its reports.
Earlier panels/HTML IDs, Kronos/RSI/news integration, historical freezes and
prospective collection remain intact; no execution, payout request or main merge.

Game 39 is prepared, not yet calculated. Two isolated MNQ admission variants
(before 11 h New York and actual pinned Kronos-mini directional veto) compare
against exact Game37 fixed100 across June/July/August2026 and two cost levels.
Eighteen replays are planned; request preparation is causal and frozen before
inference. research-self-review.mjs checks six cells without tuning, selection
or execution. See JEU39_PROTOCOL.md and JEU39_RESEARCH.md. No new weights or
prospective data; old models/RSI/news, freezes and work remain intact.

Game 39 completed once after published freeze2fc700dfb385f92b001a63fcb642603be51f7bf8.
Both isolated MNQ variants are rejected: before11h harmsJune and June stressDD;
Kronos harmsJune/August normal and has3invalidOHLC forecasts. Textual protocol
conflict disclosed: top-p0 in original prose versus0.9 in frozen code/pack and
execution. Do not edit freeze or rerun. See JEU39_RESULTS.md and
jeu39-execution-audit.json. Eighteen replays,6exactwholecontrols,384account and
384filterprefixes,64modelinputprefixes. Four private files durably archived and
read back, manifest90e3290567fbc376daeca2300261a02dd7fd1c0b0c5295e59e3f5709469729de.
Ledger92/catalog109,2addedconfigurations,0independentconfirmations. New Lab
study39Game and sharedcalendar include results; self-review is deterministic,
no self-training/autotuning/activation. Old freezes/models/RSI/news and
prospectivecollection preserved. No merge main.

At its published freeze, Game40 was prepared with no performance calculated. It extends unchanged
Game37 fixed100 to January–August2026: 16 monthly-reset replays, normal/doubled
costs, six exact summer controls. Only February25 and March6 are jointly omitted
for incomplete data; other dates in these months remain eligible. The future
calendar must show these dates crossed out with null results, and February/March
as partial. Observed eight-month mean divides by eight; complete-period outcome
remains unknown. See JEU40_PROTOCOL.md and MODEL_METHODS_AND_SEASONS.md. A code-
generated parameter table is checked before freeze/execution. No new model
inference, strategy rule, risk tuning or independent validation; no executed
configuration added before success. Existing freezes and collection unchanged.

Game40 is now executed once after freeze e0eb36dc7c787d9071e32882846c647f1088f04c.
All16 replays and6 whole controls pass;328 account/filter/context prefixes each.
Observed normal net1923.25 USD, monthly mean240.41; doubled costs1154/144.25.
Two partial months,164/166 sessions, no4K month or personal payout. See
JEU40_RESULTS.md; missing-day outcomes and full-eight-month mean stay unknown.
Private archive jeu40/eight-months-v1 has3 files reconstructed exactly, manifest
573daabef7a3c620f6171249906e17ef1a50461c34777d4e877d307d6c2c94d8.
One period-extension configuration, no strategy added: ledger93/catalog110.
Lab study40Game and shared calendar40 show Jan–Aug; games33–39 stay June–Aug.
The published protocol/freeze and all old results stay immutable. No model
inference, automatic selection, activation, prospective changes or main merge.

At its published freeze, Game41 was prepared before performance: one MES-only minimum net reward/risk1.5
veto against exact Game40 fixed100. The existing232 trades were audited with no
new arithmetic discrepancy. MES44 trades produce576.25 gross less535 costs,
net41.25; see jeu41-entry-audit.json and JEU41_RESEARCH.md. New ratio gate uses
only next open/closed signal and integer cents, never entry-bar future extremes.
32 planned replays,16 whole controls,656 account/filter/context prefixes each,
same8 monthly resets and2 missing dates. No ledger addition before execution.
All52 Game40 dependencies remain immutable; no new model inference or activation.

Game41 completed once after published freeze73aa1a6208a85f5a622e5d81f2675cd561ca0bb2.
The MES net reward/risk1.5 veto is not retained:7/16 comparison cells fail.
Observed normal total1923.25→2337 USD; doubled1154→807.75. Removed winners4/12,
removed losers11/15, new admissions4/8 for normal/stress. No common trade changes.
32 replays,16 whole Game40 controls,656 account/filter/context prefixes each;
434 trades reconciled. Three private files archived and exactly reconstructed,
manifest312d0a56709698f6372507496131a32746347252c788947e0487a50dad0485f5.
See JEU41_RESULTS.md and jeu41-execution-audit.json. The immutable report is
verified by jeu41-report-validation.mjs. study41Game and lab-study41.css extend
the existing Lab. Shared calendar33–41 has68 selections/234 monthly cost views;
40/41 use eight months, older games retain three; missing dates remain null.
One configuration added:ledger94/catalog111, all prior entries and67 frozen
dependencies preserved. No new inference, automatic selection, activation,
prospective collection changes or main merge. Original protocol remains frozen.

BOT_PROFILE_REVIEW_2026-09-10.md documents actual active profiles, mandatory
versus informative confirmations, costs/entry weaknesses and five proposed
research priorities. No new hypothesis execution or threshold selection.

Game42 preparation follows the owner-authorized video-method research. The only
candidate vetoes MES when the mean relative volume of strictly opposite closed
bars between the original breakout and confirmation is not below breakout
relative volume. Confirmation volume is diagnostic only; unobservable phases
keep the reference and receive explicit reasons. Fixed100/2R/stops, other
markets and Game40 preparation remain unchanged. Thirty-two replays and sixteen
whole Game40 controls are planned, not calculated at this preparation stage.
See trading/lab/JEU42_PROTOCOL.md and JEU42_RESEARCH.md. One future configuration,
no automatic selection, new inference, activation or collection change.

Game42 completed once after published freeze39904d4a5f16d2ce71880c6d127766bca649a9aa,
79 dependencies preserved. The MES phase-volume veto is not retained:5/16 cells
fail. Normal total1923.25→1589.25 USD; doubled1154→1131.25. Four/two winners
removed and two/three new losses for normal/stress; no common trade changes.
32 replays,16 exact whole controls,656 account/filter/context prefixes each,
451 trades and272 recorded phase observations audited. Four private files
archived/recomposed exactly from6parts/33chunks under jeu42/mes-pullback-volume-v1/.
See trading/lab/JEU42_RESULTS.md and jeu42-execution-audit.json. Immutable
report checked by jeu42-report-validation.mjs; study42Game/lab-study42.css
extend the Lab and shared calendar to33–42,72selections/266monthly cost views.
One executed configuration added:ledger95/catalog112; old94/111entries intact.
No inference, automatic selection, activation, collection change or main merge.
The original preparation protocol remains frozen as a historical record.


Game43 adds a reusable past-window normalization module and two isolated entry-extension hypotheses (MNQ / MES). Kronos-style scaling is reimplemented, not model inference. See trading/lab/JEU43_PROTOCOL.md and JEU43_RESEARCH.md. Forty-eight January-August replays are planned, including sixteen exact Game40 controls; no performance is claimed at freeze. Private progress/results stay outside Git, and the user requested launch then stop monitoring. Historical freezes, models, RSI/news, risk and collection remain intact. No automatic selection or activation.


Game43 completed once at frozen commit1c776a3073bc04423179236b1ac42591694a0cdf. Both normalized-entry variants veto zero signals and preserve all48 full accounts. Neither is retained: no strict improvement.16 exact controls,984 chronological prefixes per layer; outputs verified without rerun. See trading/lab/JEU43_RESULTS.md and jeu43-summary.json. Private detailed calendars/results archived separately; no UI calendar recomputation. Ledger97/catalog114 preserve prior95/112. No activation or new campaign.

Game44 preparation: 20 video sources with explicit access levels, three original Nykuto mechanisms (peer direction, relative index returns, breakout-anchored VWAP), six isolated MNQ/MES variants. See trading/lab/JEU44_RESEARCH.md, JEU44_PROTOCOL.md and jeu44-video-sources.json. New modules jeu44-context/filter/diagnostic plus build/run/test scripts. Planned 112 replays, 16 exact Game40 controls and 2,296 prefixes per layer. Freeze before performance; no activation, threshold search, combination or independent confirmation. Historical ledger97/catalog114 remain completed history until result registration.

Game44 completed once at freeze aaf31a02a1c97718d06ada443a665f066144c2ba:112 replays,16 whole controls,2296 prefixes per layer. All six variants fail the frozen monthly gate. Two MES variants improve aggregate net at both costs but degrade specific months; none retained. See trading/lab/JEU44_RESULTS.md, jeu44-summary.json and jeu44-execution-audit.json. Results archived privately. Ledger103/catalog120 preserve prior97/114; no independent confirmation, activation or new campaign.

Game45 preparation: six isolated London cash-clock/time-exit variants on MNQ/MES, unchanged Game40 risk and 2R. See trading/lab/JEU45_PROTOCOL.md and JEU45_RESEARCH.md. Conventional London clock with frozen official UK holidays; no observed European price feed or new entries outside the US morning. A one-time net-nonpositive check after six closed M5 bars schedules next-open exit. 112 replays,16 exact controls,2296 chronological prefixes per layer planned; no performance read before freeze. Ledger103/catalog120 remain completed history. Historical freezes, models, collection and activation remain intact. Launch once and stop monitoring until Diego requests verification.

Game45 completed once at freeze aee222ff039721c7e6d50188cb6ed2c0d21ec8c0:112 replays,16 whole controls,2296 prefixes per layer,119 frozen dependencies and1473 trade records verified. MNQ time-exit30 alone passes the descriptive gate: two reduced losses add91 USD at each cost; other five variants rejected. No independent confirmation, automatic selection or activation; Game40 remains the reference. See trading/lab/JEU45_RESULTS.md, jeu45-summary.json and jeu45-execution-audit.json. Private full outputs archived. Ledger109/catalog126 preserve prior103/120; no new performance run at readback.
