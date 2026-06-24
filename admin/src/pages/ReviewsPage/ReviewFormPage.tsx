import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getReview, createReview, updateReview } from "@/api/endpoints/reviews";

export function ReviewFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState("5");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getReview(id)
      .then((review) => {
        setAuthorName(review.authorName);
        setText(review.text);
        setRating(String(review.rating));
        setIsPublished(review.isPublished);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const data = { authorName, text, rating: parseInt(rating, 10), isPublished };
    try {
      if (isEdit && id) { await updateReview(id, data); }
      else { await createReview(data); }
      navigate("/reviews");
    } catch (err) { setError(err instanceof Error ? err.message : "Ошибка сохранения"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="page"><p>Загрузка...</p></div>;

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование отзыва" : "Новый отзыв"}</h1>
        <Link to="/reviews" className="btn btn-secondary">← Назад</Link>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="author">Имя автора</label>
            <input id="author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="rating">Оценка (1–5)</label>
            <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} {"★".repeat(n)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="text">Текст отзыва</label>
            <textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={6} required />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Показывать на сайте
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}
