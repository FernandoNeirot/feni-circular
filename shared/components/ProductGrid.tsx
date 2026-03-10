"use client";

import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/shared/types/product";

interface ProductGridProps {
  title: string;
  products: Product[];
}

export function ProductGrid({ title, products }: ProductGridProps) {
  return (
    <section className="py-12 px-4 md:px-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        <Button
          variant="ghost"
          asChild
          className="gap-2 text-primary hover:text-primary/80 rounded-full"
        >
          <Link href="/buscar">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
