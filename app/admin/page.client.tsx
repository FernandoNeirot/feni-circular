"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatReportDateDisplay, normalizeReportDateKey } from "@/shared/lib/report-dates";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Plus, Pencil, Search, ArrowLeft, Package, Trash2, Users } from "lucide-react";
import {
  adminProductsQueryKey,
  adminProductsQueryOptions,
  productsQueryKey,
} from "@/shared/queries/productos";
import { clientsQueryKey, clientsQueryOptions } from "@/shared/queries/clients";
import { deleteProduct } from "@/shared/serverActions/productos";
import { deleteClient } from "@/shared/serverActions/clients";
import { toast } from "sonner";

interface AdminPageClientProps {
  initialClients: Client[];
  initialProducts: Product[];
}

type ReportMode = "purchase" | "sales";
type ReportSort = "name-asc" | "name-desc" | "count-desc" | "count-asc";
type SalesPeriodSort =
  | "sale-date-desc"
  | "sale-date-asc"
  | "name-asc"
  | "name-desc"
  | "price-desc"
  | "price-asc";

const PAGE_SIZE = 5;

function formatSalesReportArs(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function productQualifiesAsSold(product: Product): boolean {
  const hasBuyer = typeof product.soldTo === "string" && product.soldTo.trim().length > 0;
  return hasBuyer || product.soldOut === true;
}

/** Si hay fecha de venta parseable, debe caer en [from, to]. Si no hay fecha, depende de excludeUndated. */
function isSaleWithinPeriod(
  product: Product,
  dateFrom: string,
  dateTo: string,
  excludeUndated: boolean
): boolean {
  const from = dateFrom.trim();
  const to = dateTo.trim();
  const d = normalizeReportDateKey(product.saleDate);
  if (d) return d >= from && d <= to;
  return !excludeUndated;
}

function productInReportDateRange(
  product: Product,
  mode: ReportMode,
  dateFrom: string,
  dateTo: string
): boolean {
  const from = dateFrom.trim();
  const to = dateTo.trim();
  if (!from && !to) return true;
  const raw = mode === "purchase" ? product.purchaseDate : product.saleDate;
  const d = normalizeReportDateKey(raw);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function sortSalesPeriodProducts(products: Product[], sort: SalesPeriodSort): Product[] {
  const arr = [...products];
  arr.sort((a, b) => {
    const dateA = normalizeReportDateKey(a.saleDate);
    const dateB = normalizeReportDateKey(b.saleDate);
    switch (sort) {
      case "sale-date-desc": {
        if (!dateA && !dateB) return a.name.localeCompare(b.name, "es");
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA) || a.name.localeCompare(b.name, "es");
      }
      case "sale-date-asc": {
        if (!dateA && !dateB) return a.name.localeCompare(b.name, "es");
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB) || a.name.localeCompare(b.name, "es");
      }
      case "name-desc":
        return b.name.localeCompare(a.name, "es");
      case "name-asc":
        return a.name.localeCompare(b.name, "es");
      case "price-desc":
        return (b.price ?? 0) - (a.price ?? 0);
      case "price-asc":
        return (a.price ?? 0) - (b.price ?? 0);
      default:
        return 0;
    }
  });
  return arr;
}

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
    ...adminProductsQueryOptions,
    initialData: initialProducts as (Product & { id: string })[],
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
  const [clientReportMode, setClientReportMode] = useState<ReportMode>("purchase");
  const [productReportMode, setProductReportMode] = useState<ReportMode>("purchase");
  const [clientReportSearch, setClientReportSearch] = useState("");
  const [productReportSearch, setProductReportSearch] = useState("");
  const [clientReportPage, setClientReportPage] = useState(1);
  const [productReportPage, setProductReportPage] = useState(1);
  const [clientReportSort, setClientReportSort] = useState<ReportSort>("count-desc");
  const [productReportSort, setProductReportSort] = useState<ReportSort>("name-asc");
  const [clientReportDateFrom, setClientReportDateFrom] = useState("");
  const [clientReportDateTo, setClientReportDateTo] = useState("");
  const [productReportDateFrom, setProductReportDateFrom] = useState("");
  const [productReportDateTo, setProductReportDateTo] = useState("");
  const [salesPeriodFrom, setSalesPeriodFrom] = useState("");
  const [salesPeriodTo, setSalesPeriodTo] = useState("");
  const [salesPeriodSearch, setSalesPeriodSearch] = useState("");
  const [salesPeriodPage, setSalesPeriodPage] = useState(1);
  const [salesPeriodSort, setSalesPeriodSort] = useState<SalesPeriodSort>("sale-date-desc");
  /** Si es true, se excluyen vendidos sin fecha de venta (solo cuentan fechas dentro del rango). */
  const [salesPeriodExcludeUndated, setSalesPeriodExcludeUndated] = useState(false);
  const [selectedClientReport, setSelectedClientReport] = useState<Client | null>(null);
  const [selectedProductReport, setSelectedProductReport] = useState<Product | null>(null);

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeletingProduct(true);
    try {
      const result = await deleteProduct(productToDelete.id?.toString() ?? "");
      if (result.success) {
        queryClient.setQueryData(
          adminProductsQueryKey,
          (prev: (Product & { id: string })[] | undefined) =>
            prev ? prev.filter((p) => String(p.id) !== String(productToDelete.id)) : prev
        );
        queryClient.invalidateQueries({ queryKey: productsQueryKey });
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
  const clientsById = new Map(clients.map((client) => [client.id, client]));

  const getRelatedByClient = (
    clientId: string,
    mode: ReportMode,
    dateFrom: string,
    dateTo: string
  ) =>
    products.filter((product) => {
      const matchClient =
        mode === "purchase" ? product.boughtFrom === clientId : product.soldTo === clientId;
      if (!matchClient) return false;
      return productInReportDateRange(product, mode, dateFrom, dateTo);
    });

  const filteredClientReports = clients
    .map((client) => ({
      client,
      relatedProducts: getRelatedByClient(
        client.id,
        clientReportMode,
        clientReportDateFrom,
        clientReportDateTo
      ),
    }))
    .filter(({ client, relatedProducts }) => {
      if (relatedProducts.length === 0) return false;
      const q = clientReportSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        client.name.toLowerCase().includes(q) ||
        (client.phone ?? "").toLowerCase().includes(q) ||
        (client.address ?? "").toLowerCase().includes(q)
      );
    });

  const filteredProductReports = products.filter((product) => {
    const inMode =
      productReportMode === "purchase" ? !!product.boughtFrom : !!product.soldTo;
    if (!inMode) return false;
    if (!productInReportDateRange(product, productReportMode, productReportDateFrom, productReportDateTo))
      return false;
    const q = productReportSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) ||
      (product.brand ?? "").toLowerCase().includes(q) ||
      (product.category ?? "").toLowerCase().includes(q)
    );
  });

  const sortReportRows = <T extends { name: string; count: number }>(
    rows: T[],
    sort: ReportSort
  ) => {
    const sorted = [...rows];
    sorted.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "es");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "es");
      if (sort === "count-asc") return a.count - b.count;
      return b.count - a.count;
    });
    return sorted;
  };

  const clientReportRows = sortReportRows(
    filteredClientReports.map(({ client, relatedProducts }) => {
      const keys = relatedProducts
        .map((p) =>
          normalizeReportDateKey(
            clientReportMode === "purchase" ? p.purchaseDate : p.saleDate
          )
        )
        .filter((k): k is string => k !== null);
      const latest = keys.length > 0 ? [...keys].sort()[keys.length - 1]! : null;
      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        address: client.address,
        count: relatedProducts.length,
        dateLabel: latest ? formatReportDateDisplay(latest) : "—",
      };
    }),
    clientReportSort
  );

  const productReportRows = sortReportRows(
    filteredProductReports.map((product) => ({
      id: product.id?.toString() ?? product.name,
      name: product.name,
      count: Number(!!product.boughtFrom) + Number(!!product.soldTo),
      product,
    })),
    productReportSort
  );

  const clientReportsPagination = paginate(clientReportRows, clientReportPage);
  const productReportsPagination = paginate(productReportRows, productReportPage);

  const salesPeriodRangeOk =
    salesPeriodFrom.trim().length > 0 && salesPeriodTo.trim().length > 0;
  const salesPeriodInvalidOrder =
    salesPeriodRangeOk && salesPeriodFrom.trim() > salesPeriodTo.trim();

  const salesPeriodRawList = products.filter((p) => {
    if (!productQualifiesAsSold(p)) return false;
    if (!salesPeriodRangeOk || salesPeriodInvalidOrder) return false;
    if (!isSaleWithinPeriod(p, salesPeriodFrom, salesPeriodTo, salesPeriodExcludeUndated)) return false;
    const q = salesPeriodSearch.toLowerCase().trim();
    if (!q) return true;
    const buyer = (typeof p.soldTo === "string" && p.soldTo.trim()
      ? clientsById.get(p.soldTo)?.name ?? ""
      : ""
    ).toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.brand ?? "").toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q) ||
      buyer.includes(q)
    );
  });
  const salesPeriodList = sortSalesPeriodProducts(salesPeriodRawList, salesPeriodSort);
  const salesPeriodPagination = paginate(salesPeriodList, salesPeriodPage);
  const salesPeriodTotals = salesPeriodList.reduce(
    (acc, p) => {
      acc.sales += p.price ?? 0;
      acc.cost += p.purchasePrice ?? 0;
      return acc;
    },
    { sales: 0, cost: 0 }
  );
  const salesPeriodTotalAmount = salesPeriodTotals.sales;
  const salesPeriodTotalCost = salesPeriodTotals.cost;
  const salesPeriodTotalProfit = salesPeriodTotalAmount - salesPeriodTotalCost;

  const toCsvCell = (value: string | number | null | undefined) => {
    const raw = String(value ?? "");
    return `"${raw.replace(/"/g, '""')}"`;
  };

  const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number>>) => {
    const csv = [headers.map(toCsvCell).join(","), ...rows.map((r) => r.map(toCsvCell).join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedClientProducts = selectedClientReport
    ? getRelatedByClient(
        selectedClientReport.id,
        clientReportMode,
        clientReportDateFrom,
        clientReportDateTo
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/" aria-label="Volver al inicio">
                <ArrowLeft className="h-5 w-5" aria-hidden />
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

          <AccordionItem value="reports" className="border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Reportes</span>
                </div>
                <span className="text-xs text-muted-foreground">Clientes y productos relacionados</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-6">
              <Accordion type="multiple" defaultValue={["report-clients"]} className="space-y-3">
                <AccordionItem value="report-clients" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="text-left">
                      <p className="font-medium">Reporte por cliente / proveedor</p>
                      <p className="text-xs text-muted-foreground">
                        Muestra una fila por cliente/proveedor con cantidad de productos relacionados.
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Ver</span>
                    <button
                      type="button"
                      onClick={() => {
                        setClientReportMode((prev) =>
                          prev === "purchase" ? "sales" : "purchase"
                        );
                        setClientReportPage(1);
                      }}
                      className={`relative inline-flex h-12 sm:h-10 w-full sm:w-[32rem] max-w-full items-center rounded-full border p-1.5 transition-colors ${
                        clientReportMode === "sales"
                          ? "bg-blue-500/15 border-blue-500/40"
                          : "bg-emerald-500/15 border-emerald-500/40"
                      }`}
                      aria-label="Cambiar modo de reporte por cliente"
                    >
                      <span
                        className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-transform ${
                          clientReportMode === "sales"
                          ? "translate-x-[calc(100%+0.25rem)] bg-blue-600"
                            : "translate-x-0 bg-emerald-600"
                        }`}
                      />
                      <span className="relative z-10 flex w-full text-[11px] sm:text-sm font-medium px-1 sm:px-2">
                        <span
                          className={`w-1/2 text-center px-2 sm:px-5 whitespace-nowrap transition-colors ${
                            clientReportMode === "purchase" ? "text-white" : "text-foreground"
                          }`}
                        >
                          Compras / consignación
                        </span>
                        <span
                          className={`w-1/2 text-center px-2 sm:px-5 whitespace-nowrap transition-colors ${
                            clientReportMode === "sales" ? "text-white" : "text-foreground"
                          }`}
                        >
                          Ventas
                        </span>
                      </span>
                    </button>
                  </div>

                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente/proveedor..."
                    value={clientReportSearch}
                    onChange={(e) => {
                      setClientReportSearch(e.target.value);
                      setClientReportPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 text-sm items-start sm:items-end">
                  <div className="space-y-1">
                    <label htmlFor="client-report-from" className="text-xs text-muted-foreground">
                      Fecha desde
                    </label>
                    <Input
                      id="client-report-from"
                      type="date"
                      value={clientReportDateFrom}
                      onChange={(e) => {
                        setClientReportDateFrom(e.target.value);
                        setClientReportPage(1);
                      }}
                      className="w-full sm:w-[11rem]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="client-report-to" className="text-xs text-muted-foreground">
                      Fecha hasta
                    </label>
                    <Input
                      id="client-report-to"
                      type="date"
                      value={clientReportDateTo}
                      onChange={(e) => {
                        setClientReportDateTo(e.target.value);
                        setClientReportPage(1);
                      }}
                      className="w-full sm:w-[11rem]"
                    />
                  </div>
                  {(clientReportDateFrom || clientReportDateTo) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        setClientReportDateFrom("");
                        setClientReportDateTo("");
                        setClientReportPage(1);
                      }}
                    >
                      Limpiar fechas
                    </Button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm w-full sm:w-auto">
                    <span>Ordenar:</span>
                    <select
                      className="border rounded-md px-2 py-1 bg-background w-full sm:w-auto min-w-0"
                      value={clientReportSort}
                      onChange={(e) => {
                        setClientReportSort(e.target.value as ReportSort);
                        setClientReportPage(1);
                      }}
                    >
                      <option value="count-desc">Cantidad (mayor a menor)</option>
                      <option value="count-asc">Cantidad (menor a mayor)</option>
                      <option value="name-asc">Nombre (A-Z)</option>
                      <option value="name-desc">Nombre (Z-A)</option>
                    </select>
                  </div>
                  {/* Export CSV oculto temporalmente */}
                </div>

                <div className="space-y-3 md:hidden">
                  {clientReportsPagination.pageItems.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className="w-full border rounded-lg p-3 text-left space-y-2 hover:bg-muted/30"
                      onClick={() => {
                        const selected = clientsById.get(row.id);
                        if (selected) setSelectedClientReport(selected);
                      }}
                    >
                      <p className="font-medium">{row.name}</p>
                      <p className="text-sm text-muted-foreground">{row.phone || "Sin teléfono"}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{row.dateLabel}</span>
                        <Badge variant="outline">{row.count}</Badge>
                      </div>
                    </button>
                  ))}
                  {clientReportRows.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      No se encontraron clientes/proveedores para este filtro
                    </div>
                  )}
                </div>

                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/40 border-b">
                          <th className="text-left p-3 text-sm font-medium">Cliente / Proveedor</th>
                          <th className="text-left p-3 text-sm font-medium">Teléfono</th>
                          <th className="text-left p-3 text-sm font-medium">
                            {clientReportMode === "purchase"
                              ? "Última compra / consignación"
                              : "Última venta"}
                          </th>
                          <th className="text-right p-3 text-sm font-medium">Productos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientReportsPagination.pageItems.map((row) => (
                          <tr
                            key={row.id}
                            className="cursor-pointer hover:bg-muted/30 border-b last:border-0"
                            onClick={() => {
                              const selected = clientsById.get(row.id);
                              if (selected) setSelectedClientReport(selected);
                            }}
                          >
                            <td className="p-3 font-medium">{row.name}</td>
                            <td className="p-3 text-muted-foreground">{row.phone}</td>
                            <td className="p-3 text-muted-foreground whitespace-nowrap">{row.dateLabel}</td>
                            <td className="p-3 text-right">
                              <Badge variant="outline">{row.count}</Badge>
                            </td>
                          </tr>
                        ))}
                        {clientReportRows.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-muted-foreground">
                              No se encontraron clientes/proveedores para este filtro
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Mostrando {clientReportsPagination.pageItems.length} de {clientReportRows.length}
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clientReportsPagination.page <= 1}
                      onClick={() => setClientReportPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <span>
                      Página {clientReportsPagination.page} de {clientReportsPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clientReportsPagination.page >= clientReportsPagination.totalPages}
                      onClick={() =>
                        setClientReportPage((p) =>
                          Math.min(clientReportsPagination.totalPages, p + 1)
                        )
                      }
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="report-products" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="text-left">
                      <p className="font-medium">Reporte por producto</p>
                      <p className="text-xs text-muted-foreground">
                        Permite ver qué cliente/proveedor compró o consignó, y a quién se vendió.
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                    <span className="text-muted-foreground">Ver</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProductReportMode((prev) =>
                          prev === "purchase" ? "sales" : "purchase"
                        );
                        setProductReportPage(1);
                      }}
                      className={`relative inline-flex h-12 sm:h-10 w-full sm:w-[32rem] max-w-full items-center rounded-full border p-1.5 transition-colors ${
                        productReportMode === "sales"
                          ? "bg-blue-500/15 border-blue-500/40"
                          : "bg-emerald-500/15 border-emerald-500/40"
                      }`}
                      aria-label="Cambiar modo de reporte por producto"
                    >
                      <span
                        className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-transform ${
                          productReportMode === "sales"
                          ? "translate-x-[calc(100%+0.25rem)] bg-blue-600"
                            : "translate-x-0 bg-emerald-600"
                        }`}
                      />
                      <span className="relative z-10 flex w-full text-[11px] sm:text-sm font-medium px-1 sm:px-2">
                        <span
                          className={`w-1/2 text-center px-2 sm:px-5 whitespace-nowrap transition-colors ${
                            productReportMode === "purchase" ? "text-white" : "text-foreground"
                          }`}
                        >
                          Compras / consignación
                        </span>
                        <span
                          className={`w-1/2 text-center px-2 sm:px-5 whitespace-nowrap transition-colors ${
                            productReportMode === "sales" ? "text-white" : "text-foreground"
                          }`}
                        >
                          Ventas
                        </span>
                      </span>
                    </button>
                  </div>

                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={productReportSearch}
                    onChange={(e) => {
                      setProductReportSearch(e.target.value);
                      setProductReportPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 text-sm items-start sm:items-end">
                  <div className="space-y-1">
                    <label htmlFor="product-report-from" className="text-xs text-muted-foreground">
                      Fecha desde
                    </label>
                    <Input
                      id="product-report-from"
                      type="date"
                      value={productReportDateFrom}
                      onChange={(e) => {
                        setProductReportDateFrom(e.target.value);
                        setProductReportPage(1);
                      }}
                      className="w-full sm:w-[11rem]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="product-report-to" className="text-xs text-muted-foreground">
                      Fecha hasta
                    </label>
                    <Input
                      id="product-report-to"
                      type="date"
                      value={productReportDateTo}
                      onChange={(e) => {
                        setProductReportDateTo(e.target.value);
                        setProductReportPage(1);
                      }}
                      className="w-full sm:w-[11rem]"
                    />
                  </div>
                  {(productReportDateFrom || productReportDateTo) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        setProductReportDateFrom("");
                        setProductReportDateTo("");
                        setProductReportPage(1);
                      }}
                    >
                      Limpiar fechas
                    </Button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm w-full sm:w-auto">
                    <span>Ordenar:</span>
                    <select
                      className="border rounded-md px-2 py-1 bg-background w-full sm:w-auto min-w-0"
                      value={productReportSort}
                      onChange={(e) => {
                        setProductReportSort(e.target.value as ReportSort);
                        setProductReportPage(1);
                      }}
                    >
                      <option value="name-asc">Nombre (A-Z)</option>
                      <option value="name-desc">Nombre (Z-A)</option>
                      <option value="count-desc">Cantidad relaciones (mayor a menor)</option>
                      <option value="count-asc">Cantidad relaciones (menor a mayor)</option>
                    </select>
                  </div>
                  {/* Export CSV oculto temporalmente */}
                </div>

                <div className="space-y-3 md:hidden">
                  {productReportsPagination.pageItems.map(({ product }) => {
                    const boughtBy = clientsById.get(product.boughtFrom)?.name ?? "Sin dato";
                    const soldTo = clientsById.get(product.soldTo)?.name ?? "Sin dato";
                    const rawDate =
                      productReportMode === "purchase" ? product.purchaseDate : product.saleDate;
                    const dateKey = normalizeReportDateKey(rawDate);
                    const dateCell = dateKey ? formatReportDateDisplay(dateKey) : "—";
                    return (
                      <button
                        key={product.id}
                        type="button"
                        className="w-full border rounded-lg p-3 text-left space-y-2 hover:bg-muted/30"
                        onClick={() => setSelectedProductReport(product)}
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{dateCell}</p>
                        <p className="text-sm text-muted-foreground">
                          {productReportMode === "purchase" ? boughtBy : soldTo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {productReportMode === "purchase"
                            ? `Vendido a: ${soldTo}`
                            : `Origen: ${boughtBy}`}
                        </p>
                      </button>
                    );
                  })}
                  {productReportRows.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      No se encontraron productos para este filtro
                    </div>
                  )}
                </div>

                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/40 border-b">
                          <th className="text-left p-3 text-sm font-medium">Producto</th>
                          <th className="text-left p-3 text-sm font-medium whitespace-nowrap">
                            {productReportMode === "purchase"
                              ? "Fecha compra / consignación"
                              : "Fecha venta"}
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            {productReportMode === "purchase"
                              ? "Comprado / consignado de"
                              : "Vendido a"}
                          </th>
                          <th className="text-left p-3 text-sm font-medium">Contraparte adicional</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productReportsPagination.pageItems.map(({ product }) => {
                          const boughtBy = clientsById.get(product.boughtFrom)?.name ?? "Sin dato";
                          const soldTo = clientsById.get(product.soldTo)?.name ?? "Sin dato";
                          const rawDate =
                            productReportMode === "purchase"
                              ? product.purchaseDate
                              : product.saleDate;
                          const dateKey = normalizeReportDateKey(rawDate);
                          const dateCell = dateKey ? formatReportDateDisplay(dateKey) : "—";
                          return (
                            <tr
                              key={product.id}
                              className="cursor-pointer hover:bg-muted/30 border-b last:border-0"
                              onClick={() => setSelectedProductReport(product)}
                            >
                              <td className="p-3 font-medium">{product.name}</td>
                              <td className="p-3 text-muted-foreground whitespace-nowrap">{dateCell}</td>
                              <td className="p-3 text-muted-foreground">
                                {productReportMode === "purchase" ? boughtBy : soldTo}
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {productReportMode === "purchase" ? `Vendido a: ${soldTo}` : `Origen: ${boughtBy}`}
                              </td>
                            </tr>
                          );
                        })}
                        {productReportRows.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-muted-foreground">
                              No se encontraron productos para este filtro
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Mostrando {productReportsPagination.pageItems.length} de {productReportRows.length}
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={productReportsPagination.page <= 1}
                      onClick={() => setProductReportPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <span>
                      Página {productReportsPagination.page} de {productReportsPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={productReportsPagination.page >= productReportsPagination.totalPages}
                      onClick={() =>
                        setProductReportPage((p) =>
                          Math.min(productReportsPagination.totalPages, p + 1)
                        )
                      }
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="report-sales-period" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="text-left">
                      <p className="font-medium">Ventas por período</p>
                      <p className="text-xs text-muted-foreground">
                        Elegí un rango de fechas y revisá todos los productos vendidos en ese período.
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {!salesPeriodRangeOk && (
                      <p className="text-sm text-foreground border border-primary/30 bg-primary/5 rounded-lg px-3 py-2">
                        Completá <strong>fecha desde</strong> y <strong>fecha hasta</strong> para listar las
                        ventas de ese rango.
                      </p>
                    )}
                    {salesPeriodInvalidOrder && (
                      <p className="text-sm text-destructive border border-destructive/40 bg-destructive/10 rounded-lg px-3 py-2">
                        La fecha desde no puede ser posterior a la fecha hasta.
                      </p>
                    )}
                    {salesPeriodRangeOk && !salesPeriodInvalidOrder && (
                      <p className="text-sm text-foreground">
                        <span className="font-medium text-foreground">{salesPeriodList.length}</span>{" "}
                        {salesPeriodList.length === 1 ? "venta" : "ventas"} en el período
                        {salesPeriodList.length > 0 && (
                          <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span>
                              · Venta total{" "}
                              <span className="font-medium text-foreground">
                                {formatSalesReportArs(salesPeriodTotalAmount)}
                              </span>
                            </span>
                            <span>
                              · Costo{" "}
                              <span className="font-medium text-foreground">
                                {formatSalesReportArs(salesPeriodTotalCost)}
                              </span>
                            </span>
                            <span>
                              · Ganancia{" "}
                              <span
                                className={`font-medium ${
                                  salesPeriodTotalProfit >= 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-destructive"
                                }`}
                              >
                                {formatSalesReportArs(salesPeriodTotalProfit)}
                              </span>
                            </span>
                          </span>
                        )}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 text-sm items-start sm:items-end">
                      <div className="space-y-1">
                        <label htmlFor="sales-period-from" className="text-xs text-muted-foreground">
                          Fecha desde
                        </label>
                        <Input
                          id="sales-period-from"
                          type="date"
                          value={salesPeriodFrom}
                          onChange={(e) => {
                            setSalesPeriodFrom(e.target.value);
                            setSalesPeriodPage(1);
                          }}
                          className="w-full sm:w-44"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="sales-period-to" className="text-xs text-muted-foreground">
                          Fecha hasta
                        </label>
                        <Input
                          id="sales-period-to"
                          type="date"
                          value={salesPeriodTo}
                          onChange={(e) => {
                            setSalesPeriodTo(e.target.value);
                            setSalesPeriodPage(1);
                          }}
                          className="w-full sm:w-44"
                        />
                      </div>
                      {(salesPeriodFrom || salesPeriodTo) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => {
                            setSalesPeriodFrom("");
                            setSalesPeriodTo("");
                            setSalesPeriodPage(1);
                          }}
                        >
                          Limpiar fechas
                        </Button>
                      )}
                    </div>

                    <div className="relative max-w-sm w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por producto, categoría, marca o comprador..."
                        value={salesPeriodSearch}
                        onChange={(e) => {
                          setSalesPeriodSearch(e.target.value);
                          setSalesPeriodPage(1);
                        }}
                        className="pl-10"
                        disabled={!salesPeriodRangeOk || salesPeriodInvalidOrder}
                      />
                    </div>

                    <label className="flex items-start gap-2 text-sm cursor-pointer max-w-xl">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-input shrink-0"
                        checked={salesPeriodExcludeUndated}
                        onChange={(e) => {
                          setSalesPeriodExcludeUndated(e.target.checked);
                          setSalesPeriodPage(1);
                        }}
                        disabled={!salesPeriodRangeOk || salesPeriodInvalidOrder}
                      />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Solo ventas con fecha</strong> dentro del
                        rango (ocultar productos vendidos que no tengan &quot;Fecha venta&quot;
                        cargada).
                      </span>
                    </label>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm w-full sm:w-auto">
                        <span>Ordenar:</span>
                        <select
                          className="border rounded-md px-2 py-1 bg-background disabled:opacity-50 w-full sm:w-auto min-w-0"
                          value={salesPeriodSort}
                          disabled={!salesPeriodRangeOk || salesPeriodInvalidOrder}
                          onChange={(e) => {
                            setSalesPeriodSort(e.target.value as SalesPeriodSort);
                            setSalesPeriodPage(1);
                          }}
                        >
                          <option value="sale-date-desc">Fecha venta (más reciente)</option>
                          <option value="sale-date-asc">Fecha venta (más antigua)</option>
                          <option value="name-asc">Nombre (A-Z)</option>
                          <option value="name-desc">Nombre (Z-A)</option>
                          <option value="price-desc">Precio (mayor a menor)</option>
                          <option value="price-asc">Precio (menor a mayor)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 md:hidden">
                      {salesPeriodPagination.pageItems.map((product) => {
                        const hasBuyer =
                          typeof product.soldTo === "string" &&
                          product.soldTo.trim().length > 0;
                        const buyer = hasBuyer
                          ? clientsById.get(product.soldTo)?.name ?? "Sin dato"
                          : product.soldOut
                            ? "Vendido (sin comprador)"
                            : "—";
                        const saleKey = normalizeReportDateKey(product.saleDate);
                        const dateLabel = saleKey ? formatReportDateDisplay(saleKey) : "—";
                        const sale = product.price ?? 0;
                        const cost = product.purchasePrice ?? 0;
                        const profit = sale - cost;
                        const pid = product.id?.toString() ?? "";
                        return (
                          <div
                            key={product.id ?? product.name + saleKey}
                            className="border rounded-lg p-3 space-y-2"
                          >
                            <button
                              type="button"
                              className="w-full text-left space-y-2"
                              onClick={() => setSelectedProductReport(product)}
                            >
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{dateLabel}</p>
                              <p className="text-sm text-muted-foreground">{buyer}</p>
                            </button>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Venta</p>
                                <p className="font-medium">{formatSalesReportArs(sale)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Costo</p>
                                <p className="font-medium">{formatSalesReportArs(cost)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ganancia</p>
                                <p
                                  className={
                                    profit >= 0
                                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                                      : "font-medium text-destructive"
                                  }
                                >
                                  {formatSalesReportArs(profit)}
                                </p>
                              </div>
                            </div>
                            {pid ? (
                              <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={`/admin/producto/${pid}`}>Editar</Link>
                              </Button>
                            ) : null}
                          </div>
                        );
                      })}
                      {salesPeriodRangeOk && !salesPeriodInvalidOrder && salesPeriodList.length === 0 && (
                        <div className="text-center py-8 text-sm text-foreground/80 border rounded-lg">
                          No hay resultados con los filtros actuales. Si tenés activada la opción
                          &quot;Solo ventas con fecha&quot;, los vendidos sin fecha no aparecen.
                        </div>
                      )}
                      {(!salesPeriodRangeOk || salesPeriodInvalidOrder) && (
                        <div className="text-center py-8 text-sm text-foreground/80 border rounded-lg">
                          Indicá un rango de fechas válido para ver los productos vendidos.
                        </div>
                      )}
                    </div>

                    <div className="hidden md:block border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/40 border-b">
                              <th className="text-left p-3 text-sm font-medium">Producto</th>
                              <th className="text-left p-3 text-sm font-medium whitespace-nowrap">
                                Fecha venta
                              </th>
                              <th className="text-left p-3 text-sm font-medium">Vendido a</th>
                              <th className="text-right p-3 text-sm font-medium whitespace-nowrap">
                                Precio venta
                              </th>
                              <th className="text-right p-3 text-sm font-medium whitespace-nowrap">
                                Costo
                              </th>
                              <th className="text-right p-3 text-sm font-medium whitespace-nowrap">
                                Ganancia
                              </th>
                              <th className="text-left p-3 text-sm font-medium w-[1%]">
                                <span className="sr-only">Acciones</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {salesPeriodPagination.pageItems.map((product) => {
                              const hasBuyer =
                                typeof product.soldTo === "string" &&
                                product.soldTo.trim().length > 0;
                              const buyer = hasBuyer
                                ? clientsById.get(product.soldTo)?.name ?? "Sin dato"
                                : product.soldOut
                                  ? "Vendido (sin comprador)"
                                  : "—";
                              const saleKey = normalizeReportDateKey(product.saleDate);
                              const dateLabel = saleKey ? formatReportDateDisplay(saleKey) : "—";
                              const pid = product.id?.toString() ?? "";
                              const sale = product.price ?? 0;
                              const cost = product.purchasePrice ?? 0;
                              const profit = sale - cost;
                              return (
                                <tr
                                  key={product.id ?? product.name + saleKey}
                                  className="cursor-pointer hover:bg-muted/30 border-b last:border-0"
                                  onClick={() => setSelectedProductReport(product)}
                                >
                                  <td className="p-3 font-medium">{product.name}</td>
                                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                                    {dateLabel}
                                  </td>
                                  <td className="p-3 text-muted-foreground">{buyer}</td>
                                  <td className="p-3 text-right whitespace-nowrap font-medium">
                                    {formatSalesReportArs(sale)}
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap text-muted-foreground">
                                    {formatSalesReportArs(cost)}
                                  </td>
                                  <td
                                    className={`p-3 text-right whitespace-nowrap font-medium ${
                                      profit >= 0
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-destructive"
                                    }`}
                                  >
                                    {formatSalesReportArs(profit)}
                                  </td>
                                  <td className="p-3">
                                    {pid ? (
                                      <Button variant="ghost" size="sm" className="h-8" asChild>
                                        <Link
                                          href={`/admin/producto/${pid}`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Editar
                                        </Link>
                                      </Button>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                            {salesPeriodRangeOk &&
                              !salesPeriodInvalidOrder &&
                              salesPeriodList.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="text-center py-8 text-sm text-foreground/80"
                                  >
                                    No hay resultados con los filtros actuales. Si tenés activada la
                                    opción &quot;Solo ventas con fecha&quot;, los vendidos sin fecha
                                    no aparecen. Se listan productos con <strong>Vendido a</strong> o
                                    marcados como <strong>vendido</strong>. Las fechas se leen aunque
                                    vengan como timestamp desde la base.
                                  </td>
                                </tr>
                              )}
                            {(!salesPeriodRangeOk || salesPeriodInvalidOrder) && (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="text-center py-8 text-sm text-foreground/80"
                                >
                                  Indicá un rango de fechas válido para ver los productos vendidos.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        Mostrando {salesPeriodPagination.pageItems.length} de {salesPeriodList.length}
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            salesPeriodPagination.page <= 1 ||
                            !salesPeriodRangeOk ||
                            salesPeriodInvalidOrder
                          }
                          onClick={() => setSalesPeriodPage((p) => Math.max(1, p - 1))}
                        >
                          Anterior
                        </Button>
                        <span>
                          Página {salesPeriodPagination.page} de {salesPeriodPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            salesPeriodPagination.page >= salesPeriodPagination.totalPages ||
                            !salesPeriodRangeOk ||
                            salesPeriodInvalidOrder
                          }
                          onClick={() =>
                            setSalesPeriodPage((p) =>
                              Math.min(salesPeriodPagination.totalPages, p + 1)
                            )
                          }
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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

      <Dialog open={!!selectedClientReport} onOpenChange={(open) => !open && setSelectedClientReport(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {clientReportMode === "sales" ? "Ventas a" : "Compras / consignación de"}{" "}
              {selectedClientReport?.name}
            </DialogTitle>
            <DialogDescription>
              Productos relacionados a este cliente/proveedor según el filtro seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left p-3 text-sm font-medium">Producto</th>
                  <th className="text-left p-3 text-sm font-medium">Categoría</th>
                  <th className="text-left p-3 text-sm font-medium whitespace-nowrap">
                    {clientReportMode === "purchase"
                      ? "Fecha compra / consignación"
                      : "Fecha venta"}
                  </th>
                  <th className="text-left p-3 text-sm font-medium">Estado relación</th>
                </tr>
              </thead>
              <tbody>
                {selectedClientProducts.map((product) => {
                  const raw =
                    clientReportMode === "purchase" ? product.purchaseDate : product.saleDate;
                  const dKey = normalizeReportDateKey(raw);
                  const dLabel = dKey ? formatReportDateDisplay(dKey) : "—";
                  return (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-muted-foreground">{product.category}</td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{dLabel}</td>
                      <td className="p-3 text-muted-foreground">
                        {clientReportMode === "sales"
                          ? "Vendido"
                          : product.isConsigned
                            ? "Consignado"
                            : "Comprado"}
                      </td>
                    </tr>
                  );
                })}
                {selectedClientProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      Sin productos relacionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProductReport} onOpenChange={(open) => !open && setSelectedProductReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProductReport?.name}</DialogTitle>
            <DialogDescription>Relación del producto con cliente/proveedor.</DialogDescription>
          </DialogHeader>
          {selectedProductReport && (
            <div className="space-y-3 text-sm">
              <div className="border rounded-lg p-3">
                <p className="font-medium mb-1">Origen</p>
                <p className="text-muted-foreground">
                  {selectedProductReport.isConsigned ? "Consignado de" : "Comprado a"}:{" "}
                  {clientsById.get(selectedProductReport.boughtFrom)?.name ?? "Sin dato"}
                </p>
                <p className="text-muted-foreground mt-1">
                  Fecha compra / consignación:{" "}
                  {formatReportDateDisplay(normalizeReportDateKey(selectedProductReport.purchaseDate) ?? "")}
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="font-medium mb-1">Venta</p>
                <p className="text-muted-foreground">
                  Vendido a: {clientsById.get(selectedProductReport.soldTo)?.name ?? "Sin dato"}
                </p>
                <p className="text-muted-foreground mt-1">
                  Fecha venta:{" "}
                  {formatReportDateDisplay(normalizeReportDateKey(selectedProductReport.saleDate) ?? "")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
