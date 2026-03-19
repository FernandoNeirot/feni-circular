"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { clientsQueryOptions } from "@/shared/queries/clients";
import type { Client } from "@/shared/types/client";

type PriceCardProps = {
  form: UseFormReturn<ProductFormValues>;
};

export function PriceCard({ form }: PriceCardProps) {
  const { data: clientsData } = useQuery(clientsQueryOptions);
  const clients = (clientsData ?? []) as Client[];

  const [boughtSearch, setBoughtSearch] = useState("");
  const [soldSearch, setSoldSearch] = useState("");
  const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
  const [saleDateOpen, setSaleDateOpen] = useState(false);

  const isConsigned = form.watch("isConsigned");
  const boughtFrom = form.watch("boughtFrom");
  const soldTo = form.watch("soldTo");
  const purchaseDate = form.watch("purchaseDate");
  const saleDate = form.watch("saleDate");

  const filteredBoughtClients = useMemo(() => {
    const q = boughtSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, boughtSearch]);

  const filteredSoldClients = useMemo(() => {
    const q = soldSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, soldSearch]);

  const formatDisplayDate = (value?: string) => {
    if (!value) return "Seleccionar fecha";
    try {
      return format(parseISO(value), "dd/MM/yyyy");
    } catch {
      return "Seleccionar fecha";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Precio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Origen: compra / consignación */}
        <div
          className={cn(
            "space-y-3 rounded-xl border p-3 transition-colors",
            isConsigned
              ? "border-teal-500/40 bg-teal-500/8 dark:bg-teal-950/25"
              : "border-emerald-500/40 bg-emerald-500/8 dark:bg-emerald-950/25"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-foreground">Origen de la prenda</span>
              <p className="text-xs text-muted-foreground">
                Indicá si la prenda fue comprada o consignada y de quién proviene.
              </p>
            </div>
            <button
              type="button"
              onClick={() => form.setValue("isConsigned", !isConsigned)}
              className={cn(
                "relative inline-flex h-10 w-full max-w-[28rem] shrink-0 items-center rounded-full border p-1.5 transition-colors sm:w-[28rem]",
                isConsigned
                  ? "border-teal-500/40 bg-teal-500/15"
                  : "border-emerald-500/40 bg-emerald-500/15"
              )}
              role="switch"
              aria-checked={isConsigned}
              aria-label={
                isConsigned
                  ? "Origen consignado; tocar para marcar como comprado"
                  : "Origen comprado; tocar para marcar como consignado"
              }
            >
              <span
                className={cn(
                  "absolute top-1 h-7 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-transform",
                  isConsigned
                    ? "translate-x-[calc(100%+0.25rem)] bg-teal-600"
                    : "translate-x-0 bg-emerald-600"
                )}
              />
              <span className="relative z-10 flex w-full text-sm font-medium px-2">
                <span
                  className={cn(
                    "w-1/2 text-center px-4 whitespace-nowrap transition-colors",
                    !isConsigned ? "text-white" : "text-foreground"
                  )}
                >
                  Comprado
                </span>
                <span
                  className={cn(
                    "w-1/2 text-center px-4 whitespace-nowrap transition-colors",
                    isConsigned ? "text-white" : "text-foreground"
                  )}
                >
                  Consignado
                </span>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="boughtFrom">
                {isConsigned ? "Consignado de" : "Comprado a"}
              </Label>
              <Select
                value={boughtFrom ?? ""}
                onValueChange={(value) => form.setValue("boughtFrom", value)}
              >
                <SelectTrigger id="boughtFrom">
                  <SelectValue placeholder="Seleccioná un cliente / proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-1 pt-1.5 sticky top-0 bg-popover z-10">
                    <Input
                      autoFocus
                      placeholder="Buscar..."
                      value={boughtSearch}
                      onChange={(e) => setBoughtSearch(e.target.value)}
                      onKeyDown={(e) => {
                        // Evitar que el Select procese las teclas: solo queremos filtrar
                        e.stopPropagation();
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  {filteredBoughtClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  {filteredBoughtClients.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No hay clientes que coincidan
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">
                {isConsigned ? "Precio de consignación" : "Precio de compra"}
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                min={0}
                {...form.register("purchasePrice")}
                placeholder="800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">
                {isConsigned ? "Fecha de consignación" : "Fecha de compra"}
              </Label>
              <Button
                id="purchaseDate"
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setPurchaseDateOpen(true)}
              >
                <CalendarDays className="h-4 w-4" />
                {formatDisplayDate(purchaseDate)}
              </Button>
              <Dialog open={purchaseDateOpen} onOpenChange={setPurchaseDateOpen}>
                <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="px-5 pt-5">
                      {isConsigned ? "Seleccionar fecha de consignación" : "Seleccionar fecha de compra"}
                    </DialogTitle>
                    <DialogDescription className="px-5">
                      Elegí la fecha en que se compró o consignó esta prenda.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-between px-5 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        form.setValue("purchaseDate", "");
                        setPurchaseDateOpen(false);
                      }}
                    >
                      Limpiar
                    </Button>
                  </div>
                  <div className="px-3 pb-4">
                    <DayPicker
                      mode="single"
                      locale={es}
                      selected={purchaseDate ? parseISO(purchaseDate) : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        form.setValue("purchaseDate", format(date, "yyyy-MM-dd"));
                        setPurchaseDateOpen(false);
                      }}
                      className="mx-auto rounded-lg border bg-card p-3"
                      classNames={{
                        months: "flex justify-center",
                        month: "space-y-3",
                        caption: "flex items-center justify-between px-1",
                        caption_label: "text-sm font-semibold",
                        nav: "flex items-center gap-1",
                        button_previous:
                          "h-8 w-8 rounded-md border border-input bg-background hover:bg-accent",
                        button_next:
                          "h-8 w-8 rounded-md border border-input bg-background hover:bg-accent",
                        week: "flex w-full mt-1",
                        weekdays: "flex",
                        weekday:
                          "w-9 h-8 flex items-center justify-center text-[11px] font-medium text-muted-foreground",
                        day: "h-9 w-9 p-0 font-normal",
                        day_button:
                          "h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                        today: "text-primary font-semibold",
                        selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Venta */}
        <div className="space-y-3 border rounded-lg p-3">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-foreground">Venta</span>
            <p className="text-xs text-muted-foreground">
              Seleccioná a quién se vendió y el precio de venta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soldTo">Vendido a</Label>
              <Select value={soldTo ?? ""} onValueChange={(value) => form.setValue("soldTo", value)}>
                <SelectTrigger id="soldTo">
                  <SelectValue placeholder="Seleccioná un cliente" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-1 pt-1.5 sticky top-0 bg-popover z-10">
                    <Input
                      autoFocus
                      placeholder="Buscar..."
                      value={soldSearch}
                      onChange={(e) => setSoldSearch(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  {filteredSoldClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  {filteredSoldClients.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No hay clientes que coincidan
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio de venta *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                className={cn(
                  form.formState.errors.price && "border-destructive focus-visible:ring-destructive"
                )}
                {...form.register("price")}
                placeholder="1200"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Precio original</Label>
              <Input
                id="originalPrice"
                type="number"
                min={0}
                {...form.register("originalPrice")}
                placeholder="4500"
              />
              <p className="text-[11px] text-muted-foreground">
                Precio como nuevo. Se usa para mostrar el descuento sobre el precio de venta.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleDate">Fecha de venta</Label>
              <Button
                id="saleDate"
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setSaleDateOpen(true)}
              >
                <CalendarDays className="h-4 w-4" />
                {formatDisplayDate(saleDate)}
              </Button>
              <Dialog open={saleDateOpen} onOpenChange={setSaleDateOpen}>
                <DialogContent className="w-[95vw] max-w-[420px] p-0 overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="px-5 pt-5">Seleccionar fecha de venta</DialogTitle>
                    <DialogDescription className="px-5">
                      Elegí la fecha en que se vendió esta prenda.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-between px-5 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        form.setValue("saleDate", "");
                        setSaleDateOpen(false);
                      }}
                    >
                      Limpiar
                    </Button>
                  </div>
                  <div className="px-3 pb-4">
                    <DayPicker
                      mode="single"
                      locale={es}
                      selected={saleDate ? parseISO(saleDate) : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        form.setValue("saleDate", format(date, "yyyy-MM-dd"));
                        setSaleDateOpen(false);
                      }}
                      className="mx-auto rounded-lg border bg-card p-3"
                      classNames={{
                        months: "flex justify-center",
                        month: "space-y-3",
                        caption: "flex items-center justify-between px-1",
                        caption_label: "text-sm font-semibold",
                        nav: "flex items-center gap-1",
                        button_previous:
                          "h-8 w-8 rounded-md border border-input bg-background hover:bg-accent",
                        button_next:
                          "h-8 w-8 rounded-md border border-input bg-background hover:bg-accent",
                        week: "flex w-full mt-1",
                        weekdays: "flex",
                        weekday:
                          "w-9 h-8 flex items-center justify-center text-[11px] font-medium text-muted-foreground",
                        day: "h-9 w-9 p-0 font-normal",
                        day_button:
                          "h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                        today: "text-primary font-semibold",
                        selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
