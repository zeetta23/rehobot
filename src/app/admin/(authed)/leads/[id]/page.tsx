"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  obtenerLeadPorId,
  actualizarEstadoLead,
  anadirNotaLead,
  asignarAgenteLead,
  eliminarLead,
  buscarDuplicadosPorContacto,
  labelTipoLead,
  labelEstadoLead,
  colorEstadoLead,
  type LeadDetalle,
  type LeadListadoItem,
} from "@/lib/firestore/leads";
import {
  listarStaff,
  type UsuarioStaff,
} from "@/lib/firestore/usuarios";
import type { EstadoLead } from "@/lib/types";

const ESTADOS: EstadoLead[] = [
  "nuevo",
  "contactado",
  "cualificado",
  "cerrado_exito",
  "cerrado_fallido",
];

function formatearFechaLarga(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatearFechaCorta(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatearDuracion(ms: number): string {
  if (ms <= 0) return "—";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `${horas} h ${min % 60} min`;
  const dias = Math.floor(horas / 24);
  return `${dias} d ${horas % 24} h`;
}

export default function FichaLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [lead, setLead] = useState<LeadDetalle | null>(null);
  const [duplicados, setDuplicados] = useState<LeadListadoItem[]>([]);
  const [staff, setStaff] = useState<UsuarioStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingAgente, setSavingAgente] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notaTexto, setNotaTexto] = useState("");
  const [savingNota, setSavingNota] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function recargar() {
    obtenerLeadPorId(id)
      .then(async (data) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setLead(data);
        try {
          const dups = await buscarDuplicadosPorContacto(
            data.email,
            data.telefono,
            data.id,
          );
          setDuplicados(dups);
        } catch {
          setDuplicados([]);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof FirebaseError) {
          setError(`Error de Firestore: ${err.code}`);
        } else {
          setError("No se pudo cargar el lead.");
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    recargar();
    listarStaff()
      .then(setStaff)
      .catch(() => setStaff([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cambiarEstado(nuevo: EstadoLead) {
    if (!lead || nuevo === lead.estado) return;
    setSavingEstado(true);
    setError(null);
    try {
      await actualizarEstadoLead(id, nuevo);
      // Si pasamos de "nuevo" a otro estado, recargamos para coger
      // fechaContactado actualizada.
      if (lead.estado === "nuevo" && nuevo !== "nuevo") {
        recargar();
      } else {
        setLead({ ...lead, estado: nuevo });
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`No se pudo actualizar: ${err.code}`);
      } else {
        setError("No se pudo actualizar el estado.");
      }
    } finally {
      setSavingEstado(false);
    }
  }

  async function cambiarAgente(uid: string) {
    if (!lead) return;
    setSavingAgente(true);
    setError(null);
    try {
      await asignarAgenteLead(id, uid || null);
      setLead({ ...lead, agenteAsignado: uid || null });
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`No se pudo asignar agente: ${err.code}`);
      } else {
        setError("No se pudo asignar el agente.");
      }
    } finally {
      setSavingAgente(false);
    }
  }

  async function handleDelete() {
    if (!lead) return;
    const confirmado = window.confirm(
      `¿Eliminar el lead de "${lead.nombre}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    setDeleting(true);
    setError(null);
    try {
      await eliminarLead(id);
      router.push("/admin/leads?eliminado=1");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`No se pudo eliminar: ${err.code}`);
      } else {
        setError("No se pudo eliminar el lead.");
      }
      setDeleting(false);
    }
  }

  async function enviarNota(e: React.FormEvent) {
    e.preventDefault();
    if (!notaTexto.trim() || !user) return;
    setSavingNota(true);
    setError(null);
    try {
      await anadirNotaLead(id, notaTexto, user.uid);
      setNotaTexto("");
      recargar();
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`No se pudo guardar la nota: ${err.code}`);
      } else {
        setError("No se pudo guardar la nota.");
      }
    } finally {
      setSavingNota(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="font-body text-sm text-gray-text">Cargando lead…</p>
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="font-display text-2xl font-semibold text-navy">
          Lead no encontrado
        </p>
        <Link
          href="/admin/leads"
          className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium"
        >
          ← Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/admin/leads"
        className="font-body text-xs text-gray-text hover:text-navy"
      >
        ← Volver a leads
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            {labelTipoLead(lead.tipo)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            {lead.nombre}
          </h1>
          <p className="mt-1 font-body text-sm text-gray-text">
            Recibido el {formatearFechaLarga(lead.fechaCreacionMs)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-4 py-1.5 font-body text-xs font-medium ${colorEstadoLead(lead.estado)}`}
          >
            {labelEstadoLead(lead.estado)}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-red-600 px-4 py-1.5 font-body text-xs font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Eliminando…" : "Eliminar lead"}
          </button>
        </div>
      </header>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}

      {duplicados.length > 0 && (
        <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-yellow-800">
            ⚠ Posible duplicado
          </p>
          <p className="mt-2 font-body text-sm text-yellow-900">
            Hay {duplicados.length} {duplicados.length === 1 ? "lead" : "leads"}{" "}
            con el mismo email o teléfono:
          </p>
          <ul className="mt-3 space-y-1">
            {duplicados.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/admin/leads/${d.id}`}
                  className="font-body text-sm text-yellow-900 underline-offset-4 hover:underline"
                >
                  {d.nombre} · {labelTipoLead(d.tipo)} ·{" "}
                  {formatearFechaCorta(d.fechaCreacionMs)} ·{" "}
                  <span className="font-medium">
                    {labelEstadoLead(d.estado)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Columna principal */}
        <div className="space-y-8">
          {/* Datos del contacto */}
          <section className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-navy">
              Datos del contacto
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 font-body text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-widest text-gray-text">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-navy underline-offset-4 hover:underline"
                  >
                    {lead.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-gray-text">
                  Teléfono
                </dt>
                <dd className="mt-1">
                  {lead.telefono ? (
                    <a
                      href={`tel:${lead.telefono}`}
                      className="text-navy underline-offset-4 hover:underline"
                    >
                      {lead.telefono}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              {lead.tipo === "interes_inmueble" && (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-widest text-gray-text">
                    Inmueble de interés
                  </dt>
                  <dd className="mt-1">
                    {lead.inmuebleTitulo}
                    {lead.inmuebleRef && (
                      <span className="ml-2 text-xs text-gray-text">
                        ({lead.inmuebleRef})
                      </span>
                    )}
                    {lead.inmuebleId && (
                      <Link
                        href={`/admin/inmuebles/${lead.inmuebleId}/editar`}
                        className="ml-3 text-xs text-navy underline-offset-4 hover:underline"
                      >
                        Abrir inmueble →
                      </Link>
                    )}
                  </dd>
                </div>
              )}
              {lead.tipo === "valoracion_casa" && (
                <>
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-gray-text">
                      Tipo de inmueble
                    </dt>
                    <dd className="mt-1 capitalize">
                      {lead.tipoInmuebleVender ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-gray-text">
                      Municipio
                    </dt>
                    <dd className="mt-1">{lead.municipio ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-gray-text">
                      m² aprox.
                    </dt>
                    <dd className="mt-1">{lead.metrosVender ?? "—"}</dd>
                  </div>
                </>
              )}
            </dl>

            {lead.mensaje && (
              <div className="mt-6 border-t border-black/5 pt-4">
                <dt className="font-body text-xs uppercase tracking-widest text-gray-text">
                  Mensaje
                </dt>
                <dd className="mt-2 whitespace-pre-line font-body text-sm text-dark">
                  {lead.mensaje}
                </dd>
              </div>
            )}
          </section>

          {/* Notas y seguimiento */}
          <section className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-navy">
              Notas de seguimiento
            </h2>

            <form onSubmit={enviarNota} className="mt-4">
              <textarea
                rows={3}
                value={notaTexto}
                onChange={(e) => setNotaTexto(e.target.value)}
                placeholder="Añade una nota: llamada realizada, próximos pasos, etc."
                className="w-full rounded-lg border border-black/10 px-4 py-3 font-body text-sm outline-none focus:border-navy"
              />
              <button
                type="submit"
                disabled={!notaTexto.trim() || savingNota}
                className="mt-3 rounded-full bg-navy px-5 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingNota ? "Guardando…" : "Añadir nota"}
              </button>
            </form>

            {lead.notas.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {lead.notas
                  .slice()
                  .sort((a, b) => {
                    const aMs =
                      typeof a.fecha?.toMillis === "function"
                        ? a.fecha.toMillis()
                        : 0;
                    const bMs =
                      typeof b.fecha?.toMillis === "function"
                        ? b.fecha.toMillis()
                        : 0;
                    return bMs - aMs;
                  })
                  .map((n, idx) => {
                    const ms =
                      typeof n.fecha?.toMillis === "function"
                        ? n.fecha.toMillis()
                        : 0;
                    return (
                      <li
                        key={idx}
                        className="rounded-xl border-l-2 border-gold bg-cream/40 px-4 py-3"
                      >
                        <p className="font-body text-xs text-gray-text">
                          {formatearFechaCorta(ms)}
                        </p>
                        <p className="mt-1 whitespace-pre-line font-body text-sm text-dark">
                          {n.texto}
                        </p>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="mt-6 font-body text-xs text-gray-text">
                Sin notas todavía.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar: estado, agente, KPI, origen */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-display text-base font-semibold text-navy">
              Estado del lead
            </h2>
            <div className="mt-4 space-y-2">
              {ESTADOS.map((estado) => (
                <button
                  key={estado}
                  onClick={() => cambiarEstado(estado)}
                  disabled={savingEstado || estado === lead.estado}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 font-body text-sm transition-colors ${
                    estado === lead.estado
                      ? "bg-navy text-white"
                      : "text-dark hover:bg-cream"
                  } disabled:cursor-not-allowed`}
                >
                  {labelEstadoLead(estado)}
                  {estado === lead.estado && <span>✓</span>}
                </button>
              ))}
            </div>
            {lead.fechaContactadoMs > 0 && (
              <div className="mt-4 border-t border-black/5 pt-4">
                <p className="font-body text-xs uppercase tracking-widest text-gray-text">
                  Tiempo de respuesta
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-navy">
                  {formatearDuracion(
                    lead.fechaContactadoMs - lead.fechaCreacionMs,
                  )}
                </p>
                <p className="mt-0.5 font-body text-[10px] text-gray-text">
                  Tiempo desde la entrada hasta el primer cambio de estado.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-display text-base font-semibold text-navy">
              Agente asignado
            </h2>
            <select
              value={lead.agenteAsignado ?? ""}
              onChange={(e) => cambiarAgente(e.target.value)}
              disabled={savingAgente}
              className="mt-3 w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-body text-sm outline-none focus:border-navy disabled:opacity-50"
            >
              <option value="">Sin asignar</option>
              {staff.map((s) => (
                <option key={s.uid} value={s.uid}>
                  {s.nombre} ({s.rol})
                </option>
              ))}
            </select>
            {staff.length === 0 && (
              <p className="mt-2 font-body text-xs text-gray-text">
                Aún no hay otros usuarios staff. Cuando crees agentes, los
                podrás asignar desde aquí.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-display text-base font-semibold text-navy">
              Origen
            </h2>
            <dl className="mt-4 space-y-3 font-body text-xs">
              <div>
                <dt className="text-gray-text">Página</dt>
                <dd className="mt-0.5 break-all text-dark">
                  {lead.origen.pagina || "—"}
                </dd>
              </div>
              {lead.origen.referer && (
                <div>
                  <dt className="text-gray-text">Referer</dt>
                  <dd className="mt-0.5 break-all text-dark">
                    {lead.origen.referer}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
