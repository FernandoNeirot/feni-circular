"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/shared/types/product";
import { useCart } from "@/shared/components/cart-provider";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isSoldOut = product.soldOut;

  return (
    <Link href={`/producto/${product.id}`}>
      <Card
        className={`group overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg cursor-pointer ${isSoldOut ? "opacity-70" : ""}`}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden aspect-square bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isSoldOut ? "grayscale" : ""}`}
            />
            {isSoldOut ? (
              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                Agotado
              </Badge>
            ) : (
              <Badge className="absolute top-3 left-3 bg-info">{product.condition}</Badge>
            )}
            {product.brand && (
              <Badge
                variant="outline"
                className="absolute top-3 right-3 bg-background/80 text-xs"
              >
                {product.brand}
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
              <p className="text-xs text-muted-foreground">
                {product.brand} · Talle: {product.size} · {product.measurements.largo}×
                {product.measurements.ancho} cm
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {isSoldOut ? (
                <Badge variant="outline" className="text-muted-foreground">
                  Agotado
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Agregar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
