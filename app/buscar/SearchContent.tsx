"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/shared/components/ProductCard";
import { Input } from "@/shared/components/ui/input";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { productsQueryOptions } from "@/shared/queries/productos";
import { whatsappNumber } from "@/shared/configs/whatsapp";

export function SearchContent() {
  const searchParams = useSearchParams();
  const { data: products = [], isPending } = useQuery(productsQueryOptions);
  const paramsKey = searchParams.toString();
  const qFromUrl = searchParams.get("q") || "";
  const ageFromUrl = searchParams.get("ageRange") || "all";
  const [query, setQuery] = useState(qFromUrl);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState(ageFromUrl);
  const [prevParamsKey, setPrevParamsKey] = useState(paramsKey);

  /** Sincronizar con la URL al navegar (ej. `?ageRange=…` desde home) sin efecto en cascada. */
  if (paramsKey !== prevParamsKey) {
    setPrevParamsKey(paramsKey);
    setQuery(qFromUrl);
    setSelectedAgeRange(ageFromUrl);
  }
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    let results = products;

    if (query.length >= 3) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      results = results.filter((p) => p.category === selectedCategory);
    }

    if (selectedGender !== "all") {
      results = results.filter((p) => p.gender === selectedGender);
    }

    if (selectedAgeRange !== "all") {
      results = results.filter(
        (p) => (p.ageRange?.trim() || "").toLowerCase() === selectedAgeRange.toLowerCase()
      );
    }

    switch (sortBy) {
      case "price-asc":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "discount":
        results = [...results].sort((a, b) => {
          const discA = a.originalPrice ? 1 - a.price / a.originalPrice : 0;
          const discB = b.originalPrice ? 1 - b.price / b.originalPrice : 0;
          return discB - discA;
        });
        break;
    }

    return results;
  }, [products, query, selectedCategory, selectedGender, selectedAgeRange, sortBy]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.length >= 3) {
      params.set("q", value);
    } else if (value.length === 0) {
      params.delete("q");
    }
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedGender("all");
    setSelectedAgeRange("all");
    setSortBy("relevance");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedGender !== "all" ||
    selectedAgeRange !== "all" ||
    sortBy !== "relevance";

  const ageRangeOptions = [
    { value: "all", label: "Todas las edades" },
    // { value: "0-12m", label: "0-12m" },
    { value: "2-6 años", label: "🧒 2-6 años" },
    { value: "7-12 años", label: "👦 7-12 años" },
    { value: "13-16 años", label: "🎒 13-16 años" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedAgeRange !== "all") {
      params.set("ageRange", selectedAgeRange);
    } else {
      params.delete("ageRange");
    }
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [selectedAgeRange, searchParams]);

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `hola, te queria consultar por la ropa de FENI\n${process.env.NEXT_PUBLIC_BASE_URL ?? ""}`
  )}`;

  const filterChipClass =
    "inline-flex items-center gap-1 rounded-full border border-input bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center sm:text-left mb-6">Buscá en el catálogo</h1>
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <label htmlFor="search-catalog" className="sr-only">
              Buscar por nombre, marca, talle, color o descripción
            </label>
            <SearchIcon
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="search-catalog"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Buscar por nombre, marca, talle, color..."
              className="pl-12 pr-12 h-14 text-base rounded-full border-2 border-primary/30 focus-visible:ring-primary/40 bg-card shadow-sm"
              autoComplete="off"
              enterKeyHint="search"
            />
            {query ? (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6 min-h-11">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 rounded-full shrink-0"
            aria-expanded={showFilters}
            aria-controls="search-filters-panel"
            id="search-filters-toggle"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filtros
          </Button>

          {hasActiveFilters && (
            <>
              {selectedCategory !== "all" && (
                <button
                  type="button"
                  className={filterChipClass}
                  onClick={() => setSelectedCategory("all")}
                  aria-label={`Quitar filtro de categoría: ${selectedCategory}`}
                >
                  {selectedCategory}
                  <X className="h-3 w-3 shrink-0" aria-hidden />
                </button>
              )}
              {selectedAgeRange !== "all" && (
                <button
                  type="button"
                  className={filterChipClass}
                  onClick={() => setSelectedAgeRange("all")}
                  aria-label={`Quitar filtro de edad: ${selectedAgeRange}`}
                >
                  Edad: {selectedAgeRange}
                  <X className="h-3 w-3 shrink-0" aria-hidden />
                </button>
              )}
              {selectedGender !== "all" && (
                <button
                  type="button"
                  className={filterChipClass}
                  onClick={() => setSelectedGender("all")}
                  aria-label={`Quitar filtro de género: ${selectedGender}`}
                >
                  {selectedGender === "niña"
                    ? "Niña"
                    : selectedGender === "niño"
                      ? "Niño"
                      : "Unisex"}
                  <X className="h-3 w-3 shrink-0" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-primary hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Limpiar filtros
              </button>
            </>
          )}

          <p
            className="ml-auto text-sm text-muted-foreground tabular-nums"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {isPending
              ? "Cargando…"
              : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div
          id="search-filters-panel"
          role="region"
          aria-labelledby="search-filters-toggle"
          hidden={!showFilters}
          className={showFilters ? "mb-8" : "mb-0"}
        >
          {showFilters ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-card border shadow-sm">
              <div>
                <label htmlFor="filter-age-range" className="text-sm font-medium mb-1.5 block">
                  Rango de edad
                </label>
                <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                  <SelectTrigger id="filter-age-range" className="rounded-lg">
                    <SelectValue placeholder="Todas las edades" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRangeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="filter-category" className="text-sm font-medium mb-1.5 block">
                  Categoría
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="filter-category" className="rounded-lg">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="filter-gender" className="text-sm font-medium mb-1.5 block">
                  Género
                </label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger id="filter-gender" className="rounded-lg">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="niña">Niña</SelectItem>
                    <SelectItem value="niño">Niño</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="filter-sort" className="text-sm font-medium mb-1.5 block">
                  Ordenar por
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="filter-sort" className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="price-asc">Menor precio</SelectItem>
                    <SelectItem value="price-desc">Mayor precio</SelectItem>
                    <SelectItem value="discount">Mayor descuento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-h-[min(70vh,52rem)]">
          {isPending && products.length === 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              aria-busy="true"
              aria-label="Cargando productos"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                  aria-hidden
                >
                  <div className="aspect-square bg-muted/60 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-muted/50 rounded animate-pulse w-4/5" />
                    <div className="h-3 bg-muted/40 rounded animate-pulse w-1/2" />
                    <div className="h-8 bg-muted/50 rounded animate-pulse w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} imagePriority={index < 8} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 max-w-md mx-auto">
              <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" aria-hidden />
              <h2 className="text-xl font-semibold mb-2">No encontramos resultados</h2>
              <p className="text-muted-foreground mb-6">
                Probá con otras palabras clave o ajustá los filtros
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleQueryChange("");
                  clearFilters();
                }}
                className="rounded-full"
              >
                Ver todos los productos
              </Button>
            </div>
          )}
        </div>
      </main>

      <SiteFooter whatsappHref={whatsappHref} />
    </div>
  );
}
