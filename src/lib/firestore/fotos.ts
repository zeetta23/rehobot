import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { FotoInmueble } from "@/lib/types";

function sanitizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function subirFotoInmueble(
  inmuebleId: string,
  file: File,
  orden: number,
  portada: boolean,
): Promise<FotoInmueble> {
  const nombre = `${Date.now()}-${orden}-${sanitizarNombre(file.name)}`;
  const path = `inmuebles/${inmuebleId}/${nombre}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file, { contentType: file.type });
  const url = await getDownloadURL(ref);
  // next/image se encarga de generar versiones redimensionadas, así que
  // guardamos la misma URL en thumb/medium/large por compatibilidad con el
  // modelo de datos (FotoInmueble del documento técnico).
  return {
    url,
    urlThumb: url,
    urlMedium: url,
    urlLarge: url,
    orden,
    portada,
  };
}

export async function eliminarFotoInmueble(url: string): Promise<void> {
  try {
    const ref = storageRef(storage, url);
    await deleteObject(ref);
  } catch {
    // Silencioso si ya no existe.
  }
}
