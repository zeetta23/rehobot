# Guía paso a paso — Cómo arrancar el proyecto Rehobot desde cero

> Para Manu. Asume que NO has usado nunca Git, GitHub ni Claude Code. Vamos a aprender lo justo y necesario, sin teoría innecesaria.

---

## Antes de empezar: vocabulario básico que vas a oír

No te abrumes con esto, lo iremos viendo en práctica:

- **Terminal / Consola**: la "pantalla negra" donde escribes comandos. En Mac se llama "Terminal", en Windows "PowerShell" o "CMD".
- **Comando**: una orden que escribes en la terminal y pulsas Enter. Por ejemplo `cd Documentos`.
- **Git**: programa que guarda versiones de tu código. Como el "guardar como" de Word, pero con superpoderes.
- **GitHub**: una web donde subes tu código para guardarlo en la nube y compartirlo. Tipo Google Drive pero para código.
- **Repositorio (repo)**: la carpeta del proyecto con todo su historial de versiones.
- **Commit**: una "foto" del estado del proyecto en un momento concreto. Cada vez que terminas una tarea haces un commit.
- **Push**: subir tus cambios locales a GitHub.
- **Pull**: bajarte cambios de GitHub.
- **Node.js**: motor que ejecuta JavaScript fuera del navegador. Lo necesitamos porque Next.js está hecho con JavaScript.
- **npm**: gestor de paquetes de Node. Es como una "app store" de herramientas de programación.
- **Claude Code**: una aplicación donde Claude (yo) trabaja directamente en tu ordenador, edita archivos, ejecuta comandos, etc.
- **Vercel**: servicio donde se hospeda la web.
- **Firebase**: servicio donde se guardan los inmuebles y las fotos.

---

## Fase 0 — Preparar tu ordenador

### Paso 0.1 — Saber qué sistema operativo tienes

¿Mac o Windows? Cambia algunos pasos. Avísame cuando me confirmes.

### Paso 0.2 — Instalar Node.js

Node.js es el "motor" que necesita Next.js para funcionar.

1. Ve a [nodejs.org](https://nodejs.org)
2. Descarga la versión **LTS** (la de la izquierda, con el sello verde).
3. Instalador típico: siguiente → siguiente → instalar.
4. Para comprobar que se instaló bien, abre la Terminal y escribe:
   ```
   node --version
   ```
   Te debe salir algo como `v20.x.x` o `v22.x.x`. Si te sale eso, perfecto.
5. Luego escribe:
   ```
   npm --version
   ```
   Te debe salir algo como `10.x.x`.

### Paso 0.3 — Instalar Git

Git es el sistema que guarda versiones de tu código.

**Si tienes Mac:**
- Abre la Terminal y escribe `git --version`.
- Si te dice que no está instalado, te ofrecerá instalarlo. Acepta.
- Si te sale una versión, ya lo tienes.

**Si tienes Windows:**
- Ve a [git-scm.com](https://git-scm.com/download/win) y descarga el instalador.
- Instálalo dejando todas las opciones por defecto (Next, Next, Next...).
- Abre PowerShell y escribe `git --version` para confirmar.

### Paso 0.4 — Configurar Git con tus datos

Solo se hace una vez en la vida. Abre la Terminal y escribe (cambia los datos por los tuyos):

```
git config --global user.name "Manu"
git config --global user.email "tu-email@gmail.com"
```

Usa el mismo email con el que vas a crear la cuenta de GitHub.

### Paso 0.5 — Crear cuenta de GitHub

1. Ve a [github.com](https://github.com)
2. "Sign up" → crea cuenta con el mismo email que usaste arriba.
3. Verifica el email.
4. Cuando te pregunte el plan, elige el **gratis** (Free).

### Paso 0.6 — Instalar VS Code (recomendado pero opcional)

VS Code es un editor de código gratis de Microsoft. Útil para ver y editar archivos cuando lo necesites.

1. Ve a [code.visualstudio.com](https://code.visualstudio.com)
2. Descarga el instalador para tu sistema.
3. Instala normal.

---

## Fase 1 — Crear las cuentas del proyecto

### Paso 1.1 — Cuenta de Google para Firebase (decisión importante)

Recordatorio: lo ideal es que esta cuenta sea **de tu amigo, no tuya**, porque será el dueño técnico del proyecto.

**Recomendación**: que tu amigo cree un Gmail nuevo tipo `rehobotrealestate@gmail.com` que sea exclusivo para esto. Así separa lo personal de lo profesional.

1. Tu amigo entra en [gmail.com](https://gmail.com), "Crear cuenta".
2. Elige nombre tipo `rehobotrealestate@gmail.com` (si está cogido, prueba variaciones).
3. Apunta la contraseña en un sitio seguro (gestor de contraseñas mejor que en papel).
4. Te pasa los datos para que tú también puedas acceder durante el desarrollo.

### Paso 1.2 — Crear proyecto en Firebase

Esto lo haremos juntos cuando lleguemos a esa fase. Por ahora, basta con tener la cuenta de Google lista.

### Paso 1.3 — Crear cuenta de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. "Sign Up" → elige "Continue with GitHub" (esto conecta automáticamente las dos cuentas).
3. Autoriza el acceso.
4. Listo, ya tienes Vercel.

---

## Fase 2 — Instalar Claude Code

Claude Code es la herramienta donde voy a trabajar contigo. Reemplaza el chat para tareas de desarrollo.

### Paso 2.1 — Instalación

Abre la Terminal y escribe:

```
npm install -g @anthropic-ai/claude-code
```

Espera a que termine (puede tardar 1-2 minutos).

Si te da error de permisos en Mac, prueba:
```
sudo npm install -g @anthropic-ai/claude-code
```
Te pedirá la contraseña de tu Mac.

### Paso 2.2 — Login

En la Terminal escribe:

```
claude
```

Te abrirá una ventana del navegador para que te logues con tu cuenta de Anthropic (la misma con la que usas este chat).

### Paso 2.3 — Comprobar que funciona

Una vez logueado, deberías estar dentro de Claude Code en la terminal. Verás una interfaz donde puedes escribirme mensajes directamente.

Para salir: `Ctrl+C` dos veces o escribes `/exit`.

---

## Fase 3 — Crear el proyecto

> **A partir de aquí ya trabajaremos juntos en Claude Code. Esta sección es solo orientativa para que veas qué viene.**

### Paso 3.1 — Crear carpeta del proyecto

En tu ordenador, decide dónde guardar el proyecto. Por ejemplo:

- Mac: `/Users/manu/Proyectos/rehobot`
- Windows: `C:\Users\Manu\Documentos\Proyectos\rehobot`

Crea esa carpeta a mano o desde terminal:

```
mkdir -p ~/Proyectos/rehobot
cd ~/Proyectos/rehobot
```

### Paso 3.2 — Abrir Claude Code dentro de la carpeta

Desde la terminal, **estando dentro de la carpeta del proyecto**:

```
claude
```

A partir de ahí, Claude Code trabajará dentro de esa carpeta.

### Paso 3.3 — Yo te guiaré con todo lo siguiente

Una vez en Claude Code, te diré exactamente qué pegarme o qué responderme. No tienes que recordar comandos. Yo creo los archivos, instalo dependencias, ejecuto cosas. Tú solo apruebas cada paso.

Te explicaré paso a paso:

1. Cómo creamos el proyecto Next.js
2. Cómo configuramos Firebase
3. Cómo subimos el código a GitHub
4. Cómo conectamos con Vercel para que se despliegue solo
5. Cómo apuntamos el dominio de IONOS a Vercel
6. Cómo trabajamos día a día (hacer cambios, ver resultados, publicar)

---

## Fase 4 — Comandos básicos que vas a usar

No tienes que memorizarlos. Solo para que los reconozcas cuando los veas.

### Navegación en terminal

```
cd nombre-carpeta       # Entrar en una carpeta
cd ..                   # Subir un nivel
cd ~                    # Ir a tu carpeta personal
ls                      # Listar archivos (Mac/Linux)
dir                     # Listar archivos (Windows)
pwd                     # Ver en qué carpeta estás
```

### Git (versiones)

```
git status              # Ver qué archivos has cambiado
git add .               # Añadir todos los cambios al "carrito"
git commit -m "mensaje" # Hacer foto de los cambios con un mensaje
git push                # Subir cambios a GitHub
git pull                # Bajar cambios de GitHub
```

### Node / npm (programación)

```
npm install             # Instalar dependencias del proyecto
npm run dev             # Arrancar el servidor de desarrollo local
npm run build           # Compilar para producción
```

### Claude Code

```
claude                  # Abrir Claude Code en la carpeta actual
/exit                   # Salir
```

---

## Fase 5 — Cómo trabajaremos día a día

### Para hacer cambios

1. Abres terminal en la carpeta del proyecto.
2. Escribes `claude` para abrir Claude Code.
3. Me cuentas qué quieres cambiar.
4. Yo hago los cambios.
5. Vemos juntos cómo queda en local con `npm run dev`.
6. Si está bien, hago un commit y push a GitHub.
7. Vercel detecta el push y publica la nueva versión en la web automáticamente (1-2 minutos).

### Para emergencias o bugs

1. Abres Claude Code en la carpeta.
2. Me dices "se ha roto X".
3. Lo investigamos y arreglamos juntos.

### Para que tu amigo aprenda a usar el panel

Cuando esté terminado el panel admin, le haces una videollamada de 1 hora donde:
- Le enseñas a entrar en `/admin`
- Subís un inmueble juntos
- Le muestras cómo ver leads
- Le explicas estados, fotos, etc.

Yo te puedo preparar un mini-manual en PDF para él si lo necesitas.

---

## Resumen visual del flujo completo

```
Tú (Manu)
   ↓
   Abres terminal y escribes "claude"
   ↓
Claude Code (en tu ordenador)
   ↓
   Edita los archivos del proyecto en tu carpeta local
   ↓
   Cuando terminamos un cambio: git commit + git push
   ↓
GitHub (en la nube)
   ↓
   Vercel detecta el push automáticamente
   ↓
Vercel
   ↓
   Compila la web y la publica en https://rehobotrealestate.es
   ↓
Usuarios finales ven la web actualizada
```

Y por separado:

```
Tu amigo (admin)
   ↓
   Entra en https://rehobotrealestate.es/admin con su email y password
   ↓
   Sube un inmueble nuevo
   ↓
   El inmueble se guarda en Firebase Firestore
   ↓
   Las fotos se guardan en Firebase Storage
   ↓
   Aparece instantáneamente en la web pública (sin tocar código)
```

---

## ¿Qué hago AHORA mismo?

Como tú me pediste el documento técnico y la guía, este es el plan:

1. **Lee esta guía con calma**. No tienes que entenderlo todo de golpe.
2. **Dime tu sistema operativo** (Mac/Windows) para ajustar pasos.
3. **Haz los pasos de la Fase 0** (instalar Node.js, Git, configurarlo, crear cuenta de GitHub, instalar VS Code).
4. **Avísame cuando esos pasos estén hechos** y cuando tu amigo te pase el dominio confirmado y los datos pendientes.
5. **Yo te guiaré paso a paso con todo lo demás** desde Claude Code.

Si te atascas en cualquier paso, vuelves al chat y me preguntas. No hace falta que avances solo.

---

## Bonus — Cosas útiles que aprender por el camino

A medida que avancemos, te iré explicando:
- Cómo leer errores típicos (no son tan asustantes como parecen)
- Cómo deshacer cambios si la cagas (con Git es muy fácil)
- Cómo testar en local antes de publicar
- Cómo añadir nuevas funcionalidades sin romper lo que ya funciona
- Cómo darle de baja al hosting si en algún momento queréis cambiar

Tranquilo, esto no es ciencia espacial. Si has montado GastoIntel conmigo desde el chat, esto te va a parecer hasta más cómodo porque verás los cambios en directo.

¡Vamos!
