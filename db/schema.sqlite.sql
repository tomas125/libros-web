-- Esquema SQLite local. Mismos nombres de columna que la tabla Postgres `books`
-- (supabase/001_books.sql) para que la migración a Supabase sea 1:1.
-- Diferencias de tipo: id TEXT (uuid), images = JSON en TEXT, booleanos = INTEGER 0/1,
-- created_at/updated_at = TEXT ISO 8601 (UTC).

CREATE TABLE IF NOT EXISTS books (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  publisher        TEXT,
  isbn             TEXT,
  genre            TEXT NOT NULL DEFAULT 'Otros',
  condition        TEXT NOT NULL DEFAULT 'usado' CHECK (condition IN ('nuevo', 'usado')),
  condition_detail TEXT CHECK (condition_detail IN ('como nuevo', 'muy bueno', 'bueno', 'aceptable')),
  price            REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock            INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  images           TEXT NOT NULL DEFAULT '[]',
  description      TEXT,
  year             INTEGER,
  language         TEXT NOT NULL DEFAULT 'Español',
  pages            INTEGER,
  featured         INTEGER NOT NULL DEFAULT 0,
  active           INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (condition = 'usado' OR condition_detail IS NULL)
);

CREATE INDEX IF NOT EXISTS books_created_at_idx ON books (created_at DESC);
CREATE INDEX IF NOT EXISTS books_active_idx ON books (active);
CREATE INDEX IF NOT EXISTS books_genre_idx ON books (genre);
CREATE INDEX IF NOT EXISTS books_condition_idx ON books (condition);
