"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/shared/types/product";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
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
import { Plus, Pencil, Search, ArrowLeft, Package, Trash2 } from "lucide-react";
import { productsQueryKey, productsQueryOptions } from "@/shared/queries/productos";
import { deleteProduct } from "@/shared/serverActions/productos";
import { toast } from "sonner";

interface AdminPageClientProps {
  initialProducts: Product[];
}

export default function AdminPageClient({ initialProducts }: AdminPageClientProps) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    ...productsQueryOptions,
    initialData: initialProducts,
  });
  const products = (data ?? initialProducts) as Product[];
  const [search, setSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
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
      setDeleting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

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
                <span className="hidden sm:inline">Admin — </span>Productos
              </h1>
            </div>
          </div>
          <Button asChild className="gap-2 shrink-0">
            <Link href="/admin/producto/nuevo">
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">Nuevo</span>
              <span className="hidden sm:inline">Nuevo producto</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, marca o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
          <span>{products.length} totales</span>
          <span>·</span>
          <span>{products.filter((p) => p.soldOut).length} vendidos</span>
          <span>·</span>
          <span>{products.filter((p) => !p.soldOut).length} disponibles</span>
        </div>

        {/* Cards — solo móvil */}
        <div className="block md:hidden space-y-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="border rounded-xl overflow-hidden bg-card flex gap-3 p-3"
            >
              <Link href={`/admin/producto/${product.id}`} className="shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-16 h-16 rounded-lg object-cover ${product.soldOut ? "grayscale opacity-60" : ""}`}
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
              <div className="flex flex-col justify-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
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
            <p className="text-center py-12 text-muted-foreground">
              No se encontraron productos
            </p>
          )}
        </div>

        {/* Tabla — solo desktop */}
        <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="w-16 text-left p-3 text-sm font-medium">Foto</th>
                  <th className="text-left p-3 text-sm font-medium">Nombre</th>
                  <th className="hidden md:table-cell text-left p-3 text-sm font-medium">Marca</th>
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
                {filtered.map((product) => (
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
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

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
            <AlertDialogCancel disabled={deleting}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
