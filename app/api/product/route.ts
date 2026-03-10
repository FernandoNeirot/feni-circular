import { getAdminFirestore } from '@/shared/configs/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
      const db = getAdminFirestore();
      const body = await request.json();
      const docRef = await db.collection("fenicircularproducts").add(body);
  
      return NextResponse.json(
        { data: { id: docRef.id, ...body }, error: null },
        { status: 201 }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating store";
      return NextResponse.json(
        { data: null, error: errorMessage },
        { status: 500 }
      );
    }
  }

