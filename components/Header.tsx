import { navigation, site } from "@/data/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <div className="section-shell flex h-20 items-center justify-between">
        <a href="#top" className="flex items-center gap-3" aria-label="Accueil Nykuto">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl shadow-glow">N</span>
          <span>
            <span className="block text-lg font-black tracking-tight">{site.name}</span>
            <span className="block text-xs text-slate-400">Sites vitrines accessibles</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:scale-105"
        >
          Demander un devis
        </a>
      </div>
    </header>
  );
}
