import { Link } from "react-router-dom";
import { useServices } from "./hooks/useServices";
import { formatRub } from "@/shared/utils/formatDate";

export function ServicesPage() {
  const { data, loading, error, remove } = useServices();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить услугу «${name}»?`)) return;
    remove(id);
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Услуги</h1>
        <Link to="/services/new" className="btn btn-primary">+ Добавить услугу</Link>
      </div>
      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Услуг пока нет.</p>}
        {!loading && data.length > 0 && (
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
              {data.map((svc) => (
                <tr key={svc.id}>
                  <td><Link to={`/services/${svc.id}`}>{svc.name}</Link></td>
                  <td>{svc.price != null ? formatRub(svc.price) : "—"}</td>
                  <td>
                    {svc.isActive ? (
                      <span className="badge badge-success">Активна</span>
                    ) : (
                      <span className="badge badge-danger">Скрыта</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/services/${svc.id}`} className="btn btn-secondary">Изменить</Link>
                      <button className="btn btn-danger" onClick={() => handleDelete(svc.id, svc.name)}>Удалить</button>
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
