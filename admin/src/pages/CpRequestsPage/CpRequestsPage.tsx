import { useCallback, useEffect, useState } from "react";
import { getCpRequests, updateCpRequest, deleteCpRequest } from "@/api/endpoints/cp-requests";
import type { CpRequest } from "@/api/types";
import { formatLocal } from "@/shared/utils/formatDate";

export function CpRequestsPage() {
  const [data, setData] = useState<CpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getCpRequests()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const toggleProcessed = useCallback(async (req: CpRequest) => {
    const updated = await updateCpRequest(req.id, { isProcessed: !req.isProcessed });
    setData((prev) => prev.map((r) => (r.id === req.id ? updated : r)));
  }, []);

  const remove = useCallback(async (id: string) => {
    if (!confirm("Удалить запрос?")) return;
    await deleteCpRequest(id);
    setData((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="page">
      <div className="header">
        <h1>Запросы КП (опт)</h1>
      </div>
      <div className="card">
        <p className="text-muted">
          Запросы коммерческих предложений от оптовых покупателей с реквизитами компаний.
        </p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Запросов пока нет.</p>}
        {!loading && data.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Компания</th>
                <th>Контакт</th>
                <th>Требования</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((req) => (
                <tr key={req.id}>
                  <td>{formatLocal(req.createdAt)}</td>
                  <td>
                    <strong>{req.companyName}</strong>
                    {req.inn && <div className="text-muted">ИНН: {req.inn}</div>}
                  </td>
                  <td>
                    <div>{req.contactName}</div>
                    <div className="text-muted">{req.phone}</div>
                    {req.email && <div className="text-muted">{req.email}</div>}
                  </td>
                  <td className="cell-message">{req.requirements ?? "—"}</td>
                  <td>
                    {req.isProcessed ? (
                      <span className="badge badge-success">Обработан</span>
                    ) : (
                      <span className="badge badge-warning">Новый</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary" onClick={() => toggleProcessed(req)}>
                        {req.isProcessed ? "Вернуть в новые" : "Обработан"}
                      </button>
                      <button className="btn btn-danger" onClick={() => remove(req.id)}>Удалить</button>
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
