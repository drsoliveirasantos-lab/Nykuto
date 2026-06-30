import { faqs } from "@/data/faq";

export function FAQ() {
  return (
    <section id="faq" className="section-shell py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan">FAQ</p>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Les questions que les clients se posent avant de commander.</h2>
      </div>

      <div className="mt-10 grid gap-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="group rounded-3xl border border-white/10 bg-white/5 p-6 open:bg-white/10">
            <summary className="cursor-pointer list-none text-xl font-black text-white">
              <span>{faq.question}</span>
            </summary>
            <p className="mt-4 leading-7 text-slate-300">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
