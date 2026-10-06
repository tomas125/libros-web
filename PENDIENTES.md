# Pendientes

| # | Pendiente | Detalle | Estado |
|---|-----------|---------|--------|
| 1 | Nombre definitivo de la librería | Cambiar `SITE.name` y `tagline` en `lib/siteConfig.ts`; revisar `public/sitemap.xml` y `robots.txt` | Pendiente |
| 2 | Logo | Hoy hay un ícono SVG provisorio (`components/Logo.tsx`, `public/assets/logo.svg`) | Pendiente |
| 3 | Número de WhatsApp real | `SITE.whatsappNumber` en `lib/siteConfig.ts` (hoy `5493364XXXXXXX`) | Pendiente |
| 4 | Instagram / email / horarios | `lib/siteConfig.ts` | Pendiente |
| 5 | Migrar de SQLite a Supabase | Ver pasos abajo | Pendiente |
| 6 | Dominio | Hoy placeholder `entrepaginas.com.ar`; definir dominio, `NEXT_PUBLIC_SITE_URL`, sitemap y robots | Pendiente |
| 7 | Endurecer admin / RLS | En Supabase las políticas de escritura de `books` y del bucket están abiertas a `anon`: restringirlas a `authenticated` (usuario admin de Supabase Auth). En sqlite, cambiar `ADMIN_PASSWORD` de prueba | Pendiente |
| 8 | Cargar libros reales con fotos | Borrar los libros de prueba (`npm run seed` es solo para pruebas) | Pendiente |
| 9 | Hosting | Modo sqlite necesita servidor Node con disco persistente; modo supabase, hosting estático (`npm run build:static`) | Pendiente |

## Migrar de SQLite a Supabase

1. Crear el proyecto en Supabase y ejecutar `supabase/001_books.sql` en el SQL Editor (omitir los libros de ejemplo si no se quieren).
2. Authentication > Users: crear el usuario admin (email + contraseña). Ese usuario inicia sesión en `/admin` en modo supabase.
3. Exportar los libros de `data/local/libros.db` (por ejemplo `sqlite3 -csv -header data/local/libros.db "select * from books" > books.csv`). Convertir `images` (JSON) a array Postgres, `featured`/`active` (0/1) a boolean, e importar la CSV desde Table Editor > Import (mismos nombres de columna).
4. Subir las fotos de `public/uploads/` al bucket `book-images` y reemplazar las rutas `/uploads/...` de la columna `images` por las URLs públicas del bucket.
5. Completar `.env.local`: `NEXT_PUBLIC_DATA_PROVIDER=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
6. Probar con `npm run dev`, luego `npm run build:static` y publicar la carpeta `out/`.
7. Endurecer RLS (pendiente 7).
