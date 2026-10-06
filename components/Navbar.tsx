"use client";

import Link from "next/link";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/#como-comprar", label: "Cómo comprar" },
  { href: "/#preguntas", label: "Preguntas" },
  { href: "/#contacto", label: "Contacto" },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const count = mounted ? totalItems : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />

        <nav aria-label="Principal" className="ml-6 hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-2 no-underline hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/?buscar=1#catalogo"
            aria-label="Buscar libros"
            className="rounded-lg p-2 text-ink-2 hover:bg-paper-2"
          >
            <Search size={20} />
          </Link>
          <Link
            href="/cuenta"
            aria-label={user ? "Mi cuenta" : "Ingresar"}
            className="relative rounded-lg p-2 text-ink-2 hover:bg-paper-2"
          >
            <User size={20} />
            {mounted && !loading && user && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-ok" />
            )}
          </Link>
          <Link
            href="/cart"
            aria-label={`Carrito, ${count} ${count === 1 ? "libro" : "libros"}`}
            className="relative rounded-lg p-2 text-ink-2 hover:bg-paper-2"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-ink-2 hover:bg-paper-2 md:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label="Menú móvil" className="border-t border-line bg-paper px-4 py-3 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-ink no-underline hover:bg-paper-2"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
