import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { verificarAuth } from "@/lib/auth/api-auth";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Rehobot <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://rehobot-rose.vercel.app";

interface CrearUsuarioBody {
  email: string;
  password: string;
  rol: "admin" | "agente";
  enviarEmail?: boolean;
  perfil: {
    nombre: string;
    cargo: string;
    telefono: string;
    whatsapp: string;
    bio?: string | null;
    fotoUrl?: string | null;
    zonas?: string[];
  };
}

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const auth = await verificarAuth(request, "admin");
  if (!auth.ok) return auth.response;

  let body: CrearUsuarioBody;
  try {
    body = (await request.json()) as CrearUsuarioBody;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Validación básica
  if (!body.email || !body.password || !body.rol || !body.perfil?.nombre) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios (email, password, rol, perfil.nombre)" },
      { status: 400 },
    );
  }
  if (body.password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 },
    );
  }
  if (!["admin", "agente"].includes(body.rol)) {
    return NextResponse.json(
      { error: "Rol no válido" },
      { status: 400 },
    );
  }

  const adminAuth = getAdminAuth();
  const db = getAdminDb();

  // 1. Crear usuario en Firebase Auth
  let userRecord;
  try {
    userRecord = await adminAuth.createUser({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      displayName: body.perfil.nombre,
      emailVerified: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error creando usuario";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // 2. Crear doc en Firestore
  try {
    await db.collection("usuarios").doc(userRecord.uid).set({
      email: body.email.trim().toLowerCase(),
      rol: body.rol,
      activo: true,
      perfil: {
        nombre: body.perfil.nombre,
        cargo: body.perfil.cargo ?? "",
        telefono: body.perfil.telefono ?? "",
        whatsapp: body.perfil.whatsapp ?? body.perfil.telefono ?? "",
        bio: body.perfil.bio ?? null,
        fotoUrl: body.perfil.fotoUrl ?? null,
        zonas: body.perfil.zonas ?? [],
      },
      fechaCreacion: FieldValue.serverTimestamp(),
      ultimoAcceso: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // Rollback: si falló Firestore, eliminamos el usuario de Auth.
    try {
      await adminAuth.deleteUser(userRecord.uid);
    } catch {}
    const msg = err instanceof Error ? err.message : "Error creando perfil";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // 3. Email de bienvenida (opcional, no bloquea si falla)
  let emailEnviado = false;
  let emailError: string | null = null;
  if (body.enviarEmail !== false && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f5f5f7;">
          <div style="background:#0a1f44;padding:24px;border-radius:12px 12px 0 0;color:#fff;">
            <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">Rehobot Real Estate</p>
            <h1 style="margin:8px 0 0;font-family:Playfair Display,Georgia,serif;font-size:24px;">Bienvenido al panel</h1>
          </div>
          <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;color:#1a1a1a;">
            <p>Hola ${escapeHtml(body.perfil.nombre)},</p>
            <p>Se te ha creado una cuenta como <strong>${body.rol === "admin" ? "administrador" : "agente"}</strong> en el panel de Rehobot Real Estate.</p>
            <ul style="padding-left:18px;line-height:1.7;">
              <li><strong>Email:</strong> ${escapeHtml(body.email)}</li>
              <li><strong>Contraseña inicial:</strong> <code style="background:#f5f5f7;padding:2px 6px;border-radius:4px;">${escapeHtml(body.password)}</code></li>
            </ul>
            <p>Por seguridad, te recomendamos cambiar la contraseña tras el primer acceso.</p>
            <div style="margin-top:24px;text-align:center;">
              <a href="${APP_URL}/admin/login" style="display:inline-block;padding:12px 24px;background:#0a1f44;color:#fff;text-decoration:none;border-radius:999px;font-weight:500;">Acceder al panel</a>
            </div>
            <p style="margin-top:24px;font-size:12px;color:#6b7280;">Si no esperabas este email, contacta con el administrador.</p>
          </div>
        </div>
      `;
      const result = await resend.emails.send({
        from: FROM,
        to: body.email,
        subject: "Bienvenido al panel de Rehobot Real Estate",
        html,
      });
      if (result.error) {
        emailError = result.error.message;
      } else {
        emailEnviado = true;
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : "Error desconocido";
    }
  }

  return NextResponse.json({
    ok: true,
    uid: userRecord.uid,
    email: userRecord.email,
    emailEnviado,
    emailError,
  });
}
