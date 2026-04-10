"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Product } from "@/shared/types/product";
import { Button } from "@/shared/components/ui/button";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminProductsQueryKey,
  adminProductsQueryOptions,
  productsQueryKey,
} from "@/shared/queries/productos";
import { uploadProductImage } from "@/shared/serverActions/uploadImage";
import {
  createProductWithData,
  syncProductoPublicLinks,
  updateProduct,
} from "@/shared/serverActions/productos";
import {
  productFormSchema,
  type ProductFormValues,
  defaultProductFormValues,
  normalizeSlug,
} from "@/features/admin";

import { buildProductFromForm } from "./buildProduct";
import { fieldLabels } from "./constants";
import {
  BasicInfoCard,
  PriceCard,
  ClassificationCard,
  ConditionCard,
  MeasurementsCard,
  ImagesCard,
  VisibilityCard,
} from "./_components";

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
      const baseSlug = normalizeSlug(p.name ?? "");
      const storedSlug = (p.slug ?? "").trim();
      const slugSuffix =
        !storedSlug || storedSlug === baseSlug
          ? ""
          : storedSlug.startsWith(baseSlug + "-")
            ? storedSlug.slice(baseSlug.length + 1)
            : storedSlug;
      form.reset({
        name: p.name,
        slug: p.slug ?? "",
        slugSuffix,
        price: String(p.price),
        originalPrice: p.originalPrice ? String(p.originalPrice) : "",
        purchasePrice: p.purchasePrice != null ? String(p.purchasePrice) : "",
        purchaseDate: p.purchaseDate ?? "",
        saleDate: p.saleDate ?? "",
        isConsigned: p.isConsigned ?? false,
        boughtFrom: p.boughtFrom ?? "",
        soldTo: p.soldTo ?? "",
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
        featured: p.featured ?? false,
        trending: p.trending ?? false,
        images: imagesData,
        largo: String(p.measurements?.largo ?? ""),
        ancho: String(p.measurements?.ancho ?? ""),
        manga: p.measurements?.manga != null ? String(p.measurements.manga) : "",
        anchoCintura:
          p.measurements?.anchoCintura != null ? String(p.measurements.anchoCintura) : "",
        entrepierna: p.measurements?.entrepierna != null ? String(p.measurements.entrepierna) : "",
      });
    }

    const cached = queryClient.getQueryData<(Product & { id: string })[]>(adminProductsQueryKey);
    const productFromCache = cached?.find((item) => item.id === id);

    if (productFromCache) {
      fillFormWithProduct(productFromCache);
      setLoading(false);
      return;
    }

    queryClient
      .fetchQuery(adminProductsQueryOptions)
      .then((data) => {
        const list = (data ?? []) as (Product & { id: string })[];
        const product = list.find((item) => item.id === id);
        if (product) {
          fillFormWithProduct(product);
        } else {
          toast.error("Producto no encontrado");
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Error al cargar el producto");
        setLoading(false);
      });
  }, [id, isEditing]);

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    form.setValue("images", next);
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

  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const firstKey = Object.keys(errors)[0];
    const firstError = firstKey ? errors[firstKey] : null;
    const label = fieldLabels[firstKey ?? ""];
    let message = firstError?.message ?? "Revisá los campos del formulario";
    if (message === "Required" && label) {
      message = `${label} es obligatorio`;
    }
    toast.error(message);
  };

  const onSubmit = async (data: ProductFormValues) => {
    const base = normalizeSlug(data.name ?? "");
    const suffix = data.slugSuffix?.trim();
    const slugToSave = (suffix ? `${base}-${normalizeSlug(suffix)}` : base).trim();
    if (!slugToSave) {
      toast.error("El nombre es obligatorio para generar la URL");
      return;
    }

    const allProducts =
      queryClient.getQueryData<(Product & { id: string })[]>(adminProductsQueryKey) ??
      (await queryClient.fetchQuery(adminProductsQueryOptions)) ??
      [];
    const slugExists = allProducts.some(
      (p) => p.slug?.toLowerCase() === slugToSave.toLowerCase() && p.id !== id
    );
    if (slugExists) {
      toast.error("Esta URL ya está en uso por otro producto. Agregá o cambiá el sufijo.");
      return;
    }

    const previousProduct =
      isEditing && id ? allProducts.find((p) => p.id === id) : undefined;
    const previousSlug = previousProduct?.slug?.trim() || undefined;

    const existingUrls = data.images.filter((x): x is string => typeof x === "string");
    const pendingFiles = data.images.filter((x): x is File => x instanceof File);

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];

      if (pendingFiles.length > 0) {
        for (const file of pendingFiles) {
          const fd = new FormData();
          fd.append("image", file);
          const result = await uploadProductImage(slugToSave, fd);
          if (!result.success) throw new Error(result.error);
          uploadedUrls.push(result.data.url);
        }
      }

      const finalImages = [...existingUrls, ...uploadedUrls];
      const body = buildProductFromForm(data, finalImages, slugToSave);

      if (isEditing && id) {
        const result = await updateProduct(id, body);
        if (result.success) {
          queryClient.setQueryData(
            adminProductsQueryKey,
            (prev: (Product & { id: string })[] | undefined) =>
              prev
                ? prev.map((p) =>
                    p.id === id
                      ? { ...body, id, createdAt: result.createdAt, updatedAt: result.updatedAt }
                      : p
                  )
                : prev
          );
          queryClient.invalidateQueries({ queryKey: productsQueryKey });
          toast.success("Producto actualizado");
          const linkSync = await syncProductoPublicLinks({
            slug: slugToSave,
            soldOut: body.soldOut ?? false,
            previousSlug: previousSlug || null,
          });
          if (!linkSync.success) {
            toast.warning(linkSync.error);
          }
          router.push("/admin");
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createProductWithData(body);
        if (result.success) {
          queryClient.setQueryData(
            adminProductsQueryKey,
            (prev: (Product & { id: string })[] | undefined) =>
              prev ? [...prev, result.product] : [result.product]
          );
          queryClient.invalidateQueries({ queryKey: productsQueryKey });
          toast.success("Producto creado");
          const linkSync = await syncProductoPublicLinks({
            slug: slugToSave,
            soldOut: body.soldOut ?? false,
            previousSlug: null,
          });
          if (!linkSync.success) {
            toast.warning(linkSync.error);
          }
          router.push("/admin");
        } else {
          toast.error(result.error);
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
      <header className="border-b bg-card sticky top-[4rem] z-30">
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
            onClick={form.handleSubmit(onSubmit, onInvalid)}
            disabled={loading || !form.watch("name")?.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </header>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Guardando producto...</p>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          <BasicInfoCard form={form} isEditing={!!isEditing} />
          <PriceCard form={form} />
          <ClassificationCard form={form} />
          <ConditionCard form={form} />
          <MeasurementsCard form={form} />
          <ImagesCard
            images={images}
            previewUrls={previewUrls}
            moveImage={moveImage}
            removeImage={removeImage}
            imageInputRef={imageInputRef}
            handleFileSelect={handleFileSelect}
          />
          <VisibilityCard form={form} />

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
