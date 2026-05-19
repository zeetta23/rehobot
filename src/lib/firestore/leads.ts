import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { TipoLead, EstadoLead, NotaLead } from "@/lib/types";

const COL = "leads";

export interface OrigenLeadInput {
  pagina: string;
  referer: string | null;
  userAgent: string | null;
}

interface BaseLeadInput {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string | null;
  origen: OrigenLeadInput;
}

export interface NuevoLeadInteresInput extends BaseLeadInput {
  tipo: "interes_inmueble";
  inmuebleId: string;
  inmuebleRef: string;
  inmuebleTitulo: string;
  agenteAsignado: string | null;
}

export interface NuevoLeadValoracionInput extends BaseLeadInput {
  tipo: "valoracion_casa";
  tipoInmuebleVender: string | null;
  municipio: string | null;
  metrosVender: number | null;
}

export interface NuevoLeadContactoInput extends BaseLeadInput {
  tipo: "contacto_general";
}

export type NuevoLeadInput =
  | NuevoLeadInteresInput
  | NuevoLeadValoracionInput
  | NuevoLeadContactoInput;

export async function crearLead(input: NuevoLeadInput): Promise<string> {
  const base = {
    nombre: input.nombre.trim(),
    email: input.email.trim().toLowerCase(),
    telefono: input.telefono.trim(),
    mensaje: input.mensaje?.trim() || null,
    tipo: input.tipo,
    estado: "nuevo" as EstadoLead,
    notas: [] as NotaLead[],
    origen: input.origen,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
    inmuebleId: null as string | null,
    inmuebleRef: null as string | null,
    inmuebleTitulo: null as string | null,
    direccionInmueble: null as string | null,
    tipoInmuebleVender: null as string | null,
    metrosVender: null as number | null,
    municipio: null as string | null,
    agenteAsignado: null as string | null,
  };

  if (input.tipo === "interes_inmueble") {
    base.inmuebleId = input.inmuebleId;
    base.inmuebleRef = input.inmuebleRef;
    base.inmuebleTitulo = input.inmuebleTitulo;
    base.agenteAsignado = input.agenteAsignado;
  } else if (input.tipo === "valoracion_casa") {
    base.tipoInmuebleVender = input.tipoInmuebleVender;
    base.municipio = input.municipio;
    base.metrosVender = input.metrosVender;
  }

  const ref = await addDoc(collection(db, COL), base);
  return ref.id;
}

// ============================================================================
// Lectura (admin)
// ============================================================================

export interface LeadListadoItem {
  id: string;
  tipo: TipoLead;
  nombre: string;
  email: string;
  telefono: string;
  estado: EstadoLead;
  inmuebleTitulo: string | null;
  inmuebleId: string | null;
  fechaCreacionMs: number;
}

function mapLeadListado(d: {
  id: string;
  data: () => DocumentData;
}): LeadListadoItem {
  const data = d.data();
  return {
    id: d.id,
    tipo: data.tipo ?? "contacto_general",
    nombre: data.nombre ?? "",
    email: data.email ?? "",
    telefono: data.telefono ?? "",
    estado: data.estado ?? "nuevo",
    inmuebleTitulo: data.inmuebleTitulo ?? null,
    inmuebleId: data.inmuebleId ?? null,
    fechaCreacionMs:
      typeof data.fechaCreacion?.toMillis === "function"
        ? data.fechaCreacion.toMillis()
        : 0,
  };
}

export async function listarLeads(filtros?: {
  estado?: EstadoLead;
  tipo?: TipoLead;
}): Promise<LeadListadoItem[]> {
  const constraints = [];
  if (filtros?.estado) constraints.push(where("estado", "==", filtros.estado));
  if (filtros?.tipo) constraints.push(where("tipo", "==", filtros.tipo));

  const q = constraints.length
    ? query(collection(db, COL), ...constraints)
    : query(collection(db, COL));

  const snap = await getDocs(q);
  return snap.docs
    .map(mapLeadListado)
    .sort((a, b) => b.fechaCreacionMs - a.fechaCreacionMs);
}

export interface LeadDetalle extends LeadListadoItem {
  mensaje: string | null;
  inmuebleRef: string | null;
  tipoInmuebleVender: string | null;
  municipio: string | null;
  metrosVender: number | null;
  agenteAsignado: string | null;
  notas: NotaLead[];
  origen: { pagina: string; referer: string | null; userAgent: string | null };
  fechaActualizacionMs: number;
}

export async function obtenerLeadPorId(
  id: string,
): Promise<LeadDetalle | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  const base = mapLeadListado(snap);
  return {
    ...base,
    mensaje: data.mensaje ?? null,
    inmuebleRef: data.inmuebleRef ?? null,
    tipoInmuebleVender: data.tipoInmuebleVender ?? null,
    municipio: data.municipio ?? null,
    metrosVender: data.metrosVender ?? null,
    agenteAsignado: data.agenteAsignado ?? null,
    notas: (data.notas ?? []) as NotaLead[],
    origen: {
      pagina: data.origen?.pagina ?? "",
      referer: data.origen?.referer ?? null,
      userAgent: data.origen?.userAgent ?? null,
    },
    fechaActualizacionMs:
      typeof data.fechaActualizacion?.toMillis === "function"
        ? data.fechaActualizacion.toMillis()
        : 0,
  };
}

export async function actualizarEstadoLead(
  id: string,
  estado: EstadoLead,
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    estado,
    fechaActualizacion: serverTimestamp(),
  });
}

export async function anadirNotaLead(
  id: string,
  texto: string,
  autorUid: string,
): Promise<void> {
  const nota = {
    texto: texto.trim(),
    autor: autorUid,
    // arrayUnion no admite serverTimestamp dentro; usamos Timestamp.now().
    fecha: Timestamp.now(),
  };
  await updateDoc(doc(db, COL, id), {
    notas: arrayUnion(nota),
    fechaActualizacion: serverTimestamp(),
  });
}

// ============================================================================
// Utilidades de visualización
// ============================================================================

export function labelTipoLead(tipo: TipoLead): string {
  return {
    interes_inmueble: "Interés en inmueble",
    valoracion_casa: "Valoración de casa",
    contacto_general: "Contacto general",
  }[tipo];
}

export function labelEstadoLead(estado: EstadoLead): string {
  return {
    nuevo: "Nuevo",
    contactado: "Contactado",
    cualificado: "Cualificado",
    cerrado_exito: "Cerrado con éxito",
    cerrado_fallido: "Cerrado sin éxito",
  }[estado];
}

export function colorEstadoLead(estado: EstadoLead): string {
  return {
    nuevo: "bg-blue-100 text-blue-800",
    contactado: "bg-yellow-100 text-yellow-800",
    cualificado: "bg-purple-100 text-purple-800",
    cerrado_exito: "bg-green-100 text-green-800",
    cerrado_fallido: "bg-gray-200 text-gray-700",
  }[estado];
}

export function obtenerOrigenDelBrowser(pagina: string): OrigenLeadInput {
  if (typeof window === "undefined") {
    return { pagina, referer: null, userAgent: null };
  }
  return {
    pagina,
    referer: document.referrer || null,
    userAgent: navigator.userAgent,
  };
}
