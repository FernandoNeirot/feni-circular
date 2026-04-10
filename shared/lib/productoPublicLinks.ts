/** Compara entradas del índice (slug, path o URL) con el slug del producto. */
export function normalizeProductoLinkToComparableSlug(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) {
    try {
      let path = new URL(s).pathname.replace(/^\/+|\/+$/g, "");
      if (path.startsWith("producto/")) {
        path = path.slice("producto/".length);
      }
      const segment = path.includes("/") ? path.split("/").pop() ?? path : path;
      return segment.toLowerCase();
    } catch {
      return s.toLowerCase();
    }
  }
  let path = s.replace(/^\/+/, "");
  if (path.startsWith("producto/")) {
    path = path.slice("producto/".length);
  }
  const segment = path.includes("/") ? path.split("/").pop() ?? path : path;
  return segment.toLowerCase();
}

/**
 * Actualiza el listado de URLs indexadas: quita slug anterior y/o actual, y si el producto no está vendido agrega el slug.
 */
export function mergeLinksForProduct(
  current: string[],
  opts: { slug: string; previousSlug?: string | null; soldOut: boolean }
): string[] {
  const norm = normalizeProductoLinkToComparableSlug;
  const slugTrim = opts.slug.trim();
  const slugN = norm(slugTrim);
  const prevN = opts.previousSlug?.trim() ? norm(opts.previousSlug.trim()) : null;

  const next = current.filter((entry) => {
    const n = norm(entry);
    if (slugN && n === slugN) return false;
    if (prevN && n === prevN) return false;
    return true;
  });

  if (opts.soldOut || !slugN) {
    return next;
  }
  const has = next.some((e) => norm(e) === slugN);
  return has ? next : [...next, slugTrim];
}
