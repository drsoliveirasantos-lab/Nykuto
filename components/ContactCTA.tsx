import { site } from "@/data/site";

export function ContactCTA() {
  return (
    <section id="contact" className="section-shell py-20">
      <div className="glass-card overflow-hidden rounded-[2rem] p-8 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan">Contact</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Parlez-moi de votre activité.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              La première étape est simple : expliquer ce que vous faites, ce que vous voulez montrer et comment vos clients doivent vous contacter.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href={`mailto:${site.email}`} className="rounded-full bg-cyan px-7 py-4 text-center font-black text-ink transition hover:scale-105">
                Envoyer un email
              </a>
              <a href="#estimateur" className="rounded-full border border-white/20 px-7 py-4 text-center font-bold text-white transition hover:bg-white/10">
                Refaire l’estimation
              </a>
            </div>
          </div>

          <form className="rounded-[1.5rem] bg-white p-6 text-ink">
            <p className="text-xl font-black">Demande rapide</p>
            <p className="mt-2 text-sm text-slate-600">
              Version visuelle du formulaire. La connexion email/CRM sera ajoutée après choix technique.
            </p>
            <div className="mt-5 space-y-4">
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Nom" disabled />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Email ou WhatsApp" disabled />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Type d’activité" disabled />
              <textarea className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Votre besoin" disabled />
              <button type="button" disabled className="w-full rounded-full bg-ink px-6 py-4 font-black text-white">
                Bientôt connecté
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
