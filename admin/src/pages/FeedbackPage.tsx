import { useEffect, useState } from "react";
import { api, type Feedback } from "../api";

function formatDate(date: string) {
  return new Date(date).toLocaleString("ru-RU");
}

export function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getFeedback()
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, []);

  async function toggleRead(item: Feedback) {
    try {
      const updated = await api.markFeedbackRead(item.id, !item.isRead);
      setItems((prev) =>
        prev.map((f) => (f.id === item.id ? updated : f))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить обращение?")) return;
    try {
      await api.deleteFeedback(id);
      setItems((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  const unreadCount = items.filter((f) => !f.isRead).length;

  return (
    <div className="page">
      <div className="header">
        <h1>
          Обратная связь
          {unreadCount > 0 && (
            <span className="badge badge-warning" style={{ marginLeft: 12 }}>
              {unreadCount} новых
            </span>
          )}
        </h1>
      </div>

      <div className="card">
        <p className="text-muted">
          Сообщения с сайта от посетителей. Отмечайте прочитанными после
          обработки.
        </p>

        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p>Обращений пока нет.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="message-list">
            {items.map((item) => (
              <div
                key={item.id}
                className={`message-card${item.isRead ? "" : " unread"}`}
              >
                <div className="message-header">
                  <div>
                    <strong>{item.name}</strong>
                    <span className="text-muted"> · {item.contact}</span>
                  </div>
                  <span className="text-muted">{formatDate(item.createdAt)}</span>
                </div>
                <p className="message-body">{item.message}</p>
                <div className="actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => toggleRead(item)}
                  >
                    {item.isRead ? "Пометить непрочитанным" : "Прочитано"}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
