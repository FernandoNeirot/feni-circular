import { Suspense } from "react";
import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { productsQueryOptions } from "@/shared/queries/productos";
import { SearchContent } from "../buscar/SearchContent";
import { SearchPageSkeleton } from "../buscar/SearchPageSkeleton";
import { canonicalUrl, ogImageUrl } from "@/shared/configs/seo";

export const metadata: Metadata = {
  title: "Productos de Ropa Infantil Usada | Feni Circular",
  description:
    "Explorá productos de ropa infantil usada de excelente calidad. Filtrá por talle, color, marca y categoría.",
  keywords: [
    "productos ropa infantil",
    "ropa infantil usada",
    "ropa segunda mano",
    "ropa niños",
    "ropa bebé",
  ],
  alternates: {
    canonical: canonicalUrl("/productos"),
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: canonicalUrl("/productos"),
    title: "Productos de Ropa Infantil Usada | Feni Circular",
    description: "Miles de prendas de ropa infantil de segunda mano con filtros avanzados",
    images: [
      {
        url: ogImageUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Feni Circular - Productos",
      },
    ],
  },
};

export default async function ProductsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(productsQueryOptions);
  const productsUrl = canonicalUrl("/productos");
  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Productos de Ropa Infantil Usada | Feni Circular",
    description:
      "Explorá ropa infantil usada de excelente calidad. Filtrá por talle, color, marca y categoría.",
    url: productsUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Feni Circular",
      url: canonicalUrl("/"),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
      <Suspense fallback={<SearchPageSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SearchContent />
        </HydrationBoundary>
      </Suspense>
    </>
  );
}
