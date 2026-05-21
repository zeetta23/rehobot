import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MUNICIPIOS_CORREDOR } from "@/lib/types";

const DOC_PATH = ["configuracion", "zonas"] as const;

export interface ZonasDoc {
  items: string[];
  fechaActualizacion?: unknown;
}

/**
 * Devuelve la lista de zonas configurada. Si el documento aún no existe,
 * devuelve el fallback `MUNICIPIOS_CORREDOR`. Las zonas se devuelven en el
 * orden guardado por el admin.
 */
export async function obtenerZonas(): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db, DOC_PATH[0], DOC_PATH[1]));
    if (snap.exists()) {
      const data = snap.data() as ZonasDoc;
      const items = Array.isArray(data.items)
        ? data.items.map((s) => String(s).trim()).filter(Boolean)
        : [];
      if (items.length > 0) return items;
    }
  } catch {
    // Silencioso: cae al fallback.
  }
  return [...MUNICIPIOS_CORREDOR];
}

/** Sobrescribe la lista entera de zonas. */
export async function guardarZonas(items: string[]): Promise<void> {
  const limpio = Array.from(
    new Set(items.map((s) => String(s).trim()).filter(Boolean)),
  );
  await setDoc(doc(db, DOC_PATH[0], DOC_PATH[1]), {
    items: limpio,
    fechaActualizacion: serverTimestamp(),
  });
}
