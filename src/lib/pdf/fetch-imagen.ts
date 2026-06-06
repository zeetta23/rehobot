import sharp from "sharp";

export interface ImagenPdf {
  data: Buffer;
  format: "jpg" | "png";
}

/**
 * Descarga una URL de Firebase Storage y la convierte a un formato apto
 * para react-pdf (JPG o PNG). WebP se convierte a JPEG porque react-pdf
 * no soporta WebP nativamente. Si la imagen es demasiado grande, la
 * reduce a 1600px de lado mayor para que el PDF no pese decenas de MB.
 *
 * Devuelve null si algo falla; el caller debe omitir la imagen en ese
 * caso para no romper la generación del PDF.
 */
export async function fetchImagenParaPdf(
  url: string,
): Promise<ImagenPdf | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const buf = Buffer.from(await resp.arrayBuffer());

    // sharp lo detecta solo y reencoda a JPEG (el formato más compacto
    // para fotos). Limitamos a 1600px para que cada foto pese ~200-400 KB.
    const data = await sharp(buf)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return { data, format: "jpg" };
  } catch {
    return null;
  }
}
