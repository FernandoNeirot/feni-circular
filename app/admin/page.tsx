import { getAllProducts } from "@/shared/serverActions/productos";
import AdminPageClient from "./page.client";

export default async function AdminPage() {
  const initialProducts = await getAllProducts();
  return <AdminPageClient initialProducts={initialProducts ?? []} />;
}
