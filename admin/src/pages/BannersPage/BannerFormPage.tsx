import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getBanner,
  createBanner,
  updateBanner,
  uploadBannerImage,
  deleteBannerImage,
} from "@/api/endpoints/banners";
import sf from "../SharedForm.module.scss";

export function BannerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getBanner(id)
      .then((banner) => {
        setTitle(banner.title);
        setSubtitle(banner.subtitle ?? "");
        setLinkUrl(banner.linkUrl ?? "");
        setIsActive(banner.isActive);
        setStartDate(banner.startDate ? banner.startDate.slice(0, 10) : "");
        setEndDate(banner.endDate ? banner.endDate.slice(0, 10) : "");
        setImageUrl(banner.imageUrl);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setSaving(true);
      const data = {
        title,
        subtitle: subtitle || null,
        linkUrl: linkUrl || null,
        isActive,
        startDate: startDate ? `${startDate}T00:00:00Z` : null,
        endDate: endDate ? `${endDate}T23:59:59Z` : null,
      };
      try {
        if (isEdit && id) {
          await updateBanner(id, data);
          navigate("/banners");
        } else {
          await createBanner(data);
          navigate("/banners");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      } finally {
        setSaving(false);
      }
    },
    [title, subtitle, linkUrl, isActive, startDate, endDate, isEdit, id, navigate]
  );

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id || !e.target.files?.[0]) return;
    try {
      const updated = await uploadBannerImage(id, e.target.files[0]);
      setImageUrl(updated.imageUrl);
      e.target.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка загрузки");
    }
  }

  async function handleImageDelete() {
    if (!id || !confirm("Удалить изображение?")) return;
    try {
      await deleteBannerImage(id);
      setImageUrl(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  if (loading) return <div className="page"><p>Загрузка...</p></div>;

  return (
    <div className="page">
      <div className="header">
        <h1>{isEdit ? "Редактирование баннера" : "Новый баннер"}</h1>
        <Link to="/banners" className="btn btn-secondary">← Назад</Link>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Заголовок</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="subtitle">Подзаголовок</label>
            <input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="linkUrl">Ссылка при клике</label>
            <input id="linkUrl" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/catalog" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Начало показа</label>
              <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Конец показа</label>
              <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Активен
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>

        {isEdit && id && (
          <div className={sf.imageSection}>
            <h3 className={sf.imageSectionTitle}>Изображение баннера</h3>
            {imageUrl && (
              <div className="image-item" style={{ marginBottom: 12 }}>
                <img src={imageUrl} alt="" className={sf.bannerImage} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {imageUrl && (
              <button type="button" className="btn btn-danger" style={{ marginTop: 12 }} onClick={handleImageDelete}>
                Удалить изображение
              </button>
            )}
          </div>
        )}
        {!isEdit && (
          <p className={sf.formHint}>
            После создания можно загрузить изображение баннера.
          </p>
        )}
      </div>
    </div>
  );
}
