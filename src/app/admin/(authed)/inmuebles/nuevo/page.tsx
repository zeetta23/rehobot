"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  crearInmueble,
  type NuevoInmuebleInput,
} from "@/lib/firestore/inmuebles";
import { SelectorCoordenadas } from "@/components/maps/SelectorCoordenadas";
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

const MAX_FOTOS = 30;
const TAMANO_MAX_MB = 10;

interface FotoSeleccionada {
  id: string;
  file: File;
  previewUrl: string;
}

export default function NuevoInmueblePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<{ subidas: number; total: number } | null>(null);

  const [fotos, setFotos] = useState<FotoSeleccionada[]>([]);

  const [form, setForm] = useState<NuevoInmuebleInput>({
    titulo: "",
    operacion: "venta",
    tipo: "piso",
    estado: "borrador",
    precio: 0,
    destacado: false,
    municipio: MUNICIPIOS_CORREDOR[0],
    zona: "",
    coordenadas: { lat: 0, lng: 0 },
    habitaciones: 0,
    banos: 0,
    metrosConstruidos: 0,
    consumoEnergetico: "en_tramite",
    emisionesEnergetico: "en_tramite",
    descripcion: "",
    agente: user?.uid ?? "",
  });

  // Limpieza de URLs de preview al desmontar para evitar leak de memoria.
  useEffect(() => {
    return () => {
      fotos.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof NuevoInmuebleInput>(
    key: K,
    value: NuevoInmuebleInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleAddFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const nuevas: FotoSeleccionada[] = [];
    const errores: string[] = [];

    for (const file of files) {
      if (fotos.length + nuevas.length >= MAX_FOTOS) {
        errores.push(`Máximo ${MAX_FOTOS} fotos por inmueble.`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        errores.push(`"${file.name}" no es una imagen.`);
        continue;
      }
      if (file.size > TAMANO_MAX_MB * 1024 * 1024) {
        errores.push(`"${file.name}" supera ${TAMANO_MAX_MB} MB.`);
        continue;
      }
      nuevas.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (errores.length > 0) setError(errores.join(" "));
    else setError(null);

    setFotos((prev) => [...prev, ...nuevas]);
    // Resetea el input para poder volver a seleccionar el mismo archivo.
    e.target.value = "";
  }

  function eliminarFoto(id: string) {
    setFotos((prev) => {
      const foto = prev.find((f) => f.id === id);
      if (foto) URL.revokeObjectURL(foto.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  function moverFoto(id: string, direccion: "izq" | "der") {
    setFotos((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const nuevoIdx = direccion === "izq" ? idx - 1 : idx + 1;
      if (nuevoIdx < 0 || nuevoIdx >= prev.length) return prev;
      const copia = [...prev];
      [copia[idx], copia[nuevoIdx]] = [copia[nuevoIdx], copia[idx]];
      return copia;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("Sesión no válida. Vuelve a iniciar sesión.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setProgreso(fotos.length > 0 ? { subidas: 0, total: fotos.length } : null);
    try {
      const id = await crearInmueble(
        { ...form, agente: user.uid },
        fotos.map((f) => f.file),
        (subidas, total) => setProgreso({ subidas, total }),
      );
      // Limpia URLs antes de navegar.
      fotos.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      router.push(`/admin/inmuebles?creado=${id}`);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(
          err.code === "permission-denied"
            ? "Tu usuario no tiene permisos para crear inmuebles. ¿Has creado el documento usuarios/{tu UID} con rol admin?"
            : `Error de Firebase: ${err.code}`,
        );
      } else if (err instanceof DOMException && err.name === "AbortError") {
        setError(
          "La operación se canceló. Verifica en el listado por si se guardó parcialmente. Si no aparece, vuelve a intentarlo.",
        );
      } else {
        setError("No se pudo crear el inmueble. Revisa tu conexión y vuelve a intentar.");
      }
    } finally {
      setSubmitting(false);
      setProgreso(null);
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
                value={form.precio === 0 ? "" : form.precio}
                onChange={(e) =>
                  update("precio", e.target.value === "" ? 0 : Number(e.target.value))
                }
                placeholder="0"
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

          {/* Selector de coordenadas en mapa */}
          <div className="mt-6">
            <h3 className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Ubicación en el mapa
            </h3>
            <p className="mt-2 font-body text-xs text-gray-text">
              Haz clic en el mapa donde está el inmueble. Mostraremos un
              círculo de privacidad (no la ubicación exacta) en la web pública.
            </p>
            <div className="mt-3 overflow-hidden rounded-lg border border-black/10">
              <SelectorCoordenadas
                lat={form.coordenadas.lat}
                lng={form.coordenadas.lng}
                onChange={(lat, lng) =>
                  update("coordenadas", { lat, lng })
                }
              />
            </div>
            {form.coordenadas.lat !== 0 && form.coordenadas.lng !== 0 ? (
              <p className="mt-2 font-body text-xs text-gray-text">
                Coordenadas: {form.coordenadas.lat.toFixed(6)},{" "}
                {form.coordenadas.lng.toFixed(6)}{" "}
                <button
                  type="button"
                  onClick={() => update("coordenadas", { lat: 0, lng: 0 })}
                  className="ml-2 text-red-600 underline-offset-4 hover:underline"
                >
                  Quitar
                </button>
              </p>
            ) : (
              <p className="mt-2 font-body text-xs text-gray-text">
                Sin coordenadas seleccionadas. Haz clic en el mapa para
                establecerlas.
              </p>
            )}
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
                value={form.habitaciones === 0 ? "" : form.habitaciones}
                onChange={(e) =>
                  update(
                    "habitaciones",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                placeholder="0"
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
                value={form.banos === 0 ? "" : form.banos}
                onChange={(e) =>
                  update(
                    "banos",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                placeholder="0"
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
                value={form.metrosConstruidos === 0 ? "" : form.metrosConstruidos}
                onChange={(e) =>
                  update(
                    "metrosConstruidos",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                placeholder="0"
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

        {/* Fotos */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-navy">
                Fotos
              </h2>
              <p className="mt-1 font-body text-xs text-gray-text">
                Máximo {MAX_FOTOS} fotos · hasta {TAMANO_MAX_MB} MB cada una ·
                la primera será la portada.
              </p>
            </div>
            <label className="cursor-pointer rounded-full border border-navy/15 px-4 py-2 font-body text-sm text-navy hover:bg-navy hover:text-white">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddFotos}
                className="hidden"
              />
              + Añadir fotos
            </label>
          </div>

          {fotos.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-navy/20 bg-cream/50 px-6 py-12 text-center">
              <p className="font-body text-sm text-gray-text">
                Sin fotos todavía. Añade al menos una para que el inmueble se
                vea bien en la web.
              </p>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {fotos.map((foto, idx) => (
                <li
                  key={foto.id}
                  className="group relative overflow-hidden rounded-xl border border-black/10"
                >
                  <div className="relative aspect-[4/3] w-full bg-cream">
                    <Image
                      src={foto.previewUrl}
                      alt={`Foto ${idx + 1}`}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-navy">
                      Portada
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moverFoto(foto.id, "izq")}
                        disabled={idx === 0}
                        className="rounded-md bg-white/90 px-2 py-1 font-body text-xs text-navy disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Mover izquierda"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moverFoto(foto.id, "der")}
                        disabled={idx === fotos.length - 1}
                        className="rounded-md bg-white/90 px-2 py-1 font-body text-xs text-navy disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Mover derecha"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarFoto(foto.id)}
                      className="rounded-md bg-red-600/90 px-2 py-1 font-body text-xs text-white"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
            {submitting
              ? progreso
                ? `Subiendo fotos… (${progreso.subidas}/${progreso.total})`
                : "Guardando…"
              : "Guardar inmueble"}
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
