import { examples } from "@/data/examples";

export function Examples() {
  return (
    <section id="exemples" className="section-shell py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan">Exemples</p>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Des modèles concrets pour des besoins réels.</h2>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Ces exemples servent à montrer le type de résultat possible. Les démonstrations seront ajoutées progressivement avec des pages dédiées.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {examples.map((example) => (
          <article key={example.title} className="group rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10">
            <div className="mb-6 h-44 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan/25 via-electric/25 to-white/10 p-4">
              <div className="h-full rounded-2xl bg-ink/70 p-4">
                <div className="h-3 w-24 rounded-full bg-white/30" />
                <div className="mt-6 h-8 w-2/3 rounded-xl bg-white/80" />
                <div className="mt-4 h-3 w-full rounded-full bg-white/20" />
                <div className="mt-2 h-3 w-4/5 rounded-full bg-white/20" />
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <span className="h-12 rounded-xl bg-cyan/30" />
                  <span className="h-12 rounded-xl bg-white/15" />
                  <span className="h-12 rounded-xl bg-electric/30" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-black">{example.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{example.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {example.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-cyan">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
