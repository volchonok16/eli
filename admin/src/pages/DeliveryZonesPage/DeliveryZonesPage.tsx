import { Link } from "react-router-dom";
import { useDeliveryZones } from "./hooks/useDeliveryZones";
import { DeliveryZoneTable } from "./ui/DeliveryZoneTable";

export function DeliveryZonesPage() {
  const { data, loading, error, remove } = useDeliveryZones();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить зону «${name}»?`)) return;
    remove(id);
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Зоны доставки</h1>
        <Link to="/delivery-zones/new" className="btn btn-primary">+ Добавить зону</Link>
      </div>
      <div className="card">
        <p className="text-muted">
          Зоны доставки используются для расчёта стоимости курьерской доставки.
          Полигон задаётся массивом координат [lat, lng].
        </p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Зон доставки пока нет.</p>}
        {!loading && data.length > 0 && <DeliveryZoneTable zones={data} onDelete={handleDelete} />}
      </div>
    </div>
  );
}
