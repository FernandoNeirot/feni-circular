import { MetadataRoute } from "next";
import { getAllProducts } from "@/shared/serverActions/productos";
import type { Product } from "@/shared/types/product";

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://fenicircular.com").replace(/\/$/, "");

function toAbsoluteImageUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/como-funciona-feni`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/preguntas-frecuentes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/vende-con-nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const products = (await getAllProducts()) as (Product & { id?: string | number })[] | null;
  const seen = new Set<string>();
  const productEntries: MetadataRoute.Sitemap = [];
  for (const product of products ?? []) {
    const slug = product.slug ?? String(product.id ?? "").trim();
    if (!slug) continue;
    const url = `${baseUrl}/producto/${slug}`;
    if (seen.has(url)) continue;
    seen.add(url);
    const images = (product.images?.length ? product.images : [product.image])
      .filter((img): img is string => typeof img === "string" && img.length > 0)
      .slice(0, 5)
      .map((img) => toAbsoluteImageUrl(img));
    productEntries.push({
      url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
      images,
    });
  }

  return [...pages, ...productEntries];
}
