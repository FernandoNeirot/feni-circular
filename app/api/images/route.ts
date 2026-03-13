import { optimizeAndUploadImage } from "@/shared/lib/uploadImageServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    const folder = request.nextUrl.searchParams.get("folder") || "images";
    const qualityParam = request.nextUrl.searchParams.get("quality");
    const quality = qualityParam ? parseInt(qualityParam, 10) : 80;
    const fileName = request.nextUrl.searchParams.get("fileName") || undefined;

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const result = await optimizeAndUploadImage(imageBuffer, {
      folder,
      fileName: fileName ?? undefined,
      originalFileName: file.name,
      quality,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API /api/images] Error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "Error al procesar la imagen",
      },
      { status: 500 }
    );
  }
}
