"use client";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { maxOrderQuantity, conditionLabel } from "../../data/books";
import { useCart } from "../../lib/CartContext";
import { formatPrice } from "../../lib/whatsapp";
import { BookCover } from "../../components/BookCard";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <ShoppingBag size={30} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="mb-7 mt-2 text-ink-2">Explorá el catálogo y sumá los libros que te gusten.</p>
        <Link href="/#catalogo" className="btn-primary">Ver catálogo</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-10">
      <h1 className="font-display text-3xl font-bold">Carrito</h1>
      <p className="mb-6 mt-1 text-sm text-ink-muted">
        {totalItems} {totalItems === 1 ? "libro" : "libros"}
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const b = item.book;
          const max = maxOrderQuantity(b);
          const atMax = item.quantity >= max;
          return (
            <li key={b.id} className="card flex gap-4 p-4">
              <div className="w-16 shrink-0 sm:w-20">
                <BookCover book={b} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-bold leading-snug">{b.title}</h2>
                <p className="text-sm text-ink-muted">{b.author}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{conditionLabel(b)}</p>
                <p className="mt-1 text-sm font-semibold text-accent">{formatPrice(b.price)}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-lg border border-line">
                    <button
                      type="button"
                      aria-label={`Quitar una unidad de ${b.title}`}
                      onClick={() => updateQty(b.id, item.quantity - 1)}
                      className="p-2 hover:bg-paper-2"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Agregar una unidad de ${b.title}`}
                      disabled={atMax}
                      onClick={() => updateQty(b.id, item.quantity + 1)}
                      className="p-2 hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {atMax && <span className="text-xs text-ink-muted">Máximo disponible ({max})</span>}
                  <button
                    type="button"
                    onClick={() => remove(b.id)}
                    className="ml-auto inline-flex items-center gap-1 text-sm text-danger hover:underline"
                  >
                    <Trash2 size={14} aria-hidden="true" /> Quitar
                  </button>
                </div>
              </div>
              <p className="hidden text-right font-display text-lg font-bold sm:block">
                {formatPrice(b.price * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <span className="text-ink-2">Total estimado</span>
          <span className="font-display text-2xl font-bold">{formatPrice(totalPrice)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">El envío, si corresponde, se coordina por WhatsApp.</p>
        <Link href="/checkout" className="btn-primary mt-4 w-full">
          Continuar con el pedido <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href="/#catalogo" className="mt-3 block text-center text-sm font-medium text-accent hover:underline">
          Seguir mirando libros
        </Link>
      </div>
    </div>
  );
}
