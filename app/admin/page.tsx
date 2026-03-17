import { getAllProducts } from "@/shared/serverActions/productos";
import { getAllClients } from "@/shared/serverActions/clients";
import AdminPageClient from "./page.client";

export default async function AdminPage() {
  const initialProducts = await getAllProducts();
  const initialClients = await getAllClients();
  return (
    <AdminPageClient
      initialClients={initialClients ?? []}
      initialProducts={initialProducts ?? []}
    />
  );
}
