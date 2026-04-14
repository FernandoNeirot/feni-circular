import { permanentRedirect } from "next/navigation";

function buildProductsUrl(searchParams: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
      return;
    }
    params.set(key, value);
  });
  const query = params.toString();
  return query ? `/productos?${query}` : "/productos";
}

export default async function SearchRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  permanentRedirect(buildProductsUrl(await searchParams));
}
