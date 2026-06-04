/**
 * Comprime una imagen en el navegador antes de subirla a Storage.
 *
 * - Redimensiona manteniendo aspect ratio para que el lado mayor no supere
 *   `maxLado` px (1920 por defecto).
 * - Reencoda como JPEG con calidad `calidad` (0.82 por defecto: muy buena
 *   calidad visual a ~5x menos peso que la foto original del móvil).
 * - Si por cualquier razón falla la compresión (HEIC sin soporte nativo,
 *   archivo corrupto, etc.) devuelve el File original sin tocar.
 */
export async function comprimirImagen(
  file: File,
  opts: { maxLado?: number; calidad?: number } = {},
): Promise<File> {
  const { maxLado = 1920, calidad = 0.82 } = opts;

  if (!file.type.startsWith("image/")) return file;
  if (typeof document === "undefined") return file;

  try {
    const bitmap = await leerComoBitmap(file);
    const { width: w0, height: h0 } = bitmap;

    const escala = Math.min(1, maxLado / Math.max(w0, h0));
    const w = Math.round(w0 * escala);
    const h = Math.round(h0 * escala);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", calidad),
    );
    if (!blob) return file;

    // Si por casualidad la "compresión" sale más grande que el original
    // (puede pasar con fotos ya muy optimizadas), devolvemos el original.
    if (blob.size >= file.size) return file;

    const nombre = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nombre, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

async function leerComoBitmap(file: File): Promise<ImageBitmap> {
  // createImageBitmap es lo más rápido cuando está disponible (decodifica
  // fuera del hilo principal). Cae a HTMLImageElement como fallback.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // sigue al fallback
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo decodificar la imagen"));
      el.src = url;
    });
    return (await createImageBitmap(img)) as ImageBitmap;
  } finally {
    URL.revokeObjectURL(url);
  }
}
