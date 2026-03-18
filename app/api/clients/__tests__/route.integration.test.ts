/**
 * Integration tests for /api/clients (GET, POST).
 * Mocks Firebase Admin Firestore.
 */
import type { Client } from "@/shared/types/client";

const mockClientData: Omit<Client, "id"> = {
  name: "Juan Pérez",
  phone: "+54 11 1234-5678",
  address: "Calle Falsa 123",
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
const mockCollection = jest.fn().mockImplementation(() => ({
  get: mockGet,
  add: mockAdd,
}));
const mockDb = { collection: mockCollection };

jest.mock("@/shared/configs/firebase-admin", () => ({
  getAdminFirestore: jest.fn(() => mockDb),
  getAdminStorage: jest.fn(),
  initializeAdminApp: jest.fn(),
}));

import { getAdminFirestore } from "@/shared/configs/firebase-admin";
import { GET, POST } from "../route";

describe("GET /api/clients", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and array of clients when Firestore returns docs", async () => {
    const docs = [
      createMockDoc("doc-1", { ...mockClientData, id: "doc-1" }),
      createMockDoc("doc-2", { name: "María", phone: "", address: "", id: "doc-2" }),
    ];
    mockGet.mockResolvedValue({ docs, empty: false });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ id: "doc-1", name: "Juan Pérez" });
    expect(getAdminFirestore).toHaveBeenCalled();
    expect(mockCollection).toHaveBeenCalledWith("feni-circular-clients");
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

describe("POST /api/clients", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and client with id when Firestore add succeeds", async () => {
    mockAdd.mockResolvedValue({ id: "new-client-id" });

    const req = new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockClientData),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.id).toBe("new-client-id");
    expect(data.client).toMatchObject({ id: "new-client-id", name: mockClientData.name });
    expect(mockAdd).toHaveBeenCalledWith(mockClientData);
  });

  it("returns 500 when Firestore add throws", async () => {
    mockAdd.mockRejectedValue(new Error("Write failed"));

    const req = new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockClientData),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeTruthy();
  });
});
