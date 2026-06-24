import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Review } from "../api";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ru-RU");
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" title={`${rating} из 5`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getReviews()
      .then(setReviews)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, []);

  async function togglePublish(review: Review) {
    try {
      const updated = await api.toggleReviewPublish(review.id);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? updated : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить отзыв?")) return;
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Отзывы</h1>
        <Link to="/reviews/new" className="btn btn-primary">
          + Добавить отзыв
        </Link>
      </div>

      <div className="card">
        <p className="text-muted">
          Отзывы создаются в админке и публикуются на сайте. Скрытые отзывы
          посетители не видят.
        </p>

        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p>Отзывов пока нет.</p>
        )}

        {!loading && reviews.length > 0 && (
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
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.authorName}</td>
                  <td>
                    <Stars rating={review.rating} />
                  </td>
                  <td className="cell-message">{review.text}</td>
                  <td>{formatDate(review.createdAt)}</td>
                  <td>
                    {review.isPublished ? (
                      <span className="badge badge-success">На сайте</span>
                    ) : (
                      <span className="badge badge-danger">Скрыт</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => togglePublish(review)}
                      >
                        {review.isPublished ? "Скрыть" : "Показать"}
                      </button>
                      <Link
                        to={`/reviews/${review.id}`}
                        className="btn btn-secondary"
                      >
                        Изменить
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(review.id)}
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
