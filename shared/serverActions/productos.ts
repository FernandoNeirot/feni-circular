import type { Product } from "@/shared/types/product";
import { getAdminFirestore } from "../configs/firebase-admin";

export async function createProductWithData(
    data: Product
  ): Promise<boolean | null> {
    try {
      const db = getAdminFirestore();      
      await db.collection("feni-circular-products").add(data);
      
      return true as boolean;
    } catch (err) {
      console.error("[createProductWithData]", err);
      return false as boolean;
    }
  }
  
  export async function getAllProducts(
    ): Promise<Product[] | null> {
    try {
      const db = getAdminFirestore();      
      const products = await db.collection("feni-circular-products").get();
      return products.docs.map((doc) => doc.data() as Product);
    } catch (err) {
      console.error("[getAllProducts]", err);
      return null;
    }
  }
  