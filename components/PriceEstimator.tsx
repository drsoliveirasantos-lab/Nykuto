"use client";

import { useMemo, useState } from "react";

const choices = [
  { id: "multi", label: "Je veux plusieurs pages", amount: 300 },
  { id: "gallery", label: "Je veux une galerie photos", amount: 80 },
  { id: "texts", label: "Je veux de l’aide pour structurer les textes", amount: 120 },
  { id: "booking", label: "Je veux un bouton de réservation externe", amount: 60 },
  { id: "form", label: "Je veux un formulaire plus détaillé", amount: 80 },
  { id: "maintenance", label: "Je veux une maintenance mensuelle", amount: 29 }
];

export function PriceEstimator() {
  const [selected, setSelected] = useState<string[]>([]);

  const base = selected.includes("multi") ? 690 : 390;
  const monthly = selected.includes("maintenance") ? 29 : 0;

  const estimate = useMemo(() => {
    return choices.reduce((total, choice) => {
      if (!selected.includes(choice.id)) return total;
      if (choice.id === "multi" || choice.id === "maintenance") return total;
      return total + choice.amount;
    }, base);
  }, [base, selected]);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <section id="estimateur" className="section-shell py-20">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan">Estimateur simple</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Comprendre le budget avant de discuter.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Cet outil donne une première idée. Ce n’est pas un devis final, mais il montre la logique : un site simple reste abordable, les options s’ajoutent clairement.
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-7">
          <div className="space-y-3">
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => toggle(choice.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                  selected.includes(choice.id)
                    ? "border-cyan bg-cyan/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="font-semibold">{choice.label}</span>
                <span className="text-sm font-black text-cyan">{choice.id === "maintenance" ? "+29 €/mois" : `+${choice.amount} €`}</span>
              </button>
            ))}
          </div>

          <div className="mt-7 rounded-3xl bg-white p-6 text-ink">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-electric">Estimation</p>
            <p className="mt-3 text-5xl font-black">à partir de {estimate} €</p>
            {monthly ? <p className="mt-2 text-sm font-bold text-slate-600">+ {monthly} €/mois si maintenance choisie</p> : null}
            <p className="mt-4 text-sm text-slate-600">
              Le prix final dépend des contenus fournis, du nombre de pages et des intégrations réellement nécessaires.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
