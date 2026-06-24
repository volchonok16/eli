import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReviews, toggleReviewPublish, deleteReview } from "@/api/endpoints/reviews";
import type { Review } from "@/api/types";

function Stars({ rating }: { rating: number }) {
  return <span className="stars" title={`${rating} из 5`}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

export function ReviewsPage() {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await getReviews()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }, []);

  const togglePublish = useCallback(async (review: Review) => {
    const updated = await toggleReviewPublish(review.id);
    setData((prev) => prev.map((r) => (r.id === review.id ? updated : r)));
  }, []);

  const remove = useCallback(async (id: string) => {
    if (!confirm("Удалить отзыв?")) return;
    await deleteReview(id);
    setData((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="page">
      <div className="header">
        <h1>Отзывы</h1>
        <Link to="/reviews/new" className="btn btn-primary">+ Добавить отзыв</Link>
      </div>
      <div className="card">
        <p className="text-muted">Отзывы создаются в админке и публикуются на сайте. Скрытые отзывы посетители не видят.</p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Отзывов пока нет.</p>}
        {!loading && data.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Автор</th>
                <th>Оценка</th>
                <th>Текст</th>
                <th>Дата</th>
                <th>Публикация</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((review) => (
                <tr key={review.id}>
                  <td>{review.authorName}</td>
                  <td><Stars rating={review.rating} /></td>
                  <td className="cell-message">{review.text}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString("ru-RU")}</td>
                  <td>
                    {review.isPublished ? (
                      <span className="badge badge-success">На сайте</span>
                    ) : <span className="badge badge-danger">Скрыт</span>}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary" onClick={() => togglePublish(review)}>
                        {review.isPublished ? "Скрыть" : "Показать"}
                      </button>
                      <Link to={`/reviews/${review.id}`} className="btn btn-secondary">Изменить</Link>
                      <button className="btn btn-danger" onClick={() => remove(review.id)}>Удалить</button>
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
