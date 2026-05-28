import type { Metadata } from "next";
import { InversoresForm } from "@/components/forms/InversoresForm";

export const metadata: Metadata = {
  title: "Inversión inmobiliaria en Madrid para inversores internacionales",
  description:
    "Tu socio de confianza para invertir en inmuebles en Madrid. Constitución de SL, apertura de cuenta, asesoría legal y fiscal, flipping, personal shopper y gestión de alquileres. Atención en español.",
  alternates: { canonical: "/inversores" },
};

const HERO_BULLETS = [
  "Atención en español, entendemos tu contexto",
  "Solución integral: legal, fiscal, bancaria e inmobiliaria",
  "Acceso a oportunidades fuera de los portales públicos",
];

const STATS = [
  { valor: "100+", label: "Inversores internacionales acompañados" },
  { valor: "15-25%", label: "Rentabilidad estimada en flipping*" },
  { valor: "8%+", label: "Rentabilidad estimada en alquiler*" },
  { valor: "360°", label: "Gestión integral de tu inversión" },
];

const SERVICIOS = [
  {
    icono: "sl",
    titulo: "Constitución de Sociedad Limitada (SL)",
    desc: "SL registrada, NIF fiscal y cuenta bancaria. Gestiones con gestoría y notaría, sin complicaciones burocráticas.",
  },
  {
    icono: "banco",
    titulo: "Apertura de cuenta bancaria",
    desc: "Facilitamos tu apertura de cuenta en entidades españolas, con bancos que trabajan con inversores internacionales.",
  },
  {
    icono: "legal",
    titulo: "Asesoramiento legal y fiscal",
    desc: "Equipo especializado en inversores internacionales. Trámites notariales, fiscales y legales, optimización fiscal y cumplimiento normativo.",
  },
  {
    icono: "flipping",
    titulo: "Flipping inmobiliario",
    desc: "Identificación de activos con potencial de revalorización. Análisis de mercado, negociación y estrategia de venta.",
  },
  {
    icono: "shopper",
    titulo: "Personal shopper inmobiliario",
    desc: "Búsqueda y selección de propiedades según tus criterios. Acceso a oportunidades que no encontrarás en portales públicos.",
  },
  {
    icono: "alquiler",
    titulo: "Gestión de alquileres de larga estancia",
    desc: "Rentabilidad pasiva mediante alquileres residenciales con inquilinos verificados. Gestión integral de inquilinos, mantenimiento y documentación.",
  },
] as const;

const VENTAJAS = [
  {
    icono: "estrella",
    titulo: "Acceso a oportunidades exclusivas",
    desc: "Propiedades que no están en portales públicos. Negociaciones directas con vendedores y desarrolladores.",
  },
  {
    icono: "chat",
    titulo: "Atención en español",
    desc: "Entendemos tu contexto como inversor latinoamericano y te acompañamos en cada paso del proceso.",
  },
  {
    icono: "escudo",
    titulo: "Rentabilidad pasiva segura",
    desc: "Estrategias de alquiler de larga estancia con inquilinos verificados para generar ingresos estables.",
  },
  {
    icono: "capas",
    titulo: "Solución integral",
    desc: "Legal, fiscal, bancaria e inmobiliaria. Todo lo que necesitas para invertir en Madrid en un solo lugar.",
  },
] as const;

const TESTIMONIOS = [
  {
    texto:
      "Anderson me ayudó a constituir mi SL, abrir cuenta bancaria y encontrar mi primer activo en flipping. En 8 meses ya recuperé mi inversión inicial. Increíble.",
    autor: "Inversor de Colombia",
    iniciales: "CO",
  },
  {
    texto:
      "Como extranjera, todo parecía complicado. Rehobot manejó todos los trámites legales y fiscales. Ahora tengo 3 propiedades en alquiler generando ingresos pasivos.",
    autor: "Inversora de México",
    iniciales: "MX",
  },
  {
    texto:
      "El personal shopper inmobiliario encontró exactamente lo que buscaba. Propiedades con potencial real. Muy profesional y confiable.",
    autor: "Inversor internacional",
    iniciales: "IN",
  },
];

function IconoServicio({ tipo }: { tipo: string }) {
  const comun = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    "aria-hidden": true,
  };
  switch (tipo) {
    case "sl":
      return (
        <svg {...comun}>
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <path d="M9 7h0M9 11h0M9 15h0M15 7h0M15 11h0M15 15h0" />
        </svg>
      );
    case "banco":
      return (
        <svg {...comun}>
          <path d="M3 10l9-6 9 6" />
          <path d="M4 10v9M20 10v9M9 19v-6h6v6M3 21h18" />
        </svg>
      );
    case "legal":
      return (
        <svg {...comun}>
          <path d="M12 3l7 3v5c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "flipping":
      return (
        <svg {...comun}>
          <path d="M3 17l6-6 4 4 7-7" />
          <path d="M14 8h6v6" />
        </svg>
      );
    case "shopper":
      return (
        <svg {...comun}>
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h5v-6h4v6h5V10" />
        </svg>
      );
    case "alquiler":
      return (
        <svg {...comun}>
          <circle cx="8" cy="15" r="4" />
          <path d="M10.9 12.1L20 3M17 6l2 2M14 9l2 2" />
        </svg>
      );
    case "estrella":
      return (
        <svg {...comun}>
          <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9L12 3z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...comun}>
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.1A8.5 8.5 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
        </svg>
      );
    case "escudo":
      return (
        <svg {...comun}>
          <path d="M12 3l7 3v5c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6l7-3z" />
        </svg>
      );
    case "capas":
      return (
        <svg {...comun}>
          <path d="M12 3l9 5-9 5-9-5 9-5z" />
          <path d="M3 12l9 5 9-5M3 16.5l9 5 9-5" />
        </svg>
      );
    default:
      return null;
  }
}

function Estrellas() {
  return (
    <div className="flex gap-0.5 text-gold" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9L12 3z" />
        </svg>
      ))}
    </div>
  );
}

export default function InversoresPage() {
  return (
    <>
      {/* HERO con formulario integrado */}
      <section id="consulta" className="scroll-mt-24 bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_460px] lg:items-start lg:gap-12">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
                Para inversores
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Tu socio de confianza para{" "}
                <span className="text-gold">invertir en Madrid</span>
              </h1>
              <p className="mt-6 max-w-xl font-body text-base text-white/70 sm:text-lg">
                Solución integral para inversores internacionales que buscan
                seguridad y rentabilidad. Desde la constitución de tu sociedad
                hasta tu primer activo inmobiliario: gestiones legales,
                bancarias, flipping y personal shopper inmobiliario.
              </p>
              <ul className="mt-8 space-y-3">
                {HERO_BULLETS.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 font-body text-base text-white/90"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <InversoresForm />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-black/5 bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-12 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-semibold text-navy sm:text-5xl">
                {s.valor}
              </p>
              <p className="mt-2 font-body text-sm text-gray-text">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          Servicios especializados
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-navy sm:text-4xl">
          Todo lo que necesitas, en un solo lugar
        </h2>
        <p className="mt-3 max-w-2xl font-body text-base text-gray-text">
          Desde la constitución legal hasta la rentabilidad. Te acompañamos en
          cada paso de tu inversión en Madrid.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s) => (
            <div
              key={s.titulo}
              className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-10 translate-x-10 rounded-full bg-gold/5 transition-transform duration-500 group-hover:scale-[2.2]" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-medium text-gold shadow-sm transition-transform duration-300 group-hover:scale-110">
                <IconoServicio tipo={s.icono} />
              </div>
              <h3 className="relative mt-5 font-display text-lg font-semibold text-navy">
                {s.titulo}
              </h3>
              <p className="relative mt-3 font-body text-sm leading-relaxed text-gray-text">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VENTAJAS */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Por qué Rehobot
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-navy sm:text-4xl">
            Ventajas de trabajar con nosotros
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {VENTAJAS.map((v) => (
              <div
                key={v.titulo}
                className="flex gap-5 rounded-2xl border border-black/5 bg-white p-6 transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-navy">
                  <IconoServicio tipo={v.icono} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy">
                    {v.titulo}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-gray-text">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          Testimonios
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-navy sm:text-4xl">
          Lo que dicen nuestros inversores
        </h2>
        <p className="mt-3 max-w-2xl font-body text-base text-gray-text">
          Historias reales de inversores internacionales que transformaron sus
          finanzas invirtiendo en Madrid.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TESTIMONIOS.map((t) => (
            <figure
              key={t.autor}
              className="relative flex flex-col rounded-2xl border border-black/5 bg-white p-7 transition-shadow duration-300 hover:shadow-lg"
            >
              <span
                className="absolute right-6 top-2 font-display text-7xl leading-none text-gold/20 select-none"
                aria-hidden
              >
                &rdquo;
              </span>
              <Estrellas />
              <blockquote className="relative mt-4 flex-1 font-body text-sm leading-relaxed text-dark">
                {t.texto}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-black/5 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-medium font-body text-xs font-semibold text-gold">
                  {t.iniciales}
                </span>
                <span className="font-body text-sm font-semibold text-navy">
                  {t.autor}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            ¿List@ para invertir en Madrid?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-base text-white/70">
            Analiza tu situación actual y descubre cómo podemos ayudarte a
            invertir con seguridad y rentabilidad. Primera consulta gratuita y
            sin compromiso.
          </p>
          <a
            href="#consulta"
            className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-body text-sm font-medium text-navy transition-colors hover:bg-gold-light"
          >
            Agendar consulta gratuita
          </a>

          {/* Aviso legal sobre cifras */}
          <p className="mx-auto mt-12 max-w-xl border-t border-white/10 pt-6 font-body text-xs leading-relaxed text-white/40">
            * Las rentabilidades indicadas son estimaciones orientativas basadas
            en operaciones de mercado y no constituyen una garantía de
            resultados. Toda inversión inmobiliaria conlleva riesgos; los
            resultados dependen de cada operación y de las condiciones del
            mercado.
          </p>
        </div>
      </section>
    </>
  );
}
