"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { CartItem, Product } from "@/shared/types/product";
import { toast } from "sonner";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: number | undefined, quantity: number) => void;
  removeItem: (id: number | undefined) => void;
  checkout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    if (product.soldOut) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const maxQty = product.stock ?? Infinity;
        if (existing.quantity >= maxQty) return prev;
        const newQty = Math.min(existing.quantity + 1, maxQty);
        if (newQty > existing.quantity) toast.success("Cantidad actualizada");
        else if (maxQty !== Infinity) toast.info("No hay más stock disponible");
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item,
        );
      }
      toast.success(`${product.name} agregado al carrito`);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: number | undefined, quantity: number) => {
    if (id == null) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const maxQty = item.stock ?? Infinity;
        const clamped = Math.max(1, Math.min(quantity, maxQty));
        return { ...item, quantity: clamped };
      }),
    );
  }, []);

  const removeItem = useCallback((id: number | undefined) => {
    if (id == null) return;
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Producto eliminado del carrito");
  }, []);

  const checkout = useCallback(() => {
    if (cartItems.length === 0) return;
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const message = `¡Hola! Me interesa realizar un pedido:\n\n${cartItems
      .map(
        (item) =>
          `• ${item.name} (Talle: ${item.size})\n  Cantidad: ${item.quantity} - $${item.price * item.quantity}`,
      )
      .join("\n\n")}\n\n*Total: $${total}*`;
    const whatsappNumber = "+541133150864";
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    toast.success("Redirigiendo a WhatsApp...");
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeItem, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
