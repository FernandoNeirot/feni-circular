jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import {
  createProductWithData,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductoLinks,
  updateProductoLinks,
  syncProductoPublicLinks,
} from "../productos";
import type { Product } from "@/shared/types/product";

const mockProduct: Product = {
  name: "Test Product",
  price: 1000,
  category: "Remeras",
  size: "M",
  brand: "Test",
  condition: "Como nuevo",
  description: "",
  color: "",
  ageRange: "3-6 años",
  gender: "unisex",
  images: ["/img.jpg"],
  image: "/img.jpg",
  measurements: { largo: 50, ancho: 40 },
  isConsigned: false,
  boughtFrom: "",
  soldTo: "",
};

// En entorno Jest (jsdom) window está definido, así que getApiBase() devuelve "" (URL relativa)
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

describe("productos server actions", () => {
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

  describe("createProductWithData", () => {
    it("returns success and product when API returns 200 and product", async () => {
      const productWithId = { ...mockProduct, id: "doc-123" };
      global.fetch = mockFetch({
        success: true,
        product: productWithId,
      }) as typeof fetch;

      const result = await createProductWithData(mockProduct);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.product.id).toBe("doc-123");
        expect(result.product.name).toBe(mockProduct.name);
      }
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/productos"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockProduct),
        })
      );
    });

    it("returns error when API returns not ok", async () => {
      global.fetch = mockFetch(
        { success: false, error: "Error al crear producto" },
        { ok: false, status: 500 }
      ) as typeof fetch;

      const result = await createProductWithData(mockProduct);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });

    it("returns error when response has no product", async () => {
      global.fetch = mockFetch({ success: true }) as typeof fetch;

      const result = await createProductWithData(mockProduct);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });

    it("returns error on fetch throw", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      const result = await createProductWithData(mockProduct);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toContain("Network");
    });
  });

  describe("updateProduct", () => {
    it("returns success when API returns 200 and success true", async () => {
      global.fetch = mockFetch({
        success: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-02T00:00:00.000Z",
      }) as typeof fetch;

      const result = await updateProduct("doc-123", mockProduct);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.createdAt).toBe("2025-01-01T00:00:00.000Z");
        expect(result.updatedAt).toBe("2025-01-02T00:00:00.000Z");
      }
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/productos/doc-123"),
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mockProduct),
        })
      );
    });

    it("returns error when API returns not ok", async () => {
      global.fetch = mockFetch(
        { error: "Error al actualizar" },
        { ok: false }
      ) as typeof fetch;

      const result = await updateProduct("doc-123", mockProduct);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });
  });

  describe("getAllProducts", () => {
    it("returns array when API returns array", async () => {
      const list = [{ ...mockProduct, id: "1" }];
      global.fetch = mockFetch(list) as typeof fetch;

      const result = await getAllProducts();

      expect(result).toEqual(list);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/productos"),
        expect.objectContaining({ next: { revalidate: 3600 } })
      );
    });

    it("returns null when API returns not ok", async () => {
      global.fetch = mockFetch({}, { ok: false }) as typeof fetch;

      const result = await getAllProducts();

      expect(result).toBeNull();
    });

    it("returns null when response is not array", async () => {
      global.fetch = mockFetch({ data: [] }) as typeof fetch;

      const result = await getAllProducts();

      expect(result).toBeNull();
    });
  });

  describe("getProductoLinks", () => {
    it("returns string array and uses 24h revalidate", async () => {
      const links = ["/foo", "bar"];
      global.fetch = mockFetch(links) as typeof fetch;

      const result = await getProductoLinks();

      expect(result).toEqual(links);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/productos/links"),
        expect.objectContaining({ next: { revalidate: 24 * 60 * 60 } })
      );
    });

    it("returns null when API returns not ok", async () => {
      global.fetch = mockFetch({}, { ok: false }) as typeof fetch;

      expect(await getProductoLinks()).toBeNull();
    });

    it("returns null when response is not string array", async () => {
      global.fetch = mockFetch([1, 2]) as typeof fetch;

      expect(await getProductoLinks()).toBeNull();
    });
  });

  describe("updateProductoLinks", () => {
    it("PUTs links and returns success", async () => {
      global.fetch = mockFetch({ success: true }) as typeof fetch;

      const result = await updateProductoLinks(["a", "b"]);

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/productos/links"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ links: ["a", "b"] }),
        })
      );
    });

    it("returns error when API fails", async () => {
      global.fetch = mockFetch({ success: false }, { ok: false }) as typeof fetch;

      const result = await updateProductoLinks([]);

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });
  });

  describe("syncProductoPublicLinks", () => {
    it("merges from GET then PUTs", async () => {
      const fn = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(["old"]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        });
      global.fetch = fn as typeof fetch;

      const result = await syncProductoPublicLinks({
        slug: "new",
        soldOut: false,
        previousSlug: "old",
      });

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn.mock.calls[1]![1]).toEqual(
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ links: ["new"] }),
        })
      );
    });
  });

  describe("deleteProduct", () => {
    it("returns success when API returns 200", async () => {
      global.fetch = mockFetch({ success: true }) as typeof fetch;

      const result = await deleteProduct("doc-123");

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/productos/doc-123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("returns error when API returns not ok", async () => {
      global.fetch = mockFetch(
        { error: "Error al eliminar" },
        { ok: false }
      ) as typeof fetch;

      const result = await deleteProduct("doc-123");

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error).toBeTruthy();
    });
  });
});
