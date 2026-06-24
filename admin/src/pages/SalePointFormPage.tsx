import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export function SalePointFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [shortName, setShortName] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .getSalePoint(id)
      .then((point) => {
        setShortName(point.shortName);
        setAddress(point.address);
        setImageUrl(point.imageUrl);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const data = { shortName, address };

    try {
      if (isEdit && id) {
        await api.updateSalePoint(id, data);
        navigate("/sale-points");
      } else {
        const point = await api.createSalePoint(data);
        navigate(`/sale-points/${point.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.[0]) return;
    try {
      const updated = await api.uploadSalePointImage(id, e.target.files[0]);
      setImageUrl(updated.imageUrl);
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка загрузки");
    }
  }

  async function handleImageDelete() {
    if (!id) return;
    if (!confirm("Удалить изображение?")) return;
    try {
      await api.deleteSalePointImage(id);
      setImageUrl(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование точки" : "Новая точка продаж"}</h1>
        <Link to="/sale-points" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="shortName">Короткое название</label>
            <input
              id="shortName"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Например: Центр"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Адрес</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="ул. Примерная, 1"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>

        {isEdit && id && (
          <div
            style={{
              marginTop: 32,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 24,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Изображение</h3>
            {imageUrl && (
              <div className="image-item" style={{ marginBottom: 12 }}>
                <img
                  src={imageUrl}
                  alt=""
                  style={{ width: 160, height: 160, objectFit: "cover" }}
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {imageUrl && (
              <button
                type="button"
                className="btn btn-danger"
                style={{ marginTop: 12 }}
                onClick={handleImageDelete}
              >
                Удалить фото
              </button>
            )}
          </div>
        )}

        {!isEdit && (
          <p style={{ marginTop: 16, color: "#6b7280", fontSize: 14 }}>
            После создания можно загрузить изображение точки.
          </p>
        )}
      </div>
    </div>
  );
}
