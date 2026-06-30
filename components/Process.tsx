const steps = [
  "Vous expliquez votre activité et votre besoin.",
  "Vous envoyez vos textes, photos, tarifs et informations pratiques.",
  "Nykuto crée une première version claire et responsive.",
  "Vous validez les corrections incluses, puis le site est mis en ligne."
];

export function Process() {
  return (
    <section id="process" className="section-shell py-20">
      <div className="rounded-[2rem] bg-white p-8 text-ink md:p-12">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-electric">Process simple</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
          Vous n’avez pas besoin de comprendre la technique.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <span className="text-sm font-black text-electric">Étape {index + 1}</span>
              <p className="mt-4 font-bold leading-7 text-slate-900">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
