import { getSiteUrl } from "../lib/siteConfig";
import { HOME_FAQ_ITEMS } from "../lib/homeFaq";

/** FAQPage para rich results; datos alineados con la sección FAQ de la home. */
export default function HomeFaqJsonLd() {
  const url = getSiteUrl();
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    mainEntity: HOME_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
  );
}
