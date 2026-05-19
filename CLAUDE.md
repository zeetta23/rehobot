# Rehobot Real Estate — Contexto del proyecto

> Este archivo se carga automáticamente al inicio de cada sesión de Claude Code. Mantenlo conciso: detalles largos viven en los documentos enlazados abajo.

## Qué es

Web inmobiliaria para **Rehobot Real Estate**, una inmobiliaria del **Corredor del Henares** (Alcalá de Henares, Torrejón, Coslada, San Fernando, Mejorada, Velilla, Loeches). Foco en **venta** (95%) y alquiler ocasional (5%).

Dos partes:
- **Web pública**: captación de leads de compradores (formulario por ficha) y de propietarios ("vender mi casa"). SEO local.
- **Panel admin** en `/admin`: roles **admin** (ve y gestiona todo, incluidos leads) y **agente** (solo sus inmuebles, sin acceso a leads ajenos).

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS — bundler Turbopack por defecto
- **Backend/datos**: Firebase Firestore + Storage + Auth (email/password)
- **Hosting**: Vercel (plan Hobby), deploy automático desde GitHub
- **Dominio**: IONOS (DNS apuntando a Vercel)
- **Email**: Resend o EmailJS · **Mapa**: Leaflet + OpenStreetMap · **Tour 360°**: embed Kuula

Coste año 1 estimado: ~10 € (solo el dominio).

> Nota: el documento técnico original menciona Next.js 15; arrancamos directamente con Next.js 16 porque era la última estable en el momento del scaffolding. Ver también `AGENTS.md` (generado por create-next-app) con advertencias específicas de esta versión.

## Identidad visual (resumen)

- Azul marino `#0A1F44` (principal) · Azul medio `#1E3A6F`
- Dorado champagne `#C9A96E` (acentos/CTAs) · Dorado claro `#E4C896`
- Tipografía: serif elegante (Playfair Display) para títulos, Inter para cuerpo
- Estilo: elegante, premium accesible. Mucho espacio en blanco, foto grande

## Documentos de referencia (leer si hace falta detalle)

- [`rehobot-documento-tecnico.md`](./rehobot-documento-tecnico.md) — "biblia" del proyecto: arquitectura completa, modelos Firestore, páginas, SEO, roadmap, decisiones tomadas.
- [`rehobot-guia-paso-a-paso.md`](./rehobot-guia-paso-a-paso.md) — guía de onboarding para Manu en Git, GitHub y Claude Code desde cero.

## Forma de trabajar con Manu

Es su primera vez con Next.js + Firebase a este nivel, primera vez con Claude Code y primera vez usando Git/GitHub seriamente. Viene de montar GastoIntel desde chat.

- **Sin auto-approve**: explicar y pedir confirmación antes de comandos importantes (instalar deps, crear archivos clave, commits, push, deploys, tocar cuentas externas).
- Explicar **qué hace cada comando** y **por qué**.
- Tareas triviales (ls, leer archivos) no necesitan confirmación extra.

## Decisiones firmes para v1 (NO añadir sin aprobación)

Sí: web pública completa, panel admin con roles, mapa por inmueble, página "vender mi casa", tour 360° embed, leads vía email + panel, SEO técnico.

No en v1: login de clientes, favoritos, comparador, multiidioma, calculadora hipoteca, blog (queda para v2), multipublicación XML a portales.

## Estado actual

- Repo Git inicializado, conectado a GitHub: `https://github.com/zeetta23/rehobot` (privado).
- Proyecto Next.js 16 scaffoldeado en la raíz (App Router, TypeScript, Tailwind, ESLint, `src/`, alias `@/*`).
- Estructura típica: `src/app/`, `public/`, `package.json`. Dev server arranca con `npm run dev` en `http://localhost:3000`.
- **Deploy en producción**: `https://rehobot-rose.vercel.app` (Vercel conectado al repo; cada push a `main` redespliega automáticamente en ~1-2 min).
- Pendiente: configurar paleta corporativa + tipografías, configurar Firebase.
