import { BookOpen, Recycle, MessageCircle, Truck } from "lucide-react";

const ITEMS = [
  { Icon: BookOpen, title: "Nuevos y usados", body: "Condición siempre indicada" },
  { Icon: Recycle, title: "Segunda vida", body: "Usados a mejor precio" },
  { Icon: MessageCircle, title: "Pedido por WhatsApp", body: "Atención personalizada" },
  { Icon: Truck, title: "Retiro o envío", body: "Coordinamos con vos" },
];

export default function TrustBar() {
  return (
    <section aria-label="Beneficios" className="border-b border-line bg-paper">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
        {ITEMS.map(({ Icon, title, body }) => (
          <li key={title} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon size={20} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-xs text-ink-muted">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
