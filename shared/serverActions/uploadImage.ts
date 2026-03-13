"use server";

import { optimizeAndUploadImage } from "@/shared/lib/uploadImageServer";

export type UploadProductImageResult =
  | { success: true; data: { url: string } }
  | { success: false; data: null; error: string };

/** Sube y optimiza una imagen de producto. Ejecutar solo en servidor (Server Action). */
export async function uploadProductImage(
  productId: string,
  formData: FormData,
  options?: { quality?: number }
): Promise<UploadProductImageResult> {
  try {
    const file = formData.get("image") as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, data: null, error: "No se proporcionó ninguna imagen" };
    }
    if (!file.type.startsWith("image/")) {
      return { success: false, data: null, error: "El archivo debe ser una imagen" };
    }
    const quality = Math.min(100, Math.max(0, options?.quality ?? 80));
    const folder = `products/${productId}`;
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const result = await optimizeAndUploadImage(imageBuffer, {
      folder,
      originalFileName: file.name,
      quality,
    });
    return { success: true, data: { url: result.url } };
  } catch (error) {
    console.error("[uploadProductImage]", error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Error al procesar la imagen",
    };
  }
}
