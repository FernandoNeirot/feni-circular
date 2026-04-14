"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import {
  ShoppingCart,
  Trash2,
  Send,
  ShoppingBag,
  Sparkles,
  Package,
  Gift,
  Truck,
  Store,
} from "lucide-react";
import type { CartItem } from "@/shared/types/product";
import type { Address, ShippingOption } from "@/shared/types/shipping";
import { useCart } from "@/shared/components/cart-provider";
import { productsQueryOptions } from "@/shared/queries/productos";
import { useWhatsAppVisibility } from "@/shared/components/WhatsAppVisibilityContext";
import { AddressForm } from "@/shared/components/AddressForm";
import { ShippingOptions } from "@/shared/components/ShippingOptions";
import { whatsappNumber } from "@/shared/configs/whatsapp";
import { toast } from "sonner";

export function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [showShippingOptions, setShowShippingOptions] = useState(false);
  const [shippingMode, setShippingMode] = useState<"pickup" | "shipping" | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const { cartItems: items, removeItem, checkout } = useCart();
  const { setCartOpen } = useWhatsAppVisibility();

  useEffect(() => {
    setCartOpen(isOpen);
  }, [isOpen, setCartOpen]);

  const { data: products = [] } = useQuery(productsQueryOptions);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartIds = new Set(items.map((i) => i.id));
  const upsellProduct = products.find((p) => !cartIds.has(p.id) && !p.soldOut && p.price <= 15000);

  const handleCheckoutClick = () => {
    setShowShippingOptions(true);
  };

  const handlePickupCheckout = () => {
    checkout();
    setIsOpen(false);
    setShowShippingOptions(false);
    setShippingMode(null);
  };

  const handleShippingCheckout = () => {
    if (!address) {
      toast.error("Ingresá tu dirección");
      return;
    }

    if (!selectedShipping) {
      toast.error("Seleccioná una opción de envío");
      return;
    }

    setShippingLoading(true);

    try {
      const shippingTotal = totalPrice + selectedShipping.price;
      const homeUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_BASE_URL ?? "");

      const message = `¡Hola! Me interesa realizar un pedido con envío:\n\n${items
        .map(
          (item) =>
            `• ${item.name} (Talle: ${item.size})\n  Cantidad: ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
        )
        .join(
          "\n\n"
        )}\n\n*Subtotal: $${totalPrice.toLocaleString()}*\n*Envío (${selectedShipping.service}): $${selectedShipping.price.toFixed(2)}*\n*Total: $${shippingTotal.toFixed(2)}*\n\n📍 *Dirección de envío:*\n${address.street} ${address.number}${
        address.floor ? ` piso ${address.floor}` : ""
      }${address.apartment ? ` dpto ${address.apartment}` : ""}\n${address.city}, ${address.province} ${address.postalCode}\n\n⏱️ *Entrega estimada: ${selectedShipping.deliveryDays} día/s*\n\n_Pedido desde:_ ${homeUrl}`;

      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");

      toast.success("Redirigiendo a WhatsApp con detalles de envío...");
      setIsOpen(false);
      setShowShippingOptions(false);
      setShippingMode(null);
      setAddress(null);
      setSelectedShipping(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error procesando pedido";
      toast.error(errorMessage);
      console.error("Error:", error);
    } finally {
      setShippingLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="relative rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
          aria-label={
            totalItems > 0
              ? `Abrir carrito, ${totalItems} productos`
              : "Abrir carrito de compras"
          }
        >
          <ShoppingCart className="h-5 w-5 text-primary" aria-hidden />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs bg-accent text-accent-foreground border-0 animate-in zoom-in-50">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l-primary/20">
        <div className="p-6 pb-4 bg-linear-to-b from-primary/5 to-transparent">
          <SheetHeader>
            <SheetTitle className="text-2xl flex items-center gap-2 text-foreground">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Mi Carrito
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {totalItems === 0
                ? "Aún no agregaste productos"
                : `${totalItems} ${totalItems === 1 ? "producto" : "productos"} seleccionados`}
            </SheetDescription>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground">
                  Explorá nuestras prendas y encontrá algo especial ✨
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/productos">Ver productos</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 py-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex gap-3 p-3 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <Link
                      href={`/producto/${item.slug || item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-1 min-w-0 gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {item.condition && (
                          <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground font-medium">
                            {item.condition}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">Talle: {item.size}</span>
                          {item.brand && (
                            <>
                              <span className="text-muted-foreground/40">•</span>
                              <span className="text-xs text-muted-foreground">{item.brand}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">1 unidad</span>
                          <span className="font-bold text-primary text-sm">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive h-8 gap-1.5 px-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Eliminar</span>
                    </Button>
                  </div>
                ))}

                {upsellProduct && (
                  <Link
                    href={`/producto/${upsellProduct.slug || upsellProduct.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/20 hover:border-secondary/40 hover:bg-secondary/10 transition-colors cursor-pointer"
                  >
                    <Gift className="h-5 w-5 text-secondary shrink-0" />
                    <p className="text-xs text-muted-foreground flex-1">
                      ¡Agregá <strong className="text-foreground">{upsellProduct.name}</strong> por
                      solo <strong className="text-primary">${upsellProduct.price}</strong>!
                    </p>
                  </Link>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border/60 bg-linear-to-t from-primary/5 to-transparent p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})
                  </span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <Separator className="bg-border/60" />
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full gap-2 rounded-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                size="lg"
                onClick={handleCheckoutClick}
              >
                <Send className="h-5 w-5" />
                Pedir por WhatsApp
              </Button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3 text-secondary" />
                Coordinás el pago directamente con el vendedor
              </p>
            </div>
          </>
        )}
      </SheetContent>

      {/* Dialog para opciones de envío */}
      <Dialog open={showShippingOptions} onOpenChange={setShowShippingOptions}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">¿Cómo querés recibir tu pedido?</DialogTitle>
            <DialogDescription>Elegí entre envío a domicilio o retiro</DialogDescription>
          </DialogHeader>

          {shippingMode === null ? (
            <div className="grid grid-cols-2 gap-4 py-6">
              {/* Opción Retirar */}
              <button
                type="button"
                onClick={() => setShippingMode("pickup")}
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
                aria-label="Elegir retiro en persona"
              >
                <Store className="h-10 w-10 text-primary mb-3" />
                <span className="font-semibold text-lg">Retirar</span>
                <span className="text-xs text-muted-foreground text-center mt-2">
                  Coordinálo directamente por WhatsApp
                </span>
              </button>

              {/* Opción Envío */}
              <button
                type="button"
                onClick={() => setShippingMode("shipping")}
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all"
                aria-label="Elegir envío a domicilio"
              >
                <Truck className="h-10 w-10 text-primary mb-3" />
                <span className="font-semibold text-lg">Envío</span>
                <span className="text-xs text-muted-foreground text-center mt-2">
                  Con Correo Argentino
                </span>
              </button>
            </div>
          ) : shippingMode === "pickup" ? (
            <div className="space-y-4 py-6">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-900">
                  ✓ Te enviaremos un mensaje por WhatsApp con los detalles para coordinar el retiro
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShippingMode(null)} className="flex-1">
                  Volver
                </Button>
                <Button onClick={handlePickupCheckout} className="flex-1">
                  Continuar con WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-6">
              <AddressForm
                onAddressValidated={setAddress}
                onShippingOptionsCalculated={(opts) => {
                  setShippingOptions(opts);
                  setSelectedShipping(opts[0] || null);
                }}
                loading={shippingLoading}
              />

              {shippingOptions.length > 0 && (
                <ShippingOptions
                  options={shippingOptions}
                  onSelectOption={setSelectedShipping}
                  loading={shippingLoading}
                />
              )}

              {address && selectedShipping && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm font-semibold mb-2 text-green-900">
                    📝 Tu pedido será enviado a:
                  </p>
                  <p className="text-sm text-green-800">
                    {address.street} {address.number}
                    {address.floor ? ` piso ${address.floor}` : ""}
                    {address.apartment ? ` dpto ${address.apartment}` : ""}
                  </p>
                  <p className="text-sm text-green-800">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShippingMode(null);
                    setAddress(null);
                    setSelectedShipping(null);
                    setShippingOptions([]);
                  }}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleShippingCheckout}
                  disabled={!address || !selectedShipping || shippingLoading}
                  className="flex-1"
                >
                  {shippingLoading ? "Procesando..." : "Ir a WhatsApp con Envío"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
