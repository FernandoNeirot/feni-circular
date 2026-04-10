import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminPageClient from "../page.client";
import type { Product } from "@/shared/types/product";
import type { Client } from "@/shared/types/client";

const mockDeleteProduct = jest.fn();
const mockDeleteClient = jest.fn();
jest.mock("@/shared/serverActions/productos", () => ({
  deleteProduct: (...args: unknown[]) => mockDeleteProduct(...args),
  createProductWithData: jest.fn(),
  updateProduct: jest.fn(),
  getAllProducts: jest.fn(),
  getAllProductsAdmin: jest.fn(),
}));
jest.mock("@/shared/serverActions/clients", () => ({
  deleteClient: (...args: unknown[]) => mockDeleteClient(...args),
  createClient: jest.fn(),
  updateClient: jest.fn(),
  getClient: jest.fn(),
  getAllClients: jest.fn(),
}));

const mockClient: Client = {
  id: "client-1",
  name: "Juan Pérez",
  phone: "+54 11 1234-5678",
  address: "Calle Falsa 123",
};

const mockProduct: Product = {
  name: "Vestido Test",
  price: 1200,
  category: "Vestidos",
  size: "2",
  brand: "Mimo",
  condition: "Como nuevo",
  description: "",
  color: "",
  ageRange: "3-6 años",
  gender: "niña",
  images: ["/img.jpg"],
  image: "/img.jpg",
  measurements: { largo: 50, ancho: 40 },
  isConsigned: false,
  boughtFrom: "",
  soldTo: "",
};

function renderAdmin(initialClients: Client[] = [], initialProducts: Product[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPageClient
        initialClients={initialClients}
        initialProducts={initialProducts}
      />
    </QueryClientProvider>
  );
}

describe("AdminPageClient integration", () => {
  beforeEach(() => {
    mockDeleteProduct.mockResolvedValue({ success: true });
    mockDeleteClient.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    mockDeleteProduct.mockClear();
    mockDeleteClient.mockClear();
  });

  it("renders admin header and accordion sections", () => {
    renderAdmin([], []);
    expect(screen.getByText("Clientes / Proveedores y Productos")).toBeInTheDocument();
    expect(screen.getByText("Clientes / Proveedores")).toBeInTheDocument();
    expect(screen.getByText("Productos")).toBeInTheDocument();
  });

  it("shows client count and product count in accordion triggers", () => {
    const clients = [mockClient];
    const products = [{ ...mockProduct }];
    renderAdmin(clients, products);
    const totales = screen.getAllByText(/totales/);
    expect(totales.length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no clients", () => {
    renderAdmin([], []);
    const trigger = screen.getByText("Clientes / Proveedores").closest("button");
    if (trigger) fireEvent.click(trigger);
    expect(screen.getByPlaceholderText(/Buscar por nombre, teléfono o dirección/)).toBeInTheDocument();
  });

  it("shows client name when initial clients provided", () => {
    renderAdmin([mockClient], []);
    const trigger = screen.getByText("Clientes / Proveedores").closest("button");
    if (trigger) fireEvent.click(trigger);
    const names = screen.getAllByText("Juan Pérez");
    expect(names.length).toBeGreaterThan(0);
  });

  it("shows product name when initial products provided", () => {
    const productWithId = { ...mockProduct, id: "prod-1" };
    renderAdmin([], [productWithId]);
    const trigger = screen.getByText("Productos").closest("button");
    if (trigger) fireEvent.click(trigger);
    const names = screen.getAllByText("Vestido Test");
    expect(names.length).toBeGreaterThan(0);
  });

  it("has link to new client", () => {
    renderAdmin([], []);
    const trigger = screen.getByText("Clientes / Proveedores").closest("button");
    if (trigger) fireEvent.click(trigger);
    const link = screen.getByRole("link", { name: /Nuevo cliente/i });
    expect(link).toHaveAttribute("href", "/admin/cliente/nuevo");
  });

  it("has link to new product when product section is open", () => {
    renderAdmin([], []);
    const productTrigger = screen.getByText("Productos").closest("button");
    if (productTrigger) fireEvent.click(productTrigger);
    expect(screen.getByRole("link", { name: /Nuevo producto/ })).toHaveAttribute(
      "href",
      "/admin/producto/nuevo"
    );
  });

  it("calls deleteClient when confirming client delete", async () => {
    renderAdmin([mockClient], []);
    const trigger = screen.getByText("Clientes / Proveedores").closest("button");
    if (trigger) fireEvent.click(trigger);
    const deleteBtns = screen.getAllByRole("button", { name: /Eliminar cliente/ });
    fireEvent.click(deleteBtns[0]!);
    const confirmBtns = screen.getAllByRole("button", { name: /Sí, eliminar/ });
    fireEvent.click(confirmBtns[0]!);
    await screen.findByText("Clientes / Proveedores"); // wait for async
    expect(mockDeleteClient).toHaveBeenCalledWith("client-1");
  });

  it("calls deleteProduct when confirming product delete", async () => {
    const productWithId = { ...mockProduct, id: "prod-1" };
    renderAdmin([], [productWithId]);
    const trigger = screen.getByText("Productos").closest("button");
    if (trigger) fireEvent.click(trigger);
    const deleteBtns = screen.getAllByRole("button", { name: /Eliminar producto/ });
    fireEvent.click(deleteBtns[0]!);
    const confirmBtns = screen.getAllByRole("button", { name: /Sí, eliminar/ });
    fireEvent.click(confirmBtns[0]!);
    await screen.findByText("Productos");
    expect(mockDeleteProduct).toHaveBeenCalledWith("prod-1");
  });
});
