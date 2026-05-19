"use client";

import { useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import {
  crearLead,
  obtenerOrigenDelBrowser,
} from "@/lib/firestore/leads";

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  motivo: string;
  mensaje: string;
  aceptaPrivacidad: boolean;
}

const INICIAL: FormState = {
  nombre: "",
  email: "",
  telefono: "",
  motivo: "",
  mensaje: "",
  aceptaPrivacidad: false,
};

export function ContactoForm() {
  const [form, setForm] = useState<FormState>(INICIAL);
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
      const mensajeCompleto = form.motivo
        ? `[Motivo: ${form.motivo}] ${form.mensaje}`
        : form.mensaje;

      await crearLead({
        tipo: "contacto_general",
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        mensaje: mensajeCompleto,
        origen: obtenerOrigenDelBrowser("/contacto"),
      });
      setOk(true);
      setForm(INICIAL);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`No se pudo enviar el mensaje (${err.code}).`);
      } else {
        setError("No se pudo enviar el mensaje. Inténtalo más tarde.");
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
        <h2 className="mt-4 font-display text-xl font-semibold text-navy">
          Mensaje enviado
        </h2>
        <p className="mt-2 font-body text-sm text-gray-text">
          Gracias por escribirnos. Te responderemos en breve.
        </p>
        <button
          onClick={() => setOk(false)}
          className="mt-4 font-body text-sm font-medium text-navy underline-offset-4 hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
        Escríbenos
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
        ¿En qué te ayudamos?
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
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
          placeholder="Teléfono (opcional)"
          value={form.telefono}
          onChange={(e) => update("telefono", e.target.value)}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <select
          value={form.motivo}
          onChange={(e) => update("motivo", e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        >
          <option value="">Motivo del contacto</option>
          <option value="Quiero comprar">Quiero comprar</option>
          <option value="Quiero vender">Quiero vender</option>
          <option value="Otro">Otro</option>
        </select>
        <textarea
          rows={4}
          placeholder="Mensaje *"
          required
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
          {submitting ? "Enviando…" : "Enviar mensaje"}
        </button>
      </form>
    </div>
  );
}
