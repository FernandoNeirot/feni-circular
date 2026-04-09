import type {
  ValidateAddressRequest,
  ValidateAddressResponse,
  CalculateShippingRequest,
  ShippingOption,
  CreateShipmentRequest,
  CreateShipmentResponse,
  TrackingStatus,
} from "@/shared/types/shipping";

/**
 * Validar si una dirección es válida según el Correo Argentino
 */
export async function validateAddress(
  address: ValidateAddressRequest
): Promise<ValidateAddressResponse> {
  const response = await fetch("/api/shipping/validate-address", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error validando dirección");
  }

  return response.json();
}

/**
 * Calcular opciones de envío y costos
 */
export async function calculateShipping(
  request: CalculateShippingRequest
): Promise<{ options: ShippingOption[]; estimatedDelivery: number }> {
  const response = await fetch("/api/shipping/calculate-shipping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error calculando envío");
  }

  return response.json();
}

/**
 * Crear un envío con el Correo Argentino
 */
export async function createShipment(
  shipment: CreateShipmentRequest
): Promise<CreateShipmentResponse> {
  const response = await fetch("/api/shipping/create-shipment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shipment),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error creando envío");
  }

  return response.json();
}

/**
 * Rastrear un envío
 */
export async function trackShipment(shipmentNumber: string): Promise<TrackingStatus> {
  const response = await fetch(`/api/shipping/track/${encodeURIComponent(shipmentNumber)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error rastreando envío");
  }

  return response.json();
}
