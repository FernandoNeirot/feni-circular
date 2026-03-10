export interface ProductMeasurements {
  largo: number;
  ancho: number;
  manga?: number;
  entrepierna?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
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
}

export interface CartItem extends Product {
  quantity: number;
}
