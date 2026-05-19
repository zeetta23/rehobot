"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  listarLeads,
  labelTipoLead,
  labelEstadoLead,
  colorEstadoLead,
  type LeadListadoItem,
} from "@/lib/firestore/leads";
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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadListadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoLead | "">("");
  const [filtroTipo, setFiltroTipo] = useState<TipoLead | "">("");

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

  const nuevos = leads.filter((l) => l.estado === "nuevo").length;

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
              : `${leads.length} ${leads.length === 1 ? "lead" : "leads"}${
                  nuevos > 0 ? ` · ${nuevos} sin contactar` : ""
                }`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
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
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-navy/20 bg-white p-16 text-center">
          <p className="font-display text-2xl font-semibold text-navy">
            Sin leads todavía
          </p>
          <p className="mt-3 font-body text-sm text-gray-text">
            Aquí aparecerán los contactos que lleguen desde los formularios
            de la web pública.
          </p>
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
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
              {leads.map((l) => (
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
