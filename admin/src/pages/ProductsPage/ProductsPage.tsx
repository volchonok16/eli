import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts, useProductImport } from "./hooks/useProducts";
import { ProductTable } from "./ui/ProductTable";
import { SkeletonTable, EmptyState, ConfirmModal, useToast } from "@/shared/components";
import s from "./ProductsPage.module.scss";

export function ProductsPage() {
  const { data, loading, error, remove, refetch } = useProducts();
  const { importing, importResult, doImport } = useProductImport(refetch);
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleDelete(id: string, name: string) {
    setDeleteTarget({ id, name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      toast(`Товар «${deleteTarget.name}» удалён`, "success");
    } catch {
      toast("Не удалось удалить товар", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Товары</h1>
        <div className="actions">
          <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
            {importing ? "Импорт..." : "📥 Импорт Excel"}
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) doImport(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </label>
          <Link to="/products/new" className="btn btn-primary">+ Добавить товар</Link>
        </div>
      </div>

      {importResult && (
        <div className={`card ${s.importResult}`}>
          <strong>Импорт завершён:</strong> добавлено {importResult.imported} товаров.
          {importResult.errors.length > 0 && (
            <span style={{ color: "#dc2626" }}> Ошибки: {importResult.errors.join(", ")}</span>
          )}
        </div>
      )}

      <div className="card">
        {loading && <SkeletonTable rows={6} cols={5} />}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && (
          <EmptyState icon="box" title="Товаров пока нет" description="Добавьте первый товар или сделайте импорт из Excel" />
        )}
        {!loading && data.length > 0 && (
          <ProductTable products={data} onDelete={handleDelete} />
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Удаление товара"
        message={`Вы уверены, что хотите удалить «${deleteTarget?.name}»? Это действие нельзя отменить.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Удалить"
        variant="danger"
      />
    </div>
  );
}
