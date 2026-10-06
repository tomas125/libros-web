// lib/data/sqliteClientAdapter.ts
// Adaptador "sqlite": corre en el navegador y habla con las rutas API de Next
// (app/api/books/*, app/api/upload), que usan better-sqlite3 en el servidor.

import type { Book } from "../../data/books";
import type { BooksRepository, BookInput, StockLine } from "./booksRepository";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin", ...init });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin JSON
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const sqliteClientAdapter: BooksRepository = {
  async listBooks(opts) {
    const qs = opts?.includeInactive ? "?all=1" : "";
    const { books } = await api<{ books: Book[] }>(`/api/books${qs}`, { cache: "no-store" });
    return books;
  },

  async getBook(id) {
    try {
      const { book } = await api<{ book: Book }>(`/api/books/${encodeURIComponent(id)}`, { cache: "no-store" });
      return book;
    } catch {
      return null;
    }
  },

  async createBook(input: BookInput) {
    const { book } = await api<{ book: Book }>("/api/books", json("POST", input));
    return book;
  },

  async updateBook(id, input: BookInput) {
    const { book } = await api<{ book: Book }>(`/api/books/${encodeURIComponent(id)}`, json("PUT", input));
    return book;
  },

  async deleteBook(id) {
    await api<{ ok: true }>(`/api/books/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  async uploadCover(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const { url } = await api<{ url: string }>("/api/upload", { method: "POST", body: fd });
    return url;
  },

  async applyOrderStock(lines: StockLine[]) {
    const payload = lines
      .filter((l) => l?.book?.id && !l.book.id.startsWith("fallback-"))
      .map((l) => ({ id: l.book.id, quantity: Math.floor(l.quantity) }));
    if (payload.length === 0) return;
    await api<{ ok: true }>("/api/books/stock", json("POST", { lines: payload }));
  },
};
