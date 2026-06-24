import { useEffect, useState } from "react";
import { api, type Application } from "../api";

const statuses: Application["status"][] = [
  "NEW",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
];

function formatDate(date: string) {
  return new Date(date).toLocaleString("ru-RU");
}

export function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getApplications()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(id: string, status: Application["status"]) {
    try {
      const updated = await api.updateApplicationStatus(id, status);
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить заявку?")) return;
    try {
      await api.deleteApplication(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Заявки</h1>
      </div>

      <div className="card">
        <p className="text-muted">
          Заявки на услуги, отправленные с сайта.
        </p>

        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p>Заявок пока нет.</p>
        )}

        {!loading && items.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Имя</th>
                <th>Контакт</th>
                <th>Услуга</th>
                <th>Сообщение</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{item.name}</td>
                  <td>{item.contact}</td>
                  <td>{item.service?.name ?? "—"}</td>
                  <td className="cell-message">{item.message ?? "—"}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        changeStatus(
                          item.id,
                          e.target.value as Application["status"]
                        )
                      }
                      className="select-inline"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s === "NEW"
                            ? "Новая"
                            : s === "IN_PROGRESS"
                              ? "В работе"
                              : s === "DONE"
                                ? "Выполнена"
                                : "Отменена"}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Удалить
                    </button>
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
