import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiénes somos — Rehobot Real Estate",
  description:
    "Inmobiliaria de barrio con +15 años de experiencia en Madrid y el Corredor del Henares. Conoce nuestro equipo y nuestros valores: cercanía, transparencia y compromiso.",
  alternates: { canonical: "/nosotros" },
};

const VALORES = [
  {
    titulo: "Cercanía",
    desc: "Conocemos a las familias y los barrios. No somos un call center, somos vecinos.",
  },
  {
    titulo: "Transparencia",
    desc: "Tasaciones reales, contratos claros y honorarios sin sorpresas. Tu dinero, tus reglas.",
  },
  {
    titulo: "Compromiso",
    desc: "No te dejamos solo después de la firma. Te seguimos acompañando.",
  },
];

const EQUIPO_MOCK = [
  { nombre: "Manuel García", cargo: "Director", zona: "Alcalá / Torrejón" },
  { nombre: "Laura Ruiz", cargo: "Agente senior", zona: "Coslada / S. Fernando" },
  { nombre: "David Pérez", cargo: "Agente comercial", zona: "Mejorada / Velilla" },
];

export default function NosotrosPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Nosotros
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Inmobiliaria de barrio,{" "}
            <span className="text-gold">profesionalidad de gran ciudad</span>
          </h1>
          <p className="mt-6 max-w-2xl font-body text-base text-white/70 sm:text-lg">
            Llevamos más de 15 años ayudando a familias de Madrid y el
            Corredor del Henares a encontrar su casa o a vender la suya en
            las mejores condiciones posibles.
          </p>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Nuestra historia
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy">
            Cómo empezamos
          </h2>
        </div>
        <div className="space-y-4 font-body text-base leading-relaxed text-dark">
          <p>
            Rehobot Real Estate nació en Alcalá de Henares con la idea de
            ofrecer un servicio inmobiliario diferente: cercano, transparente
            y verdaderamente profesional. Nuestro fundador, después de años
            trabajando en grandes franquicias inmobiliarias, decidió montar
            algo propio donde el cliente fuese el centro y no un número.
          </p>
          <p>
            Hoy, más de 15 años después, hemos ayudado a más de 500 familias
            a comprar o vender su casa en Alcalá, Torrejón, Coslada y
            alrededores. Y seguimos creciendo con el mismo espíritu de barrio.
          </p>
        </div>
      </section>

      {/* VALORES */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Nuestros valores
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            En qué creemos
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALORES.map((v) => (
              <div
                key={v.titulo}
                className="rounded-2xl bg-white p-8 shadow-sm"
              >
                <span className="block h-1.5 w-10 rounded-full bg-gold" />
                <h3 className="mt-6 font-display text-2xl font-semibold text-navy">
                  {v.titulo}
                </h3>
                <p className="mt-3 font-body text-sm text-gray-text">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          El equipo
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
          Quién va a atenderte
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EQUIPO_MOCK.map((m) => (
            <article
              key={m.nombre}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="aspect-square bg-gradient-to-br from-navy/10 to-gold/20" />
              <div className="p-6">
                <h3 className="font-display text-lg font-semibold text-navy">
                  {m.nombre}
                </h3>
                <p className="font-body text-sm text-gold">{m.cargo}</p>
                <p className="mt-3 font-body text-xs text-gray-text">
                  Zona: {m.zona}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
