import { MetadataRoute } from "next";
import { getProductoLinks } from "@/shared/serverActions/productos";

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://fenicircular.com").replace(/\/$/, "");

/** Normaliza cada string de Firestore a URL canónica `${base}/producto/...`. */
function productPageUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return baseUrl;
  if (s.startsWith("http://") || s.startsWith("https://")) {
    try {
      const u = new URL(s);
      const path = u.pathname.replace(/^\/+|\/+$/g, "");
      if (path.startsWith("producto/")) {
        return `${baseUrl}/${path}`;
      }
      return path ? `${baseUrl}/producto/${path}` : baseUrl;
    } catch {
      return `${baseUrl}/producto/${encodeURIComponent(s)}`;
    }
  }
  const path = s.replace(/^\/+/, "");
  if (path.startsWith("producto/")) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}/producto/${path}`;
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
      url: `${baseUrl}/buscar`,
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
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "never",
      priority: 0.3,
    },
  ];

  const links = await getProductoLinks();
  const seen = new Set<string>();
  const productEntries: MetadataRoute.Sitemap = [];
  for (const raw of links ?? []) {
    const url = productPageUrl(raw);
    if (seen.has(url)) continue;
    seen.add(url);
    productEntries.push({
      url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  return [...pages, ...productEntries];
}
