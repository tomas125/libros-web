"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { Book } from "../data/books";
import { conditionLabel, isOutOfStock, maxOrderQuantity } from "../data/books";
import { useCart } from "../lib/CartContext";
import { formatPrice } from "../lib/whatsapp";

const COVER_COLORS = ["#7a1f2b", "#2f4a3c", "#1f3a5f", "#6b4a1f", "#4a2f5f", "#3a3a3a"];

function colorFor(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return COVER_COLORS[h % COVER_COLORS.length];
}

/** Tapa en proporción 2:3: foto real si existe, o un placeholder tipográfico. */
export function BookCover({ book, className = "" }: { book: Book; className?: string }) {
  const src = book.images?.[0];
  return (
    <div
      className={`relative aspect-[2/3] w-full overflow-hidden rounded-md bg-paper-3 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Tapa de ${book.title}, de ${book.author}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-between p-4 text-center text-white"
          style={{ background: colorFor(book.title) }}
          role="img"
          aria-label={`Tapa de ${book.title}, de ${book.author} (sin foto)`}
        >
          <span className="h-px w-8 bg-white/50" />
          <span className="font-display text-base font-bold leading-snug">{book.title}</span>
          <span className="text-xs uppercase tracking-wide text-white/80">{book.author}</span>
        </div>
      )}
    </div>
  );
}

export default function BookCard({ book }: { book: Book }) {
  const { add, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = isOutOfStock(book);
  const inCart = items.find((i) => i.book.id === book.id)?.quantity ?? 0;
  const atMax = inCart >= maxOrderQuantity(book);

  function handleAdd() {
    add(book, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  const disabled = soldOut || atMax;
  const label = soldOut ? "Sin stock" : atMax ? "Máximo en carrito" : justAdded ? "Agregado" : "Agregar al carrito";

  return (
    <article className="card flex h-full flex-col overflow-hidden p-3">
      <div className="relative">
        <BookCover book={book} className={soldOut ? "opacity-60 grayscale" : ""} />
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-paper">
            Sin stock
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`badge ${book.condition === "nuevo" ? "badge-nuevo" : "badge-usado"}`}>
            {book.condition === "nuevo" ? "Nuevo" : "Usado"}
          </span>
          {book.condition === "usado" && book.conditionDetail && (
            <span className="text-xs text-ink-muted">{book.conditionDetail}</span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug">
          {book.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-muted">{book.author}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {book.genre}
          {book.publisher ? ` · ${book.publisher}` : ""}
        </p>
        <span className="sr-only">{conditionLabel(book)}</span>

        <div className="mt-auto pt-3">
          <p className="font-display text-xl font-bold text-accent">{formatPrice(book.price)}</p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled}
            className="btn-primary mt-2 w-full !py-2.5 !text-sm"
          >
            {justAdded ? <Check size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
            {label}
          </button>
        </div>
      </div>
    </article>
  );
}
