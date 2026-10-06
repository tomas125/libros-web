"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

export default function CuentaPage() {
  const { user, loading, authMode, signUp, signIn, signOut } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (password !== password2) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    const { error } = await signUp(email, password);
    setBusy(false);
    if (error) {
      setErr(error);
      return;
    }
    if (authMode === "supabase") {
      setMsg("Cuenta creada. Si Supabase pide confirmar el email, revisá tu bandeja; luego podés iniciar sesión.");
      setTab("login");
    } else {
      setMsg("¡Listo! Ya iniciaste sesión (modo local en este navegador).");
    }
    setPassword("");
    setPassword2("");
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setErr(error);
    else setMsg("Sesión iniciada.");
    setPassword("");
  }

  async function onLogout() {
    setBusy(true);
    await signOut();
    setBusy(false);
    setMsg(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-accent" role="status" aria-label="Cargando">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-4 pb-20 pt-14">
        <h1 className="font-display text-3xl font-bold">Tu cuenta</h1>
        <p className="mb-6 mt-2 text-ink-2">
          Sesión como <strong>{user.email}</strong>
        </p>
        {authMode === "local" && (
          <p className="mb-6 rounded-lg border border-line bg-paper-2 px-4 py-3 text-sm text-ink-2">
            Modo local: la cuenta vive solo en este navegador (no hay Supabase configurado).
          </p>
        )}
        <button type="button" onClick={onLogout} disabled={busy} className="btn-secondary">
          <LogOut size={16} aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-14">
      <h1 className="font-display text-3xl font-bold">Tu cuenta</h1>
      <p className="mb-6 mt-2 text-ink-2">
        Ingresá o creá una cuenta. No es necesaria para comprar.
      </p>

      <div role="tablist" aria-label="Acceso" className="mb-5 grid grid-cols-2 rounded-lg border border-line bg-paper-2 p-1">
        {(["login", "register"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t);
              setErr(null);
              setMsg(null);
            }}
            className={`rounded-md py-2 text-sm font-semibold ${tab === t ? "bg-white text-accent shadow-sm" : "text-ink-muted"}`}
          >
            {t === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <form onSubmit={tab === "login" ? onLogin : onRegister} className="card grid gap-4 p-5">
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="pass" className="field-label">Contraseña</label>
          <input id="pass" type="password" required minLength={6} className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={tab === "login" ? "current-password" : "new-password"} />
        </div>
        {tab === "register" && (
          <div>
            <label htmlFor="pass2" className="field-label">Repetir contraseña</label>
            <input id="pass2" type="password" required minLength={6} className="field" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" />
          </div>
        )}
        {err && <p role="alert" className="rounded-lg bg-[#fbe9ea] px-3 py-2 text-sm text-danger">{err}</p>}
        {msg && <p role="status" className="rounded-lg bg-[#e3f0e8] px-3 py-2 text-sm text-ok">{msg}</p>}
        <button type="submit" disabled={busy} className="btn-primary">
          {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {tab === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
