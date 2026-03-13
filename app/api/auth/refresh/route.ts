import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setAuthCookies } from "../utils";
import { SESSION_COOKIE_NAME, decodeSessionPayload } from "../utils";

const FIREBASE_TOKEN_URL = "https://securetoken.googleapis.com/v1/token";

interface FirebaseTokenResponse {
  id_token?: string;
  refresh_token?: string;
  expires_in?: string;
  user_id?: string;
  error?: { message: string };
}

/**
 * POST /api/auth/refresh
 * Refresca el idToken usando el refresh_token guardado en __session.
 * Firebase App Hosting solo reenvía la cookie __session al servidor.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionPayload = decodeSessionPayload(
      cookieStore.get(SESSION_COOKIE_NAME)?.value ?? ""
    );
    const refreshToken = sessionPayload?.r ?? null;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No hay sesión para refrescar" },
        { status: 401 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Configuración de Firebase incompleta" },
        { status: 500 }
      );
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const res = await fetch(`${FIREBASE_TOKEN_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = (await res.json()) as FirebaseTokenResponse;

    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: data.error?.message ?? "Error al refrescar token" },
        { status: 401 }
      );
    }

    if (!data.id_token || !data.refresh_token) {
      return NextResponse.json(
        { error: "Respuesta inválida de Firebase" },
        { status: 500 }
      );
    }

    // Decodificar el idToken para obtener user info (el payload está en base64)
    let email: string | null = null;
    let displayName: string | null = null;
    try {
      const payload = JSON.parse(
        Buffer.from(data.id_token.split(".")[1] ?? "", "base64").toString()
      ) as { email?: string; name?: string };
      email = payload.email ?? null;
      displayName = payload.name ?? null;
    } catch {
      // ignorar errores de decodificación
    }

    const response = NextResponse.json({
      idToken: data.id_token,
      expiresIn: data.expires_in,
    });

    setAuthCookies(response, data.id_token, data.refresh_token, {
      uid: data.user_id ?? "",
      email,
      displayName,
    });

    return response;
  } catch (error) {
    console.error("[auth/refresh] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
