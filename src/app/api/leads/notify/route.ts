import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";

const FROM = process.env.EMAIL_FROM || "Rehobot <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://rehobot-rose.vercel.app";

function labelTipo(tipo: string): string {
  return (
    {
      interes_inmueble: "Interés en inmueble",
      valoracion_casa: "Valoración de casa",
      contacto_general: "Contacto general",
    }[tipo] || "Lead"
  );
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

interface LeadDoc {
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  mensaje?: string | null;
  inmuebleTitulo?: string | null;
  inmuebleRef?: string | null;
  tipoInmuebleVender?: string | null;
  municipio?: string | null;
  metrosVender?: number | null;
}

export async function POST(request: Request) {
  let leadId: string;
  try {
    const body = (await request.json()) as { leadId?: string };
    if (!body.leadId) {
      return NextResponse.json(
        { error: "leadId requerido" },
        { status: 400 },
      );
    }
    leadId = body.leadId;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY no configurado" },
      { status: 503 },
    );
  }

  try {
    const db = getAdminDb();

    const leadSnap = await db.collection("leads").doc(leadId).get();
    if (!leadSnap.exists) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }
    const lead = leadSnap.data() as LeadDoc;

    const adminsSnap = await db
      .collection("usuarios")
      .where("rol", "==", "admin")
      .where("activo", "==", true)
      .get();

    const destinatarios = adminsSnap.docs
      .map((d) => d.data().email as string | undefined)
      .filter((email): email is string => Boolean(email));

    if (destinatarios.length === 0) {
      return NextResponse.json({
        ok: false,
        reason: "no_admins",
        message: "No hay administradores activos a los que notificar.",
      });
    }

    const subject = `Nuevo lead · ${lead.nombre ?? "Sin nombre"}`;
    const linkAdmin = `${APP_URL}/admin/leads/${leadId}`;

    const datosExtra: string[] = [];
    if (lead.inmuebleTitulo) {
      datosExtra.push(
        `<li><strong>Inmueble:</strong> ${escapeHtml(lead.inmuebleTitulo)}${
          lead.inmuebleRef ? ` (${escapeHtml(lead.inmuebleRef)})` : ""
        }</li>`,
      );
    }
    if (lead.tipoInmuebleVender) {
      datosExtra.push(
        `<li><strong>Tipo a vender:</strong> ${escapeHtml(lead.tipoInmuebleVender)}</li>`,
      );
    }
    if (lead.municipio) {
      datosExtra.push(
        `<li><strong>Municipio:</strong> ${escapeHtml(lead.municipio)}</li>`,
      );
    }
    if (lead.metrosVender) {
      datosExtra.push(
        `<li><strong>m²:</strong> ${escapeHtml(lead.metrosVender)}</li>`,
      );
    }

    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f5f5f7;">
        <div style="background:#0a1f44;padding:24px;border-radius:12px 12px 0 0;color:#fff;">
          <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a96e;">Rehobot Real Estate</p>
          <h1 style="margin:8px 0 0;font-family:Playfair Display,Georgia,serif;font-size:24px;">Nuevo lead recibido</h1>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;color:#1a1a1a;">
          <p style="margin:0 0 12px;">Acaba de entrar un nuevo lead de tipo <strong>${labelTipo(lead.tipo ?? "")}</strong>:</p>
          <ul style="padding-left:18px;line-height:1.7;">
            <li><strong>Nombre:</strong> ${escapeHtml(lead.nombre)}</li>
            <li><strong>Email:</strong> <a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></li>
            <li><strong>Teléfono:</strong> <a href="tel:${escapeHtml(lead.telefono)}">${escapeHtml(lead.telefono)}</a></li>
            ${datosExtra.join("")}
          </ul>
          ${lead.mensaje ? `<div style="margin-top:16px;padding:12px;background:#f5f5f7;border-left:3px solid #c9a96e;border-radius:4px;"><p style="margin:0;white-space:pre-line;">${escapeHtml(lead.mensaje)}</p></div>` : ""}
          <div style="margin-top:24px;text-align:center;">
            <a href="${linkAdmin}" style="display:inline-block;padding:12px 24px;background:#0a1f44;color:#fff;text-decoration:none;border-radius:999px;font-weight:500;">Abrir lead en el panel</a>
          </div>
          <p style="margin-top:24px;font-size:12px;color:#6b7280;">Este email se envía automáticamente desde Rehobot Real Estate cuando un visitante deja sus datos en la web.</p>
        </div>
      </div>
    `;

    const resend = new Resend(resendKey);
    const result = await resend.emails.send({
      from: FROM,
      to: destinatarios,
      subject,
      html,
    });

    if (result.error) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error.message,
          destinatarios,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      enviados: destinatarios.length,
      destinatarios,
      resendId: result.data?.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[/api/leads/notify]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
