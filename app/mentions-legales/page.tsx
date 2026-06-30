import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function MentionsLegalesPage() {
  return (
    <main>
      <Header />
      <section className="section-shell py-20">
        <div className="max-w-3xl rounded-[2rem] bg-white p-8 text-ink md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-electric">Page légale</p>
          <h1 className="mt-4 text-4xl font-black">Mentions légales</h1>
          <p className="mt-5 leading-8 text-slate-700">
            Cette page est un emplacement provisoire. Les informations administratives exactes doivent être ajoutées avant publication commerciale définitive.
          </p>
          <div className="mt-8 space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-black text-slate-950">Éditeur du site</h2>
              <p className="mt-2">À compléter : nom, statut juridique, adresse, numéro d’identification et contact.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-950">Hébergement</h2>
              <p className="mt-2">À compléter selon le fournisseur d’hébergement retenu.</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-950">Responsabilité</h2>
              <p className="mt-2">Les informations commerciales présentées sur le site devront être vérifiées avant mise en ligne.</p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
