import {
  Document,
  Page,
  Text,
  View,
  Image as PdfImage,
  StyleSheet,
} from "@react-pdf/renderer";
import type { InmuebleAdminData } from "@/lib/firestore/inmuebles";
import type { ImagenPdf } from "@/lib/pdf/fetch-imagen";

// =============================================================================
// Paleta
// =============================================================================
const C = {
  navy: "#0A1F44",
  navyDeep: "#06173A",
  navyMid: "#142A55",
  navyLight: "#1E3A6F",
  gold: "#C9A96E",
  goldLight: "#E4C896",
  goldSoft: "rgba(201, 169, 110, 0.15)",
  cream: "#F8F4EC",
  creamSoft: "#FDFBF6",
  panel: "#F2F5FA",
  panelDark: "#E6EBF3",
  textLight: "#9AAFC8",
  textMuted: "#6E809B",
  textDark: "#0F1A2C",
  green: "#3F8F5F",
  red: "#C2473F",
  white: "#FFFFFF",
};

// =============================================================================
// Estilos compartidos
// =============================================================================
const s = StyleSheet.create({
  // -------- Página base (apaisada) --------
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    color: C.textDark,
    fontSize: 10,
    paddingHorizontal: 50,
    paddingTop: 40,
    paddingBottom: 50,
  },
  // Decoración: triángulo diagonal pálido en la esquina superior derecha
  decoTriangle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 220,
    height: 220,
    backgroundColor: C.panel,
    transform: "skewY(-15deg)",
    transformOrigin: "top right",
  },
  decoBarBottom: {
    position: "absolute",
    bottom: 24,
    left: 50,
    width: 60,
    height: 3,
    backgroundColor: C.gold,
  },

  // -------- Header de sección --------
  sectionEyebrow: {
    fontSize: 8,
    letterSpacing: 3,
    color: C.gold,
    textTransform: "uppercase",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  sectionTitleBar: {
    width: 4,
    height: 26,
    backgroundColor: C.gold,
    marginRight: 12,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 24,
    color: C.navy,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontStyle: "italic",
    color: C.textMuted,
    marginTop: 6,
    marginLeft: 16,
  },

  // -------- Footer fijo --------
  pageNum: {
    position: "absolute",
    right: 50,
    bottom: 24,
    fontSize: 8,
    letterSpacing: 2,
    color: C.textMuted,
  },

  // -------- Card navy --------
  cardNavy: {
    backgroundColor: C.navy,
    color: C.white,
    padding: 22,
    borderRadius: 8,
  },
  cardCream: {
    backgroundColor: C.cream,
    padding: 14,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
  },
  cardSoft: {
    backgroundColor: C.panel,
    padding: 16,
    borderRadius: 6,
  },

  // -------- Cita destacada --------
  quoteBox: {
    backgroundColor: C.navyDeep,
    padding: 18,
    paddingLeft: 26,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
  },
});

// =============================================================================
// Helpers visuales
// =============================================================================
function fmtPrecio(n: number, conSimbolo = true): string {
  if (!n || n <= 0) return "Consultar";
  const num = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(n);
  return conSimbolo ? `${num} €` : num;
}

function calcHipoteca(
  precio: number,
  entradaPct: number,
  anos: number,
  tin: number,
): number {
  const importe = precio * (1 - entradaPct);
  const i = tin / 12;
  const n = anos * 12;
  if (importe <= 0 || i <= 0) return 0;
  return (importe * i) / (1 - Math.pow(1 + i, -n));
}

function humanizar(s: string): string {
  const limpio = s.replace(/[_-]+/g, " ").trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Header reutilizable de página interior
function SectionHeader({
  num,
  eyebrow,
  title,
  subtitle,
}: {
  num: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View>
      <Text style={s.sectionEyebrow}>
        {num} · {eyebrow}
      </Text>
      <View style={s.sectionTitleRow}>
        <View style={s.sectionTitleBar} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {subtitle ? <Text style={s.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function PageNum({ n, total }: { n: number; total: number }) {
  const pad = (x: number) => String(x).padStart(2, "0");
  return (
    <Text style={s.pageNum}>
      {pad(n)} / {pad(total)}
    </Text>
  );
}

// =============================================================================
// Datos mapeados
// =============================================================================
const TIPO_LABEL: Record<string, string> = {
  piso: "Piso",
  chalet: "Chalet",
  local: "Local comercial",
  garaje: "Plaza de garaje",
  trastero: "Trastero",
  terreno: "Terreno",
  oficina: "Oficina",
};

const CARAC_LABEL: Record<string, string> = {
  ascensor: "Ascensor",
  garaje: "Plaza de garaje",
  trastero: "Trastero",
  ac: "Aire acondicionado",
  calefaccion: "Calefacción",
  terraza: "Terraza",
  balcon: "Balcón",
  jardin: "Jardín",
  piscina: "Piscina",
  amueblado: "Amueblado",
  armarios_empotrados: "Armarios empotrados",
  exterior: "Exterior",
  luminoso: "Luminoso",
  obra_nueva: "Obra nueva",
  reformado: "Reformado",
  portero: "Portero",
  alarma: "Alarma",
  puerta_blindada: "Puerta blindada",
};

interface DossierProps {
  inmueble: InmuebleAdminData;
  imagenes: (ImagenPdf | null)[];
  agente: {
    nombre: string;
    email: string;
    telefono: string;
    cargo: string;
  } | null;
  empresa: {
    nombre: string;
    telefono: string;
    email: string;
    whatsapp: string;
  };
  ahora: string;
}

export function DossierInmueble({
  inmueble,
  imagenes,
  agente,
  empresa,
  ahora,
}: DossierProps) {
  const portadaImg = imagenes[0] ?? null;
  // Imágenes válidas después de la portada
  const todasGaleria = imagenes
    .slice(1)
    .filter((i): i is ImagenPdf => i !== null);
  // Hasta 8 fotos grandes (4 páginas) en formato "presentación"
  const galeriaImgs = todasGaleria.slice(0, 8);
  // El resto va en una página de "índice fotográfico" en miniatura.
  // Incluimos también las 8 grandes para que el mosaico final sea
  // un resumen visual completo del inmueble.
  const mosaicoImgs = todasGaleria;

  const tipoLabel = TIPO_LABEL[inmueble.tipo] ?? inmueble.tipo;
  const ubicacion = [inmueble.zona, inmueble.municipio]
    .filter(Boolean)
    .join(", ");
  const precioM2 =
    inmueble.metrosConstruidos > 0
      ? Math.round(inmueble.precio / inmueble.metrosConstruidos)
      : 0;

  // Datos del agente / fallback empresa
  const agNombre = agente?.nombre || empresa.nombre || "Equipo Rehobot";
  const agCargo = agente?.cargo || "Asesor inmobiliario";
  const agTel = agente?.telefono || empresa.telefono || "";
  const agEmail = agente?.email || empresa.email || "";

  // Hipoteca
  const entradaPct = 0.2;
  const anos = 30;
  const tin = 0.03;
  const cuotaMensual = calcHipoteca(inmueble.precio, entradaPct, anos, tin);

  // Calculamos número total de páginas a mano para el footer "0X / 0N"
  const numPaginas =
    1 + // portada
    1 + // 01 asesor
    1 + // 02 vivienda highlights
    (inmueble.descripcion ? 1 : 0) + // 03 descripción
    1 + // 04 detalles
    1 + // 05 ubicacion
    Math.ceil(galeriaImgs.length / 2) + // 06 galería
    (mosaicoImgs.length > 2 ? 1 : 0) + // 06b índice fotográfico
    (inmueble.caracteristicas.length > 0 ? 1 : 0) + // 07 características
    (inmueble.operacion === "venta" && inmueble.precio > 0 ? 1 : 0) + // 08 financiación
    1; // siguiente paso

  let page = 0;
  const next = () => ++page;

  return (
    <Document
      title={`Dossier ${inmueble.titulo}`}
      author={empresa.nombre}
      subject={`Dossier comercial · ${inmueble.ref}`}
    >
      {/* ============ 1. PORTADA ============ */}
      {(() => {
        next();
        return (
          <Page size="A4" orientation="landscape" style={{ padding: 0 }}>
            {/* Mitad izquierda: contenido sobre fondo navy */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "60%",
                height: "100%",
                backgroundColor: C.navy,
              }}
            />
            {/* Mitad derecha: imagen del inmueble */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "45%",
                height: "100%",
                backgroundColor: C.navyDeep,
              }}
            >
              {portadaImg ? (
                <PdfImage
                  src={{ data: portadaImg.data, format: portadaImg.format }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
              {/* Velo navy sobre la imagen para integrar con el fondo */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 80,
                  height: "100%",
                  backgroundColor: C.navy,
                  opacity: 0.95,
                  transform: "skewX(-12deg)",
                  transformOrigin: "top left",
                }}
              />
            </View>

            {/* Contenido textual sobre el azul */}
            <View
              style={{
                position: "absolute",
                top: 60,
                left: 60,
                right: 360,
                color: C.white,
              }}
            >
              {/* Logo "RR" */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: C.gold,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Times-Bold",
                      color: C.navy,
                      fontSize: 14,
                    }}
                  >
                    R
                  </Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text
                    style={{
                      fontFamily: "Times-Bold",
                      fontSize: 16,
                      color: C.white,
                      letterSpacing: 2,
                    }}
                  >
                    REHOBOT
                  </Text>
                  <Text
                    style={{
                      fontSize: 7,
                      color: C.gold,
                      letterSpacing: 3,
                      marginTop: 2,
                    }}
                  >
                    REAL ESTATE
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  marginTop: 50,
                  fontSize: 9,
                  color: C.gold,
                  letterSpacing: 3,
                }}
              >
                DOSSIER COMERCIAL · CONFIDENCIAL
              </Text>

              <Text
                style={{
                  marginTop: 22,
                  fontFamily: "Times-Bold",
                  fontSize: 52,
                  lineHeight: 1.1,
                }}
              >
                Dossier
              </Text>
              <Text
                style={{
                  fontFamily: "Times-BoldItalic",
                  fontSize: 52,
                  color: C.gold,
                  lineHeight: 1.1,
                }}
              >
                de Compra
              </Text>

              <Text
                style={{
                  marginTop: 26,
                  fontSize: 14,
                  color: C.textLight,
                }}
              >
                {inmueble.titulo}
              </Text>

              {/* Divider dorado */}
              <View
                style={{
                  width: 140,
                  height: 1,
                  backgroundColor: C.gold,
                  marginTop: 32,
                }}
              />

              {/* Meta inferior */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 22,
                }}
              >
                <View style={{ width: 130 }}>
                  <Text
                    style={{
                      fontSize: 7,
                      color: C.gold,
                      letterSpacing: 2,
                    }}
                  >
                    UBICACIÓN
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: C.white,
                      marginTop: 4,
                    }}
                  >
                    {ubicacion || "Madrid"}
                  </Text>
                </View>
                <View style={{ width: 130 }}>
                  <Text
                    style={{
                      fontSize: 7,
                      color: C.gold,
                      letterSpacing: 2,
                    }}
                  >
                    TIPOLOGÍA
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: C.white,
                      marginTop: 4,
                    }}
                  >
                    {tipoLabel}
                    {inmueble.metrosConstruidos
                      ? ` · ${inmueble.metrosConstruidos} m²`
                      : ""}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 7,
                      color: C.gold,
                      letterSpacing: 2,
                    }}
                  >
                    PRECIO
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: C.white,
                      marginTop: 4,
                    }}
                  >
                    {fmtPrecio(inmueble.precio)}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={{
                position: "absolute",
                bottom: 30,
                left: 60,
                fontSize: 8,
                color: C.textLight,
                letterSpacing: 2,
              }}
            >
              REF. {inmueble.ref || "—"} · {ahora.toUpperCase()}
            </Text>
          </Page>
        );
      })()}

      {/* ============ 2. ASESORÍA ============ */}
      {(() => {
        const n = next();
        return (
          <Page size="A4" orientation="landscape" style={s.page}>
            <View style={s.decoTriangle} />

            <SectionHeader
              num="01"
              eyebrow="QUIÉN TE ACOMPAÑA"
              title="Asesoría de confianza"
              subtitle="Conocimiento local, trato cercano y acompañamiento durante todo el proceso."
            />

            <View style={{ flexDirection: "row", marginTop: 28 }}>
              {/* Card del agente */}
              <View
                style={{
                  width: 220,
                  backgroundColor: C.navy,
                  borderRadius: 8,
                  padding: 22,
                  alignItems: "center",
                  borderBottomWidth: 3,
                  borderBottomColor: C.gold,
                }}
              >
                <View
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: C.gold,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Times-Bold",
                      fontSize: 28,
                      color: C.navy,
                    }}
                  >
                    {iniciales(agNombre)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Times-Bold",
                    color: C.white,
                    fontSize: 14,
                    marginTop: 14,
                    textAlign: "center",
                  }}
                >
                  {agNombre}
                </Text>
                <Text
                  style={{
                    color: C.gold,
                    fontSize: 8,
                    letterSpacing: 2,
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  {agCargo.toUpperCase()}
                </Text>
              </View>

              {/* Texto derecha */}
              <View style={{ flex: 1, marginLeft: 28 }}>
                <Text
                  style={{
                    fontFamily: "Times-Bold",
                    fontSize: 22,
                    color: C.navy,
                  }}
                >
                  {agNombre}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: C.navy,
                    fontFamily: "Helvetica-Bold",
                    letterSpacing: 2,
                    marginTop: 4,
                  }}
                >
                  {agCargo.toUpperCase()} · {empresa.nombre.toUpperCase()}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: C.textDark,
                    marginTop: 14,
                    lineHeight: 1.6,
                  }}
                >
                  En {empresa.nombre} acompañamos a cada comprador de forma
                  personalizada. Te ayudamos a entender la operación, a
                  negociar con criterio y a cerrar la compra con todas las
                  garantías legales y fiscales.
                </Text>

                <View style={[s.quoteBox, { marginTop: 18 }]}>
                  <Text
                    style={{
                      fontFamily: "Times-Italic",
                      color: C.white,
                      fontSize: 11,
                      lineHeight: 1.5,
                    }}
                  >
                    “Acompañamos cada compra como si fuera la nuestra. Sin
                    prisa, sin atajos, sin sorpresas.”
                  </Text>
                  <Text
                    style={{
                      fontSize: 8,
                      color: C.gold,
                      letterSpacing: 2,
                      marginTop: 8,
                    }}
                  >
                    — {agNombre.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tres ventajas */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 32,
                gap: 14,
              }}
            >
              {[
                {
                  n: "01",
                  t: "Conocimiento del mercado",
                  d: "Operamos en Madrid y el Corredor del Henares todos los días del año.",
                },
                {
                  n: "02",
                  t: "Transparencia total",
                  d: "Te explicamos cada paso: precio, gastos, plazos y opciones de financiación.",
                },
                {
                  n: "03",
                  t: "Acompañamiento completo",
                  d: "De la visita a la firma ante notario, incluyendo trámites y asesoría.",
                },
              ].map((v) => (
                <View
                  key={v.n}
                  style={{
                    flex: 1,
                    backgroundColor: C.cream,
                    padding: 14,
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: C.gold,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 14,
                        color: C.gold,
                        marginRight: 8,
                      }}
                    >
                      {v.n}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Helvetica-Bold",
                        fontSize: 10,
                        color: C.navy,
                      }}
                    >
                      {v.t}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 9,
                      color: C.textMuted,
                      marginTop: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    {v.d}
                  </Text>
                </View>
              ))}
            </View>

            <View style={s.decoBarBottom} />
            <PageNum n={n} total={numPaginas} />
          </Page>
        );
      })()}

      {/* ============ 3. LA VIVIENDA · HIGHLIGHTS ============ */}
      {(() => {
        const n = next();
        return (
          <Page size="A4" orientation="landscape" style={s.page}>
            <View style={s.decoTriangle} />
            <SectionHeader
              num="02"
              eyebrow="LA VIVIENDA"
              title="Resumen de un vistazo"
              subtitle={
                ubicacion
                  ? `Vivienda en ${ubicacion}.`
                  : "Una oportunidad bien situada."
              }
            />

            <View
              style={{
                flexDirection: "row",
                marginTop: 30,
                gap: 16,
              }}
            >
              {/* Card grande izquierda */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: C.navy,
                  borderRadius: 10,
                  padding: 28,
                  borderBottomWidth: 4,
                  borderBottomColor: C.gold,
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    color: C.gold,
                    letterSpacing: 2,
                  }}
                >
                  PRECIO DE {inmueble.operacion === "alquiler"
                    ? "ALQUILER"
                    : "VENTA"}
                </Text>
                <Text
                  style={{
                    fontFamily: "Times-Bold",
                    color: C.white,
                    fontSize: 48,
                    marginTop: 8,
                  }}
                >
                  {fmtPrecio(inmueble.precio)}
                </Text>
                {precioM2 > 0 ? (
                  <Text
                    style={{
                      fontSize: 10,
                      color: C.textLight,
                      marginTop: 6,
                    }}
                  >
                    {fmtPrecio(precioM2)}/m² construido
                  </Text>
                ) : null}

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#23386a",
                    marginVertical: 22,
                  }}
                />

                {/* Métricas dentro */}
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 7, color: C.gold, letterSpacing: 1.5 }}>
                      HABITACIONES
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 22,
                        color: C.white,
                        marginTop: 4,
                      }}
                    >
                      {inmueble.habitaciones || "—"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 7, color: C.gold, letterSpacing: 1.5 }}>
                      BAÑOS
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 22,
                        color: C.white,
                        marginTop: 4,
                      }}
                    >
                      {inmueble.banos || "—"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 7, color: C.gold, letterSpacing: 1.5 }}>
                      SUPERFICIE
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 22,
                        color: C.white,
                        marginTop: 4,
                      }}
                    >
                      {inmueble.metrosConstruidos
                        ? `${inmueble.metrosConstruidos} m²`
                        : "—"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Foto destacada derecha */}
              <View
                style={{
                  width: 280,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: C.panel,
                }}
              >
                {galeriaImgs[0] || portadaImg ? (
                  <PdfImage
                    src={{
                      data: (galeriaImgs[0] ?? portadaImg!).data,
                      format: (galeriaImgs[0] ?? portadaImg!).format,
                    }}
                    style={{ width: "100%", height: 280, objectFit: "cover" }}
                  />
                ) : null}
                <View style={{ padding: 14, backgroundColor: C.navy }}>
                  <Text
                    style={{
                      fontSize: 7,
                      color: C.gold,
                      letterSpacing: 2,
                    }}
                  >
                    VENTAJAS DESTACADAS
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    {inmueble.caracteristicas
                      .slice(0, 3)
                      .map((c) => (
                        <Text
                          key={c}
                          style={{
                            color: C.white,
                            fontSize: 9,
                            marginTop: 4,
                          }}
                        >
                          ✓ {CARAC_LABEL[c] ?? c}
                        </Text>
                      ))}
                    {inmueble.caracteristicas.length === 0 ? (
                      <Text
                        style={{ color: C.textLight, fontSize: 9, marginTop: 4 }}
                      >
                        —
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>

            <View style={s.decoBarBottom} />
            <PageNum n={n} total={numPaginas} />
          </Page>
        );
      })()}

      {/* ============ 3. DESCRIPCIÓN COMPLETA ============ */}
      {inmueble.descripcion ? (
        (() => {
          const n = next();
          // Partimos en párrafos para que respiren visualmente.
          const parrafos = inmueble.descripcion
            .split(/\n\s*\n|\r\n\s*\r\n/)
            .map((p) => p.trim())
            .filter(Boolean);
          // Primer párrafo destacado (cita), resto en cuerpo.
          const destacado = parrafos[0] || inmueble.descripcion;
          const resto = parrafos.slice(1);
          return (
            <Page size="A4" orientation="landscape" style={s.page}>
              <View style={s.decoTriangle} />
              <SectionHeader
                num="03"
                eyebrow="LA VIVIENDA POR DENTRO"
                title="Descripción"
                subtitle="Lo que el inmueble cuenta sobre sí mismo."
              />

              {/* Banner superior con cita + resumen en una línea.
                  wrap={false} para que no se parta entre páginas. */}
              <View
                wrap={false}
                style={{
                  marginTop: 22,
                  flexDirection: "row",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    flex: 2,
                    backgroundColor: C.navy,
                    padding: 18,
                    borderRadius: 8,
                    borderBottomWidth: 3,
                    borderBottomColor: C.gold,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Times-Bold",
                      fontSize: 22,
                      color: C.gold,
                      lineHeight: 1,
                    }}
                  >
                    &ldquo;
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Times-Italic",
                      fontSize: 12,
                      color: C.white,
                      marginTop: 2,
                      lineHeight: 1.5,
                    }}
                  >
                    {destacado.length > 200
                      ? destacado.slice(0, 200).replace(/\s+\S*$/, "") + "…"
                      : destacado}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: C.cream,
                    borderRadius: 8,
                    padding: 16,
                    borderLeftWidth: 3,
                    borderLeftColor: C.gold,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7,
                      color: C.gold,
                      letterSpacing: 2,
                    }}
                  >
                    EN UNA LÍNEA
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Helvetica-Bold",
                      fontSize: 11,
                      color: C.navy,
                      marginTop: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    {tipoLabel}
                    {inmueble.metrosConstruidos
                      ? ` de ${inmueble.metrosConstruidos} m²`
                      : ""}
                    {inmueble.habitaciones
                      ? ` · ${inmueble.habitaciones} hab.`
                      : ""}
                    {inmueble.banos ? ` · ${inmueble.banos} baños` : ""}
                  </Text>
                  {ubicacion ? (
                    <Text
                      style={{
                        fontSize: 9,
                        color: C.textMuted,
                        marginTop: 4,
                      }}
                    >
                      {ubicacion}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Cuerpo del texto a ancho completo. Aquí sí se permite el
                  reparto automático en páginas si la descripción es larga. */}
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: C.textDark,
                    lineHeight: 1.7,
                  }}
                >
                  {destacado}
                </Text>
                {resto.map((p, i) => (
                  <Text
                    key={i}
                    style={{
                      fontSize: 11,
                      color: C.textDark,
                      lineHeight: 1.7,
                      marginTop: 12,
                    }}
                  >
                    {p}
                  </Text>
                ))}
              </View>

              <View style={s.decoBarBottom} />
              <PageNum n={n} total={numPaginas} />
            </Page>
          );
        })()
      ) : null}

      {/* ============ 4. DETALLES DEL ACTIVO ============ */}
      {(() => {
        const n = next();
        const filas = [
          { l: "Ubicación", v: ubicacion || "—" },
          {
            l: "Superficie",
            v: inmueble.metrosConstruidos
              ? `${inmueble.metrosConstruidos} m² construidos`
              : "—",
          },
          {
            l: "Construcción",
            v: inmueble.anoConstruccion
              ? String(inmueble.anoConstruccion)
              : "—",
          },
          { l: "Tipología", v: tipoLabel },
          {
            l: "Certificado energético",
            v:
              inmueble.consumoEnergetico === "en_tramite"
                ? "En trámite"
                : inmueble.consumoEnergetico.toUpperCase(),
          },
          {
            l: "Gastos comunidad",
            v: inmueble.gastosComunidad
              ? `${inmueble.gastosComunidad} €/mes`
              : "—",
          },
          {
            l: "Cocina",
            v: inmueble.tipoCocina
              ? humanizar(inmueble.tipoCocina)
              : "—",
          },
          {
            l: "Calefacción",
            v: inmueble.tipoCalefaccion
              ? humanizar(inmueble.tipoCalefaccion)
              : "—",
          },
        ];
        return (
          <Page size="A4" orientation="landscape" style={s.page}>
            <View style={s.decoTriangle} />
            <SectionHeader
              num="04"
              eyebrow="DETALLES DEL ACTIVO"
              title="Ficha técnica completa"
              subtitle="Información detallada del inmueble, libre de cargas y lista para escriturar."
            />

            <View style={{ flexDirection: "row", marginTop: 26, gap: 22 }}>
              {/* Tabla izquierda */}
              <View
                style={{
                  flex: 1.2,
                  borderWidth: 1,
                  borderColor: C.panelDark,
                  borderRadius: 8,
                }}
              >
                {filas.map((f, i) => (
                  <View
                    key={f.l}
                    style={{
                      flexDirection: "row",
                      padding: 12,
                      borderBottomWidth: i < filas.length - 1 ? 1 : 0,
                      borderBottomColor: C.panelDark,
                    }}
                  >
                    <Text
                      style={{
                        width: 150,
                        fontSize: 8,
                        color: C.textMuted,
                        letterSpacing: 1.5,
                      }}
                    >
                      {f.l.toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: "Helvetica-Bold",
                        fontSize: 10,
                        color: C.navy,
                      }}
                    >
                      {f.v}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Sidebar síntesis derecha */}
              <View
                style={{
                  width: 280,
                  backgroundColor: C.navy,
                  borderRadius: 8,
                  padding: 22,
                  borderBottomWidth: 3,
                  borderBottomColor: C.gold,
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    color: C.gold,
                    letterSpacing: 2,
                  }}
                >
                  SÍNTESIS DEL ACTIVO
                </Text>
                <Text
                  style={{
                    fontFamily: "Times-Bold",
                    fontSize: 16,
                    color: C.white,
                    marginTop: 10,
                    lineHeight: 1.25,
                  }}
                >
                  {inmueble.titulo}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: C.navyDeep,
                      padding: 14,
                      borderRadius: 6,
                      borderLeftWidth: 3,
                      borderLeftColor: C.gold,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 18,
                        color: C.gold,
                      }}
                    >
                      {inmueble.metrosConstruidos || "—"}
                      <Text style={{ fontSize: 11 }}> m²</Text>
                    </Text>
                    <Text
                      style={{
                        fontSize: 7,
                        color: C.textLight,
                        letterSpacing: 1.5,
                        marginTop: 4,
                      }}
                    >
                      SUPERFICIE
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: C.navyDeep,
                      padding: 14,
                      borderRadius: 6,
                      borderLeftWidth: 3,
                      borderLeftColor: C.gold,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 18,
                        color: C.gold,
                      }}
                    >
                      €{precioM2 > 0 ? precioM2.toLocaleString("es-ES") : "—"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 7,
                        color: C.textLight,
                        letterSpacing: 1.5,
                        marginTop: 4,
                      }}
                    >
                      PRECIO €/M²
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 6,
                    marginTop: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    inmueble.estado === "activo" ? "DISPONIBLE" : null,
                    inmueble.destacado ? "DESTACADO" : null,
                    "LIBRE DE CARGAS",
                  ]
                    .filter((x): x is string => Boolean(x))
                    .map((b) => (
                      <View
                        key={b}
                        style={{
                          backgroundColor: C.navyDeep,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: "#1c3060",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 7,
                            color: C.gold,
                            letterSpacing: 1.5,
                          }}
                        >
                          {b}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            </View>

            <View style={s.decoBarBottom} />
            <PageNum n={n} total={numPaginas} />
          </Page>
        );
      })()}

      {/* ============ 5. UBICACIÓN ============ */}
      {(() => {
        const n = next();
        return (
          <Page size="A4" orientation="landscape" style={s.page}>
            <View style={s.decoTriangle} />
            <SectionHeader
              num="05"
              eyebrow="UBICACIÓN"
              title={inmueble.municipio || "Madrid"}
              subtitle={
                inmueble.zona
                  ? `Zona ${inmueble.zona}. Información de la microzona.`
                  : "Información de la microzona y conexiones."
              }
            />

            <View style={{ flexDirection: "row", marginTop: 26, gap: 22 }}>
              {/* Lista de 3 puntos izquierda */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: C.textDark,
                    lineHeight: 1.6,
                  }}
                >
                  La vivienda se sitúa en {ubicacion || "una zona consolidada"},
                  un entorno valorado por su tranquilidad, sus servicios y la
                  conexión directa con Madrid.
                </Text>

                {[
                  {
                    n: "1",
                    t: "Servicios y comercio cercano",
                    d: "Supermercados, panaderías, farmacias y tiendas de cercanía en pocos minutos andando.",
                  },
                  {
                    n: "2",
                    t: "Comunicaciones",
                    d: "Conexiones directas con Madrid mediante Cercanías, autobús y A-2 según municipio.",
                  },
                  {
                    n: "3",
                    t: "Colegios y zonas verdes",
                    d: "Colegios públicos y concertados, parques y áreas deportivas en el entorno inmediato.",
                  },
                ].map((p) => (
                  <View
                    key={p.n}
                    style={{
                      flexDirection: "row",
                      marginTop: 20,
                      paddingBottom: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: C.panelDark,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: C.gold,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Times-Bold",
                          fontSize: 12,
                          color: C.navy,
                        }}
                      >
                        {p.n}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: "Helvetica-Bold",
                          fontSize: 11,
                          color: C.navy,
                        }}
                      >
                        {p.t}
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          color: C.textMuted,
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        {p.d}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Sidebar derecha */}
              <View
                style={{
                  width: 280,
                  backgroundColor: C.navy,
                  borderRadius: 8,
                  padding: 22,
                  borderBottomWidth: 3,
                  borderBottomColor: C.gold,
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    color: C.gold,
                    letterSpacing: 2,
                  }}
                >
                  UBICACIÓN ESTRATÉGICA
                </Text>
                <Text
                  style={{
                    fontFamily: "Times-Bold",
                    fontSize: 22,
                    color: C.white,
                    marginTop: 8,
                  }}
                >
                  {inmueble.municipio || "Madrid"}
                </Text>
                {inmueble.zona ? (
                  <Text
                    style={{
                      fontSize: 11,
                      color: C.textLight,
                      marginTop: 2,
                    }}
                  >
                    Zona {inmueble.zona}
                  </Text>
                ) : null}

                {inmueble.mostrarDireccion && inmueble.direccion ? (
                  <View
                    style={{
                      marginTop: 18,
                      padding: 12,
                      backgroundColor: C.navyDeep,
                      borderRadius: 6,
                      borderLeftWidth: 3,
                      borderLeftColor: C.gold,
                    }}
                  >
                    <Text style={{ fontSize: 7, color: C.gold, letterSpacing: 2 }}>
                      DIRECCIÓN
                    </Text>
                    <Text style={{ fontSize: 10, color: C.white, marginTop: 4 }}>
                      {inmueble.direccion}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: C.navyDeep,
                      padding: 12,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 16,
                        color: C.white,
                      }}
                    >
                      Madrid
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        color: C.textLight,
                        marginTop: 4,
                      }}
                    >
                      Comunidad y entorno
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: C.navyDeep,
                      padding: 12,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 16,
                        color: C.white,
                      }}
                    >
                      {tipoLabel}
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        color: C.textLight,
                        marginTop: 4,
                      }}
                    >
                      Tipología
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={s.decoBarBottom} />
            <PageNum n={n} total={numPaginas} />
          </Page>
        );
      })()}

      {/* ============ 6. GALERÍA ============ */}
      {galeriaImgs.length > 0 &&
        Array.from({ length: Math.ceil(galeriaImgs.length / 2) }).map(
          (_, pageIdx) => {
            const n = next();
            const fotosPage = galeriaImgs.slice(pageIdx * 2, pageIdx * 2 + 2);
            return (
              <Page
                key={`galeria-${pageIdx}`}
                size="A4"
                orientation="landscape"
                style={s.page}
              >
                <View style={s.decoTriangle} />
                {pageIdx === 0 && (
                  <SectionHeader
                    num="06"
                    eyebrow="GALERÍA"
                    title="El inmueble en imágenes"
                    subtitle="Cada espacio cuenta una historia. Estas son las nuestras."
                  />
                )}

                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    marginTop: pageIdx === 0 ? 24 : 0,
                    flex: 1,
                  }}
                >
                  {fotosPage.map((img, idx) => (
                    <View
                      key={idx}
                      style={{
                        flex: 1,
                        borderRadius: 8,
                        overflow: "hidden",
                        backgroundColor: C.panel,
                      }}
                    >
                      <PdfImage
                        src={{ data: img.data, format: img.format }}
                        style={{
                          width: "100%",
                          height: 380,
                          objectFit: "cover",
                        }}
                      />
                    </View>
                  ))}
                </View>

                <View style={s.decoBarBottom} />
                <PageNum n={n} total={numPaginas} />
              </Page>
            );
          },
        )}

      {/* ============ 6b. ÍNDICE FOTOGRÁFICO (MOSAICO) ============ */}
      {mosaicoImgs.length > 2 &&
        (() => {
          const n = next();
          // Grid 4×N: 4 fotos por fila, hasta 16 fotos visibles en una página
          const FOTOS_POR_PAGINA = 16;
          const fotosMostradas = mosaicoImgs.slice(0, FOTOS_POR_PAGINA);
          return (
            <Page size="A4" orientation="landscape" style={s.page}>
              <View style={s.decoTriangle} />
              <SectionHeader
                num="06"
                eyebrow="ÍNDICE FOTOGRÁFICO"
                title={`Todas las fotos (${mosaicoImgs.length})`}
                subtitle="Vista en miniatura del reportaje completo del inmueble."
              />

              <View
                style={{
                  marginTop: 22,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {fotosMostradas.map((img, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: "23.5%",
                      borderRadius: 4,
                      overflow: "hidden",
                      backgroundColor: C.panel,
                      borderWidth: 1,
                      borderColor: C.panelDark,
                    }}
                  >
                    <PdfImage
                      src={{ data: img.data, format: img.format }}
                      style={{
                        width: "100%",
                        height: 100,
                        objectFit: "cover",
                      }}
                    />
                  </View>
                ))}
              </View>

              {mosaicoImgs.length > FOTOS_POR_PAGINA ? (
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 9,
                    color: C.textMuted,
                    fontStyle: "italic",
                  }}
                >
                  Se muestran las {FOTOS_POR_PAGINA} primeras fotos del
                  inmueble. El reportaje completo ({mosaicoImgs.length}
                  {" "}fotos en total) está disponible en la ficha del inmueble
                  o solicitándolo al asesor.
                </Text>
              ) : null}

              <View style={s.decoBarBottom} />
              <PageNum n={n} total={numPaginas} />
            </Page>
          );
        })()}

      {/* ============ 7. CARACTERÍSTICAS ============ */}
      {inmueble.caracteristicas.length > 0 &&
        (() => {
          const n = next();
          const mitad = Math.ceil(inmueble.caracteristicas.length / 2);
          const col1 = inmueble.caracteristicas.slice(0, mitad);
          const col2 = inmueble.caracteristicas.slice(mitad);
          return (
            <Page size="A4" orientation="landscape" style={s.page}>
              <View style={s.decoTriangle} />
              <SectionHeader
                num="07"
                eyebrow="CARACTERÍSTICAS"
                title="Lo que ofrece este inmueble"
                subtitle="Las prestaciones que marcan la diferencia."
              />

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 28,
                  gap: 22,
                }}
              >
                {/* Lista izquierda */}
                <View style={{ flex: 1, flexDirection: "row", gap: 20 }}>
                  {[col1, col2].map((col, ci) => (
                    <View key={ci} style={{ flex: 1 }}>
                      {col.map((c) => (
                        <View
                          key={c}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 7,
                            borderBottomWidth: 1,
                            borderBottomColor: C.panelDark,
                          }}
                        >
                          <View
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              backgroundColor: C.gold,
                              justifyContent: "center",
                              alignItems: "center",
                              marginRight: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                color: C.navy,
                                fontFamily: "Helvetica-Bold",
                              }}
                            >
                              ✓
                            </Text>
                          </View>
                          <Text style={{ fontSize: 10, color: C.textDark }}>
                            {CARAC_LABEL[c] ?? c}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>

                {/* Sidebar derecha */}
                <View
                  style={{
                    width: 280,
                    backgroundColor: C.navy,
                    borderRadius: 8,
                    padding: 22,
                    borderBottomWidth: 3,
                    borderBottomColor: C.gold,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      color: C.gold,
                      letterSpacing: 2,
                    }}
                  >
                    POR QUÉ ESTE INMUEBLE
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Times-Bold",
                      fontSize: 18,
                      color: C.white,
                      marginTop: 10,
                      lineHeight: 1.25,
                    }}
                  >
                    Una vivienda con todo lo que importa.
                  </Text>
                  <View style={{ marginTop: 16 }}>
                    {[
                      `${inmueble.caracteristicas.length} prestaciones marcadas`,
                      "Ubicación en zona consolidada",
                      "Documentación lista para revisar",
                      "Acompañamiento integral del agente",
                    ].map((b) => (
                      <View
                        key={b}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: C.gold,
                            marginRight: 8,
                            fontFamily: "Helvetica-Bold",
                          }}
                        >
                          ✓
                        </Text>
                        <Text style={{ fontSize: 9, color: C.white }}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={s.decoBarBottom} />
              <PageNum n={n} total={numPaginas} />
            </Page>
          );
        })()}

      {/* ============ 8. FINANCIACIÓN ============ */}
      {inmueble.operacion === "venta" &&
        inmueble.precio > 0 &&
        (() => {
          const n = next();
          return (
            <Page size="A4" orientation="landscape" style={s.page}>
              <View style={s.decoTriangle} />
              <SectionHeader
                num="08"
                eyebrow="FINANCIACIÓN"
                title="Simulación orientativa"
                subtitle="Cifras estándar de mercado · no constituye oferta vinculante."
              />

              {/* 3 cards grandes */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 14,
                  marginTop: 30,
                }}
              >
                {[
                  {
                    label: "PRECIO TOTAL",
                    valor: fmtPrecio(inmueble.precio),
                    sub: "Valor de venta",
                    bg: C.navyDeep,
                    fg: C.white,
                    accent: C.gold,
                  },
                  {
                    label: "ENTRADA 20%",
                    valor: fmtPrecio(inmueble.precio * entradaPct),
                    sub: "Ahorro inicial recomendado",
                    bg: C.navyLight,
                    fg: C.white,
                    accent: C.goldLight,
                  },
                  {
                    label: "CUOTA MENSUAL",
                    valor: `${fmtPrecio(cuotaMensual)}/mes`,
                    sub: `${anos} años · TIN ${(tin * 100).toFixed(2)}%`,
                    bg: C.gold,
                    fg: C.navy,
                    accent: C.navy,
                  },
                ].map((c) => (
                  <View
                    key={c.label}
                    style={{
                      flex: 1,
                      backgroundColor: c.bg,
                      padding: 24,
                      borderRadius: 10,
                      borderBottomWidth: 4,
                      borderBottomColor: c.accent,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: c.accent,
                        letterSpacing: 2,
                      }}
                    >
                      {c.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Times-Bold",
                        fontSize: 30,
                        color: c.fg,
                        marginTop: 8,
                      }}
                    >
                      {c.valor}
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: c.fg === C.white ? C.textLight : C.navy,
                        marginTop: 6,
                      }}
                    >
                      {c.sub}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Parámetros de la simulación */}
              <View
                style={{
                  marginTop: 22,
                  flexDirection: "row",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: C.cream,
                    padding: 16,
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: C.gold,
                  }}
                >
                  <Text style={{ fontSize: 7, color: C.gold, letterSpacing: 2 }}>
                    PARÁMETROS USADOS
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 8,
                      gap: 20,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 8, color: C.textMuted }}>
                        ENTRADA
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Helvetica-Bold",
                          fontSize: 12,
                          color: C.navy,
                          marginTop: 2,
                        }}
                      >
                        {(entradaPct * 100).toFixed(0)}%
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 8, color: C.textMuted }}>
                        PLAZO
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Helvetica-Bold",
                          fontSize: 12,
                          color: C.navy,
                          marginTop: 2,
                        }}
                      >
                        {anos} años
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 8, color: C.textMuted }}>
                        TIN ORIENTATIVO
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Helvetica-Bold",
                          fontSize: 12,
                          color: C.navy,
                          marginTop: 2,
                        }}
                      >
                        {(tin * 100).toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={{
                  marginTop: 18,
                  padding: 12,
                  backgroundColor: C.creamSoft,
                  borderRadius: 4,
                  borderLeftWidth: 3,
                  borderLeftColor: C.red,
                }}
              >
                <Text style={{ fontSize: 9, color: C.red, letterSpacing: 1.5 }}>
                  AVISO LEGAL
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: C.textDark,
                    marginTop: 6,
                    lineHeight: 1.55,
                  }}
                >
                  Simulación orientativa con valores estándar de mercado. No
                  incluye gastos asociados (ITP, notaría, registro, gestoría).
                  Las condiciones reales dependerán de la entidad financiera y
                  del perfil del solicitante.
                </Text>
              </View>

              <View style={s.decoBarBottom} />
              <PageNum n={n} total={numPaginas} />
            </Page>
          );
        })()}

      {/* ============ 9. SIGUIENTE PASO ============ */}
      {(() => {
        const n = next();
        return (
          <Page size="A4" orientation="landscape" style={{ padding: 0 }}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: C.navy,
              }}
            />
            <View
              style={{
                paddingHorizontal: 80,
                paddingTop: 60,
                paddingBottom: 50,
                color: C.white,
                flexGrow: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  color: C.gold,
                  letterSpacing: 3,
                  textAlign: "center",
                }}
              >
                SIGUIENTE PASO
              </Text>
              <Text
                style={{
                  marginTop: 16,
                  textAlign: "center",
                  fontFamily: "Times-Bold",
                  fontSize: 52,
                  color: C.white,
                }}
              >
                ¿
                <Text style={{ fontFamily: "Times-BoldItalic", color: C.gold }}>
                  Concertamos
                </Text>{" "}
                una visita?
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: C.textLight,
                  marginTop: 14,
                  lineHeight: 1.5,
                  maxWidth: 540,
                  marginHorizontal: "auto",
                }}
              >
                Visita el inmueble, resuelve tus dudas y revisa la
                documentación con tu asesor. Sin compromiso y con todo el
                tiempo que necesites.
              </Text>

              <View
                style={{
                  marginTop: 40,
                  marginHorizontal: 80,
                  backgroundColor: C.navyDeep,
                  borderRadius: 10,
                  padding: 28,
                  borderWidth: 1,
                  borderColor: C.navyLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    color: C.gold,
                    letterSpacing: 3,
                    textAlign: "center",
                  }}
                >
                  {empresa.nombre.toUpperCase()}
                </Text>
                <Text
                  style={{
                    fontFamily: "Times-Bold",
                    fontSize: 22,
                    color: C.white,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  {agNombre}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: C.gold,
                    letterSpacing: 2,
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  {agCargo.toUpperCase()}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 36,
                    marginTop: 26,
                  }}
                >
                  <View>
                    <Text
                      style={{ fontSize: 7, color: C.gold, letterSpacing: 2 }}
                    >
                      TELÉFONO
                    </Text>
                    <Text
                      style={{
                        color: C.white,
                        fontSize: 10,
                        marginTop: 4,
                      }}
                    >
                      {agTel || "—"}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 7, color: C.gold, letterSpacing: 2 }}
                    >
                      EMAIL
                    </Text>
                    <Text
                      style={{
                        color: C.white,
                        fontSize: 10,
                        marginTop: 4,
                      }}
                    >
                      {agEmail || "—"}
                    </Text>
                  </View>
                  {empresa.whatsapp ? (
                    <View>
                      <Text
                        style={{
                          fontSize: 7,
                          color: C.gold,
                          letterSpacing: 2,
                        }}
                      >
                        WHATSAPP
                      </Text>
                      <Text
                        style={{
                          color: C.white,
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {empresa.whatsapp}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <Text
                style={{
                  position: "absolute",
                  bottom: 30,
                  left: 0,
                  right: 0,
                  fontSize: 7,
                  color: C.textMuted,
                  letterSpacing: 3,
                  textAlign: "center",
                }}
              >
                DOSSIER CONFIDENCIAL · {empresa.nombre.toUpperCase()} ·{" "}
                {ahora.toUpperCase()} · REF. {inmueble.ref || "—"}
              </Text>
            </View>
            <PageNum n={n} total={numPaginas} />
          </Page>
        );
      })()}
    </Document>
  );
}
