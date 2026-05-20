import { auth } from "@/lib/firebase";

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Sesión no válida. Vuelve a iniciar sesión.");
  return user.getIdToken();
}

async function jsonFetch<T>(
  url: string,
  options: { method?: string; body?: unknown; headers?: HeadersInit } = {},
): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(url, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "error" in data
        ? (data as { error: string }).error
        : null) ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export interface CrearUsuarioPayload {
  email: string;
  password: string;
  rol: "admin" | "agente";
  enviarEmail: boolean;
  perfil: {
    nombre: string;
    cargo: string;
    telefono: string;
    whatsapp: string;
    bio: string | null;
    fotoUrl: string | null;
    zonas: string[];
  };
}

export interface CrearUsuarioResult {
  uid: string;
  email: string;
  emailEnviado: boolean;
  emailError: string | null;
}

export async function crearUsuario(
  payload: CrearUsuarioPayload,
): Promise<CrearUsuarioResult> {
  return jsonFetch("/api/admin/usuarios", {
    method: "POST",
    body: payload,
  });
}

export interface ActualizarUsuarioPayload {
  rol?: "admin" | "agente";
  activo?: boolean;
  perfil?: Partial<CrearUsuarioPayload["perfil"]>;
}

export async function actualizarUsuario(
  uid: string,
  payload: ActualizarUsuarioPayload,
): Promise<void> {
  await jsonFetch(`/api/admin/usuarios/${uid}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function eliminarUsuario(uid: string): Promise<void> {
  await jsonFetch(`/api/admin/usuarios/${uid}`, {
    method: "DELETE",
  });
}

export async function resetPasswordUsuario(uid: string): Promise<void> {
  await jsonFetch(`/api/admin/usuarios/${uid}/reset-password`, {
    method: "POST",
  });
}
