import { WholesaleTable } from "./ui/WholesaleTable";
import { useWholesalePrices } from "./hooks/useWholesalePrices";

export function WholesalePricesPage() {
  const { data, products, loading, error, add, update, remove } = useWholesalePrices();

  return (
    <div className="page">
      <div className="header">
        <h1>Оптовые цены</h1>
      </div>
      <div className="card">
        <p className="text-muted">
          Цены для оптовых покупателей. Один товар может иметь несколько цен для
          разных объёмов закупки. Оптовик в каталоге видит минимальную доступную цену.
        </p>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && (
          <WholesaleTable
            items={data}
            products={products}
            onAdd={add}
            onUpdate={update}
            onDelete={remove}
          />
        )}
      </div>
    </div>
  );
}
