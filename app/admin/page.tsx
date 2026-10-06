"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LogIn, LogOut, Plus, Pencil, Trash2, Save, X,
  Loader2, RefreshCw, Star, EyeOff, Upload,
} from "lucide-react";
import { loginAdmin, verifyAdminSession, logoutAdmin } from "../../lib/adminSession";
import { getBooksRepository, getDataProvider, type BookInput } from "../../lib/data/booksRepository";
import {
  GENRES,
  CONDITION_DETAILS,
  DEFAULT_LANGUAGE,
  type Book,
  type Condition,
  type ConditionDetail,
} from "../../data/books";
import { formatPrice } from "../../lib/whatsapp";
import { BookCover } from "../../components/BookCard";

const EMPTY_FORM: BookInput = {
  title: "",
  author: "",
  publisher: "",
  isbn: "",
  genre: "Novela",
  condition: "usado",
  conditionDetail: "bueno",
  price: 0,
  stock: 1,
  images: [],
  description: "",
  year: undefined,
  language: DEFAULT_LANGUAGE,
  pages: undefined,
  featured: false,
  active: true,
};

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => { window.clearTimeout(t); resolve(v); },
      (e) => { window.clearTimeout(t); reject(e); }
    );
  });
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<Book | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BookInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Book | null>(null);

  useEffect(() => {
    verifyAdminSession().then((ok) => {
      if (ok) setLoggedIn(true);
      setChecking(false);
    });
  }, []);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await withTimeout(
        getBooksRepository().listBooks({ includeInactive: true }),
        25000,
        "Tiempo de espera al conectar con Supabase. Revisá la URL, la clave pública y tu red."
      );
      setBooks(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const rls = /row-level security|RLS|permission denied|42501/i.test(msg);
      const missingTable = /does not exist|Could not find the table|schema cache/i.test(msg);
      setError(
        getDataProvider() === "sqlite"
          ? "No se pudo leer la base de datos local: " + msg
          : missingTable
            ? "No existe la tabla public.books en Supabase. Ejecutá supabase/001_books.sql en el SQL Editor."
            : rls
              ? "Supabase rechazó la lectura (RLS). Ejecutá supabase/001_books.sql del repo."
              : "No se pudo cargar el catálogo: " + msg
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) loadBooks();
  }, [loggedIn, loadBooks]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const result = await loginAdmin(username, password);
    setLoginLoading(false);
    if (!result.ok) {
      setLoginError(result.error ?? "Usuario o contraseña incorrectos.");
      return;
    }
    setPassword("");
    setLoggedIn(true);
  }

  async function handleLogout() {
    await logoutAdmin();
    setLoggedIn(false);
    setBooks([]);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(b: Book) {
    setForm({
      title: b.title,
      author: b.author,
      publisher: b.publisher ?? "",
      isbn: b.isbn ?? "",
      genre: b.genre,
      condition: b.condition,
      conditionDetail: b.condition === "usado" ? b.conditionDetail ?? "bueno" : null,
      price: b.price,
      stock: b.stock,
      images: b.images ?? [],
      description: b.description ?? "",
      year: b.year,
      language: b.language || DEFAULT_LANGUAGE,
      pages: b.pages,
      featured: b.featured,
      active: b.active ?? true,
    });
    setEditing(b);
    setCreating(false);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  async function handleSave() {
    if (!form.title.trim()) { alert("El título es obligatorio."); return; }
    if (!form.author.trim()) { alert("El autor es obligatorio."); return; }
    if (!(form.price >= 0)) { alert("El precio no puede ser negativo."); return; }
    if (!(form.stock >= 0) || !Number.isInteger(form.stock)) { alert("El stock debe ser un número entero mayor o igual a 0."); return; }
    setSaving(true);
    try {
      if (creating) await getBooksRepository().createBook(form);
      else if (editing) await getBooksRepository().updateBook(editing.id, form);
      await loadBooks();
      closeForm();
    } catch (e) {
      alert("Error al guardar: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await getBooksRepository().deleteBook(id);
      setDeleteConfirm(null);
      await loadBooks();
    } catch (e) {
      alert("Error al eliminar: " + (e as Error).message);
    }
  }

  // ── Login ──────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex justify-center py-24 text-accent" role="status" aria-label="Cargando">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <form onSubmit={handleLogin} className="card grid gap-4 p-7">
          <h1 className="font-display text-2xl font-bold">Panel de administración</h1>
          <div>
            <label htmlFor="adm-user" className="field-label">{getDataProvider() === "supabase" ? "Email" : "Usuario"}</label>
            <input id="adm-user" className="field" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </div>
          <div>
            <label htmlFor="adm-pass" className="field-label">Contraseña</label>
            <input id="adm-pass" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {loginError && <p role="alert" className="rounded-lg bg-[#fbe9ea] px-3 py-2 text-sm text-danger">{loginError}</p>}
          <button type="submit" disabled={loginLoading} className="btn-primary">
            {loginLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />}
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  const formOpen = creating || editing !== null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto font-display text-3xl font-bold">Libros ({books.length})</h1>
        <button type="button" onClick={loadBooks} className="btn-secondary" disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" /> Actualizar
        </button>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus size={16} aria-hidden="true" /> Nuevo libro
        </button>
        <button type="button" onClick={handleLogout} className="btn-secondary">
          <LogOut size={16} aria-hidden="true" /> Salir
        </button>
      </div>

            {error && (
        <p role="alert" className="mt-4 rounded-lg bg-[#fbe9ea] px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {/* Listado */}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-paper-2 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="p-3">Libro</th>
              <th scope="col" className="p-3">Género</th>
              <th scope="col" className="p-3">Condición</th>
              <th scope="col" className="p-3">Precio</th>
              <th scope="col" className="p-3">Stock</th>
              <th scope="col" className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {books.length === 0 && !loading && (
              <tr><td colSpan={6} className="p-8 text-center text-ink-muted">Todavía no hay libros cargados.</td></tr>
            )}
            {books.map((b) => (
              <tr key={b.id} className={b.active === false ? "opacity-60" : ""}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 shrink-0"><BookCover book={b} /></div>
                    <div>
                      <p className="font-semibold">
                        {b.title}
                        {b.featured && <Star size={13} className="ml-1 inline fill-gold text-gold" aria-label="Destacado" />}
                        {b.active === false && <EyeOff size={13} className="ml-1 inline text-ink-muted" aria-label="Oculto" />}
                      </p>
                      <p className="text-xs text-ink-muted">{b.author}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{b.genre}</td>
                <td className="p-3">
                  <span className={`badge ${b.condition === "nuevo" ? "badge-nuevo" : "badge-usado"}`}>{b.condition}</span>
                  {b.conditionDetail && <span className="ml-1 text-xs text-ink-muted">{b.conditionDetail}</span>}
                </td>
                <td className="p-3 font-semibold">{formatPrice(b.price)}</td>
                <td className={`p-3 font-semibold ${b.stock === 0 ? "text-danger" : ""}`}>{b.stock}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => openEdit(b)} aria-label={`Editar ${b.title}`} className="rounded-lg p-2 hover:bg-paper-2">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => setDeleteConfirm(b)} aria-label={`Eliminar ${b.title}`} className="rounded-lg p-2 text-danger hover:bg-paper-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmar borrado */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4" onClick={() => setDeleteConfirm(null)} role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold">¿Eliminar este libro?</h2>
            <p className="mt-2 text-sm text-ink-2">«{deleteConfirm.title}» se borra de forma permanente.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancelar</button>
              <button type="button" onClick={() => handleDelete(deleteConfirm.id)} className="btn-primary flex-1">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink/50 p-4" onClick={closeForm} role="dialog" aria-modal="true" aria-label={creating ? "Nuevo libro" : "Editar libro"}>
          <div className="card my-6 w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">{creating ? "Nuevo libro" : "Editar libro"}</h2>
              <button type="button" onClick={closeForm} aria-label="Cerrar" className="rounded-lg p-2 hover:bg-paper-2"><X size={18} /></button>
            </div>
            <BookForm form={form} setForm={setForm} />
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={closeForm} className="btn-secondary flex-1">Cancelar</button>
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookForm({ form, setForm }: { form: BookInput; setForm: React.Dispatch<React.SetStateAction<BookInput>> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  function f<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setCondition(c: Condition) {
    setForm((prev) => ({
      ...prev,
      condition: c,
      conditionDetail: c === "usado" ? prev.conditionDetail ?? "bueno" : null,
      // Los usados suelen ser ejemplares únicos
      stock: c === "usado" && prev.stock === 0 ? 1 : prev.stock,
    }));
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await getBooksRepository().uploadCover(file));
      setForm((prev) => ({ ...prev, images: [...(prev.images ?? []), ...urls] }));
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    setForm((prev) => ({ ...prev, images: (prev.images ?? []).filter((_, idx) => idx !== i) }));
  }

  function makeCover(i: number) {
    setForm((prev) => {
      const imgs = [...(prev.images ?? [])];
      const [it] = imgs.splice(i, 1);
      return { ...prev, images: [it, ...imgs] };
    });
  }

  const numOrUndef = (v: string) => (v === "" ? undefined : Number(v));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="f-title" className="field-label">Título *</label>
        <input id="f-title" className="field" value={form.title} onChange={(e) => f("title", e.target.value)} />
      </div>
      <div>
        <label htmlFor="f-author" className="field-label">Autor *</label>
        <input id="f-author" className="field" value={form.author} onChange={(e) => f("author", e.target.value)} />
      </div>
      <div>
        <label htmlFor="f-pub" className="field-label">Editorial</label>
        <input id="f-pub" className="field" value={form.publisher ?? ""} onChange={(e) => f("publisher", e.target.value)} />
      </div>
      <div>
        <label htmlFor="f-isbn" className="field-label">ISBN (opcional)</label>
        <input id="f-isbn" className="field" inputMode="numeric" value={form.isbn ?? ""} onChange={(e) => f("isbn", e.target.value)} />
      </div>
      <div>
        <label htmlFor="f-genre" className="field-label">Género</label>
        <select id="f-genre" className="field" value={form.genre} onChange={(e) => f("genre", e.target.value)}>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="f-cond" className="field-label">Condición</label>
        <select id="f-cond" className="field" value={form.condition} onChange={(e) => setCondition(e.target.value as Condition)}>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
      </div>
      {form.condition === "usado" && (
        <div>
          <label htmlFor="f-cd" className="field-label">Estado del ejemplar</label>
          <select id="f-cd" className="field" value={form.conditionDetail ?? "bueno"} onChange={(e) => f("conditionDetail", e.target.value as ConditionDetail)}>
            {CONDITION_DETAILS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="f-price" className="field-label">Precio (ARS)</label>
        <input id="f-price" type="number" min={0} step={1} className="field" value={form.price} onChange={(e) => f("price", Number(e.target.value))} />
      </div>
      <div>
        <label htmlFor="f-stock" className="field-label">Stock</label>
        <input id="f-stock" type="number" min={0} step={1} className="field" value={form.stock} onChange={(e) => f("stock", Math.floor(Number(e.target.value)))} />
      </div>
      <div>
        <label htmlFor="f-year" className="field-label">Año (opcional)</label>
        <input id="f-year" type="number" min={0} step={1} className="field" value={form.year ?? ""} onChange={(e) => f("year", numOrUndef(e.target.value))} />
      </div>
      <div>
        <label htmlFor="f-pages" className="field-label">Páginas (opcional)</label>
        <input id="f-pages" type="number" min={0} step={1} className="field" value={form.pages ?? ""} onChange={(e) => f("pages", numOrUndef(e.target.value))} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="f-lang" className="field-label">Idioma</label>
        <input id="f-lang" className="field" value={form.language} onChange={(e) => f("language", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="f-desc" className="field-label">Descripción</label>
        <textarea id="f-desc" rows={3} className="field" value={form.description ?? ""} onChange={(e) => f("description", e.target.value)} placeholder="Sinopsis o detalles del ejemplar (marcas, subrayados, etc.)" />
      </div>

      <div className="sm:col-span-2">
        <span className="field-label">Fotos (la primera es la tapa)</span>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={onFiles} />
        <button type="button" className="btn-secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
          {uploading ? "Subiendo…" : "Subir fotos"}
        </button>
        {uploadErr && <p role="alert" className="mt-2 text-sm text-danger">{uploadErr}</p>}
        {(form.images ?? []).length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {(form.images ?? []).map((url, i) => (
              <li key={url + i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${i + 1}`} className="aspect-[2/3] w-full rounded-md border border-line object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">TAPA</span>}
                <div className="mt-1 flex justify-between text-xs">
                  {i > 0 ? <button type="button" onClick={() => makeCover(i)} className="text-accent hover:underline">Es la tapa</button> : <span />}
                  <button type="button" onClick={() => removeImage(i)} className="text-danger hover:underline">Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.featured} onChange={(e) => f("featured", e.target.checked)} /> Destacado
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.active ?? true} onChange={(e) => f("active", e.target.checked)} /> Visible en el catálogo
      </label>
    </div>
  );
}
