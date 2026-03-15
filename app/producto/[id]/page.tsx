import type { Metadata } from "next";
import { getAllProducts } from "@/shared/serverActions/productos";
import type { Product } from "@/shared/types/product";
import ProductDetailClient from "./page.client";

const SITE_NAME = "FENI - Ropa Infantil Circular";
const DEFAULT_DESCRIPTION =
  "Ropa infantil circular de excelente calidad. Segunda vida, calidad excepcional.";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

function getProductBySlug(
  products: (Product & { id: string })[] | null,
  slug: string
): (Product & { id: string }) | null {
  if (!products?.length) return null;
  return (
    products.find((p) => (p.slug ?? String(p.id)) === slug) ?? null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slug } = await params;
  const products = await getAllProducts();
  const list = Array.isArray(products) ? (products as (Product & { id: string })[]) : [];
  const product = getProductBySlug(list, slug);

  const title = product ? `${product.name} | ${SITE_NAME}` : `Producto | ${SITE_NAME}`;
  const description =
    (product?.description?.slice(0, 160) ?? DEFAULT_DESCRIPTION).trim() || DEFAULT_DESCRIPTION;
  const canonicalUrl = `${getBaseUrl()}/producto/${slug}`;

  const firstImage = product?.image ?? product?.images?.[0];
  const imageUrl =
    typeof firstImage === "string" && firstImage.startsWith("http")
      ? firstImage
      : firstImage
        ? `${getBaseUrl()}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`
        : `${getBaseUrl()}/images/feni-logo.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product?.name ?? "FENI - Ropa Infantil Circular",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const products = await getAllProducts();
  const list = Array.isArray(products) ? (products as (Product & { id: string })[]) : [];
  const initialProduct = getProductBySlug(list, slug);

  return <ProductDetailClient slug={slug} initialProduct={initialProduct} />;
}
