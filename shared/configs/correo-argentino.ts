/**
 * Configuración y cliente API para Correo Argentino
 */

const CORREO_ARGENTINO_BASE_URL =
  process.env.CORREO_ARGENTINO_BASE_URL || "https://tintegraciones.correoargentino.com.ar/apis";

const CORREO_ARGENTINO_API_KEY = process.env.CORREO_ARGENTINO_API_KEY;
const CORREO_ARGENTINO_API_SECRET = process.env.CORREO_ARGENTINO_API_SECRET;
const CORREO_ARGENTINO_USER_ID = process.env.CORREO_ARGENTINO_USER_ID;

export interface CorreoArgentinoConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  userId: string;
}

export function getCorreoArgentinoConfig(): CorreoArgentinoConfig {
  if (!CORREO_ARGENTINO_API_KEY || !CORREO_ARGENTINO_API_SECRET || !CORREO_ARGENTINO_USER_ID) {
    throw new Error("Credenciales de Correo Argentino no configuradas");
  }

  return {
    baseUrl: CORREO_ARGENTINO_BASE_URL,
    apiKey: CORREO_ARGENTINO_API_KEY,
    apiSecret: CORREO_ARGENTINO_API_SECRET,
    userId: CORREO_ARGENTINO_USER_ID,
  };
}

/**
 * Cliente HTTP para la API del Correo Argentino
 */
export async function callCorreoArgentinoAPI<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" = "POST",
  body?: Record<string, unknown>
): Promise<T> {
  try {
    const config = getCorreoArgentinoConfig();
    const url = `${config.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-API-Key": config.apiKey,
      "X-API-Secret": config.apiSecret,
      "X-User-Id": config.userId,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body);
    }

    console.log(`[CorreoArgentino] ${method} ${endpoint}`);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[CorreoArgentino] Error ${response.status}: ${errorData}`);
      throw new Error(`Correo Argentino API Error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    console.error("[CorreoArgentino] Error:", error);
    throw error;
  }
}
