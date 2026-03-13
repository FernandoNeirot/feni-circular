import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { initializeAdminApp } from "@/shared/configs/firebase-admin";
import { SESSION_COOKIE_NAME, decodeSessionPayload } from "@/app/api/auth/utils";

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

/**
 * Obtiene el usuario de la sesión actual (solo servidor).
 * Verifica el idToken con Firebase Admin. Si expiró, no intenta refresh aquí.
 * Devuelve null si no hay cookie, token inválido o expirado.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const payload = decodeSessionPayload(
      cookieStore.get(SESSION_COOKIE_NAME)?.value ?? ""
    );
    const sessionToken = payload?.t ?? null;
    if (!sessionToken) return null;

    const auth = getAuth(initializeAdminApp());
    const decodedToken = await auth.verifyIdToken(sessionToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      displayName: decodedToken.name ?? null,
      emailVerified: decodedToken.email_verified ?? false,
    };
  } catch {
    return null;
  }
}
