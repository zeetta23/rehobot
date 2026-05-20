"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  vista: "grid" | "mapa";
}

export function VistaToggle({ vista }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function cambiar(nueva: "grid" | "mapa") {
    if (nueva === vista) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (nueva === "grid") {
      params.delete("vista");
    } else {
      params.set("vista", "mapa");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="inline-flex rounded-full border border-navy/15 p-1">
      <button
        type="button"
        onClick={() => cambiar("grid")}
        className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${
          vista === "grid"
            ? "bg-navy text-white"
            : "text-navy hover:bg-cream"
        }`}
      >
        Cuadrícula
      </button>
      <button
        type="button"
        onClick={() => cambiar("mapa")}
        className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${
          vista === "mapa"
            ? "bg-navy text-white"
            : "text-navy hover:bg-cream"
        }`}
      >
        Mapa
      </button>
    </div>
  );
}
