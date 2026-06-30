export function Hero() {
  return (
    <section id="top" className="section-shell grid min-h-[calc(100vh-80px)] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <div className="mb-6 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan">
          Création de sites vitrines simples, modernes et abordables
        </div>
        <h1 className="text-balance text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          Votre site vitrine professionnel à partir de <span className="text-cyan">390 €</span>.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
          Nykuto aide les indépendants, artisans, commerces et prestataires de services à avoir une présence en ligne claire, crédible et facile à contacter.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a href="#offres" className="rounded-full bg-cyan px-7 py-4 text-center font-black text-ink transition hover:scale-105">
            Voir les offres
          </a>
          <a href="#estimateur" className="rounded-full border border-white/20 px-7 py-4 text-center font-bold text-white transition hover:bg-white/10">
            Estimer mon prix
          </a>
        </div>
        <p className="mt-5 text-sm text-slate-500">
          Pas de promesse floue : un site simple, utile, mobile et proprement cadré.
        </p>
      </div>

      <div className="glass-card relative overflow-hidden rounded-[2rem] p-6">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-electric/30 blur-3xl" />
        <div className="relative rounded-[1.5rem] border border-white/10 bg-night p-5">
          <div className="mb-5 flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-5 text-ink">
              <p className="text-sm font-bold text-electric">Exemple de site client</p>
              <h2 className="mt-2 text-3xl font-black">Votre activité, claire en 10 secondes.</h2>
              <p className="mt-3 text-sm text-slate-600">
                Services, tarifs, photos, zone d’intervention et contact rapide.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <span className="rounded-2xl bg-slate-100 p-3 text-xs font-bold">Services</span>
                <span className="rounded-2xl bg-slate-100 p-3 text-xs font-bold">Tarifs</span>
                <span className="rounded-2xl bg-slate-100 p-3 text-xs font-bold">Contact</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Version mobile</p>
                <p className="mt-2 text-2xl font-black">Responsive</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Contact</p>
                <p className="mt-2 text-2xl font-black">WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
