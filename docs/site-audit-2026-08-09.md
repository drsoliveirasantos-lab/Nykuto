# Audit premium du site Nykuto

Date : 9 août 2026  
Périmètre : site public, architecture, identité, contenus, conversion, internationalisation, accessibilité, SEO technique, performance perçue et conformité commerciale.

## Synthèse

Le site possède déjà une base visuelle forte et une architecture multipage pertinente. Son principal enjeu n'est plus de « faire moderne », mais de transformer cette qualité graphique en crédibilité commerciale immédiatement vérifiable.

Les améliorations prioritaires sont donc :

1. rendre la marque plus distinctive sans importer l'identité médicale de Med Nykuto ;
2. afficher des preuves professionnelles courtes et vérifiables ;
3. parler davantage de valeur, de livrables et de gouvernance que de restrictions ;
4. réduire les frictions de contact ;
5. aligner les URL déclarées avec les URL réellement servies ;
6. enrichir les données structurées pour les moteurs de recherche ;
7. préserver une expérience complète lorsque JavaScript ou les animations sont indisponibles.

## Audit par dimension

| Dimension | Constat | Priorité | Action appliquée |
|---|---|---:|---|
| Architecture | Multipage claire, sans retour à une longue page unique | Forte base | Architecture conservée |
| Accueil | Positionnement lisible, mais preuves insuffisantes au-dessus de la ligne de flottaison | Haute | Ajout d'un rail compact SIREN, langues et périmètre écrit |
| Identité | Monogramme « N » propre mais générique | Haute | Création d'un monogramme Nykuto distinctif à géométrie féline, sans symbole médical |
| Argumentaire digital | Offres bien structurées, bloc final trop défensif | Haute | Reformulation en base évolutive et phases complémentaires |
| Argumentaire international | Expertise visible, limites réglementaires trop dominantes | Haute | Présentation positive des rôles : Nykuto, prestataire habilité et client |
| Crédibilité | Page À propos sous-exploitée malgré des diplômes vérifiables | Haute | Ajout du MSc 2 International Business Management et du titre RNCP niveau 7 |
| Conversion | Formulaire `mailto:` utile mais dépendant du logiciel de messagerie | Haute | Ajout de contacts directs Email et WhatsApp, maintien du formulaire préparatoire |
| Cas d'usage | Transparence correcte, formulation centrée sur ce qui n'est pas revendiqué | Moyenne | Recentrage sur contexte, intervention, validation externe et expertises associées |
| SEO | Canoniques et sitemap en `.html` alors que les URL publiques sont propres | Haute | Alignement sur les URL publiques sans extension |
| Données structurées | Présentes uniquement sur l'accueil | Haute | Ajout de schémas Service, OfferCatalog, AboutPage, ContactPage et FAQPage |
| Réseaux sociaux | Métadonnées partielles sur plusieurs pages | Moyenne | Ajout des dimensions d'image et des métadonnées Twitter essentielles |
| Accessibilité | L'état actif était principalement visuel | Haute | Ajout automatique de `aria-current="page"` selon l'URL réelle |
| Résilience | Les éléments animés pouvaient rester invisibles sans JavaScript | Haute | Ajout d'un mode visible avec `@media (scripting: none)` |
| Internationalisation | Sélecteur FR/EN/PT/ES solide, détection des pages légales fragile sur URL propre | Haute | Normalisation des URL et traduction de tous les nouveaux contenus |
| Performance | Image héro disponible en WebP, poids des actifs raisonnable | Bonne base | Aucun média lourd supplémentaire ; logo vectoriel léger |

## Décisions de marque

- **Nykuto** reste la marque ombrelle.
- **Nykuto Digital** et **Nykuto Business International** restent les deux expertises.
- L'ancien logo Med Nykuto reste réservé à l'activité médicale d'origine.
- La nouvelle marque commerciale reprend uniquement un indice félin discret ; le serpent, le livre et les codes médicaux sont exclus.

## Points volontairement conservés

- les pages séparées et la navigation actuelle ;
- les offres et prix déjà validés ;
- le formulaire sans collecte serveur ;
- les mentions de conformité dans la FAQ et les documents contractuels ;
- les fichiers générés et les anciens styles non supprimés, conformément aux règles du dépôt.

## Prochaines améliorations possibles après validation

1. créer un jeu officiel de logos PNG pour Square, factures et réseaux sociaux ;
2. ajouter des témoignages uniquement après autorisation écrite et preuve du client ;
3. remplacer le formulaire `mailto:` par un formulaire serveur conforme, protégé contre le spam ;
4. ajouter une page portfolio lorsque deux ou trois projets publiables sont disponibles ;
5. réaliser un audit de mesure après connexion d'un outil d'analytics respectueux du consentement.
