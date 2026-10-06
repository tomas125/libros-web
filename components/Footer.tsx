import Link from "next/link";
import { MessageCircle, Instagram, Mail, MapPin } from "lucide-react";
import Logo from "./Logo";
import { SITE } from "../lib/siteConfig";
import { whatsappLink } from "../lib/whatsapp";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/75">{SITE.tagline}. Pedí por WhatsApp y coordinamos entrega o envío.</p>
        </div>

        <div>
          <h2 className="font-display text-base font-semibold text-paper">Explorar</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { label: "Catálogo", href: "/#catalogo" },
              { label: "Cómo comprar", href: "/#como-comprar" },
              { label: "Preguntas frecuentes", href: "/#preguntas" },
              { label: "Mi carrito", href: "/cart" },
              { label: "Mi cuenta", href: "/cuenta" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-paper/75 no-underline hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-base font-semibold text-paper">Contacto</h2>
          <ul className="mt-3 space-y-2 text-sm text-paper/75">
            <li className="flex items-center gap-2">
              <MapPin size={15} aria-hidden="true" /> {SITE.city}, {SITE.region}
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-paper/75 no-underline hover:text-paper"
              >
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp
              </a>
            </li>
            {SITE.instagramUrl && (
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-paper/75 no-underline hover:text-paper"
                >
                  <Instagram size={15} aria-hidden="true" /> Instagram
                </a>
              </li>
            )}
            {SITE.email && (
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2 text-paper/75 no-underline hover:text-paper"
                >
                  <Mail size={15} aria-hidden="true" /> {SITE.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/15 py-4 text-center text-xs text-paper/60">
        © {year} {SITE.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
