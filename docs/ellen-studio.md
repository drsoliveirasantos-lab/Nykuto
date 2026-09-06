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
- `ellen-studio/agenda/index.html`: supplied WhatsApp contact and provisional booking state.
- `ellen-studio/ellen-studio.css`: fully separate ivory, powder-rose and deep-brown visual identity.
- `ellen-studio/ellen-studio.js`: shared progressive mobile navigation and native image-viewer dialog.
- `ellen-studio/ellen-portrait.webp`: supplied real portrait of Ellen, optimized and stripped of embedded metadata; CSS frames the face and shoulders without the screenshot interface or facial retouching.
- `ellen-studio/og.png`: lightweight 1200 × 630 brand-sharing card, composed from Ellen's supplied photograph and the studio's identity.
- `ellen-studio/editorial-beauty.webp`: earlier AI-generated concept image, retained but no longer used on the homepage.
- `ellen-studio/*-editorial.webp`: optimized illustrative references for nails, eyelashes and eyebrows.
- `ellen-studio/catalogue/*.webp`: sixteen active optimized visual references across the three specialties, including five horizontal eye-only eyelash references (`cilios-*-macro.webp`). Earlier eyelash portraits remain retained but are not rendered.
- `docs/ellen-studio-lashes.md`: professional sources and generation direction for the eyelash reference refresh.
- `ellen-studio/emblem.svg`: original text-based favicon; not a photograph.
- `scripts/test-ellen-studio.mjs`: dependency-free source-contract checks.
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

A visible notice and HTML/HTTP noindex state remain in place. Service names are
explicitly suggestions pending Ellen's approval; no prices, durations, credentials,
reviews, availability, address or phone number are invented. All prices read
`Valor a definir`. The agenda explains that **no reservation is confirmed automatically**.

On 6 September 2026, Diego supplied Ellen's public WhatsApp number,
`+595 973 877606`. The agenda now links to `https://wa.me/595973877606`
with a Portuguese enquiry prefilled. The visitor chooses whether to send it in
WhatsApp; this site neither sends nor stores messages. Source checks verify the
exact destination and decoded message; no message or account verification was
performed. Services, rates, address and hours still require confirmation.

The homepage uses the real portrait supplied for Ellen's identity and approved for
publication in this refresh. The specialty pages and technique catalogue use original
AI-generated editorial images. They are visibly labelled as illustrative, their
alternative text does not present them as studio work, and the image viewer repeats
the AI-reference disclaimer. They are not presented as photographs of her studio. No third-party images,
remote fonts, trackers or analytics are requested. Native font stacks vary with
the visitor's installed fonts; no font files are bundled. Core information remains
readable without JavaScript. Navigation, focus states, service buttons and
reduced-motion preferences are supported.
Each technique image links directly to its local full-size asset without JavaScript.
Where native dialogs are supported, an accessible in-page viewer adds the technique
name and description, close control, Escape dismissal and return focus. The dialog
uses no network API, accounts or storage. Technique galleries precede the pending
service/price section to make browsing more direct.
Eyelash references use a horizontal 3:2 frame with no image cropping, including in
the full-image viewer. The hero and homepage specialty card reuse the Russian-volume
macro rather than a full-face portrait. Lash lift, classic, hybrid and Russian volume
are distinguished from cat-eye, which is explicitly an extension styling effect, not
another lifting technique. The other specialty images and Ellen's real portrait are
unchanged by this refresh.

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

No admin interface, password, login/session, photo upload, database persistence,
payment, appointment storage, or calendar sync. Contact is an external WhatsApp link. Do not
present browser previews or edits as saved data. Content currently changes through
source edits only. An actual authenticated admin is a separate next implementation.

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
This is not a claim of physical-iPhone or Safari testing. Full-repository checks
must also run in CI.

## Full launch and indexing prerequisites

Obtain Ellen's confirmed services and prices, authorized portfolio photos, public
location/hours. The supplied WhatsApp destination is active for enquiries; confirm
the intended language and remaining contact journey before full launch.
Remove preview/noindex restrictions only when the business information is
genuine and the owner approves public indexing. Do not register a new domain for
this pilot.
