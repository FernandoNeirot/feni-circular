import type { Client } from "@/shared/types/client";

export const clientsQueryKey = ["clients"] as const;

const STALE_TIME_24H = 24 * 60 * 60 * 1000;

function getClientsApiUrl(): string {
  if (typeof window !== "undefined") return "/api/clients";
  return `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/clients`;
}

export async function fetchClients(): Promise<Client[]> {
  const res = await fetch(getClientsApiUrl());
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? (data as Client[]) : [];
}

export const clientsQueryOptions = {
  queryKey: clientsQueryKey,
  queryFn: fetchClients,
  staleTime: STALE_TIME_24H,
} as const;

