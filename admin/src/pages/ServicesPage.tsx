import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Service } from "../api";

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getServices()
      .then(setServices)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить услугу «${name}»?`)) return;
    try {
      await api.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Услуги</h1>
        <Link to="/services/new" className="btn btn-primary">
          + Добавить услугу
        </Link>
      </div>

      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && services.length === 0 && (
          <p>Услуг пока нет.</p>
        )}
        {!loading && services.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <Link to={`/services/${service.id}`}>{service.name}</Link>
                  </td>
                  <td>
                    {service.price != null
                      ? `${service.price.toLocaleString("ru-RU")} ₽`
                      : "—"}
                  </td>
                  <td>
                    {service.isActive ? (
                      <span className="badge badge-success">Активна</span>
                    ) : (
                      <span className="badge badge-danger">Скрыта</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <Link
                        to={`/services/${service.id}`}
                        className="btn btn-secondary"
                      >
                        Изменить
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(service.id, service.name)}
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
