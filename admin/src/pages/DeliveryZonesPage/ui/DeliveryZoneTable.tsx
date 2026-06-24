import { Link } from "react-router-dom";
import type { DeliveryZone } from "@/api/types";
import { formatRub } from "@/shared/utils/formatDate";

interface DeliveryZoneTableProps {
  zones: DeliveryZone[];
  onDelete: (id: string, name: string) => void;
}

export function DeliveryZoneTable({ zones, onDelete }: DeliveryZoneTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Базовая цена</th>
          <th>Цена за км</th>
          <th>Точек в полигоне</th>
          <th>Активна</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {zones.map((zone) => (
          <tr key={zone.id}>
            <td><Link to={`/delivery-zones/${zone.id}`}>{zone.name}</Link></td>
            <td>{formatRub(zone.basePrice)}</td>
            <td>{formatRub(zone.perKmPrice)}</td>
            <td>{zone.polygon.length}</td>
            <td>
              {zone.isActive ? (
                <span className="badge badge-success">Да</span>
              ) : (
                <span className="badge badge-danger">Нет</span>
              )}
            </td>
            <td>
              <div className="actions">
                <Link to={`/delivery-zones/${zone.id}`} className="btn btn-secondary">Изменить</Link>
                <button className="btn btn-danger" onClick={() => onDelete(zone.id, zone.name)}>Удалить</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
