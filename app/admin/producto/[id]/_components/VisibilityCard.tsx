"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

type VisibilityCardProps = {
  form: UseFormReturn<ProductFormValues>;
};

export function VisibilityCard({ form }: VisibilityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Visibilidad y estado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Destacado</Label>
            <p className="text-sm text-muted-foreground">
              Mostrar en sección de productos destacados
            </p>
          </div>
          <Controller
            name="featured"
            control={form.control}
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label>Lo más visto de la semana</Label>
            <p className="text-sm text-muted-foreground">
              Incluir en la sección de tendencias
            </p>
          </div>
          <Controller
            name="trending"
            control={form.control}
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <Label>Vendido</Label>
            <p className="text-sm text-muted-foreground">
              El producto aparecerá como no disponible
            </p>
          </div>
          <Controller
            name="soldOut"
            control={form.control}
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
