import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { SITE } from "../lib/siteConfig";

const SPINES: { h: number; c: string }[] = [
  { h: 120, c: "#7a1f2b" },
  { h: 150, c: "#2f4a3c" },
  { h: 105, c: "#b8892f" },
  { h: 165, c: "#1f3a5f" },
  { h: 130, c: "#5c1520" },
  { h: 145, c: "#6b4a1f" },
  { h: 110, c: "#4a2f5f" },
];

export default function Hero() {
  return (
    <section id="inicio" className="scroll-mt-20 border-b border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {SITE.city}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            {SITE.name}
          </h1>
          <p className="mt-3 font-display text-xl italic text-ink-2 sm:text-2xl">{SITE.tagline}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-2">
            Novelas, infantiles, escolares y mucho más. Elegí tus libros, armá el carrito y
            terminamos el pedido por WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/#catalogo" className="btn-primary">
              Ver catálogo <ArrowDown size={18} aria-hidden="true" />
            </Link>
            <Link href="/#como-comprar" className="btn-secondary">
              Cómo comprar
            </Link>
          </div>
        </div>

        <div className="hidden justify-center md:flex" aria-hidden="true">
          <div className="border-b-4 border-ink-2 px-4">
            <div className="spines">
              {SPINES.map((s, i) => (
                <span key={i} style={{ height: s.h, background: s.c }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
