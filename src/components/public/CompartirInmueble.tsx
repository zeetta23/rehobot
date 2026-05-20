"use client";

import { useState, useEffect } from "react";

interface Props {
  url: string;
  titulo: string;
  precio: string;
  ubicacion: string;
}

interface Opcion {
  key: string;
  label: string;
  color: string;
  href: (data: { url: string; texto: string }) => string;
  icon: React.ReactNode;
}

const OPCIONES: Opcion[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#1ebe5d]",
    href: ({ url, texto }) =>
      `https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.76.47 3.46 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92m0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.23 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12s-.64.81-.78.97c-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18s-.22-.16-.47-.28z" />
      </svg>
    ),
  },
  {
    key: "email",
    label: "Email",
    color: "bg-gray-600 hover:bg-gray-700",
    href: ({ url, texto }) =>
      `mailto:?subject=${encodeURIComponent(texto)}&body=${encodeURIComponent(`${texto}\n\n${url}`)}`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "bg-[#1877F2] hover:bg-[#1463cc]",
    href: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "Twitter / X",
    color: "bg-black hover:bg-gray-800",
    href: ({ url, texto }) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "telegram",
    label: "Telegram",
    color: "bg-[#0088cc] hover:bg-[#006fa6]",
    href: ({ url, texto }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.64 6.8c-.15 1.58-.8 5.4-1.13 7.16-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
      </svg>
    ),
  },
];

export function CompartirInmueble({ url, titulo, precio, ubicacion }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const texto = `${titulo} — ${precio}${ubicacion ? " en " + ubicacion : ""}`;
  const data = { url, texto };

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      // Fallback antiguo
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopiado(true);
      } catch {}
      document.body.removeChild(input);
    }
  }

  // Si el navegador soporta Web Share API (móvil), usar nativo cuando se pulsa.
  async function compartirNativo() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: titulo, text: texto, url });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={async () => {
          // En móvil intenta primero la share nativa; si no, despliega el menú.
          if (await compartirNativo()) return;
          setAbierto((o) => !o);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 font-body text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-white"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Compartir
      </button>

      {abierto && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-30"
          />
          <div className="absolute right-0 top-full z-40 mt-2 min-w-[220px] rounded-2xl border border-black/5 bg-white p-3 shadow-xl">
            <p className="px-2 pb-2 font-body text-xs uppercase tracking-widest text-gray-text">
              Compartir
            </p>
            <ul className="space-y-1">
              {OPCIONES.map((o) => (
                <li key={o.key}>
                  <a
                    href={o.href(data)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setAbierto(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm text-dark hover:bg-cream"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${o.color}`}
                    >
                      {o.icon}
                    </span>
                    {o.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-body text-sm text-dark hover:bg-cream"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </span>
                  {copiado ? "¡Enlace copiado!" : "Copiar enlace"}
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
