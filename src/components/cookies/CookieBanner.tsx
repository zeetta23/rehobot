"use client";

import { useState } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/lib/cookies/consent";

export function CookieBanner() {
  const { consent, loaded, guardar } = useCookieConsent();
  const [configurar, setConfigurar] = useState(false);
  const [aceptaAnaliticas, setAceptaAnaliticas] = useState(false);

  if (!loaded || consent !== null) return null;

  function aceptarTodas() {
    guardar(true);
  }

  function rechazarTodas() {
    guardar(false);
  }

  function guardarPreferencias() {
    guardar(aceptaAnaliticas);
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4"
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          {!configurar ? (
            <>
              <p className="font-display text-lg font-semibold text-navy">
                Usamos cookies
              </p>
              <p className="mt-2 font-body text-sm text-dark">
                Utilizamos cookies técnicas necesarias para que el sitio
                funcione y, con tu consentimiento, cookies analíticas para
                entender cómo se usa la web y mejorarla. Más detalles en
                nuestra{" "}
                <Link href="/cookies" className="text-navy underline-offset-4 hover:underline">
                  política de cookies
                </Link>
                .
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={aceptarTodas}
                  className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
                >
                  Aceptar todas
                </button>
                <button
                  type="button"
                  onClick={rechazarTodas}
                  className="rounded-full border border-navy/15 px-5 py-2.5 font-body text-sm font-medium text-navy hover:bg-cream"
                >
                  Rechazar todas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAceptaAnaliticas(false);
                    setConfigurar(true);
                  }}
                  className="rounded-full px-5 py-2.5 font-body text-sm text-gray-text underline-offset-4 hover:text-navy hover:underline"
                >
                  Configurar
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-semibold text-navy">
                Preferencias de cookies
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-dark">
                        Cookies técnicas
                      </p>
                      <p className="mt-1 font-body text-xs text-gray-text">
                        Necesarias para el funcionamiento del sitio. No se
                        pueden desactivar.
                      </p>
                    </div>
                    <span className="rounded-full bg-cream px-3 py-1 font-body text-xs font-medium text-gray-text">
                      Siempre activas
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-body text-sm font-semibold text-dark">
                        Cookies analíticas
                      </p>
                      <p className="mt-1 font-body text-xs text-gray-text">
                        Nos permiten saber qué páginas se visitan más y
                        mejorar el sitio. Sin ellas no podremos hacer
                        estadísticas de uso.
                      </p>
                    </div>
                    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={aceptaAnaliticas}
                        onChange={(e) => setAceptaAnaliticas(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-gold" />
                      <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={guardarPreferencias}
                  className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
                >
                  Guardar preferencias
                </button>
                <button
                  type="button"
                  onClick={() => setConfigurar(false)}
                  className="rounded-full px-5 py-2.5 font-body text-sm text-gray-text underline-offset-4 hover:text-navy hover:underline"
                >
                  Volver
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
