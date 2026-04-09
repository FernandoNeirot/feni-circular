/** Ensures the base URL has a scheme (https://) for use with new URL() and metadata. */
function ensureUrlWithScheme(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const SITE_NAME = "FENI Circular";
export const SITE_DESCRIPTION =
  "Ropa infantil usada de excelente calidad en Argentina. Dale una segunda vida a la ropa de tus hijos: moda circular, sostenible y con impacto real. Compra, vende y consigna ropa infantil. Envíos con Correo Argentino.";
export const SITE_KEYWORDS = [
  "ropa infantil usada",
  "ropa infantil segunda mano",
  "ropa infantil circular",
  "ropa infantil sostenible",
  "ropa infantil Argentina",
  "ropa niños usada",
  "ropa niña usada",
  "economía circular infantil",
  "comprar ropa infantil",
  "vender ropa infantil",
  "consignación ropa infantil",
  "ropa usada CABA",
  "ropa bebé segunda mano",
  "moda infantil sostenible",
  "segunda vida ropa",
  "feni circular",
  "FENI",
];
export const LOCALE = "es_AR";
export const TWITTER_HANDLE = "@feni.kids";

export function getBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BASE_URL) {
    return ensureUrlWithScheme(process.env.NEXT_PUBLIC_BASE_URL);
  }
  return ensureUrlWithScheme(BASE_URL);
}

export function canonicalUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const DEFAULT_OG_IMAGE = "/og-default.png";

export function ogImageUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return canonicalUrl(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`);
}
