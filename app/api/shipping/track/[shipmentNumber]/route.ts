import { NextRequest, NextResponse } from "next/server";
import { callCorreoArgentinoAPI } from "@/shared/configs/correo-argentino";
import type { TrackingStatus } from "@/shared/types/shipping";

interface CorreoArgentinoTrackingResponse {
  estado: string;
  ubicacion: string;
  fechaActualizacion: string;
  detalles: Array<{
    fecha: string;
    estado: string;
    ubicacion: string;
    descripcion: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shipmentNumber: string }> }
) {
  try {
    const { shipmentNumber } = await params;

    if (!shipmentNumber) {
      return NextResponse.json({ error: "Número de envío requerido" }, { status: 400 });
    }

    // Llamar a la API del Correo Argentino
    const response = await callCorreoArgentinoAPI<CorreoArgentinoTrackingResponse>(
      `/envios/track/${shipmentNumber}`,
      "GET"
    );

    const trackingStatus: TrackingStatus = {
      status: mapStatus(response.estado),
      location: response.ubicacion,
      lastUpdate: new Date(response.fechaActualizacion),
      details: (response.detalles || []).map((detail) => ({
        date: new Date(detail.fecha),
        status: detail.estado,
        location: detail.ubicacion,
        description: detail.descripcion,
      })),
    };

    return NextResponse.json(trackingStatus);
  } catch (error) {
    console.error("[GET /api/shipping/track/[shipmentNumber]]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener seguimiento",
      },
      { status: 500 }
    );
  }
}

function mapStatus(
  correoStatus: string
): "pendiente" | "en_transito" | "entregado" | "devuelto" | "error" {
  const statusMap: Record<string, ReturnType<typeof mapStatus>> = {
    pendiente: "pendiente",
    "en transito": "en_transito",
    "en tránsito": "en_transito",
    entregado: "entregado",
    devuelto: "devuelto",
    error: "error",
  };

  return statusMap[correoStatus.toLowerCase()] || "en_transito";
}
