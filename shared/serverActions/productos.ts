"use server";

import { revalidatePath } from "next/cache";
import { mergeLinksForProduct } from "@/shared/lib/productoPublicLinks";
import { listAllProductsFromFirestore } from "@/shared/lib/products-firestore";
import type { Product } from "@/shared/types/product";

function getApiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export type CreateProductResult =
  | { success: true; product: Product & { id: string } }
  | { success: false; error: string };

export async function createProductWithData(data: Product): Promise<CreateProductResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as {
      success?: boolean;
      product?: Product & { id: string };
      error?: string;
    };
    if (!res.ok) {
      return { success: false, error: json.error ?? "Error al crear producto" };
    }
    if (json.success !== true || !json.product) {
      return { success: false, error: json.error ?? "Error al crear producto" };
    }
    return { success: true, product: json.product };
  } catch (err) {
    console.error("[createProductWithData]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al crear producto",
    };
  }
}

export type UpdateProductResult =
  | { success: true; createdAt: string; updatedAt: string }
  | { success: false; error: string };

export async function updateProduct(
  productId: string,
  data: Product
): Promise<UpdateProductResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as {
      success?: boolean;
      error?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    if (!res.ok) {
      return { success: false, error: json.error ?? "Error al actualizar" };
    }
    if (json.success !== true || typeof json.createdAt !== "string" || typeof json.updatedAt !== "string") {
      return { success: false, error: json.error ?? "Error al actualizar" };
    }
    return { success: true, createdAt: json.createdAt, updatedAt: json.updatedAt };
  } catch (err) {
    console.error("[updateProduct]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al actualizar el producto",
    };
  }
}

/** Catálogo público (sin productos con venta hace ≥10 días). */
export async function getAllProducts(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos`, {
      next: { revalidate: 60 * 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.error("[getAllProducts]", err);
    return null;
  }
}

/** Listado completo para admin (Firestore). */
export async function getAllProductsAdmin(): Promise<(Product & { id: string })[] | null> {
  try {
    return await listAllProductsFromFirestore();
  } catch (err) {
    console.error("[getAllProductsAdmin]", err);
    return null;
  }
}

/** URLs/slugs desde `feni-circular-url-productos` vía `/api/productos/links`. Cache 24h. */
export async function getProductoLinks(): Promise<string[] | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos/links`, {
      next: { revalidate: 24 * 60 * 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    return Array.isArray(data) && data.every((x) => typeof x === "string") ? (data as string[]) : null;
  } catch (err) {
    console.error("[getProductoLinks]", err);
    return null;
  }
}

export type UpdateProductoLinksResult = { success: true } | { success: false; error: string };

/** Reemplaza por completo el listado en Firestore (`PUT /api/productos/links`). */
export async function updateProductoLinks(links: string[]): Promise<UpdateProductoLinksResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos/links`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links }),
    });
    const json = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok || json.success !== true) {
      return { success: false, error: json.error ?? "Error al actualizar enlaces" };
    }
    revalidatePath("/sitemap.xml");
    return { success: true };
  } catch (err) {
    console.error("[updateProductoLinks]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al actualizar enlaces",
    };
  }
}

export type SyncProductoPublicLinksResult = { success: true } | { success: false; error: string };

/**
 * Tras guardar un producto: agrega el slug al índice si no está vendido;
 * si está vendido (`soldOut`) o cambió el slug, elimina entradas que coincidan (slug previo / actual).
 */
export async function syncProductoPublicLinks(opts: {
  slug: string;
  soldOut: boolean;
  previousSlug?: string | null;
}): Promise<SyncProductoPublicLinksResult> {
  try {
    const base = getApiBase();
    const getRes = await fetch(`${base}/api/productos/links`, { cache: "no-store" });
    if (!getRes.ok) {
      return { success: false, error: "No se pudo leer el índice de URLs" };
    }
    const current = (await getRes.json()) as unknown;
    if (!Array.isArray(current) || !current.every((x) => typeof x === "string")) {
      return { success: false, error: "Índice de URLs inválido" };
    }
    const next = mergeLinksForProduct(current, {
      slug: opts.slug,
      soldOut: opts.soldOut,
      previousSlug: opts.previousSlug ?? null,
    });
    return updateProductoLinks(next);
  } catch (err) {
    console.error("[syncProductoPublicLinks]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al sincronizar URLs públicas",
    };
  }
}

export type DeleteProductResult = { success: true } | { success: false; error: string };

export async function deleteProduct(productId: string): Promise<DeleteProductResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos/${productId}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok) {
      return { success: false, error: data.error ?? "Error al eliminar" };
    }
    return { success: true };
  } catch (err) {
    console.error("[deleteProduct]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al eliminar el producto",
    };
  }
}


