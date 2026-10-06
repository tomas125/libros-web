// lib/server/adminAuth.ts
// SOLO servidor. Sesión admin por cookie httpOnly firmada con HMAC.
// Credenciales por entorno: ADMIN_USER, ADMIN_PASSWORD (y opcional ADMIN_SECRET para firmar;
// si falta se deriva de ADMIN_PASSWORD). Sin valores por defecto: si faltan, el admin queda deshabilitado.

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_token";

export function adminConfig() {
  const user = process.env.ADMIN_USER ?? "";
  const pass = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SECRET || pass;
  return { user, pass, secret, ok: Boolean(user && pass) };
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function makeToken(user: string, secret: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret).update(`${user}:${day}`).digest("hex");
}

export function isAdminRequest(request: Request): boolean {
  const cfg = adminConfig();
  if (!cfg.ok) return false;
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  const token = match?.[1];
  if (!token) return false;
  return safeEqual(token, makeToken(cfg.user, cfg.secret));
}

/** Devuelve una respuesta 401 si no hay sesión admin; null si está todo bien. */
export function requireAdmin(request: Request): NextResponse | null {
  if (isAdminRequest(request)) return null;
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}
