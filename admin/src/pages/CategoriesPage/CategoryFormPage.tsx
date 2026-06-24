import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCategory,
  createCategory,
  updateCategory,
} from "@/api/endpoints/categories";
import { getCategories } from "@/api/endpoints/categories";
import type { Category } from "@/api/types";

export function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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
        setParentId(cat.parentId ?? "");
        setSortOrder(String(cat.sortOrder));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setSaving(true);
      const data = {
        name,
        slug,
        parentId: parentId || null,
        sortOrder: parseInt(sortOrder, 10) || 0,
      };
      try {
        if (isEdit && id) {
          await updateCategory(id, data);
          navigate("/categories");
        } else {
          await createCategory(data);
          navigate("/categories");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      } finally {
        setSaving(false);
      }
    },
    [name, slug, parentId, sortOrder, isEdit, id, navigate]
  );

  if (loading) {
    return <div className="page"><p>Загрузка...</p></div>;
  }

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование категории" : "Новая категория"}</h1>
        <Link to="/categories" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Название</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="russkie-eli"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="parent">Родительская категория</label>
              <select
                id="parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">— Корневая —</option>
                {categories
                  .filter((c) => c.id !== id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sort">Порядок сортировки</label>
              <input
                id="sort"
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}
