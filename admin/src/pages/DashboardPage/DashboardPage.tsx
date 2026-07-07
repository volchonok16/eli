import { useDashboard } from "./hooks/useDashboard";
import { RevenueCards, OrderStatusCards, TableCard } from "./ui/DashboardCards";
import { SkeletonCard, EmptyState } from "@/shared/components";
import { formatRub } from "@/shared/utils/formatDate";
import s from "./DashboardPage.module.scss";

export function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (error) {
    return <div className="page"><p className="error">{error}</p></div>;
  }

  return (
    <div className="page">
      <div className="header">
        <h1>Дашборд</h1>
      </div>

      {loading ? (
        <>
          <RevenueCards today={0} week={0} month={0} loading />
          <div className="card" style={{ marginBottom: 24 }}><SkeletonCard /></div>
        </>
      ) : data ? (
        <>
          <RevenueCards today={data.revenue.today} week={data.revenue.week} month={data.revenue.month} />

          <div className={`card ${s.dashboardSection}`}>
            <h2 className={s.tableCardTitle}>Заказы по статусам</h2>
            <OrderStatusCards orders={data.orders} />
          </div>

          <div className="table-row">
            <TableCard title="Топ товаров">
              {data.topProducts.length === 0 ? (
                <EmptyState icon="box" title="Пока нет продаж" description="Статистика появится после первых заказов" />
              ) : (
                <table className="table">
                  <thead>
                    <tr><th>Товар</th><th>Продано</th><th>Выручка</th></tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p, i) => (
                      <tr key={i}>
                        <td>{p.name}</td>
                        <td>{p.sold} шт.</td>
                        <td>{formatRub(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableCard>

            <TableCard title="Остатки по точкам">
              {data.stockByPoint.length === 0 ? (
                <EmptyState icon="map" title="Нет данных по точкам" description="Привяжите товары к точкам продаж" />
              ) : (
                <table className="table">
                  <thead>
                    <tr><th>Точка</th><th>Товаров</th><th>На сумму</th></tr>
                  </thead>
                  <tbody>
                    {data.stockByPoint.map((sp) => (
                      <tr key={sp.salePointId}>
                        <td>{sp.shortName}</td>
                        <td>{sp.totalItems} шт.</td>
                        <td>{formatRub(sp.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
