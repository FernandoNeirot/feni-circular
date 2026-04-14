"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ShoppingCart, Heart, Share2, Trash2 } from "lucide-react";
import type { Product } from "@/shared/types/product";
import { useCart } from "@/shared/components/cart-provider";
import { useFavorites } from "@/shared/components/favorites-provider";
import { useShare } from "@/shared/hooks/useShare";
import { categorySkipsMeasurements } from "@/shared/lib/category-measurements";
import { toast } from "sonner";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  /** Primeras tarjetas visibles: prioriza la imagen para LCP (listados grandes como /productos). */
  imagePriority?: boolean;
  /** Por defecto false: evita decenas de prefetch de RSC en grillas con muchos productos. */
  linkPrefetch?: boolean;
}

export function ProductCard({
  product,
  imagePriority = false,
  linkPrefetch = false,
}: ProductCardProps) {
  const { cartItems, addToCart, removeItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { share } = useShare(
    {},
    {
      onCopyFallback: () => toast.success("Enlace copiado"),
      onError: () => toast.error("No se pudo compartir"),
    }
  );
  const isSoldOut = product.soldOut;
  const isInCart = product.id != null && cartItems.some((item) => item.id === product.id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    const wasFavorite = isFavorite(product.id);
    toggleFavorite(product.id);
    toast.success(wasFavorite ? "Eliminado de favoritos" : "Agregado a favoritos");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/producto/${product.slug || product.id}`
        : undefined;
    share({
      title: product.name,
      text: `Mirá "${product.name}" (${product.brand}) en FENI Circular`,
      url,
    });
  };

  return (
    <Link href={`/producto/${product.slug || product.id}`} prefetch={linkPrefetch}>
      <Card
        className={`group overflow-hidden border-2 border-b-fuchsia-100 hover:border-primary transition-all duration-300 hover:shadow-lg cursor-pointer ${isSoldOut ? "opacity-70" : ""}`}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden aspect-square bg-muted">
            {isSoldOut && (
              <div
                className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-linear-to-br from-destructive to-destructive/90 px-10 py-2 text-center text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg ring-2 ring-white/30"
                aria-hidden
              >
                <span className="drop-shadow-sm">Vendido</span>
              </div>
            )}
            <Image
              src={product.image}
              alt={`${product.name} de ${product.brand || "FENI Circular"} en talle ${product.size}`}
              width={400}
              height={400}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              priority={imagePriority}
              fetchPriority={imagePriority ? "high" : "low"}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isSoldOut ? "grayscale" : ""}`}
            />
            {isSoldOut ? null : (
              <Badge className="absolute top-3 left-3 bg-info">{product.condition}</Badge>
            )}
            {product.brand && (
              <Badge variant="outline" className="absolute top-3 right-3 bg-background/80 text-xs">
                {product.brand}
              </Badge>
            )}
            <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
              {!isSoldOut && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-full bg-background/90 hover:bg-background shadow-md"
                  aria-label={isFavorite(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                  onClick={handleLike}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite(product.id) ? "fill-destructive text-destructive" : ""}`}
                  />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full bg-background/90 hover:bg-background shadow-md"
                aria-label="Compartir"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
              <p className="text-xs text-muted-foreground">
                {product.brand} · Talle: {product.size}
                {!categorySkipsMeasurements(product.category) && (
                  <>
                    {" "}
                    · {product.measurements.largo}×{product.measurements.ancho} cm
                  </>
                )}
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
                  Vendido
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isInCart) {
                      removeItem(product.id);
                      return;
                    }
                    addToCart(product);
                  }}
                  variant={isInCart ? "outline" : "default"}
                  className="gap-2"
                >
                  {isInCart ? <Trash2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {isInCart ? "Quitar" : "Agregar"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
