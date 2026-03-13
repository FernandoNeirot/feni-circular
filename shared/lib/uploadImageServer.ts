import { getAdminStorage } from "@/shared/configs/firebase-admin";
import { getDownloadURL } from "firebase-admin/storage";

export type OptimizeAndUploadOptions = {
  folder: string;
  fileName?: string;
  originalFileName?: string;
  quality?: number;
};

export type OptimizeAndUploadResult = {
  url: string;
  path: string;
};

/**
 * Sube (y opcionalmente optimiza) una imagen a Firebase Storage.
 * Ejecutar solo en servidor.
 */
export async function optimizeAndUploadImage(
  imageBuffer: Buffer,
  options: OptimizeAndUploadOptions
): Promise<OptimizeAndUploadResult> {
  const { folder, fileName, originalFileName } = options;
  const ext = originalFileName?.split(".").pop() || "jpg";
  const safeName =
    fileName ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `${folder.replace(/\/$/, "")}/${safeName}`;

  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(path);
  await fileRef.save(imageBuffer, {
    metadata: {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
    },
  });

  const url = await getDownloadURL(fileRef);
  return { url, path };
}
