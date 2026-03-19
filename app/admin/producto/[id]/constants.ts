import type { ProductMeasurements } from "@/shared/types/product";

export const categories = [
  "Abrigos",
  "Bolsos",
  "Calzados",
  "Enteritos",
  "Pantalones",
  "Remeras",
  "Vestidos",
] as const;

/** Campos de medidas por categoría. Claves: manga (A), ancho (B), largo (C), anchoCintura (D), entrepierna (E) */
export const categoryMeasurementFields: Record<
  string,
  Array<{ key: "manga" | "ancho" | "largo" | "anchoCintura" | "entrepierna"; label: string }>
> = {
  Abrigos: [
    { key: "manga", label: "A - Largo manga" },
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
    { key: "anchoCintura", label: "D - Ancho cintura" },
  ],
  Bolsos: [
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
  ],
  Enteritos: [
    { key: "manga", label: "A - Largo manga" },
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
    { key: "anchoCintura", label: "D - Ancho cintura" },
  ],
  Calzados: [
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
  ],
  Pantalones: [
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
    { key: "entrepierna", label: "E - Entrepierna" },
  ],
  Remeras: [
    { key: "manga", label: "A - Largo manga" },
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
  ],
  Vestidos: [
    { key: "manga", label: "A - Largo manga" },
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
    { key: "anchoCintura", label: "D - Ancho cintura" },
  ],
};

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
