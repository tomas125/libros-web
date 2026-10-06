import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfig, isAdminRequest, makeToken, safeEqual } from "../../../../lib/server/adminAuth";

// Corre en el servidor (modo sqlite / Vercel). No existe en el build estático de modo supabase.
// Credenciales SOLO por variables de entorno (ver .env.example).

export const dynamic = "force-dynamic";

// POST /api/admin/login: verifica credenciales y setea cookie httpOnly
export async function POST(request: Request) {
  const cfg = adminConfig();
  if (!cfg.ok) {
    return NextResponse.json(
      { error: "Admin no configurado. Definí ADMIN_USER y ADMIN_PASSWORD en .env.local." },
      { status: 503 }
    );
  }

  let body: { username?: unknown; password?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  const userOk = safeEqual(username, cfg.user);
  const passOk = safeEqual(password, cfg.pass);
  if (!userOk || !passOk) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(cfg.user, cfg.secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 horas
    path: "/",
  });
  return res;
}

// GET /api/admin/login: ¿la sesión activa es válida?
export async function GET(request: Request) {
  return isAdminRequest(request)
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false }, { status: 401 });
}
