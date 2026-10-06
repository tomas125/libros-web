// lib/server/db.ts
// SOLO servidor. Conexión a SQLite (better-sqlite3) con auto-creación del esquema.
// Archivo: data/local/libros.db (ignorado por git).

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { Book, Condition, ConditionDetail } from "../../data/books";
import { DEFAULT_LANGUAGE } from "../../data/books";

const DB_DIR = path.join(process.cwd(), "data", "local");
const DB_FILE = path.join(DB_DIR, "libros.db");
const SCHEMA_FILE = path.join(process.cwd(), "db", "schema.sqlite.sql");

const g = globalThis as unknown as { __librosDb?: Database.Database };

export function getDb(): Database.Database {
  if (g.__librosDb) return g.__librosDb;
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_FILE);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(fs.readFileSync(SCHEMA_FILE, "utf8"));
  g.__librosDb = db;
  return db;
}

export type BookRow = {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  isbn: string | null;
  genre: string;
  condition: Condition;
  condition_detail: ConditionDetail | null;
  price: number;
  stock: number;
  images: string;
  description: string | null;
  year: number | null;
  language: string | null;
  pages: number | null;
  featured: number;
  active: number;
  created_at: string;
};

export function rowToBook(r: BookRow): Book {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(r.images);
    if (Array.isArray(parsed)) images = parsed.filter((x) => typeof x === "string");
  } catch {
    // images corruptas: se ignoran
  }
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    publisher: r.publisher ?? undefined,
    isbn: r.isbn ?? undefined,
    genre: r.genre,
    condition: r.condition,
    conditionDetail: r.condition === "usado" ? r.condition_detail : null,
    price: r.price,
    stock: r.stock,
    images,
    description: r.description ?? undefined,
    year: r.year ?? undefined,
    language: r.language || DEFAULT_LANGUAGE,
    pages: r.pages ?? undefined,
    featured: r.featured === 1,
    active: r.active === 1,
    createdAt: r.created_at,
  };
}
