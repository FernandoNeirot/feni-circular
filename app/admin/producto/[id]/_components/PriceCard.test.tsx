import React from "react";
import { render, screen } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PriceCard } from "./PriceCard";
import type { ProductFormValues } from "@/features/admin";
import { defaultProductFormValues } from "@/features/admin/schemas/product-form-schema";
import type { Client } from "@/shared/types/client";

const defaultValues: ProductFormValues = {
  ...defaultProductFormValues,
  name: "Test",
  price: "1000",
  category: "Remeras",
  size: "M",
  brand: "Marca",
  condition: "Como nuevo",
  ageRange: "3-6 años",
  gender: "unisex",
};

function Wrapper({
  clients = [],
  formDefaults = defaultValues,
}: {
  clients?: Client[];
  formDefaults?: ProductFormValues;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  queryClient.setQueryData(["clients"], clients);
  const form = useForm<ProductFormValues>({ defaultValues: formDefaults });
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>
        <PriceCard form={form} />
      </FormProvider>
    </QueryClientProvider>
  );
}

describe("PriceCard", () => {
  it("renders card title and price section", () => {
    render(<Wrapper />);
    expect(screen.getByText("Precio")).toBeInTheDocument();
    expect(screen.getByText(/Origen de la prenda/)).toBeInTheDocument();
    expect(screen.getByText(/Venta/)).toBeInTheDocument();
  });

  it("renders Comprado/Consignado switch", () => {
    render(<Wrapper />);
    expect(screen.getByText("Comprado")).toBeInTheDocument();
    expect(screen.getByText("Consignado")).toBeInTheDocument();
  });

  it("renders price and original price inputs", () => {
    render(<Wrapper />);
    expect(screen.getByLabelText(/Precio de venta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio original/)).toBeInTheDocument();
  });

  it("shows boughtFrom and soldTo selects when no clients", () => {
    render(<Wrapper />);
    expect(screen.getByLabelText(/Comprado a|Consignado de/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vendido a/)).toBeInTheDocument();
  });

  it("renders without error when clients are provided", () => {
    const clients: Client[] = [
      { id: "1", name: "Cliente A", phone: "", address: "" },
      { id: "2", name: "Cliente B", phone: "", address: "" },
    ];
    expect(() => render(<Wrapper clients={clients} />)).not.toThrow();
  });
});
