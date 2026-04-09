/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useCart } from "@/shared/components/cart-provider";
import { toast } from "sonner";
import type { Product } from "@/shared/types/product";

/**
 * Hook para validar el carrito y eliminar productos que ya no están disponibles
 * Útil para ejecutar en la carga de páginas o cuando se enfoca la ventana
 */
export function useValidateCart() {
  const { cartItems, removeItem } = useCart();

  const validateCart = async () => {
    if (cartItems.length === 0) return;

    try {
      const response = await fetch("/api/productos");
      if (!response.ok) return;

      const allProducts: Product[] = await response.json();
      const validProducts = new Set<number>();
      const invalidIds: (number | undefined)[] = [];
      const invalidNames: string[] = [];

      // Crear un mapa de productos válidos
      allProducts.forEach((product) => {
        if (product.id && !product.soldOut) {
          validProducts.add(product.id);
        }
      });

      // Identificar productos inválidos
      cartItems.forEach((item) => {
        if (item.id == null || !validProducts.has(item.id)) {
          invalidIds.push(item.id);
          invalidNames.push(item.name);
        }
      });

      // Remover productos inválidos si los hay
      if (invalidIds.length > 0) {
        invalidIds.forEach((id) => {
          if (id != null) {
            removeItem(id);
          }
        });
        const names = invalidNames.join(", ");
        toast.warning(`Removido del carrito: ${names} (no disponible o ya vendido)`);
      }
    } catch (error) {
      console.error("Error validando carrito:", error);
    }
  };

  useEffect(() => {
    // Validar cuando se carga el componente
    validateCart();

    // Validar cuando el usuario vuelve a la ventana
    const handleFocus = () => validateCart();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [cartItems, removeItem]);
}
