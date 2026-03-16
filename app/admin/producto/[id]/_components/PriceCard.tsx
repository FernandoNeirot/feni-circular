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
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </CardContent>
    </Card>
  );
}
