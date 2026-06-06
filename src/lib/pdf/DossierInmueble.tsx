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

const C = {
  navy: "#0A1F44",
  navyMedium: "#1E3A6F",
  gold: "#C9A96E",
  goldLight: "#E4C896",
  cream: "#FAF6EE",
  gray: "#6B7280",
  grayLight: "#E5E7EB",
  dark: "#111827",
  white: "#FFFFFF",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    color: C.dark,
    fontSize: 10,
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: C.gray,
  },
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.gray,
  },

  // Portada
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: C.navy,
    color: C.white,
    padding: 0,
  },
  coverImage: { width: "100%", height: 480, objectFit: "cover" },
  coverImagePlaceholder: {
    width: "100%",
    height: 480,
    backgroundColor: C.navyMedium,
    justifyContent: "center",
    alignItems: "center",
  },
  coverContent: {
    padding: 40,
    flexGrow: 1,
    justifyContent: "space-between",
  },
  coverEyebrow: {
    fontSize: 10,
    letterSpacing: 4,
    color: C.gold,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 26,
    marginTop: 12,
    lineHeight: 1.25,
    maxWidth: 480,
  },
  coverPrice: {
    fontFamily: "Helvetica-Bold",
    fontSize: 28,
    color: C.gold,
    marginTop: 18,
  },
  coverMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 24,
  },
  coverMetaLeft: { fontSize: 10, color: "#9AB1D4" },
  coverBrand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: C.gold,
    letterSpacing: 3,
  },
  coverBrandSub: {
    fontSize: 8,
    color: C.gold,
    letterSpacing: 3,
    marginTop: 2,
  },

  // Cabeceras de página
  sectionEyebrow: {
    fontSize: 8,
    letterSpacing: 3,
    color: C.gold,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: C.navy,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: C.grayLight,
    marginVertical: 20,
  },

  // Resumen
  refLine: {
    fontSize: 9,
    color: C.gray,
    marginTop: 4,
  },
  resumenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  resumenCard: {
    width: "33.33%",
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  resumenLabel: {
    fontSize: 8,
    color: C.gray,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  resumenValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: C.navy,
    marginTop: 4,
  },
  precioBig: {
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    color: C.navy,
  },
  precioSub: {
    fontSize: 10,
    color: C.gray,
    marginTop: 3,
  },

  // Descripción
  bloqueDescripcion: {
    backgroundColor: C.cream,
    padding: 24,
    borderRadius: 6,
    marginTop: 8,
  },
  descripcionTexto: {
    fontSize: 11,
    lineHeight: 1.6,
    color: C.dark,
  },

  // Características
  caracteristicasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  caracteristicaPill: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  pillBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.gold,
    marginRight: 8,
  },
  pillText: {
    fontSize: 10,
    color: C.dark,
  },

  // Galería
  galeriaPage: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    color: C.dark,
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 40,
  },
  galeriaCol: {
    flexDirection: "column",
    marginTop: 12,
  },
  fotoGaleria: {
    width: "100%",
    height: 350,
    objectFit: "cover",
    borderRadius: 4,
    marginBottom: 10,
  },

  // Hipoteca
  hipotecaCard: {
    backgroundColor: C.navy,
    color: C.white,
    padding: 22,
    borderRadius: 6,
    marginTop: 8,
  },
  hipotecaCuota: {
    fontFamily: "Helvetica-Bold",
    fontSize: 34,
    color: C.gold,
  },
  hipotecaCuotaLabel: {
    fontSize: 10,
    color: C.cream,
    marginTop: 4,
    letterSpacing: 1,
  },
  hipotecaParams: {
    flexDirection: "row",
    marginTop: 22,
    justifyContent: "space-between",
  },
  hipotecaParam: {
    width: "32%",
  },
  hipotecaParamLabel: {
    fontSize: 8,
    color: "#9AB1D4",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  hipotecaParamValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: C.white,
    marginTop: 4,
  },
  hipotecaDisclaimer: {
    fontSize: 8,
    color: C.gray,
    marginTop: 14,
    lineHeight: 1.5,
  },

  // Contacto
  contactoBox: {
    backgroundColor: C.cream,
    padding: 28,
    borderRadius: 6,
    marginTop: 16,
  },
  contactoLine: {
    fontSize: 13,
    color: C.dark,
    marginBottom: 8,
  },
  contactoLabel: {
    fontSize: 8,
    color: C.gray,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
});

interface DossierProps {
  inmueble: InmuebleAdminData;
  /** Imágenes ya descargadas y convertidas a JPG/PNG, en el mismo orden que
   * las fotos del inmueble. Los slots null se omiten en el render. */
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
  ahora: string; // fecha legible
}

const TIPO_LABEL: Record<string, string> = {
  piso: "Piso",
  chalet: "Chalet",
  local: "Local",
  garaje: "Garaje",
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

function fmtPrecio(n: number): string {
  if (!n) return "Consultar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function calcHipoteca(
  precio: number,
  entradaPct = 0.2,
  anos = 30,
  tin = 0.03,
) {
  const importe = precio * (1 - entradaPct);
  const i = tin / 12;
  const n = anos * 12;
  if (importe <= 0 || i <= 0) return 0;
  return (importe * i) / (1 - Math.pow(1 + i, -n));
}

export function DossierInmueble({
  inmueble,
  imagenes,
  agente,
  empresa,
  ahora,
}: DossierProps) {
  const portadaImg = imagenes[0] ?? null;
  // Aplanamos las imágenes restantes válidas (filtramos nulls). Limitamos a
  // 8 para no pasar de 4 páginas de galería.
  const galeriaImgs = imagenes
    .slice(1)
    .filter((i): i is ImagenPdf => i !== null)
    .slice(0, 8);
  const ubicacion = [inmueble.zona, inmueble.municipio]
    .filter(Boolean)
    .join(", ");
  const tipoLabel = TIPO_LABEL[inmueble.tipo] ?? inmueble.tipo;
  const entradaPct = 0.2;
  const anos = 30;
  const tin = 0.03;
  const cuota = calcHipoteca(inmueble.precio, entradaPct, anos, tin);

  const datos: { label: string; value: string }[] = [
    { label: "Habitaciones", value: String(inmueble.habitaciones || "—") },
    { label: "Baños", value: String(inmueble.banos || "—") },
    {
      label: "Superficie",
      value: inmueble.metrosConstruidos
        ? `${inmueble.metrosConstruidos} m²`
        : "—",
    },
    {
      label: "Año construcción",
      value: inmueble.anoConstruccion
        ? String(inmueble.anoConstruccion)
        : "—",
    },
    { label: "Tipo", value: tipoLabel },
    {
      label: "Certificado energético",
      value:
        inmueble.consumoEnergetico === "en_tramite"
          ? "En trámite"
          : inmueble.consumoEnergetico.toUpperCase(),
    },
    {
      label: "Gastos comunidad",
      value: inmueble.gastosComunidad
        ? `${inmueble.gastosComunidad} €/mes`
        : "—",
    },
    {
      label: "Cocina",
      value: inmueble.tipoCocina
        ? inmueble.tipoCocina.charAt(0).toUpperCase() +
          inmueble.tipoCocina.slice(1)
        : "—",
    },
    {
      label: "Calefacción",
      value: inmueble.tipoCalefaccion
        ? inmueble.tipoCalefaccion.charAt(0).toUpperCase() +
          inmueble.tipoCalefaccion.slice(1)
        : "—",
    },
  ];

  return (
    <Document
      title={`Dossier ${inmueble.titulo}`}
      author={empresa.nombre}
      subject={`Dossier comercial · ${inmueble.ref}`}
    >
      {/* ============ PORTADA ============ */}
      <Page size="A4" style={s.coverPage}>
        {portadaImg ? (
          <PdfImage
            src={{ data: portadaImg.data, format: portadaImg.format }}
            style={s.coverImage}
          />
        ) : (
          <View style={s.coverImagePlaceholder} />
        )}
        <View style={s.coverContent}>
          <View>
            <Text style={s.coverEyebrow}>
              {ubicacion || "Madrid"} · Ref. {inmueble.ref}
            </Text>
            <Text style={s.coverTitle}>{inmueble.titulo}</Text>
            <Text style={s.coverPrice}>{fmtPrecio(inmueble.precio)}</Text>
          </View>
          <View style={s.coverMeta}>
            <Text style={s.coverMetaLeft}>
              {tipoLabel}
              {inmueble.metrosConstruidos
                ? ` · ${inmueble.metrosConstruidos} m²`
                : ""}
              {inmueble.habitaciones
                ? ` · ${inmueble.habitaciones} hab.`
                : ""}
            </Text>
            <View>
              <Text style={s.coverBrand}>REHOBOT</Text>
              <Text style={s.coverBrandSub}>REAL ESTATE</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ============ RESUMEN + DESCRIPCIÓN ============ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionEyebrow}>Resumen</Text>
        <Text style={s.sectionTitle}>Datos del inmueble</Text>
        <Text style={s.refLine}>
          {ubicacion}
          {inmueble.ref ? ` · Ref. ${inmueble.ref}` : ""}
        </Text>

        <View style={{ marginTop: 24, marginBottom: 8 }}>
          <Text style={s.precioBig}>{fmtPrecio(inmueble.precio)}</Text>
          <Text style={s.precioSub}>
            {inmueble.operacion === "alquiler"
              ? "Renta mensual"
              : "Precio de venta"}
          </Text>
        </View>

        <View style={s.divider} />

        <View style={s.resumenGrid}>
          {datos.map((d) => (
            <View key={d.label} style={s.resumenCard}>
              <Text style={s.resumenLabel}>{d.label}</Text>
              <Text style={s.resumenValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        {inmueble.descripcion ? (
          <>
            <View style={s.divider} />
            <Text style={s.sectionEyebrow}>Descripción</Text>
            <View style={s.bloqueDescripcion}>
              <Text style={s.descripcionTexto}>{inmueble.descripcion}</Text>
            </View>
          </>
        ) : null}

        <Text
          style={s.pageFooter}
          render={({ pageNumber, totalPages }) =>
            `${empresa.nombre} · Dossier comercial · Pág. ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* ============ CARACTERÍSTICAS + UBICACIÓN ============ */}
      {(inmueble.caracteristicas.length > 0 || ubicacion) && (
        <Page size="A4" style={s.page}>
          {inmueble.caracteristicas.length > 0 && (
            <>
              <Text style={s.sectionEyebrow}>Características</Text>
              <Text style={s.sectionTitle}>Lo que ofrece este inmueble</Text>
              <View style={s.caracteristicasGrid}>
                {inmueble.caracteristicas.map((c) => (
                  <View key={c} style={s.caracteristicaPill}>
                    <View style={s.pillBullet} />
                    <Text style={s.pillText}>{CARAC_LABEL[c] ?? c}</Text>
                  </View>
                ))}
              </View>
              <View style={s.divider} />
            </>
          )}

          <Text style={s.sectionEyebrow}>Ubicación</Text>
          <Text style={s.sectionTitle}>
            {inmueble.municipio || "Madrid"}
          </Text>
          {inmueble.zona ? (
            <Text style={{ marginTop: 8, fontSize: 12, color: C.dark }}>
              Zona: {inmueble.zona}
            </Text>
          ) : null}
          {inmueble.mostrarDireccion && inmueble.direccion ? (
            <Text style={{ marginTop: 6, fontSize: 12, color: C.dark }}>
              Dirección: {inmueble.direccion}
            </Text>
          ) : null}

          <Text
            style={s.pageFooter}
            render={({ pageNumber, totalPages }) =>
              `${empresa.nombre} · Dossier comercial · Pág. ${pageNumber} de ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {/* ============ GALERÍA ============ */}
      {galeriaImgs.length > 0 &&
        Array.from({ length: Math.ceil(galeriaImgs.length / 2) }).map(
          (_, pageIdx) => {
            const fotosPage = galeriaImgs.slice(pageIdx * 2, pageIdx * 2 + 2);
            return (
              <Page
                key={`galeria-${pageIdx}`}
                size="A4"
                style={s.galeriaPage}
              >
                {pageIdx === 0 && (
                  <>
                    <Text style={s.sectionEyebrow}>Galería</Text>
                    <Text style={s.sectionTitle}>El inmueble en imágenes</Text>
                  </>
                )}
                <View style={s.galeriaCol}>
                  {fotosPage.map((img, idx) => (
                    <PdfImage
                      key={idx}
                      src={{ data: img.data, format: img.format }}
                      style={s.fotoGaleria}
                    />
                  ))}
                </View>
                <Text
                  style={s.pageFooter}
                  render={({ pageNumber, totalPages }) =>
                    `${empresa.nombre} · Dossier comercial · Pág. ${pageNumber} de ${totalPages}`
                  }
                  fixed
                />
              </Page>
            );
          },
        )}

      {/* ============ HIPOTECA + CONTACTO ============ */}
      {inmueble.operacion === "venta" && inmueble.precio > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionEyebrow}>Financiación</Text>
          <Text style={s.sectionTitle}>Simulación orientativa de hipoteca</Text>

          <View style={s.hipotecaCard}>
            <Text style={s.hipotecaCuotaLabel}>Cuota mensual estimada</Text>
            <Text style={s.hipotecaCuota}>{fmtPrecio(cuota)}/mes</Text>

            <View style={s.hipotecaParams}>
              <View style={s.hipotecaParam}>
                <Text style={s.hipotecaParamLabel}>Entrada (20%)</Text>
                <Text style={s.hipotecaParamValue}>
                  {fmtPrecio(inmueble.precio * entradaPct)}
                </Text>
              </View>
              <View style={s.hipotecaParam}>
                <Text style={s.hipotecaParamLabel}>Plazo</Text>
                <Text style={s.hipotecaParamValue}>{anos} años</Text>
              </View>
              <View style={s.hipotecaParam}>
                <Text style={s.hipotecaParamLabel}>TIN</Text>
                <Text style={s.hipotecaParamValue}>
                  {(tin * 100).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>

          <Text style={s.hipotecaDisclaimer}>
            * Simulación orientativa con valores de mercado estándar (20% de
            entrada, 30 años, TIN 3%). No constituye oferta vinculante. Las
            condiciones reales dependerán de la entidad financiera y del perfil
            del solicitante.
          </Text>

          <View style={s.divider} />

          <Text style={s.sectionEyebrow}>Contacto</Text>
          <Text style={s.sectionTitle}>
            {agente?.nombre || empresa.nombre}
          </Text>

          <View style={s.contactoBox}>
            {agente?.cargo ? (
              <>
                <Text style={s.contactoLabel}>Cargo</Text>
                <Text style={s.contactoLine}>{agente.cargo}</Text>
              </>
            ) : null}
            <Text style={s.contactoLabel}>Teléfono</Text>
            <Text style={s.contactoLine}>
              {agente?.telefono || empresa.telefono || "—"}
            </Text>
            <Text style={s.contactoLabel}>Email</Text>
            <Text style={s.contactoLine}>
              {agente?.email || empresa.email || "—"}
            </Text>
            {empresa.whatsapp ? (
              <>
                <Text style={s.contactoLabel}>WhatsApp</Text>
                <Text style={s.contactoLine}>{empresa.whatsapp}</Text>
              </>
            ) : null}
          </View>

          <Text
            style={s.pageFooter}
            render={({ pageNumber, totalPages }) =>
              `${empresa.nombre} · Dossier comercial · Pág. ${pageNumber} de ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {/* ============ CONTRAPORTADA ============ */}
      <Page size="A4" style={s.coverPage}>
        <View
          style={{
            flexGrow: 1,
            padding: 60,
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={[s.coverBrand, { fontSize: 18 }]}>REHOBOT</Text>
            <Text style={[s.coverBrandSub, { fontSize: 10, marginTop: 4 }]}>
              REAL ESTATE
            </Text>
          </View>

          <View>
            <Text
              style={[
                s.coverEyebrow,
                { letterSpacing: 3, marginBottom: 10 },
              ]}
            >
              Gracias por tu interés
            </Text>
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 22,
                color: C.white,
                lineHeight: 1.4,
              }}
            >
              Estamos aquí para acompañarte en cada paso de la compra.
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "#9AB1D4",
                marginTop: 16,
                lineHeight: 1.6,
              }}
            >
              Llámanos al {empresa.telefono || "—"}, escríbenos a{" "}
              {empresa.email || "—"} o ven a vernos al{" "}
              {empresa.whatsapp ? `WhatsApp ${empresa.whatsapp}` : "WhatsApp"}.
              Te respondemos lo antes posible.
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 8, color: "#7D90B3" }}>
              Documento generado el {ahora} · Ref. {inmueble.ref}
            </Text>
            <Text
              style={{
                fontSize: 7,
                color: "#5E709B",
                marginTop: 8,
                lineHeight: 1.5,
                maxWidth: 420,
              }}
            >
              La información de este dossier tiene carácter informativo y no
              constituye oferta vinculante. Los datos están sujetos a
              comprobación. Para acceder al certificado energético definitivo y
              a la documentación legal del inmueble, póngase en contacto con
              nosotros.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
