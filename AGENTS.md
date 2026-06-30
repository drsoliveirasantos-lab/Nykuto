# Consignes IA — Nykuto

Ce dépôt doit suivre le standard commun Nykuto : workflow strict, sources claires, PR vérifiables, documentation synchronisée et nettoyage régulier.

## Lecture obligatoire

Avant toute modification, lire dans cet ordre :

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. `docs/site-architecture.md`
5. `.github/pull_request_template.md` s'il existe

Ne pas modifier en devinant. Identifier d'abord la source officielle puis faire le plus petit changement sûr.

## Branches et PR

- `main` = production.
- Après le bootstrap initial, créer une branche dédiée pour chaque changement significatif.
- Ouvrir une PR avant de merger.
- Ne pas merger si les checks sont rouges ou en attente.
- Ne pas supprimer de fichiers, branches, workflows, assets ou données sans validation explicite.

## Organisation attendue

- Application : `app/`, `components/`, `data/`, `lib/`, `src/` selon la stack retenue.
- Ressources publiques : `public/`, `assets/`, `images/`.
- Documentation et standards : `docs/`.
- Workflows et consignes GitHub : `.github/`.
- Scripts de validation/maintenance : `scripts/`.
- La structure officielle est déclarée dans `SOURCE_OF_TRUTH.md` et `docs/site-architecture.md`.

## Hygiène repository

Ne pas introduire :

- archives `.zip`, `.rar`, `.7z`, `.tar`, `.tgz`, `.gz` ;
- fichiers `tmp`, `temp`, `old`, `copy`, `backup`, `legacy`, `obsolete` sans justification ;
- workflows de debug laissés en place ;
- fichiers générés, copiés ou exportés qui peuvent être confondus avec la source officielle.

## Validation

Pour un changement structurel, lancer ou laisser la CI lancer :

```bash
node scripts/validate-repository-hygiene.js
```

Si un check échoue, corriger la cause avant de merger.

## Règle commerciale

Nykuto doit rester honnête : vendre des sites vitrines simples, propres et abordables. Ne pas promettre des fonctionnalités complexes, du SEO garanti, une boutique en ligne complète, ou un back-end sur mesure sans cadrage explicite.
