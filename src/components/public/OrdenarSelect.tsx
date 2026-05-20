"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPCIONES = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "metros_asc", label: "m²: menor a mayor" },
  { value: "metros_desc", label: "m²: mayor a menor" },
];

export function OrdenarSelect({ valor }: { valor: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (e.target.value === "recientes" || !e.target.value) {
      params.delete("orden");
    } else {
      params.set("orden", e.target.value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="flex items-center gap-2 font-body text-xs text-gray-text">
      <span className="hidden sm:inline">Ordenar:</span>
      <select
        value={valor}
        onChange={handleChange}
        className="rounded-md border border-black/10 bg-white px-2 py-1 font-body text-sm text-dark"
      >
        {OPCIONES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
