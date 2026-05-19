import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit as fbLimit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  EstadoInmueble,
  Operacion,
  TipoInmueble,
  CalificacionEnergetica,
} from "@/lib/types";

const ESTADOS_PUBLICOS: EstadoInmueble[] = ["activo", "reservado", "vendido"];

const COL = "inmuebles";

export interface InmuebleListadoItem {
  id: string;
  ref: string;
  titulo: string;
  operacion: Operacion;
  tipo: TipoInmueble;
  estado: EstadoInmueble;
  precio: number;
  municipio: string;
  zona: string;
}

function mapListadoItem(d: { id: string; data: () => DocumentData }): InmuebleListadoItem {
  const data = d.data();
  return {
    id: d.id,
    ref: data.ref ?? "",
    titulo: data.titulo ?? "(sin título)",
    operacion: data.operacion ?? "venta",
    tipo: data.tipo ?? "piso",
    estado: data.estado ?? "borrador",
    precio: data.precio ?? 0,
    municipio: data.ubicacion?.municipio ?? "",
    zona: data.ubicacion?.zona ?? "",
  };
}

export async function listarInmuebles(): Promise<InmuebleListadoItem[]> {
  const q = query(collection(db, COL), orderBy("fechaCreacion", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapListadoItem);
}

// ============================================================================
// Lectura pública (sin auth, respetando reglas)
// ============================================================================

export interface FiltrosPublicos {
  operacion?: Operacion;
  tipo?: TipoInmueble;
  municipio?: string;
}

export interface InmueblePublicoListado extends InmuebleListadoItem {
  slug: string;
  habitaciones: number;
  banos: number;
  metrosConstruidos: number;
  destacado: boolean;
  fotoPortada: string | null;
  fechaCreacionMs: number;
}

function mapPublicoListado(d: {
  id: string;
  data: () => DocumentData;
}): InmueblePublicoListado {
  const data = d.data();
  const fotos = (data.multimedia?.fotos ?? []) as Array<{
    urlMedium?: string;
    url?: string;
    portada?: boolean;
  }>;
  const portada =
    fotos.find((f) => f.portada) ?? fotos[0] ?? null;

  // fechaCreacion puede ser un Timestamp de Firestore o estar sin asignar.
  const fechaCreacionMs =
    typeof data.fechaCreacion?.toMillis === "function"
      ? data.fechaCreacion.toMillis()
      : 0;

  return {
    id: d.id,
    ref: data.ref ?? "",
    slug: data.slug ?? "",
    titulo: data.titulo ?? "(sin título)",
    operacion: data.operacion ?? "venta",
    tipo: data.tipo ?? "piso",
    estado: data.estado ?? "activo",
    precio: data.precio ?? 0,
    municipio: data.ubicacion?.municipio ?? "",
    zona: data.ubicacion?.zona ?? "",
    habitaciones: data.detalles?.habitaciones ?? 0,
    banos: data.detalles?.banos ?? 0,
    metrosConstruidos: data.detalles?.metrosConstruidos ?? 0,
    destacado: Boolean(data.destacado),
    fotoPortada: portada?.urlMedium ?? portada?.url ?? null,
    fechaCreacionMs,
  };
}

function ordenarPorRecientesDesc(
  items: InmueblePublicoListado[],
): InmueblePublicoListado[] {
  return [...items].sort((a, b) => b.fechaCreacionMs - a.fechaCreacionMs);
}

export async function listarInmueblesPublicos(
  filtros: FiltrosPublicos = {},
): Promise<InmueblePublicoListado[]> {
  // Solo "activo" para evitar pedir índices compuestos para 'in'.
  // Reservados/vendidos siguen accesibles por slug directo en la ficha.
  const constraints: QueryConstraint[] = [where("estado", "==", "activo")];
  if (filtros.operacion)
    constraints.push(where("operacion", "==", filtros.operacion));
  if (filtros.tipo) constraints.push(where("tipo", "==", filtros.tipo));
  if (filtros.municipio)
    constraints.push(where("ubicacion.municipio", "==", filtros.municipio));

  const q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  return ordenarPorRecientesDesc(snap.docs.map(mapPublicoListado));
}

export async function listarDestacados(
  max = 3,
): Promise<InmueblePublicoListado[]> {
  const q = query(
    collection(db, COL),
    where("estado", "==", "activo"),
    where("destacado", "==", true),
  );
  const snap = await getDocs(q);
  return ordenarPorRecientesDesc(snap.docs.map(mapPublicoListado)).slice(
    0,
    max,
  );
}

// Datos completos para la ficha (serializable: nada de Timestamps raw)
export interface InmuebleFichaData extends InmueblePublicoListado {
  descripcion: string;
  caracteristicas: string[];
  metrosUtiles: number | null;
  planta: string | null;
  anoConstruccion: number | null;
  orientacion: string | null;
  energetico: {
    consumo: CalificacionEnergetica;
    emisiones: CalificacionEnergetica;
    consumoKwh: number | null;
    emisionesKg: number | null;
  };
  coordenadas: { lat: number; lng: number };
  videoUrl: string | null;
  tour360Url: string | null;
  planoUrl: string | null;
}

export async function obtenerInmueblePorSlug(
  slug: string,
): Promise<InmuebleFichaData | null> {
  let snap;
  try {
    snap = await getDocs(
      query(collection(db, COL), where("slug", "==", slug), fbLimit(1)),
    );
  } catch {
    // Si las reglas deniegan (slug de un borrador/archivado), devolvemos null.
    return null;
  }
  if (snap.empty) return null;

  const doc = snap.docs[0];
  const estado = doc.data().estado as EstadoInmueble | undefined;
  if (!estado || !ESTADOS_PUBLICOS.includes(estado)) {
    return null;
  }
  const base = mapPublicoListado(doc);
  const data = doc.data();

  return {
    ...base,
    descripcion: data.descripcion ?? "",
    caracteristicas: (data.caracteristicas ?? []) as string[],
    metrosUtiles: data.detalles?.metrosUtiles ?? null,
    planta: data.detalles?.planta ?? null,
    anoConstruccion: data.detalles?.anoConstruccion ?? null,
    orientacion: data.detalles?.orientacion ?? null,
    energetico: {
      consumo: data.energetico?.consumo ?? "en_tramite",
      emisiones: data.energetico?.emisiones ?? "en_tramite",
      consumoKwh: data.energetico?.consumoKwh ?? null,
      emisionesKg: data.energetico?.emisionesKg ?? null,
    },
    coordenadas: {
      lat: data.ubicacion?.coordenadas?.lat ?? 0,
      lng: data.ubicacion?.coordenadas?.lng ?? 0,
    },
    videoUrl: data.multimedia?.videoUrl ?? null,
    tour360Url: data.multimedia?.tour360Url ?? null,
    planoUrl: data.multimedia?.planoUrl ?? null,
  };
}

export interface NuevoInmuebleInput {
  titulo: string;
  operacion: Operacion;
  tipo: TipoInmueble;
  estado: EstadoInmueble;
  precio: number;
  destacado: boolean;
  municipio: string;
  zona: string;
  habitaciones: number;
  banos: number;
  metrosConstruidos: number;
  consumoEnergetico: CalificacionEnergetica;
  emisionesEnergetico: CalificacionEnergetica;
  descripcion: string;
  agente: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function crearInmueble(
  input: NuevoInmuebleInput,
): Promise<string> {
  const ref = `R-${Date.now().toString().slice(-6)}`;
  const slug = `${slugify(input.titulo)}-${ref.toLowerCase()}`;

  const docData = {
    ref,
    slug,
    titulo: input.titulo,
    operacion: input.operacion,
    tipo: input.tipo,
    estado: input.estado,
    destacado: input.destacado,
    precio: input.precio,
    precioAnterior: null,
    ubicacion: {
      municipio: input.municipio,
      zona: input.zona,
      direccion: "",
      coordenadas: { lat: 0, lng: 0 },
      radioPrivacidad: 100,
    },
    detalles: {
      habitaciones: input.habitaciones,
      banos: input.banos,
      metrosConstruidos: input.metrosConstruidos,
      metrosUtiles: null,
      planta: null,
      anoConstruccion: null,
      orientacion: null,
      estado: null,
    },
    energetico: {
      consumo: input.consumoEnergetico,
      emisiones: input.emisionesEnergetico,
      consumoKwh: null,
      emisionesKg: null,
    },
    descripcion: input.descripcion,
    caracteristicas: [],
    multimedia: {
      fotos: [],
      videoUrl: null,
      tour360Url: null,
      planoUrl: null,
    },
    agente: input.agente,
    stats: { vistas: 0, contactos: 0, favoritos: 0 },
    seo: { metaTitle: null, metaDescription: null },
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
    fechaPublicacion: input.estado === "activo" ? serverTimestamp() : null,
  };

  const docRef = await addDoc(collection(db, COL), docData);
  return docRef.id;
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(precio);
}

export function colorEstado(estado: EstadoInmueble): string {
  const map: Record<EstadoInmueble, string> = {
    borrador: "bg-gray-200 text-gray-700",
    activo: "bg-green-100 text-green-800",
    reservado: "bg-yellow-100 text-yellow-800",
    vendido: "bg-blue-100 text-blue-800",
    archivado: "bg-red-100 text-red-700",
  };
  return map[estado];
}
