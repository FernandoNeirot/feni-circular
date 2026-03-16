import { z } from "zod";

const slugRegex = /^[a-zA-Z0-9-]*$/;

export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  slug: z
    .string()
    .max(120)
    .optional()
    .refine((v) => !v || slugRegex.test(v), "Solo letras, números y guiones"),
  slugSuffix: z.string().max(60).optional(),
  price: z.string().min(1, "El precio es obligatorio").refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Precio inválido"),
  originalPrice: z.string().optional(),
  purchasePrice: z.string().optional(),
  category: z.string().min(1, "Seleccioná una categoría"),
  size: z.string().min(1, "El talle es obligatorio").max(20),
  brand: z.string().min(1, "La marca es obligatoria").max(50),
  condition: z.string().min(1, "Seleccioná el estado"),
  conditionDetail: z.string().max(300).optional(),
  description: z.string().max(500).optional(),
  color: z.string().max(30).optional(),
  ageRange: z.string().min(1, "Seleccioná un rango de edad"),
  gender: z.enum(["niña", "niño", "unisex"], {
    errorMap: () => ({ message: "Seleccioná un género" }),
  }),
  material: z.string().max(50).optional(),
  usageCount: z.string().max(30).optional(),
  soldOut: z.boolean(),
  featured: z.boolean(),
  trending: z.boolean(),
  images: z.array(z.union([z.string(), z.instanceof(File)])).max(3).default([]),
  largo: z.string().optional(),
  ancho: z.string().optional(),
  manga: z.string().optional(),
  anchoCintura: z.string().optional(),
  entrepierna: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const defaultProductFormValues: ProductFormValues = {
  name: "",
  slug: "",
  slugSuffix: "",
  price: "",
  originalPrice: "",
  purchasePrice: "",
  category: "",
  size: "",
  brand: "",
  condition: "",
  conditionDetail: "",
  description: "",
  color: "",
  ageRange: "",
  gender: "unisex",
  material: "",
  usageCount: "",
  soldOut: false,
  featured: false,
  trending: false,
  images: [],
  largo: "",
  ancho: "",
  manga: "",
  anchoCintura: "",
  entrepierna: "",
};

/**
 * Normaliza un texto para usarlo como URL/slug:
 * - Espacios → guiones
 * - Quita acentos (campeón → campeon)
 * - Solo deja letras, números y guiones
 * - Minúsculas, sin guiones repetidos ni al inicio/final
 */
export function normalizeSlug(value: string): string {
  if (!value || typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos/diacríticos
    .replace(/\s+/g, "-") // espacios → guión
    .replace(/[^a-z0-9-]/g, "") // solo letras, números y guiones
    .replace(/-+/g, "-") // colapsar guiones repetidos
    .replace(/^-+|-+$/g, ""); // quitar guiones al inicio/final
}
