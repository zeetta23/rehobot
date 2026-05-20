import Link from "next/link";
import { PaginaLegal } from "@/components/legal/PaginaLegal";

export const metadata = {
  title: "Aviso legal — Rehobot Real Estate",
  description: "Información legal del sitio web de Rehobot Real Estate.",
};

export default function AvisoLegalPage() {
  return (
    <PaginaLegal titulo="Aviso legal" actualizada="20 de mayo de 2026">
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de
        Servicios de la Sociedad de la Información y de Comercio Electrónico
        (LSSI-CE), se informa al usuario de los datos identificativos del
        prestador de servicios:
      </p>
      <ul>
        <li>
          <strong>Denominación social:</strong> [Razón social de Rehobot]
        </li>
        <li>
          <strong>Nombre comercial:</strong> Rehobot Real Estate
        </li>
        <li>
          <strong>CIF / NIF:</strong> [CIF de Rehobot]
        </li>
        <li>
          <strong>Domicilio:</strong> [Dirección postal completa], Alcalá de
          Henares, Madrid, España.
        </li>
        <li>
          <strong>Email de contacto:</strong>{" "}
          <a href="mailto:info@rehobotrealestate.es">
            info@rehobotrealestate.es
          </a>
        </li>
        <li>
          <strong>Teléfono:</strong> +34 643 08 99 84
        </li>
        <li>
          <strong>Datos registrales:</strong> [Registro Mercantil de Madrid,
          Tomo X, Folio Y, Hoja Z]
        </li>
      </ul>

      <h2>2. Objeto y ámbito de aplicación</h2>
      <p>
        El presente aviso legal regula el acceso y uso del sitio web{" "}
        <a href="/">rehobotrealestate.es</a> (en adelante, &ldquo;el sitio
        web&rdquo;), titularidad de [Razón social]. La utilización del sitio web
        implica la aceptación plena y sin reservas de todas las cláusulas del
        presente aviso legal por parte del usuario.
      </p>

      <h2>3. Propiedad intelectual e industrial</h2>
      <p>
        Todos los contenidos del sitio web —incluyendo textos, fotografías,
        logotipos, marcas, gráficos, código fuente, diseños y software— son
        propiedad de Rehobot Real Estate o de terceros cuyos derechos hayan
        sido debidamente autorizados, y están protegidos por la normativa de
        propiedad intelectual e industrial.
      </p>
      <p>
        Queda prohibida la reproducción, distribución, comunicación pública o
        transformación de estos contenidos sin la autorización expresa y por
        escrito de su titular, salvo en los casos legalmente previstos.
      </p>

      <h2>4. Condiciones de uso</h2>
      <p>
        El usuario se compromete a utilizar el sitio web de conformidad con la
        ley, el presente aviso legal, la moral y el orden público. En
        particular, se obliga a no utilizar el sitio web con fines o efectos
        ilícitos, lesivos de los derechos e intereses de terceros, o que de
        cualquier forma puedan dañar, inutilizar o deteriorar el sitio web o
        impedir su normal disfrute por otros usuarios.
      </p>

      <h2>5. Información sobre inmuebles</h2>
      <p>
        Las descripciones, fotografías, precios y demás características de los
        inmuebles publicados tienen carácter meramente informativo y no
        constituyen oferta vinculante. Rehobot Real Estate hace todo lo
        posible por mantener la información actualizada, pero no garantiza la
        ausencia de errores, ni se hace responsable de las decisiones tomadas
        por el usuario en base a la información publicada sin verificación
        previa.
      </p>
      <p>
        Conforme al Real Decreto 390/2021 sobre certificación energética, en
        cada ficha de inmueble se muestra la calificación energética
        correspondiente cuando ésta es obligatoria.
      </p>

      <h2>6. Enlaces a terceros</h2>
      <p>
        El sitio web puede contener enlaces a sitios de terceros. Rehobot Real
        Estate no asume responsabilidad alguna sobre el contenido, las
        políticas de privacidad o las prácticas de dichos sitios externos.
      </p>

      <h2>7. Responsabilidad</h2>
      <p>
        Rehobot Real Estate no se hace responsable de los daños y perjuicios,
        directos o indirectos, derivados del uso del sitio web, ni de las
        interrupciones temporales del servicio, virus informáticos o cualquier
        otro elemento ajeno a su control.
      </p>

      <h2>8. Legislación aplicable y jurisdicción</h2>
      <p>
        El presente aviso legal se rige por la legislación española. Para la
        resolución de cualquier controversia que pudiera derivarse del acceso
        o uso del sitio web, las partes se someten a los Juzgados y Tribunales
        de Alcalá de Henares (Madrid), salvo que la normativa aplicable
        disponga otra cosa.
      </p>

      <h2>9. Modificaciones</h2>
      <p>
        Rehobot Real Estate se reserva el derecho a modificar el presente
        aviso legal en cualquier momento. La versión vigente será la
        publicada en este sitio web en cada momento.
      </p>

      <p className="mt-12 text-xs text-gray-text">
        Consulta también nuestra{" "}
        <Link href="/privacidad">política de privacidad</Link> y nuestra{" "}
        <Link href="/cookies">política de cookies</Link>.
      </p>
    </PaginaLegal>
  );
}
