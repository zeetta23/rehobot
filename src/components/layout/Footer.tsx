import Link from "next/link";
import {
  obtenerConfiguracion,
  urlRedSocial,
  type RedesSociales,
} from "@/lib/firestore/configuracion";

const COLUMNAS = {
  Inmuebles: [
    { href: "/inmuebles?operacion=venta", label: "Pisos en venta" },
    { href: "/inmuebles?tipo=chalet", label: "Chalets" },
    { href: "/inmuebles?tipo=local", label: "Locales" },
    { href: "/inmuebles?operacion=alquiler", label: "Alquileres" },
  ],
  Zonas: [
    { href: "/inmuebles?zona=Madrid+Centro", label: "Madrid Centro" },
    { href: "/inmuebles?zona=Madrid+Norte", label: "Madrid Norte" },
    { href: "/inmuebles?zona=Alcal%C3%A1+de+Henares", label: "Alcalá de Henares" },
    { href: "/inmuebles?zona=Torrej%C3%B3n+de+Ardoz", label: "Torrejón de Ardoz" },
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

function telHref(telefono: string) {
  // Quitamos espacios para tel:
  return `tel:${telefono.replace(/\s+/g, "")}`;
}

const RED_LABELS: { key: keyof RedesSociales; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
];

export async function Footer() {
  const config = await obtenerConfiguracion();
  const { empresa, redesSociales } = config;

  const redes = RED_LABELS.map(({ key, label }) => ({
    key,
    label,
    url: urlRedSocial(key, redesSociales[key]),
  })).filter((r) => r.url !== null);

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-2xl font-semibold tracking-tight text-white">
                {empresa.nombre.split(" ")[0] || "Rehobot"}
              </span>
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-gold">
                Real Estate
              </span>
            </Link>
            <p className="mt-6 max-w-xs font-body text-sm leading-relaxed text-white/70">
              Tu inmobiliaria en Madrid y el Corredor del Henares. Compra,
              venta y asesoramiento personalizado.
            </p>
            <p className="mt-4 font-body text-sm text-white/70">
              {empresa.telefono && (
                <>
                  <a
                    href={telHref(empresa.telefono)}
                    className="transition-colors hover:text-gold"
                  >
                    {empresa.telefono}
                  </a>
                  <br />
                </>
              )}
              {empresa.email && (
                <a
                  href={`mailto:${empresa.email}`}
                  className="transition-colors hover:text-gold"
                >
                  {empresa.email}
                </a>
              )}
            </p>

            {redes.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
                {redes.map((r) => (
                  <li key={r.key}>
                    <a
                      href={r.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs text-white/60 transition-colors hover:text-gold"
                    >
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
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
            © {new Date().getFullYear()} {empresa.nombre}. Todos los derechos
            reservados.
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
