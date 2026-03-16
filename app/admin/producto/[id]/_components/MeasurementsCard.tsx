"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ZoomableImage } from "@/shared/components/ZoomableImage";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";
import { categoryMeasurementFields } from "../constants";

type MeasurementsCardProps = {
  form: UseFormReturn<ProductFormValues>;
};

export function MeasurementsCard({ form }: MeasurementsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Medidas (cm)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(() => {
          const category = form.watch("category");
          const fields = category ? categoryMeasurementFields[category] : null;
          if (!fields?.length) {
            return (
              <p className="text-sm text-muted-foreground">
                Seleccioná una categoría para cargar los campos de medidas.
              </p>
            );
          }
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`measure-${key}`}>{label}</Label>
                  <div className="relative">
                    <Input
                      id={`measure-${key}`}
                      type="number"
                      min={0}
                      className="pr-10"
                      {...form.register(key)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      cm
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
        <div className="pt-2">
          <ZoomableImage
            src={
              form.watch("category")
                ? `/images/medidas_${form
                    .watch("category")
                    ?.normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()}.png`
                : "/images/REFERENCIA_MEDIDAS.png"
            }
            alt="Referencia de medidas (clic para ampliar)"
            modalTitle="Referencia de medidas"
            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>
      </CardContent>
    </Card>
  );
}
