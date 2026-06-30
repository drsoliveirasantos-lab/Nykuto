import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function CGVPage() {
  return (
    <main>
      <Header />
      <section className="section-shell py-20">
        <div className="max-w-3xl rounded-[2rem] bg-white p-8 text-ink md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-electric">Page commerciale</p>
          <h1 className="mt-4 text-4xl font-black">Conditions générales de vente</h1>
          <p className="mt-5 leading-8 text-slate-700">
            Cette page est provisoire. Les CGV doivent être finalisées avant toute vente commerciale effective.
          </p>
          <div className="mt-8 space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-black text-slate-950">Offres</h2>
              <p className="mt-2">Les offres Nykuto concernent des sites vitrines simples, avec un périmètre défini avant le début du projet.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-950">Paiement</h2>
              <p className="mt-2">À définir : acompte, paiement final, conditions de livraison et validation client.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-950">Corrections</h2>
              <p className="mt-2">Les corrections incluses dépendent de l’offre choisie. Toute demande supplémentaire doit être validée séparément.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-950">Limites</h2>
              <p className="mt-2">Les offres standard n’incluent pas le SEO avancé, l’e-commerce, les réservations complexes ou le développement sur mesure.</p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
