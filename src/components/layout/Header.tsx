import Link from "next/link";

const NAV_ITEMS = [
  { href: "/inmuebles", label: "Inmuebles" },
  { href: "/vender", label: "Vender mi casa" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl font-semibold tracking-tight text-navy">
            Rehobot
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
            Real Estate
          </span>
        </Link>

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

        <div className="flex items-center gap-3">
          <a
            href="tel:+34916000000"
            className="hidden font-body text-sm font-medium text-gray-text transition-colors hover:text-navy lg:inline"
          >
            +34 916 00 00 00
          </a>
          <Link
            href="/vender"
            className="rounded-full bg-gold px-5 py-2.5 font-body text-sm font-medium text-navy transition-colors hover:bg-gold-light"
          >
            Valoración gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
