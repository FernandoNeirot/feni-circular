import { getAdminStorage } from "@/shared/configs/firebase-admin";

const FIREBASE_STORAGE_URL_REGEX =
  /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/(.+?)(\?|$)/;

/**
 * Extrae la ruta del archivo en el bucket a partir de la URL de descarga de Firebase Storage.
 * Devuelve null si la URL no es de Firebase Storage o no corresponde al bucket actual.
 */
function getStoragePathFromDownloadUrl(url: string, bucketName: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const match = trimmed.match(FIREBASE_STORAGE_URL_REGEX);
  if (!match) return null;
  const [, urlBucket, encodedPath] = match;
  if (urlBucket !== bucketName) return null;
  try {
    const path = decodeURIComponent(encodedPath);
    return path || null;
  } catch {
    return null;
  }
}

/**
 * Elimina un archivo de Firebase Storage a partir de su URL de descarga.
 * Solo actúa si la URL es del bucket por defecto de la app.
 * No lanza si el archivo no existe.
 */
export async function deleteFileFromStorageUrl(url: string): Promise<void> {
  const bucket = getAdminStorage().bucket();
  const bucketName = bucket.name;
  const path = getStoragePathFromDownloadUrl(url, bucketName);
  if (!path) return;
  try {
    await bucket.file(path).delete({ ignoreNotFound: true });
  } catch (err) {
    console.error("[deleteFileFromStorageUrl]", url, err);
    throw err;
  }
}
