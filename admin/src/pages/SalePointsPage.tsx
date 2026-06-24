import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type SalePoint } from "../api";

export function SalePointsPage() {
  const [points, setPoints] = useState<SalePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSalePoints()
      .then(setPoints)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить точку «${name}»?`)) return;
    try {
      await api.deleteSalePoint(id);
      setPoints((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Точки продаж</h1>
        <Link to="/sale-points/new" className="btn btn-primary">
          + Добавить точку
        </Link>
      </div>

      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && points.length === 0 && (
          <p>Точек продаж пока нет.</p>
        )}
        {!loading && points.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Адрес</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id}>
                  <td>
                    {point.imageUrl ? (
                      <img
                        src={point.imageUrl}
                        alt=""
                        className="product-thumb"
                      />
                    ) : (
                      <div className="product-thumb" />
                    )}
                  </td>
                  <td>
                    <Link to={`/sale-points/${point.id}`}>
                      {point.shortName}
                    </Link>
                  </td>
                  <td>{point.address}</td>
                  <td>
                    <div className="actions">
                      <Link
                        to={`/sale-points/${point.id}`}
                        className="btn btn-secondary"
                      >
                        Изменить
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleDelete(point.id, point.shortName)
                        }
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
