"use client";

import { useCallback, useMemo } from "react";

export interface ShareOptions {
  /** Título del contenido (ej. nombre del producto o de la página) */
  title?: string;
  /** Texto descriptivo para el mensaje compartido */
  text?: string;
  /** URL canónica a compartir. Si no se pasa, se usa la URL actual en el cliente. */
  url?: string;
}

export interface UseShareReturn {
  /** Ejecuta la acción de compartir (nativo o copiar enlace) */
  share: (overrides?: Partial<ShareOptions>) => Promise<void>;
  /** true si navigator.share está disponible (compartir nativo) */
  canShare: boolean;
}

/**
 * Hook reutilizable para compartir usando la Web Share API (navigator.share).
 * Si no está disponible, copia la URL al portapapeles.
 * Úsalo en cualquier página: producto, artículo, búsqueda, etc.
 */
export function useShare(
  defaultOptions: ShareOptions = {},
  options?: {
    onCopyFallback?: (url: string) => void;
    onError?: (error: unknown) => void;
  }
): UseShareReturn {
  const canShare = useMemo(() => {
    if (typeof window === "undefined") return false;
    return typeof navigator !== "undefined" && Boolean(navigator.share);
  }, []);

  const share = useCallback(
    async (overrides?: Partial<ShareOptions>) => {
      const opts = { ...defaultOptions, ...overrides };
      const urlToShare =
        opts.url ?? (typeof window !== "undefined" ? window.location.href : "");

      if (canShare && navigator.share) {
        try {
          await navigator.share({
            title: opts.title,
            text: opts.text,
            url: urlToShare,
          });
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
          options?.onError?.(err);
          throw err;
        }
        return;
      }

      try {
        await navigator.clipboard.writeText(urlToShare);
        options?.onCopyFallback?.(urlToShare);
      } catch (err) {
        options?.onError?.(err);
        throw err;
      }
    },
    [canShare, defaultOptions, options]
  );

  return { share, canShare };
}
