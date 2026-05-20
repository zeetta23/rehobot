import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
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
import {
  subirFotoInmueble,
  eliminarFotoInmueble,
} from "@/lib/firestore/fotos";
import type {
  EstadoInmueble,
  Operacion,
  TipoInmueble,
  CalificacionEnergetica,
  FotoInmueble,
} from "@/lib/types";

const ESTADOS_PUBLICOS: EstadoInmueble[] = ["activo", "reservado", "vendido"];

const COL = "inmuebles";

export interface InmuebleListadoItem {
  id: string;
  ref: string;
  slug: string;
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
    slug: data.slug ?? "",
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
  precioMin?: number;
  precioMax?: number;
  habitacionesMin?: number;
  banosMin?: number;
  metrosMin?: number;
  orden?: "recientes" | "precio_asc" | "precio_desc" | "metros_asc" | "metros_desc";
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

  let items = snap.docs.map(mapPublicoListado);

  // Filtros numéricos en JS (evitan requerir índices compuestos).
  if (typeof filtros.precioMin === "number") {
    items = items.filter((i) => i.precio >= filtros.precioMin!);
  }
  if (typeof filtros.precioMax === "number") {
    items = items.filter((i) => i.precio <= filtros.precioMax!);
  }
  if (typeof filtros.habitacionesMin === "number") {
    items = items.filter((i) => i.habitaciones >= filtros.habitacionesMin!);
  }
  if (typeof filtros.banosMin === "number") {
    items = items.filter((i) => i.banos >= filtros.banosMin!);
  }
  if (typeof filtros.metrosMin === "number") {
    items = items.filter((i) => i.metrosConstruidos >= filtros.metrosMin!);
  }

  // Ordenación.
  switch (filtros.orden) {
    case "precio_asc":
      items.sort((a, b) => a.precio - b.precio);
      break;
    case "precio_desc":
      items.sort((a, b) => b.precio - a.precio);
      break;
    case "metros_asc":
      items.sort((a, b) => a.metrosConstruidos - b.metrosConstruidos);
      break;
    case "metros_desc":
      items.sort((a, b) => b.metrosConstruidos - a.metrosConstruidos);
      break;
    case "recientes":
    default:
      items = ordenarPorRecientesDesc(items);
      break;
  }

  return items;
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
  fotos: FotoInmueble[];
}

export async function obtenerInmueblePorSlug(
  slug: string,
): Promise<InmuebleFichaData | null> {
  // Las reglas Firestore exigen filtrar por estado para permitir la lectura.
  // Hacemos una query por slug por cada estado público y devolvemos el primero.
  for (const estado of ESTADOS_PUBLICOS) {
    let snap;
    try {
      snap = await getDocs(
        query(
          collection(db, COL),
          where("slug", "==", slug),
          where("estado", "==", estado),
          fbLimit(1),
        ),
      );
    } catch {
      continue;
    }
    if (snap.empty) continue;

    const doc = snap.docs[0];
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
      fotos: ((data.multimedia?.fotos ?? []) as FotoInmueble[])
        .slice()
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    };
  }

  return null;
}

// Contador de inmuebles activos para el dashboard (no requiere auth gracias
// a las reglas Firestore que permiten lectura pública de estado='activo').
export async function contarInmueblesActivos(): Promise<number> {
  const snap = await getDocs(
    query(collection(db, COL), where("estado", "==", "activo")),
  );
  return snap.size;
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
  coordenadas: { lat: number; lng: number };
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
  fotos: File[] = [],
  onProgreso?: (subidas: number, total: number) => void,
): Promise<string> {
  const ref = `R-${Date.now().toString().slice(-6)}`;
  const slug = `${slugify(input.titulo)}-${ref.toLowerCase()}`;

  // Reservamos un ID de documento antes de subir nada, para usarlo como
  // carpeta en Storage. setDoc(ref) creará el doc al final.
  const docRef = doc(collection(db, COL));

  // Subimos las fotos a Storage (la primera = portada).
  const fotosSubidas: FotoInmueble[] = [];
  for (let i = 0; i < fotos.length; i++) {
    const subida = await subirFotoInmueble(docRef.id, fotos[i], i, i === 0);
    fotosSubidas.push(subida);
    onProgreso?.(i + 1, fotos.length);
  }

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
      coordenadas: input.coordenadas ?? { lat: 0, lng: 0 },
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
      fotos: fotosSubidas,
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

  await setDoc(docRef, docData);
  return docRef.id;
}

// ============================================================================
// Edición y eliminación (admin)
// ============================================================================

export interface InmuebleAdminData {
  id: string;
  ref: string;
  slug: string;
  titulo: string;
  operacion: Operacion;
  tipo: TipoInmueble;
  estado: EstadoInmueble;
  destacado: boolean;
  precio: number;
  municipio: string;
  zona: string;
  coordenadas: { lat: number; lng: number };
  habitaciones: number;
  banos: number;
  metrosConstruidos: number;
  consumoEnergetico: CalificacionEnergetica;
  emisionesEnergetico: CalificacionEnergetica;
  descripcion: string;
  agente: string;
  fotos: FotoInmueble[];
}

export async function obtenerInmueblePorId(
  id: string,
): Promise<InmuebleAdminData | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
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
    coordenadas: {
      lat: data.ubicacion?.coordenadas?.lat ?? 0,
      lng: data.ubicacion?.coordenadas?.lng ?? 0,
    },
    habitaciones: data.detalles?.habitaciones ?? 0,
    banos: data.detalles?.banos ?? 0,
    metrosConstruidos: data.detalles?.metrosConstruidos ?? 0,
    consumoEnergetico: data.energetico?.consumo ?? "en_tramite",
    emisionesEnergetico: data.energetico?.emisiones ?? "en_tramite",
    descripcion: data.descripcion ?? "",
    agente: data.agente ?? "",
    fotos: ((data.multimedia?.fotos ?? []) as FotoInmueble[])
      .slice()
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
  };
}

// Cada item del editor de fotos: o ya existe en Storage, o es nueva por subir.
export type ItemFotoEditor =
  | { tipo: "existente"; foto: FotoInmueble }
  | { tipo: "nueva"; file: File };

export async function actualizarInmueble(
  id: string,
  input: NuevoInmuebleInput,
  fotosEditor: ItemFotoEditor[],
  onProgreso?: (subidas: number, total: number) => void,
): Promise<void> {
  // 1. Leer estado actual para saber qué fotos hay que eliminar de Storage.
  const docRef = doc(db, COL, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("El inmueble ya no existe.");
  const data = snap.data();
  const fotosBd = (data.multimedia?.fotos ?? []) as FotoInmueble[];

  // 2. Subir fotos nuevas a Storage (manteniendo orden).
  const nuevasPorSubir = fotosEditor.filter((f) => f.tipo === "nueva").length;
  let subidas = 0;
  const fotosFinales: FotoInmueble[] = [];
  for (let i = 0; i < fotosEditor.length; i++) {
    const item = fotosEditor[i];
    const portada = i === 0;
    if (item.tipo === "existente") {
      fotosFinales.push({ ...item.foto, orden: i, portada });
    } else {
      const subida = await subirFotoInmueble(id, item.file, i, portada);
      fotosFinales.push(subida);
      subidas += 1;
      onProgreso?.(subidas, nuevasPorSubir);
    }
  }

  // 3. Calcular qué URLs había antes y no están ahora → eliminar de Storage.
  const urlsFinales = new Set(fotosFinales.map((f) => f.url));
  const urlsAEliminar = fotosBd
    .map((f) => f.url)
    .filter((u) => u && !urlsFinales.has(u));

  // 4. updateDoc con todos los campos.
  const slug = data.slug ?? "";
  await updateDoc(docRef, {
    titulo: input.titulo,
    operacion: input.operacion,
    tipo: input.tipo,
    estado: input.estado,
    destacado: input.destacado,
    precio: input.precio,
    "ubicacion.municipio": input.municipio,
    "ubicacion.zona": input.zona,
    "ubicacion.coordenadas": input.coordenadas ?? { lat: 0, lng: 0 },
    "detalles.habitaciones": input.habitaciones,
    "detalles.banos": input.banos,
    "detalles.metrosConstruidos": input.metrosConstruidos,
    "energetico.consumo": input.consumoEnergetico,
    "energetico.emisiones": input.emisionesEnergetico,
    descripcion: input.descripcion,
    "multimedia.fotos": fotosFinales,
    fechaActualizacion: serverTimestamp(),
    fechaPublicacion:
      input.estado === "activo" && !data.fechaPublicacion
        ? serverTimestamp()
        : (data.fechaPublicacion ?? null),
    slug, // intacto
  });

  // 5. Tras éxito en Firestore, eliminar fotos huérfanas de Storage.
  await Promise.all(urlsAEliminar.map((u) => eliminarFotoInmueble(u)));
}

export async function eliminarInmueble(id: string): Promise<void> {
  const docRef = doc(db, COL, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const fotos = (data.multimedia?.fotos ?? []) as FotoInmueble[];

  await deleteDoc(docRef);
  await Promise.all(fotos.map((f) => eliminarFotoInmueble(f.url)));
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
