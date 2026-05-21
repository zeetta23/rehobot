"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  obtenerConfiguracion,
  actualizarConfiguracion,
  CONFIG_DEFAULTS,
  type ConfiguracionSitio,
} from "@/lib/firestore/configuracion";

export default function AjustesPage() {
  const [config, setConfig] = useState<ConfiguracionSitio>(CONFIG_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    obtenerConfiguracion()
      .then(setConfig)
      .catch((err: unknown) => {
        if (err instanceof FirebaseError) setError(err.code);
        else setError("No se pudo cargar la configuración.");
      })
      .finally(() => setLoading(false));
  }, []);

  function updateEmpresa<K extends keyof ConfiguracionSitio["empresa"]>(
    key: K,
    value: ConfiguracionSitio["empresa"][K],
  ) {
    setConfig((c) => ({ ...c, empresa: { ...c.empresa, [key]: value } }));
  }

  function updateRed<K extends keyof ConfiguracionSitio["redesSociales"]>(
    key: K,
    value: ConfiguracionSitio["redesSociales"][K],
  ) {
    setConfig((c) => ({
      ...c,
      redesSociales: { ...c.redesSociales, [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setSubmitting(true);
    try {
      await actualizarConfiguracion(config);
      setOk(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`Error de Firestore: ${err.code}`);
      } else {
        setError("No se pudo guardar la configuración.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-body text-sm text-gray-text">Cargando ajustes…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header>
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          Ajustes globales
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
          Configuración del sitio
        </h1>
        <p className="mt-2 font-body text-sm text-gray-text">
          Estos datos aparecen en el footer, en la página de contacto y en
          otros sitios públicos. Puedes editarlos cuando cambies de
          dirección, teléfono o quieras añadir redes sociales.
        </p>
      </header>

      <section className="mt-8 flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5">
        <div>
          <h2 className="font-display text-base font-semibold text-navy">
            Zonas y municipios
          </h2>
          <p className="mt-1 font-body text-xs text-gray-text">
            Gestiona la lista que se muestra en los selectores y filtros.
          </p>
        </div>
        <Link
          href="/admin/ajustes/zonas"
          className="rounded-full border border-navy/15 px-4 py-2 font-body text-sm font-medium text-navy hover:bg-navy hover:text-white"
        >
          Gestionar zonas →
        </Link>
      </section>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Datos de la empresa
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Nombre comercial *
              </span>
              <input
                type="text"
                required
                value={config.empresa.nombre}
                onChange={(e) => updateEmpresa("nombre", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                CIF / NIF
              </span>
              <input
                type="text"
                value={config.empresa.cif}
                onChange={(e) => updateEmpresa("cif", e.target.value)}
                placeholder="B12345678"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Teléfono
              </span>
              <input
                type="tel"
                value={config.empresa.telefono}
                onChange={(e) => updateEmpresa("telefono", e.target.value)}
                placeholder="+34 643 08 99 84"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Dirección postal
              </span>
              <input
                type="text"
                value={config.empresa.direccion}
                onChange={(e) => updateEmpresa("direccion", e.target.value)}
                placeholder="Calle Mayor, 00, 28801 Alcalá de Henares"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Email público
              </span>
              <input
                type="email"
                value={config.empresa.email}
                onChange={(e) => updateEmpresa("email", e.target.value)}
                placeholder="info@rehobotrealestate.es"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <span className="mt-1 block font-body text-xs text-gray-text">
                El que aparece en footer y página de contacto.
              </span>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Email para leads (interno)
              </span>
              <input
                type="email"
                value={config.empresa.emailLeads}
                onChange={(e) =>
                  updateEmpresa("emailLeads", e.target.value)
                }
                placeholder="leads@rehobotrealestate.es (opcional)"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <span className="mt-1 block font-body text-xs text-gray-text">
                Reserva para futura configuración de notificaciones.
              </span>
            </label>

            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                WhatsApp principal
              </span>
              <input
                type="tel"
                value={config.empresa.whatsappPrincipal}
                onChange={(e) =>
                  updateEmpresa("whatsappPrincipal", e.target.value)
                }
                placeholder="+34 600 00 00 00"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Horario
              </span>
              <input
                type="text"
                value={config.empresa.horario}
                onChange={(e) => updateEmpresa("horario", e.target.value)}
                placeholder="L-V: 10:00 - 14:00 / 17:00 - 20:00"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Redes sociales
          </h2>
          <p className="mt-1 font-body text-xs text-gray-text">
            Puedes poner el handle (`rehobotrealestate`) o la URL completa.
            Si dejas el campo vacío, no aparecerá en el footer.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                ["instagram", "Instagram"],
                ["facebook", "Facebook"],
                ["linkedin", "LinkedIn"],
                ["twitter", "Twitter / X"],
                ["youtube", "YouTube"],
                ["tiktok", "TikTok"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  {label}
                </span>
                <input
                  type="text"
                  value={config.redesSociales[key]}
                  onChange={(e) => updateRed(key, e.target.value)}
                  placeholder="handle o URL"
                  className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
                />
              </label>
            ))}
          </div>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
            {error}
          </p>
        )}
        {ok && (
          <p className="rounded-lg bg-green-50 px-4 py-3 font-body text-sm text-green-800">
            ✓ Cambios guardados. Las páginas públicas usan ISR de 60 s; si no
            ves los cambios en seguida, refresca con Cmd+Shift+R o espera un
            minuto.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
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
      </form>
    </div>
  );
}
