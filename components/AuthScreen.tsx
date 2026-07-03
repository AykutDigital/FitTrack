"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { Button, Card, Field, Input } from "@/components/ui";

export function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError("Email valide et mot de passe d'au moins 6 caractères requis.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await signUp(email.trim(), password);
        if (error) throw error;
        if (data.session) {
          // connexion immédiate (confirmation email désactivée)
        } else {
          setInfo("Compte créé. Vérifie ta boîte mail pour confirmer, puis connecte-toi.");
          setMode("signin");
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
      }
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm animate-in">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-lg font-black text-white">
            F
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">FitTrack</h1>
            <p className="-mt-0.5 text-xs text-text-muted">
              {mode === "signin" ? "Connexion à ton compte" : "Créer ton compte"}
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              placeholder="toi@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mot de passe">
            <Input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>

          {error && <p className="text-sm text-danger">{error}</p>}
          {info && <p className="text-sm text-accent">{info}</p>}

          <Button onClick={submit} disabled={busy}>
            {busy ? "…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </Button>

          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="text-sm text-text-muted transition hover:text-text"
          >
            {mode === "signin"
              ? "Pas de compte ? Créer un compte"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function messageFor(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/invalid login credentials/i.test(msg)) return "Email ou mot de passe incorrect.";
  if (/already registered/i.test(msg)) return "Un compte existe déjà avec cet email.";
  return msg;
}
