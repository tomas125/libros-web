"use client";
// lib/CartContext.tsx
// Carrito persistido en localStorage. Nunca permite cantidad > stock.

import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import type { Book } from "../data/books";
import { maxOrderQuantity } from "../data/books";

const CART_STORAGE_KEY = "libros_cart";

export type CartItem = {
  book: Book;
  quantity: number;
};

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD"; book: Book; quantity?: number }
  | { type: "REMOVE"; bookId: string }
  | { type: "UPDATE_QTY"; bookId: string; quantity: number }
  | { type: "REPLACE"; state: CartState }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const qty = action.quantity ?? 1;
      const cap = maxOrderQuantity(action.book);
      if (cap <= 0) return state;
      const existing = state.items.find((i) => i.book.id === action.book.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.book.id === action.book.id
              ? { ...i, book: action.book, quantity: Math.min(i.quantity + qty, cap) }
              : i
          ),
        };
      }
      return { items: [...state.items, { book: action.book, quantity: Math.min(qty, cap) }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.book.id !== action.bookId) };
    case "UPDATE_QTY": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.book.id !== action.bookId) };
      }
      return {
        items: state.items.flatMap((i) => {
          if (i.book.id !== action.bookId) return [i];
          const q = Math.min(action.quantity, maxOrderQuantity(i.book));
          return q <= 0 ? [] : [{ ...i, quantity: q }];
        }),
      };
    }
    case "REPLACE":
      return action.state;
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type CartCtx = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  add: (book: Book, quantity?: number) => void;
  remove: (bookId: string) => void;
  updateQty: (bookId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx>({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  add: () => {},
  remove: () => {},
  updateQty: () => {},
  clear: () => {},
});

function isValidState(parsed: unknown): parsed is CartState {
  if (!parsed || typeof parsed !== "object") return false;
  const items = (parsed as CartState).items;
  return (
    Array.isArray(items) &&
    items.every((i) => i && i.book && typeof i.book.id === "string" && typeof i.quantity === "number")
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);

  // Cargar el carrito luego del montaje evita hydration mismatch SSR/CSR.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isValidState(parsed)) dispatch({ type: "REPLACE", state: parsed });
      }
    } catch {
      // Ignora JSON corrupto o storage bloqueado.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignora fallos de escritura (modo privado / storage bloqueado).
    }
  }, [state, hydrated]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalPrice,
        add: (b, q) => dispatch({ type: "ADD", book: b, quantity: q }),
        remove: (id) => dispatch({ type: "REMOVE", bookId: id }),
        updateQty: (id, q) => dispatch({ type: "UPDATE_QTY", bookId: id, quantity: q }),
        clear: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
