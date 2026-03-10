"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { CartItem, Product } from "@/shared/types/product";
import { toast } from "sonner";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
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
        toast.success("Cantidad actualizada");
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      toast.success(`${product.name} agregado al carrito`);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
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
    const whatsappNumber = "+5491139009696";
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
