"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-body text-sm text-gray-text">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header admin */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-navy">
              Rehobot
            </span>
            <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold">
              Panel administración
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-body text-sm text-gray-text sm:inline">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="rounded-full border border-navy/15 px-4 py-2 font-body text-xs font-medium text-navy hover:bg-navy hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
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

        {/* Secciones placeholder */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-dashed border-navy/20 bg-white p-8">
            <h2 className="font-display text-xl font-semibold text-navy">
              Inmuebles
            </h2>
            <p className="mt-2 font-body text-sm text-gray-text">
              Aquí podrás crear, editar y publicar inmuebles. Sección
              próximamente disponible.
            </p>
            <button
              disabled
              className="mt-6 cursor-not-allowed rounded-full bg-navy/40 px-5 py-2.5 font-body text-sm text-white"
            >
              Nuevo inmueble (próximamente)
            </button>
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
      </main>
    </div>
  );
}
