import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type Product, type ProductImage, type SalePoint } from "../api";

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [inStock, setInStock] = useState(true);
  const [isHit, setIsHit] = useState(false);
  const [salePointId, setSalePointId] = useState("");
  const [salePoints, setSalePoints] = useState<SalePoint[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getSalePoints().then(setSalePoints).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .getProduct(id)
      .then((product: Product) => {
        setName(product.name);
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setQuantity(String(product.quantity));
        setInStock(product.inStock);
        setIsHit(product.isHit);
        setSalePointId(product.salePointId ?? "");
        setImages(
          [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
        );
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

    const data = {
      name,
      description: description || undefined,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      inStock,
      isHit,
      salePointId: salePointId || null,
    };

    try {
      if (isEdit && id) {
        await api.updateProduct(id, data);
        navigate("/products");
      } else {
        const product = await api.createProduct(data);
        navigate(`/products/${product.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.length) return;
    try {
      const uploaded = await api.uploadImages(id, e.target.files);
      setImages((prev) =>
        [...prev, ...uploaded].sort((a, b) => a.sortOrder - b.sortOrder)
      );
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка загрузки");
    }
  }

  async function handleImageDelete(imageId: string) {
    if (!id) return;
    try {
      await api.deleteImage(id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    if (!id) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    try {
      const updated = await api.reorderImages(
        id,
        reordered.map((img) => img.id)
      );
      setImages(updated.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка сортировки");
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
        <h1>{isEdit ? "Редактирование товара" : "Новый товар"}</h1>
        <Link to="/products" className="btn btn-secondary">
          ← Назад
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Цена (₽)</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Количество</label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="salePoint">Точка продаж</label>
            <select
              id="salePoint"
              value={salePointId}
              onChange={(e) => setSalePointId(e.target.value)}
            >
              <option value="">— Не выбрана —</option>
              {salePoints.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.shortName} — {point.address}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isHit}
                onChange={(e) => setIsHit(e.target.checked)}
              />
              Хит
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              В наличии (снять галочку — «Нет в наличии»)
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>

        {isEdit && id && (
          <div style={{ marginTop: 32, borderTop: "1px solid #e5e7eb", paddingTop: 24 }}>
            <h3 style={{ marginTop: 0 }}>Изображения</h3>
            <p className="text-muted">
              Можно загрузить несколько файлов сразу. Порядок картинок — это
              порядок на сайте: первая будет главной.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <div className="image-grid">
              {images.map((img, index) => (
                <div key={img.id} className="image-item">
                  <span className="image-order">{index + 1}</span>
                  <img src={img.url} alt="" />
                  <div className="image-actions">
                    <button
                      type="button"
                      className="image-move"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      title="Влево"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="image-move"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                      title="Вправо"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className="image-delete"
                      onClick={() => handleImageDelete(img.id)}
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isEdit && (
          <p style={{ marginTop: 16, color: "#6b7280", fontSize: 14 }}>
            После создания товара можно будет загрузить изображения.
          </p>
        )}
      </div>
    </div>
  );
}
