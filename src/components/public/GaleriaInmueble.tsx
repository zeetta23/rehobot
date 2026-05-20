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
      if (e.key === "ArrowLeft") ir(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ir, total]);

  if (total === 0) {
    return (
      <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20" />
      </section>
    );
  }

  const foto = fotos[indice];
  const src = foto.urlLarge || foto.url;

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
    <section className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
      <div
        className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-cream select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={src}
          src={src}
          alt={`${titulo} — foto ${indice + 1} de ${total}`}
          fill
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
          priority={indice === 0}
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(-1)}
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
              onClick={() => ir(1)}
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

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 font-body text-xs text-white backdrop-blur-sm">
          {indice + 1} / {total}
        </div>
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
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
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
