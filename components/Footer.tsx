import Link from "next/link";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="section-shell flex flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-black text-white">{site.name}</p>
          <p>{site.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
          <Link href="/cgv" className="hover:text-white">CGV</Link>
        </div>
      </div>
    </footer>
  );
}
