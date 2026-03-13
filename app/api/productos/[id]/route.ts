import type { Product } from "@/shared/types/product";
import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { deleteFileFromStorageUrl } from "@/shared/lib/deleteStorageFileFromUrl";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION = "feni-circular-products";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    const data = { id: doc.id, ...doc.data() } as Product & { id: string };
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/productos/[id]]", err);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Product;
    const db = getAdminFirestore();
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    await ref.set(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/productos/[id]]", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    const data = doc.data() as Product;
    const urls = Array.isArray(data?.images) ? data.images : data?.image ? [data.image] : [];
    for (const url of urls) {
      if (typeof url === "string" && url.startsWith("http")) {
        try {
          await deleteFileFromStorageUrl(url);
        } catch (err) {
          console.error("[DELETE /api/productos] Error borrando imagen:", url, err);
        }
      }
    }
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/productos/[id]]", err);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
