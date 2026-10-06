// lib/data/booksRepository.ts
// PUERTO de datos de libros. La UI y los contextos usan SOLO esta interfaz.
// Adaptadores:
//   - sqlite   -> lib/data/sqliteClientAdapter.ts (llama a /api/books, /api/upload; DB local con better-sqlite3)
//   - supabase -> lib/data/supabaseAdapter.ts      (Supabase directo desde el navegador)
// Se elige con NEXT_PUBLIC_DATA_PROVIDER=sqlite|supabase (default: sqlite).

import type { Book } from "../../data/books";
import { sqliteClientAdapter } from "./sqliteClientAdapter";
import { supabaseAdapter } from "./supabaseAdapter";

export type BookInput = Omit<Book, "id" | "createdAt">;

export type StockLine = { book: { id: string }; quantity: number };

export interface BooksRepository {
  /** Catálogo público (solo libros activos) o, con includeInactive, todos (admin). */
  listBooks(opts?: { includeInactive?: boolean }): Promise<Book[]>;
  getBook(id: string): Promise<Book | null>;
  createBook(input: BookInput): Promise<Book>;
  updateBook(id: string, input: BookInput): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  /** Sube una tapa y devuelve la URL pública para guardar en `images`. */
  uploadCover(file: File): Promise<string>;
  /** Descuenta stock de los ítems del pedido (nunca baja de 0). */
  applyOrderStock(lines: StockLine[]): Promise<void>;
}

export type DataProvider = "sqlite" | "supabase";

export function getDataProvider(): DataProvider {
  const raw = (process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "sqlite").trim().toLowerCase();
  return raw === "supabase" ? "supabase" : "sqlite";
}

export function getBooksRepository(): BooksRepository {
  return getDataProvider() === "supabase" ? supabaseAdapter : sqliteClientAdapter;
}
