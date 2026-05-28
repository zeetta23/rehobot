import type { MetadataRoute } from "next";
import { listarInmueblesPublicos } from "@/lib/firestore/inmuebles";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://rehobot-rose.vercel.app";

const MUNICIPIOS_SLUG = [
  "alcala-de-henares",
  "torrejon-de-ardoz",
  "coslada",
  "san-fernando-de-henares",
  "mejorada-del-campo",
  "velilla-de-san-antonio",
  "loeches",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();

  const paginasFijas: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: ahora,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/inmuebles`,
      lastModified: ahora,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/vender`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/inversores`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/nosotros`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/contacto`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${APP_URL}/aviso-legal`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/privacidad`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${APP_URL}/cookies`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Páginas de zonas (las rutas /zonas/[municipio] están planificadas;
  // si aún no existen, Google las verá como 404 → mejor las quitamos
  // hasta que estén implementadas)
  const paginasZonas: MetadataRoute.Sitemap = [];
  // Cuando las creemos, descomentar este bloque:
  // const paginasZonas: MetadataRoute.Sitemap = MUNICIPIOS_SLUG.map((slug) => ({
  //   url: `${APP_URL}/zonas/${slug}`,
  //   lastModified: ahora,
  //   changeFrequency: "weekly" as const,
  //   priority: 0.7,
  // }));
  // Referenciamos la variable para que TS no se queje
  void MUNICIPIOS_SLUG;

  // Inmuebles activos
  let paginasInmuebles: MetadataRoute.Sitemap = [];
  try {
    const inmuebles = await listarInmueblesPublicos();
    paginasInmuebles = inmuebles
      .filter((i) => i.slug)
      .map((i) => ({
        url: `${APP_URL}/inmueble/${i.slug}`,
        lastModified: new Date(i.fechaCreacionMs || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    // Si Firestore no responde, devolvemos solo páginas fijas.
  }

  return [...paginasFijas, ...paginasZonas, ...paginasInmuebles];
}
