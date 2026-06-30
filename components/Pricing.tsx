import { offers, options } from "@/data/pricing";

export function Pricing() {
  return (
    <section id="offres" className="section-shell py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan">Offres claires</p>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Des prix abordables, avec des limites propres.</h2>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Nykuto ne vend pas du développement complexe à bas prix. L’offre est pensée pour les sites vitrines simples, rapides à comprendre et faciles à contacter.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {offers.map((offer) => (
          <article key={offer.name} className="glass-card flex flex-col rounded-[2rem] p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-3xl font-black">{offer.name}</h3>
              {offer.badge ? <span className="rounded-full bg-cyan/15 px-4 py-2 text-sm font-black text-cyan">{offer.badge}</span> : null}
            </div>
            <p className="mt-6 text-5xl font-black text-white">{offer.price}</p>
            <p className="mt-4 text-slate-300">{offer.description}</p>
            <ul className="mt-7 space-y-3 text-sm text-slate-200">
              {offer.included.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-cyan">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {offer.excluded ? (
              <p className="mt-6 text-sm text-slate-500">Non inclus : {offer.excluded.join(", ")}.</p>
            ) : null}
            <a href="#contact" className="mt-8 rounded-full bg-white px-6 py-4 text-center font-black text-ink transition hover:scale-[1.02]">
              {offer.cta}
            </a>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h3 className="text-2xl font-black">Options et interventions après livraison</h3>
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => (
            <div key={option.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">{option.label}</p>
              <p className="mt-2 text-sm font-black text-cyan">{option.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
