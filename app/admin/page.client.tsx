"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/shared/types/product";
import type { Client } from "@/shared/types/client";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Plus, Pencil, Search, ArrowLeft, Package, Trash2, Users } from "lucide-react";
import { productsQueryKey, productsQueryOptions } from "@/shared/queries/productos";
import { clientsQueryKey, clientsQueryOptions } from "@/shared/queries/clients";
import { deleteProduct } from "@/shared/serverActions/productos";
import { deleteClient } from "@/shared/serverActions/clients";
import { toast } from "sonner";

interface AdminPageClientProps {
  initialClients: Client[];
  initialProducts: Product[];
}

const PAGE_SIZE = 5;

function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    totalPages,
    page: safePage,
    pageItems: items.slice(start, start + PAGE_SIZE),
  };
}

export default function AdminPageClient({ initialClients, initialProducts }: AdminPageClientProps) {
  const queryClient = useQueryClient();
  const { data: productsData } = useQuery({
    ...productsQueryOptions,
    initialData: initialProducts,
  });
  const products = (productsData ?? initialProducts) as Product[];

  const { data: clientsData } = useQuery({
    ...clientsQueryOptions,
    initialData: initialClients,
  });
  const clients = (clientsData ?? initialClients) as Client[];

  const [openSection, setOpenSection] = useState<string>("");

  const [clientsSearch, setClientsSearch] = useState("");
  const [clientsPage, setClientsPage] = useState(1);

  const [productsSearch, setProductsSearch] = useState("");
  const [productsPage, setProductsPage] = useState(1);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeletingProduct(true);
    try {
      const result = await deleteProduct(productToDelete.id?.toString() ?? "");
      if (result.success) {
        queryClient.setQueryData(productsQueryKey, (prev: Product[] | undefined) =>
          prev ? prev.filter((p) => p.id !== productToDelete.id) : prev
        );
        toast.success("Producto eliminado");
        setProductToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al eliminar el producto");
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleConfirmDeleteClient = async () => {
    if (!clientToDelete) return;
    setDeletingClient(true);
    try {
      const result = await deleteClient(clientToDelete.id);
      if (result.success) {
        queryClient.setQueryData(clientsQueryKey, (prev: Client[] | undefined) =>
          prev ? prev.filter((c) => c.id !== clientToDelete.id) : prev
        );
        toast.success("Cliente eliminado");
        setClientToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Error al eliminar el cliente");
    } finally {
      setDeletingClient(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productsSearch.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(productsSearch.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(productsSearch.toLowerCase())
  );

  const filteredClients = clients.filter((c) => {
    const q = clientsSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q) ||
      (c.address ?? "").toLowerCase().includes(q)
    );
  });

  const clientsPagination = paginate(filteredClients, clientsPage);
  const productsPagination = paginate(filtered, productsPage);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Package className="h-5 w-5 text-primary shrink-0" />
              <h1 className="text-base sm:text-xl font-bold truncate">
                <span className="hidden sm:inline">Admin — </span>Clientes / Proveedores y Productos
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Accordion
          type="single"
          collapsible
          value={openSection}
          onValueChange={(v) => setOpenSection(v)}
          className="space-y-3"
        >
          <AccordionItem value="clients" className="border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Clientes / Proveedores</span>
                </div>
                <span className="text-xs text-muted-foreground">{clients.length} totales</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, teléfono o dirección..."
                    value={clientsSearch}
                    onChange={(e) => {
                      setClientsSearch(e.target.value);
                      setClientsPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Button asChild className="gap-2 shrink-0">
                  <Link href="/admin/cliente/nuevo">
                    <Plus className="h-4 w-4" />
                    Nuevo cliente
                  </Link>
                </Button>
              </div>

              {/* Listado clientes - mobile (cards) */}
              <div className="space-y-3 sm:hidden">
                {clientsPagination.pageItems.map((c) => (
                  <div
                    key={c.id}
                    className="border rounded-xl bg-card p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/cliente/${c.id}`} aria-label="Editar cliente">
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
                            setClientToDelete(c);
                          }}
                          aria-label="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {c.address && (
                      <p className="text-xs text-muted-foreground">{c.address}</p>
                    )}
                  </div>
                ))}
                {filteredClients.length === 0 && (
                  <p className="text-center py-10 text-muted-foreground">
                    No se encontraron clientes
                  </p>
                )}
              </div>

              {/* Tabla clientes - solo desktop */}
              <div className="hidden sm:block border rounded-xl overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 border-b">
                        <th className="text-left p-3 text-sm font-medium">Nombre</th>
                        <th className="text-left p-3 text-sm font-medium">Teléfono</th>
                        <th className="hidden md:table-cell text-left p-3 text-sm font-medium">
                          Dirección
                        </th>
                        <th className="w-24 p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsPagination.pageItems.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/30 border-b last:border-0">
                          <td className="p-3 font-medium">{c.name}</td>
                          <td className="p-3 text-muted-foreground">{c.phone}</td>
                          <td className="hidden md:table-cell p-3 text-muted-foreground">
                            {c.address}
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/admin/cliente/${c.id}`} aria-label="Editar cliente">
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setClientToDelete(c);
                                }}
                                aria-label="Eliminar cliente"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredClients.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-muted-foreground">
                            No se encontraron clientes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <p className="text-xs text-muted-foreground order-2 sm:order-1">
                  Mostrando {clientsPagination.pageItems.length} de {filteredClients.length}
                  <span className="sm:hidden">
                    {" "}
                    · Página {clientsPagination.page} de {clientsPagination.totalPages}
                  </span>
                </p>
                <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={clientsPagination.page <= 1}
                    onClick={() => setClientsPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="hidden sm:inline text-xs text-muted-foreground">
                    Página {clientsPagination.page} de {clientsPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={clientsPagination.page >= clientsPagination.totalPages}
                    onClick={() =>
                      setClientsPage((p) => Math.min(clientsPagination.totalPages, p + 1))
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="products" className="border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Productos</span>
                </div>
                <span className="text-xs text-muted-foreground">{products.length} totales</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, marca o categoría..."
                    value={productsSearch}
                    onChange={(e) => {
                      setProductsSearch(e.target.value);
                      setProductsPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Button asChild className="gap-2 shrink-0">
                  <Link href="/admin/producto/nuevo">
                    <Plus className="h-4 w-4" />
                    Nuevo producto
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-4">
                <span>{products.length} totales</span>
                <span>·</span>
                <span>{products.filter((p) => p.soldOut).length} vendidos</span>
                <span>·</span>
                <span>{products.filter((p) => !p.soldOut).length} disponibles</span>
              </div>

              {/* Cards productos - mobile */}
              <div className="block md:hidden space-y-3">
                {productsPagination.pageItems.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-xl overflow-hidden bg-card flex gap-3 p-3"
                  >
                    <Link href={`/admin/producto/${product.id}`} className="shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-16 h-16 rounded-lg object-cover ${
                          product.soldOut ? "grayscale opacity-60" : ""
                        }`}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/producto/${product.id}`}>
                        <p className="font-medium truncate">{product.name}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {[product.brand, product.category].filter(Boolean).join(" · ")}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {product.size}
                        </Badge>
                        <span className="text-sm font-semibold">${product.price}</span>
                        {product.soldOut ? (
                          <Badge variant="destructive" className="text-xs">
                            Vendido
                          </Badge>
                        ) : (
                          <Badge className="bg-primary/15 text-primary border-0 text-xs">
                            Disponible
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex flex-col justify-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/producto/${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault();
                          setProductToDelete(product);
                        }}
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center py-10 text-muted-foreground">
                    No se encontraron productos
                  </p>
                )}
              </div>

              {/* Tabla productos - solo desktop */}
              <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/40 border-b">
                        <th className="w-16 text-left p-3 text-sm font-medium">Foto</th>
                        <th className="text-left p-3 text-sm font-medium">Nombre</th>
                        <th className="hidden md:table-cell text-left p-3 text-sm font-medium">
                          Marca
                        </th>
                        <th className="hidden md:table-cell text-left p-3 text-sm font-medium">
                          Categoría
                        </th>
                        <th className="text-left p-3 text-sm font-medium">Talle</th>
                        <th className="text-right p-3 text-sm font-medium">Precio</th>
                        <th className="text-center p-3 text-sm font-medium">Estado</th>
                        <th className="w-24 p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsPagination.pageItems.map((product) => (
                        <tr
                          key={product.id}
                          className="cursor-pointer hover:bg-muted/30 border-b last:border-0"
                        >
                          <td className="p-3">
                            <Link href={`/admin/producto/${product.id}`} className="block">
                              <img
                                src={product.image}
                                alt={product.name}
                                className={`w-12 h-12 rounded-lg object-cover ${product.soldOut ? "grayscale opacity-60" : ""}`}
                              />
                            </Link>
                          </td>
                          <td className="p-3 font-medium">
                            <Link href={`/admin/producto/${product.id}`}>{product.name}</Link>
                          </td>
                          <td className="hidden md:table-cell p-3 text-muted-foreground">
                            {product.brand}
                          </td>
                          <td className="hidden md:table-cell p-3 text-muted-foreground">
                            {product.category}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {product.size}
                            </Badge>
                          </td>
                          <td className="p-3 text-right font-semibold">${product.price}</td>
                          <td className="p-3 text-center">
                            {product.soldOut ? (
                              <Badge variant="destructive" className="text-xs">
                                Vendido
                              </Badge>
                            ) : (
                              <Badge className="bg-primary/15 text-primary border-0 text-xs">
                                Disponible
                              </Badge>
                            )}
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <Link href={`/admin/producto/${product.id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setProductToDelete(product);
                                }}
                                aria-label="Eliminar producto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-muted-foreground">
                            No se encontraron productos
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <p className="text-xs text-muted-foreground order-2 sm:order-1">
                  Mostrando {productsPagination.pageItems.length} de {filtered.length}
                  <span className="sm:hidden">
                    {" "}
                    · Página {productsPagination.page} de {productsPagination.totalPages}
                  </span>
                </p>
                <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={productsPagination.page <= 1}
                    onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span className="hidden sm:inline text-xs text-muted-foreground">
                    Página {productsPagination.page} de {productsPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={productsPagination.page >= productsPagination.totalPages}
                    onClick={() =>
                      setProductsPage((p) => Math.min(productsPagination.totalPages, p + 1))
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{clientToDelete?.name}&quot; de la lista de clientes/proveedores.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingClient}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeleteClient();
              }}
              disabled={deletingClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingClient ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{productToDelete?.name}&quot; y sus imágenes del almacenamiento.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingProduct}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDeleteProduct();
              }}
              disabled={deletingProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingProduct ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
