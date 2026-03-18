import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { BasicInfoCard } from "./BasicInfoCard";
import type { ProductFormValues } from "@/features/admin";
import { defaultProductFormValues } from "@/features/admin/schemas/product-form-schema";

function Wrapper({
  defaultValues = defaultProductFormValues,
  isEditing = false,
}: {
  defaultValues?: Partial<ProductFormValues>;
  isEditing?: boolean;
}) {
  const form = useForm<ProductFormValues>({
    defaultValues: { ...defaultProductFormValues, ...defaultValues },
  });
  return (
    <FormProvider {...form}>
      <BasicInfoCard form={form} isEditing={isEditing} />
    </FormProvider>
  );
}

describe("BasicInfoCard", () => {
  it("renders card title and main fields", () => {
    render(<Wrapper />);
    expect(screen.getByText("Información básica")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del producto/)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL generada desde el nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sufijo para hacer la URL única/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Marca/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Color/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Material/)).toBeInTheDocument();
  });

  it("shows slug base derived from name", () => {
    render(
      <Wrapper defaultValues={{ name: "Vestido Lavanda con Botones" }} />
    );
    const slugBase = screen.getByLabelText(/URL generada desde el nombre/);
    expect(slugBase).toHaveValue("vestido-lavanda-con-botones");
  });

  it("slug suffix input is disabled when isEditing", () => {
    render(
      <Wrapper defaultValues={{ name: "Test" }} isEditing={true} />
    );
    const suffix = screen.getByLabelText(/Sufijo para hacer la URL única/);
    expect(suffix).toBeDisabled();
  });

  it("slug suffix input is enabled when not editing", () => {
    render(
      <Wrapper defaultValues={{ name: "Test" }} isEditing={false} />
    );
    const suffix = screen.getByLabelText(/Sufijo para hacer la URL única/);
    expect(suffix).toBeEnabled();
  });

  it("user can type name and see slug update", () => {
    render(<Wrapper />);
    const nameInput = screen.getByLabelText(/Nombre del producto/);
    fireEvent.change(nameInput, { target: { value: "Remera Azul" } });
    const slugBase = screen.getByLabelText(/URL generada desde el nombre/);
    expect(slugBase).toHaveValue("remera-azul");
  });
});
