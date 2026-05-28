"use client";

import { useState } from "react";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { crearLead, obtenerOrigenDelBrowser } from "@/lib/firestore/leads";

const WHATSAPP_NUMERO = "34643089984";

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  aceptaPrivacidad: boolean;
}

const INICIAL: FormState = {
  nombre: "",
  email: "",
  telefono: "",
  mensaje: "",
  aceptaPrivacidad: false,
};

function whatsappUrl() {
  const texto =
    "Hola, me interesa invertir en inmuebles en Madrid con Rehobot. ¿Podemos hablar?";
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

export function InversoresForm() {
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
      await crearLead({
        tipo: "inversor",
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        mensaje: form.mensaje || null,
        origen: obtenerOrigenDelBrowser("/inversores"),
      });
      setOk(true);
      setForm(INICIAL);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(`No se pudo enviar el formulario (${err.code}).`);
      } else {
        setError("No se pudo enviar el formulario. Inténtalo más tarde.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (ok) {
    return (
      <aside className="rounded-2xl bg-white p-8 text-dark shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-3xl text-gold">
            ✓
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold text-navy">
            ¡Gracias por tu interés!
          </h2>
          <p className="mt-3 font-body text-sm text-gray-text">
            Hemos recibido tu solicitud. Te contactaremos lo antes posible para
            analizar tu situación y objetivos de inversión.
          </p>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-body text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <WhatsAppIcon />
            Escríbenos por WhatsApp
          </a>
          <button
            onClick={() => setOk(false)}
            className="mt-4 block w-full font-body text-sm font-medium text-navy underline-offset-4 hover:underline"
          >
            Enviar otra solicitud
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl bg-white p-6 text-dark shadow-2xl sm:p-8">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
        Consulta gratuita
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
        Analiza tu inversión con nosotros
      </h2>
      <p className="mt-2 font-body text-sm text-gray-text">
        Cuéntanos tu situación y tus objetivos. Te respondemos sin compromiso.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Nombre completo *"
          required
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy sm:col-span-2"
        />
        <input
          type="email"
          placeholder="Email *"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <input
          type="tel"
          placeholder="Teléfono *"
          required
          value={form.telefono}
          onChange={(e) => update("telefono", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <textarea
          rows={3}
          placeholder="Cuéntanos sobre tu situación actual y tus objetivos de inversión…"
          value={form.mensaje}
          onChange={(e) => update("mensaje", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy sm:col-span-2"
        />
        <label className="flex items-start gap-2 font-body text-xs text-gray-text sm:col-span-2">
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
          <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-sm text-red-700 sm:col-span-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-navy px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-navy-medium disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        >
          {submitting ? "Enviando…" : "Agendar consulta gratuita"}
        </button>

        <div className="relative my-1 sm:col-span-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 font-body text-xs text-gray-text">
              o contáctanos directamente
            </span>
          </div>
        </div>

        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-body text-sm font-medium text-white transition-opacity hover:opacity-90 sm:col-span-2"
        >
          <WhatsAppIcon />
          Escríbenos por WhatsApp
        </a>
      </form>
    </aside>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
