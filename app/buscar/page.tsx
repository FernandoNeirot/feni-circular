import { Suspense } from "react";
import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { productsQueryOptions } from "@/shared/queries/productos";
import { SearchContent } from "./SearchContent";
import { SearchPageSkeleton } from "./SearchPageSkeleton";
import { canonicalUrl, ogImageUrl } from "@/shared/configs/seo";

export const metadata: Metadata = {
  title: "Buscar Ropa Infantil Usada | Feni Circular",
  description:
    "Busca ropa infantil usada de excelente calidad. Filtro por talle, color, marca y categoría. Miles de prendas disponibles.",
  keywords: [
    "buscar ropa infantil",
    "ropa infantil usada",
    "ropa segunda mano",
    "ropa niños",
    "ropa bebé",
  ],
  alternates: {
    canonical: canonicalUrl("/buscar"),
  },
  openGraph: {
    type: "website",
    url: canonicalUrl("/buscar"),
    title: "Buscar Ropa Infantil Usada | Feni Circular",
    description: "Miles de prendas de ropa infantil de segunda mano con filtros avanzados",
    images: [
      {
        url: ogImageUrl("/images/feni-logo.png"),
        width: 1200,
        height: 630,
        alt: "Feni Circular - Buscar Ropa",
      },
    ],
  },
};

export default async function SearchPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(productsQueryOptions);

  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchContent />
      </HydrationBoundary>
    </Suspense>
  );
}
