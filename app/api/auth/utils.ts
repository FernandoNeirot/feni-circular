import { NextResponse } from "next/server";

/**
 * Firebase App Hosting solo reenvía la cookie __session al servidor (SSR/CDN).
 * Todas las cookies de sesión deben consolidarse en esta única cookie.
 */
export const SESSION_COOKIE_NAME = "__session";

/** Dominio opcional para la cookie (ej. ".tudominio.com") para que funcione en www y sin www. No definir en local. */
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN ?? undefined;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
};

export const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 días
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export interface SessionPayload {
  t: string; // session_token (idToken)
  r: string; // refresh_token
  u: { uid: string; email: string | null; displayName: string | null };
}

export function encodeSessionPayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function decodeSessionPayload(value: string): SessionPayload | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as SessionPayload;
    if (parsed.t && parsed.r && parsed.u) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function setAuthCookies(
  response: NextResponse,
  idToken: string,
  refreshToken: string,
  user: { uid: string; email?: string | null; displayName?: string | null }
) {
  const payload: SessionPayload = {
    t: idToken,
    r: refreshToken,
    u: {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
    },
  };
  response.cookies.set(SESSION_COOKIE_NAME, encodeSessionPayload(payload), {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}
