export interface ProductMeasurements {
  manga?: number;
  ancho: number;
  largo: number;
  anchoCintura?: number;
  entrepierna?: number;
}

export interface Product {
  id?: number;
  /** ISO 8601 — asignado en el servidor al crear */
  createdAt?: string;
  /** ISO 8601 — asignado en el servidor en cada actualización */
  updatedAt?: string;
  slug?: string;
  stock?: number;
  name: string;
  price: number;
  originalPrice?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  saleDate?: string;
  images: string[];
  image: string;
  category: string;
  size: string;
  brand: string;
  condition: string;
  conditionDetail?: string;
  measurements: ProductMeasurements;
  description: string;
  color: string;
  ageRange: string;
  gender: "niña" | "niño" | "unisex";
  material?: string;
  usageCount?: string;
  soldOut?: boolean;
  featured?: boolean;
  trending?: boolean;
  isConsigned: boolean;
  boughtFrom: string;
  soldTo: string;
}

export interface CartItem extends Product {
  quantity: number;
}
