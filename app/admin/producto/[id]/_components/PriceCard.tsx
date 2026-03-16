"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";

type PriceCardProps = {
  form: UseFormReturn<ProductFormValues>;
};

export function PriceCard({ form }: PriceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Precio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Precio de venta *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              className={cn(
                form.formState.errors.price && "border-destructive focus-visible:ring-destructive"
              )}
              {...form.register("price")}
              placeholder="1200"
            />
            {form.formState.errors.price && (
              <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalPrice">Precio original</Label>
            <Input
              id="originalPrice"
              type="number"
              min={0}
              {...form.register("originalPrice")}
              placeholder="4500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Precio de compra</Label>
            <Input
              id="purchasePrice"
              type="number"
              min={0}
              {...form.register("purchasePrice")}
              placeholder="800"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground border-t pt-3">
          <strong>Precio original:</strong> hace referencia al precio de la prenda como nuevo.{" "}
          <strong>Precio de compra:</strong> es el costo que tuvo para el vendedor (se usa para reportes).
        </p>
      </CardContent>
    </Card>
  );
}
