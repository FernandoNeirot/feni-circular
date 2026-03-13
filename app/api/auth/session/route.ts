import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { initializeAdminApp } from "@/shared/configs/firebase-admin";
import {
  setAuthCookies,
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
} from "../utils";

const FIREBASE_TOKEN_URL = "https://securetoken.googleapis.com/v1/token";

interface FirebaseTokenResponse {
  id_token?: string;
  refresh_token?: string;
  expires_in?: string;
  user_id?: string;
  error?: { message: string };
}

/**
 * GET /api/auth/session
 * Devuelve el usuario actual si está autenticado.
 * Si el session_token expiró pero hay refresh_token, intenta refrescar y devuelve el usuario.
 * Usa __session (única cookie que Firebase App Hosting reenvía al servidor).
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionPayload = decodeSessionPayload(
      cookieStore.get(SESSION_COOKIE_NAME)?.value ?? ""
    );
    const sessionToken = sessionPayload?.t ?? null;
    const refreshToken = sessionPayload?.r ?? null;

    const app = initializeAdminApp();
    const auth = getAuth(app);

    // 1. Si hay session_token válido, verificar y devolver usuario (desde token para evitar auth.getUser en Cloud Run)
    if (sessionToken) {
      try {
        const decodedToken = await auth.verifyIdToken(sessionToken);
        return NextResponse.json({
          user: {
            uid: decodedToken.uid,
            email: decodedToken.email ?? null,
            displayName: decodedToken.name ?? null,
            emailVerified: decodedToken.email_verified ?? false,
          },
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        // Si expiró o es inválido, intentar refresh
        if (
          !msg.includes("id-token-expired") &&
          !msg.includes("id-token-revoked")
        ) {
          return NextResponse.json({ user: null }, { status: 200 });
        }
      }
    }

    // 2. Intentar refrescar con refresh_token
    if (!refreshToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ user: null }, { status: 200 });
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

    if (!res.ok || !data.id_token || !data.refresh_token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decodedToken = await auth.verifyIdToken(data.id_token);

    const response = NextResponse.json({
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
        displayName: decodedToken.name ?? null,
        emailVerified: decodedToken.email_verified ?? false,
      },
    });

    setAuthCookies(response, data.id_token, data.refresh_token, {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      displayName: decodedToken.name ?? null,
    });

    return response;
  } catch (error) {
    console.error("[auth/session] Error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
