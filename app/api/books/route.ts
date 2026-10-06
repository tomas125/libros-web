import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb, rowToBook, type BookRow } from "../../../lib/server/db";
import { isAdminRequest, requireAdmin } from "../../../lib/server/adminAuth";
import { validateBook } from "../../../lib/server/bookValidation";

export const dynamic = "force-dynamic";

// GET /api/books           -> catálogo público (solo activos)
// GET /api/books?all=1     -> todos (requiere sesión admin)
export async function GET(request: Request) {
  try {
    const all = new URL(request.url).searchParams.get("all") === "1";
    if (all && !isAdminRequest(request)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
    const db = getDb();
    const rows = db
      .prepare(`SELECT * FROM books ${all ? "" : "WHERE active = 1"} ORDER BY created_at DESC, rowid DESC`)
      .all() as BookRow[];
    return NextResponse.json({ books: rows.map(rowToBook) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error interno." }, { status: 500 });
  }
}

// POST /api/books (admin)
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const parsed = validateBook(await request.json().catch(() => null));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;
    const db = getDb();
    const id = randomUUID();
    db.prepare(
      `INSERT INTO books (id, title, author, publisher, isbn, genre, condition, condition_detail, price, stock,
         images, description, year, language, pages, featured, active)
       VALUES (@id, @title, @author, @publisher, @isbn, @genre, @condition, @condition_detail, @price, @stock,
         @images, @description, @year, @language, @pages, @featured, @active)`
    ).run({ id, ...d, images: JSON.stringify(d.images) });
    const row = db.prepare("SELECT * FROM books WHERE id = ?").get(id) as BookRow;
    return NextResponse.json({ book: rowToBook(row) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error interno." }, { status: 500 });
  }
}
