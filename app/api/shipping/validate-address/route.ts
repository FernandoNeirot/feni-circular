import { NextRequest, NextResponse } from "next/server";
import { callCorreoArgentinoAPI } from "@/shared/configs/correo-argentino";
import type { ValidateAddressRequest, ValidateAddressResponse } from "@/shared/types/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateAddressRequest;

    // Validar que los campos requeridos estén presentes
    if (!body.street || !body.number || !body.city || !body.province || !body.postalCode) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en la dirección" },
        { status: 400 }
      );
    }

    // Llamar a la API del Correo Argentino
    const response = await callCorreoArgentinoAPI<ValidateAddressResponse>(
      "/direcciones/validar",
      "POST",
      {
        calle: body.street,
        numero: body.number,
        piso: body.floor,
        departamento: body.apartment,
        localidad: body.city,
        provincia: body.province,
        codigoPostal: body.postalCode,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[POST /api/shipping/validate-address]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al validar dirección",
      },
      { status: 500 }
    );
  }
}
