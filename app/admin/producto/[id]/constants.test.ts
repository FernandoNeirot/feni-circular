import {
  categories,
  conditions,
  genders,
  ageRanges,
  emptyMeasurements,
  categoryMeasurementFields,
  fieldLabels,
} from "./constants";

describe("admin producto constants", () => {
  describe("categories", () => {
    it("includes expected categories", () => {
      expect(categories).toContain("Abrigos");
      expect(categories).toContain("Vestidos");
      expect(categories).toContain("Remeras");
      expect(categories).toContain("Pantalones");
      expect(categories).toContain("Calzados");
      expect(categories).toContain("Bolsos");
      expect(categories).toContain("Enteritos");
    });

    it("has no duplicates and is readonly", () => {
      const set = new Set(categories);
      expect(set.size).toBe(categories.length);
    });
  });

  describe("conditions", () => {
    it("includes expected conditions", () => {
      expect(conditions).toContain("Como nuevo");
      expect(conditions).toContain("Excelente");
      expect(conditions).toContain("Muy bueno");
      expect(conditions).toContain("Bueno");
    });
  });

  describe("genders", () => {
    it("has value and label for niña, niño, unisex", () => {
      const values = genders.map((g) => g.value);
      expect(values).toContain("niña");
      expect(values).toContain("niño");
      expect(values).toContain("unisex");
      genders.forEach((g) => {
        expect(g.label).toBeTruthy();
      });
    });
  });

  describe("ageRanges", () => {
    it("has value and label", () => {
      expect(ageRanges.length).toBeGreaterThan(0);
      ageRanges.forEach((a) => {
        expect(a.value).toBeTruthy();
        expect(a.label).toBeTruthy();
      });
    });
  });

  describe("emptyMeasurements", () => {
    it("has numeric largo and ancho, optional rest", () => {
      expect(emptyMeasurements.largo).toBe(0);
      expect(emptyMeasurements.ancho).toBe(0);
      expect(emptyMeasurements.manga).toBeUndefined();
      expect(emptyMeasurements.anchoCintura).toBeUndefined();
      expect(emptyMeasurements.entrepierna).toBeUndefined();
    });
  });

  describe("categoryMeasurementFields", () => {
    it("has fields for each category in categories", () => {
      categories.forEach((cat) => {
        expect(categoryMeasurementFields[cat]).toBeDefined();
        expect(Array.isArray(categoryMeasurementFields[cat])).toBe(true);
      });
    });

    it("each field has key and label", () => {
      Object.values(categoryMeasurementFields).forEach((fields) => {
        fields.forEach((f) => {
          expect(["manga", "ancho", "largo", "anchoCintura", "entrepierna"]).toContain(f.key);
          expect(f.label).toBeTruthy();
        });
      });
    });
  });

  describe("fieldLabels", () => {
    it("has labels for main form fields", () => {
      expect(fieldLabels.name).toBe("Nombre");
      expect(fieldLabels.price).toBe("Precio");
      expect(fieldLabels.category).toBe("Categoría");
      expect(fieldLabels.brand).toBe("Marca");
      expect(fieldLabels.condition).toBe("Estado");
    });
  });
});
