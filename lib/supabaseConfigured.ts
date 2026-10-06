/** True cuando hay credenciales reales de Supabase (no el placeholder de build). */
export function isSupabaseConfigured(): boolean {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  ).trim();
  const looksRealKey = key.startsWith("eyJ") || key.startsWith("sb_publishable_");
  return (
    url.length > 0 &&
    key.length > 0 &&
    !url.includes("placeholder.supabase.co") &&
    key !== "placeholder" &&
    looksRealKey
  );
}
