import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getService, createService, updateService } from "@/api/endpoints/services";

export function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getService(id)
      .then((svc) => {
        setName(svc.name);
        setDescription(svc.description ?? "");
        setPrice(svc.price != null ? String(svc.price) : "");
        setIsActive(svc.isActive);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const data = {
      name,
      description: description || undefined,
      price: price ? parseFloat(price) : null,
      isActive,
    };
    try {
      if (isEdit && id) { await updateService(id, data); navigate("/services"); }
      else { await createService(data); navigate("/services"); }
    } catch (err) { setError(err instanceof Error ? err.message : "Ошибка сохранения"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="page"><p>Загрузка...</p></div>;

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование услуги" : "Новая услуга"}</h1>
        <Link to="/services" className="btn btn-secondary">← Назад</Link>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Название</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="desc">Описание</label>
            <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>
          <div className="form-group">
            <label htmlFor="price">Цена (₽), необязательно</label>
            <input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Активна (показывать на сайте)
            </label>
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
