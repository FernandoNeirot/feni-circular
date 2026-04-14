"use client";

import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/shared/types/product";

interface ProductGridProps {
  title: string;
  products: Product[];
  /** Destino del botón «Ver todo» (ej. `/productos?ageRange=...`). Por defecto `/productos`. */
  seeAllHref?: string;
  /** Solo para grids donde quieras mandar vendidos al final (p. ej. favoritos). El resto mantiene el orden recibido. */
  sortSoldLast?: boolean;
  /** Cantidad de cards a priorizar para carga de imagen en el viewport inicial. */
  priorityImageCount?: number;
}

export function ProductGrid({
  title,
  products,
  seeAllHref = "/productos",
  sortSoldLast = false,
  priorityImageCount = 0,
}: ProductGridProps) {
  if (products.length === 0) return null;
  const productsOrdered = sortSoldLast
    ? [...products].sort((a, b) => Number(!!a.soldOut) - Number(!!b.soldOut))
    : products;
  return (
    <section className="py-12 px-4 md:px-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        <Button variant="ghost" asChild className="gap-2 text-primary rounded-full">
          <Link href={seeAllHref}>
            Ver todo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="w-full max-w-7xl -mx-4 px-4 sm:mx-auto sm:px-0">
        <ul
          role="list"
          className={[
            "flex gap-5",
            "sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            "overflow-x-auto sm:overflow-visible",
            "snap-x snap-mandatory sm:snap-none",
            "scroll-pl-0 scroll-pr-3 sm:scroll-pr-0",
            "pb-1 sm:pb-0",
            "pr-3 sm:pr-0",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          ].join(" ")}
        >
          {productsOrdered.map((product, index) => (
            <li
              key={product.id}
              className="snap-start shrink-0 w-[min(calc(100vw-6rem),17.5rem)] sm:w-auto sm:min-w-0 sm:shrink sm:snap-none"
            >
              <ProductCard product={product} imagePriority={index < priorityImageCount} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
