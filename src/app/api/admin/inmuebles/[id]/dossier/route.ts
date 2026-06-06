import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { verificarAuth } from "@/lib/auth/api-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { DossierInmueble } from "@/lib/pdf/DossierInmueble";
import { fetchImagenParaPdf } from "@/lib/pdf/fetch-imagen";
import type { InmuebleAdminData } from "@/lib/firestore/inmuebles";
import type { FotoInmueble, CalificacionEnergetica } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteCtx) {
  const auth = await verificarAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const db = getAdminDb();
  const snap = await db.collection("inmuebles").doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Inmueble no encontrado" }, { status: 404 });
  }

  const data = snap.data() ?? {};
  const fotos = ((data.multimedia?.fotos ?? []) as FotoInmueble[])
    .slice()
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  const inmueble: InmuebleAdminData = {
    id: snap.id,
    ref: data.ref ?? "",
    slug: data.slug ?? "",
    titulo: data.titulo ?? "",
    operacion: data.operacion ?? "venta",
    tipo: data.tipo ?? "piso",
    estado: data.estado ?? "borrador",
    destacado: Boolean(data.destacado),
    precio: data.precio ?? 0,
    municipio: data.ubicacion?.municipio ?? "",
    zona: data.ubicacion?.zona ?? "",
    direccion: data.ubicacion?.direccion ?? "",
    mostrarDireccion: Boolean(data.ubicacion?.mostrarDireccion),
    coordenadas: {
      lat: data.ubicacion?.coordenadas?.lat ?? 0,
      lng: data.ubicacion?.coordenadas?.lng ?? 0,
    },
    habitaciones: data.detalles?.habitaciones ?? 0,
    banos: data.detalles?.banos ?? 0,
    metrosConstruidos: data.detalles?.metrosConstruidos ?? 0,
    anoConstruccion: data.detalles?.anoConstruccion ?? null,
    tipoCocina: data.detalles?.tipoCocina ?? null,
    gastosComunidad: data.detalles?.gastosComunidad ?? null,
    tipoCalefaccion: data.detalles?.tipoCalefaccion ?? null,
    consumoEnergetico:
      (data.energetico?.consumo as CalificacionEnergetica | undefined) ??
      "en_tramite",
    emisionesEnergetico:
      (data.energetico?.emisiones as CalificacionEnergetica | undefined) ??
      "en_tramite",
    descripcion: data.descripcion ?? "",
    caracteristicas: (data.caracteristicas ?? []) as string[],
    agente: data.agente ?? "",
    fotos,
  };

  // Agente asignado (puede no existir)
  let agente: {
    nombre: string;
    email: string;
    telefono: string;
    cargo: string;
  } | null = null;
  if (inmueble.agente) {
    const agenteDoc = await db.collection("usuarios").doc(inmueble.agente).get();
    if (agenteDoc.exists) {
      const a = agenteDoc.data() ?? {};
      agente = {
        nombre: a.perfil?.nombre ?? a.email ?? "",
        email: a.email ?? "",
        telefono: a.perfil?.telefono ?? "",
        cargo: a.perfil?.cargo ?? "",
      };
    }
  }

  // Datos de empresa desde configuración
  const configDoc = await db
    .collection("configuracion")
    .doc("sitio")
    .get();
  const cfg = configDoc.exists ? configDoc.data() ?? {} : {};
  const empresa = {
    nombre: cfg.empresa?.nombre ?? "Rehobot Real Estate",
    telefono: cfg.empresa?.telefono ?? "",
    email: cfg.empresa?.email ?? "",
    whatsapp: cfg.empresa?.whatsappPrincipal ?? "",
  };

  const ahora = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Pre-descargamos hasta 24 fotos en paralelo (portada + 8 grandes en
  // galería + hasta 16 más para el índice fotográfico en mosaico).
  // react-pdf no soporta WebP y a veces tampoco resuelve URLs externas
  // dentro del runtime serverless, así que las traemos nosotros y las
  // reencodamos a JPEG con sharp.
  const fotosParaDescargar = inmueble.fotos.slice(0, 24);
  const imagenes = await Promise.all(
    fotosParaDescargar.map((f) => fetchImagenParaPdf(f.url)),
  );

  const pdf = await renderToBuffer(
    DossierInmueble({ inmueble, imagenes, agente, empresa, ahora }),
  );

  const fileName = `dossier-${inmueble.ref || inmueble.slug || inmueble.id}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
