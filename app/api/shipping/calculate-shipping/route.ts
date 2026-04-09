import { NextRequest, NextResponse } from "next/server";
import { callCorreoArgentinoAPI } from "@/shared/configs/correo-argentino";
import type { CalculateShippingRequest, ShippingOption } from "@/shared/types/shipping";

interface CorreoArgentinoShippingResponse {
  tarifas: Array<{
    servicio: string;
    tarifa: number;
    plazoEntrega: number;
    descripcion: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CalculateShippingRequest;

    // Validar campos requeridos
    if (!body.postalCodeOrigin || !body.postalCodeDestination || !body.weight || !body.service) {
      return NextResponse.json(
        {
          error:
            "Faltan campos requeridos: postalCodeOrigin, postalCodeDestination, weight, service",
        },
        { status: 400 }
      );
    }

    // Validar que el peso sea positivo
    if (body.weight <= 0) {
      return NextResponse.json({ error: "El peso debe ser mayor a 0" }, { status: 400 });
    }

    // Llamar a la API del Correo Argentino
    const response = await callCorreoArgentinoAPI<CorreoArgentinoShippingResponse>(
      "/precios/calcular",
      "POST",
      {
        codePostalOrigin: body.postalCodeOrigin,
        codePostalDestination: body.postalCodeDestination,
        peso: body.weight,
        servicio: body.service,
      }
    );

    // Transformar respuesta
    const shippingOptions: ShippingOption[] = (response.tarifas || []).map((tarifa) => ({
      service: tarifa.servicio as any,
      price: tarifa.tarifa,
      deliveryDays: tarifa.plazoEntrega,
      description: tarifa.descripcion,
    }));

    return NextResponse.json({
      options: shippingOptions,
      estimatedDelivery: shippingOptions[0]?.deliveryDays || 0,
    });
  } catch (error) {
    console.error("[POST /api/shipping/calculate-shipping]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al calcular envío",
      },
      { status: 500 }
    );
  }
}
