import { z } from "zod";

const slugRegex = /^[a-zA-Z0-9-]*$/;

export const productFormSchemaBase = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  slug: z
    .string()
    .max(120)
    .optional()
    .refine((v) => !v || slugRegex.test(v), "Solo letras, números y guiones"),
  slugSuffix: z.string().max(60).optional(),
  price: z.string().min(1, "El precio es obligatorio").refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Precio inválido"),
  originalPrice: z
    .string()
    .optional()
    .refine(
      (v) => !v?.trim() || (!Number.isNaN(Number(v)) && Number(v) >= 0),
      "Precio original inválido"
    ),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().optional(),
  saleDate: z.string().optional(),
  isConsigned: z.boolean().default(false),
  boughtFrom: z.string().optional(),
  soldTo: z.string().optional(),
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

export const productFormSchema = productFormSchemaBase.superRefine((data, ctx) => {
  if (data.soldOut) {
    const saleDateRaw = data.saleDate?.trim() ?? "";
    if (!saleDateRaw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "La fecha de venta es obligatoria cuando el producto está marcado como vendido",
        path: ["saleDate"],
      });
    }
  }

  // Origen: comprado / consignado
  const boughtFromRaw = data.boughtFrom?.trim() ?? "";
  if (!boughtFromRaw) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${data.isConsigned ? "Consignado de" : "Comprado a"} es obligatorio`,
      path: ["boughtFrom"],
    });
  }

  const purchasePriceRaw = data.purchasePrice?.trim() ?? "";
  if (!purchasePriceRaw) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${data.isConsigned ? "Precio de consignación" : "Precio de compra"} es obligatorio`,
      path: ["purchasePrice"],
    });
  } else {
    const purchase = Number(purchasePriceRaw);
    if (Number.isNaN(purchase) || purchase < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Precio inválido",
        path: ["purchasePrice"],
      });
    }
  }

  const purchaseDateRaw = data.purchaseDate?.trim() ?? "";
  if (!purchaseDateRaw) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${data.isConsigned ? "Fecha de consignación" : "Fecha de compra"} es obligatoria`,
      path: ["purchaseDate"],
    });
  }

  const sale = Number(data.price);
  if (Number.isNaN(sale)) return;
  const raw = data.originalPrice?.trim() ?? "";
  if (!raw) return;
  const original = Number(raw);
  if (Number.isNaN(original)) return;
  if (original <= sale) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El precio original debe ser mayor al precio de venta",
      path: ["originalPrice"],
    });
  }
});

export type ProductFormValues = z.infer<typeof productFormSchemaBase>;

export const defaultProductFormValues: ProductFormValues = {
  name: "",
  slug: "",
  slugSuffix: "",
  price: "",
  originalPrice: "",
  purchasePrice: "",
  purchaseDate: "",
  saleDate: "",
  isConsigned: false,
  boughtFrom: "",
  soldTo: "",
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
