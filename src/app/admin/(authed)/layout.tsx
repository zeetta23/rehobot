"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen", enabled: true },
  { href: "/admin/inmuebles", label: "Inmuebles", enabled: true },
  { href: "/admin/leads", label: "Leads", enabled: true },
  { href: "/admin/agentes", label: "Agentes", enabled: true },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  // Cierra el menú móvil al navegar.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Escape + bloquear scroll cuando esté abierto.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-body text-sm text-gray-text">Cargando…</p>
      </div>
    );
  }

  const navList = (
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
  );

  const sidebarHeader = (
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
  );

  const sidebarFooter = (
    <div className="border-t border-black/5 p-4">
      <p className="truncate font-body text-xs text-gray-text">{user.email}</p>
      <button
        onClick={() => signOut()}
        className="mt-3 w-full rounded-full border border-navy/15 px-3 py-1.5 font-body text-xs font-medium text-navy hover:bg-navy hover:text-white"
      >
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar desktop (lg+) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white lg:flex">
        {sidebarHeader}
        {navList}
        {sidebarFooter}
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header móvil con hamburguesa */}
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:hidden">
          <button
            type="button"
            aria-label={mobileNavOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-navy"
          >
            {mobileNavOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
          <Link href="/admin" className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-navy">
              Rehobot
            </span>
            <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold">
              Admin
            </span>
          </Link>
          <button
            onClick={() => signOut()}
            className="rounded-full border border-navy/15 px-3 py-1.5 font-body text-xs font-medium text-navy"
          >
            Salir
          </button>
        </header>

        {/* Drawer móvil con sidebar completo */}
        {mobileNavOpen && (
          <>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            />
            <aside
              className="fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-black/5 bg-white shadow-2xl lg:hidden"
              role="dialog"
              aria-label="Navegación admin"
            >
              {sidebarHeader}
              {navList}
              {sidebarFooter}
            </aside>
          </>
        )}

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
