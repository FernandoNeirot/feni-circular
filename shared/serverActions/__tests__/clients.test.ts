import {
  createClient,
  updateClient,
  deleteClient,
  getClient,
  getAllClients,
} from "../clients";
import type { Client } from "@/shared/types/client";

const mockClientData: Omit<Client, "id"> = {
  name: "Juan Pérez",
  phone: "+54 11 1234-5678",
  address: "Calle Falsa 123",
};

const BASE = typeof window !== "undefined" ? "" : "http://localhost:3000";

function mockFetch(
  response: unknown,
  options?: { ok?: boolean; status?: number }
) {
  return jest.fn().mockResolvedValue({
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: () => Promise.resolve(response),
  });
}

describe("clients server actions", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv, NEXT_PUBLIC_BASE_URL: BASE };
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  describe("createClient", () => {
    it("returns success and client when API returns 200 and client", async () => {
      const client: Client = { id: "doc-1", ...mockClientData };
      global.fetch = mockFetch({ success: true, client }) as typeof fetch;

      const result = await createClient(mockClientData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.client.id).toBe("doc-1");
        expect(result.client.name).toBe(mockClientData.name);
      }
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clients"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockClientData),
        })
      );
    });

    it("returns error when API returns not ok", async () => {
      global.fetch = mockFetch(
        { success: false, error: "Error al crear cliente" },
        { ok: false }
      ) as typeof fetch;

      const result = await createClient(mockClientData);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });
  });

  describe("updateClient", () => {
    it("returns success when API returns 200 and success true", async () => {
      global.fetch = mockFetch({ success: true }) as typeof fetch;

      const result = await updateClient("doc-1", mockClientData);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clients/doc-1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(mockClientData),
        })
      );
    });

    it("returns error when API returns not ok", async () => {
      global.fetch = mockFetch(
        { error: "Error al actualizar cliente" },
        { ok: false }
      ) as typeof fetch;

      const result = await updateClient("doc-1", mockClientData);

      expect(result.success).toBe(false);
    });
  });

  describe("getClient", () => {
    it("returns client when API returns 200 with client", async () => {
      const client: Client = { id: "doc-1", ...mockClientData };
      global.fetch = mockFetch(client) as typeof fetch;

      const result = await getClient("doc-1");

      expect(result).toEqual(client);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/clients/doc-1"));
    });

    it("returns null when API returns 404", async () => {
      global.fetch = mockFetch({}, { ok: false }) as typeof fetch;

      const result = await getClient("doc-1");

      expect(result).toBeNull();
    });

    it("returns null when response has no id", async () => {
      global.fetch = mockFetch({ name: "X" }) as typeof fetch;

      const result = await getClient("doc-1");

      expect(result).toBeNull();
    });
  });

  describe("getAllClients", () => {
    it("returns array when API returns array", async () => {
      const list: Client[] = [{ id: "1", ...mockClientData }];
      global.fetch = mockFetch(list) as typeof fetch;

      const result = await getAllClients();

      expect(result).toEqual(list);
    });

    it("returns null when API returns not ok", async () => {
      global.fetch = mockFetch({}, { ok: false }) as typeof fetch;

      const result = await getAllClients();

      expect(result).toBeNull();
    });
  });

  describe("deleteClient", () => {
    it("returns success when API returns 200", async () => {
      global.fetch = mockFetch({ success: true }) as typeof fetch;

      const result = await deleteClient("doc-1");

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clients/doc-1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("returns error when API returns not ok", async () => {
      global.fetch = mockFetch(
        { error: "Error al eliminar" },
        { ok: false }
      ) as typeof fetch;

      const result = await deleteClient("doc-1");

      expect(result.success).toBe(false);
    });
  });
});
