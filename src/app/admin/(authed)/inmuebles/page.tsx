"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  listarInmuebles,
  formatPrecio,
  colorEstado,
  type InmuebleListadoItem,
} from "@/lib/firestore/inmuebles";

export default function AdminInmueblesPage() {
  const [inmuebles, setInmuebles] = useState<InmuebleListadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarInmuebles()
      .then((data) => setInmuebles(data))
      .catch((err: unknown) => {
        if (err instanceof FirebaseError) {
          setError(`Error de Firestore: ${err.code}`);
        } else {
          setError("No se pudieron cargar los inmuebles.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Catálogo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Inmuebles
          </h1>
          <p className="mt-2 font-body text-sm text-gray-text">
            {loading
              ? "Cargando…"
              : `${inmuebles.length} ${
                  inmuebles.length === 1 ? "inmueble" : "inmuebles"
                } en total`}
          </p>
        </div>
        <Link
          href="/admin/inmuebles/nuevo"
          className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
        >
          + Nuevo inmueble
        </Link>
      </div>

      {error && (
        <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && inmuebles.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-navy/20 bg-white p-16 text-center">
          <p className="font-display text-2xl font-semibold text-navy">
            Sin inmuebles aún
          </p>
          <p className="mt-3 font-body text-sm text-gray-text">
            Crea el primer inmueble de tu cartera para verlo aquí.
          </p>
          <Link
            href="/admin/inmuebles/nuevo"
            className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium"
          >
            Crear el primer inmueble
          </Link>
        </div>
      )}

      {!loading && !error && inmuebles.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-black/5 bg-cream/50">
              <tr>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Ref
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Título
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Zona
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Tipo
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Precio
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Estado
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {inmuebles.map((inm) => (
                <tr
                  key={inm.id}
                  className="border-b border-black/5 transition-colors hover:bg-cream/30"
                >
                  <td className="px-4 py-3 font-body text-xs text-gray-text">
                    {inm.ref}
                  </td>
                  <td className="px-4 py-3 font-body text-sm font-medium text-navy">
                    <span className="inline-flex items-center gap-2">
                      {inm.titulo}
                      {inm.slug &&
                        ["activo", "reservado", "vendido"].includes(
                          inm.estado,
                        ) && (
                          <a
                            href={`/inmueble/${inm.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver en la web pública"
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gold transition-colors hover:bg-gold hover:text-navy"
                            aria-label="Abrir ficha pública en nueva pestaña"
                          >
                            ↗
                          </a>
                        )}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-dark">
                    {inm.municipio}
                    {inm.zona && ` · ${inm.zona}`}
                  </td>
                  <td className="px-4 py-3 font-body text-sm capitalize text-dark">
                    {inm.tipo}
                  </td>
                  <td className="px-4 py-3 font-body text-sm font-medium text-navy">
                    {formatPrecio(inm.precio)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 font-body text-xs font-medium capitalize ${colorEstado(
                        inm.estado,
                      )}`}
                    >
                      {inm.estado}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/inmuebles/${inm.id}/editar`}
                      className="inline-flex rounded-full border border-navy/15 px-3 py-1.5 font-body text-xs font-medium text-navy hover:bg-navy hover:text-white"
                    >
                      Editar
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
