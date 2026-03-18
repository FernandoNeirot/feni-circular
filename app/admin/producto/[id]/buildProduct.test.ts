import { buildProductFromForm } from "./buildProduct";
import type { ProductFormValues } from "@/features/admin";
import { defaultProductFormValues } from "@/features/admin/schemas/product-form-schema";

function formValues(overrides: Partial<ProductFormValues> = {}): ProductFormValues {
  return {
    ...defaultProductFormValues,
    name: "Vestido Lavanda",
    price: "1200",
    originalPrice: "4500",
    purchasePrice: "800",
    category: "Vestidos",
    size: "2",
    brand: "Mimo",
    condition: "Como nuevo",
    conditionDetail: "Sin uso",
    description: "Vestido ideal para verano",
    color: "Lavanda",
    ageRange: "3-6 años",
    gender: "niña",
    material: "Algodón",
    usageCount: "0",
    soldOut: false,
    featured: true,
    trending: false,
    isConsigned: false,
    boughtFrom: "",
    soldTo: "",
    largo: "50",
    ancho: "40",
    manga: "30",
    anchoCintura: "",
    entrepierna: "",
    ...overrides,
  };
}

describe("buildProductFromForm", () => {
  it("maps form values to Product with required fields", () => {
    const data = formValues();
    const imageUrls = ["https://example.com/img.jpg"];
    const product = buildProductFromForm(data, imageUrls);

    expect(product.name).toBe("Vestido Lavanda");
    expect(product.price).toBe(1200);
    expect(product.originalPrice).toBe(4500);
    expect(product.purchasePrice).toBe(800);
    expect(product.category).toBe("Vestidos");
    expect(product.size).toBe("2");
    expect(product.brand).toBe("Mimo");
    expect(product.condition).toBe("Como nuevo");
    expect(product.conditionDetail).toBe("Sin uso");
    expect(product.description).toBe("Vestido ideal para verano");
    expect(product.color).toBe("Lavanda");
    expect(product.ageRange).toBe("3-6 años");
    expect(product.gender).toBe("niña");
    expect(product.material).toBe("Algodón");
    expect(product.usageCount).toBe("0");
    expect(product.soldOut).toBe(false);
    expect(product.featured).toBe(true);
    expect(product.trending).toBe(false);
    expect(product.isConsigned).toBe(false);
    expect(product.boughtFrom).toBe("");
    expect(product.soldTo).toBe("");
    expect(product.image).toBe("https://example.com/img.jpg");
    expect(product.images).toEqual(["https://example.com/img.jpg"]);
  });

  it("uses slugOverride when provided", () => {
    const data = formValues({ slug: "custom-slug", slugSuffix: "2" });
    const product = buildProductFromForm(data, [], "my-custom-slug");
    expect(product.slug).toBe("my-custom-slug");
  });

  it("uses trimmed slug from form when no override", () => {
    const data = formValues({ slug: "  vestido-lavanda  ", slugSuffix: "" });
    const product = buildProductFromForm(data, []);
    expect(product.slug).toBe("vestido-lavanda");
  });

  it("uses placeholder image when imageUrls is empty", () => {
    const product = buildProductFromForm(formValues(), []);
    expect(product.image).toBe("/images/placeholder.jpg");
    expect(product.images).toEqual(["/images/placeholder.jpg"]);
  });

  it("builds measurements from form numeric strings", () => {
    const data = formValues({
      largo: "60",
      ancho: "45",
      manga: "32",
      anchoCintura: "38",
      entrepierna: "28",
    });
    const product = buildProductFromForm(data, []);

    expect(product.measurements.largo).toBe(60);
    expect(product.measurements.ancho).toBe(45);
    expect(product.measurements.manga).toBe(32);
    expect(product.measurements.anchoCintura).toBe(38);
    expect(product.measurements.entrepierna).toBe(28);
  });

  it("treats empty optional measurement strings as undefined", () => {
    const data = formValues({ manga: "", anchoCintura: "", entrepierna: "" });
    const product = buildProductFromForm(data, []);

    expect(product.measurements.manga).toBeUndefined();
    expect(product.measurements.anchoCintura).toBeUndefined();
    expect(product.measurements.entrepierna).toBeUndefined();
    expect(product.measurements.largo).toBe(50);
    expect(product.measurements.ancho).toBe(40);
  });

  it("handles consigned product flags", () => {
    const data = formValues({ isConsigned: true, boughtFrom: "client-id-1", soldTo: "client-id-2" });
    const product = buildProductFromForm(data, []);
    expect(product.isConsigned).toBe(true);
    expect(product.boughtFrom).toBe("client-id-1");
    expect(product.soldTo).toBe("client-id-2");
  });
});
