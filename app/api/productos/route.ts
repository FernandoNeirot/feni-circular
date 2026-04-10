import type { Product } from "@/shared/types/product";
import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { filterProductsForPublicCatalog } from "@/shared/lib/product-public-visibility";
import { listAllProductsFromFirestore, PRODUCTS_COLLECTION } from "@/shared/lib/products-firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("----> GET /api/productos");
    const data = await listAllProductsFromFirestore();
    return NextResponse.json(filterProductsForPublicCatalog(data));
  } catch (err) {
    console.error("[GET /api/productos]", err);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/productos");
    const body = (await request.json()) as Product;
    const db = getAdminFirestore();
    const now = new Date().toISOString();
    const payload = { ...body, createdAt: now, updatedAt: now };
    const docRef = await db.collection(PRODUCTS_COLLECTION).add(payload);
    const product = { id: docRef.id, ...payload } as Product & { id: string };
    return NextResponse.json({ success: true, id: docRef.id, product });
  } catch (err) {
    console.error("[POST /api/productos]", err);
    return NextResponse.json({ success: false, error: "Error al crear producto" }, { status: 500 });
  }
}
