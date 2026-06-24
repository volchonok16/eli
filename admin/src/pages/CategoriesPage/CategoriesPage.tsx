import { Link } from "react-router-dom";
import { useCategories } from "./hooks/useCategories";
import { CategoryTable } from "./ui/CategoryTable";

export function CategoriesPage() {
  const { data, loading, error, remove } = useCategories();

  function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить категорию «${name}»?`)) return;
    remove(id);
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Категории</h1>
        <Link to="/categories/new" className="btn btn-primary">
          + Добавить категорию
        </Link>
      </div>

      <div className="card">
        <p className="text-muted">
          Древовидные категории товаров. Перетащите, чтобы изменить порядок.
        </p>

        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p>Категорий пока нет.</p>
        )}
        {!loading && data.length > 0 && (
          <CategoryTable categories={data} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
