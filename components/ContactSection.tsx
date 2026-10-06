import { MessageCircle, MapPin, Clock, Instagram } from "lucide-react";
import { SITE } from "../lib/siteConfig";
import { whatsappLink } from "../lib/whatsapp";

/** Sección de contacto de la home. Todo sale de lib/siteConfig.ts. */
export default function ContactSection() {
  return (
    <section id="contacto" className="scroll-mt-20 bg-paper-2 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-bold">¿Buscás un libro en particular?</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-2">
          Escribinos por WhatsApp y lo buscamos por vos. También aceptamos libros usados para la venta:
          consultanos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappLink(`Hola! Quiero consultar por un libro en ${SITE.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle size={18} aria-hidden="true" /> Escribinos por WhatsApp
          </a>
          {SITE.instagramUrl && (
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Instagram size={18} aria-hidden="true" /> Instagram
            </a>
          )}
        </div>
        <ul className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-ink-2 sm:flex-row sm:gap-8">
          <li className="inline-flex items-center gap-2">
            <MapPin size={16} aria-hidden="true" /> {SITE.city}, {SITE.region}
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock size={16} aria-hidden="true" /> {SITE.hours}
          </li>
        </ul>
      </div>
    </section>
  );
}
