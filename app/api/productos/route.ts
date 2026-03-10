import type { Product } from "@/shared/types/product";
import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION = "feni-circular-products";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection(COLLECTION).get();
    const data = snapshot.docs.map((doc) => doc.data() as Product);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/productos]", err);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Product;
    const db = getAdminFirestore();
    await db.collection(COLLECTION).add(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/productos]", err);
    return NextResponse.json(
      { success: false, error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
