import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Product } from "../api";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить товар «${name}»?`)) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Товары</h1>
        <Link to="/products/new" className="btn btn-primary">
          + Добавить товар
        </Link>
      </div>

      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p>Товаров пока нет. Добавьте первый.</p>
        )}
        {!loading && products.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Кол-во</th>
                <th>Наличие</th>
                <th>Точка</th>
                <th>Хит</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt=""
                        className="product-thumb"
                      />
                    ) : (
                      <div className="product-thumb" />
                    )}
                  </td>
                  <td>
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </td>
                  <td>{product.price.toLocaleString("ru-RU")} ₽</td>
                  <td>{product.quantity}</td>
                  <td>
                    {product.inStock && product.quantity > 0 ? (
                      <span className="badge badge-success">В наличии</span>
                    ) : (
                      <span className="badge badge-danger">Нет в наличии</span>
                    )}
                  </td>
                  <td>{product.salePoint?.shortName ?? "—"}</td>
                  <td>
                    {product.isHit ? (
                      <span className="badge badge-hit">Хит</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-secondary"
                      >
                        Изменить
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(product.id, product.name)}
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
