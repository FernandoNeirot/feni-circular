"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { CartItem, Product } from "@/shared/types/product";
import { toast } from "sonner";

const CART_STORAGE_KEY = "feni-cart";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: number | undefined, quantity: number) => void;
  removeItem: (id: number | undefined) => void;
  checkout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCartItems(loadCartFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, isHydrated]);

  const addToCart = useCallback((product: Product) => {
    if (product.soldOut) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.info("Solo podés llevar 1 unidad de cada producto");
        return prev;
      }
      toast.success(`${product.name} agregado al carrito`);
      return [...prev, { ...product, quantity: 1, stock: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: number | undefined, quantity: number) => {
    if (id == null) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const clamped = Math.max(1, Math.min(quantity, 1));
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
    const homeUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const message = `¡Hola! Me interesa realizar un pedido:\n\n${cartItems
      .map(
        (item) =>
          `• ${item.name} (Talle: ${item.size})\n  Cantidad: ${item.quantity} - $${item.price * item.quantity}`,
      )
      .join("\n\n")}\n\n*Total: $${total}*\n\n_Pedido desde:_ ${homeUrl}`;
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
