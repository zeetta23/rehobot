"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/lib/auth/AuthProvider";
import { obtenerUsuarioPorId, type UsuarioStaff } from "@/lib/firestore/usuarios";
import {
  actualizarUsuario,
  eliminarUsuario,
  resetPasswordUsuario,
} from "@/lib/api/usuarios-client";
import { MUNICIPIOS_CORREDOR } from "@/lib/types";

interface FormState {
  rol: "admin" | "agente";
  activo: boolean;
  nombre: string;
  cargo: string;
  telefono: string;
  whatsapp: string;
  bio: string;
  zonas: string[];
}

export default function EditarAgentePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const esYoMismo = user?.uid === uid;

  const [usuario, setUsuario] = useState<UsuarioStaff | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reseting, setReseting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);

  useEffect(() => {
    obtenerUsuarioPorId(uid)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setUsuario(data);
        setForm({
          rol: data.rol,
          activo: data.activo,
          nombre: data.nombre,
          cargo: data.cargo,
          telefono: data.telefono,
          whatsapp: "",
          bio: "",
          zonas: [],
        });
      })
      .catch((err: unknown) => {
        if (err instanceof FirebaseError) setError(err.code);
        else setError("No se pudo cargar el usuario.");
      })
      .finally(() => setLoading(false));
  }, [uid]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function toggleZona(zona: string) {
    setForm((f) => {
      if (!f) return f;
      return {
        ...f,
        zonas: f.zonas.includes(zona)
          ? f.zonas.filter((z) => z !== zona)
          : [...f.zonas, zona],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setMensajeOk(null);
    setSubmitting(true);
    try {
      await actualizarUsuario(uid, {
        rol: form.rol,
        activo: form.activo,
        perfil: {
          nombre: form.nombre,
          cargo: form.cargo,
          telefono: form.telefono,
          whatsapp: form.whatsapp || form.telefono,
          bio: form.bio || null,
          zonas: form.zonas,
        },
      });
      router.push("/admin/agentes?actualizado=" + uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (!usuario) return;
    const confirmar = window.confirm(
      `Enviar a ${usuario.email} un email con un enlace para restablecer la contraseña?`,
    );
    if (!confirmar) return;
    setReseting(true);
    setError(null);
    setMensajeOk(null);
    try {
      await resetPasswordUsuario(uid);
      setMensajeOk(`Email enviado a ${usuario.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el reset.");
    } finally {
      setReseting(false);
    }
  }

  async function handleDelete() {
    if (!usuario) return;
    if (esYoMismo) return;
    const confirmar = window.confirm(
      `¿Eliminar definitivamente la cuenta de "${usuario.nombre || usuario.email}"? También borra su acceso al panel.`,
    );
    if (!confirmar) return;
    setDeleting(true);
    setError(null);
    try {
      await eliminarUsuario(uid);
      router.push("/admin/agentes?eliminado=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-body text-sm text-gray-text">Cargando usuario…</p>
      </div>
    );
  }

  if (notFound || !usuario || !form) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-display text-2xl font-semibold text-navy">
          Usuario no encontrado
        </p>
        <Link
          href="/admin/agentes"
          className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium"
        >
          ← Volver al equipo
        </Link>
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

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Equipo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Editar usuario
          </h1>
          <p className="mt-2 font-body text-sm text-gray-text">
            {usuario.email}
          </p>
        </div>
        {!esYoMismo && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || submitting}
            className="rounded-full border border-red-600 px-4 py-2 font-body text-xs font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Eliminando…" : "Eliminar usuario"}
          </button>
        )}
      </header>

      {mensajeOk && (
        <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 font-body text-sm text-green-800">
          {mensajeOk}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Acceso
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Rol
              </span>
              <select
                value={form.rol}
                onChange={(e) =>
                  update("rol", e.target.value as "admin" | "agente")
                }
                disabled={esYoMismo}
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm capitalize outline-none focus:border-navy disabled:cursor-not-allowed disabled:bg-cream"
              >
                <option value="agente">Agente</option>
                <option value="admin">Administrador</option>
              </select>
              {esYoMismo && (
                <p className="mt-1 font-body text-xs text-gray-text">
                  No puedes cambiar tu propio rol.
                </p>
              )}
            </label>

            <label className="flex items-center gap-3 self-end pb-2">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => update("activo", e.target.checked)}
                disabled={esYoMismo}
                className="accent-gold disabled:cursor-not-allowed"
              />
              <span className="font-body text-sm text-dark">
                Usuario activo (puede iniciar sesión)
              </span>
            </label>
          </div>

          <div className="mt-6 border-t border-black/5 pt-4">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={reseting}
              className="rounded-full border border-navy/15 px-4 py-2 font-body text-sm font-medium text-navy hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reseting ? "Enviando…" : "Enviar email de reset de contraseña"}
            </button>
            <p className="mt-2 font-body text-xs text-gray-text">
              El usuario recibirá un email con un enlace para crear una nueva
              contraseña. Su sesión actual NO se cierra automáticamente.
            </p>
          </div>
        </section>

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
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                WhatsApp
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
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <div className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Zonas
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {MUNICIPIOS_CORREDOR.map((m) => {
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
            disabled={submitting || deleting}
            className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Guardando…" : "Guardar cambios"}
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
