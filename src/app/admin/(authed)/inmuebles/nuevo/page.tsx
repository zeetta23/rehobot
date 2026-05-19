"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  crearInmueble,
  type NuevoInmuebleInput,
} from "@/lib/firestore/inmuebles";
import {
  MUNICIPIOS_CORREDOR,
  type Operacion,
  type TipoInmueble,
  type EstadoInmueble,
  type CalificacionEnergetica,
} from "@/lib/types";

const TIPOS: TipoInmueble[] = [
  "piso",
  "chalet",
  "local",
  "garaje",
  "trastero",
  "terreno",
  "oficina",
];

const ESTADOS: EstadoInmueble[] = [
  "borrador",
  "activo",
  "reservado",
  "vendido",
  "archivado",
];

const CALIFICACIONES: CalificacionEnergetica[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "en_tramite",
];

export default function NuevoInmueblePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NuevoInmuebleInput>({
    titulo: "",
    operacion: "venta",
    tipo: "piso",
    estado: "borrador",
    precio: 0,
    destacado: false,
    municipio: MUNICIPIOS_CORREDOR[0],
    zona: "",
    habitaciones: 0,
    banos: 0,
    metrosConstruidos: 0,
    consumoEnergetico: "en_tramite",
    emisionesEnergetico: "en_tramite",
    descripcion: "",
    agente: user?.uid ?? "",
  });

  function update<K extends keyof NuevoInmuebleInput>(
    key: K,
    value: NuevoInmuebleInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Sesión no válida. Vuelve a iniciar sesión.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const id = await crearInmueble({ ...form, agente: user.uid });
      router.push(`/admin/inmuebles?creado=${id}`);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(
          err.code === "permission-denied"
            ? "Tu usuario no tiene permisos para crear inmuebles. ¿Has creado el documento usuarios/{tu UID} con rol admin?"
            : `Error de Firestore: ${err.code}`,
        );
      } else {
        setError("No se pudo crear el inmueble.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/admin/inmuebles"
        className="font-body text-xs text-gray-text hover:text-navy"
      >
        ← Volver al listado
      </Link>

      <header className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Catálogo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Nuevo inmueble
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        {/* Básico */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Información básica
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Título *
              </span>
              <input
                type="text"
                required
                value={form.titulo}
                onChange={(e) => update("titulo", e.target.value)}
                placeholder="Piso reformado en El Ensanche"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Operación *
              </span>
              <select
                value={form.operacion}
                onChange={(e) =>
                  update("operacion", e.target.value as Operacion)
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Tipo *
              </span>
              <select
                value={form.tipo}
                onChange={(e) => update("tipo", e.target.value as TipoInmueble)}
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm capitalize outline-none focus:border-navy"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Precio (€) *
              </span>
              <input
                type="number"
                required
                min={0}
                value={form.precio}
                onChange={(e) => update("precio", Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="flex items-center gap-2 self-end">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => update("destacado", e.target.checked)}
                className="accent-gold"
              />
              <span className="font-body text-sm text-dark">
                Marcar como destacado
              </span>
            </label>
          </div>
        </section>

        {/* Ubicación */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Ubicación
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Municipio *
              </span>
              <select
                value={form.municipio}
                onChange={(e) => update("municipio", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              >
                {MUNICIPIOS_CORREDOR.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Zona / Barrio
              </span>
              <input
                type="text"
                value={form.zona}
                onChange={(e) => update("zona", e.target.value)}
                placeholder="Ensanche, La Garena, Centro…"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
          </div>
        </section>

        {/* Detalles */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Detalles
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Habitaciones
              </span>
              <input
                type="number"
                min={0}
                value={form.habitaciones}
                onChange={(e) =>
                  update("habitaciones", Number(e.target.value))
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Baños
              </span>
              <input
                type="number"
                min={0}
                value={form.banos}
                onChange={(e) => update("banos", Number(e.target.value))}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                m² construidos
              </span>
              <input
                type="number"
                min={0}
                value={form.metrosConstruidos}
                onChange={(e) =>
                  update("metrosConstruidos", Number(e.target.value))
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
          </div>
        </section>

        {/* Energético */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Certificado energético
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Consumo
              </span>
              <select
                value={form.consumoEnergetico}
                onChange={(e) =>
                  update(
                    "consumoEnergetico",
                    e.target.value as CalificacionEnergetica,
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              >
                {CALIFICACIONES.map((c) => (
                  <option key={c} value={c}>
                    {c === "en_tramite" ? "En trámite" : c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Emisiones
              </span>
              <select
                value={form.emisionesEnergetico}
                onChange={(e) =>
                  update(
                    "emisionesEnergetico",
                    e.target.value as CalificacionEnergetica,
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              >
                {CALIFICACIONES.map((c) => (
                  <option key={c} value={c}>
                    {c === "en_tramite" ? "En trámite" : c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {/* Descripción */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Descripción
          </h2>
          <textarea
            rows={6}
            value={form.descripcion}
            onChange={(e) => update("descripcion", e.target.value)}
            placeholder="Describe el inmueble con detalle: características destacadas, estado, reformas recientes, vistas, etc."
            className="mt-4 w-full rounded-lg border border-black/10 px-4 py-3 font-body text-sm outline-none focus:border-navy"
          />
        </section>

        {/* Publicación */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Publicación
          </h2>
          <label className="mt-6 block">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Estado
            </span>
            <select
              value={form.estado}
              onChange={(e) => update("estado", e.target.value as EstadoInmueble)}
              className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm capitalize outline-none focus:border-navy"
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-2 font-body text-xs text-gray-text">
              <strong>Borrador</strong>: no visible en la web pública.{" "}
              <strong>Activo</strong>: publicado y visible.{" "}
              <strong>Reservado/Vendido</strong>: visible pero marcado.{" "}
              <strong>Archivado</strong>: oculto definitivamente.
            </p>
          </label>
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
            {submitting ? "Guardando…" : "Guardar inmueble"}
          </button>
          <Link
            href="/admin/inmuebles"
            className="rounded-full border border-navy/15 px-6 py-3 font-body text-sm text-navy hover:bg-cream"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
