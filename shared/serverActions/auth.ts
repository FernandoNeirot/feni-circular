"use server";

function getApiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export type LoginResult = { success: true } | { success: false; error: string };

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, action: "login" }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      return { success: false, error: data.error ?? "Error al iniciar sesión" };
    }

    return { success: true };
  } catch (err) {
    console.error("[loginWithEmailPassword]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al iniciar sesión",
    };
  }
}

export type LogoutResult = { success: true } | { success: false; error: string };

export async function logout(): Promise<LogoutResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/auth`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      return { success: false, error: data.error ?? "Error al cerrar sesión" };
    }
    return { success: true };
  } catch (err) {
    console.error("[logout]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al cerrar sesión",
    };
  }
}
