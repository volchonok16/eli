import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProduct, createProduct, createProductWithFiles, updateProduct } from "@/api/endpoints/products";
import { getCategories } from "@/api/endpoints/categories";
import { getSalePoints } from "@/api/endpoints/sale-points";
import type { Category, SalePoint, ProductImage } from "@/api/types";
import {
  uploadImages,
  deleteImage,
  reorderImages,
} from "@/api/endpoints/products";

type ProductFormData = {
  sku: string;
  name: string;
  description: string;
  careGuide: string;
  height: string;
  heightLabel: string;
  sort: string;
  price: string;
  costPrice: string;
  quantity: string;
  inStock: boolean;
  isHit: boolean;
  isNew: boolean;
  categoryId: string;
  salePointId: string;
};

const emptyForm: ProductFormData = {
  sku: "", name: "", description: "", careGuide: "",
  height: "", heightLabel: "", sort: "", price: "", costPrice: "",
  quantity: "0", inStock: true, isHit: false, isNew: false,
  categoryId: "", salePointId: "",
};

export function useProductForm(id: string | undefined) {
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [salePoints, setSalePoints] = useState<SalePoint[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => undefined);
    getSalePoints().then(setSalePoints).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then((p) => {
        setForm({
          sku: p.sku ?? "",
          name: p.name,
          description: p.description ?? "",
          careGuide: p.careGuide ?? "",
          height: p.height != null ? String(p.height) : "",
          heightLabel: p.heightLabel ?? "",
          sort: p.sort ?? "",
          price: String(p.price),
          costPrice: p.costPrice != null ? String(p.costPrice) : "",
          quantity: String(p.quantity),
          inStock: p.inStock,
          isHit: p.isHit,
          isNew: p.isNew,
          categoryId: p.categoryId ?? "",
          salePointId: p.salePointId ?? "",
        });
        setImages(
          [...p.images].sort((a, b) => a.sortOrder - b.sortOrder)
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  const buildData = useCallback(() => ({
    sku: form.sku || null,
    name: form.name,
    description: form.description || undefined,
    careGuide: form.careGuide || undefined,
    height: form.height ? parseInt(form.height, 10) : null,
    heightLabel: form.heightLabel || null,
    sort: form.sort || null,
    price: parseFloat(form.price),
    costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
    quantity: parseInt(form.quantity, 10),
    inStock: form.inStock,
    isHit: form.isHit,
    isNew: form.isNew,
    categoryId: form.categoryId || null,
    salePointId: form.salePointId || null,
  }), [form]);

  const save = useCallback(async () => {
    setError("");
    setSaving(true);
    const data = buildData();
    try {
      if (isEdit && id) {
        await updateProduct(id, data);
        navigate("/products");
      } else if (pendingFiles.length > 0) {
        const fdData: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value != null && value !== "") {
            fdData[key] = String(value);
          }
        }
        const created = await createProductWithFiles(fdData, pendingFiles as unknown as FileList);
        navigate(`/products/${created.id}`);
      } else {
        const created = await createProduct(data);
        navigate(`/products/${created.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }, [buildData, isEdit, id, navigate, pendingFiles]);

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (!id) return;
    try {
      const uploaded = await uploadImages(id, files);
      setImages((prev) =>
        [...prev, ...uploaded].sort((a, b) => a.sortOrder - b.sortOrder)
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка загрузки");
    }
  }, [id]);

  const handleFilesSelected = useCallback((files: FileList) => {
    setPendingFiles((prev) => [...prev, ...Array.from(files)].slice(0, 10));
  }, []);

  const handlePendingFileRemove = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageDelete = useCallback(async (imageId: string) => {
    if (!id) return;
    try {
      await deleteImage(id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка удаления");
    }
  }, [id]);

  const handleImageMove = useCallback(async (index: number, direction: -1 | 1) => {
    if (!id) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    try {
      const updated = await reorderImages(id, reordered.map((img) => img.id));
      setImages(updated.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка сортировки");
    }
  }, [id, images]);

  return {
    form, setForm, categories, salePoints, images, pendingFiles,
    loading, saving, error, isEdit,
    save, handleImageUpload, handleImageDelete, handleImageMove,
    handleFilesSelected, handlePendingFileRemove,
  };
}
