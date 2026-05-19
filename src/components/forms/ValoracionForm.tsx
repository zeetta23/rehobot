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
  tipoInmuebleVender: string;
  municipio: string;
  metrosVender: string;
  mensaje: string;
  aceptaPrivacidad: boolean;
}

const INICIAL: FormState = {
  nombre: "",
  email: "",
  telefono: "",
  tipoInmuebleVender: "",
  municipio: "",
  metrosVender: "",
  mensaje: "",
  aceptaPrivacidad: false,
};

export function ValoracionForm() {
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
        tipo: "valoracion_casa",
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        tipoInmuebleVender: form.tipoInmuebleVender || null,
        municipio: form.municipio || null,
        metrosVender: form.metrosVender ? Number(form.metrosVender) : null,
        mensaje: form.mensaje || null,
        origen: obtenerOrigenDelBrowser("/vender"),
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
            ¡Gracias!
          </h2>
          <p className="mt-3 font-body text-sm text-gray-text">
            Hemos recibido tu solicitud de valoración. Te contactaremos en
            menos de 24 horas en el teléfono o email indicado.
          </p>
          <button
            onClick={() => setOk(false)}
            className="mt-6 font-body text-sm font-medium text-navy underline-offset-4 hover:underline"
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
        Empieza ahora
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
        Solicita tu valoración gratis
      </h2>
      <p className="mt-2 font-body text-sm text-gray-text">
        Te contactamos en menos de 24 horas.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Nombre y apellidos *"
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
        <select
          required
          value={form.tipoInmuebleVender}
          onChange={(e) => update("tipoInmuebleVender", e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        >
          <option value="">Tipo de inmueble *</option>
          <option value="piso">Piso</option>
          <option value="chalet">Chalet</option>
          <option value="local">Local</option>
          <option value="garaje">Garaje</option>
        </select>
        <input
          type="text"
          placeholder="Municipio *"
          required
          value={form.municipio}
          onChange={(e) => update("municipio", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy"
        />
        <input
          type="number"
          min={1}
          required
          placeholder="m² aproximados *"
          value={form.metrosVender}
          onChange={(e) => update("metrosVender", e.target.value)}
          className="rounded-lg border border-black/10 px-4 py-2.5 font-body text-sm outline-none focus:border-navy sm:col-span-2"
        />
        <textarea
          rows={2}
          placeholder="Cuéntanos algo más (opcional)"
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
          {submitting ? "Enviando…" : "Solicitar valoración"}
        </button>
      </form>
    </aside>
  );
}
