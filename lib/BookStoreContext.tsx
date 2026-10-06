"use client";
// lib/BookStoreContext.tsx
// Estado global de libros (vía el repositorio de datos) con fallback al catálogo local de ejemplo.

import React, { createContext, useContext, useEffect, useState } from "react";
import { getBooksRepository } from "./data/booksRepository";
import { FALLBACK_BOOKS, type Book } from "../data/books";

type BookStoreCtx = {
  books: Book[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const BookStoreContext = createContext<BookStoreCtx>({
  books: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

export function BookStoreProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setBooks(await getBooksRepository().listBooks());
    } catch (e) {
      console.warn("[Librería] Fuente de datos no disponible, usando catálogo de ejemplo:", e);
      setError("Sin conexión con la base de datos. Mostrando catálogo de ejemplo.");
      setBooks(FALLBACK_BOOKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <BookStoreContext.Provider value={{ books, loading, error, refresh: load }}>
      {children}
    </BookStoreContext.Provider>
  );
}

export function useBookStore() {
  return useContext(BookStoreContext);
}
