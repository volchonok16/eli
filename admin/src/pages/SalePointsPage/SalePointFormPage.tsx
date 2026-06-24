import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getSalePoint,
  createSalePoint,
  updateSalePoint,
  uploadSalePointImage,
  deleteSalePointImage,
} from "@/api/endpoints/sale-points";
import sf from "../SharedForm.module.scss";

export function SalePointFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [shortName, setShortName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [workHours, setWorkHours] = useState({ open: "09:00", close: "22:00" });
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getSalePoint(id)
      .then((point) => {
        setShortName(point.shortName);
        setAddress(point.address);
        setLat(point.lat != null ? String(point.lat) : "");
        setLng(point.lng != null ? String(point.lng) : "");
        setPhone(point.phone ?? "");
        setDescription(point.description ?? "");
        if (point.workingHours) setWorkHours(point.workingHours as { open: string; close: string });
        setIsActive(point.isActive);
        setImageUrl(point.imageUrl);
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
        shortName,
        address,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        phone: phone || null,
        description: description || null,
        workingHours: workHours.open || workHours.close ? workHours : null,
        isActive,
      };
      try {
        if (isEdit && id) {
          await updateSalePoint(id, data);
          navigate("/sale-points");
        } else {
          const created = await createSalePoint(data as Parameters<typeof createSalePoint>[0]);
          navigate(`/sale-points/${created.id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      } finally {
        setSaving(false);
      }
    },
    [shortName, address, lat, lng, phone, description, workHours, isActive, isEdit, id, navigate]
  );

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.[0]) return;
    try {
      const updated = await uploadSalePointImage(id, e.target.files[0]);
      setImageUrl(updated.imageUrl);
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка загрузки");
    }
  }

  async function handleImageDelete() {
    if (!id || !confirm("Удалить изображение?")) return;
    try {
      await deleteSalePointImage(id);
      setImageUrl(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  if (loading) return <div className="page"><p>Загрузка...</p></div>;

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование точки" : "Новая точка продаж"}</h1>
        <Link to="/sale-points" className="btn btn-secondary">← Назад</Link>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shortName">Короткое название</label>
              <input id="shortName" value={shortName} onChange={(e) => setShortName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ..." />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Адрес</label>
            <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lat">Широта (lat)</label>
              <input id="lat" type="number" step="0.000001" value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="lng">Долгота (lng)</label>
              <input id="lng" type="number" step="0.000001" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="open">Время открытия</label>
              <input id="open" type="time" value={workHours.open} onChange={(e) => setWorkHours((p) => ({ ...p, open: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="close">Время закрытия</label>
              <input id="close" type="time" value={workHours.close} onChange={(e) => setWorkHours((p) => ({ ...p, close: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Активна (показывать на сайте и карте)
            </label>
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>

        {isEdit && id && (
          <div className={sf.imageSection}>
            <h3 className={sf.imageSectionTitle}>Изображение</h3>
            {imageUrl && (
              <div className="image-item" style={{ marginBottom: 12 }}>
                <img src={imageUrl} alt="" className={sf.salePointImage} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {imageUrl && (
              <button type="button" className="btn btn-danger" style={{ marginTop: 12 }} onClick={handleImageDelete}>
                Удалить фото
              </button>
            )}
          </div>
        )}

        {!isEdit && (
          <p className={sf.formHint}>
            После создания можно загрузить изображение точки.
          </p>
        )}
      </div>
    </div>
  );
}
