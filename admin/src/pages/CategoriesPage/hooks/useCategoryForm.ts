import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategory,
  createCategory,
  updateCategory,
  getCategories,
} from "@/api/endpoints/categories";
import type { Category } from "@/api/types";
import {
  collectCategoryIds,
  findCategory,
  flattenCategories,
  slugifyCategory,
} from "@/shared/utils/categories";

export function useCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    getCategory(id)
      .then((cat) => {
        setName(cat.name);
        setSlug(cat.slug);
        setSlugTouched(true);
        setParentId(cat.parentId ?? "");
        setSortOrder(String(cat.sortOrder));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  const parentOptions = useMemo(() => {
    const exclude = new Set<string>();
    if (id) {
      const current = findCategory(categories, id);
      if (current) {
        for (const nestedId of collectCategoryIds(current)) {
          exclude.add(nestedId);
        }
      } else {
        exclude.add(id);
      }
    }
    return flattenCategories(categories, 0, exclude);
  }, [categories, id]);

  const changeName = useCallback((value: string) => {
    setName(value);
    if (!isEdit && !slugTouched) {
      setSlug(slugifyCategory(value));
    }
  }, [isEdit, slugTouched]);

  const changeSlug = useCallback((value: string) => {
    setSlugTouched(true);
    setSlug(value);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setSaving(true);
      const data = {
        name,
        slug: slug || slugifyCategory(name),
        parentId: parentId || null,
        sortOrder: parseInt(sortOrder, 10) || 0,
      };
      try {
        if (isEdit && id) {
          await updateCategory(id, data);
        } else {
          await createCategory(data);
        }
        navigate("/categories");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      } finally {
        setSaving(false);
      }
    },
    [name, slug, parentId, sortOrder, isEdit, id, navigate]
  );

  return {
    isEdit,
    name,
    slug,
    parentId,
    sortOrder,
    parentOptions,
    loading,
    saving,
    error,
    changeName,
    changeSlug,
    setParentId,
    setSortOrder,
    handleSubmit,
  };
}
