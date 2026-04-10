import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION = "feni-circular-url-productos";
const DEFAULT_DOC_ID = "main";

function resolveArrayFieldKey(data: Record<string, unknown>): string {
  if (Array.isArray(data.links) && data.links.every((x) => typeof x === "string")) {
    return "links";
  }
  if (Array.isArray(data.urls) && data.urls.every((x) => typeof x === "string")) {
    return "urls";
  }
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      return k;
    }
  }
  return "links";
}

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

/** Cuerpo: `{ links: string[] }` — reemplaza el array en el mismo documento/campo que usa el GET. */
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as { links?: unknown };
    const links = body.links;
    if (!Array.isArray(links) || !links.every((x) => typeof x === "string")) {
      return NextResponse.json(
        { success: false, error: "Se espera un body { links: string[] }" },
        { status: 400 }
      );
    }
    const db = getAdminFirestore();
    const snapshot = await db.collection(COLLECTION).get();
    if (snapshot.empty) {
      await db.collection(COLLECTION).doc(DEFAULT_DOC_ID).set({ links });
      return NextResponse.json({ success: true });
    }
    const [doc] = [...snapshot.docs].sort((a, b) => a.id.localeCompare(b.id));
    const data = (doc!.data() ?? {}) as Record<string, unknown>;
    const key = resolveArrayFieldKey(data);
    await doc!.ref.set({ ...data, [key]: links }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/productos/links]", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar enlaces de productos" },
      { status: 500 }
    );
  }
}
