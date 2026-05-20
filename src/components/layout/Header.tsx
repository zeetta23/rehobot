"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/inmuebles", label: "Inmuebles" },
  { href: "/vender", label: "Vender mi casa" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el menú al navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Cierra con Escape y bloquea scroll cuando está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:px-6 sm:py-3">
        {/* Izquierda: hamburguesa (móvil) + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-navy md:hidden"
          >
            {open ? (
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

          <Link
            href="/"
            className="block"
            onClick={() => setOpen(false)}
            aria-label="Rehobot Real Estate — Inicio"
          >
            <Image
              src="/logo.png"
              alt="Rehobot Real Estate"
              width={1536}
              height={1024}
              priority
              className="h-24 w-auto sm:h-32"
            />
          </Link>
        </div>

        {/* Centro: nav (solo desktop) */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body text-sm font-medium text-dark transition-colors hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Derecha: teléfono (desktop) + CTA (siempre) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+34643089984"
            className="hidden font-body text-sm font-medium text-gray-text transition-colors hover:text-navy lg:inline"
          >
            +34 643 08 99 84
          </a>
          <Link
            href="/vender"
            className="shrink-0 whitespace-nowrap rounded-full bg-gold px-3 py-1.5 font-body text-xs font-medium text-navy transition-colors hover:bg-gold-light sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Valoración gratis
          </Link>
        </div>
      </div>

      {/* Drawer móvil */}
      {open && (
        <div
          className="fixed inset-x-0 top-[112px] z-40 max-h-[calc(100vh-112px)] overflow-y-auto border-t border-black/5 bg-white shadow-2xl md:hidden"
          role="dialog"
          aria-label="Menú principal"
        >
          <nav className="mx-auto max-w-7xl px-4 py-6">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-4 py-3 font-body text-base font-medium text-dark hover:bg-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3 border-t border-black/5 pt-6">
              <a
                href="tel:+34643089984"
                className="flex items-center justify-center gap-2 rounded-full border border-navy/15 px-5 py-3 font-body text-sm font-medium text-navy"
              >
                Llamar +34 643 08 99 84
              </a>
              <Link
                href="/vender"
                className="flex items-center justify-center rounded-full bg-gold px-5 py-3 font-body text-sm font-medium text-navy"
              >
                Solicitar valoración gratis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
