import { getStorage } from "firebase-admin/storage";
import { getAdminApp, getAdminDb } from "@/lib/firebase-admin";

export interface UsoFirebase {
  storage: {
    bytes: number;
    archivos: number;
    limiteBytes: number;
    porcentaje: number;
  };
  firestore: {
    docs: {
      inmuebles: number;
      leads: number;
      usuarios: number;
    };
    totalDocs: number;
  };
}

const STORAGE_LIMITE_BYTES = 5 * 1024 * 1024 * 1024; // 5 GiB del free tier

export async function obtenerUsoFirebase(): Promise<UsoFirebase> {
  const app = getAdminApp();
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no está configurado en el entorno.",
    );
  }
  const bucket = getStorage(app).bucket(bucketName);
  const [files] = await bucket.getFiles();
  const bytes = files.reduce((acc, f) => {
    const size = f.metadata.size;
    const parsed =
      typeof size === "string" ? parseInt(size, 10) : Number(size) || 0;
    return acc + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);

  const db = getAdminDb();
  const [inmueblesSnap, leadsSnap, usuariosSnap] = await Promise.all([
    db.collection("inmuebles").count().get(),
    db.collection("leads").count().get(),
    db.collection("usuarios").count().get(),
  ]);

  const docsInmuebles = inmueblesSnap.data().count;
  const docsLeads = leadsSnap.data().count;
  const docsUsuarios = usuariosSnap.data().count;

  return {
    storage: {
      bytes,
      archivos: files.length,
      limiteBytes: STORAGE_LIMITE_BYTES,
      porcentaje: (bytes / STORAGE_LIMITE_BYTES) * 100,
    },
    firestore: {
      docs: {
        inmuebles: docsInmuebles,
        leads: docsLeads,
        usuarios: docsUsuarios,
      },
      totalDocs: docsInmuebles + docsLeads + docsUsuarios,
    },
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
