"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { isSupabaseConfigured } from "./supabaseConfigured";

const LOCAL_USERS_KEY = "libros_local_users";
const LOCAL_SESSION_KEY = "libros_customer_session";

/** Evita que getSession quede colgado (red lenta / Supabase) y deje la UI en loading eterno. */
const GET_SESSION_TIMEOUT_MS = 7000;

export type CustomerProfile = {
  id: string;
  email: string;
  mode: "supabase" | "local";
};

type AuthContextValue = {
  user: CustomerProfile | null;
  loading: boolean;
  authMode: "supabase" | "local";
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type LocalUser = { id: string; email: string; password: string };

function readLocalUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalUser[];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function getLocalSession(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { id: string; email: string };
    if (!p?.id || !p?.email) return null;
    return { id: p.id, email: p.email, mode: "local" };
  } catch {
    return null;
  }
}

function setLocalSession(profile: CustomerProfile) {
  sessionStorage.setItem(
    LOCAL_SESSION_KEY,
    JSON.stringify({ id: profile.id, email: profile.email })
  );
}

function clearLocalSession() {
  sessionStorage.removeItem(LOCAL_SESSION_KEY);
}

function mapSupabaseUser(u: User): CustomerProfile {
  return {
    id: u.id,
    email: u.email ?? "",
    mode: "supabase",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const useSupabase = isSupabaseConfigured();

  useEffect(() => {
    if (useSupabase) {
      let cancelled = false;
      const timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setUser(null);
        setLoading(false);
      }, GET_SESSION_TIMEOUT_MS);

      supabase.auth
        .getSession()
        .then(({ data }) => {
          window.clearTimeout(timeoutId);
          if (cancelled) return;
          const s = data.session;
          setUser(s?.user ? mapSupabaseUser(s.user) : null);
          setLoading(false);
        })
        .catch(() => {
          window.clearTimeout(timeoutId);
          if (cancelled) return;
          setUser(null);
          setLoading(false);
        });
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : null);
      });
      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    }

    setUser(getLocalSession());
    setLoading(false);
  }, [useSupabase]);

  const signUp = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const e = email.trim().toLowerCase();
      if (!e || password.length < 6) {
        return { error: "Email válido y contraseña de al menos 6 caracteres." };
      }
      if (useSupabase) {
        const { error } = await supabase.auth.signUp({
          email: e,
          password,
        });
        if (error) return { error: error.message };
        return { error: null };
      }
      const users = readLocalUsers();
      if (users.some((u) => u.email === e)) {
        return { error: "Ese email ya está registrado." };
      }
      const id = crypto.randomUUID();
      users.push({ id, email: e, password });
      writeLocalUsers(users);
      setLocalSession({ id, email: e, mode: "local" });
      setUser({ id, email: e, mode: "local" });
      return { error: null };
    },
    [useSupabase]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const e = email.trim().toLowerCase();
      if (useSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: e,
          password,
        });
        if (error) return { error: error.message };
        if (data.user) setUser(mapSupabaseUser(data.user));
        return { error: null };
      }
      const users = readLocalUsers();
      const found = users.find((u) => u.email === e && u.password === password);
      if (!found) {
        return { error: "Email o contraseña incorrectos." };
      }
      const profile: CustomerProfile = { id: found.id, email: found.email, mode: "local" };
      setLocalSession(profile);
      setUser(profile);
      return { error: null };
    },
    [useSupabase]
  );

  const signOut = useCallback(async () => {
    if (useSupabase) {
      await supabase.auth.signOut();
      setUser(null);
      return;
    }
    clearLocalSession();
    setUser(null);
  }, [useSupabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      authMode: useSupabase ? "supabase" : "local",
      signUp,
      signIn,
      signOut,
    }),
    [user, loading, useSupabase, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
