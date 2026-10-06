// lib/server/bookValidation.ts
// Validación/normalización del payload de libros en el servidor.

import { CONDITION_DETAILS, DEFAULT_LANGUAGE, type ConditionDetail } from "../../data/books";

export type CleanBook = {
  title: string;
  author: string;
  publisher: string | null;
  isbn: string | null;
  genre: string;
  condition: "nuevo" | "usado";
  condition_detail: ConditionDetail | null;
  price: number;
  stock: number;
  images: string[];
  description: string | null;
  year: number | null;
  language: string;
  pages: number | null;
  featured: number;
  active: number;
};

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const optStr = (v: unknown, max = 2000) => str(v, max) || null;
const optInt = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : null;
};

export function validateBook(body: unknown): { ok: true; data: CleanBook } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Datos inválidos." };
  const b = body as Record<string, unknown>;

  const title = str(b.title, 300);
  const author = str(b.author, 300);
  if (!title) return { ok: false, error: "El título es obligatorio." };
  if (!author) return { ok: false, error: "El autor es obligatorio." };

  const condition = b.condition === "nuevo" ? "nuevo" : b.condition === "usado" ? "usado" : null;
  if (!condition) return { ok: false, error: "La condición debe ser 'nuevo' o 'usado'." };

  let condition_detail: ConditionDetail | null = null;
  if (condition === "usado") {
    const cd = b.conditionDetail;
    if (cd !== null && cd !== undefined && cd !== "") {
      if (!CONDITION_DETAILS.includes(cd as ConditionDetail)) {
        return { ok: false, error: "Estado del ejemplar inválido." };
      }
      condition_detail = cd as ConditionDetail;
    }
  }

  const price = Number(b.price);
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: "Precio inválido." };
  const stock = Number(b.stock);
  if (!Number.isInteger(stock) || stock < 0) return { ok: false, error: "El stock debe ser un entero >= 0." };

  const images = Array.isArray(b.images)
    ? b.images.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length < 2000).slice(0, 12)
    : [];

  return {
    ok: true,
    data: {
      title,
      author,
      publisher: optStr(b.publisher, 200),
      isbn: optStr(b.isbn, 40),
      genre: str(b.genre, 100) || "Otros",
      condition,
      condition_detail,
      price,
      stock,
      images,
      description: optStr(b.description, 5000),
      year: optInt(b.year),
      language: str(b.language, 60) || DEFAULT_LANGUAGE,
      pages: optInt(b.pages),
      featured: b.featured === true ? 1 : 0,
      active: b.active === false ? 0 : 1,
    },
  };
}
