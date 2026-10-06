"use client";

import { useMemo, useState } from "react";
import { Search, Loader2, WifiOff, ChevronDown, ListChecks, ShoppingBag, MessageCircle, X } from "lucide-react";
import { useBookStore } from "../lib/BookStoreContext";
import { GENRES, type Book } from "../data/books";
import BookCard from "../components/BookCard";
import Hero from "../components/Hero";
import TrustBar from "../components/TrustBar";
import ContactSection from "../components/ContactSection";
import { HOME_FAQ_ITEMS } from "../lib/homeFaq";
import { useHomeSearch } from "./home-search-provider";

type SortKey = "new" | "price-asc" | "price-desc";
type CondFilter = "todos" | "nuevo" | "usado";

/** Minúsculas y sin tildes, para búsquedas tolerantes. */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function matchesSearch(book: Book, q: string): boolean {
  if (!q) return true;
  const nq = norm(q);
  const digits = q.replace(/[\s-]/g, "");
  return (
    norm(book.title).includes(nq) ||
    norm(book.author).includes(nq) ||
    (!!book.isbn && digits.length >= 4 && book.isbn.replace(/[\s-]/g, "").includes(digits))
  );
}

const STEPS = [
  { Icon: Search, title: "Elegí", body: "Buscá por título, autor o ISBN y filtrá por género." },
  { Icon: ShoppingBag, title: "Armá tu carrito", body: "Sumá los libros que quieras, según el stock disponible." },
  { Icon: MessageCircle, title: "Confirmá por WhatsApp", body: "Se abre WhatsApp con tu pedido y coordinamos pago y entrega." },
];

export default function HomePageClient() {
  const { books, loading, error } = useBookStore();
  const { search, setSearch, searchInputRef } = useHomeSearch();
  const [genre, setGenre] = useState<string>("Todos");
  const [cond, setCond] = useState<CondFilter>("todos");
  const [sort, setSort] = useState<SortKey>("new");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = books.filter(
      (b) =>
        (genre === "Todos" || b.genre === genre) &&
        (cond === "todos" || b.condition === cond) &&
        matchesSearch(b, search)
    );
    const time = (b: Book) => (b.createdAt ? Date.parse(b.createdAt) || 0 : 0);
    return [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return time(b) - time(a);
    });
  }, [books, genre, cond, sort, search]);

  const hasFilters = genre !== "Todos" || cond !== "todos" || search.trim() !== "";

  function clearFilters() {
    setGenre("Todos");
    setCond("todos");
    setSearch("");
  }

  return (
    <>
      <Hero />
      <TrustBar />

      <section id="catalogo" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-display text-3xl font-bold">Catálogo</h2>
        <p className="mt-1 text-ink-muted">Libros nuevos y usados, con la condición siempre indicada.</p>

        {/* Filtros */}
        <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <label htmlFor="q" className="field-label">Buscar</label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                id="q"
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Título, autor o ISBN"
                className="field !pl-9"
              />
            </div>
          </div>
          <div>
            <label htmlFor="genre" className="field-label">Género</label>
            <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="field">
              <option value="Todos">Todos</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cond" className="field-label">Condición</label>
            <select id="cond" value={cond} onChange={(e) => setCond(e.target.value as CondFilter)} className="field">
              <option value="todos">Nuevos y usados</option>
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="field-label">Ordenar por</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="field">
              <option value="new">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-ink-muted" aria-live="polite">
          <span>
            {loading ? "Cargando libros…" : `${filtered.length} ${filtered.length === 1 ? "libro" : "libros"}`}
          </span>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
              <X size={14} aria-hidden="true" /> Limpiar filtros
            </button>
          )}
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-paper-2 px-4 py-3 text-sm text-ink-2">
            <WifiOff size={16} aria-hidden="true" /> {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-accent" role="status" aria-label="Cargando">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-xl font-semibold">No encontramos libros con esos filtros</p>
            <p className="mt-2 text-ink-muted">
              Probá con otra búsqueda, o escribinos por WhatsApp y lo buscamos por vos.
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="btn-secondary mt-5">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((b) => (
              <li key={b.id}>
                <BookCard book={b} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="como-comprar" className="scroll-mt-20 bg-paper-2 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="flex items-center gap-2 font-display text-3xl font-bold">
            <ListChecks size={26} className="text-accent" aria-hidden="true" /> Cómo comprar
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ Icon, title, body }, i) => (
              <li key={title} className="card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">
                  {i + 1}. {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="preguntas" className="scroll-mt-20 mx-auto max-w-3xl px-4 py-14">
        <h2 className="font-display text-3xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-white">
          {HOME_FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-sans text-base font-semibold"
                  >
                    {item.q}
                    <ChevronDown size={18} aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                </h3>
                {open && (
                  <p id={`faq-${i}`} className="px-5 pb-4 text-sm leading-relaxed text-ink-2">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <ContactSection />
    </>
  );
}
