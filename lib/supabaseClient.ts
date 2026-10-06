// lib/supabaseClient.ts
// Solo se usa con NEXT_PUBLIC_DATA_PROVIDER=supabase (y para cuentas de clientes si Supabase está configurado).
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
/** Clave pública: JWT `anon` legacy o clave nueva `sb_publishable_…`. */
const supabasePublicKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
).trim();

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabasePublicKey || "placeholder"
);
