import { Suspense } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { productsQueryOptions } from "@/shared/queries/productos";
import { SearchContent } from "./SearchContent";

export default async function SearchPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(productsQueryOptions);

  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchContent />
      </HydrationBoundary>
    </Suspense>
  );
}
