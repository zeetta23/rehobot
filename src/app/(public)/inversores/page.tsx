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
    titulo: "Constitución de Sociedad Limitada (SL)",
    desc: "SL registrada, NIF fiscal y cuenta bancaria. Gestiones con gestoría y notaría, sin complicaciones burocráticas.",
  },
  {
    titulo: "Apertura de cuenta bancaria",
    desc: "Facilitamos tu apertura de cuenta en entidades españolas, con bancos que trabajan con inversores internacionales.",
  },
  {
    titulo: "Asesoramiento legal y fiscal",
    desc: "Equipo especializado en inversores internacionales. Trámites notariales, fiscales y legales, optimización fiscal y cumplimiento normativo.",
  },
  {
    titulo: "Flipping inmobiliario",
    desc: "Identificación de activos con potencial de revalorización. Análisis de mercado, negociación y estrategia de venta.",
  },
  {
    titulo: "Personal shopper inmobiliario",
    desc: "Búsqueda y selección de propiedades según tus criterios. Acceso a oportunidades que no encontrarás en portales públicos.",
  },
  {
    titulo: "Gestión de alquileres de larga estancia",
    desc: "Rentabilidad pasiva mediante alquileres residenciales con inquilinos verificados. Gestión integral de inquilinos, mantenimiento y documentación.",
  },
];

const VENTAJAS = [
  {
    titulo: "Acceso a oportunidades exclusivas",
    desc: "Propiedades que no están en portales públicos. Negociaciones directas con vendedores y desarrolladores.",
  },
  {
    titulo: "Atención en español",
    desc: "Entendemos tu contexto como inversor latinoamericano y te acompañamos en cada paso del proceso.",
  },
  {
    titulo: "Rentabilidad pasiva segura",
    desc: "Estrategias de alquiler de larga estancia con inquilinos verificados para generar ingresos estables.",
  },
  {
    titulo: "Solución integral",
    desc: "Legal, fiscal, bancaria e inmobiliaria. Todo lo que necesitas para invertir en Madrid en un solo lugar.",
  },
];

const TESTIMONIOS = [
  {
    texto:
      "Anderson me ayudó a constituir mi SL, abrir cuenta bancaria y encontrar mi primer activo en flipping. En 8 meses ya recuperé mi inversión inicial. Increíble.",
    autor: "Inversor de Colombia",
  },
  {
    texto:
      "Como extranjera, todo parecía complicado. Rehobot manejó todos los trámites legales y fiscales. Ahora tengo 3 propiedades en alquiler generando ingresos pasivos.",
    autor: "Inversora de México",
  },
  {
    texto:
      "El personal shopper inmobiliario encontró exactamente lo que buscaba. Propiedades con potencial real. Muy profesional y confiable.",
    autor: "Inversor internacional",
  },
];

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
              className="rounded-2xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="font-display text-lg font-semibold text-navy">
                {s.titulo}
              </h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-gray-text">
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
                className="rounded-2xl border border-black/5 bg-white p-6"
              >
                <h3 className="font-display text-lg font-semibold text-navy">
                  {v.titulo}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-gray-text">
                  {v.desc}
                </p>
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
              className="flex flex-col rounded-2xl border border-black/5 bg-white p-6"
            >
              <blockquote className="flex-1 font-body text-sm italic leading-relaxed text-dark">
                “{t.texto}”
              </blockquote>
              <figcaption className="mt-4 font-body text-sm font-semibold text-navy">
                {t.autor}
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
        </div>
      </section>

      {/* Aviso legal sobre cifras */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <p className="font-body text-xs text-gray-text">
          * Las rentabilidades indicadas son estimaciones orientativas basadas
          en operaciones de mercado y no constituyen una garantía de resultados.
          Toda inversión inmobiliaria conlleva riesgos; los resultados dependen
          de cada operación y de las condiciones del mercado.
        </p>
      </section>
    </>
  );
}
