import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminAuth } from "@/lib/firebase-admin";
import { verificarAuth } from "@/lib/auth/api-auth";

const FROM = process.env.EMAIL_FROM || "Rehobot <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://rehobot-rose.vercel.app";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ uid: string }> },
) {
  const auth = await verificarAuth(request, "admin");
  if (!auth.ok) return auth.response;

  const { uid } = await params;
  if (!uid) {
    return NextResponse.json({ error: "uid requerido" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY no configurado" },
      { status: 503 },
    );
  }

  const adminAuth = getAdminAuth();

  let userRecord;
  try {
    userRecord = await adminAuth.getUser(uid);
  } catch {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 },
    );
  }
  if (!userRecord.email) {
    return NextResponse.json(
      { error: "El usuario no tiene email" },
      { status: 400 },
    );
  }

  // Generar link de reseteo (Firebase Auth)
  let link;
  try {
    link = await adminAuth.generatePasswordResetLink(userRecord.email, {
      url: `${APP_URL}/admin/login`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error generando enlace";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f5f5f7;">
        <div style="background:#0a1f44;padding:24px;border-radius:12px 12px 0 0;color:#fff;">
          <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">Rehobot Real Estate</p>
          <h1 style="margin:8px 0 0;font-family:Playfair Display,Georgia,serif;font-size:24px;">Restablecer contraseña</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;color:#1a1a1a;">
          <p>Un administrador de Rehobot ha solicitado restablecer tu contraseña del panel.</p>
          <p>Pulsa el botón para crear una nueva contraseña. El enlace expira en 1 hora.</p>
          <div style="margin:24px 0;text-align:center;">
            <a href="${link}" style="display:inline-block;padding:12px 24px;background:#0a1f44;color:#fff;text-decoration:none;border-radius:999px;font-weight:500;">Restablecer contraseña</a>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#6b7280;">Si no esperabas este email, ignóralo. Tu contraseña actual seguirá siendo válida.</p>
        </div>
      </div>
    `;
    await resend.emails.send({
      from: FROM,
      to: userRecord.email,
      subject: "Restablece tu contraseña — Rehobot Real Estate",
      html,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error enviando email";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email: userRecord.email });
}
