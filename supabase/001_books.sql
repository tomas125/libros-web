-- Entre Páginas (nombre provisorio) — migración consolidada
-- Ejecutar en Supabase: SQL Editor -> New query -> pegar todo -> Run. Es re-ejecutable.
--
-- Crea: tabla `books`, bucket de imágenes `book-images`, políticas RLS, función de descuento de stock
-- y 8 libros de ejemplo (borrarlos desde /admin cuando cargues los reales).
--
-- NOTA DE SEGURIDAD:
--   Con NEXT_PUBLIC_DATA_PROVIDER=supabase el sitio es estático y el panel /admin inicia sesión con Supabase Auth
--   (creá un usuario admin en Authentication > Users). Pero las políticas de escritura de abajo siguen abiertas a
--   `anon` (mismo enfoque que el proyecto original): cualquiera con la clave pública podría escribir datos.
--   TODO (ver PENDIENTES.md): reemplazar books_anon_insert/update/delete y las de storage por políticas
--   "to authenticated" una vez creado el usuario admin.

create table if not exists public.books (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  author           text not null,
  publisher        text,
  isbn             text,
  genre            text not null default 'Otros',
  condition        text not null default 'usado' check (condition in ('nuevo', 'usado')),
  condition_detail text check (condition_detail in ('como nuevo', 'muy bueno', 'bueno', 'aceptable')),
  price            numeric(12,2) not null default 0 check (price >= 0),
  stock            integer not null default 1 check (stock >= 0),
  images           text[] not null default '{}',
  description      text,
  year             integer,
  language         text not null default 'Español',
  pages            integer,
  featured         boolean not null default false,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- condition_detail solo aplica a usados
  constraint books_condition_detail_chk check (condition = 'usado' or condition_detail is null)
);

create index if not exists books_created_at_idx on public.books (created_at desc);
create index if not exists books_active_idx on public.books (active);
create index if not exists books_genre_idx on public.books (genre);
create index if not exists books_condition_idx on public.books (condition);

-- updated_at automático
create or replace function public.books_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row
  execute procedure public.books_set_updated_at();

-- Descuento de stock atómico (lo usa el checkout). Nunca baja de 0.
create or replace function public.decrement_book_stock(p_book_id uuid, p_qty integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.books
     set stock = greatest(0, stock - greatest(p_qty, 0))
   where id = p_book_id;
$$;

grant execute on function public.decrement_book_stock(uuid, integer) to anon, authenticated;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.books enable row level security;

drop policy if exists "books_public_select" on public.books;
drop policy if exists "books_anon_insert" on public.books;
drop policy if exists "books_anon_update" on public.books;
drop policy if exists "books_anon_delete" on public.books;

-- Lectura pública
create policy "books_public_select"
  on public.books for select
  to anon, authenticated
  using (true);

-- Escritura (ver nota de seguridad arriba)
create policy "books_anon_insert"
  on public.books for insert
  to anon, authenticated
  with check (true);

create policy "books_anon_update"
  on public.books for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "books_anon_delete"
  on public.books for delete
  to anon, authenticated
  using (true);

-- ── Storage: imágenes de tapas ──────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('book-images', 'book-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "book_images_public_read" on storage.objects;
drop policy if exists "book_images_anon_insert" on storage.objects;
drop policy if exists "book_images_anon_update" on storage.objects;
drop policy if exists "book_images_anon_delete" on storage.objects;

create policy "book_images_public_read"
  on storage.objects for select
  using (bucket_id = 'book-images');

create policy "book_images_anon_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'book-images');

create policy "book_images_anon_update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'book-images')
  with check (bucket_id = 'book-images');

create policy "book_images_anon_delete"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'book-images');

-- ── Libros de ejemplo (solo si la tabla está vacía) ─────────────────────────
insert into public.books
  (title, author, publisher, isbn, genre, condition, condition_detail, price, stock, description, year, language, pages, featured)
select * from (values
  ('Cien años de soledad', 'Gabriel García Márquez', 'Sudamericana', '9789500755924', 'Novela', 'nuevo', null::text, 24500::numeric, 4, 'La saga de los Buendía en Macondo. Edición de bolsillo.', 2007, 'Español', 471, true),
  ('El Principito', 'Antoine de Saint-Exupéry', 'Emecé', '9789500427760', 'Infantil', 'nuevo', null, 12900, 6, 'El clásico de la literatura universal con las ilustraciones originales.', 2014, 'Español', 96, true),
  ('Ficciones', 'Jorge Luis Borges', 'Debolsillo', null, 'Novela', 'usado', 'muy bueno', 8500, 1, 'Cuentos fundamentales de Borges. Ejemplar con mínimas marcas de uso.', 2011, 'Español', 192, true),
  ('Los siete pilares de la sabiduría', 'T. E. Lawrence', 'Booket', null, 'Biografías', 'usado', 'bueno', 6000, 1, 'Memorias de la Revuelta Árabe. Tapa con desgaste leve.', 2005, 'Español', 780, false),
  ('Harry Potter y la piedra filosofal', 'J. K. Rowling', 'Salamandra', '9788478884957', 'Juvenil', 'usado', 'como nuevo', 11000, 1, 'Primer libro de la saga. Prácticamente sin uso.', 2015, 'Español', 256, true),
  ('El poder del hábito', 'Charles Duhigg', 'Urano', null, 'Autoayuda', 'nuevo', null, 19800, 3, 'Por qué hacemos lo que hacemos en la vida y en las empresas.', 2019, 'Español', 400, false),
  ('El libro de Doña Petrona', 'Petrona C. de Gandulfo', 'Atlántida', null, 'Cocina', 'usado', 'aceptable', 5500, 1, 'Recetario clásico. Hojas amarillentas, lomo firme.', 1990, 'Español', 600, false),
  ('Martín Fierro', 'José Hernández', 'Kapelusz', null, 'Escolar/Texto', 'nuevo', null, 9800, 0, 'Edición escolar con notas y vocabulario.', 2018, 'Español', 220, false)
) as v(title, author, publisher, isbn, genre, condition, condition_detail, price, stock, description, year, language, pages, featured)
where not exists (select 1 from public.books);
