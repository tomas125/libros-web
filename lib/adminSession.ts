// Autenticación del panel admin, según el proveedor de datos:
//  - sqlite:   cookie httpOnly emitida por /api/admin/login (credenciales ADMIN_USER / ADMIN_PASSWORD en el servidor).
//  - supabase: build estático (sin rutas API) -> el admin inicia sesión con Supabase Auth (email + contraseña
//              de un usuario creado en el panel de Supabase). TODO: restringir las políticas RLS a ese usuario.

import { getDataProvider } from "./data/booksRepository";
import { supabase } from "./supabaseClient";
import { isSupabaseConfigured } from "./supabaseConfigured";

const useSupabaseAuth = () => getDataProvider() === "supabase";

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (useSupabaseAuth()) {
    if (!isSupabaseConfigured()) return { ok: false, error: "Supabase no está configurado." };
    const { error } = await supabase.auth.signInWithPassword({ email: username.trim(), password });
    return error ? { ok: false, error: "Email o contraseña incorrectos." } : { ok: true };
  }
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true } : { ok: false, error: data.error ?? "Error al iniciar sesión." };
  } catch {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  if (useSupabaseAuth()) {
    if (!isSupabaseConfigured()) return false;
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  }
  try {
    const res = await fetch("/api/admin/login", { method: "GET", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  if (useSupabaseAuth()) {
    await supabase.auth.signOut();
    return;
  }
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } catch {
    // ignore
  }
}
