import { NextRequest, NextResponse } from "next/server";
import { callCorreoArgentinoAPI } from "@/shared/configs/correo-argentino";
import type { CreateShipmentRequest, CreateShipmentResponse } from "@/shared/types/shipping";

interface CorreoArgentinoCreateShipmentResponse {
  numeroEnvio: string;
  codigoSegimiento: string;
  etiqueta: string;
  urlSeguimiento: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateShipmentRequest;

    // Validar campos requeridos
    if (
      !body.recipient?.name ||
      !body.recipient?.email ||
      !body.recipient?.phone ||
      !body.recipient?.address ||
      !body.content?.description ||
      !body.content?.weight ||
      !body.service
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos en recipient, content o service" },
        { status: 400 }
      );
    }

    // Validar dirección del destinatario
    const address = body.recipient.address;
    if (
      !address.street ||
      !address.number ||
      !address.city ||
      !address.province ||
      !address.postalCode
    ) {
      return NextResponse.json({ error: "Dirección del destinatario incompleta" }, { status: 400 });
    }

    // Llamar a la API del Correo Argentino
    const response = await callCorreoArgentinoAPI<CorreoArgentinoCreateShipmentResponse>(
      "/envios/crear",
      "POST",
      {
        destinatario: {
          nombre: body.recipient.name,
          email: body.recipient.email,
          telefono: body.recipient.phone,
          direccion: {
            calle: address.street,
            numero: address.number,
            piso: address.floor,
            departamento: address.apartment,
            localidad: address.city,
            provincia: address.province,
            codigoPostal: address.postalCode,
            referencia: address.reference,
          },
        },
        contenido: {
          descripcion: body.content.description,
          peso: body.content.weight,
          valor: body.content.value,
        },
        servicio: body.service,
        referencia: body.reference,
      }
    );

    const result: CreateShipmentResponse = {
      shipmentNumber: response.numeroEnvio,
      trackingCode: response.codigoSegimiento,
      label: response.etiqueta,
      trackingUrl: response.urlSeguimiento,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/shipping/create-shipment]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al crear envío",
      },
      { status: 500 }
    );
  }
}
