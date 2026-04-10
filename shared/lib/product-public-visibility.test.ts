import type { Product } from "@/shared/types/product";
import {
  filterProductsForPublicCatalog,
  isProductHiddenFromPublicAfterSaleCooldown,
} from "./product-public-visibility";

const base: Product = {
  name: "P",
  price: 1,
  category: "Remeras",
  size: "M",
  brand: "B",
  condition: "Como nuevo",
  description: "",
  color: "",
  ageRange: "3-6 años",
  gender: "unisex",
  images: ["/i.jpg"],
  image: "/i.jpg",
  measurements: { largo: 1, ancho: 1 },
  isConsigned: false,
  boughtFrom: "",
  soldTo: "",
};

describe("isProductHiddenFromPublicAfterSaleCooldown", () => {
  it("no oculta sin fecha de venta", () => {
    expect(isProductHiddenFromPublicAfterSaleCooldown(base, new Date("2026-06-20"))).toBe(false);
  });

  it("oculta si la venta fue hace 10 o más días calendario", () => {
    const p = { ...base, saleDate: "2026-06-01" };
    expect(isProductHiddenFromPublicAfterSaleCooldown(p, new Date("2026-06-10T12:00:00Z"))).toBe(
      false
    );
    expect(isProductHiddenFromPublicAfterSaleCooldown(p, new Date("2026-06-11T12:00:00Z"))).toBe(
      true
    );
  });
});

describe("filterProductsForPublicCatalog", () => {
  it("deja solo productos visibles", () => {
    const old: Product = { ...base, saleDate: "2020-01-01" };
    const fresh: Product = { ...base, saleDate: "2026-06-15" };
    const list = filterProductsForPublicCatalog([old, fresh], new Date("2026-06-20"));
    expect(list).toEqual([fresh]);
  });
});
