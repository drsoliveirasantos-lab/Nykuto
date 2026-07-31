# Site architecture — Nykuto

## Current production model

Nykuto is a static multi-page website deployed through Cloudflare Pages.

The authoritative production sources are:

```txt
index.html                     Homepage
offres.html                    Nykuto Digital
international.html             Nykuto Business International
exemples.html                  Illustrative scenarios
process.html                   Method
a-propos.html                  Founder and company
faq.html                       FAQ
contact.html                   Mailto contact journey
mentions-legales.html          Legal notice
confidentialite.html           Privacy policy
cgv.html                       B2B terms
styles.css                     Shared design system
script.js                      Shared interactions
assets/                        Production images
favicon.svg                    Brand icon
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
- unique title, description and canonical URL;
- Open Graph image on public sales pages;
- no server-side contact collection in the current version;
- no invented proof or unsupported claim;
- responsive and keyboard-accessible interactions.

## Validation

```bash
npm run build
npm run hygiene
```

Before merging, inspect the production output, verify internal links, confirm legal publisher data and wait for user approval.
