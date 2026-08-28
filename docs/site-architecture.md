# Site architecture — Nykuto

## Current production model

Nykuto is a static multi-page website deployed through Cloudflare Pages.

Two Cloudflare Pages projects consume the same `main` branch:

- `nykuto` publishes the complete commercial site on `nykuto.com`;
- `nykuto-demo` publishes the autonomous Nykuto Local experience at the root of
  `demo.nykuto.com` by copying `demo-imobiliaria.html` to `index.html` during
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
anunciar/index.html            Owner and agency publishing journey
anunciar/anunciar.js           Client-side listing wizard and WhatsApp summary
conta/index.html               Device-local quick seller profile
conta/conta.js                 Local profile save and listing-form prefill
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
styles.css                     Shared design system
demo-imobiliaria.css           Real-estate demo interface styles
i18n.js                        FR/EN/PT/ES translations and language state
script.js                      Shared interactions
demo-imobiliaria.js            Static demo inventory, filters, map and dialogs
nykuto-local.js                Local request composer and WhatsApp handoff
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
- no server-side contact collection in the current version;
- no invented proof or unsupported claim;
- responsive and keyboard-accessible interactions.

`demo-imobiliaria.html` is the autonomous Nykuto Local homepage linked from the
Nykuto commercial site and published canonically on `demo.nykuto.com`. The
subdomain opens directly on a compact, mobile-first buying surface. Search,
product and service categories, subcategories and the separate `Anunciar`
action are visible before the real-estate demonstration. `Comprar` never links
to the seller form. Product and service cards are explicitly labelled as
examples of the future catalogue; real estate remains the only complete
navigable catalogue in the first release. A `Preciso de…` composer remains
available for genuine demand while supply is recruited.

`nykuto-local.js` controls one client-side request dialog. It collects category,
need, origin, optional destination, timing, optional budget and details, then
prepares a structured WhatsApp message to Nykuto for manual review. It does not
send or persist anything before the visitor confirms the WhatsApp action. Foz
requests display a permitted-goods and customs reminder. This launch intake is
not a booking, payment, logistics or transaction flow.

The property experience remains on dedicated static routes: `/imoveis/` for the
full catalogue, `/mapa/` for map-first search, `/favoritos/` for the visitor's
local selection and `/anunciar/` for an immediate five-stage listing intake.
That wizard collects category, subtype, title, local photo previews, price,
condition, category-specific costs, logistics, an approximate area and the
seller's direct contact before showing a summary and preparing a WhatsApp
message. The property manager,
Functions and D1 schema stay property-specific. A compact in-app footer keeps
the illustrative nature of the inventory visible without interrupting the
journey.

The public wizard persists no server-side listing or media. With explicit
opt-in, only the quick seller profile is remembered in that browser. Selected
photos use temporary `blob:` URLs for on-device preview and are never described as uploaded; WhatsApp deep links
carry text only, so the user must attach the selected photos in the conversation.
The location step reuses Leaflet and shows a fixed 5 km privacy circle. A manual
map tap always works. An explicit address-search button may send a bounded
CDE–Foz query to OpenStreetMap Nominatim, at no more than one request per second,
with in-memory caching and visible attribution; there is no autocomplete or
background geocoding. The exact search and coordinates remain private intake
references and are not displayed in a public listing or stored by the site.

`/conta/` is a convenience profile for the public prototype, not an online
account. After explicit consent it stores first name, last name, optional email
and WhatsApp in `localStorage` on that device and the public wizard prefills the
same fields. It creates no session, performs no social login and sends nothing
to Nykuto. Google or Facebook buttons must not be presented as available until
the separate member authentication, media storage and WhatsApp verification
capabilities are actually configured. Instagram is not part of this launch
path.

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
renewals and explicit Nykuto Local launch intake. A persistent WhatsApp button uses locally saved favourites as the
visitor's selection and can send either one property or a concise multi-property
request when the selected properties share a contact. Different owners remain
separate so no enquiry is sent to the wrong manager. On small screens, filters
use a bottom sheet. The local homepage uses a fixed four-action bar for
exploration, properties, `Preciso de…` and registration; property routes keep
their listing, map, favourites and owner navigation.

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
