"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  listarStaff,
  type UsuarioStaff,
} from "@/lib/firestore/usuarios";

export default function AdminAgentesPage() {
  const [usuarios, setUsuarios] = useState<UsuarioStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarStaff(false) // false: incluir también desactivados
      .then(setUsuarios)
      .catch((err: unknown) => {
        if (err instanceof FirebaseError) setError(err.code);
        else setError("No se pudieron cargar los usuarios.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Equipo
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Agentes y administradores
          </h1>
          <p className="mt-2 font-body text-sm text-gray-text">
            {loading
              ? "Cargando…"
              : `${usuarios.length} ${usuarios.length === 1 ? "usuario" : "usuarios"} en el equipo`}
          </p>
        </div>
        <Link
          href="/admin/agentes/nuevo"
          className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
        >
          + Nuevo usuario
        </Link>
      </div>

      {error && (
        <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && usuarios.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-navy/20 bg-white p-12 text-center sm:p-16">
          <p className="font-display text-2xl font-semibold text-navy">
            Solo estás tú en el equipo
          </p>
          <p className="mt-3 font-body text-sm text-gray-text">
            Crea cuentas para tus comerciales para que puedan gestionar sus
            propios inmuebles y leads.
          </p>
          <Link
            href="/admin/agentes/nuevo"
            className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium"
          >
            Crear el primer agente
          </Link>
        </div>
      )}

      {!loading && !error && usuarios.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-black/5 bg-cream/50">
              <tr>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Usuario
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Email
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Cargo
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Rol
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text">
                  Estado
                </th>
                <th className="px-4 py-3 font-body text-xs font-semibold uppercase tracking-widest text-gray-text" />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const inicial = (u.nombre || u.email || "?")
                  .charAt(0)
                  .toUpperCase();
                return (
                  <tr
                    key={u.uid}
                    className="border-b border-black/5 transition-colors hover:bg-cream/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm font-semibold text-white">
                          {inicial}
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-navy">
                            {u.nombre || "(sin nombre)"}
                          </p>
                          {u.telefono && (
                            <p className="font-body text-xs text-gray-text">
                              {u.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-dark">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-dark">
                      {u.cargo || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 font-body text-xs font-medium capitalize ${
                          u.rol === "admin"
                            ? "bg-navy text-white"
                            : "bg-cream text-navy"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 font-body text-xs font-medium ${
                          u.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/admin/agentes/${u.uid}/editar`}
                        className="inline-flex rounded-full border border-navy/15 px-3 py-1.5 font-body text-xs font-medium text-navy hover:bg-navy hover:text-white"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
