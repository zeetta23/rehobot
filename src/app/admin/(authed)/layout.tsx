"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen", enabled: true },
  { href: "/admin/inmuebles", label: "Inmuebles", enabled: true },
  { href: "/admin/leads", label: "Leads", enabled: false },
  { href: "/admin/agentes", label: "Agentes", enabled: false },
  { href: "/admin/ajustes", label: "Ajustes", enabled: false },
];

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white lg:flex">
        <Link
          href="/admin"
          className="flex flex-col px-6 py-6 leading-none"
        >
          <span className="font-display text-xl font-semibold tracking-tight text-navy">
            Rehobot
          </span>
          <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold">
            Panel administración
          </span>
        </Link>

        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              if (!item.enabled) {
                return (
                  <li key={item.href}>
                    <span className="block cursor-not-allowed rounded-lg px-3 py-2 font-body text-sm text-gray-text/50">
                      {item.label}{" "}
                      <span className="text-[10px] uppercase tracking-wider text-gray-text/40">
                        · próx.
                      </span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 font-body text-sm transition-colors ${
                      isActive
                        ? "bg-navy text-white"
                        : "text-dark hover:bg-cream"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-black/5 p-4">
          <p className="truncate font-body text-xs text-gray-text">
            {user.email}
          </p>
          <button
            onClick={() => signOut()}
            className="mt-3 w-full rounded-full border border-navy/15 px-3 py-1.5 font-body text-xs font-medium text-navy hover:bg-navy hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4 lg:hidden">
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-navy">
              Rehobot
            </span>
            <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold">
              Panel administración
            </span>
          </Link>
          <button
            onClick={() => signOut()}
            className="rounded-full border border-navy/15 px-3 py-1.5 font-body text-xs font-medium text-navy"
          >
            Salir
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
