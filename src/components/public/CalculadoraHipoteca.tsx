"use client";

import { useMemo, useState } from "react";

interface Props {
  precioInicial: number;
}

type Modo = "cuota" | "presupuesto";

function formatEuros(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ============================================================================
// Modo 1: Cuota mensual (precio + ahorros + plazo + interés → cuota)
// ============================================================================

interface ResultadoCuota {
  capital: number;
  cuotaMensual: number;
  totalIntereses: number;
  totalPagado: number;
  pctEntrada: number;
}

function calcularCuota(
  precio: number,
  ahorros: number,
  anios: number,
  interesAnual: number,
): ResultadoCuota {
  const capital = Math.max(precio - ahorros, 0);
  const n = anios * 12;
  const i = interesAnual / 100 / 12;

  let cuotaMensual = 0;
  if (capital > 0 && n > 0) {
    if (i === 0) {
      cuotaMensual = capital / n;
    } else {
      cuotaMensual = (capital * i) / (1 - Math.pow(1 + i, -n));
    }
  }
  const totalPagado = cuotaMensual * n;
  const totalIntereses = totalPagado - capital;
  const pctEntrada = precio > 0 ? (ahorros / precio) * 100 : 0;
  return { capital, cuotaMensual, totalIntereses, totalPagado, pctEntrada };
}

// ============================================================================
// Modo 2: Presupuesto máximo (ingresos + edad + interés + plazo → capital máx)
// ============================================================================

// Ratio de endeudamiento recomendado (% de ingresos que va a la hipoteca)
const RATIO_ENDEUDAMIENTO = 0.33;
// Edad límite a la que se debe acabar la hipoteca según la mayoría de bancos.
const EDAD_LIMITE = 75;

interface ResultadoPresupuesto {
  cuotaMaxima: number;
  capitalMaximo: number;
  plazoEfectivoAnios: number;
  edadFinHipoteca: number;
}

function calcularPresupuesto(
  ingresosMensuales: number,
  edad: number,
  anios: number,
  interesAnual: number,
): ResultadoPresupuesto {
  const aniosMaxPorEdad = Math.max(0, EDAD_LIMITE - edad);
  const plazoEfectivoAnios = Math.min(anios, aniosMaxPorEdad, 40);
  const n = plazoEfectivoAnios * 12;
  const i = interesAnual / 100 / 12;
  const cuotaMaxima = ingresosMensuales * RATIO_ENDEUDAMIENTO;

  let capitalMaximo = 0;
  if (cuotaMaxima > 0 && n > 0) {
    if (i === 0) {
      capitalMaximo = cuotaMaxima * n;
    } else {
      capitalMaximo = (cuotaMaxima * (1 - Math.pow(1 + i, -n))) / i;
    }
  }

  return {
    cuotaMaxima,
    capitalMaximo,
    plazoEfectivoAnios,
    edadFinHipoteca: edad + plazoEfectivoAnios,
  };
}

// ============================================================================
// Componente principal
// ============================================================================

export function CalculadoraHipoteca({ precioInicial }: Props) {
  const precioPorDefecto = precioInicial > 0 ? precioInicial : 200000;
  const [modo, setModo] = useState<Modo>("cuota");

  // Estado modo "Cuota mensual"
  const [precio, setPrecio] = useState(precioPorDefecto);
  const [ahorros, setAhorros] = useState(Math.round(precioPorDefecto * 0.2));
  const [aniosCuota, setAniosCuota] = useState(30);
  const [interesCuota, setInteresCuota] = useState(3.5);

  // Estado modo "Presupuesto máximo"
  const [ingresos, setIngresos] = useState(2500);
  const [edad, setEdad] = useState(35);
  const [aniosPresup, setAniosPresup] = useState(30);
  const [interesPresup, setInteresPresup] = useState(3.5);

  const rCuota = useMemo(
    () => calcularCuota(precio, ahorros, aniosCuota, interesCuota),
    [precio, ahorros, aniosCuota, interesCuota],
  );

  const rPresup = useMemo(
    () => calcularPresupuesto(ingresos, edad, aniosPresup, interesPresup),
    [ingresos, edad, aniosPresup, interesPresup],
  );

  function setEntradaPorcentaje(pct: number) {
    setAhorros(Math.round((precio * pct) / 100));
  }

  const aniosMaxPresup = Math.min(40, Math.max(0, EDAD_LIMITE - edad));

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
        Simulador
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
        Calcula tu hipoteca
      </h2>
      <p className="mt-2 font-body text-sm text-gray-text">
        Cálculo orientativo. Las condiciones reales dependen del banco y de
        tu perfil financiero.
      </p>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-full border border-navy/15 p-1">
        <button
          type="button"
          onClick={() => setModo("cuota")}
          className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${
            modo === "cuota" ? "bg-navy text-white" : "text-navy hover:bg-cream"
          }`}
        >
          Cuota mensual
        </button>
        <button
          type="button"
          onClick={() => setModo("presupuesto")}
          className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${
            modo === "presupuesto"
              ? "bg-navy text-white"
              : "text-navy hover:bg-cream"
          }`}
        >
          Presupuesto máximo
        </button>
      </div>

      {modo === "cuota" ? (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Controles modo cuota */}
          <div className="space-y-6">
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
                  setAhorros(Math.round((nuevo * rCuota.pctEntrada) / 100));
                }}
                className="mt-3 w-full accent-gold"
              />
            </div>

            <div>
              <div className="flex items-end justify-between">
                <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Ahorros / entrada
                </label>
                <span className="font-display text-lg font-semibold text-navy">
                  {formatEuros(ahorros)}{" "}
                  <span className="font-body text-xs font-normal text-gray-text">
                    ({rCuota.pctEntrada.toFixed(0)} %)
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

            <div>
              <div className="flex items-end justify-between">
                <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Plazo
                </label>
                <span className="font-display text-lg font-semibold text-navy">
                  {aniosCuota} años
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={aniosCuota}
                onChange={(e) => setAniosCuota(Number(e.target.value))}
                className="mt-3 w-full accent-gold"
              />
            </div>

            <div>
              <div className="flex items-end justify-between">
                <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Interés anual
                </label>
                <span className="font-display text-lg font-semibold text-navy">
                  {interesCuota.toFixed(2)} %
                </span>
              </div>
              <input
                type="range"
                min={1.5}
                max={6}
                step={0.05}
                value={interesCuota}
                onChange={(e) => setInteresCuota(Number(e.target.value))}
                className="mt-3 w-full accent-gold"
              />
              <p className="mt-2 font-body text-xs text-gray-text">
                Referencia 2026: hipotecas a tipo fijo entre 2,5 y 4 %.
              </p>
            </div>
          </div>

          {/* Resultado modo cuota */}
          <div className="flex flex-col justify-center rounded-2xl bg-navy p-6 text-white sm:p-8">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
              Cuota mensual estimada
            </p>
            <p className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
              {formatEuros(rCuota.cuotaMensual)}
            </p>
            <p className="mt-1 font-body text-xs text-white/60">
              al mes durante {aniosCuota} años
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 font-body text-xs text-white/70">
              <div>
                <dt className="uppercase tracking-widest text-white/50">
                  Capital prestado
                </dt>
                <dd className="mt-1 font-display text-lg text-white">
                  {formatEuros(rCuota.capital)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-widest text-white/50">
                  Intereses totales
                </dt>
                <dd className="mt-1 font-display text-lg text-white">
                  {formatEuros(rCuota.totalIntereses)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="uppercase tracking-widest text-white/50">
                  Total a devolver
                </dt>
                <dd className="mt-1 font-display text-lg text-white">
                  {formatEuros(rCuota.totalPagado)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Controles modo presupuesto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-end justify-between">
                <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Ingresos netos mensuales
                </label>
                <span className="font-display text-lg font-semibold text-navy">
                  {formatEuros(ingresos)}
                </span>
              </div>
              <input
                type="range"
                min={800}
                max={10000}
                step={50}
                value={ingresos}
                onChange={(e) => setIngresos(Number(e.target.value))}
                className="mt-3 w-full accent-gold"
              />
              <p className="mt-2 font-body text-xs text-gray-text">
                Si os pedís la hipoteca dos personas, suma los ingresos
                netos de los dos.
              </p>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Edad
                </label>
                <span className="font-display text-lg font-semibold text-navy">
                  {edad} años
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={70}
                step={1}
                value={edad}
                onChange={(e) => {
                  const nueva = Number(e.target.value);
                  setEdad(nueva);
                  // Si el plazo actual supera el límite por edad, lo ajustamos.
                  const max = Math.min(40, Math.max(0, EDAD_LIMITE - nueva));
                  if (aniosPresup > max) setAniosPresup(max);
                }}
                className="mt-3 w-full accent-gold"
              />
            </div>

            <div>
              <div className="flex items-end justify-between">
                <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Plazo de la hipoteca
                </label>
                <span className="font-display text-lg font-semibold text-navy">
                  {rPresup.plazoEfectivoAnios} años
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={Math.max(5, aniosMaxPresup)}
                step={1}
                value={Math.min(aniosPresup, Math.max(5, aniosMaxPresup))}
                onChange={(e) => setAniosPresup(Number(e.target.value))}
                className="mt-3 w-full accent-gold"
              />
              <p className="mt-2 font-body text-xs text-gray-text">
                Máximo {aniosMaxPresup} años porque la mayoría de bancos
                exigen acabar antes de los {EDAD_LIMITE} (
                terminarías con {rPresup.edadFinHipoteca}).
              </p>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <label className="font-body text-xs font-semibold uppercase tracking-widest text-navy">
                  Interés anual
                </label>
                <span className="font-display text-lg font-semibold text-navy">
                  {interesPresup.toFixed(2)} %
                </span>
              </div>
              <input
                type="range"
                min={1.5}
                max={6}
                step={0.05}
                value={interesPresup}
                onChange={(e) => setInteresPresup(Number(e.target.value))}
                className="mt-3 w-full accent-gold"
              />
            </div>
          </div>

          {/* Resultado modo presupuesto */}
          <div className="flex flex-col justify-center rounded-2xl bg-navy p-6 text-white sm:p-8">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
              Capital máximo financiable
            </p>
            <p className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
              {formatEuros(rPresup.capitalMaximo)}
            </p>
            <p className="mt-1 font-body text-xs text-white/60">
              con cuota máxima de {formatEuros(rPresup.cuotaMaxima)}/mes
              (33 % de tus ingresos)
            </p>

            <p className="mt-6 font-body text-xs text-white/70">
              A esta cifra súmale el dinero que tengas ahorrado para la
              entrada. Por ejemplo, con{" "}
              <strong className="text-white">
                {formatEuros(precioInicial * 0.2)}
              </strong>{" "}
              de entrada (20 % típico) podrías mirar inmuebles hasta{" "}
              <strong className="text-gold">
                {formatEuros(rPresup.capitalMaximo + precioInicial * 0.2)}
              </strong>
              .
            </p>

            {precioInicial > 0 && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 font-body text-xs">
                <p className="uppercase tracking-widest text-white/50">
                  Este inmueble cuesta
                </p>
                <p className="mt-1 font-display text-xl text-white">
                  {formatEuros(precioInicial)}
                </p>
                {(() => {
                  // Asumimos un 20% de entrada como referencia para la comparación.
                  const presupTotal20 =
                    rPresup.capitalMaximo + precioInicial * 0.2;
                  if (presupTotal20 >= precioInicial) {
                    return (
                      <p className="mt-2 text-green-300">
                        ✓ Encaja en tu presupuesto.
                      </p>
                    );
                  }
                  const dif = precioInicial - presupTotal20;
                  return (
                    <p className="mt-2 text-yellow-300">
                      Supera tu presupuesto en {formatEuros(dif)} (con 20% de
                      entrada). Necesitarías más ahorros o ampliar el plazo
                      de la hipoteca.
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
