"use client";

import { useState } from "react";
import { useCart } from "@/shared/components/cart-provider";
import { AddressForm } from "@/shared/components/AddressForm";
import { ShippingOptions } from "@/shared/components/ShippingOptions";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import type { Address, ShippingOption } from "@/shared/types/shipping";
import { whatsappNumber } from "@/shared/configs/whatsapp";

/**
 * EJEMPLO: Cómo integrar Address Form y Shipping Options en tu checkout
 * Este archivo muestra cómo conectar todo antes de ir a WhatsApp
 */

export function CheckoutWithShipping() {
  const { cartItems, checkout } = useCart();
  const [address, setAddress] = useState<Address | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddressValidated = (validatedAddress: Address) => {
    setAddress(validatedAddress);
  };

  const handleShippingCalculated = (options: ShippingOption[]) => {
    setShippingOptions(options);
  };

  const handleShippingSelected = (option: ShippingOption) => {
    setSelectedShipping(option);
  };

  const handleCheckoutWithShipping = async () => {
    if (!address) {
      toast.error("Ingresá tu dirección");
      return;
    }

    if (!selectedShipping) {
      toast.error("Seleccioná una opción de envío");
      return;
    }

    setLoading(true);

    try {
      // Aquí puedes:
      // 1. Crear el envío en Correo Argentino (opcional)
      // 2. Guardar los datos de envío en tu base de datos
      // 3. Enviar a WhatsApp con la información de envío incluida

      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const shippingTotal = total + selectedShipping.price;

      const homeUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_BASE_URL ?? "");

      const message = `¡Hola! Me interesa realizar un pedido con envío:\n\n${cartItems
        .map(
          (item) =>
            `• ${item.name} (Talle: ${item.size})\n  Cantidad: ${item.quantity} - $${item.price * item.quantity}`
        )
        .join(
          "\n\n"
        )}\n\n*Subtotal: $${total}*\n*Envío (${selectedShipping.service}): $${selectedShipping.price.toFixed(2)}*\n*Total: $${shippingTotal.toFixed(2)}*\n\n📍 *Dirección de envío:*\n${address.street} ${address.number}${
        address.floor ? ` piso ${address.floor}` : ""
      }${address.apartment ? ` dpto ${address.apartment}` : ""}\n${address.city}, ${address.province} ${address.postalCode}\n\n⏱️ *Entrega estimada: ${selectedShipping.deliveryDays} día/s*\n\n_Pedido desde:_ ${homeUrl}`;

      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");

      toast.success("Redirigiendo a WhatsApp con detalles de envío...");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error procesando pedido";
      toast.error(message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600">
          {cartItems.length} producto{cartItems.length !== 1 ? "s" : ""} en el carrito
        </p>
      </div>

      {/* Resumen del carrito */}
      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Resumen del Pedido</h2>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 font-semibold">
          Subtotal: $
          {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
        </div>
      </div>

      {/* Formulario de dirección */}
      <AddressForm
        onAddressValidated={handleAddressValidated}
        onShippingOptionsCalculated={handleShippingCalculated}
        loading={loading}
      />

      {/* Opciones de envío */}
      {shippingOptions.length > 0 && (
        <ShippingOptions
          options={shippingOptions}
          onSelectOption={handleShippingSelected}
          loading={loading}
        />
      )}

      {/* Botón para ir a WhatsApp */}
      {address && selectedShipping && (
        <div className="border-t pt-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-semibold mb-2">📝 Resumen Final:</p>
            <p>
              Dirección: {address.street} {address.number}, {address.city}
            </p>
            <p>
              Envío: {selectedShipping.service} - ${selectedShipping.price.toFixed(2)}
            </p>
            <p className="font-semibold mt-2">
              Total a pagar: $
              {(
                cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
                selectedShipping.price
              ).toFixed(2)}
            </p>
          </div>

          <Button
            onClick={handleCheckoutWithShipping}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Procesando..." : "✓ Ir a WhatsApp para confirmar"}
          </Button>

          {/* O usar el checkout directo sin envío */}
          <hr className="my-4" />
          <Button
            onClick={() => checkout()}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Ir a WhatsApp (sin especificar envío)
          </Button>
        </div>
      )}
    </div>
  );
}
