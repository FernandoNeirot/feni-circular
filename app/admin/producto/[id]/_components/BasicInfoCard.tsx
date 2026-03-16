"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";
import { normalizeSlug } from "@/features/admin";

type BasicInfoCardProps = {
  form: UseFormReturn<ProductFormValues>;
  isEditing: boolean;
};

export function BasicInfoCard({ form, isEditing }: BasicInfoCardProps) {
  const name = form.watch("name");
  const baseSlug = normalizeSlug(name ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Información básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del producto *</Label>
          <Input
            id="name"
            className={cn(
              form.formState.errors.name && "border-destructive focus-visible:ring-destructive"
            )}
            {...form.register("name")}
            placeholder="Ej: Vestido Lavanda con Botones"
            maxLength={100}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>URL</Label>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              id="slug-base"
              className="flex-1 min-w-[120px]"
              value={baseSlug}
              disabled
              readOnly
              aria-label="URL generada desde el nombre"
            />
            <span className="text-muted-foreground shrink-0">-</span>
            <Input
              id="slug-suffix"
              className={cn(
                "flex-1 min-w-[100px]",
                form.formState.errors.slugSuffix && "border-destructive focus-visible:ring-destructive"
              )}
              {...form.register("slugSuffix")}
              disabled={isEditing}
              placeholder={isEditing ? "" : "opcional, ej. 2 o azul"}
              maxLength={60}
              aria-label="Sufijo para hacer la URL única"
            />
          </div>
          {form.formState.errors.slugSuffix && (
            <p className="text-sm text-destructive">{form.formState.errors.slugSuffix.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            La URL se genera desde el nombre. Podés agregar un sufijo (solo al crear) para hacerla única.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Describí la prenda, su historia, detalles..."
            rows={3}
            maxLength={500}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Marca *</Label>
            <Input
              id="brand"
              className={cn(
                form.formState.errors.brand && "border-destructive focus-visible:ring-destructive"
              )}
              {...form.register("brand")}
              placeholder="Ej: Mimo & Co"
              maxLength={50}
            />
            {form.formState.errors.brand && (
              <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              {...form.register("color")}
              placeholder="Ej: Lavanda"
              maxLength={30}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            {...form.register("material")}
            placeholder="Ej: 100% Algodón"
            maxLength={50}
          />
        </div>
      </CardContent>
    </Card>
  );
}
