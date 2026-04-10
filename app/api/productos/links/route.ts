import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { NextResponse } from "next/server";

const COLLECTION = "feni-circular-url-productos";

function stringArrayFromDoc(data: Record<string, unknown>): string[] {
  const preferred = data.links ?? data.urls;
  if (Array.isArray(preferred) && preferred.every((x) => typeof x === "string")) {
    return preferred as string[];
  }
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.every((x) => typeof x === "string")) {
      return value as string[];
    }
  }
  return [];
}

/**
 * Se espera un documento (o uno “principal”) en la colección con un campo tipo array de strings.
 * Si hay varios documentos, se usa el de id lexicográfico menor para ser determinístico.
 */
export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection(COLLECTION).get();
    if (snapshot.empty) {
      return NextResponse.json([]);
    }
    const [doc] = [...snapshot.docs].sort((a, b) => a.id.localeCompare(b.id));
    const data = doc!.data() as Record<string, unknown>;
    return NextResponse.json(stringArrayFromDoc(data));
  } catch (err) {
    console.error("[GET /api/productos/links]", err);
    return NextResponse.json({ error: "Error al obtener enlaces de productos" }, { status: 500 });
  }
}
