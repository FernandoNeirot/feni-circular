"use server";

import type { Client } from "@/shared/types/client";

function getApiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export type CreateClientResult =
  | { success: true; client: Client }
  | { success: false; error: string };

export async function createClient(data: Omit<Client, "id">): Promise<CreateClientResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as {
      success?: boolean;
      client?: Client;
      error?: string;
    };
    if (!res.ok || json.success !== true || !json.client) {
      return { success: false, error: json.error ?? "Error al crear cliente" };
    }
    return { success: true, client: json.client };
  } catch (err) {
    console.error("[createClient]", err);
    return { success: false, error: err instanceof Error ? err.message : "Error al crear cliente" };
  }
}

export type UpdateClientResult = { success: true } | { success: false; error: string };

export async function updateClient(
  clientId: string,
  data: Omit<Client, "id">
): Promise<UpdateClientResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok || json.success !== true) {
      return { success: false, error: json.error ?? "Error al actualizar cliente" };
    }
    return { success: true };
  } catch (err) {
    console.error("[updateClient]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al actualizar cliente",
    };
  }
}

export async function getClient(clientId: string): Promise<Client | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/clients/${clientId}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Client;
    return data?.id ? data : null;
  } catch (err) {
    console.error("[getClient]", err);
    return null;
  }
}

export async function getAllClients(): Promise<Client[] | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/clients`, {
      next: { revalidate: 24 * 60 * 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as Client[]) : null;
  } catch (err) {
    console.error("[getAllClients]", err);
    return null;
  }
}

export type DeleteClientResult = { success: true } | { success: false; error: string };

export async function deleteClient(clientId: string): Promise<DeleteClientResult> {
  try {
    const res = await fetch(`${getApiBase()}/api/clients/${clientId}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok) {
      return { success: false, error: data.error ?? "Error al eliminar" };
    }
    return { success: true };
  } catch (err) {
    console.error("[deleteClient]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al eliminar el cliente",
    };
  }
}
