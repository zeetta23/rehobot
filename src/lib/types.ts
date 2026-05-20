import type { Timestamp } from "firebase/firestore";

// ============================================================================
// Inmueble
// ============================================================================

export type Operacion = "venta" | "alquiler";

export type TipoInmueble =
  | "piso"
  | "chalet"
  | "local"
  | "garaje"
  | "trastero"
  | "terreno"
  | "oficina";

export type EstadoInmueble =
  | "borrador"
  | "activo"
  | "reservado"
  | "vendido"
  | "archivado";

export type CalificacionEnergetica =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "en_tramite";

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface UbicacionInmueble {
  municipio: string;
  zona: string;
  direccion: string;
  coordenadas: Coordenadas;
  radioPrivacidad: number;
}

export interface DetallesInmueble {
  habitaciones: number;
  banos: number;
  metrosConstruidos: number;
  metrosUtiles: number | null;
  planta: string | null;
  anoConstruccion: number | null;
  orientacion: string | null;
  estado: string | null;
  tipoCocina: string | null;
  gastosComunidad: number | null;
  tipoCalefaccion: string | null;
}

export interface CertificadoEnergetico {
  consumo: CalificacionEnergetica;
  emisiones: CalificacionEnergetica;
  consumoKwh: number | null;
  emisionesKg: number | null;
}

export interface FotoInmueble {
  url: string;
  urlThumb: string;
  urlMedium: string;
  urlLarge: string;
  orden: number;
  portada: boolean;
}

export interface MultimediaInmueble {
  fotos: FotoInmueble[];
  videoUrl: string | null;
  tour360Url: string | null;
  planoUrl: string | null;
}

export interface StatsInmueble {
  vistas: number;
  contactos: number;
  favoritos: number;
}

export interface SeoMetadata {
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface Inmueble {
  id: string;
  ref: string;
  slug: string;
  titulo: string;
  operacion: Operacion;
  tipo: TipoInmueble;
  estado: EstadoInmueble;
  destacado: boolean;
  precio: number;
  precioAnterior: number | null;
  ubicacion: UbicacionInmueble;
  detalles: DetallesInmueble;
  energetico: CertificadoEnergetico;
  descripcion: string;
  caracteristicas: string[];
  multimedia: MultimediaInmueble;
  agente: string;
  stats: StatsInmueble;
  seo: SeoMetadata;
  fechaCreacion: Timestamp;
  fechaActualizacion: Timestamp;
  fechaPublicacion: Timestamp | null;
}

// ============================================================================
// Lead
// ============================================================================

export type TipoLead =
  | "interes_inmueble"
  | "valoracion_casa"
  | "contacto_general";

export type EstadoLead =
  | "nuevo"
  | "contactado"
  | "cualificado"
  | "cerrado_exito"
  | "cerrado_fallido";

export interface NotaLead {
  texto: string;
  autor: string;
  fecha: Timestamp;
}

export interface OrigenLead {
  pagina: string;
  referer: string | null;
  userAgent: string | null;
}

export interface Lead {
  id: string;
  tipo: TipoLead;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string | null;

  inmuebleId: string | null;
  inmuebleRef: string | null;
  inmuebleTitulo: string | null;

  direccionInmueble: string | null;
  tipoInmuebleVender: string | null;
  metrosVender: number | null;

  agenteAsignado: string | null;
  estado: EstadoLead;
  notas: NotaLead[];
  origen: OrigenLead;
  fechaCreacion: Timestamp;
  fechaActualizacion: Timestamp;
}

// ============================================================================
// Usuario
// ============================================================================

export type RolUsuario = "admin" | "agente";

export interface PerfilUsuario {
  nombre: string;
  cargo: string;
  telefono: string;
  whatsapp: string;
  bio: string | null;
  fotoUrl: string | null;
  zonas: string[];
}

export interface Usuario {
  id: string;
  email: string;
  rol: RolUsuario;
  perfil: PerfilUsuario;
  activo: boolean;
  fechaCreacion: Timestamp;
  ultimoAcceso: Timestamp;
}

// ============================================================================
// Configuracion
// ============================================================================

export interface EmpresaConfig {
  nombre: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  emailLeads: string;
  whatsappPrincipal: string;
  horario: string;
}

export interface LegalConfig {
  avisoLegal: string;
  privacidad: string;
  cookies: string;
}

export interface RedesSocialesConfig {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  twitter: string | null;
  youtube: string | null;
}

export interface SeoGlobalConfig {
  metaTitleDefault: string;
  metaDescriptionDefault: string;
  keywordsDefault: string[];
}

export interface PaginaTextos {
  [clave: string]: string;
}

export interface PaginasConfig {
  home: PaginaTextos;
  nosotros: PaginaTextos;
  vender: PaginaTextos;
}

export interface Configuracion {
  empresa: EmpresaConfig;
  legal: LegalConfig;
  redesSociales: RedesSocialesConfig;
  seo: SeoGlobalConfig;
  paginas: PaginasConfig;
}

// ============================================================================
// Constantes útiles
// ============================================================================

export const MUNICIPIOS_CORREDOR = [
  "Alcalá de Henares",
  "Torrejón de Ardoz",
  "Coslada",
  "San Fernando de Henares",
  "Mejorada del Campo",
  "Velilla de San Antonio",
  "Loeches",
] as const;

export type MunicipioCorredor = (typeof MUNICIPIOS_CORREDOR)[number];

export const CARACTERISTICAS_DISPONIBLES = [
  "ascensor",
  "garaje",
  "trastero",
  "ac",
  "calefaccion",
  "terraza",
  "balcon",
  "jardin",
  "piscina",
  "amueblado",
  "armarios_empotrados",
  "exterior",
  "luminoso",
  "obra_nueva",
  "reformado",
  "portero",
  "alarma",
  "puerta_blindada",
] as const;

export type CaracteristicaInmueble = (typeof CARACTERISTICAS_DISPONIBLES)[number];
