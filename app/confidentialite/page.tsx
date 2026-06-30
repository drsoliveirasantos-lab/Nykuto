import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ConfidentialitePage() {
  return (
    <main>
      <Header />
      <section className="section-shell py-20">
        <div className="max-w-3xl rounded-[2rem] bg-white p-8 text-ink md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-electric">Page légale</p>
          <h1 className="mt-4 text-4xl font-black">Politique de confidentialité</h1>
          <p className="mt-5 leading-8 text-slate-700">
            Cette page est provisoire. Elle devra être adaptée selon les outils réellement utilisés : formulaire, analytics, cookies, hébergement et solution de contact.
          </p>
          <div className="mt-8 space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-black text-slate-950">Données collectées</h2>
              <p className="mt-2">À compléter selon le formulaire final : nom, email, téléphone, message et type de projet.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-950">Finalité</h2>
              <p className="mt-2">Les données servent uniquement à répondre aux demandes de contact et de devis.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-950">Durée de conservation</h2>
              <p className="mt-2">À définir avant mise en ligne commerciale.</p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
