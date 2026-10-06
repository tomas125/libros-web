# Changelog

## 2026-10-06

### Tapas estáticas versionadas
- Las tapas de prueba ahora se generan en `public/covers/` (se suben al repo) en lugar de `public/uploads/seed/` (ignorada).
- Los 8 libros de respaldo de `data/books.ts` usan esas tapas, así se ven aunque no haya base de datos.

### Conversión de tienda 3D a librería "Entre Páginas" (nombre provisorio)
- Base: tienda Next.js 14 de impresión 3D. Se eliminaron `app/servicios/*`, `app/articulos/*`, `SEO/`, verificaciones `google*.html`, logos y `netlify.toml` (el proyecto necesita servidor, no es export estático en modo sqlite).
- Identidad centralizada en `lib/siteConfig.ts` (nombre, eslogan, WhatsApp placeholder, ciudad, redes, dominio).
- Modelo `Product` reemplazado por `Book` (título, autor, editorial, ISBN, género, condición nuevo/usado + estado del ejemplar, precio, stock, imágenes, descripción, año, idioma, páginas, destacado).
- Catálogo con búsqueda por título/autor/ISBN, filtros por género y condición, orden por precio/recientes. Tarjeta con tapa 2:3, badge Nuevo/Usado, "Sin stock". El carrito no permite superar el stock.
- Pedido por WhatsApp adaptado a libros (título, autor, condición, cantidad, precio).
- Nuevo diseño: papel crema, tinta, bordó; Playfair Display + Inter; logo SVG provisorio.
- Admin reescrito para libros (varias fotos, estado del ejemplar solo en usados).
- SEO/JSON-LD (`BookStore`), FAQ, sitemap y robots con dominio placeholder `https://entrepaginas.com.ar`.
- `supabase/001_books.sql`: tabla `books`, bucket `book-images`, RLS, función `decrement_book_stock` y 8 libros de ejemplo.

### Capa de datos intercambiable: SQLite local o Supabase
- Interfaz única `lib/data/booksRepository.ts` (listBooks, getBook, createBook, updateBook, deleteBook, uploadCover, applyOrderStock) con adaptadores `sqlite` (rutas API + better-sqlite3) y `supabase`. Selección por `NEXT_PUBLIC_DATA_PROVIDER` (default `sqlite`).
- `db/schema.sqlite.sql` con las mismas columnas que Postgres; se crea solo en la primera conexión (`data/local/libros.db`).
- `npm run seed`: 20 libros de prueba con tapas SVG locales (idempotente).
- Subida de tapas a `public/uploads/`.
- Auth admin en sqlite: `ADMIN_USER` / `ADMIN_PASSWORD` por entorno, cookie httpOnly firmada, comparación en tiempo constante; las rutas de escritura exigen sesión. Se descartan las credenciales hardcodeadas del proyecto original.
- `next.config.js`: `output: 'export'` solo con proveedor supabase; `better-sqlite3` como paquete externo. `npm run build:static` para el build estático.
- `npm run dev` corre en el puerto 3010.
