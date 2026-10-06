# Entre Páginas — tienda de libros nuevos y usados

> "Entre Páginas" es un **nombre provisorio**. Se cambia en un solo lugar: `lib/siteConfig.ts`.

Tienda online de libros (nuevos y usados) para San Nicolás de los Arroyos. Catálogo con búsqueda y filtros,
carrito y pedido por WhatsApp, y un panel `/admin` para cargar libros con fotos.

Next.js 14 (App Router) + Tailwind. Datos detrás de **una interfaz** (`lib/data/booksRepository.ts`) con dos adaptadores:

| Proveedor | Para qué | Cómo funciona |
|-----------|----------|---------------|
| `sqlite` (default) | Desarrollo y pruebas locales | Rutas API de Next + `better-sqlite3`. DB en `data/local/libros.db`, fotos en `public/uploads/` |
| `supabase` | Producción posterior | Supabase (Postgres + Storage) desde el navegador, build estático |

Se elige con `NEXT_PUBLIC_DATA_PROVIDER=sqlite|supabase`.

## Correr en local (SQLite)

Requisitos: Node 18+ (probado con Node 22).

```bash
npm install
npm run seed      # crea la DB local y carga ~20 libros de prueba con tapas SVG (idempotente: resetea y recarga)
npm run dev       # http://localhost:3010
```

`.env.local` (ya creado con valores de prueba; plantilla en `.env.example`):

```
NEXT_PUBLIC_DATA_PROVIDER=sqlite
ADMIN_USER=admin
ADMIN_PASSWORD=elegi-una-clave-de-prueba
```

**Login del admin local:** http://localhost:3010/admin — con el usuario y la contraseña que pusiste en `.env.local`.

Otros comandos: `npm run build` (build de producción, modo sqlite) y `npm start` (puerto 3010).

> En modo sqlite las fotos subidas se guardan en `public/uploads/`. Con `npm run dev` se ven al instante;
> con `npm start` solo se sirven si existían al iniciar el servidor. La DB y las subidas están en `.gitignore`.

## Cambiar nombre, WhatsApp, ciudad, redes

Todo en **`lib/siteConfig.ts`**: nombre, eslogan, descripción, número de WhatsApp (formato `5493364XXXXXXX`,
hoy es un placeholder), email, Instagram, ciudad, horarios y dominio por defecto. También se puede definir
`NEXT_PUBLIC_SITE_URL`. Los archivos estáticos `public/sitemap.xml` y `public/robots.txt` tienen el dominio
placeholder `https://entrepaginas.com.ar`: cambialo a mano cuando haya dominio.

La paleta está en variables CSS en `app/globals.css` (papel crema, tinta, bordó).

## Modelo de datos

Tabla `books`: `id, title, author, publisher, isbn, genre, condition (nuevo|usado), condition_detail
(como nuevo|muy bueno|bueno|aceptable; solo usados), price (ARS), stock, images (array de URLs; la primera es la tapa),
description, year, language, pages, featured, active, created_at, updated_at`.
Esquema SQLite: `db/schema.sqlite.sql` (se crea solo en la primera conexión). Esquema Postgres: `supabase/001_books.sql`.
Los nombres de columna son los mismos para que la migración sea 1:1.

## Admin

`/admin`: alta, edición y baja de libros, subida de fotos, destacado y visibilidad. El campo "Estado del ejemplar"
solo aparece para usados.

- **Modo sqlite:** credenciales `ADMIN_USER` / `ADMIN_PASSWORD` verificadas en el servidor (`app/api/admin/login`),
  cookie httpOnly firmada con HMAC (8 h). Las rutas que modifican datos (`POST/PUT/DELETE /api/books`, `/api/upload`)
  exigen esa sesión. Sin esas variables el admin queda deshabilitado (no hay credenciales por defecto).
- **Modo supabase:** el sitio es estático (no hay rutas API), así que el admin inicia sesión con **Supabase Auth**
  (email + contraseña de un usuario creado en Supabase). Ver el aviso de seguridad en `supabase/001_books.sql`.

## Pedido por WhatsApp

Carrito (localStorage, nunca permite más unidades que el stock) → `/checkout` → se abre WhatsApp con título, autor,
condición, cantidad y precio de cada libro (`lib/whatsapp.ts`). Al confirmar se descuenta el stock.

## Pasar a Supabase más adelante

1. Crear el proyecto en Supabase y ejecutar `supabase/001_books.sql` en el SQL Editor (tabla, bucket `book-images`, RLS, 8 libros de ejemplo).
2. Crear un usuario admin en Authentication > Users.
3. Migrar los libros reales: exportar de SQLite y cargarlos en Supabase (ver `PENDIENTES.md`, "Migrar de SQLite a Supabase"). Las fotos de `public/uploads/` hay que subirlas al bucket y actualizar las URLs en `images`.
4. Variables: `NEXT_PUBLIC_DATA_PROVIDER=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. `npm run build:static` (aparta `app/api` durante el build y genera `out/` con `output: 'export'`) y publicar `out/` en un hosting estático.

## Estructura

```
app/               páginas (home, cart, checkout, cuenta, admin) y rutas API (sqlite)
components/        Navbar, Footer, Hero, BookCard, Logo, ContactSection, JsonLd...
data/books.ts      tipo Book, géneros, helpers y catálogo de ejemplo (fallback)
lib/data/          repositorio de libros + adaptadores sqlite y supabase
lib/server/        SOLO servidor: db (better-sqlite3), auth admin, validación
db/                esquema SQLite
scripts/           seed.mjs, build-static.mjs
supabase/          migración Postgres
```
