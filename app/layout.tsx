import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { BookStoreProvider } from "../lib/BookStoreContext";
import { CartProvider } from "../lib/CartContext";
import { AuthProvider } from "../lib/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import { SITE, getSiteUrl } from "../lib/siteConfig";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getSiteUrl();
const ogImage = `${siteUrl}/assets/logo.svg`;
const fullTitle = `${SITE.name} | ${SITE.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: fullTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    `libros San Nicolás`,
    `librería ${SITE.city}`,
    "libros usados",
    "libros nuevos",
    "comprar libros online Argentina",
    SITE.name,
  ],
  authors: [{ name: SITE.name, url: siteUrl }],
  creator: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: SITE.name,
    title: fullTitle,
    description: SITE.description,
    images: [{ url: ogImage, alt: `${SITE.name}: libros nuevos y usados` }],
  },
  twitter: {
    card: "summary",
    title: fullTitle,
    description: SITE.description,
    images: [ogImage],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/assets/logo.svg", apple: "/assets/logo.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf7f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen min-w-0 flex-col bg-paper font-sans text-ink antialiased">
        <JsonLd />
        <BookStoreProvider>
          <CartProvider>
            <AuthProvider>
              <a
                href="#contenido"
                className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
              >
                Saltar al contenido
              </a>
              <Navbar />
              <main id="contenido" className="min-w-0 flex-1 overflow-x-clip">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </CartProvider>
        </BookStoreProvider>
      </body>
    </html>
  );
}
