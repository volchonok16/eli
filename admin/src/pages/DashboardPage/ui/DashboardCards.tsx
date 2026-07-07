import { formatRub } from "@/shared/utils/formatDate";
import s from "../DashboardPage.module.scss";

interface StatCardProps {
  value: string;
  label: string;
  icon: string;
  large?: boolean;
}

export function StatCard({ value, label, icon, large }: StatCardProps) {
  return (
    <div className={`stat-card${large ? ` ${s.statCardLarge}` : ""}`}>
      <div className={s.statCardIcon}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

interface TableCardProps {
  title: string;
  children: React.ReactNode;
}

export function TableCard({ title, children }: TableCardProps) {
  return (
    <div className={`card ${s.tableCard}`}>
      <h2 className={s.tableCardTitle}>{title}</h2>
      {children}
    </div>
  );
}

interface RevenueCardsProps {
  today: number;
  week: number;
  month: number;
  loading?: boolean;
}

export function RevenueCards({ today, week, month, loading }: RevenueCardsProps) {
  if (loading) {
    return (
      <div className="stats-grid">
        <StatCardSkeleton large />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }
  return (
    <div className="stats-grid">
      <StatCard value={formatRub(today)} label="Выручка сегодня" icon="💰" large />
      <StatCard value={formatRub(week)} label="За 7 дней" icon="📊" />
      <StatCard value={formatRub(month)} label="За 30 дней" icon="📈" />
    </div>
  );
}

interface OrderStatusCardsProps {
  orders: Record<string, number>;
}

const statusIcons: Record<string, string> = {
  new: "🆕",
  paid: "✅",
  processing: "⚙️",
  assembled: "📦",
  delivering: "🚚",
  completed: "🎉",
  cancelled: "❌",
  failed: "⚠️",
};

const statusLabels: Record<string, string> = {
  new: "Новые",
  paid: "Оплачены",
  processing: "В обработке",
  assembled: "Собраны",
  delivering: "Доставляются",
  completed: "Завершены",
  cancelled: "Отменены",
  failed: "Провалены",
};

export function OrderStatusCards({ orders }: OrderStatusCardsProps) {
  const entries = Object.entries(orders).filter(([k]) => k !== "failed" && k !== "cancelled");
  return (
    <div className="stats-grid">
      {entries.map(([key, count]) => (
        <StatCard
          key={key}
          value={String(count)}
          label={statusLabels[key] ?? key}
          icon={statusIcons[key] ?? "📋"}
        />
      ))}
    </div>
  );
}

function StatCardSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div className={`stat-card${large ? ` ${s.statCardLarge}` : ""}`}>
      <div className={s.statCardIcon} style={{ width: 40, height: 32, background: "var(--color-surface-muted, #E7E5E4)", borderRadius: 4 }} />
      <div>
        <div className="skeleton-line" style={{ width: 80, height: 28, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: 100, height: 14 }} />
      </div>
    </div>
  );
}
