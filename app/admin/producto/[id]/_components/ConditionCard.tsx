"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { conditions } from "../constants";

type ConditionCardProps = {
  form: UseFormReturn<ProductFormValues>;
};

export function ConditionCard({ form }: ConditionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estado de la prenda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado *</Label>
            <Controller
              name="condition"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.condition &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.condition && (
              <p className="text-sm text-destructive">
                {form.formState.errors.condition.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="usageCount">Cantidad de usos</Label>
            <Input
              id="usageCount"
              {...form.register("usageCount")}
              placeholder="Ej: Usado 2 veces"
              maxLength={30}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="conditionDetail">Detalle del estado</Label>
          <Textarea
            id="conditionDetail"
            {...form.register("conditionDetail")}
            placeholder="Ej: Sin manchas ni roturas"
            rows={3}
            maxLength={300}
          />
        </div>
      </CardContent>
    </Card>
  );
}
