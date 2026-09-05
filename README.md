# Nykuto

Nykuto is the commercial website for two complementary service lines:

- **Nykuto Digital** — focused showcase websites and digital positioning;
- **Nykuto Business International** — administrative organization and project coordination between France, Europe and Latin America.

The production site is a lightweight static website deployed on Cloudflare Pages.

## Local development

```bash
npm install
npm run dev
```

The local server runs at `http://localhost:3000`.

## Build and validation

```bash
npm run build
npm run hygiene
```

The build copies the production sources to `out/`, `dist/` and `.vercel/output/static/`. These output folders are generated and must not be edited directly.

## Production sources

- root `*.html` files — pages;
- `styles.css` — shared design system;
- `i18n.js` — accessible FR/EN/PT/ES selector, translations and language persistence;
- `script.js` — navigation, reveal effects, localized estimator and mailto contact helper;
- `demo-imobiliaria.html`, `demo-imobiliaria.css` and `demo-imobiliaria.js` — local portal and property catalogue;
- `demo-build-stamp.js` — visible release marker used to confirm the deployed demo version;
- `nykuto-local.js` — progressive local-category request composer and WhatsApp handoff;
- `cde-local-reference.js` — shared approximate CDE kilometre/Monday/Acaray orientation helper;
- `anunciar/anunciar.js` — mobile-first listing wizard, local photo previews, approximate map zone and structured WhatsApp handoff;
- `ellen-studio/` — isolated, noindex Ellen Studio visual prototype; see `docs/ellen-studio.md`;
- `assets/` — production imagery;
- `favicon.svg`, `robots.txt`, `sitemap.xml`, `_headers` — platform and discovery files;
- `scripts/prepare-cloudflare-output.js` — static build.

The existing `app/`, `components/` and `data/` folders, together with the old layered CSS files, are inactive scaffolding. They are not part of the current Cloudflare build and must not be treated as production until a documented migration or approved cleanup occurs.

## Ellen Studio preview

`/ellen-studio/` is a Portuguese visual concept approved for publication as a
non-indexed preview, not a live booking service. Its styles and scripts are
independent of Nykuto Local. Missing prices, portfolio photographs and contacts
are explicitly provisional; there is no admin or database integration yet. Run
`npm run test:ellen-studio` for source checks and
`node scripts/test-ellen-studio.mjs --built` after building to check copied outputs.
See `docs/ellen-studio.md` for scope, validation and publication prerequisites.

## Repository workflow

Before modifying the repository, read in order:

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. `docs/site-architecture.md`
5. `.github/pull_request_template.md`

Use a working branch, open a pull request and wait for user validation before merging to `main`.
