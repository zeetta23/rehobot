import Link from "next/link";
import { PaginaLegal } from "@/components/legal/PaginaLegal";

export const metadata = {
  title: "Política de privacidad — Rehobot Real Estate",
  description:
    "Información sobre el tratamiento de datos personales que realiza Rehobot Real Estate.",
};

export default function PrivacidadPage() {
  return (
    <PaginaLegal
      titulo="Política de privacidad"
      actualizada="20 de mayo de 2026"
    >
      <p>
        En Rehobot Real Estate nos tomamos muy en serio la privacidad de
        nuestros usuarios. La presente política describe cómo recogemos,
        tratamos y protegemos los datos personales que nos facilites a través
        de nuestro sitio web, formularios y demás canales de contacto.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Responsable:</strong> [Razón social de Rehobot]
        </li>
        <li>
          <strong>CIF:</strong> [CIF de Rehobot]
        </li>
        <li>
          <strong>Domicilio:</strong> [Dirección postal], Alcalá de Henares,
          Madrid, España.
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:info@rehobotrealestate.es">
            info@rehobotrealestate.es
          </a>
        </li>
        <li>
          <strong>Teléfono:</strong> +34 916 00 00 00
        </li>
      </ul>

      <h2>2. Datos que recogemos</h2>
      <p>
        Tratamos los siguientes datos cuando interactúas con nosotros:
      </p>
      <ul>
        <li>
          <strong>Datos identificativos y de contacto:</strong> nombre y
          apellidos, email, teléfono.
        </li>
        <li>
          <strong>Información sobre el inmueble:</strong> si rellenas el
          formulario de venta, tipo de inmueble, municipio, dirección
          aproximada y metros cuadrados.
        </li>
        <li>
          <strong>Información de tu consulta:</strong> mensaje libre que nos
          envías y, en su caso, el inmueble por el que muestras interés.
        </li>
        <li>
          <strong>Datos de navegación:</strong> dirección IP, tipo de
          navegador y dispositivo, páginas visitadas, fecha y hora de la
          visita. Sólo si has aceptado las cookies analíticas en el banner de
          cookies.
        </li>
      </ul>

      <h2>3. Finalidad y base legal</h2>
      <p>Utilizamos tus datos para las siguientes finalidades:</p>
      <ul>
        <li>
          <strong>Gestionar tu solicitud o consulta</strong> y ponernos en
          contacto contigo para atenderla. Base legal: ejecución de medidas
          precontractuales a petición del interesado (art. 6.1.b RGPD).
        </li>
        <li>
          <strong>Llevar la relación comercial</strong> de compra, venta o
          alquiler de inmuebles cuando ésta llegue a formalizarse. Base legal:
          ejecución de un contrato (art. 6.1.b RGPD).
        </li>
        <li>
          <strong>Análisis estadístico</strong> agregado del uso del sitio
          web. Base legal: consentimiento del interesado (art. 6.1.a RGPD),
          que puedes retirar en cualquier momento desde el banner de
          cookies.
        </li>
        <li>
          <strong>Cumplir obligaciones legales</strong> (fiscales,
          mercantiles, etc.). Base legal: cumplimiento de obligación legal
          (art. 6.1.c RGPD).
        </li>
      </ul>

      <h2>4. Plazo de conservación</h2>
      <p>
        Los datos personales se conservarán durante el tiempo necesario para
        cumplir la finalidad para la que fueron recabados y, en su caso,
        durante los plazos legalmente exigidos. Los datos de los formularios
        de contacto que no deriven en relación contractual se conservarán por
        un máximo de <strong>2 años</strong> desde la última interacción,
        salvo solicitud previa de supresión.
      </p>

      <h2>5. Destinatarios y cesión</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Para la
        prestación del servicio web utilizamos los siguientes encargados del
        tratamiento, todos ellos con garantías adecuadas:
      </p>
      <ul>
        <li>
          <strong>Google Ireland Ltd. (Firebase):</strong> almacenamiento de
          datos y autenticación. Datos alojados en regiones de la UE.
        </li>
        <li>
          <strong>Vercel Inc.:</strong> alojamiento web (con datacenters en la
          UE).
        </li>
        <li>
          <strong>Resend, Inc.:</strong> envío de notificaciones por email.
        </li>
      </ul>

      <h2>6. Derechos del interesado</h2>
      <p>
        Tienes derecho a acceder, rectificar y suprimir tus datos, así como a
        limitar u oponerte a su tratamiento, a la portabilidad de los datos y
        a no ser objeto de decisiones automatizadas. Para ejercer estos
        derechos, escríbenos a{" "}
        <a href="mailto:info@rehobotrealestate.es">
          info@rehobotrealestate.es
        </a>{" "}
        adjuntando copia de tu DNI u otro documento que acredite tu identidad.
      </p>
      <p>
        Si consideras que el tratamiento no se ajusta a la normativa, también
        tienes derecho a presentar una reclamación ante la{" "}
        <a
          href="https://www.aepd.es"
          target="_blank"
          rel="noopener noreferrer"
        >
          Agencia Española de Protección de Datos
        </a>{" "}
        (aepd.es).
      </p>

      <h2>7. Medidas de seguridad</h2>
      <p>
        Hemos adoptado las medidas técnicas y organizativas necesarias para
        garantizar la seguridad de tus datos personales y evitar su
        alteración, pérdida, tratamiento o acceso no autorizado.
      </p>

      <h2>8. Cambios</h2>
      <p>
        Nos reservamos el derecho a modificar la presente política para
        adaptarla a novedades legislativas. Cuando se produzcan cambios
        significativos, lo notificaremos de forma visible en el sitio web.
      </p>

      <p className="mt-12 text-xs text-gray-text">
        Consulta también nuestro{" "}
        <Link href="/aviso-legal">aviso legal</Link> y nuestra{" "}
        <Link href="/cookies">política de cookies</Link>.
      </p>
    </PaginaLegal>
  );
}
