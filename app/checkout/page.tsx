"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { useCart } from "../../lib/CartContext";
import { openWhatsAppOrder, formatPrice } from "../../lib/whatsapp";
import { getBooksRepository } from "../../lib/data/booksRepository";
import { conditionLabel } from "../../data/books";
import { isWhatsAppPlaceholder } from "../../lib/siteConfig";

export default function CheckoutPage() {
  const { items, totalPrice, clear } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f0e8] text-ok">
          <CheckCircle size={34} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold">¡Pedido enviado!</h1>
        <p className="mb-7 mt-3 leading-relaxed text-ink-2">
          Se abrió WhatsApp con el detalle de tu pedido. Te confirmamos disponibilidad y coordinamos
          pago y entrega a la brevedad.
        </p>
        <Link href="/" className="btn-secondary">Volver al catálogo</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="mb-5 text-ink-2">No hay libros en el carrito.</p>
        <Link href="/#catalogo" className="btn-primary">Volver al catálogo</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Por favor ingresá tu nombre.");
      return;
    }
    setSending(true);
    try {
      await getBooksRepository().applyOrderStock(items).catch((err) => {
        // Libros de ejemplo / sin conexión: no bloquear el pedido por WhatsApp
        console.warn("[Librería] No se pudo descontar stock:", err);
      });
      openWhatsAppOrder(items, { name: name.trim(), address: address.trim(), notes: notes.trim() }, totalPrice);
      clear();
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`No se pudo confirmar el pedido en stock: ${msg}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-10">
      <Link href="/cart" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted no-underline hover:text-accent">
        <ArrowLeft size={14} aria-hidden="true" /> Volver al carrito
      </Link>
      <h1 className="mb-6 font-display text-3xl font-bold">Confirmar pedido</h1>

      <div className="card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Tu pedido</h2>
        <ul className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <li key={item.book.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <span>
                <span className="font-semibold">{item.book.title}</span>
                <span className="block text-ink-muted">
                  {item.book.author} · {conditionLabel(item.book)} · × {item.quantity}
                </span>
              </span>
              <span className="font-semibold">{formatPrice(item.book.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-4">
          <span className="font-semibold">Total estimado</span>
          <span className="font-display text-2xl font-bold">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 p-5" noValidate>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Tus datos</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="name" className="field-label">Nombre y apellido *</label>
            <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </div>
          <div>
            <label htmlFor="address" className="field-label">Dirección o zona (opcional)</label>
            <input id="address" className="field" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
          </div>
          <div>
            <label htmlFor="notes" className="field-label">Notas (opcional)</label>
            <textarea id="notes" className="field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-[#fbe9ea] px-4 py-3 text-sm text-danger">{error}</p>
        )}
        {isWhatsAppPlaceholder() && (
          <p className="mt-4 rounded-lg bg-paper-2 px-4 py-3 text-xs text-ink-2">
            Modo de prueba: el número de WhatsApp todavía no está configurado (lib/siteConfig.ts).
          </p>
        )}

        <button type="submit" disabled={sending} className="btn-whatsapp mt-5 w-full">
          <MessageCircle size={18} aria-hidden="true" />
          {sending ? "Enviando…" : "Enviar pedido por WhatsApp"}
        </button>
        <p className="mt-3 text-center text-xs text-ink-muted">
          Se abrirá WhatsApp con el detalle. Ahí confirmamos disponibilidad, pago y entrega.
        </p>
      </form>
    </div>
  );
}
