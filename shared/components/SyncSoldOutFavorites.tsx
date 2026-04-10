"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsQueryOptions } from "@/shared/queries/productos";
import { useFavorites } from "@/shared/components/favorites-provider";

/** Quita de favoritos los productos que figuran como vendidos en el catálogo cargado. */
export function SyncSoldOutFavorites() {
  const { data: products = [] } = useQuery(productsQueryOptions);
  const { favoriteIds, removeFavorite } = useFavorites();

  useEffect(() => {
    if (!products.length || !favoriteIds.length) return;
    for (const id of favoriteIds) {
      const p = products.find((x) => String(x.id) === String(id));
      if (p?.soldOut) removeFavorite(id);
    }
  }, [products, favoriteIds, removeFavorite]);

  return null;
}
