import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDeliveryZone, createDeliveryZone, updateDeliveryZone } from "@/api/endpoints/delivery-zones";

export function DeliveryZoneFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [perKmPrice, setPerKmPrice] = useState("");
  const [polygon, setPolygon] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getDeliveryZone(id)
      .then((zone) => {
        setName(zone.name);
        setBasePrice(String(zone.basePrice));
        setPerKmPrice(String(zone.perKmPrice));
        setPolygon(JSON.stringify(zone.polygon, null, 2));
        setIsActive(zone.isActive);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setSaving(true);
      let parsedPolygon: [number, number][];
      try {
        parsedPolygon = JSON.parse(polygon);
        if (!Array.isArray(parsedPolygon)) throw new Error("Полигон должен быть массивом");
      } catch {
        setError("Полигон должен быть валидным JSON-массивом координат [[lat, lng], ...]");
        setSaving(false);
        return;
      }
      const data = {
        name,
        basePrice: parseFloat(basePrice),
        perKmPrice: parseFloat(perKmPrice),
        polygon: parsedPolygon,
        isActive,
      };
      try {
        if (isEdit && id) {
          await updateDeliveryZone(id, data);
          navigate("/delivery-zones");
        } else {
          await createDeliveryZone(data);
          navigate("/delivery-zones");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      } finally {
        setSaving(false);
      }
    },
    [name, basePrice, perKmPrice, polygon, isActive, isEdit, id, navigate]
  );

  if (loading) return <div className="page"><p>Загрузка...</p></div>;

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование зоны" : "Новая зона доставки"}</h1>
        <Link to="/delivery-zones" className="btn btn-secondary">← Назад</Link>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Название</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="basePrice">Базовая цена (₽)</label>
              <input id="basePrice" type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="perKmPrice">Цена за км (₽)</label>
              <input id="perKmPrice" type="number" min="0" step="0.01" value={perKmPrice} onChange={(e) => setPerKmPrice(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="polygon">Полигон (JSON-массив [[lat, lng], ...])</label>
            <textarea id="polygon" value={polygon} onChange={(e) => setPolygon(e.target.value)} rows={6} placeholder='[[55.7558, 37.6173], [55.7658, 37.6273]]' required />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Активна
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
