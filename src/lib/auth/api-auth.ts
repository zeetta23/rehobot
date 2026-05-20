import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

interface VerificacionExitosa {
  ok: true;
  uid: string;
  email: string | null;
  rol: "admin" | "agente";
}

interface VerificacionFallida {
  ok: false;
  response: NextResponse;
}

export type Verificacion = VerificacionExitosa | VerificacionFallida;

/**
 * Verifica el header Authorization de una request y devuelve el rol del
 * usuario. Si falla, devuelve un NextResponse listo para hacer return.
 */
export async function verificarAuth(
  request: Request,
  requiereRol?: "admin" | "agente",
): Promise<Verificacion> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No autenticado" },
        { status: 401 },
      ),
    };
  }
  const idToken = authHeader.slice(7);

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Token inválido" },
        { status: 401 },
      ),
    };
  }

  const db = getAdminDb();
  const userDoc = await db.collection("usuarios").doc(decoded.uid).get();
  if (!userDoc.exists) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Usuario sin perfil en Firestore" },
        { status: 403 },
      ),
    };
  }
  const data = userDoc.data() ?? {};
  if (data.activo === false) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Usuario desactivado" },
        { status: 403 },
      ),
    };
  }
  const rol = data.rol as "admin" | "agente" | undefined;
  if (!rol) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Usuario sin rol asignado" },
        { status: 403 },
      ),
    };
  }
  if (requiereRol === "admin" && rol !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Requiere rol admin" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    uid: decoded.uid,
    email: decoded.email ?? null,
    rol,
  };
}
