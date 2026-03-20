import type { ProductMeasurements } from "@/shared/types/product";

export { categories, categoryMeasurementFields } from "@/shared/lib/category-measurements";

export const conditions = ["Como nuevo", "Excelente", "Muy bueno", "Bueno"] as const;

export const genders: Array<{ value: "niña" | "niño" | "unisex"; label: string }> = [
  { value: "niña", label: "Niña" },
  { value: "niño", label: "Niño" },
  { value: "unisex", label: "Unisex" },
];

export const ageRanges = [
  // { value: "0-12m", label: "👶 0-12m" },
  { value: "1-3 años", label: "🧒 1-3 años" },
  { value: "3-6 años", label: "👦 3-6 años" },
  { value: "6+ años", label: "🎒 6+ años" },
] as const;

export const emptyMeasurements: ProductMeasurements = {
  largo: 0,
  ancho: 0,
  manga: undefined,
  anchoCintura: undefined,
  entrepierna: undefined,
};

export const fieldLabels: Record<string, string> = {
  name: "Nombre",
  slug: "URL",
  slugSuffix: "Sufijo URL",
  price: "Precio",
  originalPrice: "Precio original",
  purchasePrice: "Precio de compra",
  purchaseDate: "Fecha de compra/consignación",
  saleDate: "Fecha de venta",
  category: "Categoría",
  size: "Talle",
  brand: "Marca",
  condition: "Estado",
  gender: "Género",
  ageRange: "Rango de edad",
};
