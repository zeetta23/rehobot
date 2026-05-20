import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { verificarAuth } from "@/lib/auth/api-auth";

interface ActualizarUsuarioBody {
  rol?: "admin" | "agente";
  activo?: boolean;
  perfil?: {
    nombre?: string;
    cargo?: string;
    telefono?: string;
    whatsapp?: string;
    bio?: string | null;
    fotoUrl?: string | null;
    zonas?: string[];
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  const auth = await verificarAuth(request, "admin");
  if (!auth.ok) return auth.response;

  const { uid } = await params;
  if (!uid) {
    return NextResponse.json({ error: "uid requerido" }, { status: 400 });
  }

  let body: ActualizarUsuarioBody;
  try {
    body = (await request.json()) as ActualizarUsuarioBody;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Evitar que un admin se desactive a sí mismo
  if (auth.uid === uid && body.activo === false) {
    return NextResponse.json(
      { error: "No puedes desactivar tu propia cuenta" },
      { status: 400 },
    );
  }
  if (auth.uid === uid && body.rol === "agente") {
    return NextResponse.json(
      { error: "No puedes cambiar tu propio rol a agente" },
      { status: 400 },
    );
  }

  const db = getAdminDb();
  const docRef = db.collection("usuarios").doc(uid);
  const snap = await docRef.get();
  if (!snap.exists) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 },
    );
  }

  const updates: Record<string, unknown> = {
    fechaActualizacion: FieldValue.serverTimestamp(),
  };
  if (body.rol) updates.rol = body.rol;
  if (typeof body.activo === "boolean") updates.activo = body.activo;
  if (body.perfil) {
    for (const [key, value] of Object.entries(body.perfil)) {
      if (value !== undefined) {
        updates[`perfil.${key}`] = value;
      }
    }
  }

  await docRef.update(updates);

  // Si se desactiva el usuario, también lo deshabilitamos en Auth (no podrá loguear)
  if (body.activo === false) {
    try {
      await getAdminAuth().updateUser(uid, { disabled: true });
    } catch {}
  } else if (body.activo === true) {
    try {
      await getAdminAuth().updateUser(uid, { disabled: false });
    } catch {}
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  const auth = await verificarAuth(request, "admin");
  if (!auth.ok) return auth.response;

  const { uid } = await params;
  if (!uid) {
    return NextResponse.json({ error: "uid requerido" }, { status: 400 });
  }
  if (auth.uid === uid) {
    return NextResponse.json(
      { error: "No puedes eliminar tu propia cuenta" },
      { status: 400 },
    );
  }

  const adminAuth = getAdminAuth();
  const db = getAdminDb();

  // Borramos primero de Auth (si falla, no tocamos Firestore)
  try {
    await adminAuth.deleteUser(uid);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al eliminar de Auth";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Luego de Firestore
  await db.collection("usuarios").doc(uid).delete();

  return NextResponse.json({ ok: true });
}
