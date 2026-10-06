/**
 * ÚNICO lugar donde se define la identidad de la librería.
 * Cambiá nombre, eslogan, WhatsApp, ciudad, redes y dominio acá y se actualiza todo el sitio.
 *
 * (El dominio también puede venir de la variable de entorno NEXT_PUBLIC_SITE_URL.)
 */
export const SITE = {
  /** Nombre provisorio: cambiar por el definitivo. */
  name: "Entre Páginas",
  tagline: "Libros nuevos y usados en San Nicolás",
  description:
    "Librería de libros nuevos y usados en San Nicolás de los Arroyos, Buenos Aires. Novelas, infantiles, escolares y más. Pedí por WhatsApp y coordinamos entrega o envío.",
  /** Formato internacional sin "+" (Argentina: 54 + 9 + área sin 0 + número). PLACEHOLDER: reemplazar. */
  whatsappNumber: "5493364XXXXXXX",
  email: "",
  instagramUrl: "",
  city: "San Nicolás de los Arroyos",
  region: "Buenos Aires",
  country: "Argentina",
  countryCode: "AR",
  /** Dominio por defecto (placeholder) si no hay NEXT_PUBLIC_SITE_URL. */
  defaultUrl: "https://entrepaginas.com.ar",
  /** Texto libre de horarios (se muestra en contacto/footer). */
  hours: "Lunes a sábado. Consultá horarios por WhatsApp.",
} as const;

/** URL pública del sitio (canonical, Open Graph, JSON-LD). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return SITE.defaultUrl;
}

/** True si el número de WhatsApp todavía es el placeholder. */
export function isWhatsAppPlaceholder(): boolean {
  return /X/i.test(SITE.whatsappNumber);
}
