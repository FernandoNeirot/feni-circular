"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import { categories, genders, ageRanges } from "../constants";

type ClassificationCardProps = {
  form: UseFormReturn<ProductFormValues>;
};

export function ClassificationCard({ form }: ClassificationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Clasificación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.category &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Género *</Label>
            <Controller
              name="gender"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.gender &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Talle *</Label>
            <Input
              id="size"
              className={cn(
                form.formState.errors.size && "border-destructive focus-visible:ring-destructive"
              )}
              {...form.register("size")}
              placeholder="Ej: 2-3 años"
              maxLength={20}
            />
            {form.formState.errors.size && (
              <p className="text-sm text-destructive">{form.formState.errors.size.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Rango de edad *</Label>
            <Controller
              name="ageRange"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      form.formState.errors.ageRange &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRanges.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.ageRange && (
              <p className="text-sm text-destructive">
                {form.formState.errors.ageRange.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
