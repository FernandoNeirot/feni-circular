"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ImagePlus, X } from "lucide-react";

export type ImagesCardProps = {
  images: Array<string | File>;
  previewUrls: string[];
  moveImage: (fromIndex: number, toIndex: number) => void;
  removeImage: (index: number) => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ImagesCard({
  images,
  previewUrls,
  moveImage,
  removeImage,
  imageInputRef,
  handleFileSelect,
}: ImagesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Imágenes (máx. 3)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previewUrls.map((url, index) => {
              const isFirst = index === 0;
              return (
                <div
                  key={`preview-${index}`}
                  className="relative group w-24 h-24 rounded-lg overflow-hidden border bg-muted shrink-0"
                >
                  <img
                    src={url}
                    alt={`Vista previa ${index + 1}${isFirst ? " (principal)" : ""}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {isFirst && (
                    <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Principal
                    </span>
                  )}
                  <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 bg-black/60 text-white hover:bg-black/80"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Mover a la izquierda"
                    >
                      {"‹"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 bg-black/60 text-white hover:bg-black/80"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={index === previewUrls.length - 1}
                      aria-label="Mover a la derecha"
                    >
                      {"›"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 opacity-90 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                      aria-label="Quitar imagen"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {images.length < 3 && (
          <>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => imageInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && imageInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground space-y-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <ImagePlus className="h-8 w-8 mx-auto" />
              <p className="text-sm">
                Hacé clic para elegir hasta {3 - images.length} imagen(es) (se subirán al guardar)
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
