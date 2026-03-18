/**
 * Integration tests for /api/productos (GET, POST).
 * Mocks Firebase Admin Firestore so no real DB is needed.
 */
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

function createMockDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    exists: true,
    data: () => data,
  };
}

const mockGet = jest.fn();
const mockAdd = jest.fn();
const mockCollection = jest.fn().mockImplementation((name: string) => {
  if (name === "feni-circular-products") {
    return { get: mockGet, add: mockAdd };
  }
  return { get: mockGet, add: mockAdd };
});
const mockDb = { collection: mockCollection };

jest.mock("@/shared/configs/firebase-admin", () => ({
  getAdminFirestore: jest.fn(() => mockDb),
  getAdminStorage: jest.fn(),
  initializeAdminApp: jest.fn(),
}));

import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { GET, POST } from "../route";

describe("GET /api/productos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and array of products when Firestore returns docs", async () => {
    const docs = [
      createMockDoc("doc-1", { ...mockProduct, name: "Product 1" }),
      createMockDoc("doc-2", { ...mockProduct, name: "Product 2" }),
    ];
    mockGet.mockResolvedValue({ docs, empty: false });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ id: "doc-1", name: "Product 1" });
    expect(data[1]).toMatchObject({ id: "doc-2", name: "Product 2" });
    expect(getAdminFirestore).toHaveBeenCalled();
    expect(mockCollection).toHaveBeenCalledWith("feni-circular-products");
  });

  it("returns 200 and empty array when no docs", async () => {
    mockGet.mockResolvedValue({ docs: [], empty: true });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("returns 500 when Firestore throws", async () => {
    mockGet.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBeTruthy();
  });
});

describe("POST /api/productos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and product with id when Firestore add succeeds", async () => {
    mockAdd.mockResolvedValue({ id: "new-doc-id" });

    const req = new Request("http://localhost/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockProduct),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe("new-doc-id");
    expect(data.product).toMatchObject({ id: "new-doc-id", name: mockProduct.name });
    expect(mockAdd).toHaveBeenCalledWith(mockProduct);
  });

  it("returns 500 when Firestore add throws", async () => {
    mockAdd.mockRejectedValue(new Error("Write failed"));

    const req = new Request("http://localhost/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockProduct),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeTruthy();
  });
});
