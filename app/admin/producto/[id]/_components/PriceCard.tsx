"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import type { ProductFormValues } from "@/features/admin";
import type { UseFormReturn } from "react-hook-form";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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

  const isConsigned = form.watch("isConsigned");
  const boughtFrom = form.watch("boughtFrom");
  const soldTo = form.watch("soldTo");

  const filteredBoughtClients = useMemo(() => {
    const q = boughtSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, boughtSearch]);

  const filteredSoldClients = useMemo(() => {
    const q = soldSearch.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, soldSearch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Precio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Origen: compra / consignación */}
        <div className="space-y-3 border rounded-lg p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-foreground">Origen de la prenda</span>
              <p className="text-xs text-muted-foreground">
                Indicá si la prenda fue comprada o consignada y de quién proviene.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">Comprado</span>
              <Switch
                checked={!!isConsigned}
                onCheckedChange={(checked) => form.setValue("isConsigned", checked)}
              />
              <span className="text-xs text-muted-foreground">Consignado</span>
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
