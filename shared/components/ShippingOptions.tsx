"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import type { ShippingOption, ShippingService } from "@/shared/types/shipping";

interface ShippingOptionsProps {
  options: ShippingOption[];
  onSelectOption?: (option: ShippingOption) => void;
  loading?: boolean;
}

export function ShippingOptions({ options, onSelectOption, loading }: ShippingOptionsProps) {
  const [selectedService, setSelectedService] = useState<ShippingService | null>(null);

  if (!options || options.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        No hay opciones de envío disponibles. Validá tu dirección primero.
      </div>
    );
  }

  const handleSelectOption = (option: ShippingOption) => {
    setSelectedService(option.service);
    onSelectOption?.(option);
    toast.success(`Envío ${option.service} seleccionado`);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Opciones de Envío</h3>

      <div className="grid gap-3">
        {options.map((option) => (
          <Card
            key={option.service}
            className={`cursor-pointer border-2 p-4 transition-colors ${
              selectedService === option.service
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelectOption(option)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium capitalize">{option.service}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
                <p className="text-sm text-gray-500">
                  Entrega en {option.deliveryDays} día
                  {option.deliveryDays !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-green-600">${option.price.toFixed(2)}</p>
                {selectedService === option.service && (
                  <div className="mt-2 inline-block rounded bg-blue-500 px-2 py-1 text-xs text-white">
                    Seleccionado
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={() => {
          if (!selectedService) {
            toast.error("Seleccioná una opción de envío");
            return;
          }
          toast.success("Opción de envío confirmada");
        }}
        disabled={!selectedService || loading}
        className="w-full"
      >
        {loading ? "Procesando..." : "Confirmar Envío"}
      </Button>
    </div>
  );
}
