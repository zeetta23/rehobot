export default function Home() {
  const paleta = [
    { nombre: "Navy", clase: "bg-navy", hex: "#0A1F44" },
    { nombre: "Navy medio", clase: "bg-navy-medium", hex: "#1E3A6F" },
    { nombre: "Gold", clase: "bg-gold", hex: "#C9A96E" },
    { nombre: "Gold claro", clase: "bg-gold-light", hex: "#E4C896" },
    { nombre: "Crema", clase: "bg-cream", hex: "#F5F5F7" },
    { nombre: "Gris texto", clase: "bg-gray-text", hex: "#6B7280" },
  ];

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-navy px-6 py-24 text-center">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-gold">
        Rehobot Real Estate
      </p>

      <h1 className="mt-6 font-display text-5xl font-semibold text-white sm:text-6xl">
        Inmobiliaria del{" "}
        <span className="text-gold">Corredor del Henares</span>
      </h1>

      <div className="mt-8 h-px w-24 bg-gold" />

      <p className="mt-8 max-w-xl font-body text-base text-white/80 sm:text-lg">
        Compra y venta de viviendas en Alcalá de Henares, Torrejón, Coslada
        y alrededores. Próximamente disponible.
      </p>

      <p className="mt-16 font-body text-xs uppercase tracking-[0.3em] text-white/40">
        Paleta corporativa
      </p>

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {paleta.map(({ nombre, clase, hex }) => (
          <li
            key={nombre}
            className="flex flex-col items-center gap-2"
            title={`${nombre} · ${hex}`}
          >
            <span
              className={`${clase} block h-10 w-10 rounded-full ring-1 ring-white/20`}
            />
            <span className="font-body text-[10px] text-white/50">{hex}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
