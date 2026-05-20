"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  crearLead,
  type NuevoLeadInput,
  type OrigenLeadInput,
} from "@/lib/firestore/leads";
import {
  listarInmuebles,
  type InmuebleListadoItem,
} from "@/lib/firestore/inmuebles";
import { listarStaff, type UsuarioStaff } from "@/lib/firestore/usuarios";
import {
  FUENTES_LEAD,
  MUNICIPIOS_CORREDOR,
  type TipoLead,
} from "@/lib/types";

const TIPOS: { value: TipoLead; label: string; descripcion: string }[] = [
  {
    value: "interes_inmueble",
    label: "Interés en inmueble",
    descripcion: "El cliente pregunta por una vivienda concreta de la cartera.",
  },
  {
    value: "valoracion_casa",
    label: "Valoración de casa",
    descripcion: "Propietario que quiere vender o conocer el precio.",
  },
  {
    value: "contacto_general",
    label: "Contacto general",
    descripcion: "Otra consulta o duda sin inmueble asociado.",
  },
];

const TIPOS_VIVIENDA_VENDER = [
  "piso",
  "chalet",
  "local",
  "garaje",
  "terreno",
  "oficina",
];

function localDatetimeAhora(): string {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset();
  const local = new Date(ahora.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function NuevoLeadPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState<TipoLead>("interes_inmueble");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Fuente externa
  const [fuente, setFuente] = useState<string>("Idealista");
  const [fuenteOtro, setFuenteOtro] = useState("");

  // Inmueble (para tipo=interes_inmueble)
  const [inmuebles, setInmuebles] = useState<InmuebleListadoItem[]>([]);
  const [inmuebleSel, setInmuebleSel] = useState<string>(""); // "" | "otro" | id
  const [inmuebleManual, setInmuebleManual] = useState("");

  // Valoración de casa
  const [tipoVivienda, setTipoVivienda] = useState("");
  const [municipioVivienda, setMunicipioVivienda] = useState("");
  const [metrosVivienda, setMetrosVivienda] = useState("");

  // Agente y fecha
  const [agentes, setAgentes] = useState<UsuarioStaff[]>([]);
  const [agenteId, setAgenteId] = useState<string>("");
  const [fecha, setFecha] = useState<string>(localDatetimeAhora());

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarInmuebles().then(setInmuebles).catch(() => setInmuebles([]));
    listarStaff(true).then(setAgentes).catch(() => setAgentes([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError("Introduce un nombre.");
      return;
    }
    if (!email.trim() && !telefono.trim()) {
      setError("Indica al menos un email o un teléfono.");
      return;
    }

    const fuenteFinal =
      fuente === "Otro" ? fuenteOtro.trim() || "Otro" : fuente;

    const origen: OrigenLeadInput = {
      pagina: "alta-manual",
      referer: null,
      userAgent: null,
      fuente: fuenteFinal,
    };

    const fechaCreacion = fecha ? new Date(fecha) : null;
    const notaInicial = `Alta manual desde el panel · fuente: ${fuenteFinal}`;

    let input: NuevoLeadInput;
    if (tipo === "interes_inmueble") {
      const inmueble = inmuebles.find((i) => i.id === inmuebleSel);
      const inmuebleId = inmueble?.id ?? "";
      const inmuebleRef = inmueble?.ref ?? "";
      const inmuebleTitulo =
        inmueble?.titulo ??
        (inmuebleSel === "otro" ? inmuebleManual.trim() : "");
      input = {
        tipo: "interes_inmueble",
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        mensaje: mensaje.trim() ? `${notaInicial}\n\n${mensaje.trim()}` : notaInicial,
        origen,
        inmuebleId,
        inmuebleRef,
        inmuebleTitulo,
        agenteAsignado: agenteId || null,
        fechaCreacion,
        notificarEmail: false,
      };
    } else if (tipo === "valoracion_casa") {
      input = {
        tipo: "valoracion_casa",
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        mensaje: mensaje.trim() ? `${notaInicial}\n\n${mensaje.trim()}` : notaInicial,
        origen,
        tipoInmuebleVender: tipoVivienda || null,
        municipio: municipioVivienda || null,
        metrosVender: metrosVivienda ? Number(metrosVivienda) : null,
        fechaCreacion,
        notificarEmail: false,
      };
    } else {
      input = {
        tipo: "contacto_general",
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        mensaje: mensaje.trim() ? `${notaInicial}\n\n${mensaje.trim()}` : notaInicial,
        origen,
        fechaCreacion,
        notificarEmail: false,
      };
    }

    setEnviando(true);
    try {
      const id = await crearLead(input);
      router.push(`/admin/leads/${id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error al crear el lead.");
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Captación
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Nuevo lead
          </h1>
          <p className="mt-2 font-body text-sm text-gray-text">
            Da de alta un contacto que te llegó por fuera de la web (Idealista,
            Instagram, llamada, etc.).
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="font-body text-sm text-navy hover:underline"
        >
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Tipo */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Tipo de lead
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {TIPOS.map((t) => (
              <label
                key={t.value}
                className={`block cursor-pointer rounded-xl border p-4 transition has-checked:border-navy has-checked:bg-navy/5 ${
                  tipo === t.value ? "border-navy" : "border-black/10"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={t.value}
                  checked={tipo === t.value}
                  onChange={() => setTipo(t.value)}
                  className="sr-only"
                />
                <span className="block font-body text-sm font-semibold text-navy">
                  {t.label}
                </span>
                <span className="mt-1 block font-body text-xs text-gray-text">
                  {t.descripcion}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Datos del contacto */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Datos del contacto
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Nombre *
              </span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Teléfono
              </span>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Mensaje / comentario inicial
              </span>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                placeholder="Lo que te dijo, por qué te contactó…"
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              />
            </label>
          </div>
        </section>

        {/* Fuente */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Origen del lead
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Fuente *
              </span>
              <select
                value={fuente}
                onChange={(e) => setFuente(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
              >
                {FUENTES_LEAD.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            {fuente === "Otro" && (
              <label className="block">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Describe la fuente
                </span>
                <input
                  type="text"
                  value={fuenteOtro}
                  onChange={(e) => setFuenteOtro(e.target.value)}
                  placeholder="Ej: Anuncio en periódico local"
                  className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
                />
              </label>
            )}
            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Fecha de captación
              </span>
              <input
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy sm:w-72"
              />
              <span className="mt-1 block font-body text-xs text-gray-text">
                Por defecto la fecha actual. Cambia el valor si es un lead
                retroactivo.
              </span>
            </label>
          </div>
        </section>

        {/* Bloques condicionales según tipo */}
        {tipo === "interes_inmueble" && (
          <section className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-navy">
              Inmueble de interés
            </h2>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Selecciona un inmueble
                </span>
                <select
                  value={inmuebleSel}
                  onChange={(e) => setInmuebleSel(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
                >
                  <option value="">(Sin inmueble concreto)</option>
                  <option value="otro">Otro / no está en la cartera…</option>
                  {inmuebles.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.ref ? `${i.ref} · ` : ""}
                      {i.titulo}
                      {i.estado !== "activo" ? ` (${i.estado})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              {inmuebleSel === "otro" && (
                <label className="block">
                  <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                    Descripción del inmueble
                  </span>
                  <input
                    type="text"
                    value={inmuebleManual}
                    onChange={(e) => setInmuebleManual(e.target.value)}
                    placeholder="Ej: Piso en C/ Mayor 12, visto en Idealista"
                    className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
                  />
                </label>
              )}
            </div>
          </section>
        )}

        {tipo === "valoracion_casa" && (
          <section className="rounded-2xl border border-black/5 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-navy">
              Datos de la vivienda a valorar
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Tipo
                </span>
                <select
                  value={tipoVivienda}
                  onChange={(e) => setTipoVivienda(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm capitalize outline-none focus:border-navy"
                >
                  <option value="">—</option>
                  {TIPOS_VIVIENDA_VENDER.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Municipio
                </span>
                <select
                  value={municipioVivienda}
                  onChange={(e) => setMunicipioVivienda(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
                >
                  <option value="">—</option>
                  {MUNICIPIOS_CORREDOR.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  m² aprox.
                </span>
                <input
                  type="number"
                  min={1}
                  value={metrosVivienda}
                  onChange={(e) => setMetrosVivienda(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
                />
              </label>
            </div>
          </section>
        )}

        {/* Asignación */}
        <section className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy">
            Asignación
          </h2>
          <label className="mt-4 block">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
              Agente responsable (opcional)
            </span>
            <select
              value={agenteId}
              onChange={(e) => setAgenteId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy sm:w-96"
            >
              <option value="">— Sin asignar —</option>
              {agentes.map((a) => (
                <option key={a.uid} value={a.uid}>
                  {a.nombre || a.email} ({a.rol})
                </option>
              ))}
            </select>
          </label>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Guardando…" : "Crear lead"}
          </button>
          <Link
            href="/admin/leads"
            className="rounded-full border border-navy/15 px-6 py-3 font-body text-sm text-navy hover:bg-cream"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
