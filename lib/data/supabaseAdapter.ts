// lib/data/supabaseAdapter.ts
// Adaptador Supabase del repositorio de libros (para la migración posterior desde SQLite).
// Mapea filas de la tabla `books` <-> objetos Book. Ver supabase/001_books.sql.

import { supabase } from "../supabaseClient";
import { isSupabaseConfigured } from "../supabaseConfigured";
import type { Book, Condition, ConditionDetail } from "../../data/books";
import { DEFAULT_LANGUAGE } from "../../data/books";
import type { BooksRepository, BookInput, StockLine } from "./booksRepository";

/** Debe coincidir con el bucket creado en `supabase/001_books.sql`. */
export const BOOK_IMAGES_BUCKET = "book-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type DbRow = {
  id: string;
  title: string;
  author: string;
  publisher?: string | null;
  isbn?: string | null;
  genre: string;
  condition: Condition;
  condition_detail?: ConditionDetail | null;
  price: number;
  stock: number;
  images?: string[] | null;
  description?: string | null;
  year?: number | null;
  language?: string | null;
  pages?: number | null;
  featured?: boolean;
  active?: boolean;
  created_at?: string;
};

function rowToBook(row: DbRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    publisher: row.publisher ?? undefined,
    isbn: row.isbn ?? undefined,
    genre: row.genre,
    condition: row.condition,
    conditionDetail: row.condition === "usado" ? row.condition_detail ?? null : null,
    price: Number(row.price),
    stock: row.stock,
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description ?? undefined,
    year: row.year ?? undefined,
    language: row.language || DEFAULT_LANGUAGE,
    pages: row.pages ?? undefined,
    featured: row.featured === true,
    active: row.active,
    createdAt: row.created_at,
  };
}

function bookToRow(b: BookInput) {
  return {
    title: b.title.trim(),
    author: b.author.trim(),
    publisher: b.publisher?.trim() || null,
    isbn: b.isbn?.trim() || null,
    genre: b.genre,
    condition: b.condition,
    condition_detail: b.condition === "usado" ? b.conditionDetail ?? null : null,
    price: b.price,
    stock: b.stock,
    images: b.images ?? [],
    description: b.description?.trim() || null,
    year: b.year ?? null,
    language: b.language?.trim() || DEFAULT_LANGUAGE,
    pages: b.pages ?? null,
    featured: b.featured ?? false,
    active: b.active ?? true,
  };
}

function requireConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado (NEXT_PUBLIC_SUPABASE_URL / clave pública).");
  }
}

export const supabaseAdapter: BooksRepository = {
  async listBooks(opts) {
    requireConfigured();
    let q = supabase.from("books").select("*");
    if (!opts?.includeInactive) q = q.eq("active", true);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as DbRow[]).map(rowToBook);
  },

  async getBook(id) {
    requireConfigured();
    const { data, error } = await supabase.from("books").select("*").eq("id", id).single();
    if (error) return null;
    return rowToBook(data as DbRow);
  },

  async createBook(input) {
    requireConfigured();
    const { data, error } = await supabase.from("books").insert(bookToRow(input)).select().single();
    if (error) throw new Error(error.message);
    return rowToBook(data as DbRow);
  },

  async updateBook(id, input) {
    requireConfigured();
    const { data, error } = await supabase
      .from("books")
      .update(bookToRow(input))
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToBook(data as DbRow);
  },

  async deleteBook(id) {
    requireConfigured();
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async uploadCover(file: File) {
    requireConfigured();
    if (!file || file.size === 0) throw new Error("Elegí un archivo válido");
    if (file.size > MAX_BYTES) throw new Error("La imagen supera 5 MB");
    if (!ALLOWED_TYPES.has(file.type)) throw new Error("Formato no permitido. Usá JPG, PNG, WebP o GIF");

    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1] || "img";
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const path = `books/${id}.${ext}`;

    const { error } = await supabase.storage.from(BOOK_IMAGES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) {
      throw new Error(
        error.message.includes("Bucket not found")
          ? `No existe el bucket "${BOOK_IMAGES_BUCKET}" en Supabase. Ejecutá supabase/001_books.sql en el SQL Editor.`
          : error.message
      );
    }
    return supabase.storage.from(BOOK_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
  },

  /** Usa la función SQL `decrement_book_stock` (atómica). Ignora ids "fallback-*". */
  async applyOrderStock(lines: StockLine[]) {
    requireConfigured();
    for (const line of lines) {
      const id = line?.book?.id;
      if (!id || id.startsWith("fallback-")) continue;
      const qty = Math.floor(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      const { error } = await supabase.rpc("decrement_book_stock", { p_book_id: id, p_qty: qty });
      if (error) throw new Error(error.message);
    }
  },
};
