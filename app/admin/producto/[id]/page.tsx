"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Product, ProductMeasurements } from "@/shared/types/product";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ArrowLeft, Save, ImagePlus } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "Vestidos",
  "Enteritos",
  "Remeras",
  "Pantalones",
  "Abrigos",
  "Calzado",
  "Accesorios",
];
const conditions = ["Como nuevo", "Excelente", "Muy bueno", "Bueno"];
const genders: Array<{ value: "niña" | "niño" | "unisex"; label: string }> = [
  { value: "niña", label: "Niña" },
  { value: "niño", label: "Niño" },
  { value: "unisex", label: "Unisex" },
];

const emptyMeasurements: ProductMeasurements = {
  largo: 0,
  ancho: 0,
  manga: undefined,
  entrepierna: undefined,
};

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEditing = id && id !== "nuevo";

  const [loading, setLoading] = useState<boolean>(Boolean(isEditing));
  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    size: "",
    brand: "",
    condition: "",
    conditionDetail: "",
    description: "",
    color: "",
    ageRange: "",
    gender: "unisex" as "niña" | "niño" | "unisex",
    material: "",
    usageCount: "",
    soldOut: false,
    image: "",
    largo: "",
    ancho: "",
    manga: "",
    entrepierna: "",
  });

  useEffect(() => {
    if (!isEditing) return;
    fetch(`/api/productos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then((p: Product & { id: string }) => {
        setForm({
          name: p.name,
          price: String(p.price),
          originalPrice: p.originalPrice ? String(p.originalPrice) : "",
          category: p.category,
          size: p.size,
          brand: p.brand,
          condition: p.condition,
          conditionDetail: p.conditionDetail || "",
          description: p.description,
          color: p.color,
          ageRange: p.ageRange ?? "",
          gender: p.gender,
          material: p.material || "",
          usageCount: p.usageCount || "",
          soldOut: p.soldOut ?? false,
          image: p.image || (p.images?.[0] ?? ""),
          largo: String(p.measurements?.largo ?? ""),
          ancho: String(p.measurements?.ancho ?? ""),
          manga: p.measurements?.manga != null ? String(p.measurements.manga) : "",
          entrepierna:
            p.measurements?.entrepierna != null ? String(p.measurements.entrepierna) : "",
        });
      })
      .catch(() => toast.error("Error al cargar el producto"))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildProduct = (): Product => {
    const measurements: ProductMeasurements = {
      ...emptyMeasurements,
      largo: Number(form.largo) || 0,
      ancho: Number(form.ancho) || 0,
      manga: form.manga ? Number(form.manga) : undefined,
      entrepierna: form.entrepierna ? Number(form.entrepierna) : undefined,
    };
    const image = form.image.trim() || "/images/placeholder.jpg";
    return {
      name: form.name.trim(),
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      size: form.size,
      brand: form.brand,
      condition: form.condition,
      conditionDetail: form.conditionDetail || undefined,
      description: form.description.trim(),
      color: form.color.trim(),
      ageRange: form.ageRange.trim(),
      gender: form.gender,
      material: form.material || undefined,
      usageCount: form.usageCount || undefined,
      soldOut: form.soldOut,
      image,
      images: [image],
      measurements,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.price ||
      !form.category ||
      !form.size ||
      !form.brand ||
      !form.condition
    ) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    const body = buildProduct();
    setLoading(true);

    if (isEditing) {
      fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success !== false) {
            toast.success("Producto actualizado");
            router.push("/admin");
          } else {
            toast.error(data.error || "Error al actualizar");
          }
        })
        .catch(() => toast.error("Error al actualizar producto"))
        .finally(() => setLoading(false));
    } else {
      fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success !== false) {
            toast.success("Producto creado");
            router.push("/admin");
          } else {
            toast.error(data.error || "Error al crear");
          }
        })
        .catch(() => toast.error("Error al crear producto"))
        .finally(() => setLoading(false));
    }
  };

  if (isEditing && loading && !form.name) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">
              {isEditing ? "Editar producto" : "Nuevo producto"}
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={loading || !form.name.trim()} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del producto *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ej: Vestido Lavanda con Botones"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describí la prenda, su historia, detalles..."
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    value={form.brand}
                    onChange={(e) => updateField("brand", e.target.value)}
                    placeholder="Ej: Mimo & Co"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={form.color}
                    onChange={(e) => updateField("color", e.target.value)}
                    placeholder="Ej: Lavanda"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={form.material}
                  onChange={(e) => updateField("material", e.target.value)}
                  placeholder="Ej: 100% Algodón"
                  maxLength={50}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio de venta *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Precio original</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min={0}
                    value={form.originalPrice}
                    onChange={(e) => updateField("originalPrice", e.target.value)}
                    placeholder="4500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clasificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Género *</Label>
                  <Select value={form.gender} onValueChange={(v) => updateField("gender", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Talle *</Label>
                  <Input
                    id="size"
                    value={form.size}
                    onChange={(e) => updateField("size", e.target.value)}
                    placeholder="Ej: 2-3 años"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRange">Rango de edad</Label>
                  <Input
                    id="ageRange"
                    value={form.ageRange}
                    onChange={(e) => updateField("ageRange", e.target.value)}
                    placeholder="Ej: 2 a 3 años"
                    maxLength={20}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado de la prenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Select value={form.condition} onValueChange={(v) => updateField("condition", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageCount">Cantidad de usos</Label>
                  <Input
                    id="usageCount"
                    value={form.usageCount}
                    onChange={(e) => updateField("usageCount", e.target.value)}
                    placeholder="Ej: Usado 2 veces"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditionDetail">Detalle del estado</Label>
                <Input
                  id="conditionDetail"
                  value={form.conditionDetail}
                  onChange={(e) => updateField("conditionDetail", e.target.value)}
                  placeholder="Ej: Sin manchas ni roturas"
                  maxLength={100}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medidas (cm)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="largo">Largo *</Label>
                  <Input
                    id="largo"
                    type="number"
                    min={0}
                    value={form.largo}
                    onChange={(e) => updateField("largo", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ancho">Ancho *</Label>
                  <Input
                    id="ancho"
                    type="number"
                    min={0}
                    value={form.ancho}
                    onChange={(e) => updateField("ancho", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manga">Manga</Label>
                  <Input
                    id="manga"
                    type="number"
                    min={0}
                    value={form.manga}
                    onChange={(e) => updateField("manga", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entrepierna">Entrepierna</Label>
                  <Input
                    id="entrepierna"
                    type="number"
                    min={0}
                    value={form.entrepierna}
                    onChange={(e) => updateField("entrepierna", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imagen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">URL de imagen</Label>
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => updateField("image", e.target.value)}
                  placeholder="https://... o /images/..."
                />
              </div>
              {form.image && (
                <img
                  src={form.image}
                  alt="Vista previa"
                  className="w-20 h-20 rounded-lg object-cover border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground space-y-2">
                <ImagePlus className="h-8 w-8 mx-auto" />
                <p className="text-sm">Subir imágenes (próximamente)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marcar como vendido</Label>
                  <p className="text-sm text-muted-foreground">
                    El producto aparecerá como no disponible
                  </p>
                </div>
                <Switch
                  checked={form.soldOut}
                  onCheckedChange={(v) => updateField("soldOut", v)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end pb-8">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
