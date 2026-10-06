import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "../../../lib/server/adminAuth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// POST /api/upload (admin, multipart "file") -> { url: "/uploads/<uuid>.<ext>" }
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Elegí un archivo válido." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "La imagen supera 5 MB." }, { status: 400 });
    const ext = EXT[file.type];
    if (!ext) return NextResponse.json({ error: "Formato no permitido. Usá JPG, PNG, WebP o GIF." }, { status: 400 });

    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error interno." }, { status: 500 });
  }
}
