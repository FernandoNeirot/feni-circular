import type { Product } from "@/shared/types/product";
import type { ProductFormValues } from "@/features/admin";
import { emptyMeasurements } from "./constants";

export function buildProductFromForm(
  data: ProductFormValues,
  imageUrls: string[],
  slugOverride?: string
): Product {
  const slug = (slugOverride ?? data.slug?.trim()) || undefined;
  const measurements = {
    ...emptyMeasurements,
    largo: Number(data.largo) || 0,
    ancho: Number(data.ancho) || 0,
    manga: data.manga ? Number(data.manga) : undefined,
    anchoCintura: data.anchoCintura ? Number(data.anchoCintura) : undefined,
    entrepierna: data.entrepierna ? Number(data.entrepierna) : undefined,
  };
  const images = imageUrls.length > 0 ? imageUrls : ["/images/placeholder.jpg"];
  const image = images[0]!;
  return {
    name: data.name.trim(),
    slug,
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    category: data.category,
    size: data.size,
    brand: data.brand,
    condition: data.condition,
    conditionDetail: data.conditionDetail?.trim() || undefined,
    description: data.description?.trim() ?? "",
    color: data.color?.trim() ?? "",
    ageRange: data.ageRange?.trim() ?? "",
    gender: data.gender,
    material: data.material?.trim() || undefined,
    usageCount: data.usageCount?.trim() || undefined,
    soldOut: data.soldOut,
    featured: data.featured,
    trending: data.trending,
    image,
    images,
    measurements,
  };
}
