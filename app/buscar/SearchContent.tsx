"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/shared/components/ProductCard";
import type { Product } from "@/shared/types/product";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface SearchContentProps {
  initialProducts: Product[];
}

export function SearchContent({ initialProducts }: SearchContentProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialAgeRange = searchParams.get("ageRange") || "all";
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState(initialAgeRange);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(
    () => [...new Set(initialProducts.map((p) => p.category))],
    [initialProducts],
  );

  const filteredProducts = useMemo(() => {
    let results = initialProducts;

    if (query.length >= 3) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
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
  }, [initialProducts, query, selectedCategory, selectedGender, selectedAgeRange, sortBy]);

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
    { value: "0-12m", label: "0-12m" },
    { value: "1-3 años", label: "1-3 años" },
    { value: "3-6 años", label: "3-6 años" },
    { value: "6+ años", label: "6+ años" },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Buscar por nombre, marca, talle, color..."
              className="pl-12 pr-12 h-14 text-base rounded-full border-2 border-primary/30 focus-visible:ring-primary/40 bg-card shadow-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={() => handleQueryChange("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 rounded-full"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>

          {hasActiveFilters && (
            <>
              {selectedCategory !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setSelectedCategory("all")}
                >
                  {selectedCategory} <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedAgeRange !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setSelectedAgeRange("all")}
                >
                  Edad: {selectedAgeRange} <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedGender !== "all" && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setSelectedGender("all")}
                >
                  {selectedGender === "niña"
                    ? "Niña"
                    : selectedGender === "niño"
                      ? "Niño"
                      : "Unisex"}{" "}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Limpiar filtros
              </button>
            </>
          )}

          <span className="ml-auto text-sm text-muted-foreground">
            {filteredProducts.length} producto
            {filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 rounded-xl bg-card border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Rango de edad</label>
              <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                <SelectTrigger className="rounded-lg">
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
              <label className="text-sm font-medium mb-1.5 block">Categoría</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-lg">
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
              <label className="text-sm font-medium mb-1.5 block">Género</label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="rounded-lg">
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
              <label className="text-sm font-medium mb-1.5 block">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="rounded-lg">
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
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No encontramos resultados</h3>
            <p className="text-muted-foreground mb-6">
              Probá con otras palabras clave o ajustá los filtros
            </p>
            <Button
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
      </main>
    </div>
  );
}
