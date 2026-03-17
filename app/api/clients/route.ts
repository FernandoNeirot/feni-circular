import type { Client } from "@/shared/types/client";
import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION = "feni-circular-clients";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection(COLLECTION).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Client);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/clients]", err);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<Client, "id">;
    const db = getAdminFirestore();
    const docRef = await db.collection(COLLECTION).add(body);
    const client = { id: docRef.id, ...body } as Client;
    return NextResponse.json({ success: true, id: docRef.id, client });
  } catch (err) {
    console.error("[POST /api/clients]", err);
    return NextResponse.json({ success: false, error: "Error al crear cliente" }, { status: 500 });
  }
}
