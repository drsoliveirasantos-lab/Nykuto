# Déploiement Cloudflare Pages — Nykuto

## Configuration officielle

- Provider : Cloudflare Pages
- Branche production : `main`
- Domaine principal : `nykuto.com`
- Domaine Pages : `nykuto.pages.dev`
- DNS : Cloudflare

Ne pas configurer un autre hébergeur sans validation explicite.

## Réglages Cloudflare Pages

```txt
Framework preset: None
Build command: npm run build
Build output directory: out
Root directory: /
Production branch: main
```

Le script `scripts/prepare-cloudflare-output.js` copie les sources statiques et le dossier `assets/` dans `out/`.

## Vérification

1. Exécuter `npm run build` et `npm run hygiene`.
2. Vérifier les pages et ressources dans `out/`.
3. Tester l’URL de preview Cloudflare associée à la pull request.
4. Après validation et fusion, tester `https://nykuto.pages.dev` puis `https://nykuto.com`.
5. Vérifier le certificat, les liens internes, le formulaire mailto, `robots.txt` et `sitemap.xml`.
