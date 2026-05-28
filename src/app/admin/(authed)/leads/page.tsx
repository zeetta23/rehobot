"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  listarLeads,
  labelTipoLead,
  labelEstadoLead,
  colorEstadoLead,
  type LeadListadoItem,
} from "@/lib/firestore/leads";
import { aCsv, descargarCsv } from "@/lib/csv";
import type { EstadoLead, TipoLead } from "@/lib/types";

const ESTADOS: { value: EstadoLead | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "nuevo", label: "Nuevos" },
  { value: "contactado", label: "Contactados" },
  { value: "cualificado", label: "Cualificados" },
  { value: "cerrado_exito", label: "Cerrados con éxito" },
  { value: "cerrado_fallido", label: "Cerrados sin éxito" },
];

const TIPOS: { value: TipoLead | ""; label: string }[] = [
  { value: "", label: "Todos los tipos" },
  { value: "interes_inmueble", label: "Interés en inmueble" },
  { value: "valoracion_casa", label: "Valoración de casa" },
  { value: "contacto_general", label: "Contacto general" },
  { value: "inversor", label: "Inversor" },
];

function formatearFecha(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function formatearFechaISO(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toISOString();
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadListadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoLead | "">("");
  const [filtroTipo, setFiltroTipo] = useState<TipoLead | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setLoading(true);
    listarLeads({
      estado: filtroEstado || undefined,
      tipo: filtroTipo || undefined,
    })
      .then(setLeads)
      .catch((err: unknown) => {
        if (err instanceof FirebaseError) {
          setError(`Error de Firestore: ${err.code}`);
        } else {
          setError("No se pudieron cargar los leads.");
        }
      })
      .finally(() => setLoading(false));
  }, [filtroEstado, filtroTipo]);

  // Filtrado adicional en cliente (rango fechas + búsqueda libre).
  const leadsVisibles = useMemo(() => {
    let res = leads;
    if (desde) {
      const desdeMs = new Date(desde + "T00:00:00").getTime();
      res = res.filter((l) => l.fechaCreacionMs >= desdeMs);
    }
    if (hasta) {
      const hastaMs = new Date(hasta + "T23:59:59").getTime();
      res = res.filter((l) => l.fechaCreacionMs <= hastaMs);
    }
    const q = busqueda.trim().toLowerCase();
    if (q) {
      res = res.filter(
        (l) =>
          l.nombre.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.telefono.toLowerCase().includes(q),
      );
    }
    return res;
  }, [leads, desde, hasta, busqueda]);

  const nuevos = leadsVisibles.filter((l) => l.estado === "nuevo").length;

  function limpiarFiltros() {
    setFiltroEstado("");
    setFiltroTipo("");
    setDesde("");
    setHasta("");
    setBusqueda("");
  }

  function exportarCsv() {
    const csv = aCsv(
      leadsVisibles.map((l) => ({
        fecha: formatearFechaISO(l.fechaCreacionMs),
        nombre: l.nombre,
        email: l.email,
        telefono: l.telefono,
        tipo: labelTipoLead(l.tipo),
        sobre: l.inmuebleTitulo ?? "",
        estado: labelEstadoLead(l.estado),
      })),
      [
        { key: "fecha", label: "Fecha" },
        { key: "nombre", label: "Nombre" },
        { key: "email", label: "Email" },
        { key: "telefono", label: "Teléfono" },
        { key: "tipo", label: "Tipo" },
        { key: "sobre", label: "Inmueble" },
        { key: "estado", label: "Estado" },
      ],
    );
    const stamp = new Date().toISOString().slice(0, 10);
    descargarCsv(csv, `rehobot-leads-${stamp}.csv`);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Captación
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Leads
          </h1>
          <p className="mt-2 font-body text-sm text-gray-text">
            {loading
              ? "Cargando…"
              : `${leadsVisibles.length} ${
                  leadsVisibles.length === 1 ? "lead" : "leads"
                }${nuevos > 0 ? ` · ${nuevos} sin contactar` : ""}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/leads/nuevo"
            className="rounded-full bg-navy px-4 py-2 font-body text-sm font-medium text-white hover:bg-navy-medium"
          >
            + Nuevo lead
          </Link>
          <button
            type="button"
            onClick={exportarCsv}
            disabled={leadsVisibles.length === 0}
            className="rounded-full border border-navy/15 px-4 py-2 font-body text-sm font-medium text-navy hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono…"
          className="w-full rounded-lg border border-black/10 px-3 py-2 font-body text-sm"
        />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoLead | "")}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 font-body text-sm"
          >
            {ESTADOS.map((e) => (
              <option key={e.value || "todos"} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoLead | "")}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 font-body text-sm"
          >
            {TIPOS.map((t) => (
              <option key={t.value || "todos"} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <span className="font-body text-xs text-gray-text">Desde</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 font-body text-sm"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-body text-xs text-gray-text">Hasta</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 font-body text-sm"
            />
          </label>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="rounded-lg border border-navy/15 px-3 py-2 font-body text-sm text-navy hover:bg-cream"
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && leadsVisibles.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-navy/20 bg-white p-16 text-center">
          <p className="font-display text-2xl font-semibold text-navy">
            {leads.length === 0
              ? "Sin leads todavía"
              : "Sin resultados para esos filtros"}
          </p>
          <p className="mt-3 font-body text-sm text-gray-text">
            {leads.length === 0
              ? "Aquí aparecerán los contactos que lleguen desde los formularios de la web pública."
              : "Prueba a ampliar el rango de fechas o vaciar la búsqueda."}
          </p>
        </div>
      )}

      {!loading && !error && leadsVisibles.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-black/5 bg-cream/50">
              <tr>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Fecha
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Nombre
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Contacto
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Tipo
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Sobre
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Estado
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text" />
              </tr>
            </thead>
            <tbody>
              {leadsVisibles.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-black/5 transition-colors hover:bg-cream/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-gray-text">
                    {formatearFecha(l.fechaCreacionMs)}
                  </td>
                  <td className="px-4 py-3 font-body text-sm font-medium text-navy">
                    {l.nombre}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-dark">
                    <div>{l.email}</div>
                    {l.telefono && <div>{l.telefono}</div>}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-dark">
                    {labelTipoLead(l.tipo)}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-dark">
                    {l.inmuebleTitulo ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 font-body text-xs font-medium ${colorEstadoLead(
                        l.estado,
                      )}`}
                    >
                      {labelEstadoLead(l.estado)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="inline-flex rounded-full border border-navy/15 px-3 py-1.5 font-body text-xs font-medium text-navy hover:bg-navy hover:text-white"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
