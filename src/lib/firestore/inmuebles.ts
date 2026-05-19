import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  EstadoInmueble,
  Operacion,
  TipoInmueble,
  CalificacionEnergetica,
} from "@/lib/types";

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

export async function listarInmuebles(): Promise<InmuebleListadoItem[]> {
  const q = query(collection(db, COL), orderBy("fechaCreacion", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
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
  });
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
