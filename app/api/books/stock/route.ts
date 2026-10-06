import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/server/db";

export const dynamic = "force-dynamic";

// POST /api/books/stock  { lines: [{ id, quantity }] }
// Público (lo usa el checkout): solo DESCUENTA stock, atómico y nunca por debajo de 0.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { lines?: { id?: unknown; quantity?: unknown }[] } | null;
    if (!body || !Array.isArray(body.lines)) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    const db = getDb();
    const stmt = db.prepare("UPDATE books SET stock = MAX(0, stock - ?) WHERE id = ?");
    const tx = db.transaction((lines: { id: string; qty: number }[]) => {
      for (const l of lines) stmt.run(l.qty, l.id);
    });
    const clean = body.lines
      .map((l) => ({ id: typeof l.id === "string" ? l.id : "", qty: Math.floor(Number(l.quantity)) }))
      .filter((l) => l.id && Number.isFinite(l.qty) && l.qty > 0 && l.qty <= 1000);
    tx(clean);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error interno." }, { status: 500 });
  }
}
