"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ArrowLeft, Save, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { productsQueryKey, productsQueryOptions } from "@/shared/queries/productos";
import { uploadProductImage } from "@/shared/serverActions/uploadImage";
import {
  productFormSchema,
  type ProductFormValues,
  defaultProductFormValues,
  normalizeSlug,
} from "./product-form-schema";

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
const ageRanges = [
  { value: "0-12m", label: "👶 0-12m" },
  { value: "1-3 años", label: "🧒 1-3 años" },
  { value: "3-6 años", label: "👦 3-6 años" },
  { value: "6+ años", label: "🎒 6+ años" },
];

const emptyMeasurements: ProductMeasurements = {
  largo: 0,
  ancho: 0,
  manga: undefined,
  entrepierna: undefined,
};

function buildProductFromForm(data: ProductFormValues, imageUrls: string[]): Product {
  const measurements: ProductMeasurements = {
    ...emptyMeasurements,
    largo: Number(data.largo) || 0,
    ancho: Number(data.ancho) || 0,
    manga: data.manga ? Number(data.manga) : undefined,
    entrepierna: data.entrepierna ? Number(data.entrepierna) : undefined,
  };
  const images = imageUrls.length > 0 ? imageUrls : ["/images/placeholder.jpg"];
  const image = images[0]!;
  return {
    name: data.name.trim(),
    slug: data.slug?.trim() || undefined,
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    category: data.category,
    size: data.size,
    brand: data.brand,
    condition: data.condition,
    conditionDetail: data.conditionDetail?.trim() || undefined,
    description: data.description?.trim() ?? "",
    color: data.color?.trim() ?? "",
    ageRange: data.ageRange?.trim() ?? "",
    gender: data.gender,
    material: data.material?.trim() || undefined,
    usageCount: data.usageCount?.trim() || undefined,
    soldOut: data.soldOut,
    image,
    images,
    measurements,
  };
}

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params?.id as string | undefined;
  const isEditing = id && id !== "nuevo";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues,
  });

  const [loading, setLoading] = useState<boolean>(Boolean(isEditing));
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const blobUrlsRef = useRef<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const images = form.watch("images");

  useEffect(() => {
    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];
    const urls = images.map((item: string | File) =>
      typeof item === "string" ? item : URL.createObjectURL(item)
    );
    blobUrlsRef.current = urls.filter((u: string) => u.startsWith("blob:"));
    setPreviewUrls(urls);
    return () => {
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, [images]);

  useEffect(() => {
    if (!isEditing || !id) return;

    function fillFormWithProduct(p: Product & { id: string }) {
      const imagesData: string[] =
        Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
      form.reset({
        name: p.name,
        slug: p.slug ?? "",
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
        images: imagesData,
        largo: String(p.measurements?.largo ?? ""),
        ancho: String(p.measurements?.ancho ?? ""),
        manga: p.measurements?.manga != null ? String(p.measurements.manga) : "",
        entrepierna: p.measurements?.entrepierna != null ? String(p.measurements.entrepierna) : "",
      });
    }

    const cached = queryClient.getQueryData<(Product & { id: string })[]>(productsQueryKey);
    const productFromCache = cached?.find((item) => item.id === id);

    if (productFromCache) {
      fillFormWithProduct(productFromCache);
      setLoading(false);
      return;
    }

    queryClient.fetchQuery(productsQueryOptions).then((data) => {
      const list = (data ?? []) as (Product & { id: string })[];
      const product = list.find((item) => item.id === id);
      if (product) {
        fillFormWithProduct(product);
      } else {
        toast.error("Producto no encontrado");
      }
      setLoading(false);
    }).catch(() => {
      toast.error("Error al cargar el producto");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form/queryClient stable, only re-run when id/isEditing changes
  }, [id, isEditing]);

  const addImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || images.length >= 3) return;
    form.setValue("images", [...images, trimmed]);
  };

  const removeImage = (index: number) => {
    form.setValue(
      "images",
      images.filter((_: string | File, i: number) => i !== index)
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = 3 - images.length;
    if (remaining <= 0) {
      toast.error("Máximo 3 imágenes");
      e.target.value = "";
      return;
    }
    const toAdd = Array.from(files).slice(0, remaining);
    form.setValue("images", [...images, ...toAdd]);
    e.target.value = "";
  };

  const onSubmit = async (data: ProductFormValues) => {
    const existingUrls = data.images.filter((x): x is string => typeof x === "string");
    const pendingFiles = data.images.filter((x): x is File => x instanceof File);

    setLoading(true);
    try {
      let uploadedUrls: string[] = [];

      if (pendingFiles.length > 0) {
        if (isEditing && id) {
          for (const file of pendingFiles) {
            const fd = new FormData();
            fd.append("image", file);
            const result = await uploadProductImage(id, fd);
            if (!result.success) throw new Error(result.error);
            uploadedUrls.push(result.data.url);
          }
        } else {
          for (const file of pendingFiles) {
            const fd = new FormData();
            fd.append("image", file);
            const res = await fetch("/api/images?folder=products", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok || !json.data?.url) throw new Error(json.error || "Error al subir imagen");
            uploadedUrls.push(json.data.url);
          }
        }
      }

      const finalImages = [...existingUrls, ...uploadedUrls];
      const body = buildProductFromForm(data, finalImages);

      if (isEditing && id) {
        const res = await fetch(`/api/productos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const resData = await res.json();
        if (resData.success !== false) {
          queryClient.setQueryData(
            productsQueryKey,
            (prev: (Product & { id: string })[] | undefined) =>
              prev ? prev.map((p) => (p.id === id ? { ...body, id } : p)) : prev
          );
          toast.success("Producto actualizado");
          router.push("/admin");
        } else {
          toast.error(resData.error || "Error al actualizar");
        }
      } else {
        const res = await fetch("/api/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const resData = await res.json();
        if (resData.success !== false) {
          if (resData.product) {
            queryClient.setQueryData(
              productsQueryKey,
              (prev: (Product & { id: string })[] | undefined) =>
                prev ? [...prev, resData.product] : [resData.product]
            );
          }
          toast.success("Producto creado");
          router.push("/admin");
        } else {
          toast.error(resData.error || "Error al crear");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing && loading && !form.getValues("name")) {
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
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading || !form.watch("name")?.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del producto *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Ej: Vestido Lavanda con Botones"
                  maxLength={100}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="slug"
                      {...field}
                      onChange={(e) => field.onChange(normalizeSlug(e.target.value))}
                      placeholder="solo-letras-numeros-y-guiones"
                      maxLength={120}
                    />
                  )}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Solo letras, números y guiones</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
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
                    {...form.register("brand")}
                    placeholder="Ej: Mimo & Co"
                    maxLength={50}
                  />
                  {form.formState.errors.brand && (
                    <p className="text-sm text-destructive">{form.formState.errors.brand.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...form.register("color")}
                    placeholder="Ej: Lavanda"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  {...form.register("material")}
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
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    )}
                  />
                  {form.formState.errors.category && (
                    <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Género *</Label>
                  <Controller
                    name="gender"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Talle *</Label>
                  <Input
                    id="size"
                    {...form.register("size")}
                    placeholder="Ej: 2-3 años"
                    maxLength={20}
                  />
                  {form.formState.errors.size && (
                    <p className="text-sm text-destructive">{form.formState.errors.size.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Rango de edad</Label>
                  <Controller
                    name="ageRange"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageRanges.map((a) => (
                            <SelectItem key={a.value} value={a.value}>
                              {a.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                  <Controller
                    name="condition"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    )}
                  />
                  {form.formState.errors.condition && (
                    <p className="text-sm text-destructive">{form.formState.errors.condition.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageCount">Cantidad de usos</Label>
                  <Input
                    id="usageCount"
                    {...form.register("usageCount")}
                    placeholder="Ej: Usado 2 veces"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditionDetail">Detalle del estado</Label>
                <Textarea
                  id="conditionDetail"
                  {...form.register("conditionDetail")}
                  placeholder="Ej: Sin manchas ni roturas"
                  rows={3}
                  maxLength={300}
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
                  <Input id="largo" type="number" min={0} {...form.register("largo")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ancho">Ancho *</Label>
                  <Input id="ancho" type="number" min={0} {...form.register("ancho")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manga">Manga</Label>
                  <Input id="manga" type="number" min={0} {...form.register("manga")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entrepierna">Entrepierna</Label>
                  <Input id="entrepierna" type="number" min={0} {...form.register("entrepierna")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imágenes (máx. 3)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {previewUrls.map((url, index) => (
                    <div
                      key={`preview-${index}`}
                      className="relative group w-24 h-24 rounded-lg overflow-hidden border bg-muted shrink-0"
                    >
                      <img
                        src={url}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-90 group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                        aria-label="Quitar imagen"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {images.length < 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Agregar por URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="imageUrl"
                        placeholder="https://... o /images/..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            addImageUrl(input.value);
                            input.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById("imageUrl") as HTMLInputElement;
                          if (input) {
                            addImageUrl(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => imageInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && imageInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground space-y-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <ImagePlus className="h-8 w-8 mx-auto" />
                    <p className="text-sm">
                      Hacé clic para elegir hasta {3 - images.length} imagen(es) (se subirán al
                      guardar)
                    </p>
                  </div>
                </>
              )}
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
                <Controller
                  name="soldOut"
                  control={form.control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
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
