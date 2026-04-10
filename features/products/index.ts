/**
 * Feature: Products
 * Catálogo, listado, detalle y queries de productos.
 */
export {
  productsQueryKey,
  productsQueryOptions,
  fetchProducts,
  adminProductsQueryKey,
  adminProductsQueryOptions,
  fetchAdminProducts,
} from "@/shared/queries/productos";
export { ProductCard } from "@/shared/components/ProductCard";
export { ProductGrid } from "@/shared/components/ProductGrid";
