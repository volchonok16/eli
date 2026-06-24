import { useCallback, useEffect, useState } from "react";
import { getApplications, updateApplicationStatus, deleteApplication } from "@/api/endpoints/applications";
import type { Application } from "@/api/types";
import { formatLocal } from "@/shared/utils/formatDate";

const statuses: Application["status"][] = ["NEW", "IN_PROGRESS", "DONE", "CANCELLED"];
const statusLabels: Record<string, string> = {
  NEW: "Новая", IN_PROGRESS: "В работе", DONE: "Выполнена", CANCELLED: "Отменена",
};

export function ApplicationsPage() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getApplications()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const changeStatus = useCallback(async (id: string, status: Application["status"]) => {
    const updated = await updateApplicationStatus(id, status);
    setData((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const remove = useCallback(async (id: string) => {
    if (!confirm("Удалить заявку?")) return;
    await deleteApplication(id);
    setData((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="page">
      <div className="header"><h1>Заявки на услуги</h1></div>
      <div className="card">
        <p className="text-muted">Заявки на услуги, отправленные с сайта.</p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Заявок пока нет.</p>}
        {!loading && data.length > 0 && (
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
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{formatLocal(item.createdAt)}</td>
                  <td>{item.name}</td>
                  <td>{item.contact}</td>
                  <td>{item.service?.name ?? "—"}</td>
                  <td className="cell-message">{item.message ?? "—"}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => changeStatus(item.id, e.target.value as Application["status"])}
                      className="select-inline"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => remove(item.id)}>Удалить</button>
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
