import { useOrders } from "./hooks/useOrders";
import { OrderTable } from "./ui/OrderTable";
import { formatRub } from "@/shared/utils/formatDate";

export function OrdersPage() {
  const { data, loading, error, changeStatus, cancel, STATUS_LABELS, STATUS_FLOW } = useOrders();

  const totalPaid = data
    .filter((o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "ASSEMBLED" || o.status === "DELIVERING" || o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="page">
      <div className="header">
        <h1>Заказы</h1>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{data.length}</div>
          <div className="stat-label">Всего заказов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {data.filter((o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "ASSEMBLED" || o.status === "DELIVERING" || o.status === "COMPLETED").length}
          </div>
          <div className="stat-label">Успешных</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatRub(totalPaid)}</div>
          <div className="stat-label">Сумма успешных</div>
        </div>
      </div>

      <div className="card">
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && data.length === 0 && <p>Заказов пока нет.</p>}
        {!loading && data.length > 0 && (
          <OrderTable
            orders={data}
            labels={STATUS_LABELS}
            flow={STATUS_FLOW}
            onChangeStatus={changeStatus}
            onCancel={cancel}
          />
        )}
      </div>
    </div>
  );
}
