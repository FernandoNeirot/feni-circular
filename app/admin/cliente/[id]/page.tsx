"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Client } from "@/shared/types/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { clientsQueryKey } from "@/shared/queries/clients";
import { createClient, updateClient, getClient } from "@/shared/serverActions/clients";

export default function AdminClienteFormPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params?.id as string | undefined;
  const isEditing = id && id !== "nuevo";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(Boolean(isEditing));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing || !id) return;
    getClient(id).then((client) => {
      if (client) {
        setName(client.name ?? "");
        setPhone(client.phone ?? "");
        setAddress(client.address ?? "");
      } else {
        toast.error("Cliente no encontrado");
      }
      setLoading(false);
    });
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = name.trim();
    const phoneTrim = phone.trim();
    const addressTrim = address.trim();
    if (!nameTrim) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!phoneTrim) {
      toast.error("El teléfono es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const data = { name: nameTrim, phone: phoneTrim, address: addressTrim };
      if (isEditing && id) {
        const result = await updateClient(id, data);
        if (result.success) {
          queryClient.setQueryData(clientsQueryKey, (prev: Client[] | undefined) =>
            prev ? prev.map((c) => (c.id === id ? { ...data, id } : c)) : prev
          );
          toast.success("Cliente actualizado");
          router.push("/admin");
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createClient(data);
        if (result.success && result.client) {
          queryClient.setQueryData(clientsQueryKey, (prev: Client[] | undefined) =>
            prev ? [...prev, result.client!] : [result.client!]
          );
          toast.success("Cliente creado");
          router.push("/admin");
        } else {
          toast.error(result.success === false ? (result as { error: string }).error : "Error al crear");
        }
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && loading && !name) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando cliente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">
              {isEditing ? "Editar cliente / proveedor" : "Nuevo cliente / proveedor"}
            </h1>
          </div>
          <Button
            type="submit"
            form="client-form"
            disabled={saving || !name.trim() || !phone.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </header>

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Guardando...</p>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos del cliente / proveedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: María García"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +54 11 1234-5678"
                  maxLength={30}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  maxLength={200}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end pb-8">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
