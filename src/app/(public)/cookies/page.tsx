import Link from "next/link";
import { PaginaLegal } from "@/components/legal/PaginaLegal";

export const metadata = {
  title: "Política de cookies — Rehobot Real Estate",
  description: "Información sobre el uso de cookies en el sitio web de Rehobot Real Estate.",
};

export default function CookiesPage() {
  return (
    <PaginaLegal titulo="Política de cookies" actualizada="20 de mayo de 2026">
      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que los sitios web instalan
        en tu navegador para almacenar información sobre tu visita. Permiten,
        por ejemplo, recordar tus preferencias, analizar el uso del sitio o
        medir su rendimiento.
      </p>

      <h2>2. ¿Qué cookies usamos?</h2>

      <h3>2.1 Cookies técnicas (necesarias)</h3>
      <p>
        Son imprescindibles para el funcionamiento del sitio. Se instalan
        automáticamente y no requieren consentimiento. Incluyen:
      </p>
      <ul>
        <li>
          <strong>Sesión de autenticación (Firebase Auth)</strong> en el panel
          de administración. Sólo se instala al hacer login en{" "}
          <Link href="/admin/login">/admin</Link>.
        </li>
        <li>
          <strong>Preferencia de cookies (`rehobot-cookie-consent`)</strong>:
          recuerda tu decisión sobre cookies para no volver a preguntarte.
          Caducidad: 12 meses.
        </li>
      </ul>

      <h3>2.2 Cookies analíticas (opcionales, requieren consentimiento)</h3>
      <p>
        Nos ayudan a entender cómo se utiliza el sitio para mejorarlo. Sólo se
        activan si pulsas &ldquo;Aceptar todas&rdquo; o si las habilitas
        manualmente desde &ldquo;Configurar&rdquo; en el banner de cookies.
      </p>
      <ul>
        <li>
          <strong>Identificador de sesión analítica:</strong> un ID anónimo
          almacenado en `sessionStorage` para contar visitantes únicos sin
          identificarte personalmente. Caduca al cerrar la pestaña.
        </li>
        <li>
          <strong>Registro de páginas visitadas:</strong> guardamos en nuestra
          base de datos (Firestore) la ruta visitada, la fecha y el
          referente. Estos datos se utilizan exclusivamente para estadísticas
          agregadas.
        </li>
      </ul>

      <h2>3. Cómo gestionar tus cookies</h2>
      <p>
        Cuando entras por primera vez, te mostramos un banner desde el que
        puedes:
      </p>
      <ul>
        <li>
          <strong>Aceptar todas</strong> — se activan las técnicas y las
          analíticas.
        </li>
        <li>
          <strong>Rechazar todas</strong> — sólo se activan las técnicas
          imprescindibles.
        </li>
        <li>
          <strong>Configurar</strong> — elige qué tipos quieres aceptar.
        </li>
      </ul>
      <p>
        Puedes cambiar tu decisión en cualquier momento haciendo clic en el
        enlace &ldquo;Cookies&rdquo; al pie de la página.
      </p>

      <h2>4. Cómo desactivarlas en tu navegador</h2>
      <p>
        También puedes configurar tu navegador para bloquear o eliminar
        cookies. Aquí tienes los enlaces oficiales:
      </p>
      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/es/kb/proteccion-contra-rastreo-mejorada-firefox-desktop"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2>5. Cambios</h2>
      <p>
        Podemos actualizar esta política cuando incorporemos o eliminemos
        cookies. Cuando lo hagamos, volveremos a solicitar tu consentimiento
        si es legalmente necesario.
      </p>

      <p className="mt-12 text-xs text-gray-text">
        Consulta también nuestro{" "}
        <Link href="/aviso-legal">aviso legal</Link> y nuestra{" "}
        <Link href="/privacidad">política de privacidad</Link>.
      </p>
    </PaginaLegal>
  );
}
