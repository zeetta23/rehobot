"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface FotoGaleria {
  url: string;
  urlMedium?: string;
  urlLarge?: string;
}

interface GaleriaInmuebleProps {
  fotos: FotoGaleria[];
  titulo: string;
}

export function GaleriaInmueble({ fotos, titulo }: GaleriaInmuebleProps) {
  const [indice, setIndice] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = fotos.length;

  const ir = useCallback(
    (delta: number) => {
      if (total === 0) return;
      setIndice((prev) => (prev + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (total === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(1);
      else if (e.key === "ArrowLeft") ir(-1);
      else if (e.key === "Escape" && lightboxAbierto)
        setLightboxAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ir, total, lightboxAbierto]);

  useEffect(() => {
    document.body.style.overflow = lightboxAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxAbierto]);

  if (total === 0) {
    return (
      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20" />
      </section>
    );
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distancia = touchStartX.current - touchEndX.current;
    if (Math.abs(distancia) > 50) {
      ir(distancia > 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <div
          className="group relative aspect-[16/9] cursor-zoom-in select-none overflow-hidden rounded-2xl bg-cream"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightboxAbierto(true)}
          role="button"
          aria-label="Ampliar foto"
        >
          {fotos.map((f, idx) => (
            <Image
              key={idx}
              src={f.urlLarge || f.url}
              alt={`${titulo} — foto ${idx + 1} de ${total}`}
              fill
              unoptimized
              sizes="(min-width: 1024px) 1024px, 100vw"
              className={`object-cover transition-opacity duration-150 ${
                idx === indice ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              priority={idx === 0}
            />
          ))}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  ir(-1);
                }}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-3 text-navy shadow-lg transition hover:bg-white sm:flex"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  ir(1);
                }}
                aria-label="Foto siguiente"
                className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-3 text-navy shadow-lg transition hover:bg-white sm:flex"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-body text-xs text-white backdrop-blur-sm">
            {indice + 1} / {total}
          </div>
        </div>

        {total > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto px-1 py-1.5">
            {fotos.map((f, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIndice(idx)}
                aria-label={`Ver foto ${idx + 1}`}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition ${
                  idx === indice
                    ? "ring-2 ring-gold ring-offset-2 ring-offset-white"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={f.urlMedium || f.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {lightboxAbierto && (
        <Lightbox
          fotos={fotos}
          indice={indice}
          titulo={titulo}
          onCambiar={(delta) => ir(delta)}
          onSeleccionar={setIndice}
          onCerrar={() => setLightboxAbierto(false)}
        />
      )}
    </>
  );
}

interface LightboxProps {
  fotos: FotoGaleria[];
  indice: number;
  titulo: string;
  onCambiar: (delta: number) => void;
  onSeleccionar: (idx: number) => void;
  onCerrar: () => void;
}

function Lightbox({
  fotos,
  indice,
  titulo,
  onCambiar,
  onSeleccionar,
  onCerrar,
}: LightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const total = fotos.length;
  const foto = fotos[indice];

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distancia = touchStartX.current - touchEndX.current;
    if (Math.abs(distancia) > 50) {
      onCambiar(distancia > 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotos ampliado"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCerrar();
        }}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div
        className="relative h-full w-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={foto.urlLarge || foto.url}
          alt={`${titulo} — foto ${indice + 1} de ${total}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCambiar(-1);
            }}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCambiar(1);
            }}
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 font-body text-sm text-white backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {indice + 1} / {total}
      </div>

      {/* Selector inferior con miniaturas (sólo desktop) */}
      {total > 1 && (
        <div
          className="absolute bottom-16 left-1/2 hidden max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto px-4 sm:flex"
          onClick={(e) => e.stopPropagation()}
        >
          {fotos.map((f, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSeleccionar(idx);
              }}
              aria-label={`Ver foto ${idx + 1}`}
              className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md transition ${
                idx === indice ? "ring-2 ring-gold" : "opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={f.urlMedium || f.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
