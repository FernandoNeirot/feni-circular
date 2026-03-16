"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
type BasicInfoCardProps = {
  form: UseFormReturn<ProductFormValues>;
  isEditing: boolean;
};

export function BasicInfoCard({ form }: BasicInfoCardProps) {
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
          <Label htmlFor="slug">URL</Label>
          <Controller
            name="slug"
            control={form.control}
            render={({ field }) => (
              <Input
                id="slug"
                className={cn(
                  form.formState.errors.slug && "border-destructive focus-visible:ring-destructive"
                )}
                {...field}
                disabled
                readOnly
                placeholder="Se genera automáticamente desde el nombre"
                maxLength={120}
              />
            )}
          />
          {form.formState.errors.slug && (
            <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Se genera desde el nombre (espacios → guiones, sin acentos ni caracteres especiales)
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
