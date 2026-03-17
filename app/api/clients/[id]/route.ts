import type { Client } from "@/shared/types/client";
import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

const COLLECTION = "feni-circular-clients";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminFirestore();
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    const data = { id: doc.id, ...doc.data() } as Client;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/clients/[id]]", err);
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Omit<Client, "id">;
    const db = getAdminFirestore();
    const ref = db.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    await ref.set(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/clients/[id]]", err);
    return NextResponse.json(
      { success: false, error: "Error al actualizar cliente" },
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
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/clients/[id]]", err);
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}
