"use client";

import { useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  crearLead,
  obtenerOrigenDelBrowser,
} from "@/lib/firestore/leads";

interface Props {
  inmuebleId: string;
  inmuebleRef: string;
  inmuebleTitulo: string;
  agenteAsignado: string | null;
  whatsappUrl?: string | null;
}

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  aceptaPrivacidad: boolean;
}

export function InteresInmuebleForm({
  inmuebleId,
  inmuebleRef,
  inmuebleTitulo,
  agenteAsignado,
  whatsappUrl,
}: Props) {
  const mensajeInicial = `Hola, estoy interesad@ en el inmueble ${inmuebleRef} (${inmuebleTitulo}). ¿Podríamos concertar una visita?`;

  const [form, setForm] = useState<FormState>({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: mensajeInicial,
    aceptaPrivacidad: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.aceptaPrivacidad) {
      setError("Debes aceptar la política de privacidad para continuar.");
      return;
    }

    setSubmitting(true);
    try {
      await crearLead({
        tipo: "interes_inmueble",
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        mensaje: form.mensaje || null,
        inmuebleId,
        inmuebleRef,
        inmuebleTitulo,
        agenteAsignado,
        origen: obtenerOrigenDelBrowser(`/inmueble/${inmuebleId}`),
      });
      setOk(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`No se pudo enviar el mensaje (${err.code}).`);
      } else {
        setError("No se pudo enviar. Inténtalo más tarde.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (ok) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-2xl text-gold">
          ✓
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-navy">
          Solicitud enviada
        </h3>
        <p className="mt-2 font-body text-sm text-gray-text">
          Un agente de Rehobot se pondrá en contacto contigo lo antes posible.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-gold py-3 font-body text-sm font-medium text-navy transition-colors hover:bg-gold/10"
          >
            Chatear por WhatsApp también
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
        Te interesa este inmueble
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold text-navy">
        Contacta con el agente
      </h3>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="text"
          placeholder="Tu nombre *"
          required
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <input
          type="email"
          placeholder="Email *"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <input
          type="tel"
          placeholder="Teléfono *"
          required
          value={form.telefono}
          onChange={(e) => update("telefono", e.target.value)}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <textarea
          rows={3}
          value={form.mensaje}
          onChange={(e) => update("mensaje", e.target.value)}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <label className="flex items-start gap-2 font-body text-xs text-gray-text">
          <input
            type="checkbox"
            required
            checked={form.aceptaPrivacidad}
            onChange={(e) => update("aceptaPrivacidad", e.target.checked)}
            className="mt-0.5 accent-gold"
          />
          He leído y acepto la{" "}
          <Link href="/privacidad" className="underline">
            política de privacidad
          </Link>
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-navy py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Enviando…" : "Enviar consulta"}
        </button>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gold py-3 font-body text-sm font-medium text-navy transition-colors hover:bg-gold/10"
          >
            WhatsApp directo
          </a>
        )}
      </form>
    </div>
  );
}
