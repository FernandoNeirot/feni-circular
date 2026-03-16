import { getAdminStorage } from "@/shared/configs/firebase-admin";
import { getDownloadURL } from "firebase-admin/storage";
import sharp from "sharp";

const MAX_SIZE_BYTES = 50 * 1024; // 50 KB
const MAX_LONGEST_SIDE_PX = 1200;
const MIN_QUALITY = 25;

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
  const { folder, fileName } = options;

  const baseName = fileName ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const outputExt = "webp";
  const path = `${folder.replace(/\/$/, "")}/${baseName}.${outputExt}`;

  let quality = Math.min(100, Math.max(0, options.quality ?? 60));
  let optimizedBuffer: Buffer;

  const resizedBuffer = await (async () => {
    const pipeline = sharp(imageBuffer).rotate();
    const meta = await pipeline.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const needsResize = w > MAX_LONGEST_SIDE_PX || h > MAX_LONGEST_SIDE_PX;
    if (needsResize) {
      return pipeline
        .resize(MAX_LONGEST_SIDE_PX, MAX_LONGEST_SIDE_PX, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
    }
    return pipeline.toBuffer();
  })();

  for (;;) {
    optimizedBuffer = await sharp(resizedBuffer).webp({ quality }).toBuffer();
    if (optimizedBuffer.length <= MAX_SIZE_BYTES || quality <= MIN_QUALITY) break;
    quality = Math.max(MIN_QUALITY, quality - 10);
  }

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
