import type { ProductMeasurements } from "@/shared/types/product";
import type { Product } from "@/shared/types/product";

export const categories = [
  "Abrigos",
  "Accesorios",
  "Camisas",
  "Calzados",
  "Enteritos",
  "Pantalones",
  "Pollera",
  "Remeras",
  "Vestidos",
] as const;

export type CategoryId = (typeof categories)[number];

type MeasureKey = keyof Pick<
  ProductMeasurements,
  "manga" | "ancho" | "largo" | "anchoCintura" | "entrepierna"
>;

/** Campos de medidas por categoría. Claves: manga (A), ancho (B), largo (C), anchoCintura (D), entrepierna (E) */
export const categoryMeasurementFields: Record<
  CategoryId,
  Array<{ key: MeasureKey; label: string }>
> = {
  Abrigos: [
    { key: "manga", label: "A - Largo manga" },
    { key: "ancho", label: "B - Ancho" },
    { key: "largo", label: "C - Alto" },
    { key: "anchoCintura", label: "D - Ancho cintura" },
  ],
  Accesorios: [],
  Camisas: [
    { key: "manga", label: "A - Largo manga" },
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
  Pollera: [
    { key: "anchoCintura", label: "D - Ancho de cintura" },
    { key: "largo", label: "C - Alto" },
    { key: "ancho", label: "B - Largo" },
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

/** Ruta de la imagen de referencia de medidas, o `null` si la categoría no usa imagen. */
export function getCategoryMeasurementImagePath(category: string | undefined): string | null {
  if (!category) return "/images/REFERENCIA_MEDIDAS.png";
  if (category === "Accesorios") return null;
  if (category === "Pollera") return "/images/medidas_polleras.png";
  const slug = category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return `/images/medidas_${slug}.png`;
}

export function categorySkipsMeasurements(category: string | undefined): boolean {
  return category === "Accesorios";
}

/** Entradas para mostrar en ficha pública; respeta etiquetas por categoría. */
export function getProductMeasurementEntries(
  product: Product
): Array<{ label: string; value: number }> {
  const m = product.measurements;
  const cat = product.category as CategoryId | string;
  const defs = (categories as readonly string[]).includes(cat)
    ? categoryMeasurementFields[cat as CategoryId]
    : undefined;

  if (defs && defs.length >= 0) {
    return defs
      .map(({ key, label }) => {
        const raw = m[key];
        const value = typeof raw === "number" ? raw : 0;
        return value > 0 ? { label, value } : null;
      })
      .filter((e): e is { label: string; value: number } => e !== null);
  }

  return [
    { label: "C - Largo", value: m?.largo ?? 0 },
    { label: "B - Ancho", value: m?.ancho ?? 0 },
    { label: "A - Largo manga", value: m?.manga ?? 0 },
    { label: "D - Ancho cintura", value: m?.anchoCintura ?? 0 },
    { label: "E - Entrepierna", value: m?.entrepierna ?? 0 },
  ].filter((e) => e.value > 0);
}
