import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies, clearAuthCookies } from "./utils";

const FIREBASE_AUTH_BASE = "https://identitytoolkit.googleapis.com/v1/accounts";

interface FirebaseAuthResponse {
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  localId?: string;
  email?: string;
  displayName?: string;
  error?: {
    message: string;
    code?: number;
  };
}

async function callFirebaseAuth(
  endpoint: string,
  body: Record<string, unknown>
): Promise<FirebaseAuthResponse> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY no está configurada");
  }

  const res = await fetch(`${FIREBASE_AUTH_BASE}${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as FirebaseAuthResponse;

  if (!res.ok) {
    const message = data.error?.message ?? `Error en Firebase Auth: ${res.status}`;
    return { error: { message, code: res.status } };
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action = "login" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "El campo email es requerido" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "El campo password es requerido" },
        { status: 400 }
      );
    }

    if (action === "register") {
      const displayName = body.displayName ?? null;
      const result = await callFirebaseAuth(":signUp", {
        email: email.trim(),
        password,
        displayName: displayName || undefined,
        returnSecureToken: true,
      });

      if (result.error) {
        const msg = result.error.message;
        const status = msg.includes("EMAIL_EXISTS")
          ? 409
          : msg.includes("WEAK_PASSWORD")
            ? 400
            : 400;
        return NextResponse.json({ error: mapFirebaseError(msg) }, { status });
      }

      const response = NextResponse.json({
        idToken: result.idToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        localId: result.localId,
        email: result.email,
      });

      if (result.idToken && result.refreshToken) {
        setAuthCookies(response, result.idToken, result.refreshToken, {
          uid: result.localId ?? "",
          email: result.email,
          displayName: result.displayName,
        });
      }

      return response;
    }

    // action === "login"
    const result = await callFirebaseAuth(":signInWithPassword", {
      email: email.trim(),
      password,
      returnSecureToken: true,
    });

    if (result.error) {
      const msg = result.error.message;
      const status =
        msg.includes("INVALID_LOGIN_CREDENTIALS") ||
        msg.includes("INVALID_PASSWORD") ||
        msg.includes("EMAIL_NOT_FOUND")
          ? 401
          : 400;
      return NextResponse.json({ error: mapFirebaseError(msg) }, { status });
    }

    const response = NextResponse.json({
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      localId: result.localId,
      email: result.email,
    });

    if (result.idToken && result.refreshToken) {
      setAuthCookies(response, result.idToken, result.refreshToken, {
        uid: result.localId ?? "",
        email: result.email,
        displayName: result.displayName,
      });
    }

    return response;
  } catch (error) {
    console.error("[auth] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * DELETE /api/auth
 * Cierra la sesión eliminando todas las cookies de autenticación.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}

function mapFirebaseError(message: string): string {
  if (message.includes("INVALID_LOGIN_CREDENTIALS"))
    return "Email o contraseña incorrectos";
  if (message.includes("INVALID_PASSWORD")) return "Contraseña incorrecta";
  if (message.includes("EMAIL_NOT_FOUND")) return "No existe una cuenta con ese email";
  if (message.includes("EMAIL_EXISTS")) return "Ya existe una cuenta con ese email";
  if (message.includes("WEAK_PASSWORD"))
    return "La contraseña debe tener al menos 6 caracteres";
  if (message.includes("INVALID_EMAIL")) return "Email inválido";
  if (message.includes("USER_DISABLED")) return "Esta cuenta ha sido deshabilitada";
  return message;
}
