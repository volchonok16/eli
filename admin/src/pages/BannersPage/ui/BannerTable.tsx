import { Link } from "react-router-dom";
import type { PromoBanner } from "@/api/types";

interface BannerTableProps {
  banners: PromoBanner[];
  onDelete: (id: string, title: string) => void;
}

export function BannerTable({ banners, onDelete }: BannerTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Фото</th>
          <th>Заголовок</th>
          <th>Ссылка</th>
          <th>Активен</th>
          <th>Период</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {banners.map((banner) => (
          <tr key={banner.id}>
            <td>
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt="" className="product-thumb" />
              ) : (
                <div className="product-thumb" />
              )}
            </td>
            <td>
              <Link to={`/banners/${banner.id}`}>{banner.title}</Link>
              {banner.subtitle && <div className="text-muted">{banner.subtitle}</div>}
            </td>
            <td>{banner.linkUrl ?? "—"}</td>
            <td>
              {banner.isActive ? (
                <span className="badge badge-success">Да</span>
              ) : (
                <span className="badge badge-danger">Нет</span>
              )}
            </td>
            <td className="text-muted">
              {banner.startDate && <div>с {new Date(banner.startDate).toLocaleDateString("ru-RU")}</div>}
              {banner.endDate && <div>по {new Date(banner.endDate).toLocaleDateString("ru-RU")}</div>}
            </td>
            <td>
              <div className="actions">
                <Link to={`/banners/${banner.id}`} className="btn btn-secondary">Изменить</Link>
                <button className="btn btn-danger" onClick={() => onDelete(banner.id, banner.title)}>Удалить</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
