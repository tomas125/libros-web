// lib/whatsapp.ts
// Genera el link de WhatsApp con el pedido de libros codificado

import type { CartItem } from "./CartContext";
import { SITE } from "./siteConfig";
import { conditionLabel } from "../data/books";

export const WHATSAPP_NUMBER = SITE.whatsappNumber;
export const CONTACT_EMAIL = SITE.email;
export const INSTAGRAM_URL = SITE.instagramUrl;

export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function formatPrice(n: number): string {
  return `$${Number(n).toLocaleString("es-AR")}`;
}

export type CustomerInfo = {
  name: string;
  address?: string;
  notes?: string;
};

export function buildWhatsAppMessage(
  items: CartItem[],
  customer: CustomerInfo,
  total: number
): string {
  const lines: string[] = [];

  lines.push(`📚 *Nuevo pedido — ${SITE.name}*`);
  lines.push("─────────────────────────");
  lines.push(`*Cliente:* ${customer.name}`);
  if (customer.address) lines.push(`*Dirección/Zona:* ${customer.address}`);
  lines.push("");
  lines.push("*Libros:*");

  for (const item of items) {
    const b = item.book;
    const subtotal = b.price * item.quantity;
    lines.push(`• *${b.title}* — ${b.author}`);
    lines.push(
      `  ${conditionLabel(b)} · ${item.quantity} × ${formatPrice(b.price)} = ${formatPrice(subtotal)}`
    );
  }

  lines.push("");
  lines.push(`*Total estimado:* ${formatPrice(total)}`);
  lines.push("");

  if (customer.notes) {
    lines.push(`*Notas:* ${customer.notes}`);
    lines.push("");
  }

  lines.push("_Por favor confirmar disponibilidad y coordinar entrega/envío._");

  return lines.join("\n");
}

export function openWhatsAppOrder(
  items: CartItem[],
  customer: CustomerInfo,
  total: number
): void {
  const msg = buildWhatsAppMessage(items, customer, total);
  window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
}
