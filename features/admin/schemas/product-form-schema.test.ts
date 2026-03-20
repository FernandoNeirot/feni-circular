import {
  normalizeSlug,
  productFormSchema,
  productFormSchemaBase,
  defaultProductFormValues,
  type ProductFormValues,
} from "./product-form-schema";

describe("normalizeSlug", () => {
  it("returns empty string for empty or non-string input", () => {
    expect(normalizeSlug("")).toBe("");
    expect(normalizeSlug("   ")).toBe("");
    // @ts-expect-error testing invalid input
    expect(normalizeSlug(null)).toBe("");
    // @ts-expect-error testing invalid input
    expect(normalizeSlug(undefined)).toBe("");
  });

  it("converts to lowercase", () => {
    expect(normalizeSlug("Vestido Azul")).toBe("vestido-azul");
  });

  it("replaces spaces with hyphens", () => {
    expect(normalizeSlug("camisa rayada")).toBe("camisa-rayada");
    expect(normalizeSlug("  multiple   spaces  ")).toBe("multiple-spaces");
  });

  it("removes accents (NFD)", () => {
    expect(normalizeSlug("campeón")).toBe("campeon");
    expect(normalizeSlug("niño")).toBe("nino");
    expect(normalizeSlug("México")).toBe("mexico");
  });

  it("keeps only letters, numbers and hyphens", () => {
    expect(normalizeSlug("item #1!")).toBe("item-1");
    expect(normalizeSlug("100% algodón")).toBe("100-algodon");
  });

  it("collapses repeated hyphens", () => {
    expect(normalizeSlug("a---b")).toBe("a-b");
    expect(normalizeSlug("  a   b  ")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(normalizeSlug("-slug-")).toBe("slug");
    expect(normalizeSlug("--  slug  --")).toBe("slug");
  });

  it("handles real product names", () => {
    expect(normalizeSlug("Vestido Lavanda con Botones")).toBe("vestido-lavanda-con-botones");
    expect(normalizeSlug("Remera Niño 3-6 años")).toBe("remera-nino-3-6-anos");
  });
});

describe("productFormSchema", () => {
  const validBase: Partial<ProductFormValues> = {
    name: "Vestido Test",
    price: "1200",
    category: "Vestidos",
    size: "2",
    brand: "Mimo",
    condition: "Como nuevo",
    ageRange: "3-6 años",
    gender: "niña",
    boughtFrom: "client-1",
    purchasePrice: "800",
    purchaseDate: "2026-03-20",
    soldOut: false,
    isConsigned: false,
    featured: false,
    trending: false,
  };

  it("accepts valid form values", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid price", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      price: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid slug with letters, numbers and hyphens", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      slug: "vestido-test-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects slug with invalid characters", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      slug: "vestido con espacios",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty category", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      category: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid gender", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      gender: "otro",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty originalPrice", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      originalPrice: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts originalPrice greater than sale price", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      price: "1200",
      originalPrice: "4500",
    });
    expect(result.success).toBe(true);
  });

  it("rejects originalPrice less than or equal to sale price", () => {
    const lower = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      price: "1200",
      originalPrice: "900",
    });
    expect(lower.success).toBe(false);
    if (!lower.success) {
      expect(lower.error.flatten().fieldErrors.originalPrice?.[0]).toContain("mayor");
    }

    const equal = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      price: "1200",
      originalPrice: "1200",
    });
    expect(equal.success).toBe(false);
  });

  it("requires saleDate when soldOut is true", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      soldOut: true,
      saleDate: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.saleDate?.[0]).toContain("obligatoria");
    }
  });

  it("accepts saleDate when soldOut is true", () => {
    const result = productFormSchema.safeParse({
      ...defaultProductFormValues,
      ...validBase,
      soldOut: true,
      saleDate: "2026-03-21",
    });
    expect(result.success).toBe(true);
  });
});

describe("defaultProductFormValues", () => {
  it("has all keys required by schema", () => {
    const keys = Object.keys(defaultProductFormValues).sort();
    const schemaKeys = Object.keys(productFormSchemaBase.shape).sort();
    schemaKeys.forEach((k) => {
      expect(keys).toContain(k);
    });
  });
});
