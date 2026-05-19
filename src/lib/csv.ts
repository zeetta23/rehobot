// Utilidad sencilla para exportar arrays de objetos a CSV.

function escapar(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  const str = String(valor);
  // Si contiene comas, comillas o saltos, lo entrecomillamos y duplicamos comillas internas.
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function aCsv<T extends Record<string, unknown>>(
  rows: T[],
  columnas: { key: keyof T; label: string }[],
): string {
  const cabecera = columnas.map((c) => escapar(c.label)).join(",");
  const filas = rows.map((row) =>
    columnas.map((c) => escapar(row[c.key])).join(","),
  );
  // BOM al principio para que Excel detecte UTF-8 correctamente.
  return "﻿" + [cabecera, ...filas].join("\n");
}

export function descargarCsv(csv: string, nombreFichero: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreFichero;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
