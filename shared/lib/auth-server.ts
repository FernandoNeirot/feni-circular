import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { initializeAdminApp } from "@/shared/configs/firebase-admin";
import {
  SESSION_COOKIE_NAME,
  decodeSessionPayload,
  encodeSessionPayload,
  refreshFirebaseTokens,
  COOKIE_OPTIONS,
  REFRESH_MAX_AGE,
} from "@/app/api/auth/utils";

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const payload = decodeSessionPayload(cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "");
    const sessionToken = payload?.t ?? null;
    const refreshToken = payload?.r ?? null;
    if (!sessionToken && !refreshToken) return null;

    const auth = getAuth(initializeAdminApp());

    if (sessionToken) {
      try {
        const decodedToken = await auth.verifyIdToken(sessionToken);
        return {
          uid: decodedToken.uid,
          email: decodedToken.email ?? null,
          displayName: decodedToken.name ?? null,
          emailVerified: decodedToken.email_verified ?? false,
        };
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);

        if (
          !msg.includes("id-token-expired") &&
          !msg.includes("id-token-revoked") &&
          !msg.includes("Decoding")
        ) {
          return null;
        }
      }
    }

    if (!refreshToken) return null;

    const refreshed = await refreshFirebaseTokens(refreshToken);
    if (!refreshed) return null;

    const decodedToken = await auth.verifyIdToken(refreshed.idToken);
    const user: SessionUser = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      displayName: decodedToken.name ?? null,
      emailVerified: decodedToken.email_verified ?? false,
    };

    const newPayload = {
      t: refreshed.idToken,
      r: refreshed.refreshToken,
      u: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    };
    cookieStore.set(SESSION_COOKIE_NAME, encodeSessionPayload(newPayload), {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_MAX_AGE,
    });

    return user;
  } catch {
    return null;
  }
}
