import Link from "next/link";
import { SITE } from "../lib/siteConfig";

/** Ícono simple de libro abierto (SVG inline, hereda color). */
export function BookMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8c-2.5-2-6-3-11-3v18c5 0 8.5 1 11 3 2.5-2 6-3 11-3V5c-5 0-8.5 1-11 3z" />
      <path d="M16 8v18" />
    </svg>
  );
}

/** Logo provisorio: ícono + nombre desde siteConfig. Reemplazar por el definitivo cuando exista. */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 no-underline ${light ? "text-paper" : "text-accent"}`}
      aria-label={`${SITE.name}, ir al inicio`}
    >
      <BookMark />
      <span
        className={`font-display text-xl font-bold tracking-tight ${light ? "text-paper" : "text-ink"}`}
      >
        {SITE.name}
      </span>
    </Link>
  );
}
