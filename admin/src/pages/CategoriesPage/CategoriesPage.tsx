import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "./hooks/useCategories";
import { CategoryTable } from "./ui/CategoryTable";
import { Skeleton, EmptyState, ConfirmModal, useToast } from "@/shared/components";

export function CategoriesPage() {
  const { data, loading, error, remove } = useCategories();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      toast(`Категория «${deleteTarget.name}» удалена`, "success");
    } catch {
      toast("Не удалось удалить категорию", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Категории</h1>
        <Link to="/categories/new" className="btn btn-primary">+ Добавить категорию</Link>
      </div>

      <div className="card">
        <p className="text-muted">Древовидные категории товаров.</p>

        {loading && <Skeleton lines={5} />}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && (
          <EmptyState icon="list" title="Категорий пока нет" description="Создайте первую категорию для организации товаров" />
        )}
        {!loading && data.length > 0 && (
          <CategoryTable categories={data} onDelete={(id, name) => setDeleteTarget({ id, name })} />
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Удаление категории"
        message={`Вы уверены, что хотите удалить «${deleteTarget?.name}»? Подкатегории также будут удалены.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Удалить"
        variant="danger"
      />
    </div>
  );
}
