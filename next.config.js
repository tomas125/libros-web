/** @type {import('next').NextConfig} */
const provider = (process.env.NEXT_PUBLIC_DATA_PROVIDER || "sqlite").trim().toLowerCase();
const isSupabase = provider === "supabase";

const nextConfig = {
  images: { unoptimized: true },

  // sqlite  -> servidor Node (rutas /api/* con better-sqlite3). NO se puede exportar estático.
  // supabase -> export estático (hosting estático; el admin usa Supabase Auth). Las rutas /api/* no existen.
  //            Para build en modo supabase hay que excluir app/api (ver README: `npm run build:static`).
  ...(isSupabase ? { output: "export" } : {}),

  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },

  // `headers()` no es compatible con output: "export"
  ...(isSupabase
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Frame-Options", value: "DENY" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              ],
            },
          ];
        },
      }),
};

module.exports = nextConfig;
