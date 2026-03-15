"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Tag,
  Sparkles,
  Shirt,
  Palette,
  Baby,
  ArrowLeft,
  Heart,
  Share2,
  Info,
} from "lucide-react";
import type { Product } from "@/shared/types/product";
import { useCart } from "@/shared/components/cart-provider";
import { toast } from "sonner";
import Image from "next/image";
import { productsQueryOptions } from "@/shared/queries/productos";

interface ProductDetailClientProps {
  slug: string;
  initialProduct: (Product & { id: string }) | null;
}

export default function ProductDetailClient({
  slug,
  initialProduct,
}: ProductDetailClientProps) {
  const { addToCart, cartItems } = useCart();
  const { data: products = [], isPending } = useQuery(productsQueryOptions);
  const productFromCache = slug
    ? (products as (Product & { id: string })[]).find(
        (p) => (p.slug ?? String(p.id)) === slug
      ) ?? null
    : null;
  const product = productFromCache ?? initialProduct;
  const isInCart = product ? cartItems.some((item) => item.id === product.id) : false;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const loading = Boolean(slug && isPending && !initialProduct);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground">Producto no encontrado</p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  const images = product.images?.length ? product.images : [product.image];
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);

  const conditionColor =
    product.condition === "Como nuevo"
      ? "bg-info"
      : product.condition === "Excelente"
        ? "bg-primary"
        : "bg-secondary";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background pb-20 lg:pb-0">
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              {product.soldOut && (
                <div
                  className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gradient-to-br from-destructive to-destructive/90 px-10 py-2 text-center text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg ring-2 ring-white/30"
                  aria-hidden
                >
                  <span className="drop-shadow-sm">Vendido</span>
                </div>
              )}
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className={`object-cover ${product.soldOut ? "grayscale" : ""}`}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-md"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-md"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              {!product.soldOut && discount > 0 && (
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-sm px-3 py-1">
                  -{discount}%
                </Badge>
              )}
              {!product.soldOut && (
                <Badge className={`absolute top-3 left-3 ${conditionColor} text-sm px-3 py-1`}>
                  {product.condition}
                </Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary shadow-md"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                <Tag className="h-3.5 w-3.5" /> {product.size}
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                <Palette className="h-3.5 w-3.5" /> {product.color}
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                <Baby className="h-3.5 w-3.5" /> {product.ageRange}
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                <Shirt className="h-3.5 w-3.5" /> {product.gender}
              </Badge>
            </div>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Medidas Reales de la Prenda</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Medidas tomadas con la prenda extendida sobre superficie plana
                </p>
                {(() => {
                  const m = product.measurements;
                  const entries: Array<{ label: string; value: number }> = [
                    { label: "Largo", value: m?.largo ?? 0 },
                    { label: "Ancho", value: m?.ancho ?? 0 },
                    { label: "Largo manga", value: m?.manga ?? 0 },
                    { label: "Ancho cintura", value: m?.anchoCintura ?? 0 },
                    { label: "Entrepierna", value: m?.entrepierna ?? 0 },
                  ].filter((e) => e.value > 0);
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {entries.map(({ label, value }) => (
                          <div key={label} className="bg-muted rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">{label}</p>
                            <p className="text-xl font-bold text-primary">{value} cm</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-2">
                        <img
                          src="/images/REFERENCIA_MEDIDAS.png"
                          alt="Referencia de medidas"
                          className="max-w-full h-auto rounded-lg border bg-muted"
                        />
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              {product.soldOut ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-muted-foreground/30 bg-muted/50 py-3 text-base font-medium text-muted-foreground">
                  Vendido
                </div>
              ) : isInCart ? (
                <Button size="lg" className="flex-1 gap-2 text-base" disabled>
                  <ShoppingCart className="h-5 w-5" />
                  En el carrito
                </Button>
              ) : (
                <Button size="lg" className="flex-1 gap-2 text-base" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Agregar al carrito
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="px-4 opacity-60 cursor-not-allowed"
                disabled
                aria-label="Próximamente"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-4 opacity-60 cursor-not-allowed"
                disabled
                aria-label="Próximamente"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Estado</p>
                    <p className="text-sm text-muted-foreground">{product.condition}</p>
                    {product.conditionDetail && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.conditionDetail}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <Tag className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Marca</p>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                </CardContent>
              </Card>

              {product.material && (
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Shirt className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Material</p>
                      <p className="text-sm text-muted-foreground">{product.material}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {product.usageCount && (
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Uso</p>
                      <p className="text-sm text-muted-foreground">{product.usageCount}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Barra flotante móvil: agregar, like, compartir */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-2 border-t bg-background/95 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        {product.soldOut ? (
          <div className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground">
            Vendido
          </div>
        ) : isInCart ? (
          <Button size="lg" className="flex-1 gap-2" disabled>
            <ShoppingCart className="h-5 w-5" />
            En el carrito
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            Agregar al carrito
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          className="shrink-0 px-4 opacity-60"
          disabled
          aria-label="Próximamente"
        >
          <Heart className="h-5 w-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="shrink-0 px-4 opacity-60"
          disabled
          aria-label="Próximamente"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
