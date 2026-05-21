"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  crearUsuario,
  type CrearUsuarioResult,
} from "@/lib/api/usuarios-client";
import { MUNICIPIOS_CORREDOR } from "@/lib/types";
import { obtenerZonas } from "@/lib/firestore/zonas";

interface FormState {
  email: string;
  password: string;
  rol: "admin" | "agente";
  nombre: string;
  cargo: string;
  telefono: string;
  whatsapp: string;
  bio: string;
  zonas: string[];
  enviarEmail: boolean;
}

const INICIAL: FormState = {
  email: "",
  password: "",
  rol: "agente",
  nombre: "",
  cargo: "",
  telefono: "",
  whatsapp: "",
  bio: "",
  zonas: [],
  enviarEmail: true,
};

function generarPassword(): string {
  // Genera 12 chars: minúsculas + mayúsculas + dígitos
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789";
  let out = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) out += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < 12; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function NuevoAgentePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INICIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<
    (CrearUsuarioResult & { passwordUsada: string }) | null
  >(null);

  const [zonas, setZonas] = useState<string[]>([...MUNICIPIOS_CORREDOR]);
  useEffect(() => {
    obtenerZonas()
      .then(setZonas)
      .catch(() => {});
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleZona(zona: string) {
    setForm((f) => ({
      ...f,
      zonas: f.zonas.includes(zona)
        ? f.zonas.filter((z) => z !== zona)
        : [...f.zonas, zona],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await crearUsuario({
        email: form.email,
        password: form.password,
        rol: form.rol,
        enviarEmail: form.enviarEmail,
        perfil: {
          nombre: form.nombre,
          cargo: form.cargo,
          telefono: form.telefono,
          whatsapp: form.whatsapp || form.telefono,
          bio: form.bio || null,
          fotoUrl: null,
          zonas: form.zonas,
        },
      });
      // Guardamos las credenciales y el resultado para enseñárselas al admin
      // por si el email no llegó (sandbox de Resend).
      setCreado({ ...result, passwordUsada: form.password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario.");
    } finally {
      setSubmitting(false);
    }
  }

  // Pantalla de éxito (con credenciales por si el email no llegó)
  if (creado) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-black/5 bg-white p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-3xl text-gold">
            ✓
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold text-navy">
            Usuario creado
          </h1>
          <p className="mt-3 font-body text-sm text-dark">
            La cuenta de <strong>{form.nombre}</strong> ya está activa en el
            panel.
          </p>

          {creado.emailEnviado ? (
            <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 font-body text-sm text-green-800">
              ✓ Email de bienvenida enviado a {creado.email}. Pídele que revise
              su bandeja de entrada (y Spam la primera vez).
            </p>
          ) : (
            <div className="mt-6 rounded-lg bg-yellow-50 px-4 py-4 font-body text-sm text-yellow-900">
              <p className="font-semibold">
                ⚠ El email automático no se pudo enviar
              </p>
              {creado.emailError && (
                <p className="mt-1 text-xs text-yellow-800">
                  Motivo: {creado.emailError}
                </p>
              )}
              <p className="mt-2 text-xs">
                Esto suele pasar porque Resend está en modo sandbox y solo
                envía a tu propio email hasta que verifiques un dominio.{" "}
                <strong>
                  Pásale las credenciales al usuario por WhatsApp u otro
                  canal:
                </strong>
              </p>
              <dl className="mt-4 space-y-2 rounded-md bg-white p-4">
                <div>
                  <dt className="font-body text-xs uppercase tracking-widest text-gray-text">
                    Email
                  </dt>
                  <dd className="mt-1 select-all font-mono text-sm text-navy">
                    {creado.email}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-xs uppercase tracking-widest text-gray-text">
                    Contraseña inicial
                  </dt>
                  <dd className="mt-1 select-all font-mono text-sm text-navy">
                    {creado.passwordUsada}
                  </dd>
                </div>
                <div>
                  <dt className="font-body text-xs uppercase tracking-widest text-gray-text">
                    Acceso
                  </dt>
                  <dd className="mt-1 font-body text-sm text-navy">
                    https://rehobot-rose.vercel.app/admin/login
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setCreado(null);
                setForm(INICIAL);
              }}
              className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium"
            >
              Crear otro usuario
            </button>
            <Link
              href="/admin/agentes"
              className="rounded-full border border-navy/15 px-6 py-3 font-body text-sm text-navy hover:bg-cream"
            >
              Volver al equipo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/admin/agentes"
        className="font-body text-xs text-gray-text hover:text-navy"
      >
        ← Volver al equipo
      </Link>

      <header className="mt-4">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          Equipo
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
          Nuevo usuario
        </h1>
        <p className="mt-2 font-body text-sm text-gray-text">
          Crea una cuenta para un comercial o administrador del panel. Se
          generará el acceso en Firebase Authentication y el perfil en
          Firestore en un solo paso.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Acceso */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Acceso al panel
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Email *
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="agente@rehobotrealestate.es"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Contraseña inicial *
              </span>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="flex-1 rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
                />
                <button
                  type="button"
                  onClick={() => update("password", generarPassword())}
                  className="shrink-0 rounded-lg border border-navy/15 px-3 py-2 font-body text-xs font-medium text-navy hover:bg-cream"
                >
                  Generar
                </button>
              </div>
              <p className="mt-1 font-body text-xs text-gray-text">
                El usuario podrá cambiarla tras su primer acceso.
              </p>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Rol *
              </span>
              <select
                value={form.rol}
                onChange={(e) =>
                  update("rol", e.target.value as "admin" | "agente")
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm capitalize outline-none focus:border-navy"
              >
                <option value="agente">Agente</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="mt-1 font-body text-xs text-gray-text">
                Admin ve y gestiona todo. Agente solo sus propios inmuebles y
                los leads asignados.
              </p>
            </label>

            <label className="flex items-start gap-2 self-end pt-7 sm:pt-0">
              <input
                type="checkbox"
                checked={form.enviarEmail}
                onChange={(e) => update("enviarEmail", e.target.checked)}
                className="mt-0.5 accent-gold"
              />
              <span className="font-body text-sm text-dark">
                Enviar email de bienvenida con sus credenciales
              </span>
            </label>
          </div>
        </section>

        {/* Perfil */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Perfil
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Nombre completo *
              </span>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => update("nombre", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Cargo
              </span>
              <input
                type="text"
                value={form.cargo}
                onChange={(e) => update("cargo", e.target.value)}
                placeholder="Agente comercial"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Teléfono
              </span>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => update("telefono", e.target.value)}
                placeholder="+34 600 00 00 00"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                WhatsApp (opcional)
              </span>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="Si es igual al teléfono, déjalo vacío"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Bio
              </span>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Breve presentación que aparecerá en la página de Nosotros."
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <div className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Zonas en las que opera
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {zonas.map((m) => {
                  const isActive = form.zonas.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleZona(m)}
                      className={`rounded-full border px-3 py-1.5 font-body text-xs transition-colors ${
                        isActive
                          ? "border-navy bg-navy text-white"
                          : "border-navy/15 text-navy hover:bg-navy/10"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creando…" : "Crear usuario"}
          </button>
          <Link
            href="/admin/agentes"
            className="rounded-full border border-navy/15 px-6 py-3 font-body text-sm text-navy hover:bg-cream"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
