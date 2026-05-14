# Rehobot Real Estate — Documento técnico del proyecto

> Este documento es la "biblia" del proyecto. Cuando arranquemos Claude Code, lo leerá al principio para tener todo el contexto. Sirve también como referencia para Manu durante el desarrollo y como documentación futura.

---

## 1. Descripción general

**Nombre del negocio:** Rehobot Real Estate
**Tipo:** Inmobiliaria con foco en venta de inmuebles (95% venta, 5% alquiler ocasional)
**Zona de operación:** Corredor del Henares (Madrid) — Alcalá de Henares, Torrejón de Ardoz, Coslada, San Fernando, Mejorada del Campo, Velilla, Loeches
**Dominio:** Por confirmar (probablemente `rehobotrealestate.es` o similar)
**Objetivo de la web:** Captar leads de compradores (formularios en cada inmueble) y de propietarios que quieren vender (página "vender mi casa")

---

## 2. Stack técnico

| Componente | Tecnología | Coste |
|------------|------------|-------|
| Frontend | Next.js 15 (App Router) + TypeScript | Gratis |
| Estilos | Tailwind CSS | Gratis |
| Hosting web | Vercel (plan Hobby) | Gratis |
| Base de datos | Firebase Firestore (plan Spark) | Gratis |
| Storage de imágenes | Firebase Storage (plan Spark) | Gratis |
| Autenticación | Firebase Auth (email + password) | Gratis |
| Envío de emails | Resend o EmailJS (free tier) | Gratis |
| Mapa | Leaflet + OpenStreetMap | Gratis |
| Tour 360° | Embed Kuula (URL externa) | Gratis |
| Dominio | IONOS | ~10 €/año |
| Repositorio | GitHub (repo privado) | Gratis |

**Coste total año 1: ~10 €** (solo dominio)

---

## 3. Identidad visual

**Paleta corporativa (basada en logo de Rehobot):**

- **Azul marino profundo:** `#0A1F44` (color principal, fondos oscuros, textos importantes)
- **Azul medio:** `#1E3A6F` (variante para hovers y elementos secundarios)
- **Dorado champagne:** `#C9A96E` (acentos, CTAs destacados, líneas decorativas)
- **Dorado claro:** `#E4C896` (hovers del dorado)
- **Blanco:** `#FFFFFF` (fondos limpios)
- **Gris claro:** `#F5F5F7` (fondos de sección alternos)
- **Gris medio:** `#6B7280` (texto secundario)
- **Negro suave:** `#1A1A1A` (texto principal)

**Tipografía sugerida:**
- Títulos: Playfair Display o similar serif elegante (transmite confianza y solera)
- Cuerpo: Inter o System UI (legibilidad)

**Estilo general:** Elegante, profesional, "premium accesible". Mucho espacio en blanco, fotografía grande, tipografía cuidada. No tipo Idealista (demasiado funcional/frío), no tipo Houzez americano (demasiado cargado). Referencia: webs inmobiliarias estilo Engel & Völkers pero adaptado a un nivel más accesible.

---

## 4. Estructura de la web pública

### 4.1 Páginas

1. **Home (`/`)**
   - Hero con buscador rápido (operación, zona, precio máx)
   - Stats de la inmobiliaria (años, inmuebles vendidos, valoración Google)
   - Sección "Explorar por tipo" (pisos, chalets, locales, garajes)
   - Inmuebles destacados (6-9 últimos o marcados como destacados)
   - Buscar por zona (lista de municipios con contador)
   - Sección de captación "¿Quieres vender tu casa?" con formulario
   - Quiénes somos (resumen + CTA a página completa)
   - Equipo (foto + datos de cada agente)
   - Footer completo

2. **Listado de inmuebles (`/inmuebles`)**
   - Filtros: operación, tipo, zona, precio, habitaciones, baños, m² mínimos
   - Vista grid (3 columnas en desktop, 1 en móvil)
   - Paginación o scroll infinito
   - Ordenación: más recientes, precio asc/desc, m² asc/desc
   - URL con parámetros filtrables (`/inmuebles?zona=alcala&max=200000`)

3. **Ficha de inmueble (`/inmueble/[slug]`)**
   - URL amigable tipo `/inmueble/piso-venta-alcala-ensanche-3hab-ref-1247`
   - Galería de fotos en alta (con lightbox)
   - Datos clave: precio, m², habitaciones, baños, año
   - Descripción larga
   - Características (lista de checks)
   - Certificado energético (obligatorio mostrar)
   - Mapa con ubicación aproximada (círculo, no punto exacto)
   - Vídeo embebido (YouTube/Vimeo) si lo hay
   - Tour 360° embebido (Kuula) si lo hay
   - Plano de la vivienda si lo hay
   - Formulario de contacto del agente
   - Botón WhatsApp directo al agente con mensaje pre-rellenado
   - Botón compartir (WhatsApp, email, copiar enlace)
   - Inmuebles similares (3-4 al final)

4. **Páginas por zona (`/zonas/[municipio]`)**
   - Una página por: Alcalá de Henares, Torrejón, Coslada, San Fernando, Mejorada, Velilla, Loeches
   - Contenido SEO: 600-1000 palabras sobre la zona
   - Listado de inmuebles filtrados por ese municipio
   - Sección de barrios destacados (en Alcalá: Ensanche, La Garena, Espartales, etc.)

5. **Vender tu casa (`/vender`)**
   - Página de captación de propietarios
   - Beneficios de vender con Rehobot
   - Proceso paso a paso
   - Formulario completo (datos personales + datos del inmueble)
   - Testimonios si los hay
   - FAQ sobre el proceso de venta

6. **Nosotros (`/nosotros`)**
   - Historia de Rehobot
   - Misión, visión, valores
   - Equipo completo con fotos y bios
   - Foto del local si existe

7. **Contacto (`/contacto`)**
   - Datos de contacto
   - Formulario general
   - Mapa de Google con ubicación del local
   - Horario

8. **Páginas legales** (footer)
   - `/aviso-legal`
   - `/privacidad`
   - `/cookies`

### 4.2 Componentes globales

- Header sticky con logo, navegación, teléfono visible, CTA
- Footer con enlaces, datos legales, redes sociales
- Banner de cookies (RGPD compliant)
- Botón flotante de WhatsApp en todas las páginas

---

## 5. Panel de administración

### 5.1 Acceso

- Ruta: `/admin`
- Login con email + contraseña (Firebase Auth)
- Recuperación de contraseña por email
- Sin registro público (solo admin crea usuarios nuevos)

### 5.2 Roles de usuario

- **Admin** (dueño): acceso total, ve y gestiona todo, crea/elimina usuarios
- **Agente** (empleado): puede crear/editar inmuebles propios, ver leads asignados a él, **NO ve los leads de otros ni puede gestionar usuarios**

### 5.3 Secciones del panel

1. **Resumen (`/admin`)**
   - Tarjetas de KPIs: inmuebles activos, leads del mes, vistas del mes, ventas del año
   - Últimos leads recibidos
   - Últimos inmuebles añadidos

2. **Inmuebles (`/admin/inmuebles`)**
   - Listado con filtros y búsqueda
   - Columnas: foto miniatura, título, ref, zona, precio, estado, vistas, agente, acciones
   - Estados: Borrador, Activo, Reservado, Vendido, Archivado
   - Acción "Nuevo inmueble" → formulario
   - Acción editar / duplicar / archivar / eliminar

3. **Formulario de inmueble (`/admin/inmuebles/nuevo` o `/admin/inmuebles/[id]/editar`)**
   - Bloques:
     - **Básico**: título, operación, tipo, estado, precio, referencia (autogenerada o manual)
     - **Ubicación**: municipio (dropdown), barrio/zona, dirección completa (solo interna, no pública), coordenadas para el mapa (lat/lng — se pueden seleccionar haciendo clic en mapa)
     - **Detalles**: habitaciones, baños, m² construidos, m² útiles, planta, año construcción
     - **Energético**: calificación (A-G o "en trámite"), consumo kWh/m² año, emisiones
     - **Descripción**: editor rico (texto largo, negritas, listas, párrafos)
     - **Características**: checkboxes (ascensor, garaje, trastero, A/C, calefacción, terraza, jardín, piscina, amueblado, etc.)
     - **Fotos**: drag & drop multi-archivo, ordenación arrastrando, selección de portada, máximo 30 fotos. Optimización automática a WebP en 3 tamaños (thumbnail 400px, medium 1200px, large 1920px)
     - **Multimedia**: URL vídeo (YouTube/Vimeo), URL tour 360° (Kuula), URL plano
     - **Publicación**: estado (borrador/activo), destacado sí/no, agente asignado
   - Botones: guardar borrador / publicar / cancelar
   - Vista previa antes de publicar

4. **Leads (`/admin/leads`)** (solo admin)
   - Listado de todos los leads recibidos
   - Columnas: nombre, teléfono, email, inmueble interesado (o "valoración casa"), agente asignado, estado (nuevo/contactado/cualificado/cerrado/descartado), fecha
   - Filtros por estado, agente, fecha
   - Click en lead → ficha completa con todos los datos + historial de notas
   - Posibilidad de añadir notas con timestamp
   - Asignar lead a un agente
   - Marcar como contactado/cerrado

5. **Agentes (`/admin/agentes`)** (solo admin)
   - Listado de agentes
   - Crear nuevo agente (genera invitación por email con link para establecer contraseña)
   - Editar perfil de agente: foto, nombre, cargo, teléfono, email, bio
   - Activar/desactivar agente
   - Asignar/cambiar rol

6. **Páginas (`/admin/paginas`)** (solo admin)
   - Editor de textos de páginas estáticas: home (textos), nosotros, vender, contacto, footer
   - Edición simple con campos (no necesita ser un CMS completo)

7. **Ajustes (`/admin/ajustes`)** (solo admin)
   - Datos de la empresa (nombre, dirección, teléfono, email)
   - Datos legales (CIF, registro, etc.)
   - Email donde se envían los leads
   - WhatsApp principal
   - Redes sociales
   - Stats / configuración de Google Analytics si se mete

---

## 6. Modelos de datos (Firestore)

### Colección: `inmuebles`

```typescript
{
  id: string,                    // ID único de Firestore
  ref: string,                   // Referencia visible "1247"
  slug: string,                  // Para URL "piso-venta-alcala-ensanche-3hab-ref-1247"
  titulo: string,
  operacion: "venta" | "alquiler",
  tipo: "piso" | "chalet" | "local" | "garaje" | "trastero" | "terreno" | "oficina",
  estado: "borrador" | "activo" | "reservado" | "vendido" | "archivado",
  destacado: boolean,

  precio: number,                // En euros
  precioAnterior: number | null, // Si está rebajado, mostrar tachado

  ubicacion: {
    municipio: string,           // "Alcalá de Henares"
    zona: string,                // "Ensanche" (barrio)
    direccion: string,           // Solo interna, no se muestra públicamente
    coordenadas: {
      lat: number,
      lng: number
    },
    radioPrivacidad: number      // Metros para el círculo en el mapa público (default 100)
  },

  detalles: {
    habitaciones: number,
    banos: number,
    metrosConstruidos: number,
    metrosUtiles: number | null,
    planta: string | null,        // "3ª", "Bajo", "Ático"
    anoConstruccion: number | null,
    orientacion: string | null,   // "Sur", "Norte"
    estado: string | null         // "Reformado", "A reformar", "Nueva construcción"
  },

  energetico: {
    consumo: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "en_tramite",
    emisiones: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "en_tramite",
    consumoKwh: number | null,
    emisionesKg: number | null
  },

  descripcion: string,            // Markdown o HTML

  caracteristicas: string[],      // ["ascensor", "garaje", "trastero", "ac", "calefaccion", ...]

  multimedia: {
    fotos: [
      {
        url: string,              // URL de Firebase Storage
        urlThumb: string,
        urlMedium: string,
        urlLarge: string,
        orden: number,
        portada: boolean
      }
    ],
    videoUrl: string | null,      // YouTube o Vimeo
    tour360Url: string | null,    // Kuula
    planoUrl: string | null       // URL de imagen del plano
  },

  agente: string,                 // ID del agente asignado

  stats: {
    vistas: number,
    contactos: number,
    favoritos: number             // Por si se mete en v2
  },

  seo: {
    metaTitle: string | null,     // Si null, se autogenera
    metaDescription: string | null
  },

  fechaCreacion: timestamp,
  fechaActualizacion: timestamp,
  fechaPublicacion: timestamp | null
}
```

### Colección: `leads`

```typescript
{
  id: string,
  tipo: "interes_inmueble" | "valoracion_casa" | "contacto_general",
  nombre: string,
  email: string,
  telefono: string,
  mensaje: string | null,

  // Si es interés en inmueble
  inmuebleId: string | null,
  inmuebleRef: string | null,
  inmuebleTitulo: string | null,

  // Si es valoración de casa
  direccionInmueble: string | null,
  tipoInmuebleVender: string | null,
  metrosVender: number | null,

  agenteAsignado: string | null,  // ID del agente que lo lleva
  estado: "nuevo" | "contactado" | "cualificado" | "cerrado_exito" | "cerrado_fallido",

  notas: [
    {
      texto: string,
      autor: string,                // ID del usuario que escribió la nota
      fecha: timestamp
    }
  ],

  origen: {
    pagina: string,                 // URL donde rellenó el form
    referer: string | null,
    userAgent: string | null
  },

  fechaCreacion: timestamp,
  fechaActualizacion: timestamp
}
```

### Colección: `usuarios`

```typescript
{
  id: string,                       // Coincide con UID de Firebase Auth
  email: string,
  rol: "admin" | "agente",
  perfil: {
    nombre: string,
    cargo: string,                  // "Director", "Agente comercial"
    telefono: string,
    whatsapp: string,               // Puede ser igual o diferente al teléfono
    bio: string | null,
    fotoUrl: string | null,
    zonas: string[]                 // Municipios en los que opera
  },
  activo: boolean,
  fechaCreacion: timestamp,
  ultimoAcceso: timestamp
}
```

### Colección: `configuracion`

Un solo documento con la configuración global del sitio.

```typescript
{
  empresa: {
    nombre: "Rehobot Real Estate",
    cif: string,
    direccion: string,
    telefono: string,
    email: string,
    emailLeads: string,            // Donde llegan los leads
    whatsappPrincipal: string,
    horario: string
  },
  legal: {
    avisoLegal: string,            // Markdown
    privacidad: string,
    cookies: string
  },
  redesSociales: {
    instagram: string | null,
    facebook: string | null,
    linkedin: string | null,
    twitter: string | null,
    youtube: string | null
  },
  seo: {
    metaTitleDefault: string,
    metaDescriptionDefault: string,
    keywordsDefault: string[]
  },
  paginas: {                        // Textos editables de páginas
    home: { ... },
    nosotros: { ... },
    vender: { ... }
  }
}
```

---

## 7. Flujos clave

### 7.1 Subir un inmueble nuevo

1. Agente entra en `/admin`
2. Login con email + password
3. Click en "Nuevo inmueble"
4. Rellena el formulario por bloques
5. Sube fotos (drag & drop) → se suben a Firebase Storage → se generan 3 versiones (thumb, medium, large) automáticamente vía Firebase Functions
6. Selecciona portada y ordena
7. Pega URL de tour 360° si tiene
8. Hace clic en mapa para marcar ubicación → guarda lat/lng
9. Guarda como borrador o publica
10. Si publica: aparece inmediatamente en la web pública

### 7.2 Llegada de un lead

1. Visitante rellena formulario en ficha de inmueble
2. Se valida en frontend (RGPD checkbox obligatorio, formato email/teléfono)
3. Se guarda en Firestore (`leads`)
4. Firebase Function se dispara:
   - Envía email a `emailLeads` (configurado en `configuracion`) y al agente asignado al inmueble
   - El email incluye: datos del lead, datos del inmueble, link directo al panel admin
5. Admin/agente ve notificación en el panel (badge rojo en el menú de Leads)
6. Click en el lead → ficha completa
7. Marca como "contactado" cuando llama
8. Añade notas del seguimiento

### 7.3 Búsqueda en la web pública

1. Usuario rellena buscador en home o va a `/inmuebles`
2. Se aplica filtro a la query de Firestore
3. Se devuelven inmuebles paginados (12 por página)
4. URL se actualiza con los filtros (`?zona=alcala&max=200000`)
5. Click en inmueble → ficha pública
6. Se incrementa contador de vistas

---

## 8. SEO

### 8.1 Configuración técnica

- Next.js con SSR/SSG para que todas las páginas sean indexables
- Sitemap automático generado en `/sitemap.xml`
- robots.txt
- Schema.org `RealEstateListing` en cada ficha
- Schema.org `LocalBusiness` en home
- Open Graph + Twitter Cards en todas las páginas
- URLs amigables (slugs descriptivos)
- Meta titles y descriptions personalizables por página
- Velocidad: Core Web Vitals top (Next.js + Vercel + imágenes optimizadas + cache)
- HTTPS (automático en Vercel)

### 8.2 Keywords objetivo

- "inmobiliaria Corredor del Henares"
- "pisos en venta Alcalá de Henares"
- "pisos en venta Torrejón de Ardoz"
- "pisos en venta Coslada"
- "chalet en venta Alcalá"
- "vender mi casa Alcalá de Henares"
- "tasación gratis Corredor del Henares"
- Long-tail por barrios: "pisos Ensanche Alcalá", "pisos La Garena", etc.

### 8.3 Plan de contenidos (blog futuro)

- "Cuánto cuesta el m² en Alcalá de Henares en 2026"
- "Mejores barrios para comprar piso en Torrejón"
- "Guía: vender piso en el Corredor del Henares"
- "Cercanías C-2 y C-7: zonas más baratas"

---

## 9. Cumplimiento legal

- Páginas legales obligatorias (aviso legal, privacidad, cookies)
- Banner de cookies RGPD-compliant (rechazar/aceptar/configurar antes de cargar cookies no técnicas)
- Doble opt-in en formularios (checkbox política de privacidad)
- Certificado energético visible en cada ficha (RD 390/2021)
- Cumplimiento Ley 12/2023 de Vivienda para alquileres (los honorarios los paga el propietario)
- LSSI-CE: identificación del prestador en aviso legal
- Hosting en UE (Vercel tiene datacenter en Europa, Firebase configurable a europe-west1)

---

## 10. Roadmap

### v1 — Lanzamiento (4-6 semanas con dedicación moderada)

- ✅ Estructura básica de Next.js + Tailwind + Firebase
- ✅ Modelos de datos en Firestore
- ✅ Autenticación de admin
- ✅ Panel admin: CRUD de inmuebles
- ✅ Panel admin: gestión de leads (solo admin)
- ✅ Panel admin: gestión de agentes
- ✅ Web pública: home, listado, ficha, zonas, vender, nosotros, contacto, legales
- ✅ Formularios funcionales con envío de email
- ✅ Mapa por inmueble (Leaflet)
- ✅ Embed de tour 360° y vídeos
- ✅ SEO técnico (sitemap, robots, schema, OG)
- ✅ Responsive móvil
- ✅ Banner de cookies + páginas legales

### v2 — Mejoras (mes 2-3 post-lanzamiento)

- Blog para SEO de contenidos
- Sistema de favoritos para visitantes (localStorage)
- Comparador de inmuebles
- Newsletter / alertas de nuevos inmuebles por email
- Multipublicación XML a Idealista/Fotocasa (cuando se contraten)
- Analytics avanzado (Plausible o GA4)

### v3 — Escalado (cuando facture)

- CRM integrado más avanzado
- Automatizaciones (n8n)
- Multiidioma si llega demanda
- App móvil (PWA o nativa)

---

## 11. Decisiones tomadas

| Pregunta | Decisión |
|----------|----------|
| Stack | Next.js + Firebase + Vercel |
| Dominio | IONOS (apuntando DNS a Vercel) |
| CMS | Panel admin custom (no WordPress) |
| Login clientes | NO en v1 (solo admin) |
| Favoritos | NO en v1 |
| Comparador | NO en v1 |
| Multiidioma | NO en v1 |
| Calculadora hipoteca | NO en v1 |
| Mapa por inmueble | SÍ |
| Página "Vender mi casa" | SÍ |
| Tour 360° | SÍ (embed Kuula) |
| Leads | Email automático + guardado en panel |
| Roles | Admin (ve todo, incluidos leads) + Agente (sin acceso a leads) |
| Ruta admin | `/admin` (no subdominio) |

---

## 12. Pendiente de confirmar

- [ ] Nombre exacto del dominio
- [ ] Email donde llegan los leads
- [ ] Datos fiscales completos (nombre fiscal, CIF, dirección)
- [ ] Cuántos agentes va a tener al inicio
- [ ] Cuenta de Google que será dueña del proyecto Firebase (recomendado: una cuenta nueva tipo `rehobotrealestate@gmail.com` del amigo)
- [ ] Logo en alta resolución (PNG transparente)
- [ ] Fotos del equipo y del local
- [ ] Textos definitivos de "Quiénes somos"
- [ ] Primeros 5-10 inmuebles para arrancar
