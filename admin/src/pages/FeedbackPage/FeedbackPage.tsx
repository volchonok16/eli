import { useCallback, useEffect, useState } from "react";
import { getFeedback, markFeedbackRead, deleteFeedback } from "@/api/endpoints/feedback";
import type { Feedback } from "@/api/types";
import { formatLocal } from "@/shared/utils/formatDate";

export function FeedbackPage() {
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getFeedback()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const toggleRead = useCallback(async (item: Feedback) => {
    const updated = await markFeedbackRead(item.id, !item.isRead);
    setData((prev) => prev.map((f) => (f.id === item.id ? updated : f)));
  }, []);

  const remove = useCallback(async (id: string) => {
    if (!confirm("Удалить обращение?")) return;
    await deleteFeedback(id);
    setData((prev) => prev.filter((f) => f.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const unreadCount = data.filter((f) => !f.isRead).length;

  return (
    <div className="page">
      <div className="header">
        <h1>Обратная связь
          {unreadCount > 0 && <span className="badge badge-warning" style={{ marginLeft: 12 }}>{unreadCount} новых</span>}
        </h1>
      </div>
      <div className="card">
        <p className="text-muted">Сообщения с сайта от посетителей. Отмечайте прочитанными после обработки.</p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Обращений пока нет.</p>}
        {!loading && data.length > 0 && (
          <div className="message-list">
            {data.map((item) => (
              <div key={item.id} className={`message-card${item.isRead ? "" : " unread"}`}>
                <div className="message-header">
                  <div>
                    <strong>{item.name}</strong>
                    <span className="text-muted"> · {item.contact}</span>
                  </div>
                  <span className="text-muted">{formatLocal(item.createdAt)}</span>
                </div>
                <p className="message-body">{item.message}</p>
                <div className="actions">
                  <button className="btn btn-secondary" onClick={() => toggleRead(item)}>
                    {item.isRead ? "Пометить непрочитанным" : "Прочитано"}
                  </button>
                  <button className="btn btn-danger" onClick={() => remove(item.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
