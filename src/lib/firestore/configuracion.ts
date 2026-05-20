import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COL = "configuracion";
const DOC_ID = "sitio";

export interface DatosEmpresa {
  nombre: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  emailLeads: string;
  whatsappPrincipal: string;
  horario: string;
}

export interface RedesSociales {
  instagram: string;
  facebook: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  tiktok: string;
}

export interface ConfiguracionSitio {
  empresa: DatosEmpresa;
  redesSociales: RedesSociales;
}

export const CONFIG_DEFAULTS: ConfiguracionSitio = {
  empresa: {
    nombre: "Rehobot Real Estate",
    cif: "",
    direccion: "Calle Mayor, 00 · 28801 Alcalá de Henares",
    telefono: "+34 643 08 99 84",
    email: "info@rehobotrealestate.es",
    emailLeads: "",
    whatsappPrincipal: "+34 643 08 99 84",
    horario:
      "Lunes a Viernes: 10:00 - 14:00 / 17:00 - 20:00 · Sábados: 10:00 - 14:00",
  },
  redesSociales: {
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    tiktok: "",
  },
};

export async function obtenerConfiguracion(): Promise<ConfiguracionSitio> {
  try {
    const snap = await getDoc(doc(db, COL, DOC_ID));
    if (!snap.exists()) return CONFIG_DEFAULTS;
    const data = snap.data() as Partial<ConfiguracionSitio>;
    return {
      empresa: { ...CONFIG_DEFAULTS.empresa, ...(data.empresa ?? {}) },
      redesSociales: {
        ...CONFIG_DEFAULTS.redesSociales,
        ...(data.redesSociales ?? {}),
      },
    };
  } catch {
    return CONFIG_DEFAULTS;
  }
}

export async function actualizarConfiguracion(
  config: ConfiguracionSitio,
): Promise<void> {
  await setDoc(
    doc(db, COL, DOC_ID),
    {
      ...config,
      fechaActualizacion: serverTimestamp(),
    },
    { merge: true },
  );
}

// Helpers utilitarios para construir URLs de redes sociales con el handle
// almacenado (puede ser handle o URL completa).
export function urlRedSocial(
  red: keyof RedesSociales,
  valor: string,
): string | null {
  if (!valor) return null;
  if (valor.startsWith("http://") || valor.startsWith("https://")) return valor;
  const limpio = valor.replace(/^@/, "");
  switch (red) {
    case "instagram":
      return `https://instagram.com/${limpio}`;
    case "facebook":
      return `https://facebook.com/${limpio}`;
    case "linkedin":
      return `https://linkedin.com/company/${limpio}`;
    case "twitter":
      return `https://twitter.com/${limpio}`;
    case "youtube":
      return `https://youtube.com/@${limpio}`;
    case "tiktok":
      return `https://tiktok.com/@${limpio}`;
    default:
      return null;
  }
}
