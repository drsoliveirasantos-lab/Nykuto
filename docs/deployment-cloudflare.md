# Déploiement Cloudflare Pages — Nykuto

Nykuto.com utilise Cloudflare Pages.

## Configuration officielle

- Provider : Cloudflare Pages
- Branche production : main
- Domaine principal : nykuto.com
- Domaine Pages : nykuto.pages.dev
- DNS : Cloudflare

Ne pas configurer Vercel sauf changement explicite d’hébergeur.

## Réglages Cloudflare Pages

Dans Cloudflare Pages, utiliser :

```txt
Framework preset: Next.js Static HTML Export
Build command: npm run build
Build output directory: out
Root directory: /
Production branch: main
```

Le projet utilise un export statique Next.js avec `output: "export"` dans `next.config.ts`.

## Vérification

Tester dans cet ordre :

1. URL de déploiement Cloudflare affichée dans le dashboard.
2. https://nykuto.pages.dev
3. https://nykuto.com
4. https://www.nykuto.com si configuré.

Si le domaine pages.dev ne marche pas, le problème est le build ou le dossier de sortie Cloudflare, pas le DNS du domaine personnalisé.

## Points à vérifier dans Cloudflare

- Le build doit réussir.
- Le dossier de sortie doit être `out`.
- Le domaine personnalisé doit être ajouté dans Custom domains.
- Le domaine doit être actif dans Cloudflare DNS.
