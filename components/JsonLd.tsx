import { SITE, getSiteUrl, isWhatsAppPlaceholder } from "../lib/siteConfig";

/** Datos estructurados WebSite + BookStore (todo sale de lib/siteConfig.ts). */
export default function JsonLd() {
  const url = getSiteUrl();
  const sameAs = SITE.instagramUrl ? [SITE.instagramUrl] : [];
  const tel = isWhatsAppPlaceholder() ? undefined : `+${SITE.whatsappNumber}`;

  const business: Record<string, unknown> = {
    "@type": "BookStore",
    "@id": `${url}/#business`,
    name: SITE.name,
    description: SITE.description,
    url,
    ...(tel ? { telephone: tel } : {}),
    image: `${url}/assets/logo.svg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.countryCode,
    },
    areaServed: [
      { "@type": "City", name: SITE.city },
      { "@type": "AdministrativeArea", name: SITE.region },
      { "@type": "Country", name: SITE.country },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };

  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "es-AR",
        publisher: { "@id": `${url}/#business` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}/?q={q}`,
          "query-input": "required name=q",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url: `${url}/`,
        name: `Inicio | ${SITE.name}`,
        isPartOf: { "@id": `${url}/#website` },
        about: { "@id": `${url}/#business` },
        inLanguage: "es-AR",
      },
      business,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
