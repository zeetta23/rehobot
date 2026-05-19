"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/admin");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace("/admin");
    } catch (err) {
      if (err instanceof FirebaseError) {
        const msg: Record<string, string> = {
          "auth/invalid-credential": "Email o contraseña incorrectos.",
          "auth/user-not-found": "No existe un usuario con ese email.",
          "auth/wrong-password": "Contraseña incorrecta.",
          "auth/too-many-requests":
            "Demasiados intentos. Inténtalo en unos minutos.",
          "auth/invalid-email": "El email no es válido.",
        };
        setError(msg[err.code] ?? `Error al iniciar sesión: ${err.code}`);
      } else {
        setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 flex flex-col items-center leading-none"
        >
          <span className="font-display text-3xl font-semibold tracking-tight text-navy">
            Rehobot
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
            Real Estate
          </span>
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="font-display text-2xl font-semibold text-navy">
            Acceso al panel
          </h1>
          <p className="mt-2 font-body text-sm text-gray-text">
            Introduce tus credenciales para gestionar inmuebles y leads.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Contraseña
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 font-body text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || authLoading}
              className="w-full rounded-full bg-navy py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center font-body text-xs text-gray-text hover:text-navy"
        >
          ← Volver a la web pública
        </Link>
      </div>
    </div>
  );
}
