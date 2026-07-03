import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true si les clés Supabase sont présentes → mode compte activé. */
export const isSupabaseConfigured = Boolean(url && key);

/**
 * Client Supabase (navigateur). null si non configuré : dans ce cas
 * l'app retombe en mode local, rien ne casse.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, key as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/** Nom de la table qui stocke les données (une ligne par utilisateur). */
export const DATA_TABLE = "user_data";
