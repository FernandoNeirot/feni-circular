import type { Product } from "@/shared/types/product";
import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION = "feni-circular-products";

export async function GET() {
  try {
    console.log("----> GET /api/productos");
    const db = getAdminFirestore();
    const snapshot = await db.collection(COLLECTION).get();
    const data = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Product & { id: string }
    );
    return NextResponse.json(data);
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
    const docRef = await db.collection(COLLECTION).add(body);
    const product = { id: docRef.id, ...body } as Product & { id: string };
    return NextResponse.json({ success: true, id: docRef.id, product });
  } catch (err) {
    console.error("[POST /api/productos]", err);
    return NextResponse.json({ success: false, error: "Error al crear producto" }, { status: 500 });
  }
}
