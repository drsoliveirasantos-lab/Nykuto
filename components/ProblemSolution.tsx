const points = [
  "Instagram et WhatsApp ne remplacent pas toujours une vraie vitrine professionnelle.",
  "Les clients doivent comprendre rapidement vos services, vos prix et comment vous contacter.",
  "Un site simple peut déjà améliorer votre crédibilité sans devenir un projet complexe."
];

export function ProblemSolution() {
  return (
    <section className="section-shell py-20">
      <div className="grid gap-6 lg:grid-cols-3">
        {points.map((point, index) => (
          <article key={point} className="glass-card rounded-3xl p-7">
            <span className="text-sm font-black text-cyan">0{index + 1}</span>
            <p className="mt-5 text-xl font-bold leading-8 text-white">{point}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white p-8 text-ink md:p-10">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-electric">La solution Nykuto</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
          Un site utile, pas une usine à gaz.
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
          Grâce aux outils modernes et à l’IA, Nykuto accélère la création de sites vitrines simples tout en gardant un rendu clair, professionnel et adapté aux vrais besoins des petits professionnels.
        </p>
      </div>
    </section>
  );
}
