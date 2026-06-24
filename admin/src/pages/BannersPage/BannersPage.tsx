import { Link } from "react-router-dom";
import { useBanners } from "./hooks/useBanners";
import { BannerTable } from "./ui/BannerTable";

export function BannersPage() {
  const { data, loading, error, remove } = useBanners();

  function handleDelete(id: string, title: string) {
    if (!confirm(`Удалить баннер «${title}»?`)) return;
    remove(id);
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Баннеры</h1>
        <Link to="/banners/new" className="btn btn-primary">+ Добавить баннер</Link>
      </div>
      <div className="card">
        <p className="text-muted">
          Промо-баннеры на главной странице. Активные баннеры отображаются только
          в указанный период дат (если задан).
        </p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Баннеров пока нет.</p>}
        {!loading && data.length > 0 && <BannerTable banners={data} onDelete={handleDelete} />}
      </div>
    </div>
  );
}
