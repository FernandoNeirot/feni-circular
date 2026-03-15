"use client";

import { Button } from "@/shared/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useShare, type ShareOptions } from "@/shared/hooks/useShare";

export interface ShareButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  /** Opciones para compartir (título, texto, url). Si no se pasa url, se usa la actual. */
  shareOptions: ShareOptions;
  /** Mensaje del toast cuando se copia el enlace (fallback) */
  copyToastMessage?: string;
  /** Contenido del botón. Por defecto: icono Share2 */
  children?: React.ReactNode;
}

/**
 * Botón reutilizable para compartir en cualquier página (producto, artículo, búsqueda, etc.).
 * Usa navigator.share cuando está disponible; si no, copia la URL al portapapeles y muestra un toast.
 */
export function ShareButton({
  shareOptions,
  copyToastMessage = "Enlace copiado",
  children,
  ...buttonProps
}: ShareButtonProps) {
  const { share } = useShare(shareOptions, {
    onCopyFallback: () => toast.success(copyToastMessage),
    onError: () => toast.error("No se pudo compartir"),
  });

  return (
    <Button
      type="button"
      onClick={() => share()}
      aria-label="Compartir"
      {...buttonProps}
    >
      {children ?? <Share2 className="h-5 w-5" />}
    </Button>
  );
}
