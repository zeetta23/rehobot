import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RolUsuario } from "@/lib/types";

const COL = "usuarios";

export interface UsuarioStaff {
  uid: string;
  email: string;
  rol: RolUsuario;
  nombre: string;
  cargo: string;
  telefono: string;
  fotoUrl: string | null;
  activo: boolean;
}

function mapStaff(d: {
  id: string;
  data: () => DocumentData;
}): UsuarioStaff {
  const data = d.data();
  return {
    uid: d.id,
    email: data.email ?? "",
    rol: data.rol ?? "agente",
    nombre: data.perfil?.nombre ?? data.email ?? "",
    cargo: data.perfil?.cargo ?? "",
    telefono: data.perfil?.telefono ?? "",
    fotoUrl: data.perfil?.fotoUrl ?? null,
    activo: data.activo !== false,
  };
}

export async function listarStaff(soloActivos = true): Promise<UsuarioStaff[]> {
  const snap = await getDocs(collection(db, COL));
  const todos = snap.docs.map(mapStaff);
  return soloActivos ? todos.filter((u) => u.activo) : todos;
}

export async function obtenerUsuarioPorId(
  uid: string,
): Promise<UsuarioStaff | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return mapStaff(snap);
}

export async function listarUsuariosAdmin(): Promise<UsuarioStaff[]> {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where("rol", "==", "admin"),
      where("activo", "==", true),
    ),
  );
  return snap.docs.map(mapStaff);
}
