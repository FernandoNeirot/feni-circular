import { Suspense } from "react";
import { getAllProducts } from "@/shared/serverActions/productos";
import { SearchContent } from "./SearchContent";

export default async function SearchPage() {
  const products = await getAllProducts();
  const initialProducts = products ?? [];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Cargando...
        </div>
      }
    >
      <SearchContent initialProducts={initialProducts} />
    </Suspense>
  );
}
