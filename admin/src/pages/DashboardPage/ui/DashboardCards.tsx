import { formatRub } from "@/shared/utils/formatDate";
import s from "../DashboardPage.module.scss";

interface StatCardProps {
  value: string;
  label: string;
  large?: boolean;
}

export function StatCard({ value, label, large }: StatCardProps) {
  return (
    <div className={`stat-card${large ? ` ${s.statCardLarge}` : ""}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
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
}

export function RevenueCards({ today, week, month }: RevenueCardsProps) {
  return (
    <div className="stats-grid">
      <StatCard value={formatRub(today)} label="Выручка сегодня" large />
      <StatCard value={formatRub(week)} label="Выручка за неделю" />
      <StatCard value={formatRub(month)} label="Выручка за месяц" />
    </div>
  );
}

interface OrderStatusCardsProps {
  orders: Record<string, number>;
}

export function OrderStatusCards({ orders }: OrderStatusCardsProps) {
  return (
    <div className="stats-grid">
      <StatCard value={String(orders.new)} label="Новые (ожидают оплаты)" />
      <StatCard value={String(orders.paid)} label="Оплачены" />
      <StatCard value={String(orders.processing)} label="В обработке" />
      <StatCard value={String(orders.assembled)} label="Собраны" />
      <StatCard value={String(orders.delivering)} label="Доставляются" />
    </div>
  );
}
