import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} — Sites vitrines simples et abordables`,
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: {
    title: `${site.name} — Sites vitrines simples et abordables`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "fr_FR",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
