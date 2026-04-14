"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/shared/types/product";
import { useQuery } from "@tanstack/react-query";
import { HeroCarousel } from "@/shared/components/HeroCarousel";
import { ProductGrid } from "@/shared/components/ProductGrid";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useFavorites } from "@/shared/components/favorites-provider";
import { productsQueryOptions } from "@/shared/queries/productos";
import { Droplets, Heart, Instagram, Leaf, Recycle, Star } from "lucide-react";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { whatsappNumber } from "@/shared/configs/whatsapp";

interface PageclientProps {
  testimonials: {
    name: string;
    text: string;
    rating: number;
  }[];
}

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: React.ElementType;
}

function RevealOnScroll({
  children,
  className = "",
  delayMs = 0,
  as: Component = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={`${className} reveal-on-scroll ${isVisible ? "is-visible" : ""}`.trim()}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </Component>
  );
}

function seededShuffle<T>(items: T[], seedKey: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seedKey.length; i++) {
    h ^= seedKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let seed = h >>> 0;
  const rand = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function poolIdentity(products: Product[]): string {
  return products
    .map((p) => String(p.id ?? p.slug ?? p.name))
    .sort()
    .join("\0");
}

function buscarAgeRange(ageRange: string): string {
  return `/productos?ageRange=${encodeURIComponent(ageRange)}`;
}

function createdAtMs(p: Product): number {
  if (!p.createdAt) return 0;
  const t = new Date(p.createdAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

const Pageclient = ({ testimonials }: PageclientProps) => {
  const { favoriteIds } = useFavorites();
  const { data: products = [] } = useQuery(productsQueryOptions);

  const featuredProducts = useMemo(() => {
    const pool = products.filter((p) => p.featured);
    return seededShuffle(pool, `featured:${poolIdentity(pool)}`).slice(0, 4);
  }, [products]);

  const trendingProducts = useMemo(() => {
    const pool = products.filter((p) => p.trending);
    return seededShuffle(pool, `trending:${poolIdentity(pool)}`).slice(0, 4);
  }, [products]);

  /** Último ingreso: más reciente por `createdAt` (sin fecha al final). */
  const recentlyArrivedProducts = useMemo(() => {
    return [...products].sort((a, b) => createdAtMs(b) - createdAtMs(a)).slice(0, 4);
  }, [products]);

  const productsByAge = useMemo(() => {
    return products.filter((p) => p.ageRange === "1-3 años").slice(0, 4);
  }, [products]);

  const productsByAge36A = useMemo(() => {
    return products.filter((p) => p.ageRange === "3-6 años").slice(0, 4);
  }, [products]);

  const productsByAge6A = useMemo(() => {
    return products.filter((p) => p.ageRange === "6+ años").slice(0, 4);
  }, [products]);

  const favoriteProducts = products.filter((p) => favoriteIds.includes(String(p.id)) && !p.soldOut);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `hola, te queria consultar por la ropa de FENI\n${process.env.NEXT_PUBLIC_BASE_URL ?? ""}`
  )}`;
  return (
    <>
      <HeroCarousel />
      <RevealOnScroll as="section" className="py-16 px-4 md:px-8" delayMs={80}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <RevealOnScroll className="text-center space-y-3" delayMs={120}>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">Sostenible</h2>
            <p className="text-sm text-foreground">
              Dale una segunda vida a la ropa infantil
            </p>
          </RevealOnScroll>
          <RevealOnScroll className="text-center space-y-3" delayMs={180}>
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <Recycle className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="font-semibold text-lg">Calidad Garantizada</h2>
            <p className="text-sm text-foreground">
              Todas las prendas están en excelente estado
            </p>
          </RevealOnScroll>
          <RevealOnScroll className="text-center space-y-3" delayMs={240}>
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-accent" />
            </div>
            <h2 className="font-semibold text-lg">Con Amor</h2>
            <p className="text-sm text-foreground">Cada prenda tiene su propia historia</p>
          </RevealOnScroll>
        </div>
      </RevealOnScroll>
      <ProductGrid
        title="📦 Recién Llegados"
        products={recentlyArrivedProducts}
        priorityImageCount={2}
      />
      <ProductGrid
        title="🧒 Productos para 1-3 años"
        products={productsByAge}
        seeAllHref={buscarAgeRange("1-3 años")}
      />
      <ProductGrid
        title="👦 Productos para 3-6 años"
        products={productsByAge36A}
        seeAllHref={buscarAgeRange("3-6 años")}
      />
      <ProductGrid
        title="🎒 Productos para 6+ años"
        products={productsByAge6A}
        seeAllHref={buscarAgeRange("6+ años")}
      />
      <RevealOnScroll as="section" className="py-12 px-4 md:px-8" delayMs={120}>
        <div className="max-w-4xl mx-auto bg-linear-to-r from-primary/10 via-info/10 to-secondary/10 rounded-3xl p-8 md:p-12 text-center space-y-4">
          <Droplets className="h-10 w-10 text-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Tu compra tiene impacto 🌍</h2>
          <p className="text-foreground max-w-xl mx-auto">
            La industria textil es la segunda más contaminante del mundo. Al elegir ropa circular,
            cada prenda ahorra en promedio{" "}
            <strong className="text-foreground">2.700 litros de agua</strong> y{" "}
            <strong className="text-foreground">3,6 kg de CO₂</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Badge variant="outline" className="text-sm px-4 py-2 rounded-full bg-card">
              💧 2.700 L de agua por prenda
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-2 rounded-full bg-card">
              🌱 3,6 kg de CO₂ evitados
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-2 rounded-full bg-card">
              ♻️ Menos residuos textiles
            </Badge>
          </div>
        </div>
      </RevealOnScroll>
      <ProductGrid title="✨ Productos Destacados" products={featuredProducts} />
      <RevealOnScroll as="section" className="py-16 px-4 md:px-8 bg-muted/30" delayMs={140}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Lo que dicen nuestras clientas 💬
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <RevealOnScroll
                key={i}
                className="bg-card border rounded-2xl p-6 space-y-3"
                delayMs={180 + i * 80}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-foreground italic">&quot;{t.text}&quot;</p>
                <p className="text-sm font-semibold text-foreground">— {t.name}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </RevealOnScroll>
      <ProductGrid title="🔥 Favoritos de Mamá y Papá" products={trendingProducts} />
      {favoriteProducts.length >= 1 && (
        <ProductGrid title="❤️ Mis favoritos" products={favoriteProducts} />
      )}

      <RevealOnScroll as="section" className="py-16 px-4 md:px-8 text-center" delayMs={160}>
        <div className="max-w-md mx-auto space-y-4">
          <Instagram className="h-10 w-10 text-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Seguinos en Instagram</h2>
          <p className="text-foreground text-sm">
            Mirá las últimas prendas, tips de moda circular y más ✨
          </p>
          <Button
            variant="outline"
            className="rounded-full gap-2 border-border text-foreground hover:bg-accent/10"
            onClick={() => window.open("https://www.instagram.com/fenicircular/", "_blank")}
          >
            <Instagram className="h-4 w-4" />
            @fenicircular
          </Button>
        </div>
      </RevealOnScroll>
      <SiteFooter whatsappHref={whatsappHref} />
    </>
  );
};

export default Pageclient;
