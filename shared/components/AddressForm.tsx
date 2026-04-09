"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Address, ValidateAddressRequest, ShippingOption } from "@/shared/types/shipping";
import { validateAddress, calculateShipping } from "@/shared/queries/shipping";

interface AddressFormProps {
  onAddressValidated?: (address: Address) => void;
  onShippingOptionsCalculated?: (options: ShippingOption[]) => void;
  loading?: boolean;
}

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export function AddressForm({
  onAddressValidated,
  onShippingOptionsCalculated,
  loading: externalLoading,
}: AddressFormProps) {
  const [address, setAddress] = useState<Address>({
    street: "",
    number: 0,
    city: "",
    province: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: name === "number" ? parseInt(value) || 0 : value,
    }));
    setValidationStatus("idle");
  };

  const handleProvinceChange = (value: string) => {
    setAddress((prev) => ({
      ...prev,
      province: value,
    }));
    setValidationStatus("idle");
  };

  const handleValidateAndCalculate = async () => {
    if (
      !address.street ||
      !address.number ||
      !address.city ||
      !address.province ||
      !address.postalCode
    ) {
      toast.error("Completá todos los campos");
      return;
    }

    setLoading(true);
    setValidationStatus("validating");

    try {
      // Validar dirección
      const validateRequest: ValidateAddressRequest = {
        street: address.street,
        number: address.number,
        floor: address.floor,
        apartment: address.apartment,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
      };

      const validationResult = await validateAddress(validateRequest);

      if (!validationResult.valid) {
        setValidationStatus("invalid");
        toast.error("Dirección inválida. Revisá los datos.");
        return;
      }

      setValidationStatus("valid");
      toast.success("Dirección validada correctamente");

      // Callback de validación
      onAddressValidated?.(address);

      // Calcular opciones de envío
      // Asumiendo que el origen es CABA (1425)
      const shippingRequest = {
        postalCodeOrigin: "1425", // CABA
        postalCodeDestination: validationResult.postalCode,
        weight: 1, // Peso aproximado (después se podría calcular con carrito)
        service: "clásico" as const,
      };

      const shippingResult = await calculateShipping(shippingRequest);
      onShippingOptionsCalculated?.(shippingResult.options);

      toast.success(`${shippingResult.options.length} opción/es de envío disponible/s`);
    } catch (error) {
      setValidationStatus("invalid");
      const message = error instanceof Error ? error.message : "Error al validar dirección";
      toast.error(message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Dirección de Envío</h3>

      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="street">Calle</Label>
            <Input
              id="street"
              name="street"
              value={address.street}
              onChange={handleInputChange}
              placeholder="Acoyte"
              disabled={externalLoading || loading}
            />
          </div>
          <div>
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              name="number"
              type="number"
              value={address.number || ""}
              onChange={handleInputChange}
              placeholder="1234"
              disabled={externalLoading || loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="floor">Piso (opcional)</Label>
            <Input
              id="floor"
              name="floor"
              value={address.floor || ""}
              onChange={handleInputChange}
              placeholder="3"
              disabled={externalLoading || loading}
            />
          </div>
          <div>
            <Label htmlFor="apartment">Departamento (opcional)</Label>
            <Input
              id="apartment"
              name="apartment"
              value={address.apartment || ""}
              onChange={handleInputChange}
              placeholder="B"
              disabled={externalLoading || loading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="city">Localidad</Label>
          <Input
            id="city"
            name="city"
            value={address.city}
            onChange={handleInputChange}
            placeholder="CABA"
            disabled={externalLoading || loading}
          />
        </div>

        <div>
          <Label htmlFor="province">Provincia</Label>
          <Select
            value={address.province}
            onValueChange={handleProvinceChange}
            disabled={externalLoading || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná provincia" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="postalCode">Código Postal</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={address.postalCode}
            onChange={handleInputChange}
            placeholder="1402"
            disabled={externalLoading || loading}
          />
        </div>
      </div>

      <Button
        onClick={handleValidateAndCalculate}
        disabled={externalLoading || loading}
        className="w-full"
      >
        {loading ? "Validando dirección..." : "Validar y Calcular Envío"}
      </Button>

      {validationStatus === "valid" && (
        <div className="rounded bg-green-50 p-2 text-sm text-green-700">
          ✓ Dirección validada correctamente
        </div>
      )}
      {validationStatus === "invalid" && (
        <div className="rounded bg-red-50 p-2 text-sm text-red-700">
          ✗ Dirección inválida. Revisá los datos
        </div>
      )}
    </div>
  );
}
