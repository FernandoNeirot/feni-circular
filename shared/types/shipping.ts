/**
 * Tipos para envíos y direcciones
 */

export type ShippingService = "clásico" | "express" | "premium";

export interface Address {
  street: string;
  number: number;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  reference?: string;
}

export interface ValidateAddressRequest {
  street: string;
  number: number;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface ValidateAddressResponse {
  valid: boolean;
  postalCode: string;
  zone: number;
  message?: string;
}

export interface CalculateShippingRequest {
  postalCodeOrigin: string;
  postalCodeDestination: string;
  weight: number; // en kg
  service: ShippingService;
}

export interface ShippingOption {
  service: ShippingService;
  price: number;
  deliveryDays: number;
  description: string;
}

export interface Recipient {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Content {
  description: string;
  weight: number; // en kg
  value: number; // en pesos
}

export interface CreateShipmentRequest {
  recipient: Recipient;
  content: Content;
  service: ShippingService;
  reference?: string;
}

export interface CreateShipmentResponse {
  shipmentNumber: string;
  trackingCode: string;
  label: string; // URL del PDF
  trackingUrl: string;
}

export interface TrackingStatus {
  status: "pendiente" | "en_transito" | "entregado" | "devuelto" | "error";
  location: string;
  lastUpdate: Date;
  details: TrackingDetail[];
}

export interface TrackingDetail {
  date: Date;
  status: string;
  location: string;
  description: string;
}
