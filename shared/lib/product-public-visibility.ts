import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import type { Product } from "@/shared/types/product";
import { normalizeReportDateKey } from "@/shared/lib/report-dates";

const SALE_COOLDOWN_CALENDAR_DAYS = 10;

/**
 * Ocultar en el sitio público si hay fecha de venta y pasaron ≥10 días calendario desde esa fecha.
 * Sin `saleDate` no se oculta por esta regla.
 */
export function isProductHiddenFromPublicAfterSaleCooldown(
  product: Product,
  now: Date = new Date()
): boolean {
  const key = normalizeReportDateKey(product.saleDate);
  if (!key) return false;
  const saleDay = parseISO(`${key}T12:00:00.000Z`);
  if (!isValid(saleDay)) return false;
  return differenceInCalendarDays(now, saleDay) >= SALE_COOLDOWN_CALENDAR_DAYS;
}

export function filterProductsForPublicCatalog<T extends Product>(
  products: T[],
  now: Date = new Date()
): T[] {
  return products.filter((p) => !isProductHiddenFromPublicAfterSaleCooldown(p, now));
}
