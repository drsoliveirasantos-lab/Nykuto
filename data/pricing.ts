export type Offer = {
  name: string;
  price: string;
  badge?: string;
  description: string;
  included: string[];
  excluded?: string[];
  cta: string;
};

export const offers: Offer[] = [
  {
    name: "Starter",
    price: "390 €",
    badge: "Pour commencer",
    description: "Un site vitrine one-page simple pour présenter votre activité et recevoir des contacts.",
    included: [
      "1 page jusqu’à 5 sections",
      "Design responsive mobile et ordinateur",
      "Présentation de l’activité et des services",
      "Section tarifs ou offres si fournie",
      "Bouton WhatsApp, appel ou email",
      "Formulaire simple si configuré",
      "1 correction incluse"
    ],
    excluded: [
      "SEO avancé",
      "Boutique en ligne",
      "Réservation complexe",
      "Développement sur mesure"
    ],
    cta: "Demander l’offre Starter"
  },
  {
    name: "Pro",
    price: "690 €",
    badge: "Recommandé",
    description: "Un site plus complet pour structurer vos services, rassurer vos clients et présenter plus de contenu.",
    included: [
      "3 à 5 pages simples",
      "Structure visuelle plus complète",
      "Page services et page contact",
      "Boutons WhatsApp/contact",
      "Formulaire simple",
      "Google Maps si pertinent",
      "Galerie si les photos sont fournies",
      "2 corrections incluses"
    ],
    cta: "Demander l’offre Pro"
  }
];

export const options = [
  { label: "Petite modification texte/image", price: "25–39 €" },
  { label: "Ajout d’une section", price: "50–80 €" },
  { label: "Ajout d’une page simple", price: "90–150 €" },
  { label: "Bouton réservation externe", price: "40–80 €" },
  { label: "Formulaire détaillé externe", price: "50–100 €" },
  { label: "Maintenance légère", price: "29 €/mois" },
  { label: "Maintenance + petites modifications", price: "59 €/mois" }
];
