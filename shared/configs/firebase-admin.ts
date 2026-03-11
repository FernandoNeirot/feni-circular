import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const PEM_BEGIN = "-----BEGIN PRIVATE KEY-----";
const PEM_END = "-----END PRIVATE KEY-----";

/**
 * Normaliza la clave privada para evitar error DECODER routines::unsupported (OpenSSL 3).
 * Reconstruye el PEM con líneas de 64 caracteres.
 */
function normalizePrivateKey(key: string): string {
  let out = key
    .replace(/\\\\n/g, "\\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!out.includes(PEM_BEGIN) || !out.includes(PEM_END)) return out;

  const start = out.indexOf(PEM_BEGIN) + PEM_BEGIN.length;
  const end = out.indexOf(PEM_END);
  const base64 = out.slice(start, end).replace(/\s/g, "");
  if (!base64 || !/^[A-Za-z0-9+/=]+$/.test(base64)) return out;

  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `${PEM_BEGIN}\n${lines.join("\n")}\n${PEM_END}\n`;
}

let adminApp: App;
let adminStorage: Storage;
let adminFirestore: Firestore;

export function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  let parsedServiceAccount: Record<string, string> | null = null;
  if (jsonKey) {
    try {
      let raw: string = typeof jsonKey === "string" ? jsonKey : JSON.stringify(jsonKey);
      if (raw.startsWith("eyJ")) {
        try {
          raw = Buffer.from(raw, "base64").toString("utf-8");
        } catch {
          /* no es base64 */
        }
      }
      const parsed = JSON.parse(raw) as Record<string, string>;
      projectId = projectId || parsed.project_id;
      clientEmail = clientEmail || parsed.client_email;
      privateKey = parsed.private_key ?? privateKey;
      if (parsed.private_key && parsed.project_id) {
        parsedServiceAccount = { ...parsed, private_key: normalizePrivateKey(parsed.private_key) };
      }
    } catch {
      // ignorar, usar env vars individuales
    }
  }

  if (!projectId || !storageBucket) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID y NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET deben estar configurados"
    );
  }

  if (clientEmail && privateKey) {
    privateKey = privateKey.trim();
    if (!privateKey.includes("-----BEGIN")) {
      try {
        const decoded = Buffer.from(privateKey, "base64").toString("utf-8");
        if (decoded.includes("-----BEGIN")) privateKey = decoded;
      } catch {
        /* no es base64 */
      }
    }
    privateKey = normalizePrivateKey(privateKey);
  }

  const credential =
    parsedServiceAccount ??
    (clientEmail && privateKey ? { projectId, clientEmail, privateKey } : null);

  if (credential) {
    try {
      adminApp = initializeApp({
        credential: cert(credential),
        storageBucket,
      });
      return adminApp;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isDecoderError = /DECODER routines::unsupported|1E08010C|ERR_OSSL_UNSUPPORTED/i.test(
        msg
      );
      console.error("[Firebase Admin] Error al inicializar con credenciales:", error);
      if (isDecoderError) {
        throw new Error(
          "Firebase Admin: la clave privada no pudo decodificarse (DECODER unsupported). " +
            "Usa FIREBASE_SERVICE_ACCOUNT_JSON con el JSON completo en base64, o en .env pon FIREBASE_PRIVATE_KEY entre comillas con \\n para saltos de línea. " +
            "En Cloud Run puedes usar Application Default Credentials (sin variables de clave)."
        );
      }
      throw new Error("Error al configurar Firebase Admin SDK con las credenciales proporcionadas");
    }
  }

  try {
    adminApp = initializeApp({
      projectId,
      storageBucket,
    });
    return adminApp;
  } catch {
    throw new Error(
      "Firebase Admin SDK requiere credenciales. " +
        "Configura FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en tus variables de entorno, " +
        "o usa Application Default Credentials (gcloud auth application-default login)"
    );
  }
}

export function getAdminStorage(): Storage {
  if (!adminStorage) {
    const app = initializeAdminApp();
    adminStorage = getStorage(app);
  }
  return adminStorage;
}

export function getAdminFirestore(): Firestore {
  if (!adminFirestore) {
    const app = initializeAdminApp();
    adminFirestore = getFirestore(app);
  }
  return adminFirestore;
}
