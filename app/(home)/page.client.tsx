'use client'
import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { HeroCarousel } from '@/shared/components/HeroCarousel'
import { ProductGrid } from '@/shared/components/ProductGrid'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { productsQueryOptions } from '@/shared/queries/productos'
import { Droplets, Heart, Instagram, Leaf, Recycle, Star } from 'lucide-react'

interface PageclientProps {
  ageFilters: {
    label: string
    emoji: string
    filter: string
  }[]
  testimonials: {
    name: string
    text: string
    rating: number
  }[]
}

const Pageclient = ({ ageFilters, testimonials }: PageclientProps) => {
  const { data: products = [] } = useQuery(productsQueryOptions)
  const featuredProducts = [...products].sort((a, b) => (a.featured ? -1 : b.featured ? 1 : 0)).slice(0, 4)
  const trendingProducts = [...products].sort((a, b) => (a.trending ? -1 : b.trending ? 1 : 0)).slice(0, 4)
  const whatsappHref = `https://wa.me/541133150864?text=${encodeURIComponent(
    `hola, te queria consultar por la ropa de FENI\n${process.env.NEXT_PUBLIC_BASE_URL ?? ''}`
  )}`
  return (
    <>
      <HeroCarousel />

<section className="py-16 px-4 md:px-8">
  <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="text-center space-y-3">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Leaf className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg">Sostenible</h3>
      <p className="text-sm text-muted-foreground">
        Dale una segunda vida a la ropa infantil
      </p>
    </div>
    <div className="text-center space-y-3">
      <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
        <Recycle className="h-8 w-8 text-secondary" />
      </div>
      <h3 className="font-semibold text-lg">Calidad Garantizada</h3>
      <p className="text-sm text-muted-foreground">
        Todas las prendas están en excelente estado
      </p>
    </div>
    <div className="text-center space-y-3">
      <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
        <Heart className="h-8 w-8 text-accent" />
      </div>
      <h3 className="font-semibold text-lg">Con Amor</h3>
      <p className="text-sm text-muted-foreground">
        Cada prenda tiene su propia historia
      </p>
    </div>
  </div>
</section>

<section className="py-8 px-4 md:px-8">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold text-center mb-6">Buscá por edad</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ageFilters.map((af) => (
        <Link
          key={af.filter}
          href={`/buscar?ageRange=${encodeURIComponent(af.filter)}`}
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-card border-2 border-transparent hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <span className="text-3xl" suppressHydrationWarning>{af.emoji}</span>
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {af.label}
          </span>
        </Link>
      ))}
    </div>
  </div>
</section>

<ProductGrid
  title="✨ Productos Destacados"
  products={featuredProducts}
/>

<section className="py-12 px-4 md:px-8">
  <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-info/10 to-secondary/10 rounded-3xl p-8 md:p-12 text-center space-y-4">
    <Droplets className="h-10 w-10 text-info mx-auto" />
    <h3 className="text-2xl font-bold text-foreground">
      Tu compra tiene impacto 🌍
    </h3>
    <p className="text-muted-foreground max-w-xl mx-auto">
      La industria textil es la segunda más contaminante del mundo. Al
      elegir ropa circular, cada prenda ahorra en promedio{" "}
      <strong className="text-foreground">2.700 litros de agua</strong> y{" "}
      <strong className="text-foreground">3,6 kg de CO₂</strong>.
    </p>
    <div className="flex flex-wrap justify-center gap-4 pt-2">
      <Badge
        variant="outline"
        className="text-sm px-4 py-2 rounded-full bg-card"
      >
        💧 2.700 L de agua por prenda
      </Badge>
      <Badge
        variant="outline"
        className="text-sm px-4 py-2 rounded-full bg-card"
      >
        🌱 3,6 kg de CO₂ evitados
      </Badge>
      <Badge
        variant="outline"
        className="text-sm px-4 py-2 rounded-full bg-card"
      >
        ♻️ Menos residuos textiles
      </Badge>
    </div>
  </div>
</section>

<ProductGrid
  title="🔥 Los Más Vistos de la Semana"
  products={trendingProducts}
/>

<section className="py-16 px-4 md:px-8 bg-muted/30">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl font-bold text-center mb-10">
      Lo que dicen nuestras clientas 💬
    </h2>
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((t, i) => (
        <div
          key={i}
          className="bg-card border rounded-2xl p-6 space-y-3"
        >
          <div className="flex gap-0.5">
            {Array.from({ length: t.rating }).map((_, j) => (
              <Star
                key={j}
                className="h-4 w-4 fill-secondary text-secondary"
              />
            ))}
          </div>
          <p className="text-foreground italic">&quot;{t.text}&quot;</p>
          <p className="text-sm font-semibold text-muted-foreground">
            — {t.name}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="py-16 px-4 md:px-8 text-center">
  <div className="max-w-md mx-auto space-y-4">
    <Instagram className="h-10 w-10 text-accent mx-auto" />
    <h3 className="text-2xl font-bold text-foreground">
      Seguinos en Instagram
    </h3>
    <p className="text-muted-foreground text-sm">
      Mirá las últimas prendas, tips de moda circular y más ✨
    </p>
    <Button
      variant="outline"
      className="rounded-full gap-2 border-accent/40 text-accent hover:bg-accent/10"
      onClick={() =>
        window.open("https://www.instagram.com/fenicircular/", "_blank")
      }
    >
      <Instagram className="h-4 w-4" />
      @fenicircular
    </Button>
  </div>
</section>

<footer className="bg-muted/50 py-12 px-4 md:px-8">
  <div className="max-w-7xl mx-auto">
    <div className="grid md:grid-cols-3 gap-8 mb-8">
      <div>
        <h3 className="text-xl font-bold mb-3">FENI</h3>
        <p className="text-sm text-muted-foreground">
          Ropa infantil circular de excelente calidad.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Navegación</h4>
        <div className="flex flex-col gap-2">
          {[
            { label: "Productos", href: "/buscar" },
            { label: "¿Cómo funciona?", href: "/como-funciona" },
            { label: "Vendé con nosotros", href: "/vender" },
            { label: "Preguntas frecuentes", href: "/faq" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-primary text-left transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Contacto</h4>
        <p className="text-sm text-muted-foreground">
          WhatsApp: <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">+54 11-3315-0864</a>
        </p>
        <p className="text-sm text-muted-foreground">
          Instagram: @fenicircular
        </p>
      </div>
    </div>
    <div className="border-t pt-6 text-center">
      <p className="text-sm text-muted-foreground">
        © 2024 FENI. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>
    </>
  )
}

export default Pageclient