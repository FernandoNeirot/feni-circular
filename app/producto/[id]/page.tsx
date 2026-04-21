import type { Metadata } from "next";
import { getAllProducts } from "@/shared/serverActions/productos";
import type { Product } from "@/shared/types/product";
import ProductDetailClient from "./page.client";

const SITE_NAME = "FENI - Ropa Infantil Circular";
const DEFAULT_DESCRIPTION =
  "Ropa infantil circular de excelente calidad. Segunda vida, calidad excepcional.";
const DEFAULT_PRODUCT_RATING = {
  ratingValue: 5,
  reviewCount: 1,
};

function ensureUrlWithScheme(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getBaseUrl(): string {
  return ensureUrlWithScheme(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
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
        : `${getBaseUrl()}/opengraph-image`;
  const otherMeta: Record<string, string> = {
    "product:price:currency": "ARS",
    "product:availability": product?.soldOut ? "out of stock" : "in stock",
  };
  if (product?.price != null) {
    otherMeta["product:price:amount"] = String(product.price);
  }

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
    other: otherMeta,
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
  const canonicalUrl = `${getBaseUrl()}/producto/${slug}`;
  const firstImage = initialProduct?.image ?? initialProduct?.images?.[0] ?? "/opengraph-image";
  const imageUrl =
    firstImage.startsWith("http")
      ? firstImage
      : `${getBaseUrl()}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`;
  const productJsonLd = initialProduct
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: initialProduct.name,
        description: initialProduct.description || DEFAULT_DESCRIPTION,
        image: (initialProduct.images?.length ? initialProduct.images : [initialProduct.image])
          .filter((img): img is string => typeof img === "string" && img.length > 0)
          .map((img) =>
            img.startsWith("http")
              ? img
              : `${getBaseUrl()}${img.startsWith("/") ? "" : "/"}${img}`
          ),
        sku: String(initialProduct.id ?? slug),
        category: initialProduct.category,
        brand: initialProduct.brand
          ? {
              "@type": "Brand",
              name: initialProduct.brand,
            }
          : undefined,
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: "ARS",
          price: String(initialProduct.price),
          availability: initialProduct.soldOut
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
          itemCondition: "https://schema.org/UsedCondition",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: DEFAULT_PRODUCT_RATING.ratingValue,
          reviewCount: DEFAULT_PRODUCT_RATING.reviewCount,
        },
        review: [
          {
            "@type": "Review",
            author: {
              "@type": "Organization",
              name: "FENI Circular",
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: DEFAULT_PRODUCT_RATING.ratingValue,
              bestRating: 5,
            },
            reviewBody:
              "Prenda seleccionada y revisada por FENI Circular, en excelente estado y lista para una nueva vida.",
          },
        ],
      }
    : null;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${getBaseUrl()}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Productos",
        item: `${getBaseUrl()}/productos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: initialProduct?.name ?? "Producto",
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient slug={slug} initialProduct={initialProduct} />
    </>
  );
}
