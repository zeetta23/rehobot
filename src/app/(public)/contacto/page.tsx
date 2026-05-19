import Link from "next/link";

export default function ContactoPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Contacto
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight sm:text-6xl">
            Hablemos
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-white/70 sm:text-lg">
            Estamos en Alcalá de Henares y atendemos toda la zona del
            Corredor del Henares.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 lg:grid-cols-[1fr_400px]">
        {/* INFO + MAPA */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {[
              {
                titulo: "Oficina",
                lineas: [
                  "Calle Mayor, 00",
                  "28801 Alcalá de Henares",
                  "Madrid",
                ],
              },
              {
                titulo: "Teléfono",
                lineas: ["+34 916 00 00 00", "WhatsApp disponible"],
              },
              {
                titulo: "Email",
                lineas: ["info@rehobotrealestate.es"],
              },
              {
                titulo: "Horario",
                lineas: [
                  "L-V: 10:00 - 14:00 / 17:00 - 20:00",
                  "S: 10:00 - 14:00",
                ],
              },
            ].map((b) => (
              <div key={b.titulo}>
                <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
                  {b.titulo}
                </p>
                {b.lineas.map((l) => (
                  <p
                    key={l}
                    className="mt-2 font-body text-sm text-dark"
                  >
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
              Cómo llegar
            </p>
            <div className="mt-3 aspect-[16/10] rounded-2xl border border-dashed border-navy/20 bg-cream">
              <div className="flex h-full items-center justify-center font-body text-sm text-gray-text">
                [ Mapa de Google · próximamente ]
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <aside>
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
              Escríbenos
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
              ¿En qué te ayudamos?
            </h2>

            <form className="mt-6 space-y-3">
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <select className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy">
                <option>Motivo del contacto</option>
                <option>Quiero comprar</option>
                <option>Quiero vender</option>
                <option>Otro</option>
              </select>
              <textarea
                rows={4}
                placeholder="Mensaje"
                className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
              <label className="flex items-start gap-2 font-body text-xs text-gray-text">
                <input type="checkbox" className="mt-0.5 accent-gold" /> He
                leído y acepto la{" "}
                <Link href="/privacidad" className="underline">
                  política de privacidad
                </Link>
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-navy py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium"
              >
                Enviar mensaje
              </button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}
