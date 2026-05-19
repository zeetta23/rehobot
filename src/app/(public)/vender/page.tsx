import { ValoracionForm } from "@/components/forms/ValoracionForm";

const HERO_BULLETS = [
  "Valoración gratis y sin compromiso",
  "Más de 15 años de experiencia en la zona",
  "Honorarios solo al vender",
];

const PASOS = [
  {
    num: "01",
    titulo: "Solicita tu valoración",
    desc: "Rellena el formulario con los datos básicos de tu vivienda. Te contactamos en menos de 24 horas.",
  },
  {
    num: "02",
    titulo: "Visitamos tu casa",
    desc: "Concertamos una visita para conocer la vivienda, hacer reportaje fotográfico y darte un informe de mercado.",
  },
  {
    num: "03",
    titulo: "Publicamos y promocionamos",
    desc: "Aparece en nuestra web, en los principales portales y en nuestra base de compradores cualificados.",
  },
  {
    num: "04",
    titulo: "Gestionamos visitas y oferta",
    desc: "Filtramos compradores, organizamos visitas y te acompañamos durante la negociación hasta la firma ante notario.",
  },
];

const BENEFICIOS = [
  "Valoración gratis y sin compromiso",
  "Más de 15 años de experiencia en la zona",
  "Reportaje fotográfico profesional",
  "Tour virtual 360° del inmueble",
  "Difusión en portales y redes sociales",
  "Asesoramiento legal y fiscal",
  "Acompañamiento hasta la firma",
  "Honorarios solo al vender",
];

export default function VenderPage() {
  return (
    <>
      {/* HERO con formulario integrado */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_460px] lg:items-start">
            {/* Texto */}
            <div>
              <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
                Para propietarios
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold leading-tight sm:text-6xl">
                Vendemos tu casa al{" "}
                <span className="text-gold">mejor precio</span>
              </h1>
              <p className="mt-6 max-w-xl font-body text-base text-white/70 sm:text-lg">
                Tasación gratuita y sin compromiso. Te acompañamos durante todo
                el proceso de venta, desde la valoración inicial hasta la firma
                ante notario.
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

            {/* Formulario */}
            <ValoracionForm />
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
          Por qué con Rehobot
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
          Lo que incluye nuestro servicio
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((b) => (
            <li
              key={b}
              className="rounded-xl border border-black/5 bg-cream p-6 font-body text-sm text-dark"
            >
              <span className="block h-1.5 w-6 rounded-full bg-gold" />
              <p className="mt-4">{b}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* PROCESO */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Proceso
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Cómo trabajamos contigo
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p) => (
              <div key={p.num} className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="font-display text-3xl font-semibold text-gold">
                  {p.num}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-navy">
                  {p.titulo}
                </h3>
                <p className="mt-3 font-body text-sm text-gray-text">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final con anchor al hero */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-navy">
          ¿Listo para vender al mejor precio?
        </h2>
        <p className="mt-3 font-body text-sm text-gray-text">
          Sube arriba y rellena el formulario en menos de un minuto.
        </p>
        <a
          href="#top"
          className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium"
        >
          Solicitar valoración ↑
        </a>
      </section>
    </>
  );
}
