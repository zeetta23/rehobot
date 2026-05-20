"use client";

import { useEffect, useState, useCallback } from "react";

export interface CookieConsent {
  esenciales: true; // Siempre activas
  analiticas: boolean;
  // Fecha en la que se guardó la preferencia (ms)
  timestamp: number;
  // Versión del consent (subir cuando cambien las cookies)
  version: number;
}

const STORAGE_KEY = "rehobot-cookie-consent";
const CONSENT_VERSION = 1;
// Evento custom para que otros tabs/componentes reaccionen al cambio.
const CHANGE_EVENT = "rehobot-cookie-consent-changed";

export function leerConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function guardarConsent(analiticas: boolean) {
  if (typeof window === "undefined") return;
  const consent: CookieConsent = {
    esenciales: true,
    analiticas,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function borrarConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConsent(leerConsent());
    setLoaded(true);

    function refrescar() {
      setConsent(leerConsent());
    }
    window.addEventListener(CHANGE_EVENT, refrescar);
    window.addEventListener("storage", refrescar);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refrescar);
      window.removeEventListener("storage", refrescar);
    };
  }, []);

  const guardar = useCallback((analiticas: boolean) => {
    guardarConsent(analiticas);
  }, []);

  const reset = useCallback(() => {
    borrarConsent();
  }, []);

  return { consent, loaded, guardar, reset };
}
