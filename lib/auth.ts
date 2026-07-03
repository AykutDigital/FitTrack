"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

/** Suit la session Supabase (connexion / déconnexion en temps réel). */
export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase non configuré");
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error("Supabase non configuré");
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
