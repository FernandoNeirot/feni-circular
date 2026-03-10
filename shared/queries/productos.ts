import type { Product } from "@/shared/types/product";

export const productsQueryKey = ["products"] as const;

const STALE_TIME_24H = 24 * 60 * 60 * 1000;

function getProductsApiUrl(): string {
  if (typeof window !== "undefined") return "/api/productos";
  return `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/productos`;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(getProductsApiUrl());
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export const productsQueryOptions = {
  queryKey: productsQueryKey,
  queryFn: fetchProducts,
  staleTime: STALE_TIME_24H,
} as const;
