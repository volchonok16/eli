import { Link } from "react-router-dom";
import type { Product } from "@/api/types";
import { formatRub } from "@/shared/utils/formatDate";

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string, name: string) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
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
            <td>{formatRub(product.price)}</td>
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
                <Link to={`/products/${product.id}`} className="btn btn-secondary">
                  Изменить
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete(product.id, product.name)}
                >
                  Удалить
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
