import { Link } from "react-router-dom";
import { useSalePoints } from "./hooks/useSalePoints";
import { SalePointTable } from "./ui/SalePointTable";

export function SalePointsPage() {
  const { data, loading, error, remove } = useSalePoints();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить точку «${name}»?`)) return;
    remove(id);
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Точки продаж</h1>
        <Link to="/sale-points/new" className="btn btn-primary">
          + Добавить точку
        </Link>
      </div>
      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Точек продаж пока нет.</p>}
        {!loading && data.length > 0 && (
          <SalePointTable points={data} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
