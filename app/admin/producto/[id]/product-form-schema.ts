import { z } from "zod";

const slugRegex = /^[a-zA-Z0-9-]*$/;

export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .max(120)
    .refine((v) => slugRegex.test(v), "Solo letras, números y guiones"),
  price: z.string().min(1, "El precio es obligatorio").refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Precio inválido"),
  originalPrice: z.string().optional(),
  category: z.string().min(1, "Seleccioná una categoría"),
  size: z.string().min(1, "El talle es obligatorio").max(20),
  brand: z.string().min(1, "La marca es obligatoria").max(50),
  condition: z.string().min(1, "Seleccioná el estado"),
  conditionDetail: z.string().max(300).optional(),
  description: z.string().max(500).optional(),
  color: z.string().max(30).optional(),
  ageRange: z.string().optional(),
  gender: z.enum(["niña", "niño", "unisex"]),
  material: z.string().max(50).optional(),
  usageCount: z.string().max(30).optional(),
  soldOut: z.boolean(),
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
  price: "",
  originalPrice: "",
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
  images: [],
  largo: "",
  ancho: "",
  manga: "",
  anchoCintura: "",
  entrepierna: "",
};

export function normalizeSlug(value: string): string {
  return value.replace(/[^a-zA-Z0-9-]/g, "");
}
