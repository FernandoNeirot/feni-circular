import type { Product } from "@/shared/types/product";

function getApiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export async function createProductWithData(
  data: Product
): Promise<boolean | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { success?: boolean };
    return res.ok && json.success === true;
  } catch (err) {
    console.error("[createProductWithData]", err);
    return false;
  }
}

export async function getAllProducts(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/productos`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.error("[getAllProducts]", err);
    return null;
  }
}
