import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COL = "pageviews";

// ID anónimo de sesión (no PII). Persiste en sessionStorage hasta que se
// cierra la pestaña. Sirve para contar visitantes únicos aproximados.
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "rehobot-sid";
  let sid = window.sessionStorage.getItem(KEY);
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

export async function trackPageView(pagina: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await addDoc(collection(db, COL), {
      pagina,
      referer: document.referrer || null,
      sessionId: getOrCreateSessionId(),
      userAgent: navigator.userAgent.slice(0, 200),
      fecha: serverTimestamp(),
    });
  } catch {
    // Si falla (red, reglas, lo que sea), no rompemos la navegación.
  }
}

// ============================================================================
// Lectura (admin)
// ============================================================================

export interface PageViewItem {
  id: string;
  pagina: string;
  referer: string | null;
  sessionId: string;
  fechaMs: number;
}

function mapPageView(d: {
  id: string;
  data: () => DocumentData;
}): PageViewItem {
  const data = d.data();
  return {
    id: d.id,
    pagina: data.pagina ?? "",
    referer: data.referer ?? null,
    sessionId: data.sessionId ?? "",
    fechaMs:
      typeof data.fecha?.toMillis === "function" ? data.fecha.toMillis() : 0,
  };
}

export interface ResumenAnalytics {
  // Conteos
  visitasHoy: number;
  visitasSemana: number;
  visitasMes: number;
  usuariosUnicosMes: number;
  // Top
  topPaginas: { pagina: string; count: number }[];
  topInmuebles: { slug: string; count: number }[];
  topReferers: { referer: string; count: number }[];
  // Última actividad
  ultimas: PageViewItem[];
}

const MES_MS = 30 * 24 * 60 * 60 * 1000;

export async function obtenerResumenAnalytics(): Promise<ResumenAnalytics> {
  const ahora = Date.now();
  const desdeMes = Timestamp.fromMillis(ahora - MES_MS);

  // Cargamos sólo el último mes para no traer todo el histórico.
  const snap = await getDocs(
    query(collection(db, COL), where("fecha", ">=", desdeMes)),
  );
  const items = snap.docs.map(mapPageView);

  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);
  const inicioDiaMs = inicioDia.getTime();
  const inicioSemanaMs = ahora - 7 * 24 * 60 * 60 * 1000;
  const inicioMesMs = ahora - MES_MS;

  const visitasHoy = items.filter((i) => i.fechaMs >= inicioDiaMs).length;
  const visitasSemana = items.filter((i) => i.fechaMs >= inicioSemanaMs).length;
  const visitasMes = items.filter((i) => i.fechaMs >= inicioMesMs).length;

  const sesionesUnicas = new Set(items.map((i) => i.sessionId)).size;

  // Top páginas
  const paginasCount = new Map<string, number>();
  const inmueblesCount = new Map<string, number>();
  const referersCount = new Map<string, number>();

  for (const item of items) {
    paginasCount.set(item.pagina, (paginasCount.get(item.pagina) ?? 0) + 1);
    // Si la página es /inmueble/{slug}, contamos por slug
    const m = item.pagina.match(/^\/inmueble\/([^/?#]+)/);
    if (m) {
      inmueblesCount.set(m[1], (inmueblesCount.get(m[1]) ?? 0) + 1);
    }
    if (item.referer) {
      try {
        // Agrupamos por dominio del referer para que sea legible
        const host = new URL(item.referer).hostname;
        if (host) {
          referersCount.set(host, (referersCount.get(host) ?? 0) + 1);
        }
      } catch {
        // referer mal formado, lo ignoramos
      }
    }
  }

  function topDe(
    mapa: Map<string, number>,
    keyName: "pagina" | "slug" | "referer",
    max = 5,
  ) {
    return Array.from(mapa.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([k, count]) => ({ [keyName]: k, count }));
  }

  const ultimas = [...items]
    .sort((a, b) => b.fechaMs - a.fechaMs)
    .slice(0, 10);

  return {
    visitasHoy,
    visitasSemana,
    visitasMes,
    usuariosUnicosMes: sesionesUnicas,
    topPaginas: topDe(paginasCount, "pagina") as {
      pagina: string;
      count: number;
    }[],
    topInmuebles: topDe(inmueblesCount, "slug") as {
      slug: string;
      count: number;
    }[],
    topReferers: topDe(referersCount, "referer") as {
      referer: string;
      count: number;
    }[],
    ultimas,
  };
}
