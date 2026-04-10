import { mergeLinksForProduct, normalizeProductoLinkToComparableSlug } from "./productoPublicLinks";

describe("normalizeProductoLinkToComparableSlug", () => {
  it("normalizes plain slug", () => {
    expect(normalizeProductoLinkToComparableSlug("Mi-Producto")).toBe("mi-producto");
  });

  it("strips producto/ prefix", () => {
    expect(normalizeProductoLinkToComparableSlug("/producto/foo-bar")).toBe("foo-bar");
  });

  it("extracts slug from URL", () => {
    expect(normalizeProductoLinkToComparableSlug("https://x.com/producto/foo-bar")).toBe("foo-bar");
  });
});

describe("mergeLinksForProduct", () => {
  it("appends slug when not sold and missing", () => {
    expect(
      mergeLinksForProduct(["a", "b"], { slug: "c", soldOut: false })
    ).toEqual(["a", "b", "c"]);
  });

  it("removes slug when sold", () => {
    expect(
      mergeLinksForProduct(["a", "producto/x", "b"], {
        slug: "x",
        soldOut: true,
      })
    ).toEqual(["a", "b"]);
  });

  it("replaces slug on rename", () => {
    expect(
      mergeLinksForProduct(["old-slug"], {
        slug: "new-slug",
        soldOut: false,
        previousSlug: "old-slug",
      })
    ).toEqual(["new-slug"]);
  });

  it("does not duplicate slug", () => {
    expect(
      mergeLinksForProduct(["x", "https://site.com/producto/x"], {
        slug: "x",
        soldOut: false,
      })
    ).toEqual(["x"]);
  });
});
