import Link from "next/link";
import { contarInmueblesActivos } from "@/lib/firestore/inmuebles";
import { obtenerKpisLeads } from "@/lib/firestore/leads";
import { obtenerUsoFirebase, formatBytes } from "@/lib/admin/uso";
import { AnalyticsWidget } from "@/components/admin/AnalyticsWidget";

export const revalidate = 30;

function formatearDuracion(ms: number): string {
  if (ms <= 0) return "—";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `${horas} h`;
  const dias = Math.floor(horas / 24);
  return `${dias} d`;
}

export default async function AdminDashboard() {
  const [activos, kpis, uso] = await Promise.all([
    contarInmueblesActivos().catch(() => 0),
    obtenerKpisLeads().catch(() => ({
      totalMes: 0,
      totalNuevos: 0,
      tiempoRespuestaMedioMs: null,
    })),
    obtenerUsoFirebase().catch(() => null),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Resumen
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Bienvenido
          </h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Inmuebles activos",
            value: String(activos),
            hint: "Publicados ahora mismo",
          },
          {
            label: "Leads del mes",
            value: String(kpis.totalMes),
            hint:
              kpis.totalNuevos > 0
                ? `${kpis.totalNuevos} sin contactar`
                : "Mes en curso",
          },
          {
            label: "Tiempo medio resp.",
            value:
              kpis.tiempoRespuestaMedioMs !== null
                ? formatearDuracion(kpis.tiempoRespuestaMedioMs)
                : "—",
            hint: "Hasta el primer contacto",
          },
          {
            label: "Ventas del año",
            value: "0",
            hint: "Pendiente conectar",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-black/5 bg-white p-6"
          >
            <p className="font-body text-xs uppercase tracking-widest text-gray-text">
              {kpi.label}
            </p>
            <p className="mt-3 font-display text-3xl font-semibold text-navy">
              {kpi.value}
            </p>
            <p className="mt-1 font-body text-xs text-gray-text">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/5 bg-white p-8">
          <h2 className="font-display text-xl font-semibold text-navy">
            Inmuebles
          </h2>
          <p className="mt-2 font-body text-sm text-gray-text">
            Crea, edita y publica los inmuebles de tu cartera.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/inmuebles"
              className="rounded-full border border-navy/15 px-5 py-2.5 font-body text-sm text-navy hover:bg-navy hover:text-white"
            >
              Ver listado
            </Link>
            <Link
              href="/admin/inmuebles/nuevo"
              className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
            >
              Nuevo inmueble
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-black/5 bg-white p-8">
          <h2 className="font-display text-xl font-semibold text-navy">
            Leads
          </h2>
          <p className="mt-2 font-body text-sm text-gray-text">
            Revisa los contactos que han llegado desde la web. Cambia su
            estado, añade notas y asígnalos a un agente.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/leads"
              className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-navy-medium"
            >
              Ver leads {kpis.totalNuevos > 0 && `(${kpis.totalNuevos} nuevos)`}
            </Link>
          </div>
        </section>
      </div>

      <AnalyticsWidget />

      {/* Uso de Firebase */}
      <section className="mt-10 rounded-2xl border border-black/5 bg-white p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy">
              Uso de Firebase
            </h2>
            <p className="mt-1 font-body text-sm text-gray-text">
              Almacenamiento y documentos consumidos sobre el plan gratuito.
            </p>
          </div>
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden font-body text-xs text-gray-text hover:text-navy sm:inline"
          >
            Consola Firebase ↗
          </a>
        </div>

        {uso ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Cloud Storage */}
            <div>
              <div className="flex items-baseline justify-between">
                <p className="font-body text-sm font-semibold text-navy">
                  Cloud Storage (fotos)
                </p>
                <p className="font-body text-xs text-gray-text">
                  {uso.storage.archivos}{" "}
                  {uso.storage.archivos === 1 ? "archivo" : "archivos"}
                </p>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="font-display text-2xl font-semibold text-navy">
                  {formatBytes(uso.storage.bytes)}
                </p>
                <p className="font-body text-xs text-gray-text">
                  de {formatBytes(uso.storage.limiteBytes)} ·{" "}
                  <span
                    className={
                      uso.storage.porcentaje >= 80
                        ? "font-semibold text-red-600"
                        : uso.storage.porcentaje >= 50
                          ? "font-semibold text-yellow-700"
                          : "text-gray-text"
                    }
                  >
                    {uso.storage.porcentaje.toFixed(2)}%
                  </span>
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream">
                <div
                  className={`h-full rounded-full transition-all ${
                    uso.storage.porcentaje >= 80
                      ? "bg-red-500"
                      : uso.storage.porcentaje >= 50
                        ? "bg-yellow-500"
                        : "bg-gold"
                  }`}
                  style={{
                    width: `${Math.min(uso.storage.porcentaje, 100).toFixed(2)}%`,
                  }}
                />
              </div>
            </div>

            {/* Firestore docs */}
            <div>
              <div className="flex items-baseline justify-between">
                <p className="font-body text-sm font-semibold text-navy">
                  Firestore (documentos)
                </p>
                <p className="font-body text-xs text-gray-text">
                  Cuota gratuita: 1 GB
                </p>
              </div>
              <p className="mt-2 font-display text-2xl font-semibold text-navy">
                {uso.firestore.totalDocs.toLocaleString("es-ES")} docs
              </p>
              <ul className="mt-3 grid grid-cols-3 gap-3 font-body text-xs">
                <li className="rounded-lg bg-cream/60 px-3 py-2">
                  <p className="text-gray-text">Inmuebles</p>
                  <p className="mt-0.5 font-semibold text-navy">
                    {uso.firestore.docs.inmuebles}
                  </p>
                </li>
                <li className="rounded-lg bg-cream/60 px-3 py-2">
                  <p className="text-gray-text">Leads</p>
                  <p className="mt-0.5 font-semibold text-navy">
                    {uso.firestore.docs.leads}
                  </p>
                </li>
                <li className="rounded-lg bg-cream/60 px-3 py-2">
                  <p className="text-gray-text">Usuarios</p>
                  <p className="mt-0.5 font-semibold text-navy">
                    {uso.firestore.docs.usuarios}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-lg bg-yellow-50 px-4 py-3 font-body text-sm text-yellow-800">
            No se pudo obtener el uso actual. Verifica que el service account
            tenga permiso sobre Storage y Firestore.
          </p>
        )}
      </section>
    </div>
  );
}
