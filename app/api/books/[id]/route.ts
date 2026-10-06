import { NextResponse } from "next/server";
import { getDb, rowToBook, type BookRow } from "../../../../lib/server/db";
import { isAdminRequest, requireAdmin } from "../../../../lib/server/adminAuth";
import { validateBook } from "../../../../lib/server/bookValidation";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

const fail = (e: unknown) =>
  NextResponse.json({ error: e instanceof Error ? e.message : "Error interno." }, { status: 500 });

export async function GET(request: Request, { params }: Ctx) {
  try {
    const row = getDb().prepare("SELECT * FROM books WHERE id = ?").get(params.id) as BookRow | undefined;
    if (!row || (row.active !== 1 && !isAdminRequest(request))) {
      return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    }
    return NextResponse.json({ book: rowToBook(row) });
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const parsed = validateBook(await request.json().catch(() => null));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;
    const db = getDb();
    const info = db
      .prepare(
        `UPDATE books SET title=@title, author=@author, publisher=@publisher, isbn=@isbn, genre=@genre,
           condition=@condition, condition_detail=@condition_detail, price=@price, stock=@stock, images=@images,
           description=@description, year=@year, language=@language, pages=@pages, featured=@featured,
           active=@active, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
         WHERE id=@id`
      )
      .run({ id: params.id, ...d, images: JSON.stringify(d.images) });
    if (info.changes === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    const row = db.prepare("SELECT * FROM books WHERE id = ?").get(params.id) as BookRow;
    return NextResponse.json({ book: rowToBook(row) });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const info = getDb().prepare("DELETE FROM books WHERE id = ?").run(params.id);
    if (info.changes === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
