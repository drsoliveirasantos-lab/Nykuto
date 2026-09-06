# Ellen Studio — public visual preview

## Scope and approved direction

A standalone Portuguese-language beauty showcase split across six routes under
`/ellen-studio/`. The user approved the name **Ellen Studio**, requested a very
feminine, sophisticated identity with fine contrasting typography, then approved
separate pages connected by a compact shared menu instead of one long page.
The approved mobile refresh uses Ellen's supplied portrait, a shorter introduction,
visible specialty links, compact cards and two-column technique galleries. There is
no persistent bottom Agenda bar; the provisional agenda remains in the main menu.

This first version remains a **visual preview**, not an operational salon website or
a SaaS release. Diego approved publication of this protected preview to `main` on
5 September 2026; the noindex state remains required until the real business
information and launch are confirmed.

## Authoritative sources and integration

- `ellen-studio/index.html`: concise presentation and links to the three specialties.
- `ellen-studio/nails/index.html`: proposed nail services.
- `ellen-studio/cilios/index.html`: proposed eyelash services.
- `ellen-studio/sobrancelhas/index.html`: proposed eyebrow services.
- `ellen-studio/sobre/index.html`: visual direction and preview limitations.
- `ellen-studio/agenda/index.html`: temporary care cart, optional appointment preferences and supplied WhatsApp contact.
- `ellen-studio/ellen-studio.css`: fully separate cream, cherry and candy-rose visual identity.
- `ellen-studio/fonts/`: locally served Cormorant Garamond regular and italic WOFF2 subsets, with the bundled SIL Open Font License.
- `ellen-studio/ellen-studio.js`: shared progressive mobile navigation and native image-viewer dialog.
- `ellen-studio/ellen-cart-model.mjs`: canonical care IDs, dated reference prices, conversion, draft normalization and WhatsApp message construction.
- `ellen-studio/ellen-cart.mjs`: cart controls, temporary draft handoff and user-triggered WhatsApp enquiry.
- `ellen-studio/ellen-portrait.webp`: supplied real portrait of Ellen, optimized and stripped of embedded metadata; CSS frames the face and shoulders without the screenshot interface or facial retouching.
- `ellen-studio/og.png`: lightweight 1200 × 630 brand-sharing card, composed from Ellen's supplied photograph and the studio's identity.
- `ellen-studio/editorial-beauty.webp`: earlier AI-generated concept image, retained but no longer used on the homepage.
- `ellen-studio/*-editorial.webp`: optimized illustrative references for nails, eyelashes and eyebrows.
- `ellen-studio/catalogue/*.webp`: fifteen active optimized references: six simple nail finishes, five horizontal eyelash close-ups (`cilios-*-macro.webp`), and four eyebrow close-ups (`sobrancelhas-*-macro.webp`). Earlier portraits and advanced nail references remain retained but are not rendered.
- `docs/ellen-studio-lashes.md`: professional sources and generation direction for the eyelash reference refresh.
- `ellen-studio/emblem.svg`: original text-based favicon; not a photograph.
- `scripts/test-ellen-studio.mjs`: dependency-free source-contract checks.
- `scripts/test-ellen-cart.mjs`: pricing, draft, navigation and actual cart/form event-handler checks.
- `scripts/prepare-cloudflare-output.js`: explicitly copies `ellen-studio/` to all three outputs.
- `_headers`: preview noindex and no-store headers scoped only to `/ellen-studio/*`.

This extends the static source model documented in `site-architecture.md`. It does
not use inactive Next.js scaffolding, shared commercial CSS, the property manager,
`LOCAL_DB`, D1 migrations, existing sessions, or the Nykuto Local catalogue. There
are no changes to the existing Nykuto public homepage or its navigation. Every
Ellen Studio route exposes the same direct six-page navigation. Both Pages projects
consume the repository; verify the intended preview host before sharing.
The intended final main-domain path is `https://nykuto.com/ellen-studio/`, but that
URL must not be described as live until an approved deployment is verified.

## Preview honesty and privacy

### Simplified catalogue, 6 September 2026

Diego requested a closer focus on eyebrow techniques and accessible nail art.
The nail gallery now presents six finishes on natural nails: nude, one colour,
classic French, coloured French, one glitter accent and small dots. Fibreglass,
acrylic, polygel, tips and structural gel overlays are no longer displayed.
Existing unused files are retained; no advanced service is advertised.

Four eyebrow macro images distinguish shape (design), hair colour (tint), temporary
skin shading (henna), and hair direction (lamination). The homepage brow thumbnail,
specialty hero and viewer use the same complete horizontal frame. This is a visual
comparison of illustrative looks, not a before/after or an offer of every service.

References informing this selection, consulted 6 September 2026:
[OPI — beginner nail art](https://www.opi.com/blog/nail-trends/5-simple-nail-art-designs-for-beginners),
[OPI — polka dots](https://www.opi.com/blog/nail-trends/now-trending-polka-dot-nails),
and [Bar de Cejas — services](https://www.bardecejas.com/servicios).
No third-party photographs are republished. Image-generation briefs and asset
inspection notes are recorded in `ellen-studio-simple-catalogue-assets.json`.

### Business details and imagery

A visible notice and HTML/HTTP noindex state remain in place. Service names are
explicitly suggestions pending Ellen's approval; no durations, credentials,
reviews, availability, address or phone number are invented. Published market
references now appear as indicative prices in Brazilian reais, never as Ellen's
confirmed rate card. Unverified amounts read `Sob consulta`. The agenda explains
that **no reservation is confirmed automatically**.

On 6 September 2026, Diego supplied Ellen's public WhatsApp number,
`+595 973 877606`. The agenda now links to `https://wa.me/595973877606`
with a Portuguese enquiry prefilled. The visitor chooses whether to send it in
WhatsApp; this site neither sends nor stores messages. The cart can include the
selected care, indicative amounts and optional name, date, period and notes.
Checks verify the exact destination and decoded message; no message or account
verification was performed. Services, final rates, address and hours still require
confirmation.

### Temporary cart and indicative prices, 6 September 2026

Diego requested a care cart followed by a WhatsApp appointment enquiry, with discreet
prices in reais (R$). Nineteen catalogue and maintenance/add-on entries use unique
service IDs. Each has an add/remove control, and the header links to the cart on all
six pages. Quantities are one per care; Ellen confirms that the selected care can be
combined. The form requests a date preference, not an available or reserved slot.

The tab's `sessionStorage` carries only validated service IDs between pages. This is
a temporary enquiry draft, not an order, account, booking record or authoritative
business data. When storage is unavailable, same-site links carry the IDs in the
`cuidados` query parameter. Names, date preferences and notes are never written to
browser storage or navigation URLs. These fields enter the WhatsApp draft URL only
after form submission. Returning from WhatsApp retains the selection; it does not
record a successful send or booking. Without JavaScript, the catalogue, static
reference prices and direct WhatsApp contact remain available.

Public prices were consulted on 6 September 2026. The model records the original
guaraní amount and exact source URL for every priced entry. Conversion uses the
[Xe BRL/PYG reference](https://www.xe.com/currencyconverter/convert/?Amount=1&From=BRL&To=PYG),
1 BRL = 1,168.66 PYG (snapshot 5 September 2026, 23:53 UTC). At Diego's request,
commercial prices are rounded to the nearest R$ 5 below R$ 100, and to the nearest
R$ 10 from R$ 100. For example, Russian volume is displayed as R$ 430 and lash
lift as R$ 130, with no cents. The same amounts appear in cards, cart and WhatsApp.
The cart sums these displayed rounded amounts. This is a dated reference, not live
FX or a payment quote. The semipermanent manicure reference is explicitly promotional;
the nail-art reference is an add-on for two nails. Tint excludes design, and the
lamination reference includes design without tint. Cat-eye uses a labelled foxy
extension comparison. No amount is invented for an unmatched complete service.

The model's `SOURCES` entries point to Ewa Beauty and Valuna on AgendaPro, Bea Nails
CDE, romSo on Fresha, and DermoBeauty's published services. Static HTML prices are
checked against the model. Unknown prices remain selectable but display `Sob consulta`;
both cart and WhatsApp distinguish a known-price subtotal from the additional
unquoted care. An all-unquoted selection never displays a zero-price total.
At Diego's request, the WhatsApp draft omits the redundant sentence explaining
Brazilian reais: each amount already carries R$. The closing question still asks
Ellen to confirm prices and available times; the site's reference-price explanation
remains available on the agenda page.

The homepage uses the real portrait supplied for Ellen's identity and approved for
publication in this refresh. The specialty pages and technique catalogue use original
AI-generated editorial images. They are visibly labelled as illustrative, their
alternative text does not present them as studio work, and the image viewer repeats
the AI-reference disclaimer. They are not presented as photographs of her studio. No third-party images,
remote fonts, trackers or analytics are requested. Cormorant Garamond regular and
italic are served locally for consistent brand, heading and price typography;
the body uses a native sans-serif stack. Core information remains
readable without JavaScript. Navigation, focus states, service buttons and
reduced-motion preferences are supported.
Each technique image links directly to its local full-size asset without JavaScript.
Where native dialogs are supported, an accessible in-page viewer adds the technique
name and description, close control, Escape dismissal and return focus. The dialog
uses no network API, accounts or storage. Technique galleries include the care
selection and reference prices to make browsing more direct.
Eyelash references use a horizontal 3:2 frame with no image cropping, including in
the full-image viewer. The hero and homepage specialty card reuse the Russian-volume
macro rather than a full-face portrait. Lash lift, classic, hybrid and Russian volume
are distinguished from cat-eye, which is explicitly an extension styling effect, not
another lifting technique. The other specialty images and Ellen's real portrait are
unchanged by this refresh.

## Cherry and candy-rose visual refresh, 6 September 2026

Diego approved the proposed premium, feminine direction: cream-rose surfaces,
deep cherry headings and primary actions, candy-pink accents and delicate frames.
The homepage retains its short layout and Ellen's original portrait, now framed in
a blush panel with a direct `Escolher meus cuidados` link to the existing specialty
cards. The separate `Conheça Ellen` link stays available. Mobile keeps the compact
portrait and service rows; all six pages share the updated palette and typography.

Cards use fine rose borders, gently rounded corners, pale pink purchase controls
and clear cherry selection states. Eyelash and eyebrow images keep their complete
horizontal framing. Introductory motion runs once, desktop hover movements are
limited to devices with a fine pointer, and cart-count feedback runs only after a
selection change. CSS and the count animation respect reduced-motion preferences.
There is no added fixed bottom bar, autoplay media, scroll interception or animation
dependency. Existing enquiry wording, rounded prices and booking behavior remain.

Cormorant Garamond by the Cormorant Project Authors is distributed under SIL OFL 1.1.
Regular 400 and italic 400 were obtained from the Google Fonts CSS API, subset with
FontTools to Latin, Latin Extended, punctuation and currency glyphs, and encoded as
WOFF2. The regular face is preloaded; both use `font-display: swap`. Font source:
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap
License: https://github.com/google/fonts/blob/main/ofl/cormorantgaramond/OFL.txt
Only the local subsets and license ship; visitors make no requests to Google Fonts.
The existing social-sharing image and metadata are preserved.

### Compact care selection

Diego requested a shorter layout and recognizable icon controls. All nineteen care
buttons now place a bag-plus icon beside the price in one row, with a 44 × 44 CSS
pixel target. Selection changes the icon to a check and the button to cherry;
pressing it again removes the care. Service-specific accessible names, title hints,
`aria-pressed`, live announcements and the existing count feedback stay available.
The refresh handler preserves the SVG instead of replacing button contents with text.

Each specialty carries one concise indicative-price note. Repeated card labels and
per-card cart shortcuts are removed; prices, relevant qualifiers, unquoted care and
the header/gallery cart links remain. Introductions, headings, card spacing and
mobile header dimensions are reduced. Nail thumbnails use a square contain frame;
eye and brow thumbnails retain their complete 3:2 frame and full-image viewer.
Mobile retains two catalogue columns, and the lash gallery uses three on desktop.
The existing colors, local fonts, enquiry text and price amounts are preserved.

## Link sharing

The user explicitly requested an identity-photo preview when sharing the site link
on 6 September 2026. All six pages expose static Open Graph and X card metadata in
the initial HTML head. The shared image is an absolute same-origin PNG URL, with
explicit MIME type, width, height and alternative text. Page-specific title,
description, canonical URL and `og:url` remain aligned with the actual route.
No JavaScript, external SDK, account or tracking is needed to read these tags.

The card is a photo-based brand composition, not a treatment result or a new
portrait of a fictional model. The original homepage portrait remains unchanged.
The generative composite preserves recognizable source identity but is not a
verified untouched-pixel paste; generation and inspection details are recorded in
[ellen-studio-share-card.json](ellen-studio-share-card.json).
Public asset access is retained without enabling search indexing; the existing
noindex notices and HTTP headers remain in place. Social clients decide whether
and when to fetch and display a preview, and already-sent messages are not a
guaranteed reflection of updated page metadata. Do not claim a physical WhatsApp
send test unless one has actually been performed.

Implementation references: [Open Graph protocol](https://ogp.me/),
[Meta image guidance](https://developers.facebook.com/documentation/sharing/webmasters/images),
and [Meta sharing metadata](https://developers.facebook.com/documentation/sharing/webmasters).
If the card changes later, give the image a new versioned URL to avoid reusing
cached image bytes. This release adds the first card; it replaces no existing one.

## What is deliberately not built yet

No admin interface, password, authenticated session, photo upload, database persistence,
payment, appointment storage, or calendar sync. Contact is a visitor-triggered external
WhatsApp draft. The temporary cart does not save business records. Content currently
changes through source edits only. An authenticated admin is a separate implementation.

## Validation

```sh
node --check ellen-studio/ellen-studio.js
npm run test:ellen-studio
npm run build
node scripts/test-ellen-studio.mjs --built
npm run hygiene
npm run functions:check
```

The dependency-free contract checks cover all six routes, unique metadata, the
shared navigation and current-page state, internal links and local assets, ARIA
references, honest provisional content, the noindex state and copied build outputs.
Sharing checks cover all six pages, matching route metadata, same-origin absolute
image URLs, unique tags, image MIME type, actual PNG dimensions and file-size budget.
Viewer-handler checks cover image/title/description selection, dismissal, focus
restoration, modified-click behavior and the no-dialog fallback.
Cart checks exercise real add/remove and form handlers with dependency-free Node
fixtures, rounded totals, unquoted care, malformed drafts, storage denial and URL
handoff, return navigation, past-date validation and encoded WhatsApp content.
This is not a claim of physical-iPhone or Safari testing. Full-repository checks
must also run in CI.

## Full launch and indexing prerequisites

Obtain Ellen's confirmed services and prices, authorized portfolio photos, public
location/hours. The supplied WhatsApp destination is active for enquiries; confirm
the intended language and remaining contact journey before full launch.
Remove preview/noindex restrictions only when the business information is
genuine and the owner approves public indexing. Do not register a new domain for
this pilot.
