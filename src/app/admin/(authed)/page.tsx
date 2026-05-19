import Link from "next/link";

export default function AdminDashboard() {
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
          { label: "Inmuebles activos", value: "0", hint: "Total publicados" },
          { label: "Leads del mes", value: "0", hint: "Aún sin datos" },
          { label: "Vistas del mes", value: "0", hint: "Pendiente conectar" },
          { label: "Ventas del año", value: "0", hint: "Pendiente conectar" },
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
            <p className="mt-1 font-body text-xs text-gray-text">
              {kpi.hint}
            </p>
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

        <section className="rounded-2xl border border-dashed border-navy/20 bg-white p-8">
          <h2 className="font-display text-xl font-semibold text-navy">
            Leads recibidos
          </h2>
          <p className="mt-2 font-body text-sm text-gray-text">
            Aquí aparecerán los contactos que lleguen desde la web.
            Próximamente disponible.
          </p>
        </section>
      </div>
    </div>
  );
}
