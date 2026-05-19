import Link from "next/link";

const COLUMNAS = {
  Inmuebles: [
    { href: "/inmuebles?operacion=venta", label: "Pisos en venta" },
    { href: "/inmuebles?tipo=chalet", label: "Chalets" },
    { href: "/inmuebles?tipo=local", label: "Locales" },
    { href: "/inmuebles?operacion=alquiler", label: "Alquileres" },
  ],
  Zonas: [
    { href: "/zonas/alcala-de-henares", label: "Alcalá de Henares" },
    { href: "/zonas/torrejon-de-ardoz", label: "Torrejón de Ardoz" },
    { href: "/zonas/coslada", label: "Coslada" },
    { href: "/zonas/san-fernando", label: "San Fernando de Henares" },
  ],
  Empresa: [
    { href: "/nosotros", label: "Quiénes somos" },
    { href: "/vender", label: "Vende tu casa" },
    { href: "/contacto", label: "Contacto" },
  ],
};

const LEGAL = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-2xl font-semibold tracking-tight text-white">
                Rehobot
              </span>
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
                Real Estate
              </span>
            </Link>
            <p className="mt-6 max-w-xs font-body text-sm leading-relaxed text-white/70">
              Inmobiliaria del Corredor del Henares. Compra, venta y
              asesoramiento personalizado.
            </p>
            <p className="mt-4 font-body text-sm text-white/70">
              <a
                href="tel:+34916000000"
                className="transition-colors hover:text-gold"
              >
                +34 916 00 00 00
              </a>
              <br />
              <a
                href="mailto:info@rehobotrealestate.es"
                className="transition-colors hover:text-gold"
              >
                info@rehobotrealestate.es
              </a>
            </p>
          </div>

          {Object.entries(COLUMNAS).map(([titulo, items]) => (
            <div key={titulo}>
              <h3 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {titulo}
              </h3>
              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-body text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="font-body text-xs text-white/50">
            © {new Date().getFullYear()} Rehobot Real Estate. Todos los
            derechos reservados.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-body text-xs text-white/50 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
