import { getAdminStorage } from "@/shared/configs/firebase-admin";
import { getDownloadURL } from "firebase-admin/storage";
import sharp from "sharp";

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

export async function optimizeAndUploadImage(
  imageBuffer: Buffer,
  options: OptimizeAndUploadOptions
): Promise<OptimizeAndUploadResult> {
  const { folder, fileName, originalFileName, quality } = options;

  const baseName = fileName ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const outputExt = "webp";
  const path = `${folder.replace(/\/$/, "")}/${baseName}.${outputExt}`;

  const optimizedBuffer = await sharp(imageBuffer)
    .rotate()
    .webp({ quality: quality ?? 80 })
    .toBuffer();

  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(path);
  await fileRef.save(optimizedBuffer, {
    metadata: {
      contentType: "image/webp",
    },
  });

  const url = await getDownloadURL(fileRef);
  return { url, path };
}
