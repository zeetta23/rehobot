"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  obtenerInmueblePorId,
  actualizarInmueble,
  eliminarInmueble,
  type NuevoInmuebleInput,
  type ItemFotoEditor,
} from "@/lib/firestore/inmuebles";
import { SelectorCoordenadas } from "@/components/maps/SelectorCoordenadas";
import { BuscadorDireccion } from "@/components/maps/BuscadorDireccion";
import {
  MUNICIPIOS_CORREDOR,
  CARACTERISTICAS_DISPONIBLES,
  type Operacion,
  type TipoInmueble,
  type EstadoInmueble,
  type CalificacionEnergetica,
} from "@/lib/types";

const TIPOS_COCINA = [
  { value: "", label: "—" },
  { value: "independiente", label: "Independiente" },
  { value: "americana", label: "Americana" },
  { value: "office", label: "Office (con barra)" },
];

const TIPOS_CALEFACCION = [
  { value: "", label: "—" },
  { value: "sin", label: "Sin calefacción" },
  { value: "electrica", label: "Eléctrica" },
  { value: "gas_natural", label: "Gas natural" },
  { value: "gas_propano", label: "Gas propano/butano" },
  { value: "gasoil", label: "Gasoil" },
  { value: "suelo_radiante", label: "Suelo radiante" },
];

const ETIQUETAS_CARACTERISTICAS: Record<
  (typeof CARACTERISTICAS_DISPONIBLES)[number],
  string
> = {
  ascensor: "Ascensor",
  garaje: "Garaje",
  trastero: "Trastero",
  ac: "Aire acondicionado",
  calefaccion: "Calefacción",
  terraza: "Terraza",
  balcon: "Balcón",
  jardin: "Jardín",
  piscina: "Piscina",
  amueblado: "Amueblado",
  armarios_empotrados: "Armarios empotrados",
  exterior: "Exterior",
  luminoso: "Luminoso",
  obra_nueva: "Obra nueva",
  reformado: "Reformado",
  portero: "Portero",
  alarma: "Alarma",
  puerta_blindada: "Puerta blindada",
};

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

interface FotoEditorItem {
  id: string;
  item: ItemFotoEditor;
  previewUrl: string;
}

export default function EditarInmueblePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [progreso, setProgreso] = useState<{
    subidas: number;
    total: number;
  } | null>(null);

  const [form, setForm] = useState<NuevoInmuebleInput | null>(null);
  const [fotos, setFotos] = useState<FotoEditorItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let cancelado = false;
    obtenerInmueblePorId(id)
      .then((data) => {
        if (cancelado) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setForm({
          titulo: data.titulo,
          operacion: data.operacion,
          tipo: data.tipo,
          estado: data.estado,
          precio: data.precio,
          destacado: data.destacado,
          municipio: data.municipio || MUNICIPIOS_CORREDOR[0],
          zona: data.zona,
          coordenadas: data.coordenadas,
          habitaciones: data.habitaciones,
          banos: data.banos,
          metrosConstruidos: data.metrosConstruidos,
          anoConstruccion: data.anoConstruccion,
          tipoCocina: data.tipoCocina,
          gastosComunidad: data.gastosComunidad,
          tipoCalefaccion: data.tipoCalefaccion,
          consumoEnergetico: data.consumoEnergetico,
          emisionesEnergetico: data.emisionesEnergetico,
          descripcion: data.descripcion,
          caracteristicas: data.caracteristicas ?? [],
          agente: data.agente || user?.uid || "",
        });
        setFotos(
          data.fotos.map((f, i) => ({
            id: `existente-${i}-${f.url}`,
            item: { tipo: "existente", foto: f },
            previewUrl: f.url,
          })),
        );
      })
      .catch(() => setError("No se pudo cargar el inmueble."))
      .finally(() => setLoading(false));
    return () => {
      cancelado = true;
    };
  }, [id, user?.uid]);

  // Limpia URLs de blob al desmontar.
  useEffect(() => {
    return () => {
      fotos.forEach((f) => {
        if (f.item.tipo === "nueva") URL.revokeObjectURL(f.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof NuevoInmuebleInput>(
    key: K,
    value: NuevoInmuebleInput[K],
  ) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function toggleCaracteristica(c: string) {
    setForm((f) => {
      if (!f) return f;
      return {
        ...f,
        caracteristicas: f.caracteristicas.includes(c)
          ? f.caracteristicas.filter((x) => x !== c)
          : [...f.caracteristicas, c],
      };
    });
  }

  function handleAddFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const nuevas: FotoEditorItem[] = [];
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
        id: `nueva-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        item: { tipo: "nueva", file },
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (errores.length > 0) setError(errores.join(" "));
    else setError(null);

    setFotos((prev) => [...prev, ...nuevas]);
    e.target.value = "";
  }

  function eliminarFoto(id: string) {
    setFotos((prev) => {
      const foto = prev.find((f) => f.id === id);
      if (foto?.item.tipo === "nueva") URL.revokeObjectURL(foto.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFotos((prev) => {
      const oldIdx = prev.findIndex((f) => f.id === active.id);
      const newIdx = prev.findIndex((f) => f.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!user) {
      setError("Sesión no válida. Vuelve a iniciar sesión.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const nuevasACount = fotos.filter((f) => f.item.tipo === "nueva").length;
    setProgreso(nuevasACount > 0 ? { subidas: 0, total: nuevasACount } : null);

    try {
      await actualizarInmueble(
        id,
        { ...form, agente: form.agente || user.uid },
        fotos.map((f) => f.item),
        (subidas, total) => setProgreso({ subidas, total }),
      );
      // Revocar blob URLs después del éxito.
      fotos.forEach((f) => {
        if (f.item.tipo === "nueva") URL.revokeObjectURL(f.previewUrl);
      });
      router.push(`/admin/inmuebles?actualizado=${id}`);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(
          err.code === "permission-denied"
            ? "No tienes permisos para editar este inmueble."
            : `Error de Firebase: ${err.code}`,
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo actualizar el inmueble.");
      }
    } finally {
      setSubmitting(false);
      setProgreso(null);
    }
  }

  async function handleDelete() {
    if (!form) return;
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar "${form.titulo}"? Esta acción borra también todas las fotos asociadas y no se puede deshacer.`,
    );
    if (!confirmado) return;
    setDeleting(true);
    setError(null);
    try {
      await eliminarInmueble(id);
      router.push("/admin/inmuebles?eliminado=1");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`Error al eliminar: ${err.code}`);
      } else {
        setError("No se pudo eliminar el inmueble.");
      }
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="font-body text-sm text-gray-text">Cargando inmueble…</p>
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="font-display text-2xl font-semibold text-navy">
          Inmueble no encontrado
        </p>
        <p className="mt-3 font-body text-sm text-gray-text">
          Puede que se haya eliminado o que la URL sea incorrecta.
        </p>
        <Link
          href="/admin/inmuebles"
          className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium"
        >
          ← Volver al listado
        </Link>
      </div>
    );
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
            Editar inmueble
          </h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || submitting}
          className="rounded-full border border-red-600 px-4 py-2 font-body text-xs font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? "Eliminando…" : "Eliminar inmueble"}
        </button>
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
                  update(
                    "precio",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
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
              Busca la dirección (puedes poner solo calle, barrio o ciudad) o
              haz clic directamente en el mapa para ajustar manualmente.
            </p>
            <div className="mt-3">
              <BuscadorDireccion
                onSelect={(lat, lng) => update("coordenadas", { lat, lng })}
              />
            </div>
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
                value={
                  form.metrosConstruidos === 0 ? "" : form.metrosConstruidos
                }
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

        {/* Características y equipamiento */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Características y equipamiento
          </h2>
          <p className="mt-2 font-body text-xs text-gray-text">
            Datos extra que aparecerán en la sección &ldquo;Características&rdquo;
            de la ficha pública.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Año de construcción
              </span>
              <input
                type="number"
                min={1800}
                max={new Date().getFullYear() + 5}
                placeholder="Ej. 1979"
                value={form.anoConstruccion ?? ""}
                onChange={(e) =>
                  update(
                    "anoConstruccion",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Tipo de cocina
              </span>
              <select
                value={form.tipoCocina ?? ""}
                onChange={(e) =>
                  update("tipoCocina", e.target.value || null)
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              >
                {TIPOS_COCINA.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Gastos comunidad (€/mes)
              </span>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.gastosComunidad ?? ""}
                onChange={(e) =>
                  update(
                    "gastosComunidad",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block sm:col-span-3">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Tipo de calefacción
              </span>
              <select
                value={form.tipoCalefaccion ?? ""}
                onChange={(e) =>
                  update("tipoCalefaccion", e.target.value || null)
                }
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              >
                {TIPOS_CALEFACCION.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 border-t border-black/5 pt-6">
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Equipamiento
            </p>
            <p className="mt-1 font-body text-xs text-gray-text">
              Marca las características que tiene el inmueble.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CARACTERISTICAS_DISPONIBLES.map((c) => {
                const isActive = form.caracteristicas.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCaracteristica(c)}
                    className={`rounded-full border px-3 py-1.5 font-body text-xs transition-colors ${
                      isActive
                        ? "border-navy bg-navy text-white"
                        : "border-navy/15 text-navy hover:bg-navy/10"
                    }`}
                  >
                    {ETIQUETAS_CARACTERISTICAS[c]}
                  </button>
                );
              })}
            </div>
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
                {fotos.length} foto{fotos.length === 1 ? "" : "s"} · máx{" "}
                {MAX_FOTOS} · hasta {TAMANO_MAX_MB} MB · primera = portada
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
                Este inmueble no tiene fotos.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-4 font-body text-xs text-gray-text">
                Arrastra las fotos para reordenarlas. La primera será la
                portada.
              </p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fotos.map((f) => f.id)}
                  strategy={rectSortingStrategy}
                >
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {fotos.map((foto, idx) => (
                      <FotoSortableItem
                        key={foto.id}
                        foto={foto}
                        idx={idx}
                        onEliminar={eliminarFoto}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </>
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
              onChange={(e) =>
                update("estado", e.target.value as EstadoInmueble)
              }
              className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm capitalize outline-none focus:border-navy"
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
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
            disabled={submitting || deleting}
            className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? progreso
                ? `Subiendo fotos… (${progreso.subidas}/${progreso.total})`
                : "Guardando cambios…"
              : "Guardar cambios"}
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

interface FotoSortableItemProps {
  foto: FotoEditorItem;
  idx: number;
  onEliminar: (id: string) => void;
}

function FotoSortableItem({ foto, idx, onEliminar }: FotoSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: foto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-xl border border-black/10 bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        className="relative aspect-[4/3] w-full cursor-grab touch-none bg-cream active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto.previewUrl}
          alt={`Foto ${idx + 1}`}
          className="pointer-events-none h-full w-full object-cover"
          draggable={false}
        />
      </div>
      {idx === 0 && (
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-navy">
          Portada
        </span>
      )}
      {foto.item.tipo === "nueva" && (
        <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-navy px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-white">
          Nueva
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEliminar(foto.id)}
          className="rounded-md bg-red-600/90 px-2 py-1 font-body text-xs text-white"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
