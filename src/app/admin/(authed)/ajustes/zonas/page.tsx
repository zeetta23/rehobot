"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { obtenerZonas, guardarZonas } from "@/lib/firestore/zonas";

export default function AjustesZonasPage() {
  const [zonas, setZonas] = useState<string[]>([]);
  const [nueva, setNueva] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    obtenerZonas()
      .then(setZonas)
      .catch(() => setError("No se pudieron cargar las zonas."))
      .finally(() => setLoading(false));
  }, []);

  function anadir() {
    const limpio = nueva.trim();
    if (!limpio) return;
    if (zonas.some((z) => z.toLowerCase() === limpio.toLowerCase())) {
      setError(`"${limpio}" ya está en la lista.`);
      return;
    }
    setError(null);
    setOk(false);
    setZonas((prev) => [...prev, limpio]);
    setNueva("");
  }

  function eliminar(idx: number) {
    setOk(false);
    setZonas((prev) => prev.filter((_, i) => i !== idx));
  }

  function mover(idx: number, delta: number) {
    setOk(false);
    setZonas((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const copia = [...prev];
      [copia[idx], copia[target]] = [copia[target], copia[idx]];
      return copia;
    });
  }

  async function guardar() {
    setError(null);
    setOk(false);
    setSubmitting(true);
    try {
      await guardarZonas(zonas);
      setOk(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`Error de Firestore: ${err.code}`);
      } else {
        setError("No se pudo guardar la lista de zonas.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-body text-sm text-gray-text">Cargando zonas…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Ajustes
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Zonas y municipios
          </h1>
          <p className="mt-2 font-body text-sm text-gray-text">
            Lista de zonas disponibles en los selectores de inmuebles, filtros
            y formulario de valoración. Cualquier cambio se aplica a los
            desplegables al refrescar.
          </p>
        </div>
        <Link
          href="/admin/ajustes"
          className="font-body text-sm text-navy hover:underline"
        >
          ← Ajustes
        </Link>
      </div>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-navy">
          Añadir nueva zona
        </h2>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                anadir();
              }
            }}
            placeholder="Ej: Pioz, Arganda del Rey, Madrid Barrio Salamanca…"
            className="flex-1 rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
          />
          <button
            type="button"
            onClick={anadir}
            className="rounded-lg bg-navy px-4 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
          >
            Añadir
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/5 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy">
            Zonas configuradas ({zonas.length})
          </h2>
        </div>
        {zonas.length === 0 ? (
          <p className="mt-4 font-body text-sm text-gray-text">
            No hay zonas. Añade al menos una para que aparezca en los
            formularios.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {zonas.map((z, idx) => (
              <li
                key={`${z}-${idx}`}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="flex-1 font-body text-sm text-dark">{z}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => mover(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Subir"
                    className="rounded-md border border-navy/15 px-2 py-1 font-body text-xs text-navy disabled:cursor-not-allowed disabled:opacity-40 hover:bg-cream"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(idx, 1)}
                    disabled={idx === zonas.length - 1}
                    aria-label="Bajar"
                    className="rounded-md border border-navy/15 px-2 py-1 font-body text-xs text-navy disabled:cursor-not-allowed disabled:opacity-40 hover:bg-cream"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminar(idx)}
                    aria-label="Eliminar"
                    className="ml-2 rounded-md bg-red-50 px-3 py-1 font-body text-xs text-red-700 hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {error}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 font-body text-sm text-green-800">
          ✓ Zonas guardadas. Las páginas públicas tardan hasta 60 s en
          recoger el cambio (ISR).
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={guardar}
          disabled={submitting}
          className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Guardando…" : "Guardar cambios"}
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-navy/15 px-6 py-3 font-body text-sm text-navy hover:bg-cream"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
