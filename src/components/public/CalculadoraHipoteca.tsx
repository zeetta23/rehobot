"use client";

import { useMemo, useState } from "react";

interface Props {
  precioInicial: number;
}

function formatEuros(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

interface Resultado {
  capital: number;
  cuotaMensual: number;
  totalIntereses: number;
  totalPagado: number;
  pctEntrada: number;
}

function calcular(
  precio: number,
  ahorros: number,
  anios: number,
  interesAnual: number,
): Resultado {
  const capital = Math.max(precio - ahorros, 0);
  const n = anios * 12;
  const i = interesAnual / 100 / 12;

  let cuotaMensual = 0;
  if (capital > 0 && n > 0) {
    if (i === 0) {
      cuotaMensual = capital / n;
    } else {
      // Cuota constante (amortización francesa)
      cuotaMensual = (capital * i) / (1 - Math.pow(1 + i, -n));
    }
  }
  const totalPagado = cuotaMensual * n;
  const totalIntereses = totalPagado - capital;
  const pctEntrada = precio > 0 ? (ahorros / precio) * 100 : 0;
  return { capital, cuotaMensual, totalIntereses, totalPagado, pctEntrada };
}

export function CalculadoraHipoteca({ precioInicial }: Props) {
  const precioPorDefecto = precioInicial > 0 ? precioInicial : 200000;
  const [precio, setPrecio] = useState(precioPorDefecto);
  const [ahorros, setAhorros] = useState(Math.round(precioPorDefecto * 0.2));
  const [anios, setAnios] = useState(30);
  const [interes, setInteres] = useState(3.5);

  const r = useMemo(
    () => calcular(precio, ahorros, anios, interes),
    [precio, ahorros, anios, interes],
  );

  function setEntradaPorcentaje(pct: number) {
    setAhorros(Math.round((precio * pct) / 100));
  }

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
        Simulador
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
        ¿Cuánto pagarías al mes?
      </h2>
      <p className="mt-2 font-body text-sm text-gray-text">
        Cálculo orientativo. Las condiciones reales dependen del banco y de
        tu perfil financiero.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Controles */}
        <div className="space-y-6">
          {/* Precio */}
          <div>
            <div className="flex items-end justify-between">
              <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Precio del inmueble
              </label>
              <span className="font-display text-lg font-semibold text-navy">
                {formatEuros(precio)}
              </span>
            </div>
            <input
              type="range"
              min={50000}
              max={1500000}
              step={5000}
              value={precio}
              onChange={(e) => {
                const nuevo = Number(e.target.value);
                setPrecio(nuevo);
                // Mantenemos el % de entrada al mover el precio
                setAhorros(Math.round((nuevo * r.pctEntrada) / 100));
              }}
              className="mt-3 w-full accent-gold"
            />
          </div>

          {/* Ahorros / Entrada */}
          <div>
            <div className="flex items-end justify-between">
              <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Ahorros / entrada
              </label>
              <span className="font-display text-lg font-semibold text-navy">
                {formatEuros(ahorros)}{" "}
                <span className="font-body text-xs font-normal text-gray-text">
                  ({r.pctEntrada.toFixed(0)} %)
                </span>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={precio}
              step={1000}
              value={ahorros}
              onChange={(e) => setAhorros(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[10, 15, 20, 25, 30].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setEntradaPorcentaje(pct)}
                  className="rounded-full border border-navy/15 px-2.5 py-0.5 font-body text-[10px] text-navy hover:bg-navy hover:text-white"
                >
                  {pct} %
                </button>
              ))}
            </div>
          </div>

          {/* Plazo */}
          <div>
            <div className="flex items-end justify-between">
              <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Plazo
              </label>
              <span className="font-display text-lg font-semibold text-navy">
                {anios} años
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={anios}
              onChange={(e) => setAnios(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
            />
          </div>

          {/* Interés */}
          <div>
            <div className="flex items-end justify-between">
              <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                Interés anual
              </label>
              <span className="font-display text-lg font-semibold text-navy">
                {interes.toFixed(2)} %
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={7}
              step={0.05}
              value={interes}
              onChange={(e) => setInteres(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
            />
            <p className="mt-2 font-body text-xs text-gray-text">
              Referencia para 2026: hipotecas a tipo fijo entre 2,5 y 4 %.
            </p>
          </div>
        </div>

        {/* Resultado */}
        <div className="flex flex-col justify-center rounded-2xl bg-navy p-6 text-white sm:p-8">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
            Cuota mensual estimada
          </p>
          <p className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
            {formatEuros(r.cuotaMensual)}
          </p>
          <p className="mt-1 font-body text-xs text-white/60">
            al mes durante {anios} años
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 font-body text-xs text-white/70">
            <div>
              <dt className="uppercase tracking-widest text-white/50">
                Capital prestado
              </dt>
              <dd className="mt-1 font-display text-lg text-white">
                {formatEuros(r.capital)}
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-widest text-white/50">
                Intereses totales
              </dt>
              <dd className="mt-1 font-display text-lg text-white">
                {formatEuros(r.totalIntereses)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="uppercase tracking-widest text-white/50">
                Total a devolver
              </dt>
              <dd className="mt-1 font-display text-lg text-white">
                {formatEuros(r.totalPagado)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
