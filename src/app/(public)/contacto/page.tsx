import type { Metadata } from "next";
import { ContactoForm } from "@/components/forms/ContactoForm";
import { obtenerConfiguracion } from "@/lib/firestore/configuracion";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contacto — Rehobot Real Estate",
  description:
    "Contacta con Rehobot Real Estate. Estamos en Alcalá de Henares y atendemos toda la zona del Corredor del Henares. Teléfono, WhatsApp, email y formulario.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactoPage() {
  const { empresa } = await obtenerConfiguracion();

  const bloques: { titulo: string; lineas: string[] }[] = [
    {
      titulo: "Oficina",
      lineas: empresa.direccion
        ? empresa.direccion.split(/\s·\s|\s\|\s/)
        : ["Sin dirección configurada"],
    },
    {
      titulo: "Teléfono",
      lineas: [
        empresa.telefono || "Sin teléfono",
        empresa.whatsappPrincipal
          ? `WhatsApp: ${empresa.whatsappPrincipal}`
          : "",
      ].filter(Boolean),
    },
    {
      titulo: "Email",
      lineas: [empresa.email || "Sin email"],
    },
    {
      titulo: "Horario",
      lineas: empresa.horario
        ? empresa.horario.split(/\s·\s|\s\|\s/)
        : ["Sin horario configurado"],
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Contacto
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
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
            {bloques.map((b) => (
              <div key={b.titulo}>
                <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
                  {b.titulo}
                </p>
                {b.lineas.map((l, idx) => (
                  <p
                    key={`${b.titulo}-${idx}`}
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
          <ContactoForm />
        </aside>
      </div>
    </>
  );
}
