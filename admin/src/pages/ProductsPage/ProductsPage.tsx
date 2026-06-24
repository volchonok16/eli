import { Link } from "react-router-dom";
import { useProducts, useProductImport } from "./hooks/useProducts";
import { ProductTable } from "./ui/ProductTable";
import s from "./ProductsPage.module.scss";

export function ProductsPage() {
  const { data, loading, error, remove, refetch } = useProducts();
  const { importing, importResult, doImport } = useProductImport(refetch);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить товар «${name}»?`)) return;
    remove(id);
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
          <Link to="/products/new" className="btn btn-primary">
            + Добавить товар
          </Link>
        </div>
      </div>

      {importResult && (
        <div className={`card ${s.importResult}`}>
          <strong>Импорт завершён:</strong> добавлено {importResult.imported} товаров.
          {importResult.errors.length > 0 && (
            <span style={{ color: "#dc2626" }}>
              {" "}Ошибки: {importResult.errors.join(", ")}
            </span>
          )}
        </div>
      )}

      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p>Товаров пока нет. Добавьте первый.</p>
        )}
        {!loading && data.length > 0 && (
          <ProductTable products={data} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
