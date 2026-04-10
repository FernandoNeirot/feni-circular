import type { Product } from "@/shared/types/product";
import { getAdminFirestore } from "@/shared/configs/firebase-admin";

export const PRODUCTS_COLLECTION = "feni-circular-products";

export async function listAllProductsFromFirestore(): Promise<(Product & { id: string })[]> {
  const db = getAdminFirestore();
  const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Product & { id: string }
  );
}
