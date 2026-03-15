"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const FAVORITES_STORAGE_KEY = "feni-favorites";

function toId(id: string | number | undefined): string {
  if (id === undefined || id === null) return "";
  return String(id);
}

interface FavoritesContextType {
  /** IDs de productos marcados como favoritos */
  favoriteIds: string[];
  /** Agrega o quita el producto por id (toggle) */
  toggleFavorite: (id: string | number | undefined) => void;
  /** true si el producto está en favoritos */
  isFavorite: (id: string | number | undefined) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function loadFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setFavoriteIds(loadFavoritesFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds, isHydrated]);

  const toggleFavorite = useCallback((id: string | number | undefined) => {
    const sid = toId(id);
    if (!sid) return;
    setFavoriteIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  }, []);

  const isFavorite = useCallback(
    (id: string | number | undefined) => {
      const sid = toId(id);
      return sid ? favoriteIds.includes(sid) : false;
    },
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (ctx === undefined) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
