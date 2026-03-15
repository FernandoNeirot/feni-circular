"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export interface ZoomableImageProps {
  /** URL de la imagen */
  src: string;
  /** Texto alternativo (y título del modal si no se pasa modalTitle) */
  alt?: string;
  /** Clases para la miniatura clickeable */
  className?: string;
  /** Título del modal. Por defecto usa alt */
  modalTitle?: string;
  /** Clases para el botón/contenedor de la miniatura */
  wrapperClassName?: string;
  /** Mostrar icono y leyenda "Clic para ampliar" sobre la miniatura */
  showZoomHint?: boolean;
  /** Texto de la leyenda cuando showZoomHint es true */
  zoomHintText?: string;
}

/**
 * Imagen que al hacer clic se abre en un modal con zoom (alejar / acercar / 100%).
 * Reutilizable en cualquier página: producto, admin, etc.
 */
export function ZoomableImage({
  src,
  alt = "Imagen",
  className,
  modalTitle,
  wrapperClassName,
  showZoomHint = false,
  zoomHintText = "Clic para ampliar",
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  const handleOpen = () => {
    setZoom(1);
    setOpen(true);
  };

  const title = modalTitle ?? alt;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          wrapperClassName ??
          "block w-full text-left rounded-lg border bg-muted overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
        }
      >
        <span className="relative block">
          <img
            src={src}
            alt={alt}
            className={
              className ??
              "max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            }
          />
          {showZoomHint && (
            <span
              className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/60 text-white text-xs font-medium px-3 py-1.5 pointer-events-none"
              aria-hidden
            >
              <ZoomIn className="h-3.5 w-3.5 shrink-0" />
              {zoomHintText}
            </span>
          )}
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-4">
          <DialogHeader className="shrink-0">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto flex items-start justify-center p-4 bg-muted/50 rounded-lg">
            <div
              className="inline-block shrink-0"
              style={
                imgSize
                  ? {
                      width: imgSize.w * zoom,
                      height: imgSize.h * zoom,
                    }
                  : undefined
              }
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto block object-contain"
                style={
                  imgSize
                    ? {
                        width: imgSize.w,
                        height: imgSize.h,
                        objectFit: "contain",
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                      }
                    : undefined
                }
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
                }}
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-center gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              aria-label="Alejar"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setZoom(1)}
              aria-label="Tamaño original"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              aria-label="Acercar"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
