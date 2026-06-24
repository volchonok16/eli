import { Link } from "react-router-dom";
import type { SalePoint } from "@/api/types";

interface SalePointTableProps {
  points: SalePoint[];
  onDelete: (id: string, name: string) => void;
}

export function SalePointTable({ points, onDelete }: SalePointTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Фото</th>
          <th>Название</th>
          <th>Адрес</th>
          <th>Активна</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {points.map((point) => (
          <tr key={point.id}>
            <td>
              {point.imageUrl ? (
                <img src={point.imageUrl} alt="" className="product-thumb" />
              ) : (
                <div className="product-thumb" />
              )}
            </td>
            <td><Link to={`/sale-points/${point.id}`}>{point.shortName}</Link></td>
            <td>{point.address}</td>
            <td>
              {point.isActive ? (
                <span className="badge badge-success">Да</span>
              ) : (
                <span className="badge badge-danger">Нет</span>
              )}
            </td>
            <td>
              <div className="actions">
                <Link to={`/sale-points/${point.id}`} className="btn btn-secondary">
                  Изменить
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete(point.id, point.shortName)}
                >
                  Удалить
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
